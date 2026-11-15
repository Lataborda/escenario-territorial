// Leyenda de flujos (etapa 8), en la columna derecha: color, forma y rótulo de cada flujo de las capas encendidas.
// Rótulos en contenido/procesos.json (leyenda); color y forma en src/flujos/estilo.js.
import './capas.css';
import contenido from '../../contenido/procesos.json';
import { obtener, suscribir } from '../estado.js';
import { ESTILO, css } from '../flujos/estilo.js';

const SVG = 'http://www.w3.org/2000/svg';
const { leyenda } = contenido;

// Muestra de 32 × 22: el trazo del flujo (si lo tiene) y su partícula encima, con el halo.
function muestra(id) {
  const e = ESTILO[id];
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 32 22');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('capas-muestra');
  const trazo = e.linea
    ? (e.linea.halo != null ? `<line x1="2" y1="11" x2="30" y2="11" stroke="${css(e.linea.halo)}" stroke-width="5" stroke-linecap="round"/>` : '') +
      `<line x1="2" y1="11" x2="30" y2="11" stroke="${css(e.linea.color)}" stroke-width="2.6" stroke-linecap="round"/>`
    : '';
  const relleno = `fill="${css(e.color)}" stroke="${css(e.halo)}" stroke-width="2.2"`;
  const formas = {
    circulo: `<circle cx="16" cy="11" r="5.6" ${relleno}/>`,
    cuadrado: `<rect x="10.6" y="5.6" width="10.8" height="10.8" ${relleno}/>`,
    rombo: `<path d="M16 3.6 L23.4 11 L16 18.4 L8.6 11 Z" ${relleno}/>`,
  };
  svg.innerHTML = trazo + formas[e.forma];
  return svg;
}

export function crearLeyendaFlujos(columna) {
  const panel = document.createElement('aside');
  panel.className = 'capas flujos';
  panel.setAttribute('aria-label', leyenda.titulo);
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
  lista.className = 'capas-lista';
  const entradas = leyenda.entradas.map((f) => {
    const li = document.createElement('li');
    li.className = 'capas-entrada';
    li.dataset.flujo = f.id;
    const texto = document.createElement('span');
    texto.textContent = f.rotulo;
    li.append(muestra(f.id), texto);
    lista.append(li);
    return { li, ...f };
  });
  panel.append(cabeza, lista);
  columna.append(panel);

  function pintar({ capas, escenario }) {
    let alguna = false;
    for (const f of entradas) {
      f.li.hidden = !capas.includes(f.capa) || (f.escenarios != null && !f.escenarios.includes(escenario));
      alguna ||= !f.li.hidden;
    }
    panel.hidden = !alguna;
  }
  suscribir(['capas', 'escenario'], pintar);
  pintar(obtener());
}
