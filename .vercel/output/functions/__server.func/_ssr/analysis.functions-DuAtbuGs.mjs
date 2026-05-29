import { T as TSS_SERVER_FUNCTION, a as createServerFn } from "./server-Cxxpm2kw.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-DNhxb8Ui.mjs";
import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { e as enumType, o as objectType, n as numberType, s as stringType } from "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
function createSupabaseAdminClient() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    const missing = [
      ...!SUPABASE_URL ? ["SUPABASE_URL"] : [],
      ...!SUPABASE_SERVICE_ROLE_KEY ? ["SUPABASE_SERVICE_ROLE_KEY"] : []
    ];
    const message = `Missing Supabase environment variable(s): ${missing.join(", ")}. Connect Supabase in Lovable Cloud.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      storage: void 0,
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
let _supabaseAdmin;
const supabaseAdmin = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
    return Reflect.get(_supabaseAdmin, prop, receiver);
  }
});
const MovementEnum = enumType(["gait_walk", "ground_flow", "hip_hinge", "squat", "overhead", "spinal_articulation", "custom"]);
const FeedbackSchema = objectType({
  what_we_found: stringType(),
  compensation_pattern: stringType(),
  refinement_practice: stringType(),
  awareness_score: numberType().int().min(40).max(98)
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
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
const analyzeMovement_createServerFn_handler = createServerRpc({
  id: "c26f4276f2cf83df23663f2a76b4205ee1255d84354c2e4025363300aa382e41",
  name: "analyzeMovement",
  filename: "src/lib/analysis.functions.ts"
}, (opts) => analyzeMovement.__executeServer(opts));
const analyzeMovement = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  movement_type: MovementEnum,
  notes: stringType().max(2e3).optional().nullable(),
  video_path: stringType().min(1)
}).parse(input)).handler(analyzeMovement_createServerFn_handler, async ({
  data
}) => {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }
  const {
    data: blob,
    error: dlErr
  } = await supabaseAdmin.storage.from("movement-videos").download(data.video_path);
  if (dlErr || !blob) {
    console.error("video download failed", dlErr);
    throw new Error("Could not retrieve the video for analysis.");
  }
  if (blob.size > MAX_VIDEO_BYTES) {
    throw new Error("This clip is over 20 MB. Please submit a shorter or more compressed video.");
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
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      temperature: 0.9,
      messages: [{
        role: "system",
        content: SYSTEM_PROMPT
      }, {
        role: "user",
        content: [{
          type: "image_url",
          image_url: {
            url: dataUrl
          }
        }, {
          type: "text",
          text: userText
        }]
      }],
      tools: [{
        type: "function",
        function: {
          name: "return_analysis",
          description: "Return the movement analysis in structured form.",
          parameters: {
            type: "object",
            properties: {
              what_we_found: {
                type: "string"
              },
              compensation_pattern: {
                type: "string"
              },
              refinement_practice: {
                type: "string"
              },
              awareness_score: {
                type: "integer",
                minimum: 40,
                maximum: 98
              }
            },
            required: ["what_we_found", "compensation_pattern", "refinement_practice", "awareness_score"],
            additionalProperties: false
          }
        }
      }],
      tool_choice: {
        type: "function",
        function: {
          name: "return_analysis"
        }
      }
    })
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
  const json = await res.json();
  const raw = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!raw) {
    throw new Error("The analysis returned no structured output.");
  }
  const parsed = FeedbackSchema.parse(JSON.parse(raw));
  return parsed;
});
export {
  analyzeMovement_createServerFn_handler
};
