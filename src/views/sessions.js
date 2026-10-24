/* Lista de sesiones + creacion de sesion (con agent y modelo alcanzables)
   + badge de PERMISOS pendientes (acceso a /permissions). */
import { h, timeAgo, toast } from "../ui/dom.js";
import { Client } from "../api/client.js";
import { navigate } from "../ui/router.js";

const LAST_DIR_KEY = "ocmovil.lastDir";
const ORDEN_KEY = "ocmovil.ordenSesiones";

export async function sessionsView(_params, root, signal) {
  const permBadge = h("span", { class: "perm-badge", hidden: true }, "0");
  const permBtn = h(
    "button",
    { class: "icon-btn perm-btn", title: "Permisos pendientes", onClick: () => navigate("/permissions") },
    "🛡"
  );
  permBtn.append(permBadge);

  root.append(
    h(
      "header",
      { class: "topbar" },
      h("h1", {}, "Sesiones"),
      permBtn,
      h("button", { class: "icon-btn", title: "Ajustes", onClick: () => navigate("/settings") }, "⚙")
    )
  );

  /* Barra de busqueda + orden. Con 50 sesiones la lista se vuelve inmanejable:
     el filtro es en memoria (sin peticiones) y el orden se recuerda. */
  const buscar = h("input", {
    type: "search",
    class: "buscar",
    placeholder: "Buscar sesión…",
    autocomplete: "off",
    spellcheck: "false",
  });
  const ordenSel = h("select", { class: "orden", title: "Ordenar", "aria-label": "Ordenar sesiones" },
    h("option", { value: "recientes" }, "Recientes"),
    h("option", { value: "antiguas" }, "Antiguas"),
    h("option", { value: "nombre" }, "Nombre")
  );
  const barra = h("div", { class: "lista-barra" }, buscar, ordenSel);
  root.append(barra);

  const newPanel = h("div", { class: "new-panel", hidden: true });
  const dirInput = h("input", {
    type: "text",
    name: "dir",
    placeholder: "C:\\ruta\\del\\proyecto",
    autocomplete: "off",
    spellcheck: "false",
  });
  const createBtn = h("button", { type: "submit" }, "Crear sesión");
  const newForm = h(
    "form",
    { class: "new-form" },
    h("label", {}, "Carpeta del proyecto (en el PC)", dirInput),
    createBtn
  );
  newForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const dir = dirInput.value.trim();
    if (!dir) return toast("Indica la carpeta del proyecto");
    createBtn.disabled = true;
    createBtn.textContent = "Creando…";
    try {
      const created = await Client.createSession(dir);
      const id = created?.data?.id;
      if (!id) throw new Error("Respuesta inesperada al crear la sesión");
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
      toast(err.message || "Error creando la sesión");
      createBtn.disabled = false;
      createBtn.textContent = "Crear sesión";
    }
  });
  newPanel.append(newForm);

  const list = h("ul", { class: "list" });
  const loading = h("p", { class: "hint center" }, "Cargando…");
  const vacio = h(
    "div",
    { class: "empty-state", hidden: true },
    h("p", { class: "empty-title" }, "Todavía no hay sesiones"),
    h("p", { class: "hint" }, "Pulsa + para crear la primera en la carpeta de tu proyecto.")
  );
  root.append(newPanel, loading, vacio, list);

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
  }

  /* Aplica busqueda (nombre/id) + orden elegido. Sin peticiones: se hace sobre
     la lista ya descargada. */
  function filtrarYOrdenar(items) {
    const q = buscar.value.trim().toLowerCase();
    let lista = items;
    if (q) {
      lista = items.filter((s) =>
        `${s.title || ""} ${s.id} ${s.model?.id || ""}`.toLowerCase().includes(q)
      );
    }
    const orden = ordenSel.value;
    const t = (s) => s.time?.updated || s.time?.created || 0;
    const copia = [...lista];
    if (orden === "antiguas") copia.sort((a, b) => t(a) - t(b));
    else if (orden === "nombre")
      copia.sort((a, b) => (a.title || a.id).localeCompare(b.title || b.id));
    else copia.sort((a, b) => t(b) - t(a)); // recientes (por defecto)
    return copia;
  }

  function pintarLista(items) {
    const visibles = filtrarYOrdenar(items);
    const filas = visibles.map((s) => ({
      id: s.id,
      title: s.title || s.id,
      sub: `${timeAgo(s.time?.created || Date.now())}${s.model?.id ? ` · ${s.model.id}` : ""}`,
    }));
    // la firma incluye el filtro para que un cambio de busqueda repinte
    const firma = JSON.stringify([filas, buscar.value, ordenSel.value]);
    if (firma === firmaLista) return; // sin cambios: ni se toca el DOM
    firmaLista = firma;
    vacio.hidden = filas.length > 0;
    if (!filas.length && buscar.value.trim()) {
      // hay busqueda y no hay resultados: mensaje especifico
      vacio.querySelector(".empty-title").textContent = "Sin resultados";
      vacio.querySelector(".hint").textContent = "Prueba con otro texto o borra la búsqueda.";
    } else {
      vacio.querySelector(".empty-title").textContent = "Todavía no hay sesiones";
      vacio.querySelector(".hint").textContent = "Pulsa + para crear la primera en la carpeta de tu proyecto.";
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

  async function refresh() {
    try {
      const [ses, perms] = await Promise.all([
        Client.sessions(50),
        Client.allPendingPermissions(), // best-effort: nunca rechaza
      ]);
      todas = ses?.data || [];
      pintarLista(todas);
      pintarBadge(perms.length);
    } catch (err) {
      if (err.isAuth) {
        toast("Credencial caducada: vuelve a emparejar");
        navigate("/setup");
      } else {
        loading.textContent = err.message || "Error cargando sesiones";
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
}
