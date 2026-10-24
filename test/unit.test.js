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
