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

## 🎯 COMUNIDADES DONDE POSTEARLO (verificadas)

> Datos comprobados con búsquedas reales. **Los números cambian**: mira las normas
> del sub antes de publicar (enlace *About → Rules*), porque las de abajo pueden
> haber cambiado.

| # | Comunidad | Tamaño | Encaje | Notas |
| --- | --- | --- | --- | --- |
| 🥇 | **Discord oficial de opencode** — `discord.gg/opencode` | 84.700 miembros, ~10.700 online | **El mejor** | Chat en vivo: el GIF se ve solo al pegar la URL. Busca el canal de *showcase*. Es donde está la gente que **ya usa** opencode. |
| 🥈 | **r/opencode** | ~116.000 | **Muy bueno** | El sub del propio opencode. Publica aquí el de galería. |
| 🥉 | **r/opencodeCLI** | ~100.000 | **Muy bueno** | Normas: *(1)* el post tiene que ir de opencode/vibe coding, *(2)* nada de posts de bajo esfuerzo. **Ojo: las fuentes se contradicen sobre autopromoción** → lee las normas antes. |
| 4 | **r/SideProject** | ~478.000 | Bueno | El sub de "he hecho esto". Muy acogedor con proyectos. |
| 5 | **r/coolgithubprojects** | — | Bueno | Específico para repos de GitHub. |
| 6 | **r/opensource** | grande | Bueno | Proyectos open source con contexto. |
| 7 | **r/IMadeThis** | ~50.000 | Aceptable | Showcase de creaciones. |
| 8 | **r/selfhosted** | ~650.000 | Aceptable | Encaja porque **tú** alojas el servidor (y el servicio push). Ojo: aquí exigen que sea self-hosted de verdad. |

**No recomiendo** `r/programming` (5M): tiene un listón altísimo y un post de
proyecto personal suele caer. Ahí se conoce a la gente comentando, no publicando.

### Orden recomendado (NO publiques todo el mismo día)

1. **Discord de opencode** primero. Es el público exacto, el GIF se ve solo y las
   respuestas son inmediatas → te dice qué preguntan.
2. **Espera 1-2 días** y mejora el README con lo que te hayan preguntado.
3. **r/opencode** y **r/opencodeCLI** (los dos del tema).
4. **r/SideProject** y **r/coolgithubprojects** (público más general).
5. El resto.

> Si publicas en 6 sitios el mismo día con el mismo texto, Reddit lo detecta como
> spam y te puede banear la cuenta. Ve **uno cada vez** y adapta el título.

### ⚠️ LA PREGUNTA QUE TE VAN A HACER (ten la respuesta lista)

opencode tiene una **interfaz web oficial** (`opencode web`). Alguien te lo va a
mencionar **seguro**, así que respóndelo tú antes de que te lo pregunten. Respuesta
honesta y lista para pegar:

```
Fair question — opencode web is the official web UI, and it's the same desktop
experience in a browser. What I built is different in what I needed: a phone app.

• It's an installable PWA (home screen icon, no browser chrome), not a web page
• I can approve/reject permissions from the phone — that was my main annoyance
• Model + variant picker with search, and attach files from my PC to a prompt
• PIN lock, light/dark theme, and notifications that reach me with the app closed
• Project filter in the session list (worktrees count as the same project)
• Works from outside my house through an https tunnel, not just on my desk

If opencode web covers your case, use it — it's official and it's good. Mine is
for when you're away from the keyboard.
```

> **Por qué contestar así:** reconocer lo oficial y decir en qué te diferencias es
> lo que te da credibilidad. Si intentas fingir que `opencode web` no existe, te
> van a pillar y el post se te cae. Y decir "si te sirve el oficial, úsalo" hace
> que la gente confíe en ti.

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

- [x] ~~Grabar un GIF del chat~~ → hecho (`screenshots/demo.gif`, 9 s)
- [x] ~~Añadir el GIF al README~~ → hecho (arriba, en ambos idiomas)
- [ ] **Discord de opencode** (canal showcase) ← empieza por aquí
- [ ] **r/opencode** (el de galería: 4 imágenes + enlace en el primer comentario)
- [ ] **r/opencodeCLI** (lee las normas antes: autopromoción dudosa)
- [ ] **r/SideProject** y **r/coolgithubprojects** (público general)
- [ ] Compañeros de clase (feedback rápido y sin presión)
- [ ] Tener lista la respuesta a *"¿en qué se diferencia de opencode web?"*

> 💡 **Consejo**: publica en **uno** primero (Discord), mira qué te preguntan, y
> **mejora el README** con eso antes de ir a los demás. Si te preguntan lo mismo
> dos veces, falta en la doc.
