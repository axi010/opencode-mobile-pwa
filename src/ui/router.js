/* Router hash minimo: #/setup, #/sessions, #/chat/:id.
   Cada navegacion aborta la vista anterior (limpieza de listeners/timers). */
const routes = [];
let currentAbort = null;

export function route(pattern, handler) {
  const keys = [];
  const rx = new RegExp(
    "^" +
      pattern.replace(/:[^/]+/g, (m) => {
        keys.push(m.slice(1));
        return "([^/]+)";
      }) +
      "$"
  );
  routes.push({ rx, keys, handler });
}

export function navigate(path) {
  const target = path.startsWith("#") ? path : "#" + path;
  if (location.hash === target) resolve();
  else location.hash = target;
}

async function resolve() {
  // el hash puede traer query (#/setup?server=...) -> matchear SOLO el path
  const hash = (location.hash.replace(/^#/, "") || "/").split("?")[0];
  for (const r of routes) {
    const m = hash.match(r.rx);
    if (!m) continue;
    currentAbort?.abort();
    currentAbort = new AbortController();
    document.getElementById("app").textContent = "";
    const params = {};
    r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
    try {
      await r.handler(params, document.getElementById("app"), currentAbort.signal);
    } catch (err) {
      console.error("vista rota:", err);
    }
    return;
  }
  navigate("/setup");
}

export async function startRouter() {
  window.addEventListener("hashchange", resolve);
  await resolve();
}
