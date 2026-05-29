import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useRouter, L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-CtaRX-tQ.mjs";
import { m as movementLabel } from "./movement-DoOsMqxA.mjs";
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
function CoachDashboard() {
  const router = useRouter();
  const [items, setItems] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    (async () => {
      const {
        data: u
      } = await supabase.auth.getUser();
      if (!u.user) return;
      const {
        data: roles
      } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
      if (!roles?.some((r) => r.role === "coach")) {
        router.navigate({
          to: "/dashboard"
        });
        return;
      }
      const {
        data: analyses
      } = await supabase.from("analyses").select("id, user_id, movement_type, awareness_score, created_at").eq("status", "pending_review").order("created_at", {
        ascending: true
      });
      const userIds = Array.from(new Set((analyses ?? []).map((a) => a.user_id)));
      const profMap = /* @__PURE__ */ new Map();
      if (userIds.length) {
        const {
          data: profs
        } = await supabase.from("profiles").select("id, display_name").in("id", userIds);
        profs?.forEach((p) => profMap.set(p.id, p.display_name ?? "Student"));
      }
      setItems((analyses ?? []).map((a) => ({
        ...a,
        profile_name: profMap.get(a.user_id) ?? "Student"
      })));
      setLoading(false);
    })();
  }, [router]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 max-w-5xl w-full mx-auto px-8 py-16 space-y-12 animate-fade-rise", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.25em] text-forest", children: "Coach" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-4xl", children: "Students awaiting your eye" })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Gathering submissions…" }) : items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "All quiet. Nothing pending review." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: items.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/analyses/$id", params: {
      id: p.id
    }, className: "flex items-center justify-between gap-6 p-6 bg-card border border-border rounded hover:border-forest/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-serif text-xl", children: p.profile_name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: movementLabel(p.movement_type) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-2 uppercase tracking-wider", children: new Date(p.created_at).toLocaleDateString(void 0, {
          month: "long",
          day: "numeric"
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-serif text-3xl text-forest", children: p.awareness_score ?? "—" })
    ] }, p.id)) })
  ] });
}
export {
  CoachDashboard as component
};
