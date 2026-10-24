/* Tema claro/oscuro/auto.
   - "auto" (por defecto) sigue el modo del sistema (prefers-color-scheme).
   - El tema se aplica en <html data-theme="dark|light"> y el CSS hace el resto
     (variables en :root y :root[data-theme="light"]).
   - El <meta name="theme-color"> se actualiza por JS (la CSP prohibe estilos
     inline, pero setAttribute no es inline). */
const KEY = "ocmovil.theme";

export const TEMAS = ["auto", "claro", "oscuro"];

export function getTheme() {
  try {
    const v = localStorage.getItem(KEY);
    return TEMAS.includes(v) ? v : "auto";
  } catch {
    return "auto";
  }
}

export function setTheme(t) {
  try {
    localStorage.setItem(KEY, TEMAS.includes(t) ? t : "auto");
  } catch {
    /* sin storage: se queda en auto */
  }
  applyTheme();
}

function prefiereClaro() {
  try {
    return matchMedia("(prefers-color-scheme: light)").matches;
  } catch {
    return false;
  }
}

export function esClaro() {
  const t = getTheme();
  return t === "claro" || (t === "auto" && prefiereClaro());
}

export function applyTheme() {
  const claro = esClaro();
  document.documentElement.dataset.theme = claro ? "light" : "dark";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", claro ? "#f6f8fa" : "#0d1117");
  // iOS (PWA instalada): con "black-translucent" el texto de la barra de estado
  // es blanco; sobre el tema claro no se leería, así que ahí se usa "default".
  const ios = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (ios) ios.setAttribute("content", claro ? "default" : "black-translucent");
}

/* Llamar ANTES de arrancar el router: la app pinta tras el JS, asi que no
   hay parpadeo de tema al abrir. */
export function initTheme() {
  applyTheme();
  try {
    matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
      if (getTheme() === "auto") applyTheme();
    });
  } catch {
    /* navegador antiguo: sin seguimiento del sistema */
  }
}
