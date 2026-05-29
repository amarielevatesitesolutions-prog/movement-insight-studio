import { createFileRoute, Outlet, redirect, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/" });
  },
  component: AuthLayout,
});

function AuthLayout() {
  const router = useRouter();
  const [isCoach, setIsCoach] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      setIsCoach(!!roles?.some((r) => r.role === "coach"));
    });
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-8 py-6 flex items-center justify-between border-b border-border/60">
        <Link to="/dashboard" className="font-serif text-2xl tracking-tight">
          Move<span className="text-forest">IQ</span>
        </Link>
        <nav className="flex items-center gap-8 text-sm">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            Practice
          </Link>
          {isCoach && (
            <Link to="/coach" className="text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>
              Review
            </Link>
          )}
          <button onClick={signOut} className="text-muted-foreground hover:text-foreground">
            Sign out
          </button>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
