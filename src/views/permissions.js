/* Vista de PERMISOS PENDIENTES: el agente pide autorizacion y desde el
   movil decides. Contrato OpenAPI real (servidor v2.1.4):
     GET  /api/permission/request                  -> { data: Permission.Request[] }
     POST /api/session/{sid}/permission/{rid}/reply -> { decision: once|always|reject }
   Refresco automatico cada 8 s (ademas del SSE del chat). */
import { h, toast } from "../ui/dom.js";
import { Client } from "../api/client.js";
import { navigate } from "../ui/router.js";

export async function permissionsView(_params, root, signal) {
  root.append(
    h(
      "header",
      { class: "topbar" },
      h("button", { class: "icon-btn", title: "Volver", onClick: () => navigate("/sessions") }, "‹"),
      h("h1", {}, "Permisos")
    )
  );

  const list = h("ul", { class: "list" });
  const loading = h("p", { class: "hint center" }, "Cargando…");
  const empty = h(
    "p",
    { class: "hint center" },
    "Sin permisos pendientes. Cuando el agente necesite algo delicado (borrar, shell, escritura…), aquí lo decides."
  );
  empty.hidden = true;
  root.append(loading, list, empty);

  async function reply(p, decision) {
    try {
      await Client.replyPermission(p.sessionID, p.id, decision);
      toast(
        decision === "reject"
          ? "Permiso rechazado"
          : decision === "always"
            ? "Permitido (siempre)"
            : "Permitido esta vez"
      );
      await refresh();
    } catch (err) {
      toast(err.message || "No se pudo responder");
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
            h("span", { class: "perm-action" }, p.action || "permiso"),
            h("span", { class: "perm-res" }, (p.resources || []).join("  ·  ")),
            p.message ? h("span", { class: "perm-msg" }, p.message) : null,
            h("span", { class: "perm-ses" }, p.sessionID),
            h(
              "div",
              { class: "perm-actions" },
              h("button", { class: "perm-ok", onClick: () => reply(p, "once") }, "Permitir"),
              h("button", { class: "perm-always", onClick: () => reply(p, "always") }, "Siempre"),
              h("button", { class: "perm-ko", onClick: () => reply(p, "reject") }, "Rechazar")
            ),
            h("a", { class: "perm-link", href: `#/chat/${p.sessionID}` }, "Abrir la sesión →")
          )
        );
      }
      loading.hidden = true;
      empty.hidden = items.length > 0;
    } catch (err) {
      if (err.isAuth) {
        toast("Credencial caducada: vuelve a emparejar");
        navigate("/setup");
        return;
      }
      loading.textContent = err.message || "Error cargando permisos";
    }
  }

  await refresh();
  const iv = setInterval(() => {
    if (!document.hidden) refresh();
  }, 8000);
  signal.addEventListener("abort", () => clearInterval(iv));
}
