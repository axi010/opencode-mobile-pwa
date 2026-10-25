/* Atajos de teclado para ESCRITORIO (en movil no aportan: no hay teclado).
   La decision de "que atajo es este" se aisla aqui (pura, sin DOM) para poder
   probarla con el runner de Node; el enganche al DOM lo hace registrarAtajos.

   Atajos:
   - Ctrl+K (Cmd+K en macOS): abrir/enfocar el buscador de la pantalla actual.
   - Escape: cerrar/limpiar lo que este abierto (buscador). Si hay una hoja
     inferior abierta, se ignora: esa la cierra su propio listener.
   Enter / Shift+Enter del composer NO se gestionan aqui (ya los maneja el
   textarea del chat): Enter envia, Shift+Enter hace salto de linea. */

/* Devuelve el id del atajo ("buscar" | "cerrar") o null. */
export function resolverAtajo(e) {
  if (!e || typeof e.key !== "string") return null;
  const key = e.key.toLowerCase();
  // Cmd en macOS, Ctrl en Windows/Linux. Alt/Shift cambian el atajo.
  const mod = Boolean(e.ctrlKey || e.metaKey);
  if (mod && !e.altKey && !e.shiftKey && key === "k") return "buscar";
  if (key === "escape" && !mod && !e.altKey) return "cerrar";
  return null;
}

/* Solo tiene sentido en dispositivos con teclado fisico (raton/trackpad y
   puntero fino). En tactil se evita registrar nada. */
export function esEscritorio() {
  try {
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  } catch {
    return false;
  }
}

/* Registra los atajos en la ventana y devuelve una funcion para quitarlos.
   acciones = { buscar(), cerrar() } (ambas opcionales). */
export function registrarAtajos(acciones = {}) {
  const onKey = (e) => {
    // Escape con una hoja inferior abierta lo gestiona la propia hoja.
    if (e.key === "Escape" && document.querySelector(".sheet")) return;
    const a = resolverAtajo(e);
    if (!a) return;
    if (a === "buscar") {
      // Ctrl+K en el navegador enfoca la barra de direcciones: se evita.
      e.preventDefault();
      acciones.buscar?.();
    } else if (a === "cerrar") {
      acciones.cerrar?.();
    }
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}
