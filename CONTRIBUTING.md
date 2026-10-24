# Contributing

Thanks for your interest in improving **OpenCode Móvil**! 🎉

> **Español:** puedes abrir *issues* y *pull requests* en español o en inglés.

## Before you start

- This is a **framework-free** project: vanilla JS + a tiny DOM helper (`h()`).
  Please **do not add a UI framework** (React, Vue, Svelte, Tailwind…) — the
  small size and the strict CSP are deliberate design goals.
- Read the [Security Policy](SECURITY.md) before touching auth, the PIN or the
  proxy.
- The app targets the **real opencode HTTP API**. Behaviour is verified against a
  running server, not mocked.

## Development setup

```bash
git clone https://github.com/axi010/opencode-mobile-pwa
cd opencode-mobile-pwa
npm install

npm run dev        # http://localhost:5173
npm run build      # production build (strict CSP injected)
npm run preview    # serves dist/ with the /api proxy -> http://localhost:4173
```

You need a running **opencode** server on `127.0.0.1:28894` to test the app.

## Code guidelines

1. **No inline scripts or styles.** The production build enforces
   `script-src 'self'`. Use the `h()` helper and CSS classes; if you must set a
   style from JS, use `el.style.x = …` (allowed by CSP), never an inline
   `style="…"` attribute.
2. **Never hard-code credentials or personal paths.** Config lives in
   `localStorage`; scripts read the password from the opencode CLI in memory.
3. **Keep comments in Spanish** (project convention), code identifiers in
   English/Spanish as in the surrounding file.
4. **CSS:** when you touch `styles.css`, keep every class the JS uses
   (grep `class:` in `src/`). The theme uses CSS variables in `:root` and
   `:root[data-theme="light"]` — use those variables, do not hard-code colours.
5. **Comments explaining *why*** are welcome; avoid narrating obvious code.

## Pull requests

1. Fork the repo and create a branch: `git checkout -b feat/short-name`.
2. Keep the change focused; one feature or fix per PR.
3. Run `npm run build` and make sure it succeeds.
4. Test in a browser **and, if the change affects the mobile flow, through the
   HTTPS tunnel** (`scripts/movil.ps1` / `scripts/movil.sh`).
5. Update `README.md` if you add or change user-facing behaviour.
6. Open the PR using the template and describe **what** and **why**.

## Commit messages

Short imperative subject, optionally with a scope:

```
chat: add copy button for code blocks
security: back off after repeated wrong PINs
```

## Reporting bugs / requesting features

Use the issue templates in **.github/ISSUE_TEMPLATE/**. Include the opencode
version, how you serve the app (dev / preview / tunnel) and the browser.

---

# Contribuir

¡Gracias por querer mejorar **OpenCode Móvil**! Puedes escribir en **español o
inglés**.

## Antes de empezar

- Este proyecto **no usa frameworks**: JS vanilla + un helper DOM (`h()`).
  **No añadas un framework de UI** ni Tailwind: el tamaño reducido y la CSP
  estricta son objetivos de diseño.
- Lee la [Política de seguridad](SECURITY.md) antes de tocar autenticación, PIN
  o el proxy.
- La app se prueba contra un servidor opencode **real**, no con mocks.

## Puesta en marcha

```bash
git clone https://github.com/axi010/opencode-mobile-pwa
cd opencode-mobile-pwa
npm install
npm run dev        # http://localhost:5173
npm run build      # build de producción (inyecta la CSP estricta)
npm run preview    # sirve dist/ con el proxy /api -> http://localhost:4173
```

Necesitas un servidor **opencode** en marcha en `127.0.0.1:28894`.

## Normas de código

1. **Nada de scripts ni estilos en línea.** El build aplica `script-src 'self'`.
   Usa el helper `h()` y clases CSS; si necesitas un estilo desde JS, usa
   `el.style.x = …` (permitido), nunca un atributo `style="…"`.
2. **Nunca escribas credenciales ni rutas personales.** La config vive en
   `localStorage`; los scripts leen la contraseña del CLI de opencode en memoria.
3. **Comentarios en español** (convención del proyecto).
4. **CSS:** al tocar `styles.css`, conserva las clases que usa el JS
   (`grep 'class:'` en `src/`) y usa las **variables CSS** del tema, no colores
   fijos.
5. Los comentarios que explican el **porqué** son bienvenidos.

## Pull requests

1. Haz *fork* y crea una rama: `git checkout -b feat/nombre-corto`.
2. Un cambio = una funcionalidad o arreglo.
3. Ejecuta `npm run build` y asegúrate de que compila.
4. Prueba en el navegador **y, si afecta al flujo móvil, por el túnel HTTPS**
   (`scripts/movil.ps1` / `scripts/movil.sh`).
5. Actualiza `README.md` si cambias algo visible para el usuario.
6. Abre la PR con la plantilla, explicando **qué** y **por qué**.

## Cómo reportar

Usa las plantillas de *issues* en **.github/ISSUE_TEMPLATE/**. Incluye la versión
de opencode, cómo sirves la app (dev / preview / túnel) y el navegador.
