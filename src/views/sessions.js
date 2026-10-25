/* Lista de sesiones + creacion de sesion (con agent y modelo alcanzables)
   + badge de PERMISOS pendientes (acceso a /permissions). */
import { h, timeAgo, toast } from "../ui/dom.js";
import { Client } from "../api/client.js";
import { navigate } from "../ui/router.js";
import { t } from "../i18n.js";
import { filtrarSesiones, proyectosUnicos, nombresDeProyectos } from "../ui/sesiones-filtro.js";
import { registrarAtajos } from "../ui/atajos.js";

const LAST_DIR_KEY = "ocmovil.lastDir";
const ORDEN_KEY = "ocmovil.ordenSesiones";

export async function sessionsView(_params, root, signal) {
  const permBadge = h("span", { class: "perm-badge", "aria-hidden": "true", hidden: true }, "0");
  const permBtn = h(
    "button",
    {
      class: "icon-btn perm-btn",
      title: t("Permisos pendientes"),
      "aria-label": t("Permisos pendientes"),
      onClick: () => navigate("/permissions"),
    },
    // El emoji y el contador son decorativos para el lector: el numero real se
    // anuncia en el aria-label del boton (WCAG 2.5.3: el nombre visible debe
    // estar contenido en el nombre accesible).
    h("span", { "aria-hidden": "true" }, "🛡")
  );
  permBtn.append(permBadge);

  root.append(
    h(
      "header",
      { class: "topbar" },
      h("h1", {}, t("Sesiones")),
      permBtn,
      h(
        "button",
        { class: "icon-btn", title: t("Ajustes"), "aria-label": t("Ajustes"), onClick: () => navigate("/settings") },
        "⚙"
      )
    )
  );

  /* Barra de busqueda + orden. Con 50 sesiones la lista se vuelve inmanejable:
     el filtro es en memoria (sin peticiones) y el orden se recuerda. */
  const buscar = h("input", {
    type: "search",
    class: "buscar",
    placeholder: t("Buscar sesión…"),
    title: t("Buscar sesión…") + " (Ctrl+K)",
    autocomplete: "off",
    spellcheck: "false",
  });
  const ordenSel = h("select", { class: "orden", title: t("Ordenar"), "aria-label": t("Ordenar") },
    h("option", { value: "recientes" }, t("Recientes")),
    h("option", { value: "antiguas" }, t("Antiguas")),
    h("option", { value: "nombre" }, t("Nombre"))
  );
  /* Filtro por proyecto. Solo se muestra si hay MAS DE UN proyecto con sesiones
     (con uno solo no aporta nada y ocupa sitio). Se filtra por `projectID`, no
     por directorio: un proyecto puede tener varias carpetas (worktrees) y todas
     pertenecen al mismo proyecto. */
  const proyectoKey = "ocmovil.filtroProyecto";
  const proyectoSel = h("select", {
    class: "proyecto",
    hidden: true,
    title: t("Filtrar por proyecto"),
    "aria-label": t("Filtrar por proyecto"),
  });
  const barra = h("div", { class: "lista-barra" }, buscar, proyectoSel, ordenSel);
  const main = h("main", { class: "main" });
  main.append(barra);
  root.append(main);

  const newPanel = h("div", { class: "new-panel", hidden: true });
  const dirInput = h("input", {
    type: "text",
    name: "dir",
    placeholder: t("C:\\ruta\\del\\proyecto"),
    autocomplete: "off",
    spellcheck: "false",
  });
  const createBtn = h("button", { type: "submit" }, t("Crear sesión"));
  const newForm = h(
    "form",
    { class: "new-form" },
    h("label", {}, t("Carpeta del proyecto (en el PC)"), dirInput),
    createBtn
  );
  newForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const dir = dirInput.value.trim();
    if (!dir) return toast(t("Indica la carpeta del proyecto"));
    createBtn.disabled = true;
    createBtn.textContent = t("Creando…");
    try {
      const created = await Client.createSession(dir);
      const id = created?.data?.id;
      if (!id) throw new Error(t("Respuesta inesperada al crear la sesión"));
      localStorage.setItem(LAST_DIR_KEY, dir);
      // Sin agente el run NUNCA arranca (hallazgo empirico); modelo por defecto
      // puede estar bloqueado (gemini en el insti) -> fijar modelo alcanzable.
      try {
        const agents = await Client.agents();
        const primary = (agents?.data || []).find((a) => a.mode === "primary" && !a.hidden);
        await Client.setAgent(id, primary?.id || "build");
      } catch {
        /* best-effort */
      }
      try {
        const dm = await Client.defaultModel();
        const m = dm?.data || dm;
        if (m?.id) await Client.setModel(id, { id: m.id, providerID: m.providerID });
      } catch {
        /* best-effort */
      }
      navigate(`/chat/${id}`);
    } catch (err) {
      toast(err.message || t("Error creando la sesión"));
      createBtn.disabled = false;
      createBtn.textContent = t("Crear sesión");
    }
  });
  newPanel.append(newForm);

  const list = h("ul", { class: "list" });
  const loading = h("p", { class: "hint center" }, t("Cargando…"));
  const vacio = h(
    "div",
    { class: "empty-state", hidden: true },
    h("p", { class: "empty-title" }, t("Todavía no hay sesiones")),
    h("p", { class: "hint" }, t("Pulsa + para crear la primera en la carpeta de tu proyecto."))
  );
  main.append(newPanel, loading, vacio, list);

  /* Refresco unificado (fluida): una sola pasada trae sesiones + permisos y
     el DOM solo se toca si algo ha cambiado (firma), preservando el scroll.
     Antes eran 2 intervalos con peticiones separadas y repintado completo
     cada 15 s (parpadeo si el usuario estaba leyendo la lista). */
  let firmaLista = "";
  let nPermisos = -1;
  let todas = []; // ultima lista recibida del servidor (el filtro es en memoria)

  function pintarBadge(n) {
    if (n === nPermisos) return;
    nPermisos = n;
    permBadge.hidden = n === 0;
    permBadge.textContent = String(n);
    // El nombre accesible incluye el numero visible (WCAG 2.5.3).
    permBtn.setAttribute(
      "aria-label",
      n > 0 ? t("{n} permisos pendientes", { n }) : t("Permisos pendientes")
    );
  }

  /* Aplica busqueda (nombre/id) + filtro por proyecto + orden elegido.
     Todo en memoria: sin peticiones extra. La logica pura vive en
     ui/sesiones-filtro.js para poder probarla sin DOM. */
  function filtrarYOrdenar(items) {
    return filtrarSesiones(items, {
      proyecto: proyectoSel.value,
      texto: buscar.value,
      orden: ordenSel.value,
    });
  }

  /* Rellena el selector de proyectos a partir de las sesiones cargadas y de la
     lista de proyectos del servidor. Solo se muestra si hay mas de uno.
     Se recalcula cuando CAMBIA el conjunto de proyectos (p. ej. si el usuario
     crea una sesion en otra carpeta), no solo la primera vez. */
  let proyectosVistos = "";
  async function cargarProyectos(sesiones) {
    const ids = proyectosUnicos(sesiones);
    const firmaProy = ids.join(",");
    if (firmaProy === proyectosVistos) return; // sin cambios: no se toca el DOM
    proyectosVistos = firmaProy;
    if (ids.length <= 1) {
      // un solo proyecto: el filtro no aporta, se oculta
      proyectoSel.hidden = true;
      return;
    }
    let nombres = {};
    try {
      const r = await Client.projects();
      const arr = Array.isArray(r) ? r : r?.data || [];
      nombres = nombresDeProyectos(ids, arr);
    } catch {
      /* si falla, se usan los IDs recortados */
    }
    const previo = (() => {
      try {
        return localStorage.getItem(proyectoKey) || "*";
      } catch {
        return "*";
      }
    })();
    proyectoSel.textContent = "";
    proyectoSel.append(h("option", { value: "*" }, t("Todos los proyectos")));
    for (const id of ids) {
      proyectoSel.append(h("option", { value: id }, nombres[id] || id.slice(0, 8)));
    }
    proyectoSel.hidden = false;
    // si el proyecto guardado ya no existe, se vuelve a "todos"
    proyectoSel.value = ids.includes(previo) ? previo : "*";
  }

  function pintarLista(items) {
    const visibles = filtrarYOrdenar(items);
    const filas = visibles.map((s) => ({
      id: s.id,
      title: s.title || s.id,
      sub: `${timeAgo(s.time?.created || Date.now())}${s.model?.id ? ` · ${s.model.id}` : ""}`,
    }));
    // la firma incluye los filtros para que un cambio repinte al instante
    const firma = JSON.stringify([filas, buscar.value, ordenSel.value, proyectoSel.value]);
    if (firma === firmaLista) return; // sin cambios: ni se toca el DOM
    firmaLista = firma;
    vacio.hidden = filas.length > 0;
    if (!filas.length && (buscar.value.trim() || proyectoSel.value !== "*")) {
      // hay filtro activo y no hay resultados: mensaje especifico
      vacio.querySelector(".empty-title").textContent = t("Sin resultados");
      vacio.querySelector(".hint").textContent = t("Prueba con otro texto o borra la búsqueda.");
    } else {
      vacio.querySelector(".empty-title").textContent = t("Todavía no hay sesiones");
      vacio.querySelector(".hint").textContent = t("Pulsa + para crear la primera en la carpeta de tu proyecto.");
    }
    const scroll = list.scrollTop;
    list.textContent = "";
    for (const f of filas) {
      list.append(
        h(
          "li",
          {},
          h(
            "a",
            { class: "row", href: `#/chat/${f.id}` },
            h("span", { class: "row-title" }, f.title),
            h("span", { class: "row-sub" }, f.sub)
          )
        )
      );
    }
    list.scrollTop = scroll;
    loading.hidden = true;
  }

  // el filtro y el orden repintan al instante (sin esperar al intervalo)
  buscar.addEventListener("input", () => pintarLista(todas));
  ordenSel.addEventListener("change", () => {
    try {
      localStorage.setItem(ORDEN_KEY, ordenSel.value);
    } catch {
      /* best-effort */
    }
    pintarLista(todas);
  });
  try {
    ordenSel.value = localStorage.getItem(ORDEN_KEY) || "recientes";
  } catch {
    /* por defecto recientes */
  }
  // cambiar de proyecto repinta al instante y recuerda la eleccion
  proyectoSel.addEventListener("change", () => {
    try {
      localStorage.setItem(proyectoKey, proyectoSel.value);
    } catch {
      /* best-effort */
    }
    pintarLista(todas);
  });

  async function refresh() {
    try {
      const [ses, perms] = await Promise.all([
        Client.sessions(50),
        Client.allPendingPermissions(), // best-effort: nunca rechaza
      ]);
      todas = ses?.data || [];
      // el selector de proyectos se recalcula si cambia el conjunto de proyectos
      await cargarProyectos(todas);
      pintarLista(todas);
      pintarBadge(perms.length);
    } catch (err) {
      if (err.isAuth) {
        toast(t("Credencial caducada: vuelve a emparejar"));
        navigate("/setup");
      } else {
        loading.textContent = err.message || t("Error cargando sesiones");
      }
    }
  }

  const newBtn = h(
    "button",
    { class: "fab", onClick: () => {
        newPanel.hidden = !newPanel.hidden;
        if (!newPanel.hidden) dirInput.focus();
      } },
    "+"
  );
  root.append(newBtn);

  // directorio por defecto: ultimo usado, si no, el cwd del servidor
  dirInput.value = localStorage.getItem(LAST_DIR_KEY) || "";
  if (!dirInput.value) {
    Client.location()
      .then((l) => {
        if (l?.directory) dirInput.value = l.directory;
      })
      .catch(() => {});
  }

  await refresh();
  // un solo intervalo (10 s): refresco unificado de lista + badge
  const iv = setInterval(() => {
    if (!document.hidden) refresh();
  }, 10000);
  signal.addEventListener("abort", () => clearInterval(iv));

  // Ctrl/Cmd+K enfoca el buscador (solo escritorio); Escape lo limpia
  const quitarAtajos = registrarAtajos({
    buscar: () => {
      buscar.focus();
      buscar.select?.();
    },
    cerrar: () => {
      if (!buscar.value) return;
      buscar.value = "";
      pintarLista(todas);
    },
  });
  signal.addEventListener("abort", quitarAtajos);
}
