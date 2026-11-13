// Niveles de detalle: celdas de 60 unidades de escena y distancia de cada celda a la cámara.
// Una especie se dibuja «cerca» en las celdas a menos de su umbral y «lejos» en el resto. Encuadre de la cámara
// principal (etapa 7.c): las capas dibujan solo las celdas que lo tocan.
import * as THREE from 'three';
import { BORDE } from '../terreno/plano.js';

export const CELDA = 60;
const COLUMNAS = Math.ceil((2 * BORDE.x) / CELDA);
const FILAS = Math.ceil((2 * BORDE.z) / CELDA);
const MEDIA_DIAGONAL = CELDA * Math.SQRT1_2;

const indice = (v, n) => Math.min(n - 1, Math.max(0, Math.floor(v)));
export const celdaDe = (x, z) => indice((z + BORDE.z) / CELDA, FILAS) * COLUMNAS + indice((x + BORDE.x) / CELDA, COLUMNAS);

// Esquina de menor x y z de una celda.
export const origenCelda = (celda) => ({ x: -BORDE.x + (celda % COLUMNAS) * CELDA, z: -BORDE.z + Math.floor(celda / COLUMNAS) * CELDA });

// Encuadre de una cámara. medir(camara) devuelve true si cambió (lugar, giro o proyección) desde la última medida;
// dentro(caja): la caja toca el encuadre; esfera(x, y, z, radio): la esfera lo toca. La cámara debe tener sus
// matrices al día.
export function crearEncuadre() {
  const volumen = new THREE.Frustum();
  const matriz = new THREE.Matrix4();
  const previa = new Float64Array(16).fill(NaN);
  const bola = new THREE.Sphere();
  return {
    medir(camara) {
      matriz.multiplyMatrices(camara.projectionMatrix, camara.matrixWorldInverse);
      if (matriz.elements.every((v, i) => v === previa[i])) return false;
      previa.set(matriz.elements);
      volumen.setFromProjectionMatrix(matriz);
      return true;
    },
    dentro: (caja) => volumen.intersectsBox(caja),
    esfera(x, y, z, radio) {
      bola.center.set(x, y, z);
      bola.radius = radio;
      return volumen.intersectsSphere(bola);
    },
  };
}

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
