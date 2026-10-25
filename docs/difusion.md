# 📣 Textos listos para pegar

Copia y pega. **Usa SIEMPRE el enlace de la demo primero**: la gente prueba antes
de decidir, y eso multiplica los clics.

| Recurso | Enlace |
| --- | --- |
| ▶️ **Demo** (sin instalar) | https://axi010.github.io/opencode-mobile-pwa/ |
| 📦 **Repo** | https://github.com/axi010/opencode-mobile-pwa |
| 🎬 **GIF animado** (demo de 9 s) | https://raw.githubusercontent.com/axi010/opencode-mobile-pwa/master/screenshots/demo.gif |
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

Hi! I'm 16, still learning, and I use opencode every day. I kept walking back
to the PC just to approve a permission or switch models, so I built a small PWA
for that. First project I've actually finished — feedback very welcome 🙏

▶️ Try it right now (fake data, nothing to install):
https://axi010.github.io/opencode-mobile-pwa/

https://raw.githubusercontent.com/axi010/opencode-mobile-pwa/master/screenshots/demo.gif

What it does
• Real-time chat (SSE) with reasoning, tool chips and a stop button
• Approve/reject permissions from the phone (once / always / reject)
• Plan ⇄ Build switch, model + variant picker (130+ models, searchable)
• Attach files from your PC to a prompt
• System view: MCP servers (connect/disconnect), providers, plugins, skills
• Search, sort and filter by project in the session list
• PIN lock, light/dark theme, ES/EN UI
• Real push notifications with the app closed (small service next to opencode)

Why it's small
• No frameworks, zero runtime dependencies — vanilla JS + a ~20-line DOM helper
• ~32 kB gzipped total, strict CSP in production (no inline scripts/styles)
• The opencode API only allows CORS from loopback, so it talks to /api on its own
  origin (Vite proxies it) → works on localhost, LAN and through an https tunnel

📦 Repo + 2-command setup: https://github.com/axi010/opencode-mobile-pwa

Unofficial, community-made, not affiliated with the OpenCode team.
Feedback and PRs very welcome — there are "good first issue" tasks ready 🙌
```

---

## 2️⃣ REDDIT (r/opencodeCLI, r/opencode, r/vibecoding, r/LocalLLM)

### 🎯 VERSIÓN RECOMENDADA — con tu edad (16)

**Título:**
```
I'm 16 and I built a mobile client for opencode: chat, permissions, Plan/Build, model picker (PWA, no frameworks)
```

**Cuerpo:**

```
Hi! I'm 16, still learning to code, and I use opencode every day.

My problem was simple: I was always walking back to my PC just to approve a
permission or switch models. So I built a phone client for it. It's the first
project I've actually finished, and I'd love honest feedback.

▶️ Live demo (fake data, nothing to install):
https://axi010.github.io/opencode-mobile-pwa/

What it does
• Real-time chat (SSE) with reasoning, tool chips and a stop button
• Approve/reject permissions from the phone (once / always / reject)
• Plan ⇄ Build switch, model + variant picker (130+ models, searchable)
• Attach files from your PC to a prompt
• System view: MCP servers (connect/disconnect), providers, plugins, skills
• Search + sort + filter by project in the session list
• PIN lock, light/dark theme, ES/EN UI
• Real push notifications that arrive with the app closed (small service you
  run next to opencode — no third party)

Why it's small
• No frameworks and zero runtime dependencies: vanilla JS + a ~20-line DOM helper
• ~32 kB gzipped in total, strict CSP in production (no inline scripts/styles)
• The opencode HTTP API only allows CORS from loopback, so the app calls /api on
  its own origin and Vite proxies it to 127.0.0.1:28894. The same code works on
  localhost, on your LAN and behind an https tunnel.

Things I got wrong (and what I learned)
• I found real accessibility bugs only after measuring with Lighthouse, not by
  looking at it: missing <main> landmarks, a heading order that skipped a level,
  and two buttons that were literally unreadable in light theme. All fixed and
  documented in ACCESSIBILITY.md, including what is still limited.
• My first push implementation only worked with the app open. Local
  notifications can't do more than that — a notification needs code running, so
  with the app closed the only real option is Web Push (VAPID), which needs a
  service. I wrote that service.
• I had never written tests. Adding them (27 now, Node's built-in runner, no
  dependencies) caught a bug I'd shipped.

📦 Repo (2-command setup) + roadmap with "good first issue" tasks:
https://github.com/axi010/opencode-mobile-pwa

Unofficial and community-made, not affiliated with the OpenCode team.
If something is broken or missing, tell me — I'd rather know.
```

> **Por qué funciona este post:** la edad es el gancho, pero **no** es la
> excusa. Enseguida pasa a lo que importa (el problema, lo que hace) y la
> sección de *"things I got wrong"* es lo que te diferencia: demuestra que
> entiendes lo que has hecho y que aceptas críticas. Eso es justo lo que
> premia Reddit y lo que te va a traer feedback útil en vez de solo "nice!".

### Versión sin la edad (si prefieres no decirlo)

**Título:**
```
I built a phone client for opencode: chat, permissions, Plan/Build, model picker (PWA, no frameworks)
```

**Cuerpo:** usa el mismo texto de arriba quitando la primera frase sobre la edad.

> Reddit **no** incrusta imágenes del cuerpo: usa el enlace, o súbelas como
> *image post* y pon el texto en un comentario.

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
