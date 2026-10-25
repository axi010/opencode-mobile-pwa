/* Logica pura del filtro de la lista de sesiones (sin DOM, sin red).
   Se separa de la vista para poder probarla con el runner de Node.
   Reglas:
   - Se filtra por `projectID` (NO por directorio): un proyecto puede tener
     varias carpetas (worktrees) y todas son el mismo proyecto.
   - El nombre visible de un proyecto es el suyo; si no lo tiene, el ultimo
     tramo de su carpeta `canonical`; y si tampoco, un trozo del id. */

/* Nombre legible de un proyecto. */
export function nombreProyecto(p) {
  if (!p) return "";
  if (p.name) return p.name;
  const canon = String(p.canonical || "").replace(/[\\/]+$/, "");
  const ultimo = canon.split(/[\\/]/).pop();
  return ultimo || String(p.id || "").slice(0, 8);
}

/* IDs de proyecto distintos presentes en la lista, ordenados y sin vacios. */
export function proyectosUnicos(sesiones) {
  return [...new Set((sesiones || []).map((s) => s.projectID).filter(Boolean))].sort();
}

/* Instante para ordenar (updated o created, lo que haya). */
function instante(s) {
  return s?.time?.updated || s?.time?.created || 0;
}

/* Filtra por proyecto y texto, y ordena. Todo en memoria.
   opciones = { proyecto: id | "*", texto: string, orden: "recientes"|"antiguas"|"nombre" } */
export function filtrarSesiones(items, opciones = {}) {
  const { proyecto = "*", texto = "", orden = "recientes" } = opciones;
  let lista = items || [];
  if (proyecto && proyecto !== "*") {
    lista = lista.filter((s) => s.projectID === proyecto);
  }
  const q = String(texto).trim().toLowerCase();
  if (q) {
    lista = lista.filter((s) =>
      `${s.title || ""} ${s.id} ${s.model?.id || ""}`.toLowerCase().includes(q)
    );
  }
  const copia = [...lista];
  if (orden === "antiguas") copia.sort((a, b) => instante(a) - instante(b));
  else if (orden === "nombre")
    copia.sort((a, b) => (a.title || a.id).localeCompare(b.title || b.id));
  else copia.sort((a, b) => instante(b) - instante(a)); // recientes (por defecto)
  return copia;
}

/* Mapa id -> nombre para los proyectos dados (los que falten usan el id). */
export function nombresDeProyectos(ids, proyectos) {
  const mapa = {};
  for (const p of proyectos || []) mapa[p.id] = nombreProyecto(p);
  const out = {};
  for (const id of ids || []) out[id] = mapa[id] || String(id).slice(0, 8);
  return out;
}
