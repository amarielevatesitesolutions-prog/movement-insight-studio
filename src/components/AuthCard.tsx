import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  name: z.string().optional(),
  role: z.enum(["student", "coach"]).optional(),
});

type AuthFormData = z.infer<typeof authSchema>;

export function AuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      role: "student",
      name: "",
      email: "",
      password: "",
    },
  });

  const role = watch("role");

  const onSubmit = async (data: AuthFormData) => {
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: data.name || data.email.split("@")[0], role: data.role },
          },
        });
        if (error) throw error;
        toast.success("Welcome. Begin your practice.");
        router.navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        router.navigate({ to: "/dashboard" });
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred during authentication.");
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        },
      });
      if (error) throw error;
    } catch (e: any) {
      toast.error(e.message || "Sign-in failed.");
      setBusy(false);
    }
  };

  const nextStep = async () => {
    const isNameValid = await trigger("name");
    if (isNameValid) {
      setStep(2);
    }
  };

  return (
    <div className="bg-card/70 backdrop-blur-xl border border-border rounded-lg p-10 shadow-[0_8px_32px_-12px_rgba(45,90,61,0.25)] animate-fade-rise relative overflow-hidden">
      <div className="flex gap-1 mb-8 p-1 bg-muted/80 backdrop-blur-sm rounded-md w-fit">
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setStep(1);
          }}
          className={`px-4 py-1.5 text-sm rounded transition-colors duration-300 ${mode === "signin" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setStep(1);
          }}
          className={`px-4 py-1.5 text-sm rounded transition-colors duration-300 ${mode === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          Begin
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {mode === "signin" && (
          <div className="space-y-5 animate-fade-rise">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
              <input
                type="email"
                {...register("email")}
                placeholder="you@studio.com"
                className={`w-full bg-transparent border-b pb-2 text-foreground outline-none transition-colors focus:border-forest ${errors.email ? "border-destructive" : "border-input"}`}
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Password</label>
              <input
                type="password"
                {...register("password")}
                placeholder="••••••••"
                className={`w-full bg-transparent border-b pb-2 text-foreground outline-none transition-colors focus:border-forest ${errors.password ? "border-destructive" : "border-input"}`}
              />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full mt-8 py-3 bg-forest text-primary-foreground rounded font-medium hover:bg-forest/90 disabled:opacity-50 transition-colors shadow-lg shadow-forest/20 flex justify-center items-center h-12"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign in"}
            </button>
          </div>
        )}

        {mode === "signup" && step === 1 && (
          <div className="animate-fade-rise">
            <div className="space-y-2 mb-5">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Practice as</label>
              <div className="flex gap-2">
                {(["student", "coach"] as const).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setValue("role", r)}
                    className={`flex-1 py-2.5 text-sm rounded transition-colors duration-300 ${role === r ? "border-forest bg-forest/5 text-forest shadow-sm" : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                  >
                    {r === "student" ? "Student" : "Coach"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Name</label>
              <input
                type="text"
                {...register("name")}
                placeholder="Your name"
                className="w-full bg-transparent border-b border-input pb-2 text-foreground outline-none transition-colors focus:border-forest"
              />
            </div>

            <button
              type="button"
              onClick={nextStep}
              className="w-full mt-8 py-3 bg-forest text-primary-foreground rounded font-medium hover:bg-forest/90 transition-colors shadow-lg shadow-forest/20"
            >
              Continue
            </button>
          </div>
        )}

        {mode === "signup" && step === 2 && (
          <div className="animate-fade-rise">
            <div className="flex items-center gap-2 mb-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="you@studio.com"
                  className={`w-full bg-transparent border-b pb-2 text-foreground outline-none transition-colors focus:border-forest ${errors.email ? "border-destructive" : "border-input"}`}
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Password</label>
                <input
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                  className={`w-full bg-transparent border-b pb-2 text-foreground outline-none transition-colors focus:border-forest ${errors.password ? "border-destructive" : "border-input"}`}
                />
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full mt-8 py-3 bg-forest text-primary-foreground rounded font-medium hover:bg-forest/90 disabled:opacity-50 transition-colors shadow-lg shadow-forest/20 flex justify-center items-center h-12"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "Begin practice"}
            </button>
          </div>
        )}
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50" /></div>
        <div className="relative flex justify-center"><span className="bg-card px-3 text-[10px] uppercase tracking-widest text-muted-foreground">or</span></div>
      </div>

      <button
        type="button"
        onClick={onGoogle}
        disabled={busy}
        className="w-full py-3 border border-border/50 bg-background/50 backdrop-blur-sm rounded text-foreground hover:bg-muted/80 disabled:opacity-50 transition-colors flex justify-center items-center h-12"
      >
        Continue with Google
      </button>
    </div>
  );
}
