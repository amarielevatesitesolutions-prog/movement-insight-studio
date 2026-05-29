import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useRouter, L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-CtaRX-tQ.mjs";
import { c as createLovableAuth } from "../_libs/lovable.dev__cloud-auth-js.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const lovableAuth = createLovableAuth();
const lovable = {
  auth: {
    signInWithOAuth: async (provider, opts) => {
      const result = await lovableAuth.signInWithOAuth(provider, {
        redirect_uri: opts?.redirect_uri,
        extraParams: {
          ...opts?.extraParams
        }
      });
      if (result.redirected) {
        return result;
      }
      if (result.error) {
        return result;
      }
      try {
        await supabase.auth.setSession(result.tokens);
      } catch (e) {
        return { error: e instanceof Error ? e : new Error(String(e)) };
      }
      return result;
    }
  }
};
function LandingPage() {
  const router = useRouter();
  const [mode, setMode] = reactExports.useState("signin");
  const [role, setRole] = reactExports.useState("student");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [name, setName] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({
      data
    }) => {
      if (active && data.user) router.navigate({
        to: "/dashboard"
      });
    });
    return () => {
      active = false;
    };
  }, [router]);
  const onSubmit = async () => {
    if (!email || !password) {
      toast.error("Please enter your email and a password.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const {
          error
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              display_name: name || email.split("@")[0],
              role
            }
          }
        });
        if (error) throw error;
        toast.success("Welcome. Begin your practice.");
        router.navigate({
          to: "/dashboard"
        });
      } else {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        router.navigate({
          to: "/dashboard"
        });
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
        redirect_uri: window.location.origin
      });
      if (result.error) {
        toast.error(result.error.message || "Sign-in failed.");
        setBusy(false);
        return;
      }
      if (result.redirected) return;
      router.navigate({
        to: "/dashboard"
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign-in failed.");
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-h-screen flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "px-8 py-6 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "font-serif text-2xl tracking-tight text-foreground", children: [
        "Move",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-forest", children: "IQ" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.2em] text-muted-foreground", children: "Movimentica · Form study" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "flex-1 grid md:grid-cols-2 gap-16 items-center max-w-6xl w-full mx-auto px-8 py-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8 animate-fade-rise", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.25em] text-forest", children: "A movement journal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-serif text-5xl md:text-6xl leading-[1.05] text-foreground", children: [
          "Understand how",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "you move."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg leading-relaxed text-muted-foreground max-w-md", children: "AI-powered form analysis built on Movimentica methodology. A quiet instrument for serious students of movement — refine the foundation, explore the pattern, return with awareness." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-6 pt-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "· Submit a video" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "· Read the pattern" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "· Refine the practice" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-lg p-10 shadow-[0_2px_24px_-12px_rgba(45,90,61,0.18)] animate-fade-rise", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 mb-8 p-1 bg-muted rounded-md w-fit", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setMode("signin"), className: `px-4 py-1.5 text-sm rounded ${mode === "signin" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`, children: "Sign in" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setMode("signup"), className: `px-4 py-1.5 text-sm rounded ${mode === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`, children: "Begin" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          mode === "signup" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "Your name", className: "w-full bg-transparent border-b border-input pb-2 text-foreground outline-none focus:border-forest" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@studio.com", className: "w-full bg-transparent border-b border-input pb-2 text-foreground outline-none focus:border-forest" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Password" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "••••••••", className: "w-full bg-transparent border-b border-input pb-2 text-foreground outline-none focus:border-forest" })
          ] }),
          mode === "signup" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Practice as" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: ["student", "coach"].map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setRole(r), className: `flex-1 py-2 text-sm border rounded ${role === r ? "border-forest text-forest bg-forest/5" : "border-border text-muted-foreground"}`, children: r === "student" ? "Student" : "Coach" }, r)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onSubmit, disabled: busy, className: "w-full mt-4 py-3 bg-forest text-primary-foreground rounded font-medium hover:bg-forest/90 disabled:opacity-50", children: busy ? "One moment…" : mode === "signup" ? "Begin practice" : "Continue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative my-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full border-t border-border" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-card px-3 text-xs uppercase tracking-wider text-muted-foreground", children: "or" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onGoogle, disabled: busy, className: "w-full py-3 border border-border rounded text-foreground hover:bg-muted disabled:opacity-50", children: "Continue with Google" })
        ] })
      ] })
    ] })
  ] });
}
export {
  LandingPage as component
};
