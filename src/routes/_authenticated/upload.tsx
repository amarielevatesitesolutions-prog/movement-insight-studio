import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { analyzeMovement } from "@/lib/analysis.functions";
import { MOVEMENT_TYPES, type MovementType } from "@/lib/movement";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/upload")({
  component: UploadFlow,
});

function UploadFlow() {
  const router = useRouter();
  const analyze = useServerFn(analyzeMovement);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<File | null>(null);
  const [movement, setMovement] = useState<MovementType | null>(null);
  const [notes, setNotes] = useState("");

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/\.(mp4|mov)$/i.test(f.name)) {
      toast.error("Please submit an MP4 or MOV file.");
      return;
    }
    setFile(f);
    setStep(2);
  };

  const submit = async () => {
    if (!file || !movement) return;
    setStep(4);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Session expired.");

      const path = `${u.user.id}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("movement-videos").upload(path, file, {
        contentType: file.type || "video/mp4",
      });
      if (upErr) throw upErr;

      const feedback = await analyze({ data: { movement_type: movement, notes: notes || null, video_path: path } });

      const { data: inserted, error: insErr } = await supabase
        .from("analyses")
        .insert({
          user_id: u.user.id,
          video_path: path,
          movement_type: movement,
          notes: notes || null,
          ai_feedback: {
            what_we_found: feedback.what_we_found,
            compensation_pattern: feedback.compensation_pattern,
            refinement_practice: feedback.refinement_practice,
          },
          awareness_score: feedback.awareness_score,
        })
        .select("id")
        .single();
      if (insErr) throw insErr;

      // Update streak (calendar-day simple)
      const today = new Date().toISOString().slice(0, 10);
      const { data: existing } = await supabase
        .from("streaks").select("current_streak, last_practice_date")
        .eq("user_id", u.user.id).maybeSingle();
      const last = existing?.last_practice_date;
      let next = 1;
      if (last) {
        const diff = (new Date(today).getTime() - new Date(last).getTime()) / 86400000;
        next = diff === 0 ? (existing?.current_streak ?? 1) : diff === 1 ? (existing?.current_streak ?? 0) + 1 : 1;
      }
      await supabase.from("streaks").upsert({ user_id: u.user.id, current_streak: next, last_practice_date: today });

      router.navigate({ to: "/analyses/$id", params: { id: inserted.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
      setStep(3);
    }
  };

  return (
    <main className="flex-1 max-w-2xl w-full mx-auto px-8 py-16 animate-fade-rise">
      {step === 1 && (
        <div className="space-y-8 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-forest">Step one</p>
          <h1 className="font-serif text-4xl">Bring your movement.</h1>
          <p className="text-muted-foreground">A single MP4 or MOV file. One clean attempt is enough.</p>
          <label className="block border-2 border-dashed border-forest/40 rounded-lg p-16 cursor-pointer hover:bg-forest/5">
            <input type="file" accept="video/mp4,video/quicktime,.mp4,.mov" className="hidden" onChange={onFile} />
            <p className="font-serif text-2xl text-forest">Choose a video</p>
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8">
          <p className="text-xs uppercase tracking-[0.25em] text-forest">Step two</p>
          <h1 className="font-serif text-4xl">What pattern is this?</h1>
          <div className="grid grid-cols-2 gap-3">
            {MOVEMENT_TYPES.map((m) => (
              <button
                key={m.value}
                onClick={() => { setMovement(m.value); setStep(3); }}
                className="py-5 border border-border rounded text-foreground hover:border-forest hover:bg-forest/5 font-serif text-lg"
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8">
          <p className="text-xs uppercase tracking-[0.25em] text-forest">Step three</p>
          <h1 className="font-serif text-4xl">Any awareness to share?</h1>
          <p className="text-muted-foreground">Optional. A sensation, a question, a place of tension.</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="I notice tension in my left hip during this…"
            rows={5}
            className="w-full bg-transparent border border-border rounded p-4 text-foreground outline-none focus:border-forest resize-none"
          />
          <button
            onClick={submit}
            className="w-full py-4 bg-forest text-primary-foreground rounded font-medium hover:bg-forest/90"
          >
            Submit for reading
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-12 text-center py-16">
          <div className="mx-auto w-32 h-32 rounded-full bg-forest/15 animate-breathe" />
          <div className="space-y-3">
            <p className="font-serif text-3xl">Reading your movement pattern…</p>
            <p className="text-muted-foreground text-sm">A quiet moment. The structure is revealing itself.</p>
          </div>
        </div>
      )}
    </main>
  );
}
