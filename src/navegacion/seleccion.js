// Clic sobre fincas y mercados: busca el ancla más próxima al puntero en la pantalla; si no hay, la finca cuyo
// lindero contiene el punto del relieve bajo el puntero (etapa 6).
import * as THREE from 'three';
import { obtener } from '../estado.js';
import { ancla } from '../terreno/terreno.js';
import { fincaEn } from '../fincas/trazado.js';
import { seleccionables, enfocar } from './foco.js';
import { puntoEnTerreno } from './limites.js';

const RADIO = 0.035; // fracción del alto de la ventana
const ARRASTRE = 6; // píxeles: un movimiento mayor es órbita, no clic

export function crearSeleccion({ camara, lienzo }) {
  const v = new THREE.Vector3();
  const rayos = new THREE.Raycaster();

  // Finca bajo el puntero, si responde al clic en el escenario actual.
  function fincaBajo(cx, cy, r) {
    rayos.setFromCamera(new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), camara);
    const p = puntoEnTerreno(rayos.ray);
    const f = p && fincaEn(p.x, p.z);
    return f && seleccionables(obtener().escenario).some((e) => e.id === f.id) ? f.id : null;
  }

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
    return mejor?.id ?? fincaBajo(cx, cy, r);
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
