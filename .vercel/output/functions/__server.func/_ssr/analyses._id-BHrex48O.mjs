import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useRouter } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-CtaRX-tQ.mjs";
import { m as movementLabel } from "./movement-DoOsMqxA.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { R as Route } from "./router-DVo0osGK.mjs";
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
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
function AnalysisDetail() {
  const {
    id
  } = Route.useParams();
  const router = useRouter();
  const [a, setA] = reactExports.useState(null);
  const [videoUrl, setVideoUrl] = reactExports.useState(null);
  const [isCoach, setIsCoach] = reactExports.useState(false);
  const [coachDraft, setCoachDraft] = reactExports.useState("");
  reactExports.useEffect(() => {
    (async () => {
      const {
        data: u
      } = await supabase.auth.getUser();
      if (!u.user) return;
      const {
        data: roles
      } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
      setIsCoach(!!roles?.some((r) => r.role === "coach"));
      const {
        data
      } = await supabase.from("analyses").select("*").eq("id", id).maybeSingle();
      if (!data) {
        toast.error("Reading not found.");
        router.navigate({
          to: "/dashboard"
        });
        return;
      }
      setA(data);
      setCoachDraft(data.coach_note ?? "");
      const {
        data: signed
      } = await supabase.storage.from("movement-videos").createSignedUrl(data.video_path, 3600);
      setVideoUrl(signed?.signedUrl ?? null);
    })();
  }, [id, router]);
  const requestReview = async () => {
    if (!a) return;
    const {
      error
    } = await supabase.from("analyses").update({
      status: "pending_review"
    }).eq("id", a.id);
    if (error) return toast.error(error.message);
    setA({
      ...a,
      status: "pending_review"
    });
    toast.success("A coach will review your practice.");
  };
  const submitCoachNote = async () => {
    if (!a) return;
    const {
      error
    } = await supabase.from("analyses").update({
      coach_note: coachDraft,
      status: "reviewed"
    }).eq("id", a.id);
    if (error) return toast.error(error.message);
    setA({
      ...a,
      coach_note: coachDraft,
      status: "reviewed"
    });
    toast.success("Marked as reviewed.");
  };
  if (!a) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 max-w-5xl mx-auto px-8 py-16 text-muted-foreground", children: "Opening the reading…" });
  }
  const score = a.awareness_score ?? 0;
  const ring = 2 * Math.PI * 56;
  const offset = ring - score / 100 * ring;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 max-w-6xl w-full mx-auto px-8 py-12 animate-fade-rise", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1.2fr_1fr] gap-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.25em] text-forest", children: new Date(a.created_at).toLocaleDateString(void 0, {
        month: "long",
        day: "numeric",
        year: "numeric"
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-4xl", children: movementLabel(a.movement_type) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-video bg-ink rounded overflow-hidden", children: videoUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: videoUrl, controls: true, className: "w-full h-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full flex items-center justify-center text-cream/40 text-sm", children: "Loading video…" }) }),
      a.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider text-muted-foreground mb-2", children: "Your awareness" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-foreground italic", children: [
          '"',
          a.notes,
          '"'
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 128 128", className: "w-32 h-32 -rotate-90", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "64", cy: "64", r: "56", fill: "none", stroke: "oklch(0.42 0.065 152 / 0.12)", strokeWidth: "8" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "64", cy: "64", r: "56", fill: "none", stroke: "oklch(0.42 0.065 152)", strokeWidth: "8", strokeLinecap: "round", strokeDasharray: ring, strokeDashoffset: offset, style: {
            transition: "stroke-dashoffset 1.2s ease-out"
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-serif text-5xl text-forest leading-none", children: score }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider text-muted-foreground mt-2", children: "Awareness score" })
        ] })
      ] }),
      a.ai_feedback && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { label: "What we found", body: a.ai_feedback.what_we_found }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { label: "Compensation pattern", body: a.ai_feedback.compensation_pattern }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { label: "Refinement practice", body: a.ai_feedback.refinement_practice })
      ] }),
      a.coach_note && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border pt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-ochre mb-2", children: "From your coach" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground leading-relaxed", children: a.coach_note })
      ] }),
      isCoach ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border pt-6 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Coach note" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: coachDraft, onChange: (e) => setCoachDraft(e.target.value), rows: 4, placeholder: "Offer one refinement…", className: "w-full bg-transparent border border-border rounded p-3 text-foreground outline-none focus:border-forest resize-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: submitCoachNote, className: "w-full py-3 bg-forest text-primary-foreground rounded hover:bg-forest/90", children: "Mark as reviewed" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: requestReview, disabled: a.status === "pending_review" || a.status === "reviewed", className: "w-full py-3 border border-forest text-forest rounded hover:bg-forest/5 disabled:opacity-50", children: a.status === "reviewed" ? "Coach review complete" : a.status === "pending_review" ? "Awaiting coach review" : "Request coach review" })
    ] })
  ] }) });
}
function Section({
  label,
  body
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-forest mb-2", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground leading-relaxed", children: body })
  ] });
}
export {
  AnalysisDetail as component
};
