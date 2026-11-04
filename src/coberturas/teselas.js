// Teselas de cobertura: una sola malla apoyada sobre el relieve, con el color y la altura de cada unidad. La caña
// forma un bloque con la altura de la edad del lote, tapa irregular, hileras y caras de tallos (superficie.js); el
// resto de tipos, una lámina. Cada unidad ocupa un tramo contiguo de vértices.
import * as THREE from 'three';
import { LADO } from './unidades.js';
import { TIPOS, EDADES_CANA } from './tipos.js';
import { NINGUNA, LISTA_TIPOS } from './asignacion.js';
import { crearAzar, crearRuidos } from '../util/azar.js';
import { SEMILLA } from '../terreno/relieve.js';
import { crearMaterialSuperficie } from './superficie.js';

export const BASE = 0.35; // separación de la lámina sobre el terreno
export const RETIRO = 1.5; // retiro en el borde de cada unidad: deja ver linderos y caminos
const PIE = 0.8; // las paredes bajan bajo el terreno
// Altura de una unidad sin cobertura (queda bajo el terreno); en precisión simple para comparar con los arreglos.
const OCULTA = Math.fround(-(BASE + PIE + 1));

// Tapa irregular de la caña: factor de la altura del bloque en cada punto (ondas amplias y grumos).
const ruidos = crearRuidos(SEMILLA + 79, ['ondas', 'grumos']);
export const factorCana = (x, z) => 1 + 0.12 * ruidos.ondas(x / 26, z / 26) + 0.07 * ruidos.grumos(x / 7, z / 7);

const esCana = (indice) => indice !== NINGUNA && TIPOS[LISTA_TIPOS[indice]].familia === 'cana';
function alturaDe(u, indice) {
  if (indice === NINGUNA) return OCULTA;
  if (esCana(indice)) return EDADES_CANA.altura[u.edad ?? EDADES_CANA.altura.length - 1];
  return TIPOS[LISTA_TIPOS[indice]].altura ?? OCULTA;
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

// Tesela del plano: tapa de n × n tramos dentro del retiro y paredes de n tramos por lado, con la cara hacia afuera.
function construirPlano([x0, x1, z0, z1], n, lados, vertice, pared, salida) {
  const xs = (a) => x0 + ((x1 - x0) * a) / n;
  const zs = (b) => z0 + ((z1 - z0) * b) / n;
  const v = [];
  for (let b = 0; b <= n; b++) for (let a = 0; a <= n; a++) v.push(vertice(xs(a), zs(b), true));
  for (let b = 0; b < n; b++) {
    for (let a = 0; a < n; a++) {
      const p00 = v[b * (n + 1) + a];
      const p10 = v[b * (n + 1) + a + 1];
      const p01 = v[(b + 1) * (n + 1) + a];
      const p11 = v[(b + 1) * (n + 1) + a + 1];
      salida.ind.push(p00, p01, p11, p00, p11, p10);
    }
  }
  for (let k = 0; k < n; k++) {
    if (lados.oeste) pared(x0, zs(k), x0, zs(k + 1));
    if (lados.sur) pared(xs(k), z1, xs(k + 1), z1);
    if (lados.este) pared(x1, zs(n - k), x1, zs(n - k - 1));
    if (lados.norte) pared(xs(n - k), z0, xs(n - k - 1), z0);
  }
}

// Vértices de una unidad: lámina superior por tesela y paredes en el borde de la unidad. Las unidades con caña en
// algún escenario tienen la tapa subdividida y su altura sigue factorCana.
function construirUnidad(u, { centros, unidadDe }, altura, salida, conCana) {
  const { columnas, filas } = centros;
  const misma = (i, j) => i >= 0 && j >= 0 && i < columnas && j < filas && unidadDe[j * columnas + i] === u.indice;
  const rumbo = u.surco ?? 0;
  const marca = [Math.cos(rumbo), Math.sin(rumbo), u.edad ?? EDADES_CANA.ids.length - 1];
  const vertice = (x, z, arriba) => {
    const y = altura(x, z);
    salida.pos.push(x, y + (arriba ? BASE : -PIE), z);
    salida.base.push(arriba ? y + BASE : y - PIE);
    salida.arriba.push(arriba ? (conCana ? factorCana(x, z) : 1) : 0);
    salida.marca.push(marca[0], marca[1], marca[2], arriba ? 1 : 0);
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
    const lados = { oeste: !misma(i - 1, j), este: !misma(i + 1, j), norte: !misma(i, j - 1), sur: !misma(i, j + 1) };
    if (u.relieve) {
      construirRelieve(cx, cz, lados, vertice, pared, salida);
      continue;
    }
    const caja = [
      cx - LADO / 2 + (lados.oeste ? RETIRO : 0),
      cx + LADO / 2 - (lados.este ? RETIRO : 0),
      cz - LADO / 2 + (lados.norte ? RETIRO : 0),
      cz + LADO / 2 - (lados.sur ? RETIRO : 0),
    ];
    construirPlano(caja, conCana ? 2 : 1, lados, vertice, pared, salida);
  }
}

export function crearTeselas(datos, asignaciones, altura) {
  const { unidades } = datos;
  const escenarios = [...asignaciones.values()];
  // Unidades con tesela en algún escenario y, entre ellas, las que tienen caña en alguno.
  const lista = unidades.filter((u) => u.teselado && escenarios.some((a) => alturaDe(u, a[u.indice]) !== OCULTA));
  const conCana = new Set(lista.filter((u) => escenarios.some((a) => esCana(a[u.indice]))).map((u) => u.indice));
  const salida = { pos: [], base: [], arriba: [], marca: [], ind: [] };
  const tramos = new Map(); // indice de unidad -> [inicio, fin)
  for (const u of lista) {
    const inicio = salida.base.length;
    construirUnidad(u, datos, altura, salida, conCana.has(u.indice));
    tramos.set(u.indice, [inicio, salida.base.length]);
  }
  const n = salida.base.length;
  const posiciones = new Float32Array(salida.pos);
  const base = new Float32Array(salida.base);
  const arriba = new Float32Array(salida.arriba);
  const colores = new Float32Array(n * 3);
  const pesoCana = new Float32Array(n);
  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
  geometria.setAttribute('color', new THREE.BufferAttribute(colores, 3));
  geometria.setAttribute('marca', new THREE.BufferAttribute(new Float32Array(salida.marca), 4));
  geometria.setAttribute('cana', new THREE.BufferAttribute(pesoCana, 1));
  geometria.setAttribute('bajo', new THREE.BufferAttribute(base, 1)); // altura sin bloque, para hundir la tapa (superficie.js)
  geometria.setIndex(new THREE.BufferAttribute(n > 65535 ? new Uint32Array(salida.ind) : new Uint16Array(salida.ind), 1));
  geometria.computeVertexNormals();
  geometria.computeBoundingSphere();
  const malla = new THREE.Mesh(geometria, crearMaterialSuperficie());
  malla.name = 'teselas';
  malla.castShadow = true;
  malla.receiveShadow = true;

  // Variación de tono por unidad (parcelas en distinta etapa de cosecha).
  const azar = crearAzar(SEMILLA + 77);
  const tono = new Map(lista.map((u) => [u.indice, azar() * 2 - 1]));
  const c = new THREE.Color();
  const colorDe = (u, indice, destino, k) => {
    const tipo = TIPOS[LISTA_TIPOS[indice]];
    c.setHex(tipo.edades?.[unidades[u].edad] ?? tipo.color ?? 0xffffff).multiplyScalar(1 + (tipo.variacion ?? 0) * tono.get(u));
    destino[k * 3] = c.r;
    destino[k * 3 + 1] = c.g;
    destino[k * 3 + 2] = c.b;
  };

  // Estado por unidad: altura, color y peso de la caña actuales, de partida y de llegada.
  const indices = [...tramos.keys()];
  const m = indices.length;
  const crear = (k = 1) => new Float32Array(m * k);
  const estado = { h: crear().fill(OCULTA), c: crear(3), w: crear(), h0: crear(), c0: crear(3), w0: crear(), h1: crear(), c1: crear(3), w1: crear() };
  let cambian = [];

  function escribir(k) {
    const [inicio, fin] = tramos.get(indices[k]);
    const h = estado.h[k];
    for (let v = inicio; v < fin; v++) {
      posiciones[v * 3 + 1] = base[v] + arriba[v] * h;
      colores[v * 3] = estado.c[k * 3];
      colores[v * 3 + 1] = estado.c[k * 3 + 1];
      colores[v * 3 + 2] = estado.c[k * 3 + 2];
      pesoCana[v] = estado.w[k];
    }
  }

  // Todas las unidades empiezan ocultas bajo el terreno.
  for (let k = 0; k < m; k++) escribir(k);
  const marcarCambios = () => ['position', 'color', 'cana'].forEach((a) => (geometria.attributes[a].needsUpdate = true));

  return {
    malla,
    unidades: m,
    vertices: n,
    // Lectura del estado por unidad para la caña cercana (cana.js): k de cada unidad con caña en algún escenario.
    lectura: { indice: new Map(indices.map((u, k) => [u, k])), conCana: [...conCana], h: estado.h, w: estado.w, c: estado.c },
    // Radio alrededor de la cámara con matas de caña cercanas: dentro, la tapa baja y queda en sombra (superficie.js).
    cercania: (radio) => (malla.material.userData.cercaCana.value = radio),
    // Fija la llegada para una asignación y devuelve cuántas unidades cambian.
    preparar(asignacion) {
      estado.h0.set(estado.h);
      estado.c0.set(estado.c);
      estado.w0.set(estado.w);
      cambian = [];
      indices.forEach((u, k) => {
        const indice = asignacion[u];
        estado.h1[k] = alturaDe(unidades[u], indice);
        // Una unidad que se oculta conserva su color y su peso de caña; una que aparece toma los de llegada.
        if (indice === NINGUNA) {
          estado.c1.set(estado.c.subarray(k * 3, k * 3 + 3), k * 3);
          estado.w1[k] = estado.w[k];
        } else {
          colorDe(u, indice, estado.c1, k);
          estado.w1[k] = esCana(indice) ? 1 : 0;
        }
        if (estado.h0[k] === OCULTA) {
          estado.c0.set(estado.c1.subarray(k * 3, k * 3 + 3), k * 3);
          estado.w0[k] = estado.w1[k];
        }
        const igual =
          estado.h1[k] === estado.h[k] && estado.w1[k] === estado.w[k] && estado.c1.subarray(k * 3, k * 3 + 3).every((x, q) => x === estado.c[k * 3 + q]);
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
        // Al quedar oculta, el color y el peso vuelven a cero: el estado no depende del camino recorrido.
        const oculta = p >= 1 && estado.h1[k] === OCULTA;
        for (let q = 0; q < 3; q++) estado.c[k * 3 + q] = oculta ? 0 : mezcla(estado.c0[k * 3 + q], estado.c1[k * 3 + q]);
        estado.w[k] = oculta ? 0 : mezcla(estado.w0[k], estado.w1[k]);
        if (p > 0 && p < 1) intermedias += 1;
        escribir(k);
      }
      if (cambian.length) marcarCambios();
      return intermedias;
    },
    // Lotes de caña visibles por edad y alturas distintas del bloque (verificación).
    resumenCana() {
      const edades = Object.fromEntries(EDADES_CANA.ids.map((id) => [id, 0]));
      const alturas = new Set();
      indices.forEach((u, k) => {
        if (estado.w[k] < 0.5 || estado.h[k] === OCULTA) return;
        edades[EDADES_CANA.ids[unidades[u].edad]] += 1;
        alturas.add(Number(estado.h[k].toFixed(2)));
      });
      return { edades, alturas: [...alturas].sort((a, b) => a - b) };
    },
    arreglos: () => [posiciones, colores, pesoCana],
  };
}
