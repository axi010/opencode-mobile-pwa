/* Vigilante de permisos: avisa por notificacion cuando el agente pide algo
   y tu NO estas mirando la app.

   Estrategia (y por que):
   - La app ya tiene SSE + badge mientras esta abierta; esto es SOLO para
     cuando no la miras.
   - Al pasar a segundo plano, Android congela la pagina a los ~30 s. Por eso,
     ademas de seguir el ciclo normal, se programa UN chequeo a los ~25 s de
     ocultarse: es la ultima ventana con probabilidad real de notificar.
   - Los ids ya avisados se guardan en localStorage para no repetir el aviso
     entre recargas ni entre el polling y el evento SSE. */
import { Client } from "./api/client.js";
import { notificar, estado } from "./notify.js";
import { loadConfig } from "./config.js";

const VISTOS_KEY = "ocmovil.permVistos";
const INTERVALO = 20000;
const CHEQUEO_BG = 25000;

let vistos = new Set();
let cargado = false;
let timer = null;
let timerBg = null;

function cargarVistos() {
  if (cargado) return;
  cargado = true;
  try {
    const arr = JSON.parse(localStorage.getItem(VISTOS_KEY) || "[]");
    vistos = new Set(Array.isArray(arr) ? arr : []);
  } catch {
    vistos = new Set();
  }
}

function guardarVistos() {
  try {
    // solo se conservan los ultimos 100 para no crecer sin limite
    localStorage.setItem(VISTOS_KEY, JSON.stringify([...vistos].slice(-100)));
  } catch {
    /* best-effort */
  }
}

/* Marca como vistas sin avisar: se usa al abrir la app, para no notificar
   permisos que el usuario esta viendo ya en pantalla. */
export async function marcarPendientesComoVistos() {
  cargarVistos();
  if (!loadConfig().password) return; // sin credenciales no hay nada que marcar
  try {
    const items = await Client.allPendingPermissions();
    let cambio = false;
    for (const p of items) {
      if (!vistos.has(p.id)) {
        vistos.add(p.id);
        cambio = true;
      }
    }
    if (cambio) guardarVistos();
  } catch {
    /* best-effort */
  }
}

export async function chequearPermisos() {
  cargarVistos();
  if (!loadConfig().password) return; // aun sin conectar (p. ej. pantalla setup)
  if (estado() !== "granted") return;
  let items;
  try {
    items = await Client.allPendingPermissions();
  } catch {
    return; // sin red: se reintenta en el siguiente ciclo
  }
  const nuevos = items.filter((p) => !vistos.has(p.id));
  if (!nuevos.length) return;
  for (const p of nuevos) vistos.add(p.id);
  guardarVistos();
  const n = nuevos.length;
  const primero = nuevos[0];
  const cuerpo =
    n === 1
      ? `${primero.action || "permiso"}: ${(primero.resources || []).join(", ").slice(0, 90)}`
      : `${n} peticiones del agente esperando tu decisión`;
  await notificar("OpenCode · permiso pendiente", cuerpo, {
    tag: "ocmovil-permiso",
    onClickUrl: location.origin + location.pathname + "#/permissions",
  });
}

/* Arranca el ciclo: intervalo mientras la app vive + chequeo unico a los ~25 s
   de pasar a segundo plano (la ventana en la que Android aun deja trabajar). */
export function iniciarVigilantePermisos() {
  cargarVistos();
  clearInterval(timer);
  timer = setInterval(() => {
    if (!document.hidden) chequearPermisos();
  }, INTERVALO);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearTimeout(timerBg);
      timerBg = setTimeout(chequearPermisos, CHEQUEO_BG);
    } else {
      clearTimeout(timerBg);
      // al volver: avisar de lo que llego mientras estaba fuera
      chequearPermisos();
    }
  });
}

/* Tras conectar (setup) o cambiar credenciales: empieza a vigilar ya, sin
   esperar al siguiente ciclo ni reiniciar la app. */
export function vigilarDesdeAhora() {
  marcarPendientesComoVistos();
  iniciarVigilantePermisos();
}
