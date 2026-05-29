import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useRouter } from "../_libs/tanstack__react-router.mjs";
import { A as isRedirect } from "../_libs/tanstack__router-core.mjs";
import { s as supabase } from "./client-CtaRX-tQ.mjs";
import { a as createServerFn, T as TSS_SERVER_FUNCTION, b as getServerFnById } from "./server-Cxxpm2kw.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-DNhxb8Ui.mjs";
import { M as MOVEMENT_TYPES } from "./movement-DoOsMqxA.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import { o as objectType, s as stringType, e as enumType } from "../_libs/zod.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
function useServerFn(serverFn) {
  const router = useRouter();
  return reactExports.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router.stores.location.get();
        return router.navigate(router.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router, serverFn]);
}
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const MovementEnum = enumType(["gait_walk", "ground_flow", "hip_hinge", "squat", "overhead", "spinal_articulation", "custom"]);
const analyzeMovement = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  movement_type: MovementEnum,
  notes: stringType().max(2e3).optional().nullable(),
  video_path: stringType().min(1)
}).parse(input)).handler(createSsrRpc("c26f4276f2cf83df23663f2a76b4205ee1255d84354c2e4025363300aa382e41"));
function UploadFlow() {
  const router = useRouter();
  const analyze = useServerFn(analyzeMovement);
  const [step, setStep] = reactExports.useState(1);
  const [file, setFile] = reactExports.useState(null);
  const [movement, setMovement] = reactExports.useState(null);
  const [notes, setNotes] = reactExports.useState("");
  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/\.(mp4|mov)$/i.test(f.name)) {
      toast.error("Please submit an MP4 or MOV file.");
      return;
    }
    setFile(f);
    setStep(2);
  };
  const submit = async () => {
    if (!file || !movement) return;
    setStep(4);
    try {
      const {
        data: u
      } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Session expired.");
      const path = `${u.user.id}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      const {
        error: upErr
      } = await supabase.storage.from("movement-videos").upload(path, file, {
        contentType: file.type || "video/mp4"
      });
      if (upErr) throw upErr;
      const feedback = await analyze({
        data: {
          movement_type: movement,
          notes: notes || null,
          video_path: path
        }
      });
      const {
        data: inserted,
        error: insErr
      } = await supabase.from("analyses").insert({
        user_id: u.user.id,
        video_path: path,
        movement_type: movement,
        notes: notes || null,
        ai_feedback: {
          what_we_found: feedback.what_we_found,
          compensation_pattern: feedback.compensation_pattern,
          refinement_practice: feedback.refinement_practice
        },
        awareness_score: feedback.awareness_score
      }).select("id").single();
      if (insErr) throw insErr;
      const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      const {
        data: existing
      } = await supabase.from("streaks").select("current_streak, last_practice_date").eq("user_id", u.user.id).maybeSingle();
      const last = existing?.last_practice_date;
      let next = 1;
      if (last) {
        const diff = (new Date(today).getTime() - new Date(last).getTime()) / 864e5;
        next = diff === 0 ? existing?.current_streak ?? 1 : diff === 1 ? (existing?.current_streak ?? 0) + 1 : 1;
      }
      await supabase.from("streaks").upsert({
        user_id: u.user.id,
        current_streak: next,
        last_practice_date: today
      });
      router.navigate({
        to: "/analyses/$id",
        params: {
          id: inserted.id
        }
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
      setStep(3);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 max-w-2xl w-full mx-auto px-8 py-16 animate-fade-rise", children: [
    step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.25em] text-forest", children: "Step one" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-4xl", children: "Bring your movement." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "A single MP4 or MOV file. One clean attempt is enough." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block border-2 border-dashed border-forest/40 rounded-lg p-16 cursor-pointer hover:bg-forest/5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "video/mp4,video/quicktime,.mp4,.mov", className: "hidden", onChange: onFile }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-serif text-2xl text-forest", children: "Choose a video" })
      ] })
    ] }),
    step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.25em] text-forest", children: "Step two" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-4xl", children: "What pattern is this?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: MOVEMENT_TYPES.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
        setMovement(m.value);
        setStep(3);
      }, className: "py-5 border border-border rounded text-foreground hover:border-forest hover:bg-forest/5 font-serif text-lg", children: m.label }, m.value)) })
    ] }),
    step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.25em] text-forest", children: "Step three" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-4xl", children: "Any awareness to share?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Optional. A sensation, a question, a place of tension." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "I notice tension in my left hip during this…", rows: 5, className: "w-full bg-transparent border border-border rounded p-4 text-foreground outline-none focus:border-forest resize-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: submit, className: "w-full py-4 bg-forest text-primary-foreground rounded font-medium hover:bg-forest/90", children: "Submit for reading" })
    ] }),
    step === 4 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-12 text-center py-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto w-32 h-32 rounded-full bg-forest/15 animate-breathe" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-serif text-3xl", children: "Reading your movement pattern…" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "A quiet moment. The structure is revealing itself." })
      ] })
    ] })
  ] });
}
export {
  UploadFlow as component
};
