# Security Policy

## Supported versions

This project is a client that talks to your **own** opencode server. Only the
latest `master` is supported.

| Version | Supported |
| ------- | --------- |
| 1.x     | ✅        |

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Report it privately through GitHub's
[**Report a vulnerability**](https://github.com/axi010/opencode-mobile-pwa/security/advisories/new)
form (Security → Advisories). If you cannot use it, contact the maintainer
[@axi010](https://github.com/axi010) directly.

Please include:

- A description of the issue and its impact
- Steps to reproduce (proof of concept if possible)
- Affected version / commit

We aim to acknowledge reports within **72 hours** and to publish a fix as soon
as possible.

## Security model (what this app does)

It is worth understanding the design before reporting:

- **The credential is the opencode server password.** The app authenticates to
  the opencode HTTP API with HTTP Basic (`opencode:<password>`). Anyone with that
  password can control the server, so treat it as a secret.
- **The QR contains a 30-day token**, which is equivalent to the password. A
  leaked QR (screenshot, chat, printed paper) is a leaked credential.
- **Credentials are stored in the phone's `localStorage`.** The app never sends
  them anywhere except your opencode server.
- **The PIN lock is a local device lock, not encryption.** It derives a key with
  PBKDF2-SHA256 (150k iterations, random salt) and stores only the hash. It
  protects against casual access to the unlocked device, **not** against an
  attacker with filesystem access to the phone.
- **CORS / proxy.** The opencode API only allows CORS from loopback, so the PWA
  talks to `/api` on its own origin and the Vite dev/preview server proxies it to
  `127.0.0.1:28894`. If you serve the built `dist/` from another static server,
  you must provide an equivalent proxy yourself.

## Good practices when self-hosting

- Use the **HTTPS tunnel** (`scripts/movil.ps1` / `scripts/movil.sh`) so the PIN
  and the service worker work (they require a secure context).
- Keep the opencode server listening on `127.0.0.1` unless you know what you are
  doing; the app does not need LAN exposure.
- Regenerate the QR / rotate the server password if you think it leaked.
- Enable **"Keep my email addresses private"** if you fork and publish.

---

# Política de seguridad

## Versiones soportadas

Solo se da soporte a la última versión de `master`.

## Cómo reportar una vulnerabilidad

**No abras un *issue* público para problemas de seguridad.** Usa el formulario
privado de GitHub
[**Report a vulnerability**](https://github.com/axi010/opencode-mobile-pwa/security/advisories/new)
(Security → Advisories) o contacta con [@axi010](https://github.com/axi010).

Incluye una descripción del problema, su impacto, pasos para reproducirlo y la
versión afectada. Respondemos en un plazo de **72 horas**.

## Modelo de seguridad (importante)

- **La credencial es la contraseña del servidor opencode** (HTTP Basic). Quien la
  tenga controla el servidor.
- **El QR contiene un token de 30 días** equivalente a la contraseña: si se
  filtra, hay que rotarla.
- **Las credenciales se guardan en el `localStorage` del móvil** y solo se envían
  a tu servidor opencode.
- **El PIN es un bloqueo local del dispositivo, no cifrado**: protege frente a un
  acceso casual, no frente a quien tenga acceso al sistema de ficheros del móvil.
- **Proxy `/api`**: el API de opencode solo permite CORS desde loopback; la app
  usa un proxy del propio servidor de Vite. Si sirves `dist/` con otro servidor
  estático, necesitas un proxy equivalente.
