// Paneles de la vista del presentador: parada actual con notas y fuentes, siguiente, índice y controles.
// Cada panel se suscribe al almacén del presentador (reflejo del estado de la vista principal).
// ordenar(accion, datos) envía la orden a la vista principal.
import { obtener, suscribir } from '../estado.js';
import { PARADAS, MOMENTOS, buscarParada, numeroDe, cantidadPasos } from '../navegacion/recorrido.js';
import { abreviarFuentes } from '../ui/fuentes.js';

const elemento = (etiqueta, clase, texto) => {
  const e = document.createElement(etiqueta);
  if (clase) e.className = clase;
  if (texto != null) e.textContent = texto;
  return e;
};
const minutos = (x) => `${String(x).replace('.', ',')} min`;
const momentoDe = (p) => MOMENTOS.find((m) => m.id === p?.momento);
const ESTADO_FUENTE = { 'en carpeta': 'en carpeta', falta: 'falta', verificar: 'por verificar' };

export function crearActual(contenedor) {
  const cabeza = elemento('div', 'actual-cabeza');
  const titulo = elemento('h1', 'actual-titulo');
  const borrador = elemento('span', 'etiqueta', 'borrador');
  cabeza.append(titulo, borrador);
  const datos = elemento('p', 'actual-datos');
  const pasos = elemento('ol', 'actual-pasos');
  const notas = elemento('p', 'actual-notas');
  const ficha = elemento('p', 'actual-ficha');
  const fuentes = elemento('ul', 'actual-fuentes');
  contenedor.append(
    cabeza, datos, pasos,
    elemento('h2', 'rotulo', 'Notas'), notas,
    elemento('h2', 'rotulo', 'Ficha en pantalla'), ficha,
    elemento('h2', 'rotulo', 'Fuentes'), fuentes,
  );

  function pintar(e) {
    const p = buscarParada(e.parada);
    contenedor.dataset.parada = p?.id ?? '';
    contenedor.dataset.paso = String(e.paso);
    if (!p) {
      titulo.textContent = 'Esperando la vista principal';
      [datos, notas, ficha].forEach((x) => (x.textContent = ''));
      pasos.replaceChildren();
      fuentes.replaceChildren();
      borrador.hidden = true;
      return;
    }
    const m = momentoDe(p);
    titulo.textContent = `${p.id} · ${p.titulo}`;
    borrador.hidden = p.estado_texto !== 'borrador';
    const n = cantidadPasos(p);
    const partes = [`${m.id} · ${m.nombre}`, `parada ${numeroDe(p.id)} de ${PARADAS.length}`, minutos(p.minutos), `escala ${p.escala}`];
    if (n > 1) partes.splice(2, 0, `paso ${e.paso + 1} de ${n}`);
    if (p.saltable) partes.push('saltable');
    datos.textContent = partes.join(' · ');
    pasos.replaceChildren(...(p.pasos ?? []).map((x, i) => elemento('li', i === e.paso ? 'actual' : '', x.rotulo)));
    pasos.hidden = n < 2;
    notas.textContent = p.notas;
    ficha.textContent = p.ficha;
    fuentes.replaceChildren(
      ...abreviarFuentes(p.fuentes).map((f) => {
        const li = elemento('li', f.pendiente ? 'pendiente' : '');
        li.append(elemento('strong', null, f.texto));
        if (f.referencia) li.append(elemento('span', 'referencia', f.referencia));
        li.append(elemento('span', 'etiqueta', f.pendiente && f.estado === 'en carpeta' ? 'localizador por verificar' : ESTADO_FUENTE[f.estado] ?? f.estado));
        return li;
      }),
    );
  }
  suscribir(['parada', 'paso'], pintar);
  pintar(obtener());
}

// Paso o parada siguiente; si la parada siguiente es saltable, ofrece omitirla.
export function crearSiguiente(contenedor, ordenar) {
  const titulo = elemento('p', 'siguiente-titulo');
  const datos = elemento('p', 'siguiente-datos');
  const omitir = elemento('button', 'boton omitir');
  omitir.id = 'omitir';
  contenedor.append(elemento('h2', 'rotulo', 'Siguiente'), titulo, datos, omitir);
  let destino = null;
  omitir.addEventListener('click', () => destino && ordenar('irA', { parada: destino }));

  function pintar(e) {
    const p = buscarParada(e.parada);
    omitir.hidden = true;
    contenedor.dataset.siguiente = '';
    contenedor.classList.remove('saltable');
    titulo.textContent = datos.textContent = '';
    if (!p) return;
    if (e.paso < cantidadPasos(p) - 1) {
      contenedor.dataset.siguiente = `${p.id}.${e.paso + 1}`;
      titulo.textContent = `Paso ${e.paso + 2}: ${p.pasos[e.paso + 1].rotulo}`;
      datos.textContent = 'Misma parada y cámara';
      return;
    }
    const i = numeroDe(p.id);
    const q = PARADAS[i];
    if (!q) {
      titulo.textContent = 'Fin del recorrido';
      return;
    }
    contenedor.dataset.siguiente = `${q.id}.0`;
    const m = momentoDe(q);
    titulo.textContent = `${q.id} · ${q.titulo}`;
    const partes = [q.momento !== p.momento ? `cambio a ${m.id} · ${m.nombre}` : m.id, minutos(q.minutos)];
    if (q.saltable) partes.push('saltable');
    datos.textContent = partes.join(' · ');
    contenedor.classList.toggle('saltable', Boolean(q.saltable));
    destino = PARADAS[i + 1]?.id ?? null;
    if (q.saltable && destino) {
      omitir.hidden = false;
      omitir.textContent = `Omitir ${q.id} e ir a ${destino}`;
    }
  }
  suscribir(['parada', 'paso'], pintar);
  pintar(obtener());
}

// Índice de paradas agrupadas por momento; un clic lleva la vista principal a esa parada.
export function crearIndice(contenedor, ordenar) {
  const lista = elemento('ol', 'indice-lista');
  contenedor.append(elemento('h2', 'rotulo', 'Índice'), lista);
  const filas = new Map();
  for (const m of MOMENTOS) {
    lista.append(elemento('li', 'indice-momento', `${m.id} · ${m.nombre} · ${minutos(m.meta)}`));
    for (const p of PARADAS.filter((x) => x.momento === m.id)) {
      const li = elemento('li', `indice-parada${p.saltable ? ' saltable' : ''}`);
      const boton = elemento('button', null);
      boton.dataset.parada = p.id;
      boton.append(elemento('span', 'indice-id', p.id), elemento('span', 'indice-titulo', p.titulo), elemento('span', 'indice-min', String(p.minutos).replace('.', ',')));
      boton.addEventListener('click', () => ordenar('irA', { parada: p.id }));
      li.append(boton);
      lista.append(li);
      filas.set(p.id, li);
    }
  }
  suscribir('parada', ({ parada }) => {
    filas.forEach((li, id) => li.classList.toggle('actual', id === parada));
    filas.get(parada)?.scrollIntoView?.({ block: 'nearest' });
  });
}

// Controles: anterior, siguiente, momentos, modo libre, interfaz, modo liviano y miniatura de la vista principal.
export function crearControles(contenedor, ordenar) {
  const boton = (id, texto, accion, datos, titulo) => {
    const b = elemento('button', 'boton', texto);
    b.id = id;
    if (titulo) b.title = titulo;
    b.addEventListener('click', () => ordenar(accion, datos));
    return b;
  };
  const avance = elemento('div', 'controles-avance');
  avance.append(
    boton('anterior', '← Anterior', 'anterior', null, 'Flecha izquierda o Re Pág'),
    boton('siguiente', 'Siguiente →', 'siguiente', null, 'Flecha derecha, espacio o Av Pág'),
  );
  const momentos = elemento('div', 'controles-momentos');
  MOMENTOS.forEach((m, n) => momentos.append(boton(`momento-${n}`, m.id, 'momento', { n }, `${m.nombre} (tecla ${n})`)));
  const libre = boton('libre', 'Modo libre', 'libre', null, 'Tecla O');
  const interfaz = boton('interfaz', 'Interfaz', 'alternar', { clave: 'interfaz' }, 'Tecla H');
  const liviano = boton('liviano', 'Liviano', 'alternar', { clave: 'liviano' }, 'Tecla V');
  const miniatura = boton('miniatura', 'Miniatura', 'alternar', { clave: 'miniatura' }, 'Tecla M: desenfoque de miniatura');
  const modos = elemento('div', 'controles-modos');
  modos.append(libre, interfaz, liviano, miniatura);
  contenedor.append(avance, momentos, modos);

  suscribir(['parada', 'modo', 'interfaz', 'liviano', 'miniatura'], (e) => {
    libre.setAttribute('aria-pressed', String(e.modo === 'libre'));
    miniatura.setAttribute('aria-pressed', String(Boolean(e.miniatura)));
    interfaz.setAttribute('aria-pressed', String(Boolean(e.interfaz)));
    liviano.setAttribute('aria-pressed', String(Boolean(e.liviano)));
    interfaz.textContent = e.interfaz ? 'Interfaz visible' : 'Interfaz oculta';
    const k = MOMENTOS.findIndex((m) => m.id === buscarParada(e.parada)?.momento);
    [...momentos.children].forEach((b, i) => b.classList.toggle('actual', i === k));
  });
}
