/* Tests de las funciones puras (sin navegador).
   Se ejecutan con el runner nativo de Node:  npm test
   Solo se prueban utilidades sin DOM: render de markdown, tiempo relativo y
   las utilidades de rutas del explorador de archivos (clave para que funcione
   con un servidor opencode en Windows, macOS y Linux). */
import { test } from "node:test";
import assert from "node:assert/strict";

import { escapeHtml, renderMarkdown, timeAgo } from "../src/ui/dom.js";
import {
  nombreDe,
  dirPadre,
  separadorDe,
  deducirHome,
  resetHomeCache,
  absoluta,
  rutaAFileUri,
} from "../src/ui/chat-controls.js";
import {
  nombreProyecto,
  proyectosUnicos,
  filtrarSesiones,
  nombresDeProyectos,
} from "../src/ui/sesiones-filtro.js";
import { resolverAtajo } from "../src/ui/atajos.js";
import {
  IDIOMAS,
  DICCIONARIOS,
  t,
  setIdioma,
  getIdioma,
} from "../src/i18n.js";

/* ---------------- escapeHtml ---------------- */
test("escapeHtml neutraliza los caracteres peligrosos", () => {
  assert.equal(escapeHtml('<b>"x" & y</b>'), "&lt;b&gt;&quot;x&quot; &amp; y&lt;/b&gt;");
});

/* ---------------- renderMarkdown ---------------- */
test("renderMarkdown escapa HTML (no permite inyeccion)", () => {
  const out = renderMarkdown("<script>alert(1)</script>");
  assert.ok(!out.includes("<script>"), "no debe quedar <script>");
  assert.ok(out.includes("&lt;script&gt;"));
});

test("renderMarkdown genera bloques de codigo con boton Copiar", () => {
  const out = renderMarkdown("```js\nconst a = 1;\n```");
  assert.ok(out.includes("code-block"));
  assert.ok(out.includes("copy-btn"));
  assert.ok(out.includes("const a = 1;"));
});

test("renderMarkdown respeta el codigo en linea", () => {
  const out = renderMarkdown("usa `npm test` aquí");
  assert.ok(out.includes("<code>npm test</code>"));
});

test("renderMarkdown convierte negritas y listas", () => {
  const out = renderMarkdown("**hola**\n\n- uno\n- dos");
  assert.ok(out.includes("<strong>hola</strong>"));
  assert.ok(out.includes("<ul>") && out.includes("<li>uno</li>"));
});

test("renderMarkdown no rompe con asteriscos dentro de un bloque de codigo", () => {
  const out = renderMarkdown("```\n// * esto no es una lista *\n```");
  assert.ok(!out.includes("<ul>"), "los asteriscos del codigo no deben crear listas");
});

/* ---------------- timeAgo ---------------- */
test("timeAgo describe el tiempo transcurrido", () => {
  const ahora = Date.now();
  assert.equal(timeAgo(ahora), "ahora");
  assert.match(timeAgo(ahora - 5 * 60_000), /^hace 5 min$/);
  assert.match(timeAgo(ahora - 3 * 3_600_000), /^hace 3 h$/);
  assert.match(timeAgo(ahora - 2 * 86_400_000), /^hace 2 d$/);
});

/* ---------------- utilidades de rutas ---------------- */
test("nombreDe extrae el nombre del fichero (ambos separadores)", () => {
  assert.equal(nombreDe("C:\\Users\\yo\\proyecto\\src\\main.js"), "main.js");
  assert.equal(nombreDe("/home/yo/proyecto/src/main.js"), "main.js");
  assert.equal(nombreDe("src\\ui\\dom.js"), "dom.js");
  assert.equal(nombreDe("solo.txt"), "solo.txt");
});

test("dirPadre sube un nivel (ambos separadores)", () => {
  assert.equal(dirPadre("C:\\a\\b\\c"), "C:\\a\\b");
  assert.equal(dirPadre("/home/yo/proyecto"), "/home/yo");
});

test("separadorDe detecta el separador de la ruta", () => {
  assert.equal(separadorDe("C:\\Users\\yo"), "\\");
  assert.equal(separadorDe("/home/yo"), "/");
});

test("rutaAFileUri produce el formato que acepta el servidor (Windows)", () => {
  assert.equal(
    rutaAFileUri("C:\\Users\\yo\\mi proyecto\\main.js"),
    "file:///C:/Users/yo/mi%20proyecto/main.js"
  );
});

test("rutaAFileUri produce el formato POSIX (macOS/Linux)", () => {
  assert.equal(rutaAFileUri("/home/yo/main.js"), "file:///home/yo/main.js");
});

test("deducirHome encuentra el home en rutas Windows (fs/list devuelve relativas)", () => {
  resetHomeCache();
  const entradas = [
    { path: "OneDrive\\Documents\\proyecto\\src\\", type: "directory" },
    { path: "OneDrive\\Documents\\proyecto\\package.json", type: "file" },
  ];
  const home = deducirHome("C:\\Users\\yo\\OneDrive\\Documents\\proyecto", entradas);
  assert.equal(home, "C:\\Users\\yo");
});

test("deducirHome funciona con rutas POSIX", () => {
  resetHomeCache();
  const entradas = [
    { path: "proyecto/src/", type: "directory" },
    { path: "proyecto/README.md", type: "file" },
  ];
  const home = deducirHome("/home/yo/proyecto", entradas);
  assert.equal(home, "/home/yo");
});

test("absoluta reconstruye la ruta completa con el separador correcto", () => {
  assert.equal(absoluta("C:\\Users\\yo", "OneDrive\\Documents\\a.txt"), "C:\\Users\\yo\\OneDrive\\Documents\\a.txt");
  assert.equal(absoluta("/home/yo", "proyecto/src/main.js"), "/home/yo/proyecto/src/main.js");
  // si ya es absoluta, se respeta
  assert.equal(absoluta("C:\\Users\\yo", "D:\\otra\\cosa.txt"), "D:\\otra\\cosa.txt");
  assert.equal(absoluta("/home/yo", "/etc/hosts"), "/etc/hosts");
});

/* ---------------- filtro por proyecto ---------------- */
const SESIONES = [
  { id: "a1", title: "Web de recetas", projectID: "P1", time: { created: 100, updated: 500 } },
  { id: "a2", title: "Refactor carrito", projectID: "P1", time: { created: 200, updated: 300 } },
  { id: "b1", title: "API de tareas", projectID: "P2", time: { created: 300, updated: 900 } },
  { id: "b2", title: "Script backups", projectID: "P2", time: { created: 400, updated: 100 } },
];

test("nombreProyecto usa el nombre, si no la carpeta, si no el id", () => {
  assert.equal(nombreProyecto({ id: "x", name: "Mi proyecto", canonical: "/a/b" }), "Mi proyecto");
  assert.equal(nombreProyecto({ id: "x", canonical: "C:\\ruta\\mi-carpeta" }), "mi-carpeta");
  assert.equal(nombreProyecto({ id: "x", canonical: "/home/yo/proyecto/" }), "proyecto");
  assert.equal(nombreProyecto({ id: "abcdef1234567890" }), "abcdef12");
});

test("proyectosUnicos devuelve los IDs distintos, ordenados y sin vacios", () => {
  assert.deepEqual(proyectosUnicos(SESIONES), ["P1", "P2"]);
  assert.deepEqual(proyectosUnicos([{ id: "x" }, { projectID: null }]), []);
  assert.deepEqual(proyectosUnicos([]), []);
});

test("filtrarSesiones filtra por proyecto", () => {
  const p1 = filtrarSesiones(SESIONES, { proyecto: "P1" });
  assert.deepEqual(p1.map((s) => s.id), ["a1", "a2"]);
  const todos = filtrarSesiones(SESIONES, { proyecto: "*" });
  assert.equal(todos.length, 4);
});

test("filtrarSesiones busca por titulo, id y modelo", () => {
  assert.deepEqual(filtrarSesiones(SESIONES, { texto: "carrito" }).map((s) => s.id), ["a2"]);
  assert.deepEqual(filtrarSesiones(SESIONES, { texto: "b1" }).map((s) => s.id), ["b1"]);
  const conModelo = [{ id: "z", title: "x", model: { id: "claude-sonnet" } }];
  assert.equal(filtrarSesiones(conModelo, { texto: "sonnet" }).length, 1);
});

test("filtrarSesiones ordena por recientes, antiguas y nombre", () => {
  assert.deepEqual(
    filtrarSesiones(SESIONES, { orden: "recientes" }).map((s) => s.id),
    ["b1", "a1", "a2", "b2"]
  );
  assert.deepEqual(
    filtrarSesiones(SESIONES, { orden: "antiguas" }).map((s) => s.id),
    ["b2", "a2", "a1", "b1"]
  );
  assert.deepEqual(
    filtrarSesiones(SESIONES, { orden: "nombre" }).map((s) => s.title),
    ["API de tareas", "Refactor carrito", "Script backups", "Web de recetas"]
  );
});

test("filtrarSesiones combina proyecto + texto + orden", () => {
  const r = filtrarSesiones(SESIONES, { proyecto: "P1", texto: "web", orden: "recientes" });
  assert.deepEqual(r.map((s) => s.id), ["a1"]);
});

test("nombresDeProyectos cae al id corto si el proyecto no esta", () => {
  const ids = ["P1", "P2", "P9"];
  const proyectos = [
    { id: "P1", name: "Uno" },
    { id: "P2", canonical: "/home/yo/dos" },
  ];
  const r = nombresDeProyectos(ids, proyectos);
  assert.equal(r.P1, "Uno");
  assert.equal(r.P2, "dos");
  assert.equal(r.P9, "P9");
});

/* ---------------- atajos de teclado ---------------- */
const ev = (o) => ({ key: "", ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...o });

test("resolverAtajo detecta Ctrl+K y Cmd+K", () => {
  assert.equal(resolverAtajo(ev({ key: "k", ctrlKey: true })), "buscar");
  assert.equal(resolverAtajo(ev({ key: "K", ctrlKey: true })), "buscar");
  assert.equal(resolverAtajo(ev({ key: "k", metaKey: true })), "buscar"); // macOS
});

test("resolverAtajo NO confunde K sola ni con modificadores de mas", () => {
  assert.equal(resolverAtajo(ev({ key: "k" })), null);
  assert.equal(resolverAtajo(ev({ key: "k", ctrlKey: true, shiftKey: true })), null);
  assert.equal(resolverAtajo(ev({ key: "k", ctrlKey: true, altKey: true })), null);
  assert.equal(resolverAtajo(ev({ key: "j", ctrlKey: true })), null);
});

test("resolverAtajo detecta Escape", () => {
  assert.equal(resolverAtajo(ev({ key: "Escape" })), "cerrar");
  assert.equal(resolverAtajo(ev({ key: "esc" })), null); // el navegador manda "Escape"
  assert.equal(resolverAtajo(ev({ key: "Escape", ctrlKey: true })), null);
});

test("resolverAtajo no se rompe con entradas raras", () => {
  assert.equal(resolverAtajo(null), null);
  assert.equal(resolverAtajo(undefined), null);
  assert.equal(resolverAtajo({}), null);
  assert.equal(resolverAtajo({ key: 5 }), null);
});

test("resolverAtajo ignora Enter (lo gestiona el textarea del chat)", () => {
  assert.equal(resolverAtajo(ev({ key: "Enter" })), null);
  assert.equal(resolverAtajo(ev({ key: "Enter", shiftKey: true })), null);
});

/* ---------------- i18n ---------------- */

/* Idiomas que estan traducidos al 100 %. El resto puede estar a medias: las
   claves que falten caen al espanol (nunca dejan un hueco). Cuando un idioma se
   complete, se anade aqui. */
const IDIOMAS_COMPLETOS = ["en", "de"];

/* Un diccionario nuevo debe tener las mismas claves que el ingles, que es el de
   referencia. Sobrar una clave siempre es un error (es una cadena que ya no
   existe en la app); faltarla solo se exige en los idiomas completos, porque una
   traduccion a medias es bienvenida (issue #7). */
test("los diccionarios no tienen claves que no existan en el de referencia", () => {
  const ref = Object.keys(DICCIONARIOS.en).sort();
  for (const { id } of IDIOMAS) {
    if (id === "es") continue; /* el espanol no tiene diccionario: es la fuente */
    const dicc = DICCIONARIOS[id];
    assert.ok(dicc, `falta el diccionario de "${id}"`);
    const claves = Object.keys(dicc).sort();
    const sobran = claves.filter((k) => !ref.includes(k));
    assert.deepEqual(sobran, [], `"${id}": sobran claves`);
    if (IDIOMAS_COMPLETOS.includes(id)) {
      const faltan = ref.filter((k) => !claves.includes(k));
      assert.deepEqual(faltan, [], `"${id}" esta marcado como completo: faltan claves`);
    }
  }
});

/* Los marcadores {n}, {nombre}... se sustituyen al vuelo: si una traduccion los
   pierde o los escribe distinto, el texto sale con el hueco a la vista. */
test("las traducciones conservan los marcadores {x} de la clave", () => {
  const marcadores = (s) => (s.match(/\{\w+\}/g) || []).sort();
  for (const { id } of IDIOMAS) {
    const dicc = DICCIONARIOS[id];
    if (!dicc) continue;
    for (const [clave, valor] of Object.entries(dicc)) {
      assert.deepEqual(
        marcadores(valor),
        marcadores(clave),
        `"${id}" rompe los marcadores de: ${clave}`,
      );
    }
  }
});

test("t() traduce al aleman y deja el espanol como fuente", () => {
  setIdioma("es");
  assert.equal(t("Cerrar"), "Cerrar");
  setIdioma("de");
  assert.equal(t("Cerrar"), "Schließen");
  assert.equal(t("Ajustes"), "Einstellungen");
  setIdioma("es");
});

test("t() cae al texto original si la clave no esta en el diccionario", () => {
  setIdioma("de");
  assert.equal(t("clave que no existe"), "clave que no existe");
  setIdioma("es");
});

test("t() sustituye las variables en cualquier idioma", () => {
  setIdioma("de");
  const out = t("{n} peticiones del agente esperando tu decisión", { n: 7 });
  assert.ok(out.includes("7"), "debe sustituir {n}");
  assert.ok(!out.includes("{n}"), "no debe quedar {n} sin sustituir");
  setIdioma("es");
});

test("setIdioma ignora los idiomas no soportados", () => {
  setIdioma("en");
  assert.equal(setIdioma("xx"), "en");
  assert.equal(getIdioma(), "en");
  setIdioma("es");
});
