/* Configuracion local (localStorage): URL del servidor + credencial.
   REGLA: la credencial jamas se escribe en el codigo fuente. */
const KEY = "ocmovil.config";

function defaults() {
  // El servidor opencode SOLO escucha en localhost:28894 (nunca en LAN).
  // Si la PWA corre en la IP del PC (192.168.x.x) NO se propone ese endpoint
  // (es inalcanzable y daria "Sin conexión"): baseUrl queda vacio y hay que
  // usar el QR o introducir la URL del tunnel.
  const host = location.hostname;
  const esLocal = host === "localhost" || host === "127.0.0.1";
  return {
    baseUrl: esLocal ? "http://127.0.0.1:28894" : "",
    password: "",
  };
}

export function loadConfig() {
  try {
    return { ...defaults(), ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return defaults();
  }
}

/* true si la app se esta sirviendo desde un origen que puede hacer de proxy
   al API (Vite dev/preview). El modo se ACTIVA de verdad comprobando el
   endpoint en src/api/client.js (detectarProxy), no aqui. */
export function sameOriginDisponible() {
  return location.protocol === "http:" || location.protocol === "https:";
}

export function saveConfig(patch) {
  const cfg = { ...loadConfig(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(cfg));
  return cfg;
}

export function clearConfig() {
  localStorage.removeItem(KEY);
}

/* Params de acceso traidos por el QR (?server/?pair/?token).
   Se leen tanto de la query normal como del HASH (#/setup?server=...),
   que es el formato actual del QR: sobrevive a escaneres que cortan la
   URL en el "&" y a la instalacion como app (el hash no lo toca nadie). */
export function qrParams() {
  const fromSearch = new URLSearchParams(location.search);
  const fromHash = new URLSearchParams(location.hash.split("?")[1] || "");
  const out = {};
  for (const key of ["server", "pair", "token"]) {
    const v = fromSearch.get(key) ?? fromHash.get(key);
    if (v) out[key] = v;
  }
  return out;
}

/* Version TAKE: devuelve los params y LOS RETIRA de la URL de inmediato
   (barra + historial via replaceState, sin conservar la query del hash).
   Llamar en cuanto se hayan copiado a variables: el token/QR no debe
   sobrevivir en la URL aunque el connect falle o el usuario recargue. */
export function consumeQrParams() {
  const params = qrParams();
  if (Object.keys(params).length) {
    const ruta = location.hash.split("?")[0] || "#/setup";
    history.replaceState(null, "", location.pathname + ruta);
  }
  return params;
}

export function isConfigured() {
  return Boolean(loadConfig().password);
}
