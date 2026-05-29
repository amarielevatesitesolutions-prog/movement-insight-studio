import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { u as useRouter, L as Link, O as Outlet } from "./_libs/tanstack__react-router.mjs";
import { s as supabase } from "./_ssr/client-CtaRX-tQ.mjs";
import "./_libs/tanstack__router-core.mjs";
import "./_libs/tanstack__history.mjs";
import "./_libs/cookie-es.mjs";
import "./_libs/seroval.mjs";
import "./_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "./_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./_libs/isbot.mjs";
import "./_libs/supabase__supabase-js.mjs";
import "./_libs/supabase__postgrest-js.mjs";
import "./_libs/supabase__realtime-js.mjs";
import "./_libs/supabase__phoenix.mjs";
import "./_libs/supabase__storage-js.mjs";
import "./_libs/iceberg-js.mjs";
import "./_libs/supabase__auth-js.mjs";
import "tslib";
import "./_libs/supabase__functions-js.mjs";
function AuthLayout() {
  const router = useRouter();
  const [isCoach, setIsCoach] = reactExports.useState(false);
  reactExports.useEffect(() => {
    supabase.auth.getUser().then(async ({
      data
    }) => {
      if (!data.user) return;
      const {
        data: roles
      } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
      setIsCoach(!!roles?.some((r) => r.role === "coach"));
    });
  }, []);
  const signOut = async () => {
    await supabase.auth.signOut();
    router.navigate({
      to: "/"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "px-8 py-6 flex items-center justify-between border-b border-border/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/dashboard", className: "font-serif text-2xl tracking-tight", children: [
        "Move",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-forest", children: "IQ" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex items-center gap-8 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", className: "text-muted-foreground hover:text-foreground", activeProps: {
          className: "text-foreground"
        }, children: "Practice" }),
        isCoach && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/coach", className: "text-muted-foreground hover:text-foreground", activeProps: {
          className: "text-foreground"
        }, children: "Review" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: signOut, className: "text-muted-foreground hover:text-foreground", children: "Sign out" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {})
  ] });
}
export {
  AuthLayout as component
};
