// Niveles de detalle: celdas de 60 unidades de escena y distancia de cada celda a la cámara.
// Una especie se dibuja «cerca» en las celdas a menos de su umbral y «lejos» en el resto.
import { BORDE } from '../terreno/plano.js';

export const CELDA = 60;
const COLUMNAS = Math.ceil((2 * BORDE.x) / CELDA);
const FILAS = Math.ceil((2 * BORDE.z) / CELDA);
const MEDIA_DIAGONAL = CELDA * Math.SQRT1_2;

const indice = (v, n) => Math.min(n - 1, Math.max(0, Math.floor(v)));
export const celdaDe = (x, z) => indice((z + BORDE.z) / CELDA, FILAS) * COLUMNAS + indice((x + BORDE.x) / CELDA, COLUMNAS);

export function crearDetalle(altura) {
  const centros = [];
  for (let j = 0; j < FILAS; j++) {
    for (let i = 0; i < COLUMNAS; i++) {
      const x = -BORDE.x + (i + 0.5) * CELDA;
      const z = -BORDE.z + (j + 0.5) * CELDA;
      centros.push({ x, y: altura(x, z), z });
    }
  }
  const distancias = new Float32Array(centros.length).fill(Infinity);
  const ultima = { x: NaN, y: NaN, z: NaN };
  return {
    // Devuelve true si la cámara se movió desde la última medida.
    medir(camara) {
      const p = camara.position;
      if (p.x === ultima.x && p.y === ultima.y && p.z === ultima.z) return false;
      Object.assign(ultima, { x: p.x, y: p.y, z: p.z });
      centros.forEach((c, k) => {
        distancias[k] = Math.max(0, Math.hypot(c.x - p.x, c.y - p.y, c.z - p.z) - MEDIA_DIAGONAL);
      });
      return true;
    },
    cercana: (celda, umbral) => distancias[celda] < umbral,
  };
}
