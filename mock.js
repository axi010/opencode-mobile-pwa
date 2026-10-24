/* MODO DEMO para la demo publica (GitHub Pages).
   Intercepta las peticiones al API y responde con DATOS FICTICIOS, para que
   cualquiera pueda ver la interfaz sin tener opencode instalado.

   Se DESACTIVA solo cuando el usuario conecta su propio servidor: en cuanto la
   URL guardada deja de ser la de demo, este script deja pasar las peticiones
   reales. Asi la misma pagina sirve para "probar la UI" y para "usarla de
   verdad" con tu servidor. */
(() => {
  const DEMO_URL = "https://demo.opencode.local";
  const CONFIG_KEY = "ocmovil.config";

  const leerConfig = () => {
    try {
      return JSON.parse(localStorage.getItem(CONFIG_KEY) || "{}");
    } catch {
      return {};
    }
  };

  /* Primer arranque: configuramos la app en modo demo para que entre directa a
     la lista de sesiones (en vez de a la pantalla de conexion). */
  if (!leerConfig().password) {
    localStorage.setItem(
      CONFIG_KEY,
      JSON.stringify({
        baseUrl: DEMO_URL,
        password: "demo",
        sameOrigin: false,
      })
    );
  }

  const esDemo = () => (leerConfig().baseUrl || "") === DEMO_URL;

  /* ---------- datos ficticios ---------- */
  const SES = [
    { id: "ses_demo01", title: "Web de recetas", agent: "build", model: { id: "claude-sonnet-5", providerID: "anthropic" }, time: { created: Date.now() - 240000, updated: Date.now() - 60000 } },
    { id: "ses_demo02", title: "Refactor del carrito", agent: "plan", model: { id: "gemini-4-argon", providerID: "google", variant: "high" }, time: { created: Date.now() - 3600000, updated: Date.now() - 1800000 } },
    { id: "ses_demo03", title: "Script de backups", agent: "build", model: { id: "deepseek-v4.1-flash", providerID: "standardcompute" }, time: { created: Date.now() - 86400000, updated: Date.now() - 7200000 } },
    { id: "ses_demo04", title: "API de tareas", agent: "build", model: { id: "claude-haiku-5-5", providerID: "anthropic" }, time: { created: Date.now() - 172800000, updated: Date.now() - 90000000 } },
  ];

  const TEXTO = [
    "Listo. He añadido una función que genera el CSV y un botón que la llama:",
    "",
    "```js",
    "function exportarCSV(filas) {",
    "  const cab = Object.keys(filas[0]);",
    "  return [",
    "    cab.join(\",\"),",
    "    ...filas.map((f) => cab.map((c) => f[c]).join(\",\")),",
    "  ].join(\"\\n\");",
    "}",
    "```",
    "",
    "¿Quieres que lo pruebe con datos reales?",
  ].join("\n");

  const MSGS = [
    { id: "m1", type: "user", text: "Añade un botón para exportar la lista a CSV.", time: { created: Date.now() - 120000 } },
    {
      id: "m2",
      type: "assistant",
      time: { created: Date.now() - 110000 },
      content: [
        { type: "text", text: "Voy a añadir la exportación. Primero miro cómo está montada la lista." },
        { type: "tool", tool: "read", state: { status: "success", input: { filePath: "src/lista.js" } } },
      ],
    },
    {
      id: "m3",
      type: "assistant",
      time: { created: Date.now() - 90000 },
      content: [
        { type: "text", text: TEXTO },
        { type: "tool", tool: "edit", state: { status: "success", input: { filePath: "src/lista.js" } } },
      ],
    },
  ];

  const MODELOS = [
    { id: "claude-sonnet-5", providerID: "anthropic", name: "Claude Sonnet 5", enabled: true, variants: [{ id: "low" }, { id: "medium" }, { id: "high" }] },
    { id: "claude-haiku-5-5", providerID: "anthropic", name: "Claude Haiku 5.5", enabled: true, variants: [{ id: "low" }, { id: "high" }] },
    { id: "gemini-4-argon", providerID: "google", name: "Gemini 4 Argon", enabled: true, variants: [{ id: "low" }, { id: "high" }] },
    { id: "gemini-3.8-flash", providerID: "google", name: "Gemini 3.8 Flash", enabled: true, variants: [{ id: "default" }] },
    { id: "deepseek-v4.1-flash", providerID: "standardcompute", name: "DeepSeek V4.1 Flash", enabled: true, variants: [{ id: "default" }] },
    { id: "flint-40b-free", providerID: "opencode", name: "Flint 40B Free", enabled: true, variants: [{ id: "low" }, { id: "medium" }, { id: "high" }, { id: "max" }] },
  ];

  const AGENTES = [
    { id: "build", name: "build", mode: "primary", hidden: false },
    { id: "plan", name: "plan", mode: "primary", hidden: false },
    { id: "title", name: "title", mode: "primary", hidden: true },
  ];

  const PERMISO = [
    {
      id: "per_demo1",
      sessionID: "ses_demo01",
      action: "shell",
      resources: ["rm -rf dist/"],
      save: ["rm *"],
      message: "El agente quiere borrar la carpeta de compilación.",
    },
  ];

  const MCP = [
    { name: "filesystem", status: { status: "connected" } },
    { name: "github", status: { status: "connected" } },
    { name: "postgres", status: { status: "disconnected" } },
  ];

  const PROVEEDORES = [
    { id: "anthropic", name: "Anthropic" },
    { id: "google", name: "Google" },
    { id: "opencode", name: "OpenCode" },
  ];

  const PLUGINS = [
    { id: "opencode.tool.input.repair", source: { type: "builtin" }, state: { status: "active" } },
    { id: "opencode.config.mcp", source: { type: "builtin" }, state: { status: "active" } },
  ];

  const SKILLS = [
    { id: "deploy", name: "deploy", description: "Publica la app en producción siguiendo el runbook." },
    { id: "tests", name: "tests", description: "Ejecuta y repara la suite de tests del proyecto." },
  ];

  const COMANDOS = [
    { name: "init", description: "guided AGENTS.md setup" },
    { name: "review", description: "review changes [commit|branch|pr]" },
  ];

  /* ---------- banner de DEMO ---------- */
  function ponerBanner() {
    if (!esDemo() || document.getElementById("demo-banner")) return;
    const b = document.createElement("div");
    b.id = "demo-banner";
    b.className = "demo-banner";
    b.innerHTML =
      "<b>DEMO</b> · datos ficticios · abre <b>Ajustes → Cambiar servidor</b> para conectar tu propio opencode";
    document.body.prepend(b);
  }

  /* ---------- interceptacion ---------- */
  const json = (o) =>
    new Response(JSON.stringify(o), { status: 200, headers: { "Content-Type": "application/json" } });

  const real = window.fetch;
  window.fetch = (url, opt) => {
    const u = String(url);
    if (!esDemo() || !u.includes("/api/")) return real(url, opt);

    if (u.includes("/api/info")) return Promise.resolve(json({ version: "2.1.4", urls: [DEMO_URL] }));
    if (u.includes("/api/session/active")) return Promise.resolve(json({ data: {} }));
    if (u.includes("/api/permission/request")) return Promise.resolve(json({ location: { directory: "/demo/proyecto" }, data: PERMISO }));
    if (/\/api\/session\/ses_[a-z0-9]+\/message/.test(u)) return Promise.resolve(json({ data: MSGS }));
    if (/\/api\/session\/ses_[a-z0-9]+\/permission/.test(u)) return Promise.resolve(json({ data: PERMISO }));
    if (/\/api\/session\/ses_[a-z0-9]+$/.test(u)) {
      const id = u.split("/").pop().split("?")[0];
      return Promise.resolve(json({ data: SES.find((s) => s.id === id) || SES[0] }));
    }
    if (u.includes("/api/session?limit")) return Promise.resolve(json({ data: SES }));
    if (u.includes("/api/model")) return Promise.resolve(json({ location: { directory: "/demo/proyecto" }, data: MODELOS }));
    if (u.includes("/api/agent")) return Promise.resolve(json({ data: AGENTES }));
    if (u.includes("/api/location")) return Promise.resolve(json({ directory: "/demo/proyecto" }));
    if (u.includes("/api/mcp")) return Promise.resolve(json({ location: { directory: "/demo/proyecto" }, data: MCP }));
    if (u.includes("/api/provider")) return Promise.resolve(json({ location: { directory: "/demo/proyecto" }, data: PROVEEDORES }));
    if (u.includes("/api/plugin")) return Promise.resolve(json({ location: { directory: "/demo/proyecto" }, data: PLUGINS }));
    if (u.includes("/api/skill")) return Promise.resolve(json({ location: { directory: "/demo/proyecto" }, data: SKILLS }));
    if (u.includes("/api/command")) return Promise.resolve(json({ location: { directory: "/demo/proyecto" }, data: COMANDOS }));
    if (u.includes("/api/fs/list"))
      return Promise.resolve(
        json({
          data: [
            { path: "src/", type: "directory" },
            { path: "public/", type: "directory" },
            { path: "package.json", type: "file" },
            { path: "README.md", type: "file" },
          ],
        })
      );
    if (u.includes("/api/event")) return new Promise(() => {}); // SSE: nunca resuelve
    return Promise.resolve(json({ data: [] }));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ponerBanner);
  } else {
    ponerBanner();
  }
  // el banner debe sobrevivir a las navegaciones internas (SPA)
  setInterval(ponerBanner, 1500);
})();
