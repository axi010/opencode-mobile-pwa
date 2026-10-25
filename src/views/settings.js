/* Ajustes: conexion, seguridad (PIN), diagnostico y sesion del dispositivo.
   Es el "panel de configuracion" de la PWA: aqui vive todo lo que en la
   version anterior estaba repartido o escondido en /setup. */
import { h, toast } from "../ui/dom.js";
import { loadConfig, saveConfig, clearConfig } from "../config.js";
import { Client } from "../api/client.js";
import { navigate } from "../ui/router.js";
import { getTheme, setTheme, TEMAS } from "../theme.js";
import { t, IDIOMAS, getIdioma, setIdioma } from "../i18n.js";
import { notifySoportado, estado as estadoNotif, pedirPermiso, notificar, contextoInseguro } from "../notify.js";
import {
  pushCapacidad,
  pushEstado,
  activarPush,
  desactivarPush,
  probarPush,
  getPushUrl,
  setPushUrl,
} from "../push.js";
import { esEscritorio } from "../ui/atajos.js";
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
      h("button", { class: "icon-btn", title: t("Volver"), "aria-label": t("Volver"), onClick: () => navigate("/sessions") }, "‹"),
      h("h1", {}, t("Ajustes"))
    )
  );

  const main = h("main", { class: "settings" });
  root.append(main);

  /* ================= CONEXION ================= */
  const kvUrl = h("div", { class: "kv" }, h("span", {}, t("Servidor")), h("b", {}, "…"));
  const kvAlt = h("div", { class: "kv" }, h("span", {}, t("Alternativa")), h("b", {}, "—"));
  const kvModo = h("div", { class: "kv" }, h("span", {}, t("Modo")), h("b", {}, "…"));
  const kvVer = h("div", { class: "kv" }, h("span", {}, t("Versión")), h("b", {}, "…"));
  const probarBtn = h("button", { class: "ghost", onClick: probar }, t("Probar conexión"));
  const cambiarBtn = h("button", { class: "ghost", onClick: () => navigate("/setup") }, t("Cambiar servidor"));
  const swapBtn = h("button", { class: "ghost", onClick: swapUrl }, t("Usar alternativa"));

  function pintarConexion() {
    const cfg = loadConfig();
    kvUrl.querySelector("b").textContent = cfg.baseUrl || t("sin URL");
    kvAlt.querySelector("b").textContent = cfg.altUrl || "—";
    kvModo.querySelector("b").textContent = cfg.sameOrigin ? t("proxy same-origin") : t("directo (CORS)");
    swapBtn.hidden = !cfg.altUrl;
    swapBtn.textContent = cfg.altUrl && cfg.altUrl !== cfg.baseUrl ? t("Usar alternativa") : t("Usar principal");
  }

  async function probar() {
    probarBtn.disabled = true;
    probarBtn.textContent = t("Probando…");
    try {
      const info = await Client.info();
      kvVer.querySelector("b").textContent = `v${info.version}`;
      toast(t("Conexión OK · opencode v{version}", { version: info.version }));
    } catch (e) {
      kvVer.querySelector("b").textContent = "—";
      toast(e.message || t("Sin conexión"));
    } finally {
      probarBtn.disabled = false;
      probarBtn.textContent = t("Probar conexión");
    }
  }

  function swapUrl() {
    const cfg = loadConfig();
    if (!cfg.altUrl) return;
    saveConfig({ baseUrl: cfg.altUrl, altUrl: cfg.baseUrl || "" });
    pintarConexion();
    toast(t("URL principal intercambiada"));
    probar();
  }

  pintarConexion();

  main.append(
    h("section", { class: "sec" }, h("h2", {}, t("Conexión")), kvUrl, kvAlt, kvModo, kvVer,
      h("div", { class: "btn-row" }, probarBtn, cambiarBtn, swapBtn))
  );

  /* ================= SEGURIDAD ================= */
  const secSeg = h("section", { class: "sec" }, h("h2", {}, t("Seguridad")));

  if (origenInseguro(loadConfig().baseUrl)) {
    secSeg.append(
      h("div", { class: "warn" },
        t("⚠ Conexión por HTTP sin cifrar: la contraseña viaja visible por la red. Usa el QR con tunnel https."))
    );
  }

  if (!pinSoportado()) {
    secSeg.append(
      h("p", { class: "hint" },
        t("PIN no disponible en este origen: Web Crypto requiere https o localhost (en LAN por http no existe)."))
    );
  } else {
    const pinBox = h("div", { class: "pin-box" });
    secSeg.append(pinBox);

    function pintarPin() {
      pinBox.textContent = "";
      if (hasPin()) {
        const sel = h("select", { onChange: (e) => { setTimeoutMin(Number(e.target.value)); toast(t("Inactividad actualizada")); } },
          ...[1, 5, 10, 15, 30].map((m) =>
            h("option", { value: String(m), selected: lockCfg().timeout === m ? true : false },
              `${m} ${m > 1 ? t("minutos") : t("minuto")}`)
          )
        );
        pinBox.append(
          h("p", { class: "hint" }, t("🔒 Bloqueo con PIN activo.")),
          h("label", {}, t("Cerrar por inactividad"), sel),
          h("div", { class: "btn-row" },
            h("button", { class: "ghost", onClick: () => { lockNow("manual"); toast(t("Bloqueado")); } }, t("Bloquear ahora")),
            h("button", {
              class: "danger",
              onClick: () => {
                if (confirm(t("¿Desactivar el PIN de este dispositivo?"))) {
                  clearPin();
                  pintarPin();
                  toast(t("PIN desactivado"));
                }
              },
            }, t("Desactivar PIN")))
        );
      } else {
        const input = h("input", {
          type: "password",
          inputmode: "numeric",
          minlength: "4",
          maxlength: "12",
          placeholder: t("4 a 12 caracteres"),
          autocomplete: "new-password",
        });
        const activar = h("button", {
          class: "ghost",
          onClick: async () => {
            const v = input.value;
            if (v.length < 4) return toast(t("PIN demasiado corto (mínimo 4)"));
            activar.disabled = true;
            activar.textContent = t("Guardando…");
            try {
              await setPin(v);
              pintarPin();
              toast(t("PIN activado · se pedirá al abrir la app"));
            } finally {
              activar.disabled = false;
              activar.textContent = t("Activar PIN");
            }
          },
        }, t("Activar PIN"));
        pinBox.append(
          h("p", { class: "hint" },
            t("PIN local del móvil (no es el del servidor): se guarda como hash PBKDF2, nunca en claro.")),
          h("label", {}, t("Nuevo PIN"), h("div", { class: "secret-wrap" }, input)),
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
          if (!confirm(t("¿Cerrar sesión? Se borrará la contraseña guardada en este dispositivo."))) return;
          clearConfig();
          toast(t("Sesión cerrada"));
          navigate("/setup");
        },
      }, t("Cerrar sesión en este dispositivo")))
  );

  main.append(secSeg);

  /* ================= APARIENCIA ================= */
  const ETIQUETAS = { auto: t("Auto"), claro: t("Claro"), oscuro: t("Oscuro") };
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
    h("section", { class: "sec" }, h("h2", {}, t("Apariencia")),
      h("p", { class: "hint" }, t("«Auto» sigue el modo claro/oscuro del sistema.")),
      h("div", { class: "seg", role: "group", "aria-label": t("Tema") }, ...botonesTema),
      h("label", { class: "fila-toggle" },
        h("input", {
          type: "checkbox",
          checked: localStorage.getItem("ocmovil.compacto") === "1" ? true : false,
          onChange: (e) => {
            try {
              localStorage.setItem("ocmovil.compacto", e.target.checked ? "1" : "0");
            } catch {
              /* best-effort */
            }
            document.body.classList.toggle("compacto", e.target.checked);
          },
        }),
        t("Modo compacto (más mensajes en pantalla)")),
      /* Selector de idioma: al cambiarlo se recarga la vista para repintar
         TODOS los textos (es una app sin framework de reactividad). */
      h("label", { class: "fila-toggle" },
        h("span", {}, t("Idioma")),
        h("select", {
          "aria-label": t("Idioma de la interfaz"),
          onChange: (e) => {
            setIdioma(e.target.value);
            navigate("/settings");
            location.reload();
          },
        }, ...IDIOMAS.map((i) =>
          h("option", { value: i.id, selected: getIdioma() === i.id ? true : false }, i.nombre)))))
  );

  /* ================= ATAJOS DE TECLADO ================= */
  /* Solo en escritorio (con teclado fisico); en movil no se muestran. */
  if (esEscritorio()) {
    main.append(
      h("section", { class: "sec" }, h("h2", {}, t("Atajos de teclado")),
        h("p", { class: "hint" }, t("Solo en ordenador (con teclado).")),
        h("div", { class: "atajos" },
          h("div", { class: "atajo" },
            h("kbd", {}, "Ctrl"), h("span", {}, "+"), h("kbd", {}, "K"),
            h("span", { class: "atajo-desc" }, t("Buscar (en sesiones y en el chat)"))),
          h("div", { class: "atajo" },
            h("kbd", {}, "Enter"),
            h("span", { class: "atajo-desc" }, t("Enviar el mensaje"))),
          h("div", { class: "atajo" },
            h("kbd", {}, "Shift"), h("span", {}, "+"), h("kbd", {}, "Enter"),
            h("span", { class: "atajo-desc" }, t("Salto de línea en el mensaje"))),
          h("div", { class: "atajo" },
            h("kbd", {}, "Esc"),
            h("span", { class: "atajo-desc" }, t("Cerrar la búsqueda o el panel abierto")))
        ),
        h("p", { class: "hint" }, t("En macOS, usa Cmd en lugar de Ctrl.")))
    );
  }

  /* ================= NOTIFICACIONES ================= */
  const secNotif = h("section", { class: "sec" }, h("h2", {}, "Notificaciones"));
  const cajaNotif = h("div", { class: "pin-box" });
  secNotif.append(cajaNotif);

  function pintarNotif() {
    cajaNotif.textContent = "";
    const est = estadoNotif();

    if (est === "no-soportado") {
      cajaNotif.append(
        h("p", { class: "hint" },
          t("Este navegador no soporta notificaciones. Usa el badge 🛡 de la lista y el banner del chat, que sí funcionan."))
      );
      return;
    }
    if (est === "inseguro") {
      cajaNotif.append(
        h("div", { class: "warn" },
          t("⚠ Las notificaciones necesitan HTTPS o localhost. Abre la app con el túnel https (QR) para activarlas."))
      );
      return;
    }
    // iOS: solo puede notificar si la app esta INSTALADA en la pantalla de inicio
    if (est === "ios-no-instalada") {
      cajaNotif.append(
        h("p", { class: "hint" },
          t("En iPhone/iPad, Apple solo permite notificar a las webs **instaladas**. Instálala y vuelve aquí:")),
        h("ol", { class: "pasos" },
          h("li", {}, t("Pulsa **Compartir** (el cuadrado con la flecha) en Safari.")),
          h("li", {}, t("Elige **«Añadir a pantalla de inicio»**.")),
          h("li", {}, t("Abre la app desde el icono nuevo y activa aquí las notificaciones."))
        ),
        h("p", { class: "hint" },
          t("Aviso: aunque la instales, Apple **no permite** despertar la app en segundo plano, así que el aviso llega solo si acabas de dejar la app (unos segundos). El badge 🛡 y el banner del chat siempre funcionan."))
      );
      return;
    }

    const texto =
      est === "granted"
        ? t("Activadas: te avisaré cuando el agente pida un permiso y no estés mirando la app.")
        : est === "denied"
          ? t("Bloqueadas por el navegador. Actívalas en los ajustes del sitio (icono junto a la URL) y recarga.")
          : t("Desactivadas.");
    cajaNotif.append(h("p", { class: "hint" }, texto));

    if (est !== "granted") {
      const btnAct = h("button", {
        class: "ghost",
        onClick: async () => {
          const r = await pedirPermiso();
          pintarNotif();
          toast(
            r === "granted"
              ? t("Notificaciones activadas")
              : r === "denied"
                ? t("Permiso denegado en el navegador")
                : t("Permiso no concedido")
          );
        },
      }, t("Activar notificaciones"));
      cajaNotif.append(h("div", { class: "btn-row" }, btnAct));
    } else {
      const btnPrueba = h("button", {
        class: "ghost",
        onClick: async () => {
          const ok = await notificar("OpenCode Móvil", t("Prueba: así se verá el aviso de un permiso pendiente."), {
            tag: "ocmovil-prueba",
            onClickUrl: location.origin + location.pathname + "#/permissions",
          });
          if (!ok) toast(t("No se pudo mostrar la notificación"));
        },
      }, t("Probar notificación"));
      cajaNotif.append(h("div", { class: "btn-row" }, btnPrueba));
    }

    cajaNotif.append(
      h("p", { class: "hint" },
        t("Avisos solo en segundo plano y con permiso concedido. Android mantiene la app viva unos 30 s tras ocultarla; pasada esa ventana no puede avisar."))
    );
  }
  pintarNotif();
  main.append(secNotif);

  /* ================= NOTIFICACIONES PUSH (app cerrada) =================
     Las de arriba son LOCALES (necesitan la app viva unos segundos). Estas son
     PUSH real: llegan con la app cerrada porque el navegador mantiene el canal
     y el servicio (server/push-server.mjs) lo despierta. */
  const secPush = h("section", { class: "sec" }, h("h2", {}, t("Notificaciones push (app cerrada)")));
  const cajaPush = h("div", { class: "pin-box" });
  secPush.append(cajaPush);

  async function pintarPush() {
    cajaPush.textContent = "";
    const cap = pushCapacidad();

    if (!cap.puede) {
      const motivo =
        cap.motivo === "inseguro"
          ? t("⚠ El push necesita HTTPS o localhost. En LAN por HTTP el navegador no lo permite: usa el túnel https (QR).")
          : cap.motivo === "ios-no-instalada"
            ? t("En iPhone/iPad, Apple solo permite push a las webs **instaladas** en la pantalla de inicio. Instálala primero (ver arriba).")
            : t("Este navegador no soporta Web Push.");
      cajaPush.append(h("p", { class: "hint" }, motivo));
      return;
    }

    const url = getPushUrl();
    const est = await pushEstado();

    cajaPush.append(
      h("p", { class: "hint" },
        t("A diferencia de las de arriba, estas llegan con la app CERRADA. Necesitan el servicio push corriendo en tu PC (server/push-server.mjs) y su URL aquí."))
    );

    // campo de URL del servicio
    const urlInput = h("input", {
      type: "url",
      name: "pushUrl",
      value: url,
      placeholder: "https://tu-tunel.trycloudflare.com",
      autocomplete: "off",
      spellcheck: "false",
      "aria-label": t("URL del servicio push"),
    });
    cajaPush.append(h("label", {}, t("URL del servicio push"), urlInput));

    const estadoTxt =
      est === "activo"
        ? t("✅ Activas en este dispositivo.")
        : est === "inactivo"
          ? t("Desactivadas en este dispositivo.")
          : t("No se pudo comprobar.");
    cajaPush.append(h("p", { class: "hint" }, estadoTxt));

    const btnGuardar = h("button", {
      class: "ghost",
      onClick: async () => {
        setPushUrl(urlInput.value);
        toast(t("URL del servicio guardada"));
        await pintarPush();
      },
    }, t("Guardar URL"));

    const btnActivar = h("button", {
      class: "ghost",
      onClick: async () => {
        setPushUrl(urlInput.value);
        const r = await activarPush();
        if (!r.ok) {
          const msg =
            r.error === "sin-servicio"
              ? t("Pon primero la URL del servicio push.")
              : r.error === "denied"
                ? t("Permiso de notificaciones denegado")
                : t("No se pudo activar") + ": " + r.error;
          toast(msg);
        } else {
          toast(t("Push activado en este dispositivo"));
        }
        await pintarPush();
      },
    }, t("Activar push"));

    const btnDesactivar = h("button", {
      class: "ghost",
      onClick: async () => {
        await desactivarPush();
        toast(t("Push desactivado"));
        await pintarPush();
      },
    }, t("Desactivar push"));

    const btnPrueba = h("button", {
      class: "ghost",
      onClick: async () => {
        const r = await probarPush();
        toast(r.ok ? t("Aviso de prueba enviado") : t("No se pudo enviar") + ": " + r.error);
      },
    }, t("Enviar prueba"));

    const fila = est === "activo"
      ? h("div", { class: "btn-row" }, btnPrueba, btnDesactivar)
      : h("div", { class: "btn-row" }, btnActivar);
    cajaPush.append(fila, h("div", { class: "btn-row" }, btnGuardar));

    cajaPush.append(
      h("p", { class: "hint" },
        t("El servicio push se arranca con: node server/push-server.mjs (en tu PC, junto a opencode)."))
    );
  }
  await pintarPush();
  main.append(secPush);


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
      : t("Sin errores registrados."));
  const verBtn = h("button", {
    class: "ghost",
    onClick: () => { logPre.hidden = !logPre.hidden; },
  }, t("Errores locales ({n})", { n: errores.length }));
  const limpiarBtn = h("button", {
    class: "ghost",
    onClick: () => {
      localStorage.removeItem(ERR_KEY);
      logPre.textContent = t("Sin errores registrados.");
      verBtn.textContent = t("Errores locales ({n})", { n: 0 });
      toast(t("Log de errores limpiado"));
    },
  }, t("Limpiar log"));
  const cacheBtn = h("button", {
    class: "ghost",
    onClick: async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.filter((k) => k.startsWith("ocmovil-")).map((k) => caches.delete(k)));
        toast(t("Caché vaciada · recargando"));
        setTimeout(() => location.reload(), 600);
      } catch {
        toast(t("No se pudo vaciar la caché"));
      }
    },
  }, t("Vaciar caché"));

  main.append(
    h("section", { class: "sec" }, h("h2", {}, t("Diagnóstico")),
      h("div", { class: "btn-row" }, verBtn, limpiarBtn, cacheBtn),
      logPre)
  );

  /* ================= SISTEMA ================= */
  main.append(
    h("section", { class: "sec" }, h("h2", {}, t("Sistema")),
      h("p", { class: "hint" }, t("Estado de los servicios del servidor: MCP, proveedores, plugins, skills y comandos.")),
      h("div", { class: "btn-row" },
        h("button", { class: "ghost", onClick: () => navigate("/system") }, t("Ver sistema"))))
  );

  /* ================= ACERCA DE ================= */
  main.append(
    h("section", { class: "sec" }, h("h2", {}, t("Acerca de")),
      h("p", { class: "hint" },
        t("OpenCode Móvil · PWA sin frameworks (Vite + JS vanilla). Cliente de la API HTTP de opencode: sesiones, chat en streaming, permisos y bloqueo con PIN.")))
  );
}
