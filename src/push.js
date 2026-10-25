/* Web Push real (VAPID): avisos con la app CERRADA.
 *
 * POR QUE HACE FALTA UN SERVICIO (y no basta el SW):
 *   Una notificacion "local" (notify.js) solo puede dispararse desde codigo que
 *   este corriendo. Con la app cerrada no corre nada, asi que el unico camino
 *   real es Web Push: el NAVEGADOR mantiene un canal con su servicio push
 *   (FCM/APNs/Mozilla) y ese canal lo despierta quien tenga la clave. Ese quien
 *   es server/push-server.mjs, que corre junto a opencode en tu PC.
 *
 * REPARTO DE RESPONSABILIDADES:
 *   - Aqui (navegador): pedir permiso, suscribirse, enviar la suscripcion al
 *     servicio y poder darse de baja. NUNCA se guarda la clave privada VAPID.
 *   - Servicio (Node): guarda las suscripciones, vigila los permisos pendientes
 *     de opencode y envia el push.
 *
 * REQUISITOS (honestidad):
 *   - Contexto seguro: HTTPS o localhost. En LAN por http NO existe PushManager.
 *   - iOS 16.4+: solo si la PWA esta INSTALADA en la pantalla de inicio.
 */
import { contextoInseguro, esIOS, esInstalada } from "./notify.js";
import { loadConfig } from "./config.js";

const KEY_URL = "ocmovil.pushUrl";

/* ¿El navegador puede usar Web Push en este contexto? */
export function pushCapacidad() {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return { puede: false, motivo: "no-soportado" };
    }
    if (contextoInseguro()) return { puede: false, motivo: "inseguro" };
    if (esIOS() && !esInstalada()) return { puede: false, motivo: "ios-no-instalada" };
    return { puede: true, motivo: null };
  } catch {
    return { puede: false, motivo: "no-soportado" };
  }
}

/* URL del servicio push (se configura en Ajustes). Vacio = no configurado. */
export function getPushUrl() {
  try {
    return localStorage.getItem(KEY_URL) || "";
  } catch {
    return "";
  }
}

export function setPushUrl(url) {
  try {
    const limpia = String(url || "").trim().replace(/\/+$/, "");
    if (limpia) localStorage.setItem(KEY_URL, limpia);
    else localStorage.removeItem(KEY_URL);
    return limpia;
  } catch {
    return "";
  }
}

/* Convierte la clave publica VAPID (base64url) al formato que pide el navegador. */
export function urlBase64ToUint8Array(base64) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function registrarSW() {
  const reg = await navigator.serviceWorker.getRegistration();
  if (reg) return reg;
  return navigator.serviceWorker.ready;
}

/* Cabecera de autenticacion del servicio push: reutiliza la credencial de
   opencode (Basic opencode:<password>). Asi el servicio no necesita otra clave
   y solo responde a quien ya puede controlar opencode. */
function cabeceraAuth() {
  const { password } = loadConfig();
  if (!password) return {};
  return { Authorization: "Basic " + btoa("opencode:" + password) };
}

/* Estado actual: "inactivo" | "activo" | motivo de incapacidad. */
export async function pushEstado() {
  const cap = pushCapacidad();
  if (!cap.puede) return cap.motivo;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = reg ? await reg.pushManager.getSubscription() : null;
    if (!sub) return "inactivo";
    return "activo";
  } catch {
    return "inactivo";
  }
}

/* Activa el push: pide la clave publica al servicio, se suscribe y registra.
   Devuelve { ok } o { ok:false, error }. */
export async function activarPush() {
  const cap = pushCapacidad();
  if (!cap.puede) return { ok: false, error: cap.motivo };
  const base = getPushUrl();
  if (!base) return { ok: false, error: "sin-servicio" };

  try {
    // 1) clave publica VAPID del servicio
    const r = await fetch(base + "/vapid-public-key", { headers: cabeceraAuth() });
    if (!r.ok) return { ok: false, error: "servicio-" + r.status };
    const { publicKey } = await r.json();
    if (!publicKey) return { ok: false, error: "sin-clave" };

    // 2) suscripcion del navegador
    const reg = await registrarSW();
    if (!reg?.pushManager) return { ok: false, error: "no-soportado" };
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    // 3) registrar la suscripcion en el servicio
    const rr = await fetch(base + "/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...cabeceraAuth() },
      body: JSON.stringify(sub.toJSON()),
    });
    if (!rr.ok) return { ok: false, error: "registro-" + rr.status };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}

/* Desactiva el push: se da de baja en el navegador y en el servicio. */
export async function desactivarPush() {
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = reg ? await reg.pushManager.getSubscription() : null;
    if (!sub) return { ok: true };
    const endpoint = sub.endpoint;
    await sub.unsubscribe().catch(() => {});
    const base = getPushUrl();
    if (base) {
      await fetch(base + "/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...cabeceraAuth() },
        body: JSON.stringify({ endpoint }),
      }).catch(() => {});
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}

/* Envia un aviso de PRUEBA a traves del servicio (comprueba el camino entero). */
export async function probarPush() {
  const base = getPushUrl();
  if (!base) return { ok: false, error: "sin-servicio" };
  try {
    const r = await fetch(base + "/test", { method: "POST", headers: cabeceraAuth() });
    if (!r.ok) return { ok: false, error: "test-" + r.status };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}
