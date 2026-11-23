// Diagrama de la teoría de cambio (etapa 10.b.a; clave «diagrama» del almacén, tecla D y botón del panel de
// condiciones). Superposición opaca a la derecha del panel: a la izquierda, la situación de partida y las condiciones
// en dos grupos con su fuente; a la derecha, los resultados intermedios, el resultado final con su fuente y, debajo,
// los supuestos con su fuente. Resalta lo que el motor (src/reglas/motor.js) deriva de las condiciones activas:
// condiciones activas y sin efecto territorial, resultados alcanzados, enlaces y supuestos en juego. Textos, vínculos y
// fuentes salen de contenido/condiciones.json; el módulo solo lee el almacén.
import './diagrama.css';
import datos from '../../contenido/condiciones.json';
import escenarios from '../../contenido/escenarios.json';
import { obtener, suscribir } from '../estado.js';
import { motor, panelAbierto } from '../reglas/reglas.js';
import { abreviarFuentes } from './fuentes.js';

const T = datos.diagrama;
const ESCENARIOS = new Map(escenarios.escenarios.map((e) => [e.id, e]));
const NS = 'http://www.w3.org/2000/svg';
const INTERMEDIOS = datos.resultados.intermedios;
const FINAL = datos.resultados.final;

function elemento(etiqueta, clase, texto) {
  const e = document.createElement(etiqueta);
  if (clase) e.className = clase;
  if (texto != null) e.textContent = texto;
  return e;
}

// Fuentes abreviadas en una línea; la referencia completa, al pasar el puntero.
function fuente(referencias, etiqueta = 'p') {
  const lista = abreviarFuentes(referencias);
  const e = elemento(etiqueta, 'dg-fuente', lista.map((f) => f.texto).join(' · '));
  e.title = lista.map((f) => f.referencia ?? f.texto).join('\n');
  return e;
}

const textoEscenario = (id) => {
  const s = ESCENARIOS.get(id);
  return s ? `${s.id} · ${s.rotulo ?? s.nombre}` : '';
};

export function crearDiagrama(raiz) {
  const seccion = elemento('section', 'diagrama');
  seccion.setAttribute('aria-label', T.titulo);
  seccion.hidden = true;
  raiz.append(seccion);

  const cabeza = elemento('header', 'dg-cabeza');
  const escenario = elemento('span', 'dg-escenario');
  const nota = elemento('span', 'dg-nota', datos.panel.nota);
  nota.title = datos.advertencia;
  cabeza.append(elemento('h2', 'dg-titulo', T.titulo), nota, escenario);

  const cuerpo = elemento('div', 'dg-cuerpo');
  const enlaces = document.createElementNS(NS, 'svg');
  enlaces.classList.add('dg-enlaces');
  enlaces.setAttribute('aria-hidden', 'true');
  const nodos = new Map(); // id -> elemento del nodo (condición, resultado o final)

  // Columna izquierda: situación de partida y condiciones por grupo.
  const izquierda = elemento('div', 'dg-izquierda');
  const partida = elemento('div', 'dg-partida');
  const s0 = ESCENARIOS.get(datos.derivacion.escenario_base);
  const nodoPartida = elemento('p', 'dg-nodo dg-nodo-partida', s0 ? `${s0.id} · ${s0.nombre}` : '');
  nodoPartida.title = datos.situacion_partida?.texto ?? '';
  partida.append(elemento('h3', 'dg-columna', T.partida), nodoPartida);
  izquierda.append(partida, elemento('h3', 'dg-columna', T.condiciones));
  const porId = new Map(datos.condiciones.map((c) => [c.id, c]));
  for (const g of T.grupos) {
    const grupo = elemento('div', 'dg-grupo');
    grupo.dataset.grupo = g.id;
    grupo.append(elemento('p', 'dg-grupo-rotulo', g.rotulo));
    const lista = elemento('ul', 'dg-condiciones');
    for (const id of g.condiciones) {
      const c = porId.get(id);
      const li = elemento('li', 'dg-nodo dg-condicion');
      li.dataset.nodo = id;
      li.title = `${c.nombre}\n${abreviarFuentes(c.fuentes).map((f) => f.texto).join(' · ')}`;
      const marca = elemento('span', 'dg-marca', '▲');
      marca.title = datos.panel.sin_efecto;
      li.append(elemento('span', 'dg-clave', id), elemento('span', 'dg-rotulo', c.rotulo ?? c.nombre), marca);
      lista.append(li);
      nodos.set(id, li);
    }
    grupo.append(lista, fuente(g.fuentes));
    izquierda.append(grupo);
  }

  // Columna derecha: resultados intermedios y final arriba, supuestos debajo.
  const derecha = elemento('div', 'dg-derecha');
  const resultados = elemento('div', 'dg-resultados');
  const columnaIntermedios = elemento('div', 'dg-intermedios');
  columnaIntermedios.append(elemento('h3', 'dg-columna', T.intermedios));
  for (const r of INTERMEDIOS) {
    const p = elemento('p', 'dg-nodo dg-resultado');
    p.dataset.nodo = r.id;
    p.append(elemento('span', 'dg-clave', r.id), elemento('span', 'dg-rotulo', r.texto));
    columnaIntermedios.append(p);
    nodos.set(r.id, p);
  }
  const columnaFinal = elemento('div', 'dg-final');
  const nodoFinal = elemento('p', 'dg-nodo dg-resultado dg-resultado-final', FINAL.texto);
  nodoFinal.dataset.nodo = FINAL.id;
  nodoFinal.title = FINAL.detalle ?? '';
  nodos.set(FINAL.id, nodoFinal);
  columnaFinal.append(elemento('h3', 'dg-columna', T.final), nodoFinal, fuente(FINAL.fuentes));
  resultados.append(columnaIntermedios, columnaFinal);

  const supuestos = elemento('div', 'dg-supuestos');
  const listaSupuestos = elemento('ul', 'dg-lista-supuestos');
  const filasSupuestos = datos.supuestos.map((h) => {
    const li = elemento('li', 'dg-supuesto');
    li.dataset.supuesto = h.id;
    // Texto y fuente en el mismo párrafo, para que la lista quepa sin cortes.
    const texto = elemento('p', 'dg-supuesto-texto');
    texto.append(elemento('span', 'dg-clave', h.id), ` ${h.texto} `, fuente(h.fuentes, 'span'));
    li.append(texto);
    listaSupuestos.append(li);
    return { id: h.id, li };
  });
  supuestos.append(elemento('h3', 'dg-columna', T.supuestos), listaSupuestos);
  derecha.append(resultados, supuestos);
  cuerpo.append(enlaces, izquierda, derecha);
  seccion.append(cabeza, cuerpo);

  // Enlaces: de cada condición a sus resultados intermedios y de cada intermedio al final.
  const pares = [
    ...INTERMEDIOS.flatMap((r) => r.condiciones.map((c) => ({ desde: c, hasta: r.id }))),
    ...(FINAL.resultados ?? []).map((r) => ({ desde: r, hasta: FINAL.id })),
  ].map((par) => {
    const trazo = document.createElementNS(NS, 'path');
    trazo.dataset.desde = par.desde;
    trazo.dataset.hasta = par.hasta;
    enlaces.append(trazo);
    return { ...par, trazo };
  });

  // Geometría de los enlaces: del borde derecho del nodo de origen al izquierdo del de destino, en curva.
  function trazar() {
    const base = cuerpo.getBoundingClientRect();
    enlaces.setAttribute('width', String(base.width));
    enlaces.setAttribute('height', String(base.height));
    enlaces.setAttribute('viewBox', `0 0 ${base.width} ${base.height}`);
    for (const { desde, hasta, trazo } of pares) {
      const a = nodos.get(desde).getBoundingClientRect();
      const b = nodos.get(hasta).getBoundingClientRect();
      const x1 = a.right - base.left;
      const y1 = a.top + a.height / 2 - base.top;
      const x2 = b.left - base.left;
      const y2 = b.top + b.height / 2 - base.top;
      const dx = (x2 - x1) / 2;
      trazo.setAttribute('d', `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`);
    }
  }

  let abierto = false;
  function pintar(e) {
    const visible = Boolean(e.diagrama) && panelAbierto(e);
    seccion.hidden = !visible;
    if (!visible) {
      abierto = false;
      return;
    }
    const r = motor.evaluar(e.condiciones);
    seccion.dataset.escenario = r.escenario ?? '';
    escenario.textContent = textoEscenario(r.escenario);
    escenario.title = ESCENARIOS.get(r.escenario)?.nombre ?? '';
    const estado = new Map(r.estado.map((c) => [c.id, c]));
    for (const c of r.estado) {
      const n = nodos.get(c.id);
      n.classList.toggle('activa', c.activa);
      n.classList.toggle('sin-efecto', c.activa && !c.territorial);
    }
    const alcanzados = new Set(r.resultados);
    if (r.final) alcanzados.add(FINAL.id);
    for (const id of [...INTERMEDIOS.map((x) => x.id), FINAL.id]) nodos.get(id).classList.toggle('alcanzado', alcanzados.has(id));
    // Enlace activo si su origen lo está; completo si su destino está alcanzado.
    for (const { desde, hasta, trazo } of pares) {
      const origen = estado.get(desde)?.activa ?? alcanzados.has(desde);
      trazo.classList.toggle('activo', origen);
      trazo.classList.toggle('completo', alcanzados.has(hasta));
    }
    const enJuego = new Set(r.supuestos);
    for (const f of filasSupuestos) f.li.classList.toggle('en-juego', enJuego.has(f.id));
    if (!abierto) trazar();
    abierto = true;
  }
  suscribir(['diagrama', 'condiciones', 'capas'], pintar);
  window.addEventListener('resize', () => abierto && trazar());
  pintar(obtener());
}
