/* Internacionalizacion (ES/EN).
   Enfoque pragmatico: la app esta escrita en espanol, asi que **el texto en
   espanol es la clave**. `t("Sesiones")` devuelve "Sessions" si el idioma es
   ingles, y "Sesiones" si no. Si falta una traduccion, se devuelve la clave
   original (espanol): la app NUNCA se queda con un hueco vacio.

   Uso:
     t("Sesiones")                 -> traduce una cadena
     t("Hola {n}", { n: 3 })       -> sustituye {n}
   El idioma se detecta del navegador la primera vez y se guarda en
   localStorage ("ocmovil.idioma"): "es" | "en". */

const KEY = "ocmovil.idioma";

/* Diccionario EN: clave = texto en espanol, valor = traduccion inglesa. */
const EN = {
  /* ---- general / comun ---- */
  "{n} peticiones del agente esperando tu decisión":
    "{n} agent requests waiting for your decision",
  "OpenCode · permiso pendiente": "OpenCode · pending permission",
  "sin URL": "no URL",
  "Errores locales ({n})": "Local errors ({n})",
  "Prueba: así se verá el aviso de un permiso pendiente.":
    "Test: this is how a pending permission alert will look.",
  "Cargando…": "Loading…",
  "Copiar": "Copy",
  "Copiado": "Copied",
  "No se pudo": "Failed",
  "ahora": "just now",
  "hace {n} min": "{n} min ago",
  "hace {n} h": "{n} h ago",
  "hace {n} d": "{n} d ago",
  "Cerrar": "Close",
  "Cerrar aviso": "Dismiss",
  "Volver": "Back",
  "Guardando…": "Saving…",
  "Creando…": "Creating…",
  "Conectando…": "Connecting…",
  "Conectar": "Connect",
  "Activar": "Enable",
  "Desactivar": "Disable",
  "Activo": "Enabled",
  "Guardar": "Save",
  "Limpiar": "Clear",
  "Probar": "Test",
  "Sí": "Yes",
  "No": "No",
  "Sesiones": "Sessions",
  "Sesión": "Session",
  "Chat": "Chat",
  "Permisos": "Permissions",
  "Permiso": "Permission",
  "Ajustes": "Settings",
  "Apariencia": "Appearance",
  "Seguridad": "Security",
  "Notificaciones": "Notifications",
  "Diagnóstico": "Diagnostics",
  "Conexión": "Connection",
  "Acerca de": "About",

  /* ---- setup ---- */
  "URL del tunnel (la da el QR) o http://127.0.0.1:28894 en el PC":
    "Tunnel URL (from the QR) or http://127.0.0.1:28894 on the PC",
  "Contraseña del servidor o enlace de pairing": "Server password or pairing link",
  "Mostrar u ocultar": "Show or hide",
  "Servidor": "Server",
  "Acceso": "Access",
  "⚠ Conexión insegura (HTTP): la contraseña viaja por la red sin cifrar. Usa el QR con el tunnel https cuando puedas.":
    "⚠ Insecure connection (HTTP): the password travels the network unencrypted. Use the QR with the https tunnel when you can.",
  "Introduce la contraseña o el enlace de pairing": "Enter the password or the pairing link",
  "El código de pairing ha caducado o ya se usó (~5 min). Genera otro QR con «node scripts/qr-pairing.mjs» y escanéalo.":
    "The pairing code expired or was already used (~5 min). Generate a new QR with «node scripts/qr-pairing.mjs» and scan it.",
  "Este servidor no ofrece el proxy /api: desde un origen externo (túnel/LAN) el navegador bloqueará las peticiones. Sirve la app con «npm run preview» (incluye el proxy) o ábrela en localhost.":
    "This server does not expose the /api proxy: from an external origin (tunnel/LAN) the browser will block requests. Serve the app with «npm run preview» (includes the proxy) or open it on localhost.",
  "Error de conexión": "Connection error",
  "En el PC ejecuta ": "On the PC run ",
  " y escanea el QR. Alternativa manual: ": " and scan the QR. Manual alternative: ",
  " o la contraseña del servidor.": " or the server password.",
  "Token detectado · conectando…": "Token detected · connecting…",
  "Código de pairing detectado · emparejando…": "Pairing code detected · pairing…",

  /* ---- sesiones ---- */
  "Buscar sesión…": "Search sessions…",
  "Buscar en la conversación…": "Search in conversation…",
  "Buscar en la conversación": "Search in conversation",
  "Copiar toda la conversación": "Copy whole conversation",
  "Conversación copiada en Markdown": "Conversation copied as Markdown",
  "No hay nada que copiar": "Nothing to copy",
  "No se pudo copiar": "Could not copy",
  "Ordenar": "Sort",
  "Recientes": "Recent",
  "Antiguas": "Oldest",
  "Nombre": "Name",
  "Permisos pendientes": "Pending permissions",
  "Carpeta del proyecto (en el PC)": "Project folder (on the PC)",
  "C:\\ruta\\del\\proyecto": "C:\\path\\to\\project",
  "Crear sesión": "Create session",
  "Indica la carpeta del proyecto": "Enter the project folder",
  "Respuesta inesperada al crear la sesión": "Unexpected response when creating the session",
  "Error creando la sesión": "Error creating the session",
  "Todavía no hay sesiones": "No sessions yet",
  "Pulsa + para crear la primera en la carpeta de tu proyecto.":
    "Tap + to create the first one in your project folder.",
  "Sin resultados": "No results",
  "Prueba con otro texto o borra la búsqueda.": "Try another text or clear the search.",
  "Credencial caducada: vuelve a emparejar": "Credential expired: pair again",
  "Error cargando sesiones": "Error loading sessions",

  /* ---- chat ---- */
  "Mensaje…": "Message…",
  "Enviar": "Send",
  "Detener": "Stop",
  "Ir al final": "Go to end",
  "Sin conexión con el servidor · reintentando…":
    "No connection to the server · retrying…",
  "Sin conexión con el servidor · reintentando en {s} s…":
    "No connection to the server · retrying in {s} s…",
  "Conexión restablecida": "Connection restored",
  "escribiendo…": "typing…",
  "pensando…": "thinking…",
  "pensado": "thought",
  "Modelo y variante": "Model and variant",
  "Adjuntar archivos del PC": "Attach files from the PC",
  "Elige los archivos del PC y pulsa Adjuntar":
    "Pick files from the PC and tap Attach",
  "Adjuntar": "Attach",
  "No has elegido ningún archivo": "You have not picked any file",
  "Carpeta vacía": "Empty folder",
  "No se pudo abrir la carpeta": "Could not open the folder",
  "⚠ Estás fuera de la carpeta del proyecto: revisa la ruta antes de adjuntar.":
    "⚠ You are outside the project folder: check the path before attaching.",
  "No se pudo cargar el catálogo": "Could not load the catalogue",
  "Buscar modelo o proveedor…": "Search model or provider…",
  "Cargando modelos…": "Loading models…",
  "por defecto": "default",
  "variantes": "variants",
  "Modelo:": "Model:",
  "Modo PLAN (solo lectura)": "PLAN mode (read-only)",
  "Modo BUILD (puede editar)": "BUILD mode (can edit)",
  "No se pudo cambiar el modo": "Could not change the mode",
  "No se pudo cambiar el modelo": "Could not change the model",
  "Permiso rechazado": "Permission rejected",
  "Permitido (siempre)": "Allowed (always)",
  "Permitido": "Allowed",
  "No se pudo responder": "Could not reply",
  "Error cargando mensajes": "Error loading messages",
  "Quitar": "Remove",
  "archivo(s) adjuntado(s)": "file(s) attached",
  "No se pudo enviar: ": "Could not send: ",

  /* ---- permisos ---- */
  "Sin permisos pendientes. Cuando el agente necesite algo delicado (borrar, shell, escritura…), aquí lo decides.":
    "No pending permissions. When the agent needs something sensitive (delete, shell, write…), you decide it here.",
  "Permitir": "Allow",
  "Siempre": "Always",
  "Rechazar": "Reject",
  "Permitido esta vez": "Allowed this time",
  "Abrir la sesión →": "Open the session →",
  "Error cargando permisos": "Error loading permissions",

  /* ---- ajustes: conexion ---- */
  "Alternativa": "Alternative",
  "Modo": "Mode",
  "Versión": "Version",
  "proxy same-origin": "same-origin proxy",
  "directo (CORS)": "direct (CORS)",
  "Probar conexión": "Test connection",
  "Cambiar servidor": "Change server",
  "Usar alternativa": "Use alternative",
  "Usar principal": "Use primary",
  "Probando…": "Testing…",
  "Conexión OK · opencode v{version}": "Connection OK · opencode v{version}",
  "Sin conexión": "No connection",
  "URL principal intercambiada": "Primary URL swapped",

  /* ---- ajustes: seguridad ---- */
  "⚠ Conexión por HTTP sin cifrar: la contraseña viaja visible por la red. Usa el QR con tunnel https.":
    "⚠ Unencrypted HTTP connection: the password travels visibly over the network. Use the QR with an https tunnel.",
  "PIN no disponible en este origen: Web Crypto requiere https o localhost (en LAN por http no existe).":
    "PIN unavailable on this origin: Web Crypto requires https or localhost (it does not exist on plain http LAN).",
  "🔒 Bloqueo con PIN activo.": "🔒 PIN lock is on.",
  "Cerrar por inactividad": "Lock after inactivity",
  "minuto": "minute",
  "minutos": "minutes",
  "Bloquear ahora": "Lock now",
  "Bloqueado": "Locked",
  "Desactivar PIN": "Turn off PIN",
  "¿Desactivar el PIN de este dispositivo?": "Turn off the PIN on this device?",
  "PIN desactivado": "PIN turned off",
  "PIN activado · se pedirá al abrir la app": "PIN enabled · it will be asked when opening the app",
  "PIN demasiado corto (mínimo 4)": "PIN too short (minimum 4)",
  "Activar PIN": "Turn on PIN",
  "Nuevo PIN": "New PIN",
  "4 a 12 caracteres": "4 to 12 characters",
  "PIN local del móvil (no es el del servidor): se guarda como hash PBKDF2, nunca en claro.":
    "Local phone PIN (not the server one): stored as a PBKDF2 hash, never in clear text.",
  "Cerrar sesión en este dispositivo": "Log out on this device",
  "¿Cerrar sesión? Se borrará la contraseña guardada en este dispositivo.":
    "Log out? The password stored on this device will be deleted.",
  "Sesión cerrada": "Logged out",
  "Inactividad actualizada": "Inactivity updated",

  /* ---- ajustes: apariencia ---- */
  "Auto": "Auto",
  "Claro": "Light",
  "Oscuro": "Dark",
  "«Auto» sigue el modo claro/oscuro del sistema.":
    "«Auto» follows the system light/dark mode.",
  "Tema": "Theme",
  "Modo compacto (más mensajes en pantalla)": "Compact mode (more messages on screen)",
  "Idioma": "Language",
  "Idioma de la interfaz": "Interface language",

  /* ---- ajustes: notificaciones ---- */
  "Este navegador no soporta notificaciones. Usa el badge 🛡 de la lista y el banner del chat, que sí funcionan.":
    "This browser does not support notifications. Use the 🛡 badge in the list and the chat banner, which do work.",
  "⚠ Las notificaciones necesitan HTTPS o localhost. Abre la app con el túnel https (QR) para activarlas.":
    "⚠ Notifications need HTTPS or localhost. Open the app through the https tunnel (QR) to enable them.",
  "En iPhone/iPad, Apple solo permite notificar a las webs **instaladas**. Instálala y vuelve aquí:":
    "On iPhone/iPad, Apple only allows notifications for **installed** web apps. Install it and come back here:",
  "Pulsa **Compartir** (el cuadrado con la flecha) en Safari.":
    "Tap **Share** (the square with the arrow) in Safari.",
  "Elige **«Añadir a pantalla de inicio»**.": "Choose **“Add to Home Screen”**.",
  "Abre la app desde el icono nuevo y activa aquí las notificaciones.":
    "Open the app from the new icon and enable notifications here.",
  "Aviso: aunque la instales, Apple **no permite** despertar la app en segundo plano, así que el aviso llega solo si acabas de dejar la app (unos segundos). El badge 🛡 y el banner del chat siempre funcionan.":
    "Note: even installed, Apple does **not** allow waking the app in the background, so the alert only arrives right after you leave the app (a few seconds). The 🛡 badge and the chat banner always work.",
  "Activadas: te avisaré cuando el agente pida un permiso y no estés mirando la app.":
    "Enabled: I will alert you when the agent asks for a permission while you are not looking at the app.",
  "Bloqueadas por el navegador. Actívalas en los ajustes del sitio (icono junto a la URL) y recarga.":
    "Blocked by the browser. Enable them in the site settings (icon next to the URL) and reload.",
  "Desactivadas.": "Disabled.",
  "Activar notificaciones": "Enable notifications",
  "Notificaciones activadas": "Notifications enabled",
  "Permiso denegado en el navegador": "Permission denied in the browser",
  "Permiso no concedido": "Permission not granted",
  "Probar notificación": "Test notification",
  "No se pudo mostrar la notificación": "Could not show the notification",
  "Avisos solo en segundo plano y con permiso concedido. Android mantiene la app viva unos 30 s tras ocultarla; pasada esa ventana no puede avisar (sin servidor push).":
    "Alerts only in the background and with permission granted. Android keeps the app alive ~30 s after hiding it; past that window it cannot alert (no push server).",

  /* ---- ajustes: diagnostico / acerca de ---- */
  "Errores locales ({n})": "Local errors ({n})",
  "Sin errores registrados.": "No errors logged.",
  "Log de errores limpiado": "Error log cleared",
  "Limpiar log": "Clear log",
  "Vaciar caché": "Clear cache",
  "Caché vaciada · recargando": "Cache cleared · reloading",
  "No se pudo vaciar la caché": "Could not clear the cache",
  "OpenCode Móvil · PWA sin frameworks (Vite + JS vanilla). Cliente de la API HTTP de opencode: sesiones, chat en streaming, permisos y bloqueo con PIN.":
    "OpenCode Móvil · framework-free PWA (Vite + vanilla JS). Client for the opencode HTTP API: sessions, streaming chat, permissions and PIN lock.",

  /* ---- bloqueo con PIN ---- */
  "Bloqueado": "Locked",
  "Introduce el PIN del dispositivo": "Enter the device PIN",
  "Desbloquear": "Unlock",
  "Comprobando…": "Checking…",
  "¿Olvidaste el PIN? Borrar datos del dispositivo":
    "Forgot the PIN? Erase device data",
  "Se borraran el PIN y la contraseña guardada en este dispositivo. ¿Continuar?":
    "The PIN and the saved password on this device will be erased. Continue?",
  "Bloqueado por inactividad": "Locked after inactivity",
  "Bloqueado: la app paso a segundo plano": "Locked: the app went to the background",
  "PIN incorrecto ({n}º intento)": "Wrong PIN ({n}th try)",
  "Demasiados intentos: espera {s} s": "Too many attempts: wait {s} s",
  "Error comprobando el PIN": "Error checking the PIN",
  "Error interno comprobando el PIN": "Internal error checking the PIN",
  "PIN": "PIN",

  /* ---- aviso iOS ---- */
  "📲 Para instalarla: Compartir → «Añadir a pantalla de inicio». Así funcionan el PIN y las notificaciones.":
    "📲 To install it: Share → “Add to Home Screen”. That enables the PIN and notifications.",
};

/* Idiomas disponibles (para el selector de Ajustes). */
export const IDIOMAS = [
  { id: "es", nombre: "Español" },
  { id: "en", nombre: "English" },
];

let idioma = "es";

/* Detecta el idioma inicial: preferencia guardada o el del navegador. */
export function initIdioma() {
  try {
    const guardado = localStorage.getItem(KEY);
    if (guardado === "es" || guardado === "en") {
      idioma = guardado;
    } else {
      const nav = (navigator.language || "es").toLowerCase();
      idioma = nav.startsWith("es") ? "es" : "en";
    }
  } catch {
    idioma = "es";
  }
  if (typeof document !== "undefined") document.documentElement.lang = idioma;
  return idioma;
}

export function getIdioma() {
  return idioma;
}

export function setIdioma(nuevo) {
  if (nuevo !== "es" && nuevo !== "en") return idioma;
  idioma = nuevo;
  try {
    localStorage.setItem(KEY, nuevo);
  } catch {
    /* sin storage: se queda en memoria */
  }
  if (typeof document !== "undefined") document.documentElement.lang = idioma;
  return idioma;
}

/* Traduce una cadena. `vars` sustituye los marcadores {clave}. */
export function t(texto, vars) {
  let out = idioma === "en" ? EN[texto] ?? texto : texto;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.replaceAll(`{${k}}`, String(v));
    }
  }
  return out;
}
