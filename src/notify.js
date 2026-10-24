/* Notificaciones locales (sin servidor push).
   ALCANCE REAL (honestidad primero):
   - Requiere permiso del usuario y contexto seguro (https o localhost).
   - En PRIMER plano el SO puede no mostrarlas: ademas del aviso del sistema,
     la app ya muestra un toast.
   - En SEGUNDO plano Android mantiene el service worker unos ~30 s: si el
     permiso llega dentro de esa ventana, se notifica; despues, no (no hay push).
   - iOS (Safari/PWA) NO soporta Notification API en web: queda desactivado.
   El objetivo es avisar del permiso del agente cuando NO estas mirando la app. */

const SOPORTADO = typeof window !== "undefined" && "Notification" in window;

export function notifySoportado() {
  return SOPORTADO;
}

export function contextoInseguro() {
  try {
    return !window.isSecureContext;
  } catch {
    return true;
  }
}

export function estado() {
  if (!SOPORTADO) return "no-soportado";
  if (contextoInseguro()) return "inseguro";
  return Notification.permission; // "default" | "granted" | "denied"
}

export async function pedirPermiso() {
  if (!SOPORTADO) return "no-soportado";
  if (contextoInseguro()) return "inseguro";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    return await Notification.requestPermission();
  } catch {
    return "default";
  }
}

async function viaServiceWorker(titulo, opciones) {
  if (!("serviceWorker" in navigator)) return false;
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return false;
  // Via preferente en Android: mensaje al SW (el listener lo muestra).
  // La pagina puede estar a punto de suspenderse; el SW sigue vivo unos
  // segundos y es quien tiene permiso para mostrar la notificacion.
  const destino = navigator.serviceWorker.controller || reg.active;
  if (destino) {
    destino.postMessage({
      type: "notify",
      title: titulo,
      body: opciones.body,
      tag: opciones.tag,
      url: opciones.data?.url,
    });
    return true;
  }
  if (reg.showNotification) {
    await reg.showNotification(titulo, opciones);
    return true;
  }
  return false;
}

/* Lanza una notificacion si hay permiso. Prioriza el service worker (necesario
   en Android y unico camino si la pestana no esta enfocada); si no hay SW,
   cae al constructor Notification. Devuelve true si se mostro. */
export async function notificar(titulo, cuerpo, { tag, onClickUrl } = {}) {
  if (estado() !== "granted") return false;
  const opciones = {
    body: cuerpo || "",
    tag: tag || "ocmovil",
    renotify: true,
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    data: { url: onClickUrl || location.origin + location.pathname + "#/permissions" },
  };
  try {
    if (await viaServiceWorker(titulo, opciones)) return true;
  } catch {
    /* cae al constructor */
  }
  try {
    new Notification(titulo, opciones);
    return true;
  } catch {
    return false;
  }
}
