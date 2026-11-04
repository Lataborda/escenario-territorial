// Formas de la vegetación con realismo de maqueta: racimos de hojas con relieve, tallos, hojas largas y frutos.
// Normales suaves y color por vértice. Todas sin índice, para unirlas en una sola geometría por especie.
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { crearAzar } from '../util/azar.js';
import { suave } from '../util/interpolar.js';

const c = new THREE.Color();
const ARRIBA = new THREE.Vector3(0, 1, 0);

// Color por vértice a partir de una función (x, y, z, i) -> THREE.Color.
function pintar(g, colorDe) {
  const p = g.attributes.position;
  const colores = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    colorDe(p.getX(i), p.getY(i), p.getZ(i), i);
    colores.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(colores, 3));
  return g;
}

const limpiar = (g) => {
  for (const nombre of Object.keys(g.attributes)) if (nombre !== 'position') g.deleteAttribute(nombre);
  return g;
};

// Racimo de hojas: icosaedro de vértices compartidos con relieve aleatorio; más claro arriba y afuera.
export function racimo({ radio, detalle = 1, relieve = 0.22, escala = [1, 1, 1], en = [0, 0, 0], color, semilla = 1, luz = 1.15, sombra = 0.68 }) {
  const g = mergeVertices(limpiar(new THREE.IcosahedronGeometry(1, detalle)));
  const azar = crearAzar(semilla);
  const p = g.attributes.position;
  const alto = new Float32Array(p.count);
  for (let i = 0; i < p.count; i++) {
    const k = radio * (1 + relieve * (azar() * 2 - 1));
    alto[i] = p.getY(i);
    p.setXYZ(i, p.getX(i) * k * escala[0] + en[0], p.getY(i) * k * escala[1] + en[1], p.getZ(i) * k * escala[2] + en[2]);
  }
  g.computeVertexNormals();
  const tono = crearAzar(semilla + 7);
  pintar(g, (x, y, z, i) => c.setHex(color).multiplyScalar((sombra + (luz - sombra) * suave(-1, 1, alto[i])) * (0.94 + 0.12 * tono())));
  return g.toNonIndexed();
}

// Tallo o rama: cilindro de a hacia b, con la base más oscura.
export function tallo({ desde = [0, 0, 0], hacia, radio = [0.2, 0.14], caras = 6, color, segmentos = 1 }) {
  const a = new THREE.Vector3(...desde);
  const d = new THREE.Vector3(...hacia).sub(a);
  const largo = d.length();
  const g = limpiar(new THREE.CylinderGeometry(radio[1], radio[0], largo, caras, segmentos, true));
  g.translate(0, largo / 2, 0);
  pintar(g, (x, y) => c.setHex(color).multiplyScalar(0.72 + 0.35 * (y / largo)));
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(ARRIBA, d.normalize()));
  g.translate(a.x, a.y, a.z);
  g.computeVertexNormals();
  return g;
}

// Tallo curvo (guadua, caña): tramos que se inclinan hacia afuera con la altura. Cada tramo oscurece su base, lo
// que marca los nudos. Devuelve las partes y los puntos del eje (para colgar follaje).
export function arco({ desde = [0, 0, 0], alto, inclinacion = 0.3, rumbo = 0, tramos = 3, radio = [0.1, 0.06], caras = 5, color }) {
  const partes = [];
  const puntos = [desde];
  let [x, y, z] = desde;
  const paso = alto / tramos;
  const r = (k) => radio[0] + ((radio[1] - radio[0]) * k) / tramos;
  for (let k = 0; k < tramos; k++) {
    const a = inclinacion * ((k + 0.5) / tramos) ** 1.5;
    const siguiente = [x + Math.sin(a) * paso * Math.cos(rumbo), y + Math.cos(a) * paso, z + Math.sin(a) * paso * Math.sin(rumbo)];
    partes.push(tallo({ desde: [x, y, z], hacia: siguiente, radio: [r(k), r(k + 1)], caras, color }));
    [x, y, z] = siguiente;
    puntos.push(siguiente);
  }
  return { partes, puntos };
}

// Hoja larga (plátano, maíz): nervio en arco que se curva hacia abajo, lámina plegada en V y borde más claro
// o seco. Se extiende sobre +x y gira alrededor del eje vertical.
export function hoja({ largo, ancho, segmentos = 5, inclinacion = 0.9, caida = 1.4, pliegue = 0.35, giro = 0, altura = 0, color, seca = 0, nervio = 0xd9e2a0 }) {
  const pos = [];
  const colores = [];
  const ind = [];
  let x = 0;
  let y = 0;
  const seco = new THREE.Color(0xb59a5a);
  const tramo = largo / segmentos;
  for (let k = 0; k <= segmentos; k++) {
    const t = k / segmentos;
    const angulo = inclinacion - caida * t * t;
    const w = (ancho / 2) * Math.pow(Math.sin(Math.PI * Math.min(1, 0.08 + t * 0.95)), 0.6);
    for (const lado of [-1, 0, 1]) {
      pos.push(x, y - (lado ? pliegue * w : 0), lado * w);
      c.setHex(lado ? color : nervio).lerp(seco, lado ? seca * t * t : 0);
      colores.push(c.r * (0.8 + 0.25 * t), c.g * (0.8 + 0.25 * t), c.b * (0.8 + 0.25 * t));
    }
    if (k > 0) {
      const b = (k - 1) * 3;
      ind.push(b, b + 3, b + 1, b + 1, b + 3, b + 4, b + 1, b + 4, b + 2, b + 2, b + 4, b + 5);
    }
    x += tramo * Math.cos(angulo);
    y += tramo * Math.sin(angulo);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(colores, 3));
  g.setIndex(ind);
  g.rotateY(giro);
  g.translate(0, altura, 0);
  g.computeVertexNormals();
  return g.toNonIndexed();
}

// Fruto o semilla: octaedro de vértices compartidos (redondeado por las normales suaves).
export function fruto({ radio, en, color, alargado = 1 }) {
  const g = mergeVertices(limpiar(new THREE.OctahedronGeometry(radio, 0)));
  g.scale(1, alargado, 1);
  g.translate(...en);
  g.computeVertexNormals();
  pintar(g, (x, y) => c.setHex(color).multiplyScalar(y > en[1] ? 1.1 : 0.85));
  return g.toNonIndexed();
}

// Cono simple (bellota del plátano, espiga del maíz, mata lejana).
export function cono({ radio, alto, en = [0, 0, 0], caras = 5, color, abajo = false }) {
  const g = limpiar(new THREE.ConeGeometry(radio, alto, caras, 1, true));
  if (abajo) g.rotateX(Math.PI);
  g.translate(en[0], en[1] + (abajo ? -alto / 2 : alto / 2), en[2]);
  g.computeVertexNormals();
  pintar(g, (x, y) => c.setHex(color).multiplyScalar(0.8 + 0.3 * suave(en[1] - alto, en[1] + alto, y)));
  return g.toNonIndexed();
}

// Caja (cama de la huerta) con la cara superior más clara.
export function caja({ ancho, alto, fondo, base = 0, color, tapa }) {
  const g = limpiar(new THREE.BoxGeometry(ancho, alto, fondo));
  g.translate(0, base + alto / 2, 0);
  g.computeVertexNormals();
  pintar(g, (x, y) => c.setHex(y > base + alto - 1e-4 ? tapa ?? color : color));
  return g.toNonIndexed();
}

// Une las partes y oscurece el interior y la base de la copa (oclusión simulada).
export function unir(partes, { oclusion = 0, centro = [0, 0, 0], radio = 1, desde = 0, hasta = 1 } = {}) {
  const g = mergeGeometries(partes.map((p) => (p.index ? p.toNonIndexed() : p)));
  if (oclusion > 0) {
    const p = g.attributes.position;
    const col = g.attributes.color;
    for (let i = 0; i < p.count; i++) {
      const r = Math.hypot(p.getX(i) - centro[0], p.getZ(i) - centro[2]) / radio;
      const f = 1 - oclusion * (1 - suave(desde, hasta, p.getY(i))) * (1 - 0.5 * suave(0.3, 1, r));
      col.setXYZ(i, col.getX(i) * f, col.getY(i) * f, col.getZ(i) * f);
    }
  }
  return g;
}
