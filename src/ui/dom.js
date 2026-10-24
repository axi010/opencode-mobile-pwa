/* Helpers DOM + render minimo de markdown (seguro: siempre se escapa). */
import { t } from "../i18n.js";

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === "class") el.className = v;
    else if (k === "dataset") Object.assign(el.dataset, v);
    else if (k.startsWith("on") && typeof v === "function")
      // addEventListener es case-sensitive: onClick -> "click" (no "Click")
      el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v !== false && v != null) el.setAttribute(k, v === true ? "" : v);
  }
  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    el.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return el;
}

export function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/* Copia texto al portapapeles. Usa la API moderna (solo disponible en
   contextos seguros: https o localhost) y, si no existe, una alternativa con
   un textarea oculto. Devuelve true si se pudo copiar. */
export async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    /* sin Clipboard API: se prueba la alternativa */
  }
  const ta = document.createElement("textarea");
  ta.value = texto;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.append(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  ta.remove();
  return ok;
}

function bloqueCodigo(lang, code) {
  return (
    `<div class="code-block"><div class="code-head">` +
    `<span class="code-lang">${lang}</span>` +
    `<button type="button" class="copy-btn">${t("Copiar")}</button></div>` +
    `<pre>${code}</pre></div>`
  );
}

/* Markdown ligero y seguro: todo se escapa antes de generar HTML.
   Soporta bloques de código (con botón de copiar), código en línea, negritas,
   títulos, enlaces http(s) y listas con guion o numeradas.
   El código se aparta con marcadores antes de aplicar formato, para que nada
   de lo que hay dentro (comentarios con #, asteriscos, saltos de línea) se
   transforme. */
export function renderMarkdown(text) {
  const bloques = [];
  const enLinea = [];
  let out = escapeHtml(text).replaceAll("\u0000", "");

  out = out.replace(/```([\w-]*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    bloques.push(bloqueCodigo(lang, code.replace(/\n$/, "")));
    return `\u0000B${bloques.length - 1}\u0000`;
  });
  out = out.replace(/`([^`\n]+)`/g, (_, code) => {
    enLinea.push(`<code>${code}</code>`);
    return `\u0000I${enLinea.length - 1}\u0000`;
  });

  out = out.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(
    /\[([^\]]+)\]\((https?:[^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Estructura por líneas: listas, títulos, bloques de código y texto.
  const partes = []; // { html, bloque }
  let lista = null;
  const cerrarLista = () => {
    if (lista) {
      partes.push({ html: `</${lista}>`, bloque: true });
      lista = null;
    }
  };
  for (const linea of out.split("\n")) {
    const ul = /^\s*[-*]\s+(.+)$/.exec(linea);
    const ol = /^\s*\d{1,3}[.)]\s+(.+)$/.exec(linea);
    const item = ul || ol;
    if (item) {
      const tipo = ul ? "ul" : "ol";
      if (lista !== tipo) {
        cerrarLista();
        partes.push({ html: `<${tipo}>`, bloque: true });
        lista = tipo;
      }
      partes.push({ html: `<li>${item[1]}</li>`, bloque: true });
      continue;
    }
    cerrarLista();
    if (/^\u0000B\d+\u0000$/.test(linea.trim())) {
      partes.push({ html: linea.trim(), bloque: true });
      continue;
    }
    const titulo = /^#{1,6}\s+(.*)$/.exec(linea);
    partes.push({ html: titulo ? `<strong>${titulo[1]}</strong>` : linea, bloque: false });
  }
  cerrarLista();

  // <br> solo entre líneas de texto contiguas (no junto a listas ni código).
  let html = "";
  partes.forEach((p, i) => {
    if (i > 0 && !p.bloque && !partes[i - 1].bloque) html += "<br>";
    html += p.html;
  });

  html = html.replace(/\u0000I(\d+)\u0000/g, (_, i) => enLinea[Number(i)]);
  html = html.replace(/\u0000B(\d+)\u0000/g, (_, i) => bloques[Number(i)]);
  return html;
}

export function timeAgo(ts) {
  const s = Math.max(0, (Date.now() - ts) / 1000);
  if (s < 60) return t("ahora");
  if (s < 3600) return t("hace {n} min", { n: Math.floor(s / 60) });
  if (s < 86400) return t("hace {n} h", { n: Math.floor(s / 3600) });
  return t("hace {n} d", { n: Math.floor(s / 86400) });
}

let toastTimer = null;
export function toast(msg, ms = 3200) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.hidden = true;
  }, ms);
}
