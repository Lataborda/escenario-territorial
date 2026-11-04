// Indicador de momento: barra de M0 a M6 (ancho según la meta en minutos), momento y parada actuales.
import { obtener, suscribir } from '../estado.js';
import { MOMENTOS, PARADAS, buscarParada, numeroDe } from '../navegacion/recorrido.js';

const MODOS = { libre: 'Modo libre', actividad: 'Actividad', autor: 'Modo autor' };

export function crearMomentos(contenedor) {
  const barra = document.createElement('div');
  barra.className = 'momentos-barra';
  const segmentos = MOMENTOS.map((m) => {
    const s = document.createElement('span');
    s.className = 'momento-segmento';
    s.style.flexGrow = m.meta;
    s.title = `${m.id} · ${m.nombre} (${m.meta} min)`;
    barra.append(s);
    return s;
  });
  const nombre = document.createElement('div');
  nombre.className = 'momentos-nombre';
  const detalle = document.createElement('div');
  detalle.className = 'momentos-detalle';
  contenedor.append(barra, nombre, detalle);

  function pintar(e) {
    const p = buscarParada(e.parada);
    const k = MOMENTOS.findIndex((m) => m.id === p?.momento);
    segmentos.forEach((s, i) => {
      s.classList.toggle('actual', i === k);
      s.classList.toggle('pasado', i < k);
    });
    nombre.textContent = k >= 0 ? `${MOMENTOS[k].id} · ${MOMENTOS[k].nombre}` : '';
    const partes = p ? [`Parada ${numeroDe(p.id)} de ${PARADAS.length}`] : [];
    if (MODOS[e.modo]) partes.push(MODOS[e.modo]);
    if (e.liviano) partes.push('Liviano');
    detalle.textContent = partes.join(' · ');
  }
  suscribir(['parada', 'modo', 'liviano'], pintar);
  pintar(obtener());
}
