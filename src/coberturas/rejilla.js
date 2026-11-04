// Rejilla de teselas de 6 unidades de escena y distancia de cada tesela a los cauces. Se calcula una sola vez:
// la comparten las coberturas y las vías.
import { trazarRios, medirDistancias, enPosicion } from '../terreno/hidrografia.js';
import { BORDE } from '../terreno/plano.js';

export const LADO = 6; // lado de la tesela; múltiplo del paso del terreno (3)
const ALCANCE = 80; // distancia a los cauces que se mide

// Rejilla de centros de teselas (misma interfaz que crearRejilla, para medirDistancias).
function crearCentros() {
  const columnas = Math.round((2 * BORDE.x) / LADO);
  const filas = Math.round((2 * BORDE.z) / LADO);
  const x0 = -BORDE.x + LADO / 2;
  const z0 = -BORDE.z + LADO / 2;
  return { paso: LADO, columnas, filas, total: columnas * filas, x0, z0, x: (i) => x0 + i * LADO, z: (j) => z0 + j * LADO };
}

// Distancia de cada tesela al borde del cauce más cercano, con el río y la posición a lo largo del trazo.
function medirCauces(centros) {
  const { total } = centros;
  const borde = new Float32Array(total).fill(Infinity);
  const rio = new Int16Array(total).fill(-1);
  const posicion = new Float32Array(total);
  const rios = trazarRios();
  rios.forEach((r, k) => {
    const { distancia, posicion: pos } = medirDistancias(centros, r, ALCANCE);
    for (let t = 0; t < total; t++) {
      if (distancia[t] === Infinity) continue;
      const d = distancia[t] - enPosicion(r.muestras, pos[t], 'ancho') * 0.5;
      if (d < borde[t]) {
        borde[t] = d;
        rio[t] = k;
        posicion[t] = pos[t];
      }
    }
  });
  return { rios, borde, rio, posicion };
}

let memoria = null;

export function rejillaTeselas() {
  if (!memoria) {
    const centros = crearCentros();
    memoria = { centros, cauces: medirCauces(centros) };
  }
  return memoria;
}

// Índice de la tesela que contiene un punto, o -1 fuera de la maqueta.
export function teselaDe(centros, x, z) {
  const i = Math.floor((x + BORDE.x) / LADO);
  const j = Math.floor((z + BORDE.z) / LADO);
  if (i < 0 || j < 0 || i >= centros.columnas || j >= centros.filas) return -1;
  return j * centros.columnas + i;
}

// Distancia de un punto al borde del cauce más cercano (negativa dentro del cauce); Infinity lejos de todo cauce.
export function distanciaACauce(rios, x, z) {
  let minimo = Infinity;
  for (const r of rios) {
    const m = r.muestras;
    for (let k = 0; k < m.length - 1; k++) {
      const a = m[k];
      const b = m[k + 1];
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const t = Math.min(1, Math.max(0, ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz || 1)));
      const d = Math.hypot(x - a.x - t * dx, z - a.z - t * dz) - (a.ancho + (b.ancho - a.ancho) * t) * 0.5;
      if (d < minimo) minimo = d;
    }
  }
  return minimo;
}
