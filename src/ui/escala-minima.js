// Panel de síntesis de la escala mínima de cada proceso (P12, capa «escala_minima»), en la columna derecha: una fila
// por proceso de contenido/escalas.json (procesos), todas con el mismo estilo. Cada fila lleva el nombre, una regleta
// con las siete escalas de la botonera (la escala mínima resaltada con su número y las mayores en tono suave) y la
// escala mínima en texto. Al pie, la fuente abreviada con la marca de pendiente.
import contenido from '../../contenido/escalas.json';
import fuentes from '../../contenido/fuentes.json';
import { obtener, suscribir } from '../estado.js';
import { abreviar } from '../util/fuentes.js';

const CAPA = 'escala_minima';

function elemento(etiqueta, clase, texto) {
  const e = document.createElement(etiqueta);
  if (clase) e.className = clase;
  if (texto != null) e.textContent = texto;
  return e;
}

export function crearEscalaMinima(columna) {
  const { sintesis, escalas, procesos } = contenido;
  const panel = elemento('aside', 'minima');
  panel.setAttribute('aria-label', sintesis.titulo);
  panel.append(elemento('div', 'minima-titulo', sintesis.titulo));
  for (const p of procesos) {
    const minima = escalas.find((e) => e.id === p.escala_minima);
    const fila = elemento('div', 'minima-fila');
    fila.dataset.proceso = p.id;
    fila.dataset.escala = p.escala_minima;
    const regleta = elemento('span', 'minima-regleta');
    regleta.setAttribute('aria-hidden', 'true');
    for (const e of escalas) {
      const esMinima = e.numero === minima.numero;
      const clase = esMinima ? ' es-minima' : e.numero > minima.numero ? ' es-mayor' : '';
      const paso = elemento('span', `minima-paso${clase}`, esMinima ? String(e.numero) : null);
      paso.title = e.nombre;
      regleta.append(paso);
    }
    const escala = elemento('div', 'minima-escala');
    escala.append(regleta, elemento('span', 'minima-texto', p.escala_minima_texto));
    fila.append(elemento('div', 'minima-nombre', p.nombre), escala);
    panel.append(fila);
  }
  const pie = elemento('div', 'minima-pie');
  pie.append(elemento('span', 'minima-nota', sintesis.nota));
  for (const f of abreviar([...new Set(procesos.flatMap((p) => p.fuentes))], fuentes.fuentes)) {
    pie.append(' · ');
    const s = elemento('span', `fuente${f.pendiente ? ' pendiente' : ''}`, f.texto);
    s.title = f.referencia ?? '';
    pie.append(s);
  }
  panel.append(pie);
  columna.append(panel);

  const pintar = ({ capas }) => {
    panel.hidden = !capas.includes(CAPA);
  };
  suscribir('capas', pintar);
  pintar(obtener());
}
