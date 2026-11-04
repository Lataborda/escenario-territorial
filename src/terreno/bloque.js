// Bloque recortado: caras laterales con estratos del suelo bajo el perfil del terreno.
import * as THREE from 'three';
import { MEDIDAS } from '../escena/maqueta.js';
import { aPlanoU } from './plano.js';
import { suave, mezclar } from '../util/interpolar.js';

// Colores de los estratos (de arriba hacia abajo).
const COLORES = {
  agua: 0x4a83b4,
  horizonte_a: 0x5a4432,
  horizonte_b: 0x946b45,
  horizonte_c: 0xc29a68,
  aluvion: 0xb9a582,
  roca_alterada: 0x9a8a78,
  gravas: 0xd2c19d,
  roca: 0x7b7068,
};
const TECHO_GRAVAS = -46;

// Espesores (unidades de escena) según la posición de occidente a oriente.
const espesorA = (u) => mezclar(9, 6, suave(0.45, 0.65, u)) + 4 * suave(0.9, 0.97, u);
const espesorB = (u) => mezclar(14, 10, suave(0.45, 0.65, u)) - 3 * suave(0.88, 0.97, u);
const espesorC = (u) => mezclar(18, 26, suave(0.45, 0.65, u));
const espesorGravas = (u) => 12 * suave(0.6, 0.45, u);

const c = (hex) => new THREE.Color(hex);

// Límites y colores de las bandas de una columna del corte.
function columna(x, z, superficie, agua) {
  const u = aPlanoU(x);
  const fondo = -MEDIDAS.espesor;
  const techo = Number.isNaN(agua) || agua <= superficie ? superficie : agua;
  const b2 = superficie - espesorA(u);
  const b3 = b2 - espesorB(u);
  const b4 = b3 - espesorC(u);
  const b5 = Math.min(b4, TECHO_GRAVAS);
  const b6 = Math.max(b5 - espesorGravas(u), fondo);
  const deposito = c(COLORES.aluvion).lerp(c(COLORES.roca_alterada), suave(0.45, 0.62, u));
  return {
    x,
    z,
    limites: [techo, superficie, b2, b3, b4, b5, b6, fondo],
    colores: [c(COLORES.agua), c(COLORES.horizonte_a), c(COLORES.horizonte_b), c(COLORES.horizonte_c), deposito, c(COLORES.gravas), c(COLORES.roca)],
  };
}

function agregarTriangulo(datos, p, normal, colores) {
  const ab = new THREE.Vector3().subVectors(p[1], p[0]);
  const ac = new THREE.Vector3().subVectors(p[2], p[0]);
  const orden = ab.cross(ac).dot(normal) < 0 ? [0, 2, 1] : [0, 1, 2];
  for (const k of orden) {
    datos.posiciones.push(p[k].x, p[k].y, p[k].z);
    datos.normales.push(normal.x, normal.y, normal.z);
    datos.colores.push(colores[k].r, colores[k].g, colores[k].b);
  }
}

function agregarCara(datos, columnas, normal) {
  for (let k = 0; k < columnas.length - 1; k++) {
    const a = columnas[k];
    const b = columnas[k + 1];
    for (let banda = 0; banda < a.colores.length; banda++) {
      const a0 = a.limites[banda];
      const a1 = a.limites[banda + 1];
      const b0 = b.limites[banda];
      const b1 = b.limites[banda + 1];
      if (a0 - a1 < 1e-3 && b0 - b1 < 1e-3) continue;
      const p = [
        new THREE.Vector3(a.x, a0, a.z),
        new THREE.Vector3(a.x, a1, a.z),
        new THREE.Vector3(b.x, b0, b.z),
        new THREE.Vector3(b.x, b1, b.z),
      ];
      const ca = a.colores[banda];
      const cb = b.colores[banda];
      agregarTriangulo(datos, [p[0], p[1], p[2]], normal, [ca, ca, cb]);
      agregarTriangulo(datos, [p[2], p[1], p[3]], normal, [cb, ca, cb]);
    }
  }
}

export function crearBloque(rejilla, alturasMundo, nivelesMundo) {
  const { columnas, filas } = rejilla;
  const col = (i, j) => columna(rejilla.x(i), rejilla.z(j), alturasMundo[j * columnas + i], nivelesMundo[j * columnas + i]);
  const caras = [
    { normal: new THREE.Vector3(0, 0, -1), puntos: Array.from({ length: columnas }, (_, i) => col(i, 0)) },
    { normal: new THREE.Vector3(0, 0, 1), puntos: Array.from({ length: columnas }, (_, i) => col(i, filas - 1)) },
    { normal: new THREE.Vector3(-1, 0, 0), puntos: Array.from({ length: filas }, (_, j) => col(0, j)) },
    { normal: new THREE.Vector3(1, 0, 0), puntos: Array.from({ length: filas }, (_, j) => col(columnas - 1, j)) },
  ];
  const datos = { posiciones: [], normales: [], colores: [] };
  for (const cara of caras) agregarCara(datos, cara.puntos, cara.normal);

  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute('position', new THREE.Float32BufferAttribute(datos.posiciones, 3));
  geometria.setAttribute('normal', new THREE.Float32BufferAttribute(datos.normales, 3));
  geometria.setAttribute('color', new THREE.Float32BufferAttribute(datos.colores, 3));
  const malla = new THREE.Mesh(geometria, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
  malla.name = 'bloque';
  malla.castShadow = true;
  malla.receiveShadow = true;
  return malla;
}
