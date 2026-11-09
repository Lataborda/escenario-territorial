// Panel de interacciones del lote (etapa 7, capa «interacciones»), en la columna derecha: una entrada por
// interacción con el número de su marcador en la escena (src/lote/rotulos.js), el nombre y la descripción breve.
// Textos en contenido/lote.json; al pie, la fuente abreviada con la marca de pendiente.
import '../lote/lote.css';
import contenido from '../../contenido/lote.json';
import fuentes from '../../contenido/fuentes.json';
import { obtener, suscribir } from '../estado.js';
import { abreviar } from '../util/fuentes.js';
import { marca } from './capas.js';

const CAPA = 'interacciones';

function elemento(etiqueta, clase, texto) {
  const e = document.createElement(etiqueta);
  if (clase) e.className = clase;
  if (texto != null) e.textContent = texto;
  return e;
}

export function crearInteracciones(columna) {
  const panel = elemento('aside', 'interacciones');
  panel.setAttribute('aria-label', contenido.interacciones_titulo);
  const lista = elemento('ol', 'interacciones-lista');
  contenido.interacciones.forEach((x, k) => {
    const li = elemento('li', 'interacciones-entrada');
    li.dataset.interaccion = x.id;
    const texto = elemento('span', 'interacciones-texto');
    texto.append(elemento('strong', null, x.rotulo), ` ${x.texto}`);
    li.append(marca(k + 1), texto);
    lista.append(li);
  });
  const pie = elemento('div', 'interacciones-pie');
  abreviar(contenido.interacciones_fuentes, fuentes.fuentes).forEach((f, k) => {
    if (k) pie.append(' · ');
    const s = elemento('span', `fuente${f.pendiente ? ' pendiente' : ''}`, f.texto);
    s.title = f.referencia ?? '';
    pie.append(s);
  });
  panel.append(elemento('div', 'interacciones-titulo', contenido.interacciones_titulo), lista, pie);
  columna.append(panel);

  const pintar = ({ capas }) => {
    panel.hidden = !capas.includes(CAPA);
  };
  suscribir('capas', pintar);
  pintar(obtener());
}
