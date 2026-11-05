// Leyenda de coberturas: color, forma y rótulo de los tipos presentes en el escenario actual.
// Visible en las escalas de contenido/territorio.json (coberturas.leyenda.escalas).
import territorio from '../../contenido/territorio.json';
import contenido from '../../contenido/escenarios.json';
import fincas from '../../contenido/fincas.json';
import { obtener, suscribir } from '../estado.js';
import { TIPOS, VEGETACION, HORTALIZAS, tiposPresentes } from '../coberturas/tipos.js';

const { leyenda, tipos } = territorio.coberturas;
const USOS_FINCAS = fincas.fincas.flatMap((f) => f.lotes.map((l) => l.uso));
const AGUA = '#4a83b4';
const css = (hex) => `#${(hex ?? 0xffffff).toString(16).padStart(6, '0')}`;
const SVG = 'http://www.w3.org/2000/svg';

// Iconos de 32 × 22: cada tipo con una forma propia, además del color.
const fondo = (t) => `<rect x="1" y="3" width="30" height="16" rx="2" fill="${css(t.color)}" stroke="rgba(43,42,39,.35)"/>`;
const copa = (t, x, y, r = 4.2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${css(t.copa)}" stroke="rgba(43,42,39,.4)"/>`;
const punto = (x, y, r, hex) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${css(hex)}" stroke="rgba(43,42,39,.3)" stroke-width=".6"/>`;
const FORMAS = {
  surcos: (t) => fondo(t) + [9, 16, 23].map((x) => `<line x1="${x}" y1="5" x2="${x}" y2="17" stroke="rgba(43,42,39,.35)" stroke-width="1.6"/>`).join(''),
  surcos_puntos: (t) =>
    fondo(t) + [9, 16, 23].map((x) => `<line x1="${x}" y1="5" x2="${x}" y2="17" stroke="rgba(255,255,255,.75)" stroke-width="1.8" stroke-dasharray="2 2"/>`).join(''),
  pasto: (t) => fondo(t) + [7, 13, 19, 25].map((x) => `<path d="M${x} 15 l1.5 -4 l1.5 4" fill="none" stroke="rgba(43,42,39,.4)"/>`).join(''),
  arboles_dispersos: (t) => fondo(t) + copa(t, 9, 11, 3.6) + copa(t, 23, 11, 3.6),
  arboles: (t) => fondo(t) + copa(t, 10, 13) + copa(t, 17, 9) + copa(t, 23, 13) + copa(t, 15, 15),
  agua: (t) =>
    fondo(t) + '<path d="M4 13 q3 -3 6 0 t6 0 t6 0 t6 0" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="1.6"/>' +
    [8, 20].map((x) => `<line x1="${x}" y1="6" x2="${x + 1}" y2="11" stroke="${css(VEGETACION.junco)}" stroke-width="1.5"/>`).join(''),
  ribera: (t) =>
    `<path d="M1 11 q8 -3 15 0 t15 0" fill="none" stroke="${AGUA}" stroke-width="3"/>` + copa(t, 7, 5, 3.4) + copa(t, 20, 5, 3.4) +
    copa(t, 13, 17, 3.4) + `<line x1="27" y1="20" x2="29" y2="13" stroke="${css(VEGETACION.guadua)}" stroke-width="1.6"/>`,
  bosque: (t) => copa(t, 8, 13, 5) + copa(t, 16, 8, 5) + copa(t, 24, 13, 5),
  // Mosaico campesino: hileras de cafetos bajo un guamo; abanico de hojas; copas con frutos; eras.
  cafe: (t) =>
    fondo(t) + [6, 11, 16].flatMap((x) => [8, 15].map((y) => punto(x, y, 2, VEGETACION.cafeto))).join('') +
    `<ellipse cx="24" cy="9" rx="6" ry="4" fill="${css(VEGETACION.guamo)}" stroke="rgba(43,42,39,.4)"/>`,
  platano: (t) =>
    fondo(t) +
    [-60, -20, 20, 60].map((a) => `<path d="M16 17 q-2 -8 0 -12 q3 4 0 12" fill="${css(VEGETACION.platano)}" stroke="rgba(43,42,39,.4)" transform="rotate(${a} 16 17)"/>`).join(''),
  frutales: (t) =>
    fondo(t) + [9, 23].map((x) => punto(x, 11, 5, VEGETACION.citrico) + punto(x - 2, 9, 1.4, VEGETACION.naranja) + punto(x + 2, 13, 1.4, VEGETACION.naranja)).join(''),
  huerta: (t) =>
    fondo(t) + [7, 11, 15].map((y, k) => `<rect x="4" y="${y - 1.4}" width="24" height="2.8" rx="1.4" fill="${css(HORTALIZAS[k * 2])}"/>`).join(''),
  roseta: () =>
    [9, 22].map((x) =>
      `<line x1="${x}" y1="20" x2="${x}" y2="11" stroke="${css(VEGETACION.frailejonTallo)}" stroke-width="2"/>` +
      `<ellipse cx="${x}" cy="9" rx="5" ry="3.4" fill="${css(VEGETACION.frailejonHoja)}" stroke="rgba(43,42,39,.4)"/>`,
    ).join(''),
};

export function icono(id) {
  const t = TIPOS[id];
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 32 22');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('leyenda-icono');
  svg.innerHTML = (FORMAS[t.forma] ?? fondo)(t);
  return svg;
}

export function crearLeyenda(contenedor) {
  contenedor.setAttribute('aria-label', leyenda.titulo);
  const cabeza = document.createElement('div');
  cabeza.className = 'leyenda-cabeza';
  const titulo = document.createElement('span');
  titulo.className = 'leyenda-titulo';
  titulo.textContent = leyenda.titulo;
  const nota = document.createElement('span');
  nota.className = 'leyenda-nota';
  nota.textContent = leyenda.nota ?? '';
  cabeza.append(titulo, nota);
  const lista = document.createElement('ul');
  lista.className = 'leyenda-lista';
  const entradas = new Map();
  for (const t of tipos) {
    const li = document.createElement('li');
    li.className = 'leyenda-entrada';
    li.dataset.tipo = t.id;
    li.title = t.nombre;
    const texto = document.createElement('span');
    texto.textContent = t.rotulo;
    li.append(icono(t.id), texto);
    lista.append(li);
    entradas.set(t.id, li);
  }
  contenedor.append(cabeza, lista);

  function pintar({ escenario, escala }) {
    contenedor.hidden = !leyenda.escalas.includes(escala);
    const presentes = tiposPresentes(contenido.escenarios.find((s) => s.id === escenario), USOS_FINCAS);
    for (const [id, li] of entradas) li.hidden = !presentes.has(id);
  }
  suscribir(['escenario', 'escala'], pintar);
  pintar(obtener());
}
