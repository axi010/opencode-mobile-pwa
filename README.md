# OpenCode Móvil — PWA client for opencode

> ⚠️ **Disclaimer / Aviso**: this is an **unofficial, community-made** project.
> It is **not built by the OpenCode team** and is **not affiliated with or
> endorsed by** [opencode](https://opencode.ai) or Anomaly in any way.
> «opencode» is used only to describe what this app connects to.
>
> Este es un proyecto **no oficial** hecho por la comunidad. **No está
> desarrollado por el equipo de OpenCode** ni está **afiliado ni respaldado** por
> [opencode](https://opencode.ai) o Anomaly.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![No frameworks](https://img.shields.io/badge/frameworks-none-brightgreen.svg)](#-features)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8.svg)](#-features)
[![GitHub stars](https://img.shields.io/github/stars/axi010/opencode-mobile-pwa?style=social)](https://github.com/axi010/opencode-mobile-pwa/stargazers)

A **mobile Progressive Web App** to drive your [opencode](https://opencode.ai) server from your phone: chat with your sessions in real time, approve permissions, pick the model, browse your project's files and attach them, all from a tiny, dependency-free client.

> **Español:** [Ir a la versión en español](#-español)

---

## ✨ Features

- **Real-time chat** with streaming responses (SSE), reasoning, tool chips and a stop button.
- **Permission control**: approve or reject what the agent asks for (**once / always / reject**), right from your phone. Live banner in the chat, badge counter in the session list and a dedicated screen.
- **Plan / Build mode switch**: flip the agent's mode with one tap.
- **Model + variant picker**: 130+ models from all your providers, with search and per-model reasoning variants (`low`…`max`).
- **Attach files** from the PC: browse your project folders and reference files in your prompt.
- **Security**: strict CSP in production, **PIN lock** (PBKDF2, brute-force cooldown, auto-lock on inactivity), QR token scrubbing from the URL, "log out" button.
- **Light / dark / auto theme**, following your system.
- **Local notifications** when the agent needs a permission while you are not looking at the app.
- **No frameworks**: vanilla JS + a ~20-line DOM helper. ~45 kB gzipped.

## 📱 Screenshots

| Sessions | Chat | Permissions |
| --- | --- | --- |
| ![Sessions](screenshots/sessions.png) | ![Chat](screenshots/chat.png) | ![Permissions](screenshots/permissions.png) |

> Screenshots show **fictional demo data**. The app itself stores nothing but your
> own credential on your device.


## 🔧 Requirements

- [opencode](https://opencode.ai) desktop or CLI installed and running on your PC (the server listens on `127.0.0.1:28894`).
- Node.js 18+ to build and serve the PWA.

## 🚀 Quick start

```bash
git clone <this-repo>
cd opencode-mobile
npm install

# Development (hot reload), reachable from your LAN:
npm run dev            # http://localhost:5173

# Production build + serve (with the /api proxy the app needs):
npm run build
npm run preview        # http://localhost:4173
```

Then open the app and connect:

```bash
# Generate a QR with a 30-day token and scan it with your phone:
node scripts/qr-pairing.mjs http://<your-lan-ip>:5173
```

### HTTPS access from the phone (recommended)

Some features (**PIN lock, service worker, notifications**) require a *secure context*. `http://localhost` counts, but a LAN IP does not. To get real HTTPS:

```powershell
# Windows
pwsh scripts/movil.ps1
```

```bash
# macOS / Linux
bash scripts/movil.sh
```

It starts the preview, opens a Cloudflare quick tunnel and generates a QR pointing to the HTTPS URL. Requires [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/).

## 🧠 How it connects

The opencode API only allows CORS from loopback, so the PWA talks to `/api` **on its own origin** and the Vite dev/preview server proxies it to `127.0.0.1:28894` (see `vite.config.js`). This makes it work identically on `localhost`, on your LAN and through the tunnel.

## 🔒 Security notes

- The **server password is never written to disk** in the repo; the QR script reads it from the opencode CLI in memory.
- A **QR contains a 30-day token** (equivalent to the password). Treat it as a secret.
- The app stores the credential in the phone's `localStorage`.
- **PIN lock** is local to the device (PBKDF2-SHA256, 150k iterations, per-failure back-off).

## 🗂 Project layout

```
opencode-mobile/
├── index.html
├── vite.config.js          # base path, /api proxy, strict CSP for production builds
├── public/                 # manifest, service worker, icons
├── scripts/
│   ├── qr-pairing.mjs      # generate the access QR (cross-platform)
│   ├── movil.ps1 / movil.sh # one-shot: preview + cloudflare tunnel + QR
│   └── generar_iconos.ps1
└── src/
    ├── main.js             # bootstrap, routes, theme, lock
    ├── api/client.js       # HTTP + SSE client
    ├── security.js         # PIN (PBKDF2), inactivity lock
    ├── theme.js            # light/dark/auto
    ├── notify.js           # local notifications
    ├── permisos-avisos.js  # background permission watcher
    ├── ui/                 # dom.js, router.js, chat-controls.js
    └── views/              # setup, sessions, chat, permissions, settings
```

## 📄 License

MIT — see [LICENSE](LICENSE).

---

# 🇪🇸 Español

Un **cliente PWA para móvil** que te permite manejar tu servidor [opencode](https://opencode.ai) desde el teléfono: chatear con tus sesiones en tiempo real, aprobar permisos, elegir el modelo, explorar los archivos de tu proyecto y adjuntarlos, todo con un cliente pequeño y sin dependencias.

## ✨ Qué hace

- **Chat en tiempo real** con respuestas en streaming (SSE), razonamiento, chips de herramientas y botón de detener.
- **Control de permisos**: aprueba o rechaza lo que pide el agente (**una vez / siempre / rechazar**) desde el móvil. Banner en vivo en el chat, contador en la lista de sesiones y pantalla propia.
- **Conmutador Plan / Build**: cambia el modo del agente con un toque.
- **Selector de modelo y variante**: más de 130 modelos de todos tus proveedores, con buscador y variantes de razonamiento (`low`…`max`).
- **Adjuntar archivos** del PC: navega por las carpetas de tu proyecto y referéncialos en el mensaje.
- **Seguridad**: CSP estricta en producción, **bloqueo con PIN** (PBKDF2, cooldown antifuerza bruta, cierre por inactividad), borrado del token del QR en la URL y botón de cerrar sesión.
- **Tema claro / oscuro / automático**, siguiendo al sistema.
- **Notificaciones locales** cuando el agente pide un permiso y no estás mirando la app.
- **Sin frameworks**: JS vanilla + un helper DOM de ~20 líneas. Unos 45 kB comprimidos.

## 🔧 Requisitos

- [opencode](https://opencode.ai) instalado y en marcha en tu PC (el servidor escucha en `127.0.0.1:28894`).
- Node.js 18+ para compilar y servir la PWA.

## 🚀 Puesta en marcha

```bash
git clone <este-repo>
cd opencode-mobile
npm install

npm run dev            # desarrollo, accesible desde tu LAN (http://localhost:5173)
npm run build          # build de producción
npm run preview        # sirve el build con el proxy /api (http://localhost:4173)
```

Luego genera el QR y escanéalo desde el móvil:

```bash
node scripts/qr-pairing.mjs http://<ip-de-tu-pc>:5173
```

### Acceso por HTTPS desde el móvil (recomendado)

Algunas funciones (**PIN, service worker, notificaciones**) necesitan un *contexto seguro*. `http://localhost` lo es, pero una IP de LAN no. Para tener HTTPS de verdad:

```powershell
pwsh scripts/movil.ps1     # Windows
```

```bash
bash scripts/movil.sh      # macOS / Linux
```

Arranca la preview, abre un túnel rápido de Cloudflare y genera un QR apuntando a la URL HTTPS. Requiere [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/).

## 🧠 Cómo se conecta

La API de opencode solo permite CORS desde loopback, así que la PWA habla con `/api` **en su propio origen** y el servidor de Vite lo reenvía a `127.0.0.1:28894` (ver `vite.config.js`). Así funciona igual en `localhost`, en tu LAN y a través del túnel.

## 🔒 Notas de seguridad

- La **contraseña del servidor nunca se guarda en disco** dentro del repo; el script del QR la lee del CLI de opencode solo en memoria.
- Un **QR contiene un token de 30 días** (equivalente a la contraseña). Trátalo como un secreto.
- La app guarda la credencial en el `localStorage` del móvil.
- El **PIN** es local al dispositivo (PBKDF2-SHA256, 150k iteraciones, espera creciente por fallo).

## 📄 Licencia

MIT — ver [LICENSE](LICENSE).
