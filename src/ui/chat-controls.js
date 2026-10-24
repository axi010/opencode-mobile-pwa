/* Controles de sesion del chat: modo (Plan/Build), modelo + variante y
   adjuntar archivos del PC.
   Contratos verificados contra el servidor real (v2.1.4):
     POST /api/session/{id}/agent  { agent }        -> cambia de modo
     POST /api/session/{id}/model  { model: {id, providerID, variant?} }
     GET  /api/model               -> 133 modelos (117 con variantes)
     GET  /api/agent               -> agentes; solo sirven mode=primary && !hidden
     GET  /api/fs/list?path=<abs>  -> entradas [{path, type}] (rutas relativas al home)
     POST /api/session/{id}/prompt { text, files:[{uri:"file:///C:/...", name}] }
   Los cambios afectan SOLO a la sesion abierta (decision del usuario). */
import { h, toast } from "./dom.js";
import { Client } from "../api/client.js";

const RECIENTES_KEY = "ocmovil.modelosRecientes";
const CARPETA_KEY = "ocmovil.ultimaCarpeta";
const MAX_RECIENTES = 6;
const IGNORAR = /^(node_modules|\.git|\.venv|dist|__pycache__|\.pytest_cache)$/;

/* --- cache del catalogo de modelos (133 entradas; se pide una vez) --- */
let cacheModelos = null;
async function cargarModelos() {
  if (cacheModelos) return cacheModelos;
  const r = await Client.models();
  cacheModelos = (r?.data || []).filter((m) => m.enabled !== false);
  return cacheModelos;
}

function leerRecientes() {
  try {
    const a = JSON.parse(localStorage.getItem(RECIENTES_KEY) || "[]");
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}
function guardarReciente(id, providerID, variant) {
  const clave = `${providerID}/${id}${variant && variant !== "default" ? `#${variant}` : ""}`;
  const lista = [clave, ...leerRecientes().filter((x) => x !== clave)].slice(0, MAX_RECIENTES);
  try {
    localStorage.setItem(RECIENTES_KEY, JSON.stringify(lista));
  } catch {
    /* best-effort */
  }
}

function rutaAFileUri(rutaAbsoluta) {
  // formato verificado: file:///C:/ruta/con/barras
  const conBarras = String(rutaAbsoluta).replace(/\\/g, "/");
  const conPrefijo = conBarras.startsWith("/") ? conBarras : `/${conBarras}`;
  return "file://" + encodeURI(conPrefijo).replace(/#/g, "%23");
}

/* Hoja inferior generica: se cierra al tocar el fondo o con Escape. */
function hojaInferior(titulo, contenido) {
  const cerrar = () => {
    hoja.remove();
    document.removeEventListener("keydown", onKey);
  };
  const onKey = (e) => {
    if (e.key === "Escape") cerrar();
  };
  const hoja = h(
    "div",
    { class: "sheet", onClick: (e) => { if (e.target === hoja) cerrar(); } },
    h("div", { class: "sheet-panel" },
      h("div", { class: "sheet-head" },
        h("span", { class: "sheet-title" }, titulo),
        h("button", { class: "icon-btn", type: "button", onClick: cerrar }, "✕")),
      contenido)
  );
  document.addEventListener("keydown", onKey);
  document.body.append(hoja);
  return { hoja, cerrar };
}

/* ================= FILA DE CONTROLES ================= */
export function crearControles({ sessionID, onArchivos }) {
  const btnPlan = h("button", { type: "button", class: "seg-btn", onClick: () => setModo("plan") }, "Plan");
  const btnBuild = h("button", { type: "button", class: "seg-btn", onClick: () => setModo("build") }, "Build");
  const segModo = h("div", { class: "seg-mini", role: "group", "aria-label": "Modo" }, btnPlan, btnBuild);

  const lblModelo = h("span", { class: "chip-label" }, "modelo…");
  const btnModelo = h("button", {
    type: "button", class: "chip", title: "Modelo y variante",
    onClick: () => abrirModelos(),
  }, lblModelo, h("span", { class: "chip-caret" }, "▾"));

  const btnAdjuntar = h("button", {
    type: "button", class: "chip", title: "Adjuntar archivos del PC",
    onClick: () => abrirArchivos(),
  }, "📎");

  const fila = h("div", { class: "chat-controls" }, segModo, btnModelo, btnAdjuntar);

  /* ---- estado local ---- */
  let modo = null;       // "plan" | "build"
  let modelo = null;     // { id, providerID, variant }

  function pintarModo() {
    btnPlan.setAttribute("aria-pressed", String(modo === "plan"));
    btnBuild.setAttribute("aria-pressed", String(modo === "build"));
  }
  function pintarModelo() {
    if (!modelo) {
      lblModelo.textContent = "modelo…";
      return;
    }
    const v = modelo.variant && modelo.variant !== "default" ? ` · ${modelo.variant}` : "";
    lblModelo.textContent = `${String(modelo.id).split("/").pop()}${v}`;
  }

  async function setModo(nuevo) {
    if (!nuevo || nuevo === modo) return;
    const previo = modo;
    modo = nuevo;
    pintarModo();
    try {
      await Client.setAgent(sessionID, nuevo);
      toast(nuevo === "plan" ? "Modo PLAN (solo lectura)" : "Modo BUILD (puede editar)");
    } catch (err) {
      modo = previo;
      pintarModo();
      toast(err.message || "No se pudo cambiar el modo");
    }
  }

  async function setModelo(id, providerID, variant) {
    const previo = modelo;
    modelo = { id, providerID, variant };
    pintarModelo();
    try {
      await Client.setModel(sessionID, { id, providerID, ...(variant ? { variant } : {}) });
      guardarReciente(id, providerID, variant);
      toast(`Modelo: ${id}${variant && variant !== "default" ? ` (${variant})` : ""}`);
    } catch (err) {
      modelo = previo;
      pintarModelo();
      toast(err.message || "No se pudo cambiar el modelo");
    }
  }

  /* ---------- hoja de MODELOS ---------- */
  async function abrirModelos() {
    const cuerpo = h("div", { class: "sheet-body" }, h("p", { class: "hint" }, "Cargando modelos…"));
    const { hoja } = hojaInferior("Modelo y variante", cuerpo);

    let modelos;
    try {
      modelos = await cargarModelos();
    } catch (err) {
      cuerpo.textContent = "";
      cuerpo.append(h("p", { class: "error" }, err.message || "No se pudo cargar el catálogo"));
      return;
    }

    const buscador = h("input", {
      type: "search", placeholder: "Buscar modelo o proveedor…",
      autocomplete: "off", spellcheck: "false",
    });
    const lista = h("div", { class: "model-list" });
    cuerpo.textContent = "";
    cuerpo.append(buscador, lista);

    function pintar(filtro) {
      lista.textContent = "";
      const q = (filtro || "").trim().toLowerCase();
      const recientes = leerRecientes();
      const coincide = (m) => {
        if (!q) return true;
        return `${m.providerID}/${m.id} ${m.name || ""}`.toLowerCase().includes(q);
      };
      const visibles = modelos.filter(coincide);

      // atajos: recientes (solo sin filtro)
      if (!q && recientes.length) {
        lista.append(h("div", { class: "model-group" }, "Recientes"));
        for (const clave of recientes) {
          const [prov, resto] = clave.split("/");
          const [id, variant] = (resto || "").split("#");
          const m = modelos.find((x) => x.providerID === prov && x.id === id);
          if (m) lista.append(filaModelo(m, variant));
        }
      }

      const porProveedor = new Map();
      for (const m of visibles) {
        if (!porProveedor.has(m.providerID)) porProveedor.set(m.providerID, []);
        porProveedor.get(m.providerID).push(m);
      }
      for (const [prov, items] of [...porProveedor.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
        lista.append(h("div", { class: "model-group" }, `${prov} (${items.length})`));
        for (const m of items.slice(0, 60)) lista.append(filaModelo(m));
      }
      if (!lista.children.length) {
        lista.append(h("p", { class: "hint center" }, "Sin resultados"));
      }
    }

    function filaModelo(m, variantForzada) {
      const actual = modelo && modelo.id === m.id && modelo.providerID === m.providerID;
      const variantes = (m.variants || []).map((v) => v.id);
      const fila = h("div", { class: "model-row" },
        h("button", {
          type: "button", class: "model-pick",
          onClick: () => {
            if (variantes.length > 1 && !variantForzada) {
              // con variantes: desplegar subselector en la misma fila
              const sub = fila.querySelector(".model-variants");
              if (sub) { sub.hidden = !sub.hidden; return; }
              const sub2 = h("div", { class: "model-variants" },
                h("button", { type: "button", class: "var-btn", onClick: () => elegir(m, null) }, "por defecto"),
                ...variantes.map((v) =>
                  h("button", { type: "button", class: "var-btn", onClick: () => elegir(m, v) }, v)));
              fila.append(sub2);
              return;
            }
            elegir(m, variantForzada && variantForzada !== "default" ? variantForzada : null);
          },
        },
          h("span", { class: "model-name" }, m.name || m.id),
          h("span", { class: "model-id" }, `${m.id}${variantes.length > 1 ? ` · ${variantes.length} variantes` : ""}`),
          actual ? h("span", { class: "model-actual" }, "✓") : null)
      );
      return fila;
    }

    async function elegir(m, variant) {
      hoja.remove();
      await setModelo(m.id, m.providerID, variant);
    }

    buscador.addEventListener("input", () => pintar(buscador.value));
    pintar("");
    setTimeout(() => buscador.focus(), 60);
  }

  /* ---------- hoja de ARCHIVOS ---------- */
  async function abrirArchivos() {
    // Raiz: la CARPETA DE LA SESION (el proyecto), no la location del servidor.
    let raiz = "";
    try {
      const det = await Client.getSession(sessionID);
      raiz = det?.data?.location?.directory || "";
    } catch {
      /* fallback abajo */
    }
    if (!raiz) {
      try {
        const loc = await Client.location();
        raiz = loc?.directory || loc?.data?.directory || "";
      } catch {
        /* sin raiz: se muestra vacio */
      }
    }

    const migas = h("div", { class: "crumbs" });
    const fuera = h("div", { class: "aviso-fuera", hidden: true },
      "⚠ Estás fuera de la carpeta del proyecto: revisa la ruta antes de adjuntar.");
    const lista = h("div", { class: "file-list" });
    const cuerpo = h("div", { class: "sheet-body" }, migas, fuera, lista);
    const { hoja } = hojaInferior("Adjuntar archivos del PC", cuerpo);

    let dir = raiz;
    let home = ""; // prefijo de las rutas que devuelve fs/list (relativas al home)
    const elegidos = [];

    function pintarMigas() {
      migas.textContent = "";
      migas.append(h("button", { type: "button", class: "ghost mini", onClick: () => navegar(dirPadre(dir)) }, "⇧"));
      migas.append(h("span", { class: "crumb" }, dir || "(sin carpeta)"));
    }

    async function navegar(nuevaRuta) {
      lista.textContent = "";
      lista.append(h("p", { class: "hint center" }, "Cargando…"));
      const ruta = String(nuevaRuta).replace(/[\\/]+$/, "") || nuevaRuta; // sin barra final
      try {
        const r = await Client.fsList(ruta);
        dir = ruta;
        try {
          localStorage.setItem(CARPETA_KEY, ruta);
        } catch {
          /* best-effort */
        }
        // fs/list devuelve rutas relativas al HOME (p. ej. "Documents/mi-proyecto/").
        // Se deduce el prefijo comparando la ruta pedida con la devuelta: la parte
        // que no aparece en las entradas es el home.
        const entradasCrudas = r?.data || [];
        home = deducirHome(ruta, entradasCrudas);
        pintarMigas();
        fuera.hidden = !raiz || ruta.toLowerCase().startsWith(String(raiz).toLowerCase());
        lista.textContent = "";
        const entradas = entradasCrudas
          .map((e) => ({ ...e, abs: home ? `${home}\\${e.path.replace(/^\//, "")}` : e.path }))
          .filter((e) => !IGNORAR.test(nombreDe(e.path)))
          .sort((a, b) => (a.type === b.type ? nombreDe(a.path).localeCompare(nombreDe(b.path)) : a.type === "directory" ? -1 : 1));
        for (const e of entradas) lista.append(filaEntrada(e));
        if (!entradas.length) lista.append(h("p", { class: "hint center" }, "Carpeta vacía"));
      } catch (err) {
        lista.textContent = "";
        lista.append(h("p", { class: "error" }, err.message || "No se pudo abrir la carpeta"));
      }
    }

    function filaEntrada(e) {
      const esDir = e.type === "directory";
      const nombre = nombreDe(e.path) || e.path;
      const yaElegido = elegidos.includes(e.abs);
      const btn = h("button", { type: "button", class: `file-row${esDir ? " dir" : ""}` },
        h("span", { class: "file-ico" }, esDir ? "📁" : "📄"),
        h("span", { class: "file-name" }, nombre),
        !esDir && yaElegido ? h("span", { class: "file-check" }, "✓") : null);
      btn.addEventListener("click", () => {
        if (esDir) {
          navegar(e.abs);
        } else {
          const i = elegidos.indexOf(e.abs);
          if (i === -1) elegidos.push(e.abs);
          else elegidos.splice(i, 1);
          pintarMigas();
          lista.textContent = "";
          // repintar el estado de la lista actual
          navegar(dir);
        }
      });
      return btn;
    }

    const barra = h("div", { class: "sheet-foot" },
      h("span", { class: "hint" }, "Elige los archivos del PC y pulsa Adjuntar"),
      h("button", {
        type: "button", class: "ghost",
        onClick: () => {
          if (!elegidos.length) return toast("No has elegido ningún archivo");
          onArchivos(elegidos.map((p) => ({ uri: rutaAFileUri(p), name: nombreDe(p) })));
          hoja.remove();
        },
      }, "Adjuntar"));
    cuerpo.append(barra);

    // retomar donde lo dejaste (si la carpeta ya no existe, se cae a la raiz)
    let inicio = raiz;
    try {
      const guardada = localStorage.getItem(CARPETA_KEY);
      if (guardada) inicio = guardada;
    } catch {
      /* best-effort */
    }
    pintarMigas();
    try {
      await navegar(inicio);
      if (!lista.querySelector(".file-row")) await navegar(raiz);
    } catch {
      await navegar(raiz);
    }
  }

  /* ---------- API publica del control ---------- */
  return {
    fila,
    /* Lee el estado real de la sesion (agente y modelo) */
    async sincronizar() {
      try {
        const r = await Client.getSession(sessionID);
        const d = r?.data || {};
        modo = d.agent || null;
        modelo = d.model || null;
        pintarModo();
        pintarModelo();
      } catch {
        pintarModo();
        pintarModelo();
      }
    },
  };
}

/* ---- utilidades de rutas ---- */
function nombreDe(p) {
  const s = String(p).replace(/[\\/]+$/, "");
  const i = Math.max(s.lastIndexOf("\\"), s.lastIndexOf("/"));
  return i === -1 ? s : s.slice(i + 1);
}
function dirPadre(p) {
  const s = String(p).replace(/[\\/]+$/, "");
  const i = Math.max(s.lastIndexOf("\\"), s.lastIndexOf("/"));
  return i <= 2 ? s : s.slice(0, i);
}
/* fs/list devuelve rutas RELATIVAS al home del usuario (p. ej.
   "Documents/mi-proyecto/src/"). Para reconstruir la absoluta
   hay que saber el home, y se deduce una sola vez: las entradas cuelgan de
   la carpeta pedida, asi que su prefijo comun es la parte de la ruta pedida
   que queda por debajo del home. */
let homeCache = "";
function deducirHome(rutaPedida, entradas) {
  if (homeCache) return homeCache;
  const norm = (s) => String(s).replace(/\//g, "\\").replace(/\\+$/, "");
  const pedida = norm(rutaPedida);
  const paths = entradas.map((e) => norm(e.path)).filter(Boolean);
  if (!paths.length) return "";
  // prefijo comun (sin distinguir mayusculas) de todas las entradas
  let pref = paths[0];
  for (const p of paths) {
    let i = 0;
    while (i < pref.length && i < p.length && pref[i].toLowerCase() === p[i].toLowerCase()) i++;
    pref = pref.slice(0, i);
  }
  // se recorta el ultimo segmento parcial -> queda la carpeta relativa al home
  const relDir = pref.slice(0, Math.max(0, pref.lastIndexOf("\\")));
  if (!relDir) {
    homeCache = pedida; // la carpeta pedida ES el home
    return homeCache;
  }
  const sufijo = "\\" + relDir;
  if (pedida.toLowerCase().endsWith(sufijo.toLowerCase())) {
    homeCache = pedida.slice(0, pedida.length - sufijo.length);
    return homeCache;
  }
  return "";
}
/* reconstruye la absoluta de una entrada a partir del home deducido */
function absoluta(home, p) {
  const s = String(p).replace(/[\\/]+$/, "");
  if (/^[A-Za-z]:/.test(s)) return s;
  return home ? `${home}\\${s.replace(/^\//, "")}` : s;
}
