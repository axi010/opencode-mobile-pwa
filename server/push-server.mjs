#!/usr/bin/env node
/* ============================================================================
 *  Servicio de Web Push para OpenCode Movil
 * ============================================================================
 *
 *  QUE HACE Y POR QUE EXISTE
 *  -------------------------
 *  Las notificaciones "locales" de la PWA solo funcionan mientras algo de la
 *  app este corriendo (unos ~30 s tras ocultarla). Para avisar con la app
 *  CERRADA hace falta Web Push: el navegador mantiene un canal con su servicio
 *  push (FCM en Android, APNs en iOS, Mozilla en Firefox) y alguien con la
 *  clave VAPID debe despertarlo. Ese "alguien" es este proceso.
 *
 *  Corre en TU PC, junto a opencode. No depende de ningun tercero: solo habla
 *  con el servidor opencode local y con el servicio push del navegador.
 *
 *  USO
 *  ---
 *    node server/push-server.mjs                 # arranca (genera claves si no hay)
 *    node server/push-server.mjs --gen-keys      # solo genera e imprime las claves
 *    node server/push-server.mjs --test          # envia un aviso de prueba y sale
 *
 *  Variables de entorno (opcionales):
 *    PORT            puerto de escucha            (por defecto 8099)
 *    OPENCODE_URL    URL del servidor opencode    (por defecto http://127.0.0.1:28894)
 *    OPENCODE_PASS   contrasena de opencode       (si no, se lee de la config)
 *    PUSH_INTERVAL   segundos entre comprobaciones (por defecto 20)
 *
 *  DEPENDENCIA: web-push  ->  npm i web-push
 * ========================================================================== */

import { createServer } from "node:http";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(__dirname, "..");
/* Las claves y suscripciones son SECRETAS: se guardan fuera del repo. */
const DIR_DATOS = join(homedir(), ".opencode-mobile");
const F_KEYS = join(DIR_DATOS, "vapid.json");
const F_SUBS = join(DIR_DATOS, "suscripciones.json");

const PORT = Number(process.env.PORT || 8099);
const OPENCODE_URL = process.env.OPENCODE_URL || "http://127.0.0.1:28894";
const INTERVALO = Number(process.env.PUSH_INTERVAL || 20) * 1000;

/* ---------- dependencia opcional (con mensaje claro si falta) ---------- */
let webpush;
try {
  webpush = (await import("web-push")).default;
} catch {
  console.error(
    "\n  Falta la dependencia 'web-push'.\n" +
      "  Instalala con:  npm i web-push\n"
  );
  process.exit(1);
}

/* ---------- utilidades de fichero ---------- */
function asegurarDir() {
  if (!existsSync(DIR_DATOS)) mkdirSync(DIR_DATOS, { recursive: true });
}
function leerJSON(f, def) {
  try {
    return JSON.parse(readFileSync(f, "utf8"));
  } catch {
    return def;
  }
}
function escribirJSON(f, o) {
  asegurarDir();
  writeFileSync(f, JSON.stringify(o, null, 2), { mode: 0o600 });
}

/* ---------- claves VAPID ---------- */
function cargarClaves() {
  let k = leerJSON(F_KEYS, null);
  if (!k?.publicKey || !k?.privateKey) {
    k = webpush.generateVAPIDKeys();
    escribirJSON(F_KEYS, k);
    console.log(`  Claves VAPID generadas en ${F_KEYS}`);
  }
  return k;
}

/* ---------- suscripciones ---------- */
const subs = new Map(); // endpoint -> suscripcion
function cargarSubs() {
  const arr = leerJSON(F_SUBS, []);
  for (const s of arr) if (s?.endpoint) subs.set(s.endpoint, s);
}
function guardarSubs() {
  escribirJSON(F_SUBS, [...subs.values()]);
}

/* ---------- credencial de opencode (Basic opencode:<pass>) ---------- */
function leerPassOpencode() {
  if (process.env.OPENCODE_PASS) return process.env.OPENCODE_PASS;
  // misma config que usa la CLI de opencode
  const f = join(homedir(), ".config", "opencode", "service.json");
  const o = leerJSON(f, null);
  return o?.password || "";
}
const PASS = leerPassOpencode();
const AUTH_OK = "Basic " + Buffer.from("opencode:" + PASS).toString("base64");

/* ---------- avisos ya enviados (para no repetir) ---------- */
const avisados = new Set();

/* ---------- envio ---------- */
async function enviarATodos(payload) {
  const cuerpo = JSON.stringify(payload);
  let ok = 0;
  const muertas = [];
  for (const sub of subs.values()) {
    try {
      await webpush.sendNotification(sub, cuerpo);
      ok++;
    } catch (e) {
      // 404/410 = suscripcion caducada: se limpia
      if (e?.statusCode === 404 || e?.statusCode === 410) muertas.push(sub.endpoint);
    }
  }
  for (const ep of muertas) subs.delete(ep);
  if (muertas.length) guardarSubs();
  return { ok, muertas: muertas.length };
}

/* ---------- vigilancia de permisos de opencode ---------- */
async function permisosPendientes() {
  const r = await fetch(`${OPENCODE_URL}/api/permission/request`, {
    headers: { Authorization: AUTH_OK },
  });
  if (!r.ok) throw new Error("opencode " + r.status);
  const j = await r.json();
  return j?.data || [];
}

async function vigilar() {
  if (!PASS) return; // sin credencial no se puede consultar
  let items;
  try {
    items = await permisosPendientes();
  } catch {
    return; // sin red: se reintenta en el siguiente ciclo
  }
  const nuevos = items.filter((p) => p.id && !avisados.has(p.id));
  if (!nuevos.length) return;
  for (const p of nuevos) avisados.add(p.id);
  // el set no debe crecer sin limite
  if (avisados.size > 500) avisados.clear();

  const n = nuevos.length;
  const primero = nuevos[0];
  const cuerpo =
    n === 1
      ? `${primero.action || "permiso"}: ${(primero.resources || []).join(", ").slice(0, 120)}`
      : `${n} peticiones del agente esperando tu decision`;
  const r = await enviarATodos({
    title: "OpenCode · permiso pendiente",
    body: cuerpo,
    tag: "ocmovil-permiso",
    url: "/#/permissions",
  });
  console.log(`  aviso enviado a ${r.ok} dispositivo(s)` + (r.muertas ? `, ${r.muertas} caducadas` : ""));
}

/* ---------- servidor HTTP ---------- */
function json(res, code, o) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(o));
}
function cuerpo(req) {
  return new Promise((resolve) => {
    let d = "";
    req.on("data", (c) => (d += c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(d || "{}"));
      } catch {
        resolve({});
      }
    });
  });
}

const servidor = createServer(async (req, res) => {
  // CORS: la PWA puede estar en otro origen (tunel/LAN)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.writeHead(204).end();

  const url = new URL(req.url, "http://x");
  const ruta = url.pathname;
  const autorizado = req.headers.authorization === AUTH_OK;

  try {
    // la clave PUBLICA es publica por diseno (el navegador la necesita)
    if (ruta === "/vapid-public-key" && req.method === "GET") {
      return json(res, 200, { publicKey: claves.publicKey });
    }
    if (!autorizado) return json(res, 401, { error: "no autorizado" });

    if (ruta === "/health") return json(res, 200, { ok: true, subs: subs.size });

    if (ruta === "/subscribe" && req.method === "POST") {
      const s = await cuerpo(req);
      if (!s?.endpoint) return json(res, 400, { error: "suscripcion invalida" });
      subs.set(s.endpoint, s);
      guardarSubs();
      console.log(`  + dispositivo suscrito (total ${subs.size})`);
      return json(res, 200, { ok: true });
    }
    if (ruta === "/unsubscribe" && req.method === "POST") {
      const { endpoint } = await cuerpo(req);
      if (endpoint) subs.delete(endpoint);
      guardarSubs();
      console.log(`  - dispositivo dado de baja (total ${subs.size})`);
      return json(res, 200, { ok: true });
    }
    if (ruta === "/test" && req.method === "POST") {
      const r = await enviarATodos({
        title: "OpenCode Movil",
        body: "Prueba: asi se vera el aviso de un permiso pendiente.",
        tag: "ocmovil-prueba",
        url: "/#/permissions",
      });
      return json(res, 200, { ok: true, ...r });
    }
    return json(res, 404, { error: "no encontrado" });
  } catch (e) {
    return json(res, 500, { error: String(e?.message || e) });
  }
});

/* ---------- arranque ---------- */
const claves = cargarClaves();
webpush.setVapidDetails("mailto:opencode-mobile@localhost", claves.publicKey, claves.privateKey);
cargarSubs();

if (process.argv.includes("--gen-keys")) {
  console.log("\n  Clave publica : " + claves.publicKey);
  console.log("  Clave privada : " + claves.privateKey);
  console.log(`\n  Guardadas en ${F_KEYS} (no las subas a ningun sitio).\n`);
  process.exit(0);
}

if (process.argv.includes("--test")) {
  const r = await enviarATodos({
    title: "OpenCode Movil",
    body: "Prueba desde la linea de comandos.",
    tag: "ocmovil-prueba",
    url: "/#/permissions",
  });
  console.log(`\n  Enviado a ${r.ok} dispositivo(s).\n`);
  process.exit(0);
}

servidor.listen(PORT, () => {
  console.log("\n  Servicio de Web Push para OpenCode Movil");
  console.log(`  escuchando en http://127.0.0.1:${PORT}`);
  console.log(`  opencode en ${OPENCODE_URL}`);
  console.log(`  dispositivos suscritos: ${subs.size}`);
  console.log(`  comprobando permisos cada ${INTERVALO / 1000} s`);
  if (!PASS) console.log("\n  AVISO: no encontre la contrasena de opencode (OPENCODE_PASS o service.json).");
  console.log("\n  Para que el movil pueda alcanzarlo, exponlo con un tunel https");
  console.log("  (el mismo que uses para la PWA) y pon esa URL en Ajustes -> Notificaciones.\n");
});

setInterval(vigilar, INTERVALO);
vigilar();
