// Geometrías de la vegetación, de bajo número de caras y con la base en y = 0. Escala 1: árbol de unas 3,3 unidades.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { VEGETACION } from './tipos.js';

const sinIndice = (g) => (g.index ? g.toNonIndexed() : g);

function pintar(geometria, hex) {
  const c = new THREE.Color(hex);
  const n = geometria.attributes.position.count;
  const colores = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) colores.set([c.r, c.g, c.b], i * 3);
  geometria.setAttribute('color', new THREE.BufferAttribute(colores, 3));
  return geometria;
}

// Copa facetada; el tronco va en otra malla con las mismas matrices.
export function crearCopa() {
  const g = new THREE.IcosahedronGeometry(1, 0);
  g.translate(0, 2.3, 0);
  return g;
}

export function crearTronco() {
  const g = new THREE.CylinderGeometry(0.13, 0.19, 1.6, 5, 1, true);
  g.translate(0, 0.8, 0);
  return g;
}

// Macolla de tallos inclinados hacia afuera (guadua y juncos).
function crearMacolla({ tallos, radio, alto, inclinacion, caras }) {
  const partes = [];
  for (let k = 0; k < tallos; k++) {
    const g = new THREE.ConeGeometry(radio, alto * (0.75 + 0.25 * ((k * 7) % 5) / 4), caras, 1, true);
    g.translate(0, (alto * (0.75 + 0.25 * ((k * 7) % 5) / 4)) / 2, 0);
    g.rotateZ(inclinacion * (0.6 + 0.4 * ((k * 3) % 4) / 3));
    g.rotateY((k / tallos) * Math.PI * 2 + 0.4);
    partes.push(sinIndice(g));
  }
  return mergeGeometries(partes);
}

export const crearGuadua = () => crearMacolla({ tallos: 7, radio: 0.3, alto: 8.5, inclinacion: 0.32, caras: 4 });
export const crearJunco = () => crearMacolla({ tallos: 5, radio: 0.14, alto: 1.8, inclinacion: 0.35, caras: 3 });

// Frailejón: tallo y roseta con color por vértice.
export function crearFrailejon() {
  const tallo = sinIndice(new THREE.CylinderGeometry(0.2, 0.26, 2.2, 5, 1, true));
  tallo.translate(0, 1.1, 0);
  const roseta = new THREE.IcosahedronGeometry(0.8, 0);
  roseta.scale(1, 0.75, 1);
  roseta.translate(0, 2.55, 0);
  return mergeGeometries([pintar(tallo, VEGETACION.frailejonTallo), pintar(sinIndice(roseta), VEGETACION.frailejonHoja)]);
}
