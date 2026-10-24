/* Genera un QR de acceso rapido para la PWA opencode-mobile.
   El QR codifica: <PWA>/#/setup?server=<url>&token=<token>
   -> al escanearlo, el movil abre la PWA y conecta SOLO (token ya canjeado,
      valido 30 dias). Los params van en el HASH: sobreviven a escaneres
      que cortan la URL en el "&" y a la instalacion como app.

   Modo alternativo (--pair): genera el QR con un codigo de pairing de un
   solo uso (~5 min), mas seguro pero con riesgo de que caduque antes de
   escanearlo:
     node scripts/qr-pairing.mjs --pair [pwaUrl]

   Uso:
     node scripts/qr-pairing.mjs [pwaUrl] [salida.png]
   Ejemplo:
     node scripts/qr-pairing.mjs http://192.168.1.50:5173

   Requisitos: el CLI de opencode instalado (Desktop o `opencode` en el PATH).
   Se busca en las rutas tipicas de Windows, macOS y Linux; tambien se puede
   forzar con la variable de entorno OPENCODE_CLI.

   Notas de seguridad:
   - La contraseña del servidor NUNCA se escribe en ficheros: se lee del CLI
     de opencode y se usa solo en memoria.
   - El QR contiene un token valido 30 dias (equivalente a la contraseña):
     tratalo como un secreto. Compártelo solo con tus dispositivos. */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import QRCode from "qrcode";

/* Localiza el CLI de opencode en Windows, macOS y Linux. */
function encontrarCli() {
  if (process.env.OPENCODE_CLI && existsSync(process.env.OPENCODE_CLI)) {
    return process.env.OPENCODE_CLI;
  }
  const home = os.homedir();
  const candidatos = [];
  if (process.platform === "win32") {
    const local = process.env.LOCALAPPDATA || path.join(home, "AppData", "Local");
    const prog = process.env.ProgramFiles || "C:\\Program Files";
    const prog86 = process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)";
    candidatos.push(
      path.join(local, "Programs", "@opencode-aidesktop", "resources", "opencode-cli.exe"),
      path.join(local, "Programs", "opencode", "opencode-cli.exe"),
      path.join(prog, "opencode", "opencode-cli.exe"),
      path.join(prog86, "opencode", "opencode-cli.exe")
    );
  } else if (process.platform === "darwin") {
    candidatos.push(
      "/Applications/OpenCode.app/Contents/Resources/opencode-cli",
      path.join(home, "Applications", "OpenCode.app", "Contents", "Resources", "opencode-cli"),
      "/usr/local/bin/opencode",
      "/opt/homebrew/bin/opencode"
    );
  } else {
    candidatos.push(
      "/usr/local/bin/opencode",
      "/usr/bin/opencode",
      "/opt/opencode/opencode",
      path.join(home, ".local", "bin", "opencode")
    );
  }
  for (const c of candidatos) if (existsSync(c)) return c;
  // ultimo recurso: confiar en el PATH
  return process.platform === "win32" ? "opencode-cli" : "opencode";
}

const CLI = encontrarCli();

function cli(...args) {
  return execFileSync(CLI, args, { encoding: "utf8", timeout: 20000 }).trim();
}

function basicAuth(password) {
  return "Basic " + Buffer.from("opencode:" + password).toString("base64");
}

/* URL por defecto de la PWA: la del host local, sin IP fija personal.
   Si no se pasa argumento se usa http://localhost:5173 (dev server por defecto). */
function urlPwaPorDefecto() {
  return "http://localhost:5173";
}

async function main() {
  const args = process.argv.slice(2);
  const soloPair = args.includes("--pair"); // codigo de 1 uso en vez de token
  const rest = args.filter((a) => !a.startsWith("--"));
  const pwa = (rest[0] || urlPwaPorDefecto()).replace(/\/+$/, "");
  const out = rest[1] || path.join(os.tmpdir(), "opencode", "qr-pairing.png");

  // 1) password + endpoint locales (sin exponer nada en disco)
  const password = cli("service", "get", "password");
  const base = cli("service", "status"); // http://127.0.0.1:28894
  const headers = { authorization: basicAuth(password), Accept: "application/json" };

  // 2) URL de servidor preferente para el movil: el tunnel (si existe)
  let server = base;
  try {
    const info = await (await fetch(`${base}/api/info`, { headers })).json();
    server = (info.urls || []).find((u) => u.startsWith("https://")) || base;
  } catch {
    /* si falla, se usa localhost (solo sirve desde el propio PC) */
  }

  // 3) crear el codigo de acceso (en el flujo normal se canjea YA por un
  //    token de 30 dias; con --pair se deja el codigo de 1 uso en el QR)
  const res = await fetch(`${base}/api/pair`, { method: "POST", headers });
  if (!res.ok) throw new Error(`POST /api/pair -> HTTP ${res.status}`);
  const data = await res.json();
  const code = data.code || data?.data?.code;
  if (!code) throw new Error("Respuesta de /api/pair sin codigo: " + JSON.stringify(data));

  // 4) URL final codificada en el QR
  let url;
  if (soloPair) {
    url = `${pwa}/#/setup?server=${encodeURIComponent(server)}&pair=${encodeURIComponent(code)}`;
    console.log("AVISO: el codigo caduca en ~5 minutos y sirve una sola vez.");
  } else {
    // canjear el codigo YA por un token largo (localhost, sin CORS)
    const redeemRes = await fetch(`${base}/auth/connect/${code}`, {
      headers: { Accept: "application/json" },
    });
    if (!redeemRes.ok) throw new Error(`GET /auth/connect/<code> -> HTTP ${redeemRes.status}`);
    const redeemed = await redeemRes.json();
    const token = redeemed.token || redeemed?.data?.token;
    if (!token) throw new Error("Canje sin token: " + JSON.stringify(redeemed));
    url = `${pwa}/#/setup?server=${encodeURIComponent(server)}&token=${encodeURIComponent(token)}`;
    console.log("Token precanjeado: valido ~30 dias, sin caducidad rapida.");
  }

  // 5) generar el QR
  mkdirSync(path.dirname(out), { recursive: true });
  await QRCode.toFile(out, url, {
    width: 520,
    margin: 2,
    color: { dark: "#0d1117", light: "#ffffff" },
  });

  console.log("QR generado:", out);
  console.log("PWA:", pwa);
  console.log("Servidor:", server);
  console.log("URL completa (respaldo para pegar a mano si el QR falla):");
  console.log("  " + url);
  console.log("El QR contiene credenciales: no lo compartas publicamente.");
}

main().catch((err) => {
  console.error("FALLO:", err.message);
  process.exit(1);
});
