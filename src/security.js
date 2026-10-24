/* Seguridad del dispositivo: bloqueo con PIN + cierre automatico.
   - El PIN NUNCA se guarda: PBKDF2-SHA256 (150k iteraciones, salt de 16 B
     aleatorio) y solo se almacena el hash.
   - Cooldown progresivo contra fuerza bruta: >=5 fallos -> 30 s (doblando,
     max 5 min); el contador persiste en localStorage (sobrevive a recargas).
   - Cierre por inactividad (timeout configurable) y a los 30 s de pasar a
     segundo plano.
   - "Borrado de emergencia" si olvida el PIN: borra PIN + credenciales.
   Requiere contexto seguro (https o localhost): en http de LAN no existe
   crypto.subtle -> la app lo degrada con aviso en Ajustes en vez de romper. */
import { h } from "./ui/dom.js";
import { clearConfig } from "./config.js";

const LOCK_KEY = "ocmovil.lock";
const ITER = 150000;

let unlocked = false;
let timerInact = null;
let timerBg = null;
let overlay = null;
let input = null;
let err = null;
let btn = null;
let resolver = null;

export function pinSoportado() {
  try {
    return Boolean(self.crypto && crypto.subtle);
  } catch {
    return false;
  }
}

function loadLock() {
  try {
    return JSON.parse(localStorage.getItem(LOCK_KEY) || "null");
  } catch {
    return null;
  }
}

function saveLock(v) {
  try {
    if (v) localStorage.setItem(LOCK_KEY, JSON.stringify(v));
    else localStorage.removeItem(LOCK_KEY);
  } catch {
    /* sin storage no hay PIN: la app sigue funcionando */
  }
}

export function hasPin() {
  return Boolean(loadLock()?.hash);
}

export function lockCfg() {
  return { timeout: loadLock()?.timeout ?? 10 };
}

export function setTimeoutMin(mins) {
  const l = loadLock();
  if (l) saveLock({ ...l, timeout: mins });
}

/* ---- PBKDF2 ---- */
const b64 = (u8) => btoa(String.fromCharCode(...u8));
const un64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function derive(pin, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: ITER },
    key,
    256
  );
  return new Uint8Array(bits);
}

function igual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a[i] ^ b[i];
  return r === 0;
}

export async function setPin(pin) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(pin, salt);
  saveLock({
    salt: b64(salt),
    hash: b64(hash),
    fails: 0,
    cooldownUntil: 0,
    timeout: lockCfg().timeout,
  });
  // quien acaba de definir el PIN esta presente: queda desbloqueado
  unlocked = true;
  armarInactividad();
}

export async function verifyPin(pin) {
  const lock = loadLock();
  if (!lock?.hash) return { ok: true };
  const ahora = Date.now();
  if (ahora < (lock.cooldownUntil || 0)) {
    return { ok: false, espera: Math.ceil((lock.cooldownUntil - ahora) / 1000) };
  }
  let hash;
  try {
    hash = await derive(pin, un64(lock.salt));
  } catch {
    return { ok: false, error: true };
  }
  if (igual(hash, un64(lock.hash))) {
    saveLock({ ...lock, fails: 0, cooldownUntil: 0 });
    return { ok: true };
  }
  const fails = (lock.fails || 0) + 1;
  const cooldownUntil =
    fails >= 5 ? ahora + Math.min(30 * 2 ** (fails - 5), 300) * 1000 : 0;
  saveLock({ ...lock, fails, cooldownUntil });
  return {
    ok: false,
    fails,
    espera: cooldownUntil ? Math.ceil((cooldownUntil - ahora) / 1000) : 0,
  };
}

export function clearPin() {
  saveLock(null);
  unlocked = false;
  pararTimers();
}

/* ---- overlay de bloqueo ---- */
function construirOverlay() {
  if (overlay) return;
  input = h("input", {
    type: "password",
    inputmode: "numeric",
    maxlength: "12",
    autocomplete: "off",
    spellcheck: "false",
    placeholder: "PIN",
    "aria-label": "PIN del dispositivo",
  });
  err = h("p", { class: "error", hidden: true });
  btn = h("button", { type: "submit" }, "Desbloquear");
  const form = h(
    "form",
    { class: "lock-card" },
    h("div", { class: "logo" }, "OC"),
    h("h2", {}, "Bloqueado"),
    h("p", { class: "hint" }, "Introduce el PIN del dispositivo"),
    input,
    err,
    btn,
    h(
      "button",
      { class: "link-btn", type: "button", onClick: borrarEmergencia },
      "¿Olvidaste el PIN? Borrar datos del dispositivo"
    )
  );
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    intentar();
  });
  overlay = h("div", { class: "lock" }, form);
  document.body.append(overlay);
  setTimeout(() => input?.focus(), 50);
}

async function intentar() {
  if (!pinSoportado()) return;
  btn.disabled = true;
  btn.textContent = "Comprobando…";
  try {
    const r = await verifyPin(input.value);
    if (r.ok) return desbloquear();
    if (r.error) {
      err.textContent = "Error interno comprobando el PIN";
      err.hidden = false;
    } else if (r.espera > 0) {
      err.textContent = `Demasiados intentos: espera ${r.espera} s`;
      err.hidden = false;
      setTimeout(() => {
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Desbloquear";
        }
      }, r.espera * 1000);
      return; // deshabilitado mientras dure el cooldown
    } else {
      err.textContent = `PIN incorrecto (${r.fails}º intento)`;
      err.hidden = false;
    }
    input.value = "";
    input.focus();
    btn.disabled = false;
    btn.textContent = "Desbloquear";
  } catch {
    err.textContent = "Error comprobando el PIN";
    err.hidden = false;
    btn.disabled = false;
    btn.textContent = "Desbloquear";
  }
}

function desbloquear() {
  unlocked = true;
  if (overlay) {
    overlay.remove();
    overlay = null;
  }
  const app = document.getElementById("app");
  if (app) app.inert = false;
  if (resolver) {
    const r = resolver;
    resolver = null;
    r();
  }
  armarInactividad();
}

function borrarEmergencia() {
  if (!confirm("Se borraran el PIN y la contraseña guardada en este dispositivo. ¿Continuar?")) {
    return;
  }
  clearPin();
  clearConfig();
  location.reload();
}

/* ---- bloqueo manual / automatico ---- */
export function lockNow(motivo = "") {
  if (!hasPin() || !pinSoportado()) return;
  unlocked = false;
  pararTimers();
  construirOverlay();
  if (err) {
    err.textContent =
      motivo === "inactividad"
        ? "Bloqueado por inactividad"
        : motivo === "background"
          ? "Bloqueado: la app paso a segundo plano"
          : "";
    err.hidden = !err.textContent;
  }
  if (input) {
    input.value = "";
    input.focus();
  }
  const app = document.getElementById("app");
  if (app) app.inert = true;
}

function armarInactividad() {
  if (!unlocked || !hasPin()) return;
  clearTimeout(timerInact);
  timerInact = setTimeout(
    () => lockNow("inactividad"),
    lockCfg().timeout * 60000
  );
}

function pararTimers() {
  clearTimeout(timerInact);
  clearTimeout(timerBg);
}

/* Llamar en main.js ANTES de arrancar el router: con PIN activo, la app no
   hace ninguna peticion ni pinta datos hasta desbloquear. */
export async function initSecurity() {
  if (!hasPin() || !pinSoportado()) return;
  construirOverlay();
  const app = document.getElementById("app");
  if (app) app.inert = true;
  await new Promise((res) => {
    resolver = res;
  });
}

/* Globales: cualquier toque/tecla reinicia el temporizador de inactividad. */
document.addEventListener("pointerdown", armarInactividad, { passive: true });
document.addEventListener("keydown", armarInactividad, { passive: true });
document.addEventListener("visibilitychange", () => {
  if (!hasPin() || !unlocked) return;
  if (document.hidden) {
    clearTimeout(timerBg);
    timerBg = setTimeout(() => lockNow("background"), 30000);
  } else {
    clearTimeout(timerBg);
    armarInactividad();
  }
});
