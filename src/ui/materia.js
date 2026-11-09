// Panel de materia orgánica del suelo (etapa 7), en la columna derecha con el corte de suelo: una fila por cobertura
// con su valor y una barra sobre la escala de 0 al máximo (un intervalo «desde … hasta» lleva la base en tono
// claro). Datos en contenido/lote.json (materia_organica); al pie, la fuente abreviada con la marca de pendiente.
import '../lote/lote.css';
import contenido from '../../contenido/lote.json';
import fuentes from '../../contenido/fuentes.json';
import { obtener, suscribir } from '../estado.js';
import { abreviar } from '../util/fuentes.js';
import { visibleCorte } from '../lote/disposicion.js';

function elemento(etiqueta, clase, texto) {
  const e = document.createElement(etiqueta);
  if (clase) e.className = clase;
  if (texto != null) e.textContent = texto;
  return e;
}

function tramo(desde, hasta, maximo, clase = '') {
  const t = elemento('span', `materia-tramo ${clase}`.trim());
  t.style.left = `${((desde / maximo) * 100).toFixed(2)}%`;
  t.style.width = `${(((hasta - desde) / maximo) * 100).toFixed(2)}%`;
  return t;
}

export function crearMateria(columna) {
  const m = contenido.materia_organica;
  const panel = elemento('aside', 'materia');
  panel.setAttribute('aria-label', m.titulo);
  panel.append(elemento('div', 'materia-titulo', m.titulo), elemento('div', 'materia-subtitulo', m.subtitulo));
  for (const f of m.filas) {
    const fila = elemento('div', 'materia-fila');
    fila.dataset.fila = f.id;
    const rotulo = elemento('div', 'materia-rotulo');
    rotulo.append(elemento('span', '', f.rotulo), elemento('span', 'materia-valor', f.texto));
    const barra = elemento('div', 'materia-barra');
    if (f.desde) barra.append(tramo(0, f.desde, m.maximo, 'base'));
    barra.append(tramo(f.desde ?? 0, f.hasta, m.maximo));
    fila.append(rotulo, barra);
    panel.append(fila);
  }
  const pie = elemento('div', 'materia-pie');
  abreviar(m.fuentes, fuentes.fuentes).forEach((f, k) => {
    if (k) pie.append(' · ');
    const s = elemento('span', `fuente${f.pendiente ? ' pendiente' : ''}`, f.texto);
    s.title = f.referencia ?? '';
    pie.append(s);
  });
  panel.append(pie);
  columna.append(panel);

  const pintar = (estado) => {
    panel.hidden = !visibleCorte(estado);
  };
  suscribir(['capas', 'escala'], pintar);
  pintar(obtener());
}
