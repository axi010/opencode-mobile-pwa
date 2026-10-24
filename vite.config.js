import { defineConfig } from "vite";

/* Content-Security-Policy estricta, SOLO en build de produccion (el dev no
   la necesita y estorbaria al HMR). Se inyecta como <meta> en dist/index.html.

   Decisiones y por que:
   - script-src 'self': sin 'unsafe-inline' ni 'unsafe-eval' -> cualquier
     <script> inline inyectado (XSS) queda bloqueado. El build no emite
     scripts inline: por eso se desactiva modulePreload.polyfill (si no,
     Vite anade un <script type=module> inline).
   - style-src 'self': sin unsafe-inline. El codigo solo usa CSSOM
     (el.style.height=...), que la CSP NO bloquea; no hay atributos style
     en el markup.
   - connect-src restringido a https (tunnel) + loopback: el servidor
     opencode SOLO escucha en 127.0.0.1 por diseño. Si algun dia se habilita
     el servidor en LAN (opencode service set hostname), hay que ampliarlo
     con http://<ip>:* aqui.
   - frame-ancestors no funciona en <meta>; lo cubre X-Frame-Options del
     servidor (o el navegador moderno con default-src 'self' + frame-src 'none').
*/
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' https: http://127.0.0.1:* http://localhost:*",
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-src 'none'",
].join("; ");

function cspProduccion() {
  return {
    name: "csp-produccion",
    transformIndexHtml: {
      order: "post",
      handler: (html, ctx) => {
        // ctx.bundle solo existe durante `vite build` (no en dev).
        if (!ctx.bundle) return html;
        const meta = `<meta http-equiv="Content-Security-Policy" content="${CSP}" />`;
        // Al PRINCIPIO del head: el meta tiene que ir antes de cualquier
        // script/estilo para que el navegador le aplique la politica.
        return html.replace("<head>", `<head>\n    ${meta}`);
      },
    },
  };
}

// PWA movil: base relativa (portable a cualquier origen) + acceso desde el movil via LAN.
//
// PROXY SAME-ORIGIN (clave para el movil): la API de opencode solo permite CORS
// a loopback, asi que desde el tunel https (otro origen) el navegador bloquea
// las peticiones. Con este proxy la app llama a /api y /auth en SU PROPIO
// origen y Vite lo reenvia a 127.0.0.1:28894: cero CORS, y funciona igual en
// localhost, en LAN y a traves del tunel. El cliente activa este modo con
// `sameOrigin` en su config (ver src/config.js y src/api/client.js).
const API_OPENCODE = "http://127.0.0.1:28894";
const proxy = {
  "/api": { target: API_OPENCODE, changeOrigin: true },
  "/auth": { target: API_OPENCODE, changeOrigin: true },
};

export default defineConfig({
  base: "./",
  // allowedHosts: la PWA se sirve por el tunel de Cloudflare (Host aleatorio
  // *.trycloudflare.com). Sin esto Vite responde 403 "Blocked request" y la
  // app llega vacia al movil. La preview solo expone la app estatica; la API
  // de opencode sigue con autenticacion.
  server: { host: true, port: 5173, allowedHosts: true, proxy },
  preview: { host: true, port: 4173, allowedHosts: true, proxy },
  build: {
    // Sin polyfill inline de modulepreload -> permite una CSP script-src estricta.
    modulePreload: { polyfill: false },
  },
  plugins: [cspProduccion()],
});
