# Accessibility

> **Español:** [Ir a la versión en español](#español)

OpenCode Móvil is a small, framework-free PWA. Accessibility is treated as a
design constraint, not an afterthought: the app has **no build-time a11y
tooling**, so every item below was either written by hand in the source or
measured against the running app.

**All five screens score 100/100 in Lighthouse accessibility, in both the dark
and the light theme** (10/10 combinations, verified with Lighthouse against the
running app, not the built bundle).

This document is deliberately honest: it lists **what is done**, **what is
limited**, and **how to report a barrier**.

## What the app does

### Colour and contrast

Both themes (dark / light / auto) were measured with the WCAG 2.1 contrast
formula. **Every text/background pair in the UI passes WCAG AA (≥ 4.5:1).**

| Pair (dark theme) | Ratio | | Pair (light theme) | Ratio |
| --- | --- | --- | --- | --- |
| Body text / background | 16.0:1 | | Body text / background | 15.8:1 |
| Secondary text / background | 6.2:1 | | Secondary text / background | 6.1:1 |
| Link / accent text | 6.2:1 | | Link / accent text | 5.2:1 |
| White on primary button | 4.6:1 | | White on primary button | 5.2:1 |
| White on "Allow" (green) | 4.6:1 | | White on "Allow" (green) | 5.1:1 |
| White on "Reject" (red) | 4.6:1 | | White on "Reject" (red) | 5.4:1 |
| Warning banner text | 6.6:1 | | Warning banner text | 6.6:1 |

Filled buttons use dedicated `--accent-strong` / `--ok-strong` / `--err-strong`
tokens, slightly darker than the text colours, specifically so that white label
text clears 4.5:1. The status badges in the System view (`active` / `inactive`)
use their own `--ok-badge` / `--err-badge` tokens for the same reason: their
tinted background made the base red fail at 4.15:1. Colour is never the **only**
way information is conveyed: permission outcomes and errors always carry a text
label.

### Keyboard and focus

- Every interactive element is a real `<button>`, `<a>`, `<select>` or `<input>`
  — no clickable `<div>`s, except the bottom-sheet backdrop (which also closes
  with Escape and has its own close button).
- Focus is always visible: a 2 px `:focus-visible` outline on buttons, links,
  `summary` and `select` (the default outline is never removed without a
  replacement).
- The bottom sheets (model picker, file browser) and the PIN lock are exposed as
  `role="dialog"` with `aria-modal="true"` and an accessible name. They close
  with **Escape**, and focus **returns to the element that opened them**.
- Touch targets follow the 44 px guideline: `.icon-btn` is 44×44, primary and
  ghost buttons are ≥ 44 px tall, secondary chips are ≥ 36 px.

### Screen readers

- The language of the document is updated at runtime (`<html lang>`), so
  pronunciation follows the selected UI language.
- Each screen exposes a single `<main>` landmark and a logical heading order
  (`h1` → `h2`), so a screen reader user can jump between sections.
- Icon-only buttons carry an `aria-label` (e.g. "Settings", "Stop", "Back"),
  and the emoji/glyph inside is `aria-hidden`, so a screen reader announces the
  **action**, not the symbol name.
- Controls whose visible text changes (the model chip, the pending-permission
  counter) keep the accessible name **in sync with the visible text**, as
  required by WCAG 2.5.3 (label in name).
- Toggle-style controls (Plan/Build, theme, language) expose their state with
  `aria-pressed`.
- Status changes are announced through scoped live regions: toasts
  (`role="status"`), the "typing…" indicator, the offline/reconnect banner and
  the permission banner. `aria-live` is deliberately **not** on the whole app
  container, which would make every repaint read out loud.
- Decorative-only graphics (the three-dot animation) are hidden with
  `aria-hidden="true"`.

### Motion, zoom and theming

- `prefers-reduced-motion: reduce` is honoured: entry animations are removed and
  smooth scrolling becomes instant.
- `prefers-color-scheme` drives the **auto** theme; the user can override it with
  an explicit light/dark choice.
- Pinch-zoom is **not** disabled (`user-scalable` is never set to `no`).
- Text inputs keep a **16 px** font size on iOS to prevent the automatic
  zoom-on-focus that would otherwise break the layout.

## Known limitations

We would rather state these than pretend they do not exist:

- **Streaming chat text is not announced token by token.** The message log is
  deliberately **not** a live region: the model streams in small fragments and
  announcing each one produces unusable noise. What *is* announced are the
  discrete events (started "typing", stopped, new permission request). A screen
  reader user reads the finished reply by navigating the log manually.
- **No formal audit has been run** with an assistive-technology user, and the app
  has not been tested with a real screen reader on a physical device. The items
  above were verified in the browser (accessibility tree / DOM inspection), not
  by a human SR user.
- **The bottom sheet is not a full focus trap.** Focus returns to the opener and
  Escape closes it, but Tab is not cycled inside the sheet while it is open.
- **The PIN lock requires a secure context** (HTTPS or `localhost`) because it
  uses Web Crypto. Served over plain HTTP on a LAN, the PIN is unavailable and
  the app says so instead of failing silently.
- **The UI is mobile-first.** On a desktop screen it renders as a narrow phone
  column; it is usable with a keyboard but is not optimised for large viewports.
- **Emoji are used as icons** in a few places. They are always accompanied by an
  `aria-label` or visible text, but their rendering varies between platforms.

## Reporting an accessibility barrier

If something is unusable with your setup, please
[**open an issue**](https://github.com/axi010/opencode-mobile-pwa/issues/new/choose)
and use the *Accessibility* topic. Helpful details:

- The barrier and what you expected to happen
- Your environment: OS, browser, assistive technology and version
- The screen or flow where it happens (sessions, chat, permissions, settings…)
- Whether it reproduces in the [live demo](https://axi010.github.io/opencode-mobile-pwa/)
  (fake data, nothing to install)

Accessibility reports are treated with the same priority as bugs. Fixes that
improve contrast, focus handling or labelling are very welcome as pull requests
— see [CONTRIBUTING.md](CONTRIBUTING.md).

---

# Español

OpenCode Móvil es una PWA pequeña y sin frameworks. La accesibilidad se trata
como un requisito de diseño, no como un añadido: la app **no usa herramientas de
accesibilidad en el build**, así que cada punto de abajo está escrito a mano en
el código o **medido** sobre la app en marcha.

**Las cinco pantallas sacan 100/100 en accesibilidad de Lighthouse, tanto en tema
oscuro como claro** (10/10 combinaciones, verificado con Lighthouse sobre la app
en marcha, no sobre el bundle compilado).

Este documento es deliberadamente honesto: lista **lo que se hace**, **lo que
está limitado** y **cómo reportar una barrera**.

## Lo que hace la app

### Color y contraste

Los dos temas (oscuro / claro / automático) se midieron con la fórmula de
contraste de WCAG 2.1. **Todos los pares texto/fondo de la interfaz superan el
nivel AA (≥ 4,5:1).**

| Par (tema oscuro) | Ratio | | Par (tema claro) | Ratio |
| --- | --- | --- | --- | --- |
| Texto principal / fondo | 16,0:1 | | Texto principal / fondo | 15,8:1 |
| Texto secundario / fondo | 6,2:1 | | Texto secundario / fondo | 6,1:1 |
| Enlace / texto de acento | 6,2:1 | | Enlace / texto de acento | 5,2:1 |
| Blanco sobre botón primario | 4,6:1 | | Blanco sobre botón primario | 5,2:1 |
| Blanco sobre "Permitir" (verde) | 4,6:1 | | Blanco sobre "Permitir" (verde) | 5,1:1 |
| Blanco sobre "Rechazar" (rojo) | 4,6:1 | | Blanco sobre "Rechazar" (rojo) | 5,4:1 |
| Texto del aviso | 6,6:1 | | Texto del aviso | 6,6:1 |

Los botones rellenos usan tokens propios (`--accent-strong`, `--ok-strong`,
`--err-strong`), algo más oscuros que los colores de texto, precisamente para que
la etiqueta blanca supere 4,5:1. Los badges de estado de la vista Sistema
(`activo` / `inactivo`) usan tokens propios (`--ok-badge`, `--err-badge`) por el
mismo motivo: sobre su fondo tintado, el rojo base se quedaba en 4,15:1. El color
**nunca** es la única forma de transmitir información: los resultados de permisos
y los errores siempre llevan texto.

### Teclado y foco

- Todo elemento interactivo es un `<button>`, `<a>`, `<select>` o `<input>` real
  — no hay `<div>` que se pueda pulsar, salvo el fondo de la hoja inferior (que
  además se cierra con Escape y tiene su propio botón de cerrar).
- El foco siempre se ve: contorno `:focus-visible` de 2 px en botones, enlaces,
  `summary` y `select` (nunca se quita el contorno por defecto sin poner otro).
- Las hojas inferiores (selector de modelo, explorador de archivos) y el bloqueo
  por PIN se exponen como `role="dialog"` con `aria-modal="true"` y nombre
  accesible. Se cierran con **Escape** y el foco **vuelve al elemento que las
  abrió**.
- Los objetivos táctiles siguen la guía de 44 px: `.icon-btn` mide 44×44, los
  botones principales y fantasma ≥ 44 px de alto, los chips secundarios ≥ 36 px.

### Lectores de pantalla

- El idioma del documento se actualiza en tiempo de ejecución (`<html lang>`),
  así que la pronunciación sigue al idioma elegido.
- Cada pantalla expone un único *landmark* `<main>` y un orden de encabezados
  lógico (`h1` → `h2`), para que quien use lector de pantalla salte entre
  secciones.
- Los botones que solo tienen icono llevan `aria-label` (p. ej. "Ajustes",
  "Detener", "Volver") y el emoji/glyph interior va `aria-hidden`, de modo que el
  lector anuncia la **acción**, no el nombre del símbolo.
- Los controles cuyo texto visible cambia (el chip de modelo, el contador de
  permisos pendientes) mantienen el nombre accesible **sincronizado con el texto
  visible**, como exige WCAG 2.5.3 (label in name).
- Los controles de tipo interruptor (Plan/Build, tema, idioma) exponen su estado
  con `aria-pressed`.
- Los cambios de estado se anuncian con regiones vivas acotadas: los avisos
  (`role="status"`), el indicador "escribiendo…", el cartel de sin conexión y el
  cartel de permisos. `aria-live` **no** está en todo el contenedor de la app a
  propósito: eso haría que cada repintado se leyera en voz alta.
- Los gráficos solo decorativos (la animación de tres puntos) se ocultan con
  `aria-hidden="true"`.

### Movimiento, zoom y temas

- Se respeta `prefers-reduced-motion: reduce`: se quitan las animaciones de
  entrada y el desplazamiento suave pasa a ser instantáneo.
- `prefers-color-scheme` decide el tema **automático**; el usuario puede
  forzar claro u oscuro.
- El zoom con los dedos **no** está desactivado (nunca se pone
  `user-scalable=no`).
- Los campos de texto mantienen **16 px** en iOS para evitar el zoom automático
  al enfocar, que rompería el diseño.

## Limitaciones conocidas

Preferimos decirlas a fingir que no existen:

- **El texto del chat en streaming no se anuncia fragmento a fragmento.** El
  registro de mensajes **no** es una región viva a propósito: el modelo escribe en
  trozos pequeños y anunciar cada uno sería un ruido insufrible. Sí se anuncian
  los eventos discretos (empieza "escribiendo", termina, nueva petición de
  permiso). Quien use lector de pantalla lee la respuesta terminada navegando el
  registro a mano.
- **No se ha hecho una auditoría formal** con una persona usuaria de productos de
  apoyo, ni se ha probado con un lector de pantalla real en un dispositivo
  físico. Lo de arriba se verificó en el navegador (árbol de accesibilidad /
  inspección del DOM), no con una persona que use lector de pantalla.
- **La hoja inferior no atrapa el foco del todo.** El foco vuelve al origen y
  Escape la cierra, pero el tabulador no queda confinado dentro de la hoja
  mientras está abierta.
- **El PIN exige contexto seguro** (HTTPS o `localhost`) porque usa Web Crypto.
  Servida por HTTP plano en la red local, la función de PIN no está disponible y
  la app lo avisa en vez de fallar en silencio.
- **La interfaz es mobile-first.** En pantalla de escritorio se ve como una
  columna estrecha de móvil; se puede usar con teclado, pero no está optimizada
  para pantallas grandes.
- **En algunos sitios se usan emojis como iconos.** Siempre van acompañados de un
  `aria-label` o de texto visible, pero su dibujo cambia según la plataforma.

## Cómo reportar una barrera de accesibilidad

Si algo no te resulta usable en tu entorno, por favor
[**abre un issue**](https://github.com/axi010/opencode-mobile-pwa/issues/new/choose)
y usa el tema *Accessibility*. Detalles que ayudan:

- La barrera y qué esperabas que ocurriera
- Tu entorno: sistema operativo, navegador, producto de apoyo y versión
- La pantalla o el flujo donde ocurre (sesiones, chat, permisos, ajustes…)
- Si se reproduce en la [demo pública](https://axi010.github.io/opencode-mobile-pwa/)
  (datos ficticios, sin instalar nada)

Los informes de accesibilidad se tratan con la misma prioridad que los errores.
Las mejoras de contraste, foco o etiquetado son muy bienvenidas como pull
requests — mira [CONTRIBUTING.md](CONTRIBUTING.md).
