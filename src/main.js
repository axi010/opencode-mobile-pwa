import "./styles.css";
import { route, startRouter } from "./ui/router.js";
import { onClientError } from "./api/client.js";
import { toast } from "./ui/dom.js";
import { isConfigured, qrParams } from "./config.js";
import { initSecurity } from "./security.js";
import { initTheme } from "./theme.js";
import { iniciarVigilantePermisos, marcarPendientesComoVistos } from "./permisos-avisos.js";
import { setupView } from "./views/setup.js";
import { sessionsView } from "./views/sessions.js";
import { chatView } from "./views/chat.js";
import { permissionsView } from "./views/permissions.js";
import { settingsView } from "./views/settings.js";

route("/setup", setupView);
route("/sessions", sessionsView);
route("/chat/:id", chatView);
route("/permissions", permissionsView);
route("/settings", settingsView);

// Si la URL trae params de acceso (QR: ?server/?pair/?token, en query o en
// hash), fuerza la pantalla de setup aunque ya hubiera credenciales.
const qrInicial = qrParams();
const forzarSetup = Boolean(qrInicial.server || qrInicial.pair || qrInicial.token);
if (forzarSetup) {
  // IMPORTANTE: conservar los params en el hash para que setupView los lea
  // (y los retire con consumeQrParams). Asignar "#/setup" a secas los
  // recortaba y el auto-conect del QR NO arrancaba en carga en frio (solo
  // funcionaba en navegacion same-document, sin recargar).
  const ruta = location.hash.split("?")[0];
  if (ruta !== "#/setup") {
    location.hash = "#/setup?" + new URLSearchParams(qrInicial);
  }
} else if (!location.hash) {
  // Ruta de aterrizaje: sin credenciales -> setup (sin el parpadeo de 401
  // que provocaba entrar a sesiones sin password); con credenciales ->
  // sesiones (antes mandaba a setup, que es una pantalla de conexion).
  location.hash = isConfigured() ? "#/sessions" : "#/setup";
}

// Tema ANTES de arrancar el router (la app pinta tras el JS: sin parpadeo).
initTheme();

// Con PIN activo: NO arrancar la app hasta desbloquear (mientras tanto no
// hay peticiones ni datos en pantalla). Sin PIN resuelve al vuelo.
initSecurity().then(() => {
  startRouter();
  // Avisos de permisos: solo cuando NO miras la app. Al arrancar se marcan
  // como vistos los pendientes actuales para no notificar lo que ya se ve.
  marcarPendientesComoVistos();
  iniciarVigilantePermisos();
});

/* Auto-diagnostico: errores de cliente visibles (con rate-limit) + log local. */
let lastToastAt = 0;
onClientError((entry) => {
  const now = Date.now();
  if (now - lastToastAt > 10000) {
    lastToastAt = now;
    toast(`⚠ ${entry.msg}`);
  }
});

/* PWA instalable: registrar SW solo en produccion (evita cache en dev).
   Auto-actualizacion: si aparece una version nueva del SW, recarga la
   pagina para no quedarse con JS obsoleto en el movil. */
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => {
        reg.addEventListener("updatefound", () => {
          const sw = reg.installing;
          sw?.addEventListener("statechange", () => {
            if (sw.state === "activated" && navigator.serviceWorker.controller) {
              location.reload();
            }
          });
        });
      })
      .catch(() => {});
  });
}
