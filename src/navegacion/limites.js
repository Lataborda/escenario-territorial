// Límites del modo libre: la cámara sobre el relieve y el objetivo dentro de la maqueta.
// Incluye el punto del relieve bajo un rayo (doble clic), por marcha y bisección sobre superficie(x, z).
import * as THREE from 'three';
import { superficie } from '../terreno/terreno.js';
import { BORDE } from '../terreno/plano.js';
import { MEDIDAS } from '../escena/maqueta.js';
import { limitar } from '../util/interpolar.js';

// Altura de la cámara sobre el relieve vecino: margen pedido (mayor que el plano cercano de 10)
// y piso que nunca se cruza. La corrección hasta el margen es suave.
export const MARGEN = { minimo: 14, proporcion: 0.04, piso: 6, respuesta: 10 };
const RADIO_VECINO = 12; // la ladera junto a la cámara también cuenta
const TECHO_RAYO = 3000; // altura de la caja de la maqueta para la marcha del rayo
const PASO_RAYO = { proporcion: 0.4, minimo: 0.5, maximo: 20 };
const BISECCIONES = 12;

// Altura máxima de la superficie visible en (x, z) y en un círculo alrededor.
export function relieveVecino(x, z, radio = RADIO_VECINO) {
  let h = superficie(x, z);
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    h = Math.max(h, superficie(x + radio * Math.cos(a), z + radio * Math.sin(a)));
  }
  return h;
}

export const margenDe = (distancia) => Math.max(MARGEN.minimo, distancia * MARGEN.proporcion);

// Sube la cámara (posición, en el lugar) si está bajo el margen: con suavidad hasta el margen,
// de inmediato hasta el piso. Devuelve la altura sobre el relieve vecino.
export function corregirAltura(posicion, distancia, dt) {
  const base = relieveVecino(posicion.x, posicion.z);
  const minima = base + margenDe(distancia);
  if (posicion.y < minima) posicion.y += (minima - posicion.y) * (1 - Math.exp(-dt * MARGEN.respuesta));
  posicion.y = Math.max(posicion.y, base + MARGEN.piso);
  return posicion.y - base;
}

export const dentroDeMaqueta = (p) => Math.abs(p.x) <= BORDE.x + 1e-6 && Math.abs(p.z) <= BORDE.z + 1e-6;

// Lleva un punto (en el lugar) al interior de la maqueta en x y z.
export function limitarObjetivo(p) {
  p.x = limitar(p.x, -BORDE.x, BORDE.x);
  p.z = limitar(p.z, -BORDE.z, BORDE.z);
  return p;
}

// Tramo [t0, t1] del rayo dentro de la caja de la maqueta, o null.
function tramoEnCaja(o, d) {
  let t0 = 0;
  let t1 = Infinity;
  const caja = [['x', -BORDE.x, BORDE.x], ['y', -MEDIDAS.espesor, TECHO_RAYO], ['z', -BORDE.z, BORDE.z]];
  for (const [eje, min, max] of caja) {
    if (Math.abs(d[eje]) < 1e-9) {
      if (o[eje] < min || o[eje] > max) return null;
      continue;
    }
    let a = (min - o[eje]) / d[eje];
    let b = (max - o[eje]) / d[eje];
    if (a > b) [a, b] = [b, a];
    t0 = Math.max(t0, a);
    t1 = Math.min(t1, b);
    if (t0 > t1) return null;
  }
  return [t0, t1];
}

// Primer punto del rayo que toca la superficie visible (relieve o agua) dentro de la maqueta, o null.
export function puntoEnTerreno(rayo) {
  const { origin: o, direction: d } = rayo;
  const tramo = tramoEnCaja(o, d);
  if (!tramo) return null;
  const p = new THREE.Vector3();
  const sobre = (t) => {
    p.copy(o).addScaledVector(d, t);
    return p.y - superficie(p.x, p.z);
  };
  const [t0, t1] = tramo;
  let antes = t0;
  let h = sobre(t0);
  let t = t0;
  // Si el rayo entra por la cara lateral del bloque, el punto es el borde de esa cara.
  if (h > 0) {
    while (t < t1) {
      t = Math.min(t1, t + limitar(h * PASO_RAYO.proporcion, PASO_RAYO.minimo, PASO_RAYO.maximo));
      h = sobre(t);
      if (h <= 0) break;
      antes = t;
    }
    if (h > 0) return null;
    let a = antes;
    let b = t;
    for (let k = 0; k < BISECCIONES; k++) {
      const m = (a + b) / 2;
      if (sobre(m) > 0) a = m;
      else b = m;
    }
    sobre(b);
  }
  return new THREE.Vector3(p.x, superficie(p.x, p.z), p.z);
}
