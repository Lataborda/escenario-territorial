// Leyenda de capas de la finca (conectores, EEP, conexión con la EEP) y usos de la finca del punto de interés
// (capa «rotulos_finca»), en la columna derecha. Los números del panel de usos son los de los marcadores de los
// lotes (src/fincas/rotulos.js). Textos en contenido/fincas.json; colores en src/fincas/estilo.js.
import './capas.css';
import contenido from '../../contenido/fincas.json';
import fuentes from '../../contenido/fuentes.json';
import { obtener, suscribir } from '../estado.js';
import { ESTILO, activa, css } from '../fincas/estilo.js';
import { abreviar } from '../util/fuentes.js';
import { icono } from './leyenda.js';

const TRAZOS = ['conectores_internos', 'conectores_externos', 'eep', 'conexion_eep'];
const SVG = 'http://www.w3.org/2000/svg';
const RECETAS = contenido.fincas;

function elemento(etiqueta, clase, texto) {
  const e = document.createElement(etiqueta);
  if (clase) e.className = clase;
  if (texto != null) e.textContent = texto;
  return e;
}

// Muestra de línea con halo, como el trazo en la escena.
function muestra(nombre) {
  const e = ESTILO[nombre];
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 32 22');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('capas-muestra');
  const ancho = Math.min(e.ancho, 6);
  svg.innerHTML =
    (e.halo != null ? `<line x1="3" y1="11" x2="29" y2="11" stroke="${css(e.halo)}" stroke-width="${ancho + 3}" stroke-linecap="round"/>` : '') +
    `<line x1="3" y1="11" x2="29" y2="11" stroke="${css(e.color)}" stroke-width="${ancho}" stroke-linecap="round"/>`;
  return svg;
}

// Número del marcador de un lote (el mismo de la escena).
export const marca = (n) => elemento('span', 'capas-numero', String(n));

export function crearCapas(columna) {
  const leyenda = elemento('aside', 'capas');
  leyenda.setAttribute('aria-label', 'Capas');
  const lista = elemento('ul', 'capas-lista');
  const entradas = new Map();
  for (const nombre of TRAZOS) {
    const li = elemento('li', 'capas-entrada');
    li.dataset.capa = nombre;
    li.title = contenido.capas[nombre].descripcion ?? '';
    li.append(muestra(nombre), elemento('span', null, contenido.capas[nombre].rotulo));
    lista.append(li);
    entradas.set(nombre, li);
  }
  leyenda.append(lista);

  const usos = elemento('aside', 'usos-finca');
  usos.setAttribute('aria-label', 'Usos de la finca');
  const titulo = elemento('div', 'usos-titulo');
  const listaUsos = elemento('ol', 'usos-lista');
  const pie = elemento('div', 'usos-pie');
  usos.append(titulo, listaUsos, pie);
  columna.append(leyenda, usos);

  let finca = null;
  function pintarUsos(receta) {
    if (receta === finca) return;
    finca = receta;
    if (!receta) return;
    titulo.textContent = receta.referencia ? `${receta.nombre} (referencia ${receta.referencia})` : receta.nombre;
    const filas = receta.lotes.map((l, k) => {
      const li = elemento('li', 'usos-entrada');
      li.append(marca(k + 1), icono(l.uso), elemento('span', null, l.ha != null ? `${l.rotulo} · ${l.ha} ha` : l.rotulo));
      return li;
    });
    if (receta.corredores) {
      const li = elemento('li', 'usos-entrada');
      li.append(marca(receta.lotes.length + 1), muestra('conectores_internos'), elemento('span', null, `${receta.corredores.rotulo} · ${receta.corredores.ha} ha`));
      filas.push(li);
    }
    listaUsos.replaceChildren(...filas);
    // Áreas con fuente: la fuente abreviada; si no, el rótulo de valores ilustrativos.
    const fuente = abreviar(receta.fuentes ?? [], fuentes.fuentes).map((f) => f.texto).join(' · ');
    pie.textContent = receta.proporciones === 'fuente' ? fuente : 'Proporciones ilustrativas';
  }

  function pintar({ capas, foco }) {
    let alguna = false;
    for (const [nombre, li] of entradas) {
      li.hidden = !activa(nombre, capas);
      alguna ||= !li.hidden;
    }
    leyenda.hidden = !alguna;
    const receta = capas.includes('rotulos_finca') ? RECETAS.find((r) => r.id === foco) ?? null : null;
    usos.hidden = !receta;
    pintarUsos(receta);
  }
  suscribir(['capas', 'foco'], pintar);
  pintar(obtener());
}
