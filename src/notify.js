/* Notificaciones locales (sin servidor push propio).
   ALCANCE REAL por plataforma (honestidad primero):
   - Requiere permiso del usuario y contexto seguro (https o localhost).
   - Android/escritorio: el service worker aguanta unos ~30 s tras ocultar la
     app; si el permiso llega en esa ventana, se notifica.
   - **iOS 16.4+**: SÍ soporta notificaciones, pero SOLO si la PWA esta
     INSTALADA en la pantalla de inicio ("Anadir a inicio"). Desde una pestana
     de Safari, `Notification` existe pero el permiso siempre se deniega.
     Apple tampoco permite despertar la app en segundo plano (no hay push sin
     servidor), asi que el aviso solo llega con la app recien ocultada.
   - iOS tambien soporta Web Push (Push API) desde 16.4 si esta instalada, pero
     necesitaria un servidor push; aqui no se usa. */

const SOPORTADO = typeof window !== "undefined" && "Notification" in window;

/* iOS/iPadOS (incluye iPad moderno que se identifica como Mac). */
export function esIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  // iPadOS 13+ se identifica como "Macintosh": se distingue del Mac real
  // porque tiene pantalla tactil (maxTouchPoints > 1). En Mac, maxTouchPoints
  // es 0 (o 1 en algun trackpad, por eso se pide > 1).
  if (/Macintosh/.test(ua)) {
    try {
      if ((navigator.maxTouchPoints || 0) > 1) return true;
      if (typeof document !== "undefined" && "ontouchend" in document) return true;
    } catch {
      /* sin datos de tactil */
    }
  }
  return false;
}

/* true si la PWA corre instalada (standalone), no en una pestana del navegador.
   En iOS es REQUISITO para poder notificar. */
export function esInstalada() {
  try {
    if (typeof window === "undefined") return false;
    if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
    if (window.matchMedia?.("(display-mode: fullscreen)").matches) return true;
    if (window.matchMedia?.("(display-mode: minimal-ui)").matches) return true;
    // iOS antiguo expone navigator.standalone
    if (navigator.standalone === true) return true;
    return false;
  } catch {
    return false;
  }
}

/* ¿Podemos pedir permiso de notificaciones en ESTE navegador/contexto?
   Devuelve un objeto con el motivo cuando no se puede, para poder explicarlo. */
export function capacidad() {
  if (!SOPORTADO) return { puede: false, motivo: "no-soportado" };
  if (contextoInseguro()) return { puede: false, motivo: "inseguro" };
  // En iOS, sin instalar en la pantalla de inicio el permiso se deniega siempre.
  if (esIOS() && !esInstalada()) return { puede: false, motivo: "ios-no-instalada" };
  return { puede: true, motivo: null };
}

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
  const cap = capacidad();
  if (!cap.puede) return cap.motivo; // "no-soportado" | "inseguro" | "ios-no-instalada"
  return Notification.permission; // "default" | "granted" | "denied"
}

export async function pedirPermiso() {
  const cap = capacidad();
  if (!cap.puede) return cap.motivo;
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    // iOS acepta la version con callback; se usa Promise si existe.
    const r = Notification.requestPermission();
    return r && typeof r.then === "function" ? await r : Notification.permission;
  } catch {
    return "default";
  }
}

async function viaServiceWorker(titulo, opciones) {
  if (!("serviceWorker" in navigator)) return false;
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return false;
  // Via preferente: mensaje al SW (su listener lo muestra). La pagina puede
  // estar a punto de suspenderse y el SW sigue vivo unos segundos.
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
   en Android y unico camino si la pestana no esta enfocada); si no hay SW, cae
   al constructor Notification (util en escritorio). Devuelve true si se mostro. */
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
