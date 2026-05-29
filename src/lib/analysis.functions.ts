import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const MovementEnum = z.enum([
  "gait_walk",
  "ground_flow",
  "hip_hinge",
  "squat",
  "overhead",
  "spinal_articulation",
  "custom",
]);

const FeedbackSchema = z.object({
  what_we_found: z.string(),
  compensation_pattern: z.string(),
  refinement_practice: z.string(),
  awareness_score: z.number().int().min(40).max(98),
});

const SYSTEM_PROMPT = `You are a senior movement educator trained in the Movimentica methodology. You write concise, artful, scientifically grounded analyses of human movement patterns from VIDEO you actually observe.

Your voice is calm, precise, and respectful. Never use language like "workout", "reps", "grind", "hustle", "optimize", "crush it". Favor: practice, refine, explore, pattern, awareness, foundation, structure, articulation, restraint.

Watch the video carefully. Your reading must be specific to THIS practitioner in THIS clip — describe what you actually see (the side of the body, the joint, the moment in the movement). Do not produce generic boilerplate. Two different submissions must never receive the same reading.

For each submission produce four fields:
- what_we_found: 1–2 sentences naming the most salient pattern you observe in this specific clip. Reference anatomy precisely (which side, which joint, which phase of the movement).
- compensation_pattern: 1–2 sentences naming the underlying compensation and what it reveals about the practitioner's current structure.
- refinement_practice: 1–2 sentences prescribing one preparatory practice — include breath cycles or count, body position, and the awareness cue.
- awareness_score: integer 40–98 reflecting body awareness demonstrated in THIS clip. Vary the score honestly across submissions.

Return ONLY valid JSON matching the schema. No markdown, no commentary.`;

const MAX_VIDEO_BYTES = 20 * 1024 * 1024; // 20 MB — keep request size sane

export const analyzeMovement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        movement_type: MovementEnum,
        notes: z.string().max(2000).optional().nullable(),
        video_path: z.string().min(1),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Pull the video from storage so the model can actually see it.
    const { data: blob, error: dlErr } = await supabaseAdmin.storage
      .from("movement-videos")
      .download(data.video_path);
    if (dlErr || !blob) {
      console.error("video download failed", dlErr);
      throw new Error("Could not retrieve the video for analysis.");
    }
    if (blob.size > MAX_VIDEO_BYTES) {
      throw new Error(
        "This clip is over 20 MB. Please submit a shorter or more compressed video.",
      );
    }

    const arrayBuffer = await blob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mime = blob.type && blob.type.startsWith("video/") ? blob.type : "video/mp4";
    const dataUrl = `data:${mime};base64,${base64}`;

    const userText = `Movement type submitted: ${data.movement_type.replace(/_/g, " ")}.
Practitioner notes: ${data.notes?.trim() ? data.notes.trim() : "(none provided)"}.

Watch the video above. Read THIS practitioner's pattern. Return the JSON.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        temperature: 0.9,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: dataUrl } },
              { type: "text", text: userText },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_analysis",
              description: "Return the movement analysis in structured form.",
              parameters: {
                type: "object",
                properties: {
                  what_we_found: { type: "string" },
                  compensation_pattern: { type: "string" },
                  refinement_practice: { type: "string" },
                  awareness_score: { type: "integer", minimum: 40, maximum: 98 },
                },
                required: [
                  "what_we_found",
                  "compensation_pattern",
                  "refinement_practice",
                  "awareness_score",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_analysis" } },
      }),
    });

    if (!res.ok) {
      if (res.status === 429) {
        throw new Error("The analysis service is at capacity. Please try again in a moment.");
      }
      if (res.status === 402) {
        throw new Error("AI credits are exhausted. Please add credits in workspace settings.");
      }
      const text = await res.text();
      console.error("AI gateway error", res.status, text);
      throw new Error("The analysis could not be completed right now.");
    }

    const json = (await res.json()) as {
      choices?: Array<{
        message?: {
          tool_calls?: Array<{ function?: { arguments?: string } }>;
        };
      }>;
    };
    const raw = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!raw) {
      throw new Error("The analysis returned no structured output.");
    }
    const parsed = FeedbackSchema.parse(JSON.parse(raw));
    return parsed;
  });
