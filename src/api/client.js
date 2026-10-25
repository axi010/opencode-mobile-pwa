/* Cliente HTTP fino para la API de opencode (contracto OpenAPI v2).
   - Auth: Basic "opencode:<password|token>" (requerido por el servidor).
   - SSE via fetch (EventSource no permite cabeceras de auth).
   - Todo fallo queda registrado en el log local de errores (auto-diagnostico). */
import { loadConfig } from "../config.js";

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.isAuth = status === 401;
  }
}

/* ---- log local de errores (equivalente movil de debug.log) ---- */
const errorListeners = new Set();
const LOG_KEY = "ocmovil.errors";

export function onClientError(fn) {
  errorListeners.add(fn);
  return () => errorListeners.delete(fn);
}

function reportError(where, err) {
  const entry = { t: Date.now(), where, msg: String(err?.message || err) };
  try {
    const log = JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
    log.unshift(entry);
    localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(0, 50)));
  } catch {
    /* localStorage lleno o bloqueado: no crítico */
  }
  console.error(`[${where}]`, err);
  for (const fn of errorListeners) {
    try {
      fn(entry);
    } catch {
      /* un listener roto no rompe el resto */
    }
  }
}

export function getErrorLog() {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
  } catch {
    return [];
  }
}

/* ---- nucleo HTTP ---- */
function authHeader(password) {
  return "Basic " + btoa("opencode:" + password);
}

/* ¿La app puede hablar con el API a traves de SU PROPIO origen? (proxy de Vite
   en dev/preview). Se comprueba de verdad: /api/info por el mismo origen
   responde 200 (con auth) o 401 (sin credencial valida) si el proxy llega al
   API; un servidor estatico sin proxy devuelve 404/HTML y se descarta.
   Devuelve true/false; nunca lanza. */
export async function detectarProxy(password) {
  try {
    const res = await fetch("/api/info", {
      headers: { authorization: authHeader(password || ""), Accept: "application/json" },
    });
    if (res.status === 401) return true; // el proxy llega: el API responde
    if (!res.ok) return false;
    const ct = res.headers.get("content-type") || "";
    return ct.includes("application/json");
  } catch {
    return false;
  }
}

export async function api(method, path, body) {
  const { baseUrl, password, altUrl, sameOrigin } = loadConfig();
  const headers = { "Content-Type": "application/json", authorization: authHeader(password) };
  // Modo same-origin: la app llama a /api en SU origen y el servidor de la PWA
  // (Vite) lo reenvia al API. Necesario desde el tunel https, porque el API de
  // opencode solo permite CORS a loopback.
  const origen = sameOrigin ? "" : baseUrl;
  if (!sameOrigin && !baseUrl) {
    throw new ApiError(0, "Sin URL del servidor: escanea el QR o introduce la URL del tunnel");
  }
  const doFetch = (url) =>
    fetch(url + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  let res;
  try {
    res = await doFetch(origen);
  } catch {
    // Fallback: si la URL principal falla de red y hay una alternativa
    // guardada (p. ej. el tunnel), reintentar una vez con ella y, si
    // funciona, promoverla a principal (recuperación automatica).
    if (!sameOrigin && altUrl && altUrl !== baseUrl) {
      try {
        res = await doFetch(altUrl);
        saveConfig({ baseUrl: altUrl });
      } catch {
        res = null;
      }
    }
    if (!res) {
      // diagnóstico accionable: endpoint LAN:28894 inalcanzable por diseño
      const lanImposible = /:28894$/.test(baseUrl) && !/^https?:\/\/(127\.0\.0\.1|localhost)/.test(baseUrl);
      const msg = lanImposible
        ? "El servidor opencode solo escucha en el PC (localhost). Escanea el QR o usa la URL del tunnel."
        : "Sin conexión con el servidor opencode";
      throw new ApiError(0, msg);
    }
  }
  if (res.status === 204) return null;
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `HTTP ${res.status}`;
    const err = new ApiError(res.status, msg);
    reportError(`${method} ${path}`, err);
    throw err;
  }
  return data;
}

/* ---- endpoints ---- */
export const Client = {
  info: () => api("GET", "/api/info"),
  location: () => api("GET", "/api/location"),
  agents: () => api("GET", "/api/agent"),
  sessions: (limit = 50) => api("GET", `/api/session?limit=${limit}`),
  /* Lista de proyectos conocidos por el servidor. Cada proyecto trae
     {id, canonical, name, vcs}. Las sesiones referencian el proyecto por
     `projectID`, asi que esto sirve para poner un NOMBRE al filtro. */
  projects: () => api("GET", "/api/project"),
  getSession: (id) => api("GET", `/api/session/${id}`),
  deleteSession: (id) => api("DELETE", `/api/session/${id}`),
  createSession: (directory) => api("POST", "/api/session", { location: { directory } }),
  setAgent: (id, agent) => api("POST", `/api/session/${id}/agent`, { agent }),
  setModel: (id, model) => api("POST", `/api/session/${id}/model`, { model }),
  defaultModel: () => api("GET", "/api/model/default"),
  /* Catalogo completo de modelos (133) con variantes. Se cachea en la vista. */
  models: () => api("GET", "/api/model"),
  messages: (id) => api("GET", `/api/session/${id}/message`),
  /* files: [{ uri: "file:///C:/ruta", name }] -> el servidor embebe el contenido. */
  prompt: (id, text, files) =>
    api("POST", `/api/session/${id}/prompt`, files?.length ? { text, files } : { text }),
  interrupt: (id) => api("POST", `/api/session/${id}/interrupt`),

  /* ---- explorador de archivos del PC (para adjuntar al prompt) ----
     fs/list necesita path ABSOLUTO; devuelve rutas relativas al home, por eso
     el cliente las reconstruye con `home` (GET /api/location). */
  fsList: (path) => api("GET", `/api/fs/list?path=${encodeURIComponent(path)}`),
  fsFind: (query) => api("GET", `/api/fs/find?query=${encodeURIComponent(query)}`),

  /* ---- sistema: MCP, plugins, skills, comandos y proveedores ----
     Contrato verificado contra el servidor v2.1.4:
       GET  /api/mcp       -> { data: [{name, status:{status}, integrationID?}] }
       POST /api/experimental/mcp/{server}/connect    (y /disconnect)
       GET  /api/plugin    -> [{id, source:{type}, features, state:{status}}]
       GET  /api/skill     -> [{id, name, description}]
       GET  /api/command   -> [{name, description}]
       GET  /api/provider  -> [{id, name, env}]
     OJO: NO existe endpoint de LSP en la API HTTP (es interno del servidor). */
  mcp: () => api("GET", "/api/mcp"),
  mcpConnect: (nombre) => api("POST", `/api/experimental/mcp/${encodeURIComponent(nombre)}/connect`),
  mcpDisconnect: (nombre) => api("POST", `/api/experimental/mcp/${encodeURIComponent(nombre)}/disconnect`),
  plugins: () => api("GET", "/api/plugin"),
  skills: () => api("GET", "/api/skill"),
  commands: () => api("GET", "/api/command"),
  providers: () => api("GET", "/api/provider"),

  /* Permisos (OpenAPI v2): pendientes globales + respuesta del movil.
     decision: "once" (permitir esta vez) | "always" (guardar regla) | "reject"
     NOTA: /api/permission/request filtra por location activa del servidor;
     para no perder nada, la app suma ademas los pendientes de las sesiones
     ACTIVAS (una sesion con permiso pendiente siempre esta activa a la espera). */
  pendingPermissions: () => api("GET", "/api/permission/request"),
  activeSessions: () => api("GET", "/api/session/active"),
  sessionPermissions: (sid) => api("GET", `/api/session/${sid}/permission`),
  replyPermission: (sid, rid, decision) =>
    api("POST", `/api/session/${sid}/permission/${rid}/reply`, { decision }),

  /* Todos los permisos pendientes visibles, sin duplicados (Set por id). */
  async allPendingPermissions() {
    const byId = new Map();
    try {
      const g = await this.pendingPermissions();
      for (const p of g?.data || []) byId.set(p.id, p);
    } catch {
      /* global best-effort: el fallo no debe tapar los de sesion */
    }
    try {
      const a = await this.activeSessions();
      // el shape es un diccionario {sessionID: {type}} (también se tolera array)
      const data = a?.data;
      const ids = Array.isArray(data)
        ? data.map((s) => s?.sessionID || s?.id).filter(Boolean)
        : data && typeof data === "object"
          ? Object.keys(data)
          : [];
      for (const sid of ids) {
        try {
          const r = await this.sessionPermissions(sid);
          for (const p of r?.data || []) byId.set(p.id, p);
        } catch {
          /* una sesion concreta best-effort */
        }
      }
    } catch {
      /* activas best-effort */
    }
    return [...byId.values()];
  },

  /* Pairing: sin auth previa; Accept JSON -> PairingSession {token}. */
  async redeem(code) {
    const { baseUrl, sameOrigin } = loadConfig();
    const origen = sameOrigin ? "" : baseUrl;
    let res;
    try {
      res = await fetch(`${origen}/auth/connect/${encodeURIComponent(code)}`, {
        headers: { Accept: "application/json" },
      });
    } catch {
      throw new ApiError(0, "Sin conexión con el servidor opencode");
    }
    if (!res.ok) throw new ApiError(res.status, "Código de pairing inválido o caducado");
    const data = await res.json();
    const token = data?.token ?? data?.data?.token;
    if (!token) throw new ApiError(500, "Respuesta de pairing inesperada");
    return token;
  },
};

/* ---- SSE (streaming de eventos) ---- */
export function subscribeEvents({ onEvent, onError, signal }) {
  const { baseUrl, password, sameOrigin } = loadConfig();
  const origen = sameOrigin ? "" : baseUrl;
  (async () => {
    try {
      const res = await fetch(origen + "/api/event", {
        headers: { authorization: authHeader(password), Accept: "text/event-stream" },
        signal,
      });
      if (!res.ok) throw new ApiError(res.status, "Stream de eventos rechazado");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split(/\r?\n\r?\n/);
        buffer = frames.pop();
        for (const frame of frames) {
          const m = frame.match(/^data:\s*(.+)$/m);
          if (!m) continue;
          try {
            onEvent?.(JSON.parse(m[1]));
          } catch {
            /* frame no JSON (comentarios/heartbeat): se ignora */
          }
        }
      }
      if (!signal?.aborted) throw new ApiError(0, "SSE cerrado por el servidor");
    } catch (err) {
      if (!signal?.aborted) {
        reportError("event.subscribe", err);
        onError?.(err);
      }
    }
  })();
}
