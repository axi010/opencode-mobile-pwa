# 📣 Textos listos para pegar

Copia y pega. **Usa SIEMPRE el enlace de la demo primero**: la gente prueba antes
de decidir, y eso multiplica los clics.

| Recurso | Enlace |
| --- | --- |
| ▶️ **Demo** (sin instalar) | https://axi010.github.io/opencode-mobile-pwa/ |
| 📦 **Repo** | https://github.com/axi010/opencode-mobile-pwa |
| 🖼 Captura del chat | https://raw.githubusercontent.com/axi010/opencode-mobile-pwa/master/screenshots/chat.png |
| 🖼 Captura de sesiones | https://raw.githubusercontent.com/axi010/opencode-mobile-pwa/master/screenshots/sessions.png |
| 🖼 Captura de permisos | https://raw.githubusercontent.com/axi010/opencode-mobile-pwa/master/screenshots/permissions.png |

---

## 1️⃣ DISCORD de opencode (el mejor sitio)

Ve al Discord oficial (enlace en https://github.com/anomalyco/opencode) y publica
en el canal de **showcase / community-projects**. Lee las normas del canal antes.

**Pega esto** (las imágenes se ven solas en Discord):

```
🛠 OpenCode Móvil — drive your opencode server from your phone

I use opencode all day but kept walking back to the PC just to approve a
permission or switch models. So I built a small PWA for that.

▶️ Try it right now (fake data, nothing to install):
https://axi010.github.io/opencode-mobile-pwa/

https://raw.githubusercontent.com/axi010/opencode-mobile-pwa/master/screenshots/chat.png

What it does
• Real-time chat (SSE) with reasoning, tool chips and a stop button
• Approve/reject permissions from the phone (once / always / reject)
• Plan ⇄ Build switch, model + variant picker (130+ models, searchable)
• Attach files from your PC to a prompt
• System view: MCP servers (connect/disconnect), providers, plugins, skills
• PIN lock, light/dark theme, local notifications, ES/EN UI

Why it's small
• No frameworks, zero runtime dependencies — vanilla JS + a ~20-line DOM helper
• Strict CSP in production, ~50 kB gzipped
• The opencode API only allows CORS from loopback, so it talks to /api on its own
  origin (Vite proxies it) → works on localhost, LAN and through an https tunnel

📦 Repo + 2-command setup: https://github.com/axi010/opencode-mobile-pwa

Unofficial, community-made, not affiliated with the OpenCode team.
Feedback and PRs very welcome — there are "good first issue" tasks ready 🙌
```

---

## 2️⃣ REDDIT (r/opencodeCLI, r/opencode, r/vibecoding, r/LocalLLM)

**Título:**
```
I built a phone client for opencode: chat, permissions, Plan/Build, model picker (PWA, no frameworks)
```

**Cuerpo** (Reddit **no** incrusta imágenes del cuerpo: usa el enlace, o súbelas
como *image post* y pon el texto en un comentario):

```
I use opencode all day, but I kept having to go back to the PC just to approve a
permission or change the model. So I built a small PWA for that.

▶️ Live demo (fake data, nothing to install): https://axi010.github.io/opencode-mobile-pwa/

What it does:
• Real-time chat (SSE) with reasoning, tool chips and a stop button
• Approve/reject permissions from the phone (once / always / reject)
• Plan/Build switch + model & variant picker (130+ models, searchable)
• Attach files from the PC to a prompt
• System view: MCP servers (connect/disconnect), providers, plugins, skills
• PIN lock, light/dark theme, notifications, ES/EN interface

Tech notes that might interest this sub:
• No frameworks and zero runtime dependencies (vanilla JS + tiny DOM helper)
• The opencode HTTP API only allows CORS from loopback → the app calls /api on its
  own origin and Vite proxies it to 127.0.0.1:28894. Same code works on localhost,
  LAN and behind an https tunnel.
• Strict CSP in production: no inline scripts or styles at all.

📦 Repo: https://github.com/axi010/opencode-mobile-pwa

Unofficial, not affiliated with the OpenCode team. Happy to hear what's missing!
```

---

## 3️⃣ Para pegar en un chat / mensaje corto (WhatsApp, clase, Discord)

```
OpenCode Móvil — controla opencode desde el móvil 📱
Chat en vivo, aprobar permisos, Plan/Build, elegir modelo y adjuntar archivos.

Pruébalo sin instalar: https://axi010.github.io/opencode-mobile-pwa/
Repo: https://github.com/axi010/opencode-mobile-pwa
```

---

## 4️⃣ GitHub (ya casi hecho)

```powershell
# demo como web del repo (ya puesto, por si acaso)
gh repo edit axi010/opencode-mobile-pwa --homepage https://axi010.github.io/opencode-mobile-pwa/
```

- ✅ Demo como *Website*
- ✅ Release v1.0.0
- ✅ Topics (`opencode`, `pwa`, `demo`…)
- ✅ Issues de bienvenida para colaboradores

---

## 5️⃣ Checklist

- [ ] Discord de opencode (canal showcase)
- [ ] r/opencodeCLI
- [ ] r/opencode
- [ ] Compañeros de clase (feedback rápido)
- [ ] Grabar un **GIF de 10 s** del chat en el móvil → mejor que una captura
- [ ] Añadir el GIF al README

> 💡 **Consejo**: publica en **uno** primero (Discord), mira qué te preguntan, y
> **mejora el README** con eso antes de ir a los demás. Si te preguntan lo mismo
> dos veces, falta en la doc.
