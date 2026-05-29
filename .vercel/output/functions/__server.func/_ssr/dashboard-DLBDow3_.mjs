import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-CtaRX-tQ.mjs";
import { w as warmGreeting, m as movementLabel } from "./movement-DoOsMqxA.mjs";
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
function Dashboard() {
  const [name, setName] = reactExports.useState(null);
  const [rows, setRows] = reactExports.useState([]);
  const [streak, setStreak] = reactExports.useState(0);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    (async () => {
      const {
        data: u
      } = await supabase.auth.getUser();
      if (!u.user) return;
      const [{
        data: profile
      }, {
        data: analyses
      }, {
        data: s
      }] = await Promise.all([supabase.from("profiles").select("display_name").eq("id", u.user.id).maybeSingle(), supabase.from("analyses").select("id, movement_type, awareness_score, created_at, ai_feedback").order("created_at", {
        ascending: false
      }), supabase.from("streaks").select("current_streak").eq("user_id", u.user.id).maybeSingle()]);
      setName(profile?.display_name ?? null);
      setRows(analyses ?? []);
      setStreak(s?.current_streak ?? 0);
      setLoading(false);
    })();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 max-w-5xl w-full mx-auto px-8 py-16 space-y-16 animate-fade-rise", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.25em] text-forest", children: "Today" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-serif text-4xl md:text-5xl", children: [
        warmGreeting(name),
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-12 pt-6 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-serif text-3xl text-foreground", children: rows.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground uppercase tracking-wider text-xs mt-1", children: "analyses completed" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-serif text-3xl text-foreground", children: streak }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground uppercase tracking-wider text-xs mt-1", children: "days of practice" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/upload", className: "block border-2 border-dashed border-forest/40 rounded-lg p-16 text-center hover:border-forest hover:bg-forest/5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-serif text-2xl text-foreground", children: "Submit your movement for analysis" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-3", children: "Upload a video. Read the pattern. Refine the practice." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-2xl", children: "Past readings" }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Gathering your practice…" }) : rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Nothing yet. Begin with a single submission." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/analyses/$id", params: {
        id: r.id
      }, className: "flex items-center justify-between gap-6 p-6 bg-card border border-border rounded hover:border-forest/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-serif text-xl", children: movementLabel(r.movement_type) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground truncate mt-1", children: r.ai_feedback?.what_we_found ?? "Reading in progress…" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-2 uppercase tracking-wider", children: new Date(r.created_at).toLocaleDateString(void 0, {
            month: "long",
            day: "numeric"
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-serif text-3xl text-forest shrink-0", children: r.awareness_score ?? "—" })
      ] }, r.id)) })
    ] })
  ] });
}
export {
  Dashboard as component
};
