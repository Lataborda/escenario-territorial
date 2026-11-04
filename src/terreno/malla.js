// Mallas del terreno: superficie facetada con color por vértice y láminas de agua.
import * as THREE from 'three';
import { tramosVisibles, LAMINA } from './hidrografia.js';

const COLOR_AGUA = 0x4a83b4; // semántica fija: agua azul

export function crearSuperficie(rejilla, alturasMundo, colores) {
  const { columnas, filas, total } = rejilla;
  const posiciones = new Float32Array(total * 3);
  for (let j = 0; j < filas; j++) {
    for (let i = 0; i < columnas; i++) {
      const idx = j * columnas + i;
      posiciones[idx * 3] = rejilla.x(i);
      posiciones[idx * 3 + 1] = alturasMundo[idx];
      posiciones[idx * 3 + 2] = rejilla.z(j);
    }
  }
  // Dos triángulos por celda con diagonal de b a c, igual que crearConsulta.
  const indices = new Uint32Array((columnas - 1) * (filas - 1) * 6);
  let n = 0;
  for (let j = 0; j < filas - 1; j++) {
    for (let i = 0; i < columnas - 1; i++) {
      const a = j * columnas + i;
      const b = a + 1;
      const c = a + columnas;
      const d = c + 1;
      indices.set([a, c, b, b, c, d], n);
      n += 6;
    }
  }
  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
  geometria.setAttribute('color', new THREE.BufferAttribute(colores, 3));
  geometria.setIndex(new THREE.BufferAttribute(indices, 1));
  geometria.computeVertexNormals();
  geometria.computeBoundingSphere();
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 });
  const malla = new THREE.Mesh(geometria, material);
  malla.name = 'superficie';
  malla.castShadow = true;
  malla.receiveShadow = true;
  return malla;
}

// Lámina de agua de cada tramo visible, horizontal en sección y con el ancho del cauce.
export function crearAgua(rios, exageracion) {
  const posiciones = [];
  const indices = [];
  for (const rio of rios) {
    for (const tramo of tramosVisibles(rio)) {
      const base = posiciones.length / 3;
      for (let k = 0; k < tramo.length; k++) {
        const p = tramo[k];
        const ant = tramo[Math.max(0, k - 1)];
        const sig = tramo[Math.min(tramo.length - 1, k + 1)];
        const tx = sig.x - ant.x;
        const tz = sig.z - ant.z;
        const l = Math.hypot(tx, tz) || 1;
        const nx = -tz / l;
        const nz = tx / l;
        const s = p.ancho * 0.5 * LAMINA;
        const y = p.nivel * exageracion;
        posiciones.push(p.x + nx * s, y, p.z + nz * s, p.x - nx * s, y, p.z - nz * s);
      }
      for (let k = 0; k < tramo.length - 1; k++) {
        const i = base + k * 2;
        indices.push(i, i + 1, i + 2, i + 1, i + 3, i + 2);
      }
    }
  }
  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute('position', new THREE.Float32BufferAttribute(posiciones, 3));
  geometria.setIndex(indices);
  orientarHaciaArriba(geometria);
  geometria.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({
    color: COLOR_AGUA,
    roughness: 0.6,
    metalness: 0,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -2,
  });
  const malla = new THREE.Mesh(geometria, material);
  malla.name = 'agua';
  malla.receiveShadow = true;
  return malla;
}

// Invierte los triángulos cuya normal apunta hacia abajo.
function orientarHaciaArriba(geometria) {
  const p = geometria.attributes.position.array;
  const ind = geometria.index.array;
  for (let t = 0; t < ind.length; t += 3) {
    const a = ind[t] * 3;
    const b = ind[t + 1] * 3;
    const c = ind[t + 2] * 3;
    const abx = p[b] - p[a];
    const abz = p[b + 2] - p[a + 2];
    const acx = p[c] - p[a];
    const acz = p[c + 2] - p[a + 2];
    // Componente y de (b - a) × (c - a).
    if (abz * acx - abx * acz < 0) {
      const tmp = ind[t + 1];
      ind[t + 1] = ind[t + 2];
      ind[t + 2] = tmp;
    }
  }
}
