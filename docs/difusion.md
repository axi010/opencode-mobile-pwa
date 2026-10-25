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

> ⚠️ **En Reddit NO se pueden poner fotos Y enlace en el mismo post.** O subes
> imágenes (y el enlace va en el **primer comentario**), o haces un post de texto
> (y el enlace va dentro, pero las fotos no se ven). **Recomendado: galería de
> imágenes + enlace en el primer comentario** — es lo que más clics consigue,
> porque ven el GIF antes de decidir.

### 🖼️ POST DE GALERÍA (recomendado — fotos + que la prueben)

**Qué subir, en este orden** (el GIF primero: es lo que engancha):

1. `screenshots/demo.gif` ← el GIF animado, va primero
2. `screenshots/sessions.png`
3. `screenshots/chat.png`
4. `screenshots/permissions.png`

Están en tu carpeta `opencode-mobile/screenshots/`. En Reddit: *Create post* →
pestaña **Images & Video** → arrastra las 4 en ese orden.

**Título:**
```
I'm 16 and built a mobile client for opencode — chat, permissions, Plan/Build, model picker (PWA, no frameworks)
```

**⚠️ El enlace NO va en el post: va en el PRIMER COMENTARIO.** Publícalo tú
mismo justo después y fíjalo (*pin*). Pega esto:

```
▶️ Try it right now, nothing to install (fake data):
https://axi010.github.io/opencode-mobile-pwa/

Why I built it: I use opencode every day and kept walking back to the PC just to
approve a permission or switch models. So I made a phone client for it.

What it does
• Real-time chat (SSE) with reasoning, tool chips and a stop button
• Approve/reject permissions from the phone (once / always / reject)
• Plan ⇄ Build switch, model + variant picker (130+ models, searchable)
• Attach files from your PC to a prompt
• Search, sort and filter by project in the session list
• PIN lock, light/dark theme, ES/EN interface
• Push notifications that arrive with the app closed (small service you run next
  to opencode — no third party)

Tech notes
• No frameworks, zero runtime dependencies: vanilla JS + a ~20-line DOM helper
• ~32 kB gzipped total, strict CSP in production (no inline scripts/styles)
• The opencode API only allows CORS from loopback, so the app calls /api on its
  own origin and Vite proxies it to 127.0.0.1:28894 → works on localhost, LAN and
  behind an https tunnel

📦 Repo (2-command setup) + "good first issue" tasks:
https://github.com/axi010/opencode-mobile-pwa

Unofficial, community-made, not affiliated with the OpenCode team.
If something is broken or missing, tell me — I'd rather know.
```

### 📝 ALTERNATIVA: POST DE TEXTO (si prefieres que el enlace se vea arriba)

**Título:** el mismo de arriba.

**Cuerpo:** el texto del comentario de arriba, con el enlace al principio.
**Contra:** las fotos **no se ven** en el cuerpo; tendrías que poner los enlaces
de imagen (y Reddit solo los muestra como enlaces, no incrustados).

### 🎯 POR QUÉ ESTE ORDEN FUNCIONA

- **El GIF primero**: en 9 segundos se entiende qué es sin leer nada. Es lo que
  decide si bajan a leer.
- **El enlace en un comentario fijado**: los posts con imágenes tienen mucho más
  alcance que los de solo texto, y el comentario fijado se ve igual.
- **La edad en el título**: es un gancho honesto y hace que te respondan con
  paciencia en vez de asumir que eres un dev senior.

### Versión sin la edad (si prefieres no decirlo)

**Título:**
```
I built a phone client for opencode: chat, permissions, Plan/Build, model picker (PWA, no frameworks)
```

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
