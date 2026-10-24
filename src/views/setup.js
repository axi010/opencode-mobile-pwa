/* Pantalla de conexion: URL del servidor + contraseña o enlace de pairing.
   Seguridad: campo de acceso enmascarado (con ojo), aviso de origen HTTP
   inseguro y retiro inmediato de los params del QR de la URL.
   Auto-conexion: consumeQrParams() captura ?server/?pair/?token (query o
   hash) y LOS RETIRA de la barra/historial de inmediato: el token no queda
   expuesto aunque el connect falle; el secreto vuelve al campo para
   reintentar sin reescanear. */
import { h, toast } from "../ui/dom.js";
import { loadConfig, saveConfig, consumeQrParams } from "../config.js";
import { Client, detectarProxy } from "../api/client.js";
import { vigilarDesdeAhora } from "../permisos-avisos.js";
import { navigate } from "../ui/router.js";
import { t } from "../i18n.js";

function esLoopback(host) {
  return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]";
}

/* true si ni la pagina ni el servidor estan en un origen seguro */
function origenInseguro(baseUrl) {
  const paginaLan = location.protocol === "http:" && !esLoopback(location.hostname);
  try {
    const u = new URL(baseUrl || "");
    const servidorLan = u.protocol === "http:" && !esLoopback(u.hostname);
    return paginaLan || servidorLan;
  } catch {
    return paginaLan;
  }
}

export async function setupView(_params, root, _signal) {
  const { server: serverParam, pair: pairParam, token: tokenParam } = consumeQrParams();
  if (serverParam) saveConfig({ baseUrl: serverParam.replace(/\/+$/, "") });

  const urlInput = h("input", {
    type: "url",
    name: "url",
    value: loadConfig().baseUrl,
    required: true,
    placeholder: loadConfig().baseUrl ? "" : t("URL del tunnel (la da el QR) o http://127.0.0.1:28894 en el PC"),
    inputmode: "url",
    autocomplete: "off",
    spellcheck: "false",
  });

  const secretInput = h("input", {
    type: "password",
    name: "secret",
    placeholder: t("Contraseña del servidor o enlace de pairing"),
    autocomplete: "off",
    spellcheck: "false",
  });
  const ojo = h(
    "button",
    {
      class: "ojo",
      type: "button",
      title: t("Mostrar u ocultar"),
      onClick: () => {
        const ver = secretInput.type === "password";
        secretInput.type = ver ? "text" : "password";
        ojo.textContent = ver ? "🙈" : "👁";
      },
    },
    "👁"
  );
  const secretWrap = h("div", { class: "secret-wrap" }, secretInput, ojo);

  const warn = h("div", { class: "warn", hidden: true });
  function actualizarWarn() {
    const inseguro = origenInseguro(urlInput.value.trim() || loadConfig().baseUrl);
    warn.hidden = !inseguro;
    warn.textContent = inseguro
      ? t("⚠ Conexión insegura (HTTP): la contraseña viaja por la red sin cifrar. Usa el QR con el tunnel https cuando puedas.")
      : "";
  }
  urlInput.addEventListener("input", actualizarWarn);

  const errorEl = h("p", { class: "error", hidden: true });
  const btn = h("button", { type: "submit" }, t("Conectar"));

  /* Flujo unico de conexion: recibe el secreto (contraseña, codigo de pairing
     o token ya canjeado si raw=true). */
  async function connect(secret, { raw = false } = {}) {
    errorEl.hidden = true;
    btn.disabled = true;
    btn.textContent = t("Conectando…");
    const baseUrl = urlInput.value.trim().replace(/\/+$/, "");
    saveConfig({ baseUrl });
    try {
      if (!secret) throw new Error(t("Introduce la contraseña o el enlace de pairing"));
      let password = secret;
      if (!raw) {
        const caducado = () => {
          // 404/401 = codigo expirado (~5 min) o ya consumido
          throw new Error(
            t("El código de pairing ha caducado o ya se usó (~5 min). Genera otro QR con «node scripts/qr-pairing.mjs» y escanéalo.")
          );
        };
        const idx = secret.indexOf("/auth/connect/");
        if (idx !== -1) {
          const code = secret.slice(idx + "/auth/connect/".length).split(/[/?#]/)[0];
          password = await Client.redeem(code).catch(caducado);
        } else if (!secret.includes("://") && secret.length > 20 && !secret.includes(" ")) {
          // codigo suelto del QR (no contraseña: las cortas van con espacios/visibles)
          password = await Client.redeem(secret).catch(caducado);
        }
      }
      saveConfig({ password });
      // Modo same-origin: la app habla con el API a traves de su propio
      // servidor (proxy de Vite). Es lo unico que funciona desde el tunel
      // https, porque el API solo permite CORS a loopback. Se comprueba de
      // verdad (si sirves dist/ con un estatico sin proxy, queda desactivado).
      const viaProxy = await detectarProxy(password);
      saveConfig({ sameOrigin: viaProxy });
      if (!viaProxy) {
        // Sin proxy: el API solo permite CORS a loopback. Desde otro origen
        // (tunel/LAN) el navegador bloqueara las peticiones -> avisar claro.
        const esLocal = esLoopback(location.hostname);
        if (!esLocal) {
          throw new Error(
            t("Este servidor no ofrece el proxy /api: desde un origen externo (túnel/LAN) el navegador bloqueará las peticiones. Sirve la app con «npm run preview» (incluye el proxy) o ábrela en localhost.")
          );
        }
      }
      const info = await Client.info();
      // Guardar la URL https (tunnel) como alternativa: si luego la URL
      // principal falla de red, api() reintenta con esta automáticamente.
      const alt = (info.urls || []).find((u) => u.startsWith("https://") && u !== baseUrl);
      if (alt) saveConfig({ altUrl: alt.replace(/\/+$/, "") });
      toast(t("Conectado · opencode v{version}", { version: info.version }));
      // Ya hay credenciales: el vigilante puede empezar a trabajar.
      vigilarDesdeAhora();
      history.replaceState(null, "", location.pathname + "#/sessions");
      navigate("/sessions");
    } catch (err) {
      saveConfig({ password: "" });
      // devolver el secreto al campo para poder reintentar sin reescanear
      // (la URL ya fue limpiada por consumeQrParams)
      if (secret) secretInput.value = secret;
      errorEl.textContent = err.message || t("Error de conexión");
      errorEl.hidden = false;
      btn.disabled = false;
      btn.textContent = t("Conectar");
    }
  }

  const form = h(
    "form",
    { class: "setup-form" },
    h("div", { class: "brand" }, h("span", { class: "logo" }, "OC"), "OpenCode Móvil"),
    warn,
    h("label", {}, t("Servidor"), urlInput),
    h("label", {}, t("Acceso"), secretWrap),
    errorEl,
    btn,
    h(
      "p",
      { class: "hint" },
      t("En el PC ejecuta "),
      h("code", {}, "node scripts/qr-pairing.mjs"),
      t(" y escanea el QR. Alternativa manual: "),
      h("code", {}, "opencode pair"),
      t(" o la contraseña del servidor.")
    )
  );
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    connect(secretInput.value.trim());
  });

  root.append(h("main", { class: "setup" }, form));
  actualizarWarn();

  // Auto-conexion desde el QR (los params ya fueron capturados y retirados)
  if (tokenParam) {
    // QR con token precanjeado: un solo escaneo, valido 30 dias
    toast(t("Token detectado · conectando…"));
    connect(tokenParam, { raw: true });
  } else if (pairParam) {
    // QR con codigo de pairing de un solo uso (caduca en ~5 min)
    toast(t("Código de pairing detectado · emparejando…"));
    connect(`/auth/connect/${pairParam}`);
  }
}
