import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { movementLabel } from "@/lib/movement";

export const Route = createFileRoute("/_authenticated/coach")({
  component: CoachDashboard,
});

type Pending = {
  id: string;
  user_id: string;
  movement_type: string;
  awareness_score: number | null;
  created_at: string;
  profile_name: string | null;
};

function CoachDashboard() {
  const router = useRouter();
  const [items, setItems] = useState<Pending[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
      if (!roles?.some((r) => r.role === "coach")) {
        router.navigate({ to: "/dashboard" });
        return;
      }
      const { data: analyses } = await supabase
        .from("analyses")
        .select("id, user_id, movement_type, awareness_score, created_at")
        .eq("status", "pending_review")
        .order("created_at", { ascending: true });
      const userIds = Array.from(new Set((analyses ?? []).map((a) => a.user_id)));
      const profMap = new Map<string, string>();
      if (userIds.length) {
        const { data: profs } = await supabase.from("profiles").select("id, display_name").in("id", userIds);
        profs?.forEach((p) => profMap.set(p.id, p.display_name ?? "Student"));
      }
      setItems((analyses ?? []).map((a) => ({ ...a, profile_name: profMap.get(a.user_id) ?? "Student" })));
      setLoading(false);
    })();
  }, [router]);

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-8 py-16 space-y-12 animate-fade-rise">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-forest">Coach</p>
        <h1 className="font-serif text-4xl">Students awaiting your eye</h1>
      </header>

      {loading ? (
        <p className="text-muted-foreground text-sm">Gathering submissions…</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">All quiet. Nothing pending review.</p>
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <Link
              key={p.id}
              to="/analyses/$id"
              params={{ id: p.id }}
              className="flex items-center justify-between gap-6 p-6 bg-card border border-border rounded hover:border-forest/40"
            >
              <div>
                <p className="font-serif text-xl">{p.profile_name}</p>
                <p className="text-sm text-muted-foreground mt-1">{movementLabel(p.movement_type)}</p>
                <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
                  {new Date(p.created_at).toLocaleDateString(undefined, { month: "long", day: "numeric" })}
                </p>
              </div>
              <div className="font-serif text-3xl text-forest">{p.awareness_score ?? "—"}</div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
