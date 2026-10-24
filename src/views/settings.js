/* Ajustes: conexion, seguridad (PIN), diagnostico y sesion del dispositivo.
   Es el "panel de configuracion" de la PWA: aqui vive todo lo que en la
   version anterior estaba repartido o escondido en /setup. */
import { h, toast } from "../ui/dom.js";
import { loadConfig, saveConfig, clearConfig } from "../config.js";
import { Client } from "../api/client.js";
import { navigate } from "../ui/router.js";
import { getTheme, setTheme, TEMAS } from "../theme.js";
import { notifySoportado, estado as estadoNotif, pedirPermiso, notificar, contextoInseguro } from "../notify.js";
import {
  hasPin,
  setPin,
  clearPin,
  lockCfg,
  setTimeoutMin,
  pinSoportado,
  lockNow,
} from "../security.js";

const ERR_KEY = "ocmovil.errors";

function esLoopback(host) {
  return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]";
}

function origenInseguro(baseUrl) {
  const paginaLan = location.protocol === "http:" && !esLoopback(location.hostname);
  try {
    const u = new URL(baseUrl || "");
    return paginaLan || (u.protocol === "http:" && !esLoopback(u.hostname));
  } catch {
    return paginaLan;
  }
}

export async function settingsView(_params, root, _signal) {
  root.append(
    h(
      "header",
      { class: "topbar" },
      h("button", { class: "icon-btn", title: "Volver", onClick: () => navigate("/sessions") }, "‹"),
      h("h1", {}, "Ajustes")
    )
  );

  const main = h("main", { class: "settings" });
  root.append(main);

  /* ================= CONEXION ================= */
  const kvUrl = h("div", { class: "kv" }, h("span", {}, "Servidor"), h("b", {}, "…"));
  const kvAlt = h("div", { class: "kv" }, h("span", {}, "Alternativa"), h("b", {}, "—"));
  const kvModo = h("div", { class: "kv" }, h("span", {}, "Modo"), h("b", {}, "…"));
  const kvVer = h("div", { class: "kv" }, h("span", {}, "Versión"), h("b", {}, "…"));
  const probarBtn = h("button", { class: "ghost", onClick: probar }, "Probar conexión");
  const cambiarBtn = h("button", { class: "ghost", onClick: () => navigate("/setup") }, "Cambiar servidor");
  const swapBtn = h("button", { class: "ghost", onClick: swapUrl }, "Usar alternativa");

  function pintarConexion() {
    const cfg = loadConfig();
    kvUrl.querySelector("b").textContent = cfg.baseUrl || "sin URL";
    kvAlt.querySelector("b").textContent = cfg.altUrl || "—";
    kvModo.querySelector("b").textContent = cfg.sameOrigin ? "proxy same-origin" : "directo (CORS)";
    swapBtn.hidden = !cfg.altUrl;
    swapBtn.textContent = cfg.altUrl && cfg.altUrl !== cfg.baseUrl ? "Usar alternativa" : "Usar principal";
  }

  async function probar() {
    probarBtn.disabled = true;
    probarBtn.textContent = "Probando…";
    try {
      const info = await Client.info();
      kvVer.querySelector("b").textContent = `v${info.version}`;
      toast(`Conexión OK · opencode v${info.version}`);
    } catch (e) {
      kvVer.querySelector("b").textContent = "—";
      toast(e.message || "Sin conexión");
    } finally {
      probarBtn.disabled = false;
      probarBtn.textContent = "Probar conexión";
    }
  }

  function swapUrl() {
    const cfg = loadConfig();
    if (!cfg.altUrl) return;
    saveConfig({ baseUrl: cfg.altUrl, altUrl: cfg.baseUrl || "" });
    pintarConexion();
    toast("URL principal intercambiada");
    probar();
  }

  pintarConexion();

  main.append(
    h("section", { class: "sec" }, h("h3", {}, "Conexión"), kvUrl, kvAlt, kvModo, kvVer,
      h("div", { class: "btn-row" }, probarBtn, cambiarBtn, swapBtn))
  );

  /* ================= SEGURIDAD ================= */
  const secSeg = h("section", { class: "sec" }, h("h3", {}, "Seguridad"));

  if (origenInseguro(loadConfig().baseUrl)) {
    secSeg.append(
      h("div", { class: "warn" },
        "⚠ Conexión por HTTP sin cifrar: la contraseña viaja visible por la red. Usa el QR con tunnel https.")
    );
  }

  if (!pinSoportado()) {
    secSeg.append(
      h("p", { class: "hint" },
        "PIN no disponible en este origen: Web Crypto requiere https o localhost (en LAN por http no existe).")
    );
  } else {
    const pinBox = h("div", { class: "pin-box" });
    secSeg.append(pinBox);

    function pintarPin() {
      pinBox.textContent = "";
      if (hasPin()) {
        const sel = h("select", { onChange: (e) => { setTimeoutMin(Number(e.target.value)); toast("Inactividad actualizada"); } },
          ...[1, 5, 10, 15, 30].map((m) =>
            h("option", { value: String(m), selected: lockCfg().timeout === m ? true : false },
              `${m} minuto${m > 1 ? "s" : ""}`)
          )
        );
        pinBox.append(
          h("p", { class: "hint" }, "🔒 Bloqueo con PIN activo."),
          h("label", {}, "Cerrar por inactividad", sel),
          h("div", { class: "btn-row" },
            h("button", { class: "ghost", onClick: () => { lockNow("manual"); toast("Bloqueado"); } }, "Bloquear ahora"),
            h("button", {
              class: "danger",
              onClick: () => {
                if (confirm("¿Desactivar el PIN de este dispositivo?")) {
                  clearPin();
                  pintarPin();
                  toast("PIN desactivado");
                }
              },
            }, "Desactivar PIN"))
        );
      } else {
        const input = h("input", {
          type: "password",
          inputmode: "numeric",
          minlength: "4",
          maxlength: "12",
          placeholder: "4 a 12 caracteres",
          autocomplete: "new-password",
        });
        const activar = h("button", {
          class: "ghost",
          onClick: async () => {
            const v = input.value;
            if (v.length < 4) return toast("PIN demasiado corto (mínimo 4)");
            activar.disabled = true;
            activar.textContent = "Guardando…";
            try {
              await setPin(v);
              pintarPin();
              toast("PIN activado · se pedirá al abrir la app");
            } finally {
              activar.disabled = false;
              activar.textContent = "Activar PIN";
            }
          },
        }, "Activar PIN");
        pinBox.append(
          h("p", { class: "hint" },
            "PIN local del móvil (no es el del servidor): se guarda como hash PBKDF2, nunca en claro."),
          h("label", {}, "Nuevo PIN", h("div", { class: "secret-wrap" }, input)),
          h("div", { class: "btn-row" }, activar)
        );
      }
    }
    pintarPin();
  }

  /* cerrar sesion: borra SOLO la credencial de este dispositivo */
  secSeg.append(
    h("div", { class: "btn-row" },
      h("button", {
        class: "danger",
        onClick: () => {
          if (!confirm("¿Cerrar sesión? Se borrará la contraseña guardada en este dispositivo.")) return;
          clearConfig();
          toast("Sesión cerrada");
          navigate("/setup");
        },
      }, "Cerrar sesión en este dispositivo"))
  );

  main.append(secSeg);

  /* ================= APARIENCIA ================= */
  const ETIQUETAS = { auto: "Auto", claro: "Claro", oscuro: "Oscuro" };
  const botonesTema = TEMAS.map((t) =>
    h(
      "button",
      {
        type: "button",
        "aria-pressed": String(getTheme() === t),
        onClick: () => {
          setTheme(t);
          for (const b of botonesTema) b.setAttribute("aria-pressed", String(b.dataset.tema === t));
        },
      },
      ETIQUETAS[t]
    )
  );
  botonesTema.forEach((b, i) => (b.dataset.tema = TEMAS[i]));

  main.append(
    h("section", { class: "sec" }, h("h3", {}, "Apariencia"),
      h("p", { class: "hint" }, "«Auto» sigue el modo claro/oscuro del sistema."),
      h("div", { class: "seg", role: "group", "aria-label": "Tema" }, ...botonesTema))
  );

  /* ================= NOTIFICACIONES ================= */
  const secNotif = h("section", { class: "sec" }, h("h3", {}, "Notificaciones"));
  const cajaNotif = h("div", { class: "pin-box" });
  secNotif.append(cajaNotif);

  function pintarNotif() {
    cajaNotif.textContent = "";
    const est = estadoNotif();

    if (est === "no-soportado") {
      cajaNotif.append(
        h("p", { class: "hint" },
          "Este navegador no soporta notificaciones. En iPhone/iPad (iOS) las PWA no pueden notificar: usa el badge 🛡 y el aviso del chat.")
      );
      return;
    }
    if (est === "inseguro") {
      cajaNotif.append(
        h("div", { class: "warn" },
          "⚠ Las notificaciones necesitan HTTPS o localhost. Abre la app con el túnel https (QR) para activarlas.")
      );
      return;
    }

    const texto =
      est === "granted"
        ? "Activadas: te avisaré cuando el agente pida un permiso y no estés mirando la app."
        : est === "denied"
          ? "Bloqueadas por el navegador. Actívalas en los ajustes del sitio (icono junto a la URL)."
          : "Desactivadas.";
    cajaNotif.append(h("p", { class: "hint" }, texto));

    if (est !== "granted") {
      const btnAct = h("button", {
        class: "ghost",
        onClick: async () => {
          const r = await pedirPermiso();
          pintarNotif();
          toast(
            r === "granted"
              ? "Notificaciones activadas"
              : r === "denied"
                ? "Permiso denegado en el navegador"
                : "Permiso no concedido"
          );
        },
      }, "Activar notificaciones");
      cajaNotif.append(h("div", { class: "btn-row" }, btnAct));
    } else {
      const btnPrueba = h("button", {
        class: "ghost",
        onClick: async () => {
          const ok = await notificar("OpenCode Móvil", "Prueba: así se verá el aviso de un permiso pendiente.", {
            tag: "ocmovil-prueba",
            onClickUrl: location.origin + location.pathname + "#/permissions",
          });
          if (!ok) toast("No se pudo mostrar la notificación");
        },
      }, "Probar notificación");
      cajaNotif.append(h("div", { class: "btn-row" }, btnPrueba));
    }

    cajaNotif.append(
      h("p", { class: "hint" },
        "Avisos solo en segundo plano y con permiso concedido. Android mantiene la app viva unos 30 s tras ocultarla; pasada esa ventana no puede avisar (sin servidor push).")
    );
  }
  pintarNotif();
  main.append(secNotif);


  /* ================= DIAGNOSTICO ================= */
  let errores = [];
  try {
    errores = JSON.parse(localStorage.getItem(ERR_KEY) || "[]");
  } catch {
    errores = [];
  }

  const logPre = h("pre", { class: "err-log", hidden: true },
    errores.length
      ? errores.map((e) => `${new Date(e.t).toLocaleTimeString()} · ${e.where}: ${e.msg}`).join("\n")
      : "Sin errores registrados.");
  const verBtn = h("button", {
    class: "ghost",
    onClick: () => { logPre.hidden = !logPre.hidden; },
  }, `Errores locales (${errores.length})`);
  const limpiarBtn = h("button", {
    class: "ghost",
    onClick: () => {
      localStorage.removeItem(ERR_KEY);
      logPre.textContent = "Sin errores registrados.";
      verBtn.textContent = "Errores locales (0)";
      toast("Log de errores limpiado");
    },
  }, "Limpiar log");
  const cacheBtn = h("button", {
    class: "ghost",
    onClick: async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.filter((k) => k.startsWith("ocmovil-")).map((k) => caches.delete(k)));
        toast("Caché vaciada · recargando");
        setTimeout(() => location.reload(), 600);
      } catch {
        toast("No se pudo vaciar la caché");
      }
    },
  }, "Vaciar caché");

  main.append(
    h("section", { class: "sec" }, h("h3", {}, "Diagnóstico"),
      h("div", { class: "btn-row" }, verBtn, limpiarBtn, cacheBtn),
      logPre)
  );

  /* ================= ACERCA DE ================= */
  main.append(
    h("section", { class: "sec" }, h("h3", {}, "Acerca de"),
      h("p", { class: "hint" },
        "OpenCode Móvil · PWA sin frameworks (Vite + JS vanilla). Cliente de la API HTTP de opencode: sesiones, chat en streaming, permisos y bloqueo con PIN."))
  );
}
