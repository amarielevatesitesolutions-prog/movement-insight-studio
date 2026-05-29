import { createFileRoute, Link, useRouter, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MoveIQ — Understand how you move" },
      { name: "description", content: "AI-powered movement form analysis built on Movimentica methodology." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [role, setRole] = useState<"student" | "coach">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) router.navigate({ to: "/dashboard" });
    });
    return () => { active = false; };
  }, [router]);

  const onSubmit = async () => {
    if (!email || !password) {
      toast.error("Please enter your email and a password.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || email.split("@")[0], role },
          },
        });
        if (error) throw error;
        toast.success("Welcome. Begin your practice.");
        router.navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.navigate({ to: "/dashboard" });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message || "Sign-in failed.");
        setBusy(false);
        return;
      }
      if (result.redirected) return;
      router.navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign-in failed.");
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-8 py-6 flex items-center justify-between">
        <Link to="/" className="font-serif text-2xl tracking-tight text-foreground">
          Move<span className="text-forest">IQ</span>
        </Link>
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Movimentica · Form study
        </span>
      </header>

      <section className="flex-1 grid md:grid-cols-2 gap-16 items-center max-w-6xl w-full mx-auto px-8 py-16">
        <div className="space-y-8 animate-fade-rise">
          <p className="text-xs uppercase tracking-[0.25em] text-forest">A movement journal</p>
          <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] text-foreground">
            Understand how<br />you move.
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground max-w-md">
            AI-powered form analysis built on Movimentica methodology. A quiet
            instrument for serious students of movement — refine the foundation,
            explore the pattern, return with awareness.
          </p>
          <div className="flex gap-6 pt-2 text-sm text-muted-foreground">
            <span>· Submit a video</span>
            <span>· Read the pattern</span>
            <span>· Refine the practice</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-10 shadow-[0_2px_24px_-12px_rgba(45,90,61,0.18)] animate-fade-rise">
          <div className="flex gap-1 mb-8 p-1 bg-muted rounded-md w-fit">
            <button
              onClick={() => setMode("signin")}
              className={`px-4 py-1.5 text-sm rounded ${mode === "signin" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`px-4 py-1.5 text-sm rounded ${mode === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Begin
            </button>
          </div>

          <div className="space-y-5">
            {mode === "signup" && (
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-transparent border-b border-input pb-2 text-foreground outline-none focus:border-forest"
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                className="w-full bg-transparent border-b border-input pb-2 text-foreground outline-none focus:border-forest"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent border-b border-input pb-2 text-foreground outline-none focus:border-forest"
              />
            </div>
            {mode === "signup" && (
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Practice as</label>
                <div className="flex gap-2">
                  {(["student", "coach"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`flex-1 py-2 text-sm border rounded ${role === r ? "border-forest text-forest bg-forest/5" : "border-border text-muted-foreground"}`}
                    >
                      {r === "student" ? "Student" : "Coach"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onSubmit}
              disabled={busy}
              className="w-full mt-4 py-3 bg-forest text-primary-foreground rounded font-medium hover:bg-forest/90 disabled:opacity-50"
            >
              {busy ? "One moment…" : mode === "signup" ? "Begin practice" : "Continue"}
            </button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center"><span className="bg-card px-3 text-xs uppercase tracking-wider text-muted-foreground">or</span></div>
            </div>

            <button
              onClick={onGoogle}
              disabled={busy}
              className="w-full py-3 border border-border rounded text-foreground hover:bg-muted disabled:opacity-50"
            >
              Continue with Google
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
