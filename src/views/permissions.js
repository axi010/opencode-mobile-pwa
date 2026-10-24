/* Vista de PERMISOS PENDIENTES: el agente pide autorizacion y desde el
   movil decides. Contrato OpenAPI real (servidor v2.1.4):
     GET  /api/permission/request                  -> { data: Permission.Request[] }
     POST /api/session/{sid}/permission/{rid}/reply -> { decision: once|always|reject }
   Refresco automatico cada 8 s (ademas del SSE del chat). */
import { h, toast } from "../ui/dom.js";
import { Client } from "../api/client.js";
import { navigate } from "../ui/router.js";
import { t } from "../i18n.js";

export async function permissionsView(_params, root, signal) {
  root.append(
    h(
      "header",
      { class: "topbar" },
      h("button", { class: "icon-btn", title: t("Volver"), "aria-label": t("Volver"), onClick: () => navigate("/sessions") }, "‹"),
      h("h1", {}, t("Permisos"))
    )
  );

  const list = h("ul", { class: "list" });
  const loading = h("p", { class: "hint center" }, t("Cargando…"));
  const empty = h(
    "p",
    { class: "hint center" },
    t("Sin permisos pendientes. Cuando el agente necesite algo delicado (borrar, shell, escritura…), aquí lo decides.")
  );
  empty.hidden = true;
  const main = h("main", { class: "main" });
  root.append(main);
  main.append(loading, list, empty);

  async function reply(p, decision) {
    try {
      await Client.replyPermission(p.sessionID, p.id, decision);
      toast(
        decision === "reject"
          ? t("Permiso rechazado")
          : decision === "always"
            ? t("Permitido (siempre)")
            : t("Permitido esta vez")
      );
      await refresh();
    } catch (err) {
      toast(err.message || t("No se pudo responder"));
    }
  }

  async function refresh() {
    try {
      // misma fuente que el badge: global (location activa) + sesiones activas
      const items = await Client.allPendingPermissions();
      list.textContent = "";
      for (const p of items) {
        list.append(
          h(
            "li",
            { class: "perm-card" },
            h("span", { class: "perm-action" }, p.action || t("Permiso")),
            h("span", { class: "perm-res" }, (p.resources || []).join("  ·  ")),
            p.message ? h("span", { class: "perm-msg" }, p.message) : null,
            h("span", { class: "perm-ses" }, p.sessionID),
            h(
              "div",
              { class: "perm-actions" },
              h("button", { class: "perm-ok", onClick: () => reply(p, "once") }, t("Permitir")),
              h("button", { class: "perm-always", onClick: () => reply(p, "always") }, t("Siempre")),
              h("button", { class: "perm-ko", onClick: () => reply(p, "reject") }, t("Rechazar"))
            ),
            h("a", { class: "perm-link", href: `#/chat/${p.sessionID}` }, t("Abrir la sesión →"))
          )
        );
      }
      loading.hidden = true;
      empty.hidden = items.length > 0;
    } catch (err) {
      if (err.isAuth) {
        toast(t("Credencial caducada: vuelve a emparejar"));
        navigate("/setup");
        return;
      }
      loading.textContent = err.message || t("Error cargando permisos");
    }
  }

  await refresh();
  const iv = setInterval(() => {
    if (!document.hidden) refresh();
  }, 8000);
  signal.addEventListener("abort", () => clearInterval(iv));
}
