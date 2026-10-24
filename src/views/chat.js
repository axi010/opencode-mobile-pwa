/* Chat con streaming en tiempo real.
   Flujo de eventos SSE (filtrados por sessionID):
     session.text.started/delta/ended      -> burbujas de texto en vivo
     session.reasoning.*                   -> chip colapsable "pensando…"
     session.tool.input.started|success|error -> chip de herramienta
     session.step.started|ended            -> indicador "escribiendo…"
   Cualquier evento no mapeado provoca un reconciliado diferido (self-healing). */
import { h, renderMarkdown, timeAgo, toast, copiarTexto } from "../ui/dom.js";
import { Client, subscribeEvents } from "../api/client.js";
import { navigate } from "../ui/router.js";
import { crearControles } from "../ui/chat-controls.js";
import { t } from "../i18n.js";

export async function chatView(params, root, signal) {
  const sessionID = params.id;

  const titleEl = h("h1", {}, "Chat");
  const stopBtn = h(
    "button",
    { class: "icon-btn", hidden: true, title: t("Detener"), onClick: () =>
        Client.interrupt(sessionID).catch((e) => toast(e.message)) },
    "■"
  );

  /* Buscador de la conversacion (el input vive en la fila de abajo; el boton,
     en la barra superior). Se declara ANTES del header porque el header lo usa. */
  const buscarChat = h("input", {
    type: "search",
    class: "buscar-chat",
    placeholder: t("Buscar en la conversación…"),
    autocomplete: "off",
    spellcheck: "false",
    hidden: true,
  });
  const cuentaChat = h("span", { class: "cuenta-chat", hidden: true });
  const btnBuscar = h("button", {
    type: "button",
    class: "icon-btn",
    title: t("Buscar en la conversación"),
    "aria-label": t("Buscar en la conversación"),
    onClick: () => {
      buscarChat.hidden = !buscarChat.hidden;
      if (!buscarChat.hidden) buscarChat.focus();
      else {
        buscarChat.value = "";
        aplicarBusquedaChat();
      }
    },
  }, "🔍");

  /* Copiar la conversacion completa en Markdown (para pegarla en un issue,
     un informe o pasarla a otra IA). Se genera desde el DOM ya renderizado. */
  const btnCopiarTodo = h("button", {
    type: "button",
    class: "icon-btn",
    title: t("Copiar toda la conversación"),
    "aria-label": t("Copiar toda la conversación"),
    onClick: async () => {
      const partes = [];
      for (const el of scroller.children) {
        if (el.classList.contains("bubble") && el.classList.contains("user")) {
          partes.push(`## Usuario\n\n${el.textContent.trim()}\n`);
        } else if (el.classList.contains("bubble") && el.classList.contains("assistant")) {
          const body = el.querySelector(".md");
          partes.push(`## Asistente\n\n${body ? body.innerText.trim() : ""}\n`);
        } else if (el.classList.contains("note")) {
          partes.push(`> ${el.textContent.trim()}\n`);
        }
      }
      if (!partes.length) return toast(t("No hay nada que copiar"));
      const texto = `# Conversación — ${titleEl.textContent}\n\n${partes.join("\n")}`;
      const ok = await copiarTexto(texto);
      toast(ok ? t("Conversación copiada en Markdown") : t("No se pudo copiar"));
    },
  }, "⧉");
  const buscarFila = h("div", { class: "chat-buscar" }, buscarChat, cuentaChat);

  root.append(
    h("header", { class: "topbar chat-top" },
      h("button", { class: "icon-btn", title: "Volver", onClick: () => navigate("/sessions") }, "‹"),
      titleEl, btnBuscar, btnCopiarTodo, stopBtn)
  );

  const offline = h("div", { class: "banner", hidden: true }, t("Sin conexión con el servidor · reintentando…"));
  const permBanner = h("div", { class: "perm-banner", hidden: true });
  const scroller = h("div", { class: "chat-scroll" });
  const typing = h(
    "div",
    { class: "typing", hidden: true },
    h("span", { class: "dots", "aria-hidden": "true" }, h("i"), h("i"), h("i")),
    t("escribiendo…")
  );

  /* Botón flotante para volver al final cuando se ha subido en la conversación */
  const irAbajo = h(
    "button",
    {
      type: "button",
      class: "to-bottom",
      hidden: true,
      title: t("Ir al final"),
      "aria-label": t("Ir al final"),
      onClick: () => {
        const reducir = matchMedia("(prefers-reduced-motion: reduce)").matches;
        scroller.scrollTo({ top: scroller.scrollHeight, behavior: reducir ? "auto" : "smooth" });
      },
    },
    "↓"
  );
  const cuerpo = h("div", { class: "chat-body" }, scroller, irAbajo);

  let coincidencias = [];
  let idxCoincidencia = -1;

  function limpiarMarcas() {
    for (const el of scroller.querySelectorAll("mark.resaltado")) {
      const padre = el.parentNode;
      padre.replaceChild(document.createTextNode(el.textContent), el);
      padre.normalize();
    }
    coincidencias = [];
    idxCoincidencia = -1;
    cuentaChat.hidden = true;
  }

  function aplicarBusquedaChat() {
    limpiarMarcas();
    const q = buscarChat.value.trim();
    if (!q) return;
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    // se buscan coincidencias en el texto de cada burbuja (nodos de texto)
    for (const burbuja of scroller.querySelectorAll(".bubble")) {
      const walker = document.createTreeWalker(burbuja, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) =>
          n.nodeValue.trim() && !n.parentNode.closest(".code-head, .tools")
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT,
      });
      const nodos = [];
      while (walker.nextNode()) nodos.push(walker.currentNode);
      for (const nodo of nodos) {
        const texto = nodo.nodeValue;
        if (!re.test(texto)) continue;
        re.lastIndex = 0;
        const frag = document.createDocumentFragment();
        let ultimo = 0;
        let m;
        while ((m = re.exec(texto))) {
          frag.append(document.createTextNode(texto.slice(ultimo, m.index)));
          const mark = document.createElement("mark");
          mark.className = "resaltado";
          mark.textContent = m[0];
          frag.append(mark);
          coincidencias.push(mark);
          ultimo = m.index + m[0].length;
        }
        frag.append(document.createTextNode(texto.slice(ultimo)));
        nodo.parentNode.replaceChild(frag, nodo);
      }
    }
    cuentaChat.hidden = coincidencias.length === 0;
    cuentaChat.textContent = coincidencias.length ? `0/${coincidencias.length}` : "";
    if (coincidencias.length) irACoincidencia(0);
  }

  function irACoincidencia(i) {
    if (!coincidencias.length) return;
    idxCoincidencia = (i + coincidencias.length) % coincidencias.length;
    coincidencias.forEach((el, n) => el.classList.toggle("activa", n === idxCoincidencia));
    cuentaChat.textContent = `${idxCoincidencia + 1}/${coincidencias.length}`;
    const el = coincidencias[idxCoincidencia];
    // centrar la coincidencia en el scroller
    const top = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    scroller.scrollTop += top - scroller.clientHeight / 2;
  }

  buscarChat.addEventListener("input", aplicarBusquedaChat);
  buscarChat.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      irACoincidencia(idxCoincidencia + (e.shiftKey ? -1 : 1));
    }
    if (e.key === "Escape") {
      buscarChat.value = "";
      aplicarBusquedaChat();
      buscarChat.hidden = true;
    }
  });

  /* Adjuntos pendientes de enviar (chips sobre el composer) */
  const adjuntos = [];
  const chipsAdjuntos = h("div", { class: "attach-chips", hidden: true });
  function pintarAdjuntos() {
    chipsAdjuntos.textContent = "";
    chipsAdjuntos.hidden = adjuntos.length === 0;
    adjuntos.forEach((a, i) => {
      chipsAdjuntos.append(
        h("span", { class: "attach-chip" },
          h("span", { class: "attach-name", title: a.uri }, a.name),
          h("button", {
            type: "button", class: "attach-x", title: t("Quitar"),
            onClick: () => { adjuntos.splice(i, 1); pintarAdjuntos(); },
          }, "✕"))
      );
    });
  }

  const controles = crearControles({
    sessionID,
    onArchivos: (files) => {
      for (const f of files) {
        if (!adjuntos.some((a) => a.uri === f.uri)) adjuntos.push(f);
      }
      pintarAdjuntos();
      toast(t("{n} archivo(s) adjuntado(s)", { n: files.length }));
    },
  });

  root.append(offline, permBanner, controles.fila, buscarFila, cuerpo, typing);

  /* Botón "Copiar" de los bloques de código (delegado: el HTML de las burbujas
     se regenera con cada fragmento recibido por streaming). */
  scroller.addEventListener("click", async (e) => {
    const btn = e.target.closest?.(".copy-btn");
    if (!btn) return;
    const pre = btn.closest(".code-block")?.querySelector("pre");
    if (!pre) return;
    const ok = await copiarTexto(pre.textContent);
    btn.textContent = ok ? t("Copiado") : t("No se pudo");
    setTimeout(() => {
      btn.textContent = t("Copiar");
    }, 1500);
  });

  const input = h("textarea", { rows: 1, placeholder: t("Mensaje…"), enterkeyhint: "send" });
  const sendBtn = h("button", {}, t("Enviar"));
  root.append(chipsAdjuntos, h("div", { class: "composer" }, input, sendBtn));

  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 120) + "px";
  });

  /* ---------- estado ---------- */
  const bubbles = new Map(); // "msgID:ordinal" -> {el, body, raw}
  const reasoningChips = new Map(); // "msgID:ordinal" -> {details, pre, raw}
  const toolChips = new Map(); // toolId -> chip
  let running = 0;
  let reconcileTimer = null;

  const nearBottom = () => scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 160;
  const actualizarIrAbajo = () => {
    irAbajo.hidden = nearBottom();
  };
  const scrollDown = (force) => {
    if (force || nearBottom()) scroller.scrollTop = scroller.scrollHeight;
    actualizarIrAbajo();
  };
  scroller.addEventListener("scroll", actualizarIrAbajo, { passive: true });

  function updateBusy() {
    typing.hidden = running <= 0;
    stopBtn.hidden = running <= 0;
    scrollDown();
  }

  function addNote(text) {
    scroller.append(h("div", { class: "note" }, text));
    scrollDown(true);
  }

  function quitarVacio() {
    scroller.querySelector(".empty-chat")?.remove();
  }

  function addUserBubble(text) {
    quitarVacio();
    scroller.append(h("div", { class: "bubble user" }, text));
    scrollDown(true);
  }

  function ensureBubble(key) {
    let b = bubbles.get(key);
    if (!b) {
      quitarVacio();
      const el = h("div", { class: "bubble assistant" });
      const body = h("div", { class: "md" });
      const tools = h("div", { class: "tools" });
      el.append(body, tools);
      scroller.append(el);
      b = { el, body, tools, raw: "" };
      bubbles.set(key, b);
    }
    return b;
  }

  function streamDelta(key, delta, full) {
    const b = ensureBubble(key);
    b.raw = full !== undefined ? full : b.raw + (delta || "");
    b.body.innerHTML = renderMarkdown(b.raw);
    scrollDown();
  }

  function ensureReasoning(key) {
    let r = reasoningChips.get(key);
    if (!r) {
      const pre = h("pre", {});
      const details = h("details", { class: "reasoning" },
        h("summary", {}, t("pensando…")), pre);
      const b = ensureBubble(key);
      b.el.insertBefore(details, b.body);
      r = { details, pre, raw: "" };
      reasoningChips.set(key, r);
    }
    return r;
  }

  function toolChip(toolId, name) {
    let chip = toolChips.get(toolId);
    if (!chip) {
      chip = h("span", { class: "tool running" }, `⚙ ${name || "tool"}…`);
      // el chip se asienta en la ultima burbuja asistente conocida
      const last = [...bubbles.values()].pop();
      (last?.tools || scroller).append(chip);
      toolChips.set(toolId, chip);
    }
    return chip;
  }

  /* ---------- permisos en vivo (contrato OpenAPI: once|always|reject) ---------- */
  async function refreshPermissions() {
    try {
      const r = await Client.sessionPermissions(sessionID);
      const items = r?.data || [];
      permBanner.textContent = "";
      for (const p of items) {
        permBanner.append(
          h(
            "div",
            { class: "perm-row" },
            h(
              "span",
              { class: "perm-text" },
              h("b", {}, (p.action || "permiso") + ": "),
              (p.resources || []).join("  ·  ")
            ),
            h(
              "div",
              { class: "perm-actions" },
              h("button", { class: "perm-ok", onClick: () => respond(p, "once") }, "Permitir"),
              h("button", { class: "perm-always", onClick: () => respond(p, "always") }, "Siempre"),
              h("button", { class: "perm-ko", onClick: () => respond(p, "reject") }, "Rechazar")
            )
          )
        );
      }
      permBanner.hidden = items.length === 0;
    } catch {
      /* el banner es best-effort: lo refresca el siguiente evento */
    }
  }

  async function respond(p, decision) {
    try {
      await Client.replyPermission(p.sessionID, p.id, decision);
      toast(decision === "reject" ? t("Permiso rechazado") : decision === "always" ? t("Permitido (siempre)") : t("Permitido"));
      await refreshPermissions();
    } catch (err) {
      toast(err.message || "No se pudo responder");
    }
  }

  /* ---------- historial ---------- */
  function renderHistory(msgs) {
    limpiarMarcas();
    bubbles.clear();
    reasoningChips.clear();
    toolChips.clear();
    scroller.textContent = "";
    const ordered = [...msgs].sort((a, b) => (a.time?.created || 0) - (b.time?.created || 0));
    for (const m of ordered) {
      if (m.type === "user") addUserBubble(m.text || "");
      else if (m.type === "assistant") {
        const text = (m.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
        if (text) streamDelta(`${m.id}:0`, "", text);
      } else if (m.type === "model-switched") addNote(`modelo → ${m.model?.id || "?"}`);
      else if (m.type === "agent-switched") addNote(`agente → ${m.agent || "?"}`);
      // "idle"/"shell" u otros tipos de sistema: ruido, no se muestran
    }
    if (!scroller.children.length) {
      scroller.append(
        h("p", { class: "empty-chat hint" }, "Aún no hay mensajes. Escribe abajo para empezar.")
      );
    }
    scrollDown(true);
  }

  async function loadMessages() {
    const r = await Client.messages(sessionID);
    renderHistory(r?.data || []);
  }

  /* ---------- eventos en vivo ---------- */
  function scheduleReconcile() {
    if (reconcileTimer || running > 0) return;
    reconcileTimer = setTimeout(async () => {
      reconcileTimer = null;
      if (running > 0) return;
      try {
        await loadMessages();
      } catch {
        /* reconciliable en el siguiente evento */
      }
    }, 1200);
  }

  function handleEvent(ev) {
    if (!ev?.type || ev.type === "server.connected") return;
    const d = ev.data || {};
    if (d.sessionID && d.sessionID !== sessionID) return; // el stream es global

    // Permiso de ESTA sesión (o global): actualizar el banner de decision.
    if (ev.type.includes("permission")) {
      refreshPermissions();
      return;
    }

    switch (ev.type) {
      case "session.text.started":
        // el indicador de ocupado lo gestiona session.step.started (evita doble incremento)
        ensureBubble(`${d.assistantMessageID}:${d.ordinal ?? 0}`);
        break;
      case "session.text.delta":
        streamDelta(`${d.assistantMessageID}:${d.ordinal ?? 0}`, d.delta);
        break;
      case "session.text.ended":
        streamDelta(`${d.assistantMessageID}:${d.ordinal ?? 0}`, "", d.text);
        break;
      case "session.reasoning.started":
        ensureReasoning(`${d.assistantMessageID}:${d.ordinal ?? 0}`);
        break;
      case "session.reasoning.delta": {
        const r = ensureReasoning(`${d.assistantMessageID}:${d.ordinal ?? 0}`);
        r.raw += d.delta || "";
        r.pre.textContent = r.raw;
        r.details.querySelector("summary").textContent = t("pensando…");
        break;
      }
      case "session.reasoning.ended": {
        const r = ensureReasoning(`${d.assistantMessageID}:${d.ordinal ?? 0}`);
        r.raw = d.text || r.raw;
        r.pre.textContent = r.raw;
        r.details.querySelector("summary").textContent = t("pensado");
        break;
      }
      case "session.tool.input.started":
        toolChip(d.id, d.name);
        break;
      case "session.tool.success": {
        const chip = toolChip(d.id);
        chip.className = "tool ok";
        chip.textContent = chip.textContent.replace(/…$/, "") + " ✓";
        break;
      }
      case "session.tool.error": {
        const chip = toolChip(d.id);
        chip.className = "tool err";
        chip.textContent = chip.textContent.replace(/…$/, "") + " ✗";
        break;
      }
      case "session.tool.called":
      case "session.tool.progress":
      case "session.tool.input.ended":
        break;
      case "session.step.started":
        running++;
        updateBusy();
        break;
      case "session.step.ended":
        running = Math.max(0, running - 1);
        updateBusy();
        if (d.finish !== "tool-calls") scheduleReconcile();
        break;
      default:
        if (/\.idle$/.test(ev.type)) {
          running = 0;
          updateBusy();
          scheduleReconcile();
        } else if (ev.type.startsWith("session.")) {
          scheduleReconcile();
        }
    }
  }

  /* ---------- arranque ---------- */
  try {
    const detail = await Client.getSession(sessionID);
    if (detail?.data?.title) titleEl.textContent = detail.data.title;
  } catch {
    /* el título es opcional */
  }
  // estado real del modo (plan/build) y del modelo en la fila de controles
  controles.sincronizar();

  try {
    await loadMessages();
  } catch (err) {
    if (err.isAuth) {
      toast("Credencial caducada: vuelve a emparejar");
      navigate("/setup");
      return;
    }
    addNote(`Error cargando mensajes: ${err.message}`);
  }

  // permisos que ya estaban pendientes al abrir el chat
  refreshPermissions();

  const ac = new AbortController();
  signal.addEventListener("abort", () => ac.abort());

  /* Suscripcion SSE con RECONEXION y BACKOFF EXPONENCIAL.
     Antes reintentaba cada 3 s fijos: si el servidor estaba caido, machacaba la
     red y gastaba bateria. Ahora: 1s, 2s, 4s, 8s... hasta 30s, con algo de
     aleatoriedad (jitter) para no coincidir con otros clientes. Al conectar
     bien, el contador se reinicia. */
  let intentos = 0;
  let timerReconexion = null;

  function connect() {
    subscribeEvents({
      onEvent: (ev) => {
        if (offline.hidden === false) {
          // se ha recuperado la conexion tras un corte
          toast("Conexión restablecida");
        }
        offline.hidden = true;
        intentos = 0; // exito: se reinicia el backoff
        handleEvent(ev);
      },
      onError: () => {
        if (ac.signal.aborted) return;
        offline.hidden = false;
        const base = Math.min(1000 * 2 ** intentos, 30000);
        const espera = Math.round(base * (0.7 + Math.random() * 0.6)); // jitter
        intentos++;
        offline.textContent = `Sin conexión con el servidor · reintentando en ${Math.round(espera / 1000)} s…`;
        clearTimeout(timerReconexion);
        timerReconexion = setTimeout(connect, espera);
      },
      signal: ac.signal,
    });
  }
  connect();
  signal.addEventListener("abort", () => clearTimeout(timerReconexion));

  /* ---------- envio ---------- */
  async function send() {
    const text = input.value.trim();
    const files = adjuntos.map((a) => ({ uri: a.uri, name: a.name }));
    if (!text && !files.length) return;
    input.value = "";
    input.style.height = "auto";
    const etiqueta = files.length ? `${text}${text ? " " : ""}📎 ${files.map((f) => f.name).join(", ")}` : text;
    addUserBubble(etiqueta);
    adjuntos.length = 0;
    pintarAdjuntos();
    try {
      await Client.prompt(sessionID, text, files);
    } catch (err) {
      toast(t("No se pudo enviar: ") + err.message);
      if (err.isAuth) navigate("/setup");
    }
  }
  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });
}
