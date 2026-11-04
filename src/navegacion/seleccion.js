// Clic sobre fincas y mercados: busca el ancla más próxima al puntero en la pantalla.
// Sin geometría propia todavía (etapas 6 y 9): basta la proyección de las anclas.
import * as THREE from 'three';
import { obtener } from '../estado.js';
import { ancla } from '../terreno/terreno.js';
import { seleccionables, enfocar } from './foco.js';

const RADIO = 0.035; // fracción del alto de la ventana
const ARRASTRE = 6; // píxeles: un movimiento mayor es órbita, no clic

export function crearSeleccion({ camara, lienzo }) {
  const v = new THREE.Vector3();

  function buscar(cx, cy) {
    const r = lienzo.getBoundingClientRect();
    camara.updateMatrixWorld();
    let mejor = null;
    for (const e of seleccionables(obtener().escenario)) {
      const p = ancla(e.id);
      if (!p) continue;
      v.copy(p).project(camara);
      if (v.z > 1) continue; // detrás de la cámara
      const x = r.left + ((v.x + 1) / 2) * r.width;
      const y = r.top + ((1 - v.y) / 2) * r.height;
      const d = Math.hypot(x - cx, y - cy);
      if (d < RADIO * r.height && (!mejor || d < mejor.d)) mejor = { id: e.id, d };
    }
    return mejor?.id ?? null;
  }

  let inicio = null;
  lienzo.addEventListener('pointerdown', (ev) => {
    inicio = ev.button === 0 ? { x: ev.clientX, y: ev.clientY } : null;
  });
  lienzo.addEventListener('pointerup', (ev) => {
    if (!inicio) return;
    const movimiento = Math.hypot(ev.clientX - inicio.x, ev.clientY - inicio.y);
    inicio = null;
    if (movimiento > ARRASTRE) return;
    const id = buscar(ev.clientX, ev.clientY);
    if (id) enfocar(id);
  });

  // Cursor de mano sobre lo que responde al clic.
  let pendiente = false;
  lienzo.addEventListener('pointermove', (ev) => {
    if (pendiente || ev.buttons) return;
    pendiente = true;
    requestAnimationFrame(() => {
      pendiente = false;
      lienzo.style.cursor = buscar(ev.clientX, ev.clientY) ? 'pointer' : '';
    });
  });

  return { buscar };
}
