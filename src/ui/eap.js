// Panel del índice EAP de las fincas tipo (capa «indices_eap»), en la columna derecha: un renglón por criterio,
// una columna por finca con el valor sobre un fondo de intensidad proporcional, y el total. Datos en
// contenido/eap.json; al pie, el rótulo de valores ilustrativos y la fuente abreviada (con la marca de pendiente si
// el localizador falta).
import contenido from '../../contenido/eap.json';
import fuentes from '../../contenido/fuentes.json';
import { obtener, suscribir } from '../estado.js';
import { abreviar } from '../util/fuentes.js';

const CAPA = 'indices_eap';

function elemento(etiqueta, clase, texto) {
  const e = document.createElement(etiqueta);
  if (clase) e.className = clase;
  if (texto != null) e.textContent = texto;
  return e;
}

export const totalEap = (finca) => contenido.criterios.reduce((s, c) => s + (contenido.valores[finca]?.[c.id] ?? 0), 0);

// Celda con el valor sobre un fondo del color de acento con opacidad proporcional (el texto oscuro conserva el
// contraste en todo el intervalo).
const FONDO = { minimo: 0.06, maximo: 0.38 };
function celda(valor, maximo) {
  const td = elemento('td', 'eap-valor', String(valor));
  const opacidad = FONDO.minimo + (FONDO.maximo - FONDO.minimo) * (valor / maximo);
  td.style.background = `rgba(47, 93, 80, ${opacidad.toFixed(3)})`;
  return td;
}

export function crearEap(columna) {
  const panel = elemento('aside', 'eap');
  panel.setAttribute('aria-label', contenido.titulo);
  const tabla = elemento('table', 'eap-tabla');
  const fila = (etiqueta, celdas, clase) => {
    const tr = elemento('tr', clase);
    tr.append(etiqueta, ...celdas);
    return tr;
  };
  const columnas = contenido.fincas;
  const encabezado = elemento('thead');
  encabezado.append(fila(elemento('th', 'eap-criterio eap-titulo', contenido.titulo), columnas.map((f) => elemento('th', 'eap-finca', f))));
  const cuerpo = elemento('tbody');
  for (const c of contenido.criterios) {
    const nombre = elemento('th', 'eap-criterio', c.corto);
    nombre.scope = 'row';
    nombre.title = `${c.sigla} · ${c.nombre}`;
    nombre.dataset.criterio = c.id;
    cuerpo.append(fila(nombre, columnas.map((f) => celda(contenido.valores[f][c.id], contenido.escala.maximo))));
  }
  const pieTabla = elemento('tfoot');
  const total = elemento('th', 'eap-criterio', `Total (de ${contenido.escala.total})`);
  total.scope = 'row';
  pieTabla.append(fila(total, columnas.map((f) => celda(totalEap(f), contenido.escala.total)), 'eap-total'));
  tabla.append(encabezado, cuerpo, pieTabla);
  const pie = elemento('div', 'eap-pie');
  pie.append(elemento('span', 'eap-nota', contenido.valores_rotulo));
  for (const f of abreviar(contenido.fuentes, fuentes.fuentes)) {
    pie.append(' · ');
    const s = elemento('span', `fuente${f.pendiente ? ' pendiente' : ''}`, f.texto);
    s.title = f.referencia ?? '';
    pie.append(s);
  }
  panel.append(tabla, pie);
  columna.append(panel);

  const pintar = ({ capas }) => {
    panel.hidden = !capas.includes(CAPA);
  };
  suscribir('capas', pintar);
  pintar(obtener());
}
