import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { warmGreeting, movementLabel } from "@/lib/movement";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type Row = {
  id: string;
  movement_type: string;
  awareness_score: number | null;
  created_at: string;
  ai_feedback: { what_we_found?: string } | null;
};

function Dashboard() {
  const [name, setName] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const [{ data: profile }, { data: analyses }, { data: s }] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("id", u.user.id).maybeSingle(),
        supabase
          .from("analyses")
          .select("id, movement_type, awareness_score, created_at, ai_feedback")
          .order("created_at", { ascending: false }),
        supabase.from("streaks").select("current_streak").eq("user_id", u.user.id).maybeSingle(),
      ]);
      setName(profile?.display_name ?? null);
      setRows((analyses ?? []) as Row[]);
      setStreak(s?.current_streak ?? 0);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-8 py-16 space-y-16 animate-fade-rise">
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-forest">Today</p>
        <h1 className="font-serif text-4xl md:text-5xl">{warmGreeting(name)}.</h1>
        <div className="flex gap-12 pt-6 text-sm">
          <div>
            <div className="font-serif text-3xl text-foreground">{rows.length}</div>
            <div className="text-muted-foreground uppercase tracking-wider text-xs mt-1">analyses completed</div>
          </div>
          <div>
            <div className="font-serif text-3xl text-foreground">{streak}</div>
            <div className="text-muted-foreground uppercase tracking-wider text-xs mt-1">days of practice</div>
          </div>
        </div>
      </section>

      <section>
        <Link
          to="/upload"
          className="block border-2 border-dashed border-forest/40 rounded-lg p-16 text-center hover:border-forest hover:bg-forest/5"
        >
          <p className="font-serif text-2xl text-foreground">Submit your movement for analysis</p>
          <p className="text-sm text-muted-foreground mt-3">Upload a video. Read the pattern. Refine the practice.</p>
        </Link>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-2xl">Past readings</h2>
        {loading ? (
          <p className="text-muted-foreground text-sm">Gathering your practice…</p>
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nothing yet. Begin with a single submission.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <Link
                key={r.id}
                to="/analyses/$id"
                params={{ id: r.id }}
                className="flex items-center justify-between gap-6 p-6 bg-card border border-border rounded hover:border-forest/40"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-xl">{movementLabel(r.movement_type)}</p>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {r.ai_feedback?.what_we_found ?? "Reading in progress…"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
                    {new Date(r.created_at).toLocaleDateString(undefined, { month: "long", day: "numeric" })}
                  </p>
                </div>
                <div className="font-serif text-3xl text-forest shrink-0">
                  {r.awareness_score ?? "—"}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
