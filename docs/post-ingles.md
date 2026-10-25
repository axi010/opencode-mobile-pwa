# 🇬🇧 TEXTOS EN INGLÉS — listos para copiar y pegar

> **Regla que NO debes saltarte:** en Reddit no se pueden poner fotos **y** enlace
> en el mismo post. Sube las **4 imágenes** (`screenshots/para-reddit/`) y pega el
> texto como **primer comentario fijado**.
>
> **Regla 2:** NO copies el mismo texto palabra por palabra en 5 subs el mismo
> día. Reddit lo detecta como spam → ban. Adapta (abajo tienes una versión por
> sub) y espera 1-2 días entre uno y otro.

---

## 📸 LAS 4 IMÁGENES (siempre en este orden)

1. `1-demo.gif` ← **primero**, es lo que engancha
2. `2-sesiones.png`
3. `3-chat.png`
4. `4-permisos.png`

---

## 🥇 r/opencode — versión PRINCIPAL (la más técnica)

**Título:**
```
I'm 16 and built a mobile client for opencode — chat, permissions, Plan/Build, model picker (PWA, no frameworks)
```

**Primer comentario (fijado):**
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
• No frameworks, no runtime dependencies in the app: vanilla JS + a ~20-line DOM helper
• ~32 kB gzipped total, strict CSP in production (no inline scripts/styles)
• The opencode API only allows CORS from loopback, so the app calls /api on its
  own origin and Vite proxies it to 127.0.0.1:28894 → works on localhost, LAN and
  behind an https tunnel

📦 Repo (2-command setup) + "good first issue" tasks:
https://github.com/axi010/opencode-mobile-pwa

Unofficial, community-made, not affiliated with the OpenCode team.
If something is broken or missing, tell me — I'd rather know.
```

---

## 🥈 r/opencodeCLI — versión corta (ahí son más secos)

> Este sub tiene normas estrictas: *(1)* el post debe ir de opencode, *(2)* nada
> de bajo esfuerzo. **Lee las reglas antes.** Fuentes contradictorias sobre si
> permiten autopromoción.

**Título:**
```
Mobile client for opencode: chat, permissions, Plan/Build, model picker
```

**Primer comentario (fijado):**
```
Built this because I kept having to walk back to my PC to approve permissions or
change models.

▶️ Demo, nothing to install: https://axi010.github.io/opencode-mobile-pwa/

• SSE chat with reasoning, tool chips, stop button
• Permission approve/reject from the phone (once / always / reject)
• Plan/Build switch + model/variant picker with search
• Attach files from your PC; project filter in the session list
• PIN lock, light/dark, ES/EN, push notifications with the app closed

No frameworks, no runtime dependencies in the app, ~32 kB gzipped. Strict CSP.
It talks to /api on its own origin (Vite proxies to 127.0.0.1:28894) because the
API only allows CORS from loopback.

Repo: https://github.com/axi010/opencode-mobile-pwa

Unofficial, not affiliated with the OpenCode team. Feedback welcome.
```

---

## 🥉 r/SideProject — versión "he hecho esto" (cuenta la historia)

> Aquí premian la **historia**, no la lista de features. Empieza por el problema.

**Título:**
```
I'm 16 and built a phone client for opencode because I was tired of walking back to my PC
```

**Primer comentario (fijado):**
```
Small annoyance that turned into a project.

I use opencode every day. The problem: I'd be on the sofa, the agent would ask
for a permission, and I'd have to get up and go to the PC just to click "allow".
Same with changing models.

So I built a phone client for it. It's the first project I've actually finished.

▶️ Try it (fake data, nothing to install):
https://axi010.github.io/opencode-mobile-pwa/

What it does
• Chat with your sessions in real time (streaming), with reasoning and tool chips
• Approve/reject permissions from the phone
• Plan/Build switch, model + variant picker, attach files from your PC
• Search, sort and filter by project
• PIN lock, themes, and push notifications that arrive with the app closed

What I'd change / what I learned
• I found real accessibility bugs only after measuring with Lighthouse — not by
  looking at it. Fixed and documented, including what's still limited.
• My first notification attempt only worked with the app open. I had to learn
  what Web Push actually is (and write the little service for it).
• I'd never written tests. Adding them caught a bug I'd shipped.

It's a PWA: installable, no frameworks, no runtime dependencies in the app, ~32 kB
gzipped.

Repo: https://github.com/axi010/opencode-mobile-pwa

Unofficial, not affiliated with the OpenCode team. Tell me what's missing.
```

---

## 4️⃣ r/coolgithubprojects — versión "mira este repo"

> Aquí el protagonista es el **repo**, no la app.

**Título:**
```
Mobile PWA client for opencode — vanilla JS, no frameworks, no dependencies in the app
```

**Primer comentario (fijado):**
```
A mobile client for your opencode server. Chat with your sessions, approve
permissions, pick model + variant, attach files — all from the phone.

▶️ Live demo (fake data): https://axi010.github.io/opencode-mobile-pwa/
📦 https://github.com/axi010/opencode-mobile-pwa

Interesting bits if you like reading code:
• No frameworks and no runtime dependencies in the app — vanilla JS + a ~20-line DOM helper
• Strict CSP in production: no inline scripts or styles at all
• Talks to /api on its own origin and lets Vite proxy it to 127.0.0.1:28894, so
  the same code works on localhost, on the LAN and behind an https tunnel
• 27 unit tests with Node's built-in runner (no test framework installed)
• Accessibility measured, not assumed: Lighthouse 100/100 on all 5 screens in
  both themes (and ACCESSIBILITY.md lists what's still limited)
• A small Web Push service (server/push-server.mjs) so notifications arrive with
  the app closed

I'm 16 and this is the first project I've finished. Happy to hear what's wrong
with it.

Unofficial, not affiliated with the OpenCode team.
```

---

## ⚠️ LA PREGUNTA QUE TE VAN A HACER (tenla lista)

opencode tiene **interfaz web oficial** (`opencode web`). Te lo van a mencionar
seguro. Respuesta honesta:

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

---

## 📅 ORDEN (uno cada 1-2 días, NUNCA todos de golpe)

1. **r/opencode** (ya lo hiciste ✅)
2. **r/opencodeCLI**
3. **r/SideProject**
4. **r/coolgithubprojects**

> Si publicas el mismo texto en 4 subs el mismo día, Reddit te marca como spam y
> te puede banear la cuenta. **Uno cada vez.**
