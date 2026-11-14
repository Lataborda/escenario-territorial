// Mata de caña del nivel cercano (cana.js), según la referencia `referencias/cana-mata.webp`: tallos rectos y algo
// inclinados con nudos marcados, hojas largas en arco desde el tercio superior con las puntas caídas y hojas secas
// en la base; sin espiga ni flor. Dos niveles: «cerca» (siete tallos de cuatro caras, 236 triángulos) y «lejos» (tres
// tallos planos, 30 triángulos); las hojas son cintas (etapa 7.d: antes, 430 y 66). Las hojas van en color
// claro y toman el color del lote (color por instancia); los tallos conservan el suyo (atributo «propio» = 1) y el
// sombreador de cana.js les dibuja los nudos. Base en y = 0; alto aproximado ALTO en escala 1.
import * as THREE from 'three';
import { VEGETACION as V } from './tipos.js';
import { hoja, arco, unir } from './formas.js';
import { crearAzar } from '../util/azar.js';

export const ALTO = 2.7;
const HOJAS = [0xf2f6e2, 0xe6eed6, 0xf6f3da, 0xeaf1dc];

const marcar = (g, propio) => {
  g.setAttribute('propio', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count).fill(propio), 1));
  return g;
};

// Hoja en arco: sube desde el tallo, se curva y deja caer la punta (ángulo final «punta»). La caída se calcula para
// el último tramo, que en hoja() usa el ángulo en t = (n − 1) / n. Rumbo: dirección horizontal de la hoja.
function hojaCana(azar, { largo, altura, rumbo, en, segmentos, recta = false }) {
  const inclinacion = recta ? 1.3 + 0.15 * azar() : 0.75 + 0.45 * azar();
  const punta = recta ? 0.6 : -0.45 - 0.6 * azar();
  const t = (segmentos - 1) / segmentos;
  const g = hoja({
    largo,
    ancho: 0.108 * largo + 0.048, // un quinto más ancha que la hoja plegada: la cinta conserva la masa del follaje
    segmentos,
    inclinacion,
    caida: (inclinacion - punta) / (t * t),
    pliegue: 0.25,
    giro: -rumbo,
    altura,
    color: HOJAS[Math.floor(azar() * HOJAS.length)],
    seca: 0.25 + 0.2 * azar(),
    nervio: 0xfafbee,
    cinta: true,
  });
  g.translate(en[0], 0, en[2]);
  return marcar(g, 0);
}

// Listón: tallo plano de a hacia b, de ancho 2 × radio y perpendicular al rumbo; base más oscura, como tallo().
const c = new THREE.Color();
function liston(a, b, radio, rumbo, color) {
  const [dx, dz] = [-Math.sin(rumbo) * radio, Math.cos(rumbo) * radio];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([a[0] - dx, a[1], a[2] - dz, a[0] + dx, a[1], a[2] + dz, b[0] - dx, b[1], b[2] - dz, b[0] + dx, b[1], b[2] + dz], 3));
  const [oscuro, claro] = [c.setHex(color).multiplyScalar(0.72).toArray(), c.setHex(color).multiplyScalar(1.07).toArray()];
  g.setAttribute('color', new THREE.Float32BufferAttribute([...oscuro, ...oscuro, ...claro, ...claro], 3));
  g.setIndex([0, 1, 2, 2, 1, 3]);
  g.computeVertexNormals();
  return g.toNonIndexed();
}

// Mata: tallos de color propio, de verde amarillento a morado; hojas desde el tercio superior de cada tallo y, en el
// nivel cercano, hojas secas en la base.
function mata(cerca) {
  const azar = crearAzar(cerca ? 221 : 222);
  const partes = [];
  const n = cerca ? 7 : 3;
  for (let k = 0; k < n; k++) {
    const rumbo = (k / n) * Math.PI * 2 + azar() * 0.6;
    const r = 0.06 + 0.2 * azar();
    const color = V.canaTallos[Math.floor(azar() * V.canaTallos.length)];
    const desde = [Math.cos(rumbo) * r, -0.1, Math.sin(rumbo) * r];
    const tallo = arco({ desde, alto: 1.5 + 0.45 * azar(), inclinacion: 0.15 + 0.3 * azar(), rumbo, tramos: 1, radio: [0.05, 0.042], caras: 4, color });
    const tope = tallo.puntos.at(-1);
    // De lejos el tallo es un listón plano, de cara al rumbo de la mata.
    partes.push(...(cerca ? tallo.partes : [liston(desde, tope, 0.05, rumbo, color)]).map((p) => marcar(p, 1)));
    const hojas = cerca ? 4 : 2;
    for (let h = 0; h < hojas; h++) {
      const recta = cerca && h === 0;
      const largo = recta ? 0.8 + 0.25 * azar() : 1.3 + 0.5 * azar();
      const rumboHoja = rumbo + (h - 1.5) * 1.6 + (azar() - 0.5) * 1.2;
      partes.push(hojaCana(azar, { largo, altura: tope[1] - 0.2 * h * (cerca ? 1 : 1.5), rumbo: rumboHoja, en: tope, segmentos: cerca ? 3 : 2, recta }));
    }
  }
  if (cerca) {
    for (let k = 0; k < 3; k++) {
      const g = hoja({ largo: 0.6 + 0.25 * azar(), ancho: 0.09, segmentos: 2, inclinacion: 0.45, caida: 3.2, pliegue: 0.2, giro: k * 2.1 + azar(), altura: 0.12, color: V.canaSeca, seca: 0.6, nervio: V.canaSeca, cinta: true });
      partes.push(marcar(g, 0));
    }
  }
  return unir(partes, { oclusion: 0.42, radio: 1.2, desde: 0.3, hasta: 2.3 });
}

export function matasCana() {
  return { cerca: mata(true), lejos: mata(false), material: { vertexColors: true, roughness: 0.85, side: THREE.DoubleSide } };
}
