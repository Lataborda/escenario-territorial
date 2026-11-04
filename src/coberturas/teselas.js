// Teselas de cobertura: una sola malla apoyada sobre el relieve, con el color y la altura de cada unidad.
// La caña forma un bloque; el resto de tipos, una lámina. Cada unidad ocupa un tramo contiguo de vértices.
import * as THREE from 'three';
import { LADO } from './unidades.js';
import { TIPOS } from './tipos.js';
import { NINGUNA, LISTA_TIPOS } from './asignacion.js';
import { crearAzar } from '../util/azar.js';
import { SEMILLA } from '../terreno/relieve.js';

export const BASE = 0.35; // separación de la lámina sobre el terreno
const RETIRO = 1.5; // retiro en el borde de cada unidad: deja ver linderos y caminos
const PIE = 0.8; // las paredes bajan bajo el terreno
// Altura de una unidad sin cobertura (queda bajo el terreno); en precisión simple para comparar con los arreglos.
const OCULTA = Math.fround(-(BASE + PIE + 1));

const alturaDe = (indice) => (indice === NINGUNA ? OCULTA : TIPOS[LISTA_TIPOS[indice]].altura ?? OCULTA);

// Unidades con tesela en algún escenario.
function dibujables(unidades, asignaciones) {
  return unidades.filter((u) => u.teselado && [...asignaciones.values()].some((a) => alturaDe(a[u.indice]) !== OCULTA));
}

// Tesela de ladera: 3 × 3 vértices sobre los de la rejilla del terreno (paso 3) y la misma diagonal que su malla,
// sin retiro: la lámina queda paralela al relieve a la distancia BASE. Paredes en dos tramos por lado.
function construirRelieve(cx, cz, lados, vertice, pared, salida) {
  const m = LADO / 2;
  const v = [];
  for (let b = 0; b < 3; b++) for (let a = 0; a < 3; a++) v.push(vertice(cx + (a - 1) * m, cz + (b - 1) * m, true));
  for (let b = 0; b < 2; b++) {
    for (let a = 0; a < 2; a++) {
      const p00 = v[b * 3 + a];
      const p10 = v[b * 3 + a + 1];
      const p01 = v[(b + 1) * 3 + a];
      const p11 = v[(b + 1) * 3 + a + 1];
      salida.ind.push(p00, p01, p10, p10, p01, p11);
    }
  }
  const [x0, x1, z0, z1] = [cx - m, cx + m, cz - m, cz + m];
  if (lados.oeste) pared(x0, z0, x0, cz), pared(x0, cz, x0, z1);
  if (lados.sur) pared(x0, z1, cx, z1), pared(cx, z1, x1, z1);
  if (lados.este) pared(x1, z1, x1, cz), pared(x1, cz, x1, z0);
  if (lados.norte) pared(x1, z0, cx, z0), pared(cx, z0, x0, z0);
}

// Vértices de una unidad: lámina superior por tesela y paredes en el borde de la unidad.
function construirUnidad(u, { centros, unidadDe }, altura, salida) {
  const { columnas, filas } = centros;
  const misma = (i, j) => i >= 0 && j >= 0 && i < columnas && j < filas && unidadDe[j * columnas + i] === u.indice;
  const vertice = (x, z, arriba) => {
    const y = altura(x, z);
    salida.pos.push(x, y + (arriba ? BASE : -PIE), z);
    salida.base.push(arriba ? y + BASE : y - PIE);
    salida.arriba.push(arriba ? 1 : 0);
    return salida.base.length - 1;
  };
  const pared = (x1, z1, x2, z2) => {
    const a = vertice(x1, z1, true);
    const b = vertice(x2, z2, true);
    const c = vertice(x1, z1, false);
    const d = vertice(x2, z2, false);
    salida.ind.push(a, c, b, b, c, d);
  };
  for (const t of u.teselas) {
    const i = t % columnas;
    const j = Math.floor(t / columnas);
    const cx = centros.x(i);
    const cz = centros.z(j);
    const oeste = !misma(i - 1, j);
    const este = !misma(i + 1, j);
    const norte = !misma(i, j - 1);
    const sur = !misma(i, j + 1);
    if (u.relieve) {
      construirRelieve(cx, cz, { oeste, este, norte, sur }, vertice, pared, salida);
      continue;
    }
    const x0 = cx - LADO / 2 + (oeste ? RETIRO : 0);
    const x1 = cx + LADO / 2 - (este ? RETIRO : 0);
    const z0 = cz - LADO / 2 + (norte ? RETIRO : 0);
    const z1 = cz + LADO / 2 - (sur ? RETIRO : 0);
    const a = vertice(x0, z0, true);
    const b = vertice(x0, z1, true);
    const c = vertice(x1, z1, true);
    const d = vertice(x1, z0, true);
    salida.ind.push(a, b, c, a, c, d);
    // Paredes con la cara hacia afuera.
    if (oeste) pared(x0, z0, x0, z1);
    if (sur) pared(x0, z1, x1, z1);
    if (este) pared(x1, z1, x1, z0);
    if (norte) pared(x1, z0, x0, z0);
  }
}

export function crearTeselas(datos, asignaciones, altura) {
  const lista = dibujables(datos.unidades, asignaciones);
  const salida = { pos: [], base: [], arriba: [], ind: [] };
  const tramos = new Map(); // indice de unidad -> [inicio, fin)
  for (const u of lista) {
    const inicio = salida.base.length;
    construirUnidad(u, datos, altura, salida);
    tramos.set(u.indice, [inicio, salida.base.length]);
  }
  const n = salida.base.length;
  const posiciones = new Float32Array(salida.pos);
  const base = new Float32Array(salida.base);
  const arriba = new Uint8Array(salida.arriba);
  const colores = new Float32Array(n * 3);
  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
  geometria.setAttribute('color', new THREE.BufferAttribute(colores, 3));
  geometria.setIndex(new THREE.BufferAttribute(n > 65535 ? new Uint32Array(salida.ind) : new Uint16Array(salida.ind), 1));
  geometria.computeVertexNormals();
  geometria.computeBoundingSphere();
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 });
  const malla = new THREE.Mesh(geometria, material);
  malla.name = 'teselas';
  malla.castShadow = true;
  malla.receiveShadow = true;

  // Variación de tono por unidad (parcelas en distinta etapa de cosecha).
  const azar = crearAzar(SEMILLA + 77);
  const tono = new Map(lista.map((u) => [u.indice, azar() * 2 - 1]));
  const c = new THREE.Color();
  const colorDe = (u, indice, destino, k) => {
    const tipo = TIPOS[LISTA_TIPOS[indice]];
    c.setHex(tipo.color ?? 0xffffff).multiplyScalar(1 + (tipo.variacion ?? 0) * tono.get(u));
    destino[k * 3] = c.r;
    destino[k * 3 + 1] = c.g;
    destino[k * 3 + 2] = c.b;
  };

  // Estado por unidad: altura y color actuales, de partida y de llegada.
  const indices = [...tramos.keys()];
  const m = indices.length;
  const estado = {
    h: new Float32Array(m).fill(OCULTA),
    c: new Float32Array(m * 3),
    h0: new Float32Array(m),
    c0: new Float32Array(m * 3),
    h1: new Float32Array(m),
    c1: new Float32Array(m * 3),
  };
  let cambian = [];

  function escribir(k) {
    const [inicio, fin] = tramos.get(indices[k]);
    const h = estado.h[k];
    for (let v = inicio; v < fin; v++) {
      posiciones[v * 3 + 1] = base[v] + (arriba[v] ? h : 0);
      colores[v * 3] = estado.c[k * 3];
      colores[v * 3 + 1] = estado.c[k * 3 + 1];
      colores[v * 3 + 2] = estado.c[k * 3 + 2];
    }
  }

  // Todas las unidades empiezan ocultas bajo el terreno.
  for (let k = 0; k < m; k++) escribir(k);

  return {
    malla,
    unidades: m,
    vertices: n,
    // Fija la llegada para una asignación y devuelve cuántas unidades cambian.
    preparar(asignacion) {
      estado.h0.set(estado.h);
      estado.c0.set(estado.c);
      cambian = [];
      indices.forEach((u, k) => {
        const indice = asignacion[u];
        estado.h1[k] = alturaDe(indice);
        // Una unidad que se oculta conserva su color; una que aparece toma el de llegada desde el inicio.
        if (indice === NINGUNA) estado.c1.set(estado.c.subarray(k * 3, k * 3 + 3), k * 3);
        else colorDe(u, indice, estado.c1, k);
        if (estado.h0[k] === OCULTA) estado.c0.set(estado.c1.subarray(k * 3, k * 3 + 3), k * 3);
        const igual = estado.h1[k] === estado.h[k] && estado.c1.subarray(k * 3, k * 3 + 3).every((x, q) => x === estado.c[k * 3 + q]);
        if (!igual) cambian.push(k);
      });
      return cambian.length;
    },
    // Avanza la transición; progreso(t, retardo) da la fracción de cada unidad.
    avanzar(t, progreso, retardos) {
      let intermedias = 0;
      for (const k of cambian) {
        const p = progreso(t, retardos.get(indices[k]));
        const mezcla = (a, b) => (p >= 1 ? b : a + (b - a) * p);
        estado.h[k] = mezcla(estado.h0[k], estado.h1[k]);
        // Al quedar oculta, el color vuelve a cero: el estado no depende del camino recorrido.
        const oculta = p >= 1 && estado.h1[k] === OCULTA;
        for (let q = 0; q < 3; q++) estado.c[k * 3 + q] = oculta ? 0 : mezcla(estado.c0[k * 3 + q], estado.c1[k * 3 + q]);
        if (p > 0 && p < 1) intermedias += 1;
        escribir(k);
      }
      if (cambian.length) {
        geometria.attributes.position.needsUpdate = true;
        geometria.attributes.color.needsUpdate = true;
      }
      return intermedias;
    },
    arreglos: () => [posiciones, colores],
  };
}
