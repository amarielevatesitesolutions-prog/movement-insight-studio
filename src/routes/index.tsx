import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard } from "@/components/AuthCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MoveIQ — Understand how you move" },
      { name: "description", content: "AI-powered movement form analysis built on Movimentica methodology." },
      { property: "og:title", content: "MoveIQ — Institutional-Grade Form Analysis" },
      { property: "og:description", content: "Elevate your practice with AI-powered movement form analysis." },
      { property: "og:image", content: "/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) router.navigate({ to: "/dashboard" });
    });
    return () => { active = false; };
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Subtle animated background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-forest/5 blur-[120px] animate-breathe" />
        <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-ochre/5 blur-[100px] animate-breathe" style={{ animationDelay: "2s" }} />
      </div>

      <header className="relative z-10 px-8 py-6 flex items-center justify-between">
        <Link to="/" className="font-serif text-2xl tracking-tight text-foreground hover:opacity-80 transition-opacity">
          Move<span className="text-forest">IQ</span>
        </Link>
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Movimentica · Form study
        </span>
      </header>

      <section className="relative z-10 flex-1 grid md:grid-cols-2 gap-16 items-center max-w-6xl w-full mx-auto px-8 py-16">
        <div className="space-y-8 animate-fade-rise">
          <p className="text-xs uppercase tracking-[0.25em] text-forest font-medium">A movement journal</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-foreground">
            Understand how<br /><em className="italic text-forest/90 font-medium">you move.</em>
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground max-w-md">
            AI-powered form analysis built on Movimentica methodology. A quiet
            instrument for serious students of movement — refine the foundation,
            explore the pattern, return with awareness.
          </p>
          <div className="flex gap-6 pt-2 text-sm text-muted-foreground/80 font-medium">
            <span className="hover:text-foreground transition-colors cursor-default">· Submit a video</span>
            <span className="hover:text-foreground transition-colors cursor-default">· Read the pattern</span>
            <span className="hover:text-foreground transition-colors cursor-default">· Refine the practice</span>
          </div>
        </div>

        <div className="animate-fade-rise" style={{ animationDelay: "150ms" }}>
          <AuthCard />
        </div>
      </section>
    </main>
  );
}
