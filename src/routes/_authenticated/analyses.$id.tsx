import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { movementLabel } from "@/lib/movement";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/analyses/$id")({
  component: AnalysisDetail,
});

type Analysis = {
  id: string;
  user_id: string;
  video_path: string;
  movement_type: string;
  notes: string | null;
  ai_feedback: {
    what_we_found: string;
    compensation_pattern: string;
    refinement_practice: string;
  } | null;
  awareness_score: number | null;
  coach_note: string | null;
  status: string;
  created_at: string;
};

function AnalysisDetail() {
  const { id } = Route.useParams();
  const router = useRouter();
  const [a, setA] = useState<Analysis | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isCoach, setIsCoach] = useState(false);
  const [coachDraft, setCoachDraft] = useState("");

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
      setIsCoach(!!roles?.some((r) => r.role === "coach"));

      const { data } = await supabase.from("analyses").select("*").eq("id", id).maybeSingle();
      if (!data) {
        toast.error("Reading not found.");
        router.navigate({ to: "/dashboard" });
        return;
      }
      setA(data as Analysis);
      setCoachDraft((data as Analysis).coach_note ?? "");
      const { data: signed } = await supabase.storage
        .from("movement-videos")
        .createSignedUrl((data as Analysis).video_path, 3600);
      setVideoUrl(signed?.signedUrl ?? null);
    })();
  }, [id, router]);

  const requestReview = async () => {
    if (!a) return;
    const { error } = await supabase.from("analyses").update({ status: "pending_review" }).eq("id", a.id);
    if (error) return toast.error(error.message);
    setA({ ...a, status: "pending_review" });
    toast.success("A coach will review your practice.");
  };

  const submitCoachNote = async () => {
    if (!a) return;
    const { error } = await supabase
      .from("analyses")
      .update({ coach_note: coachDraft, status: "reviewed" })
      .eq("id", a.id);
    if (error) return toast.error(error.message);
    setA({ ...a, coach_note: coachDraft, status: "reviewed" });
    toast.success("Marked as reviewed.");
  };

  if (!a) {
    return <main className="flex-1 max-w-5xl mx-auto px-8 py-16 text-muted-foreground">Opening the reading…</main>;
  }

  const score = a.awareness_score ?? 0;
  const ring = 2 * Math.PI * 56;
  const offset = ring - (score / 100) * ring;

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-8 py-12 animate-fade-rise">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.25em] text-forest">
            {new Date(a.created_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
          </p>
          <h1 className="font-serif text-4xl">{movementLabel(a.movement_type)}</h1>
          <div className="aspect-video bg-ink rounded overflow-hidden">
            {videoUrl ? (
              <video src={videoUrl} controls className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-cream/40 text-sm">Loading video…</div>
            )}
          </div>
          {a.notes && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Your awareness</p>
              <p className="text-foreground italic">"{a.notes}"</p>
            </div>
          )}
        </div>

        <aside className="space-y-8">
          <div className="flex items-center gap-6">
            <svg viewBox="0 0 128 128" className="w-32 h-32 -rotate-90">
              <circle cx="64" cy="64" r="56" fill="none" stroke="oklch(0.42 0.065 152 / 0.12)" strokeWidth="8" />
              <circle
                cx="64" cy="64" r="56" fill="none"
                stroke="oklch(0.42 0.065 152)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={ring} strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
              />
            </svg>
            <div>
              <div className="font-serif text-5xl text-forest leading-none">{score}</div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mt-2">Awareness score</p>
            </div>
          </div>

          {a.ai_feedback && (
            <div className="space-y-6">
              <Section label="What we found" body={a.ai_feedback.what_we_found} />
              <Section label="Compensation pattern" body={a.ai_feedback.compensation_pattern} />
              <Section label="Refinement practice" body={a.ai_feedback.refinement_practice} />
            </div>
          )}

          {a.coach_note && (
            <div className="border-t border-border pt-6">
              <p className="text-xs uppercase tracking-[0.2em] text-ochre mb-2">From your coach</p>
              <p className="text-foreground leading-relaxed">{a.coach_note}</p>
            </div>
          )}

          {isCoach ? (
            <div className="border-t border-border pt-6 space-y-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Coach note</p>
              <textarea
                value={coachDraft}
                onChange={(e) => setCoachDraft(e.target.value)}
                rows={4}
                placeholder="Offer one refinement…"
                className="w-full bg-transparent border border-border rounded p-3 text-foreground outline-none focus:border-forest resize-none"
              />
              <button
                onClick={submitCoachNote}
                className="w-full py-3 bg-forest text-primary-foreground rounded hover:bg-forest/90"
              >
                Mark as reviewed
              </button>
            </div>
          ) : (
            <button
              onClick={requestReview}
              disabled={a.status === "pending_review" || a.status === "reviewed"}
              className="w-full py-3 border border-forest text-forest rounded hover:bg-forest/5 disabled:opacity-50"
            >
              {a.status === "reviewed" ? "Coach review complete"
                : a.status === "pending_review" ? "Awaiting coach review"
                : "Request coach review"}
            </button>
          )}
        </aside>
      </div>
    </main>
  );
}

function Section({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-forest mb-2">{label}</p>
      <p className="text-foreground leading-relaxed">{body}</p>
    </div>
  );
}
