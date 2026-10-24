/* Vista SISTEMA: estado de los servicios del servidor opencode.
   Contrato verificado contra el servidor v2.1.4:
     GET  /api/mcp       -> MCP servers con estado (connected/disconnected)
     POST /api/experimental/mcp/{server}/connect|disconnect
     GET  /api/provider  -> proveedores de modelos
     GET  /api/plugin    -> plugins cargados
     GET  /api/skill     -> skills disponibles
     GET  /api/command   -> comandos disponibles
   OJO: la API HTTP NO expone LSP (es interno); se dice claramente en la UI. */
import { h, toast } from "../ui/dom.js";
import { Client } from "../api/client.js";
import { navigate } from "../ui/router.js";
import { t } from "../i18n.js";

export async function systemView(_params, root, signal) {
  root.append(
    h(
      "header",
      { class: "topbar" },
      h("button", { class: "icon-btn", title: t("Volver"), onClick: () => navigate("/settings") }, "‹"),
      h("h1", {}, t("Sistema"))
    )
  );

  const main = h("main", { class: "settings" });
  root.append(main);

  const cargando = h("p", { class: "hint center" }, t("Cargando…"));
  main.append(cargando);

  /* ---- MCP ---- */
  const secMcp = h("section", { class: "sec" }, h("h3", {}, t("Servidores MCP")));
  const listaMcp = h("div", { class: "sys-lista" });
  secMcp.append(listaMcp);

  /* ---- Proveedores ---- */
  const secProv = h("section", { class: "sec" }, h("h3", {}, t("Proveedores de modelos")));
  const listaProv = h("div", { class: "sys-lista" });
  secProv.append(listaProv);

  /* ---- Plugins ---- */
  const secPlug = h("section", { class: "sec" }, h("h3", {}, t("Plugins")));
  const listaPlug = h("div", { class: "sys-lista" });
  secPlug.append(listaPlug);

  /* ---- Skills ---- */
  const secSkill = h("section", { class: "sec" }, h("h3", {}, t("Skills")));
  const listaSkill = h("div", { class: "sys-lista" });
  secSkill.append(listaSkill);

  /* ---- Comandos ---- */
  const secCmd = h("section", { class: "sec" }, h("h3", {}, t("Comandos")));
  const listaCmd = h("div", { class: "sys-lista" });
  secCmd.append(listaCmd);

  /* ---- LSP (no disponible) ---- */
  const secLsp = h(
    "section",
    { class: "sec" },
    h("h3", {}, t("Servidores de lenguaje (LSP)")),
    h(
      "p",
      { class: "hint" },
      t("La API HTTP de opencode no expone el estado de los LSP: los gestiona el servidor internamente (según los ficheros de tu proyecto). Aquí no hay nada que configurar.")
    )
  );

  main.append(secMcp, secProv, secPlug, secSkill, secCmd, secLsp);

  /* Fila con nombre + estado/descripcion y, si procede, un boton de accion. */
  function fila(nombre, sub, { estado, accion } = {}) {
    const clases = ["sys-row"];
    if (estado) clases.push(estado === "connected" || estado === "active" ? "ok" : "off");
    const el = h(
      "div",
      { class: clases.join(" ") },
      h("span", { class: "sys-name" }, nombre),
      sub ? h("span", { class: "sys-sub" }, sub) : null,
      estado ? h("span", { class: "sys-estado" }, t(estado === "connected" || estado === "active" ? "activo" : "inactivo")) : null,
      accion ? h("button", { class: "ghost mini", onClick: accion.fn }, accion.texto) : null
    );
    return el;
  }

  async function cargarMcp() {
    listaMcp.textContent = "";
    try {
      const r = await Client.mcp();
      const items = r?.data || [];
      if (!items.length) {
        listaMcp.append(h("p", { class: "hint" }, t("No hay servidores MCP configurados.")));
        return;
      }
      for (const m of items) {
        const estado = m.status?.status || "unknown";
        const conectado = estado === "connected";
        listaMcp.append(
          fila(m.name, m.integrationID || null, {
            estado: conectado ? "connected" : "off",
            accion: {
              texto: conectado ? t("Desconectar") : t("Conectar"),
              fn: async () => {
                try {
                  await (conectado ? Client.mcpDisconnect(m.name) : Client.mcpConnect(m.name));
                  toast(conectado ? t("Desconectado") : t("Conectado"));
                  await cargarMcp();
                } catch (err) {
                  toast(err.message || t("No se pudo cambiar el estado"));
                }
              },
            },
          })
        );
      }
    } catch (err) {
      listaMcp.append(h("p", { class: "error" }, err.message || t("Error cargando MCP")));
    }
  }

  async function cargarProveedores() {
    listaProv.textContent = "";
    try {
      const r = await Client.providers();
      const items = r?.data || [];
      if (!items.length) {
        listaProv.append(h("p", { class: "hint" }, t("Sin proveedores.")));
        return;
      }
      for (const p of items) {
        listaProv.append(fila(p.name || p.id, p.id));
      }
    } catch (err) {
      listaProv.append(h("p", { class: "error" }, err.message || t("Error cargando proveedores")));
    }
  }

  async function cargarPlugins() {
    listaPlug.textContent = "";
    try {
      const r = await Client.plugins();
      const items = r?.data || [];
      if (!items.length) {
        listaPlug.append(h("p", { class: "hint" }, t("Sin plugins.")));
        return;
      }
      for (const p of items) {
        listaPlug.append(
          fila(p.id, p.source?.type ? t("origen: {tipo}", { tipo: p.source.type }) : null, {
            estado: p.state?.status === "active" ? "active" : "off",
          })
        );
      }
    } catch (err) {
      listaPlug.append(h("p", { class: "error" }, err.message || t("Error cargando plugins")));
    }
  }

  async function cargarSkills() {
    listaSkill.textContent = "";
    try {
      const r = await Client.skills();
      const items = r?.data || [];
      if (!items.length) {
        listaSkill.append(h("p", { class: "hint" }, t("Sin skills.")));
        return;
      }
      for (const s of items) {
        listaSkill.append(fila(s.name || s.id, s.description ? s.description.slice(0, 120) : null));
      }
    } catch (err) {
      listaSkill.append(h("p", { class: "error" }, err.message || t("Error cargando skills")));
    }
  }

  async function cargarComandos() {
    listaCmd.textContent = "";
    try {
      const r = await Client.commands();
      const items = r?.data || [];
      if (!items.length) {
        listaCmd.append(h("p", { class: "hint" }, t("Sin comandos.")));
        return;
      }
      for (const c of items) {
        listaCmd.append(fila(`/${c.name}`, c.description || null));
      }
    } catch (err) {
      listaCmd.append(h("p", { class: "error" }, err.message || t("Error cargando comandos")));
    }
  }

  cargando.hidden = true;
  // en paralelo: cada seccion falla por su cuenta sin tumbar las demas
  await Promise.allSettled([cargarMcp(), cargarProveedores(), cargarPlugins(), cargarSkills(), cargarComandos()]);

  /* Refresco opcional cada 15 s (el estado de MCP puede cambiar). */
  const iv = setInterval(() => {
    if (!document.hidden) cargarMcp();
  }, 15000);
  signal.addEventListener("abort", () => clearInterval(iv));
}
