// Caña cercana: matas instanciadas (mata.js) en las celdas de caña próximas a la cámara y dentro del encuadre.
// Dosel: hileras sobre los surcos de cada lote (superficie.js), con la base en la tapa hundida. Borde: matas frente
// a la cara de cada lote, desde el suelo. Las matas de una celda se generan al acercarse, con semilla por celda, y se
// guardan. Las celdas más cercanas llevan el nivel detallado; un cupo fijo por nivel limita las instancias, primero
// las celdas más cercanas. El radio cubierto (todas las celdas a menor distancia tienen matas) se informa a las teselas, que
// hunden y oscurecen la tapa dentro de él. Las matas siguen la altura, el peso de caña y el color actuales de su lote
// (lectura de teselas.js). El lote recién cortado no lleva matas. El modo liviano las retira.
import * as THREE from 'three';
import { crearAzar } from '../util/azar.js';
import { SEMILLA } from '../terreno/relieve.js';
import { BORDE } from '../terreno/plano.js';
import { CELDA, celdaDe } from './detalle.js';
import { LADO } from './rejilla.js';
import { BASE, RETIRO, factorCana } from './teselas.js';
import { PERIODO_SURCO, HUNDIR } from './superficie.js';
import { EDADES_CANA } from './tipos.js';
import { matasCana, ALTO } from './mata.js';

export const UMBRAL_CANA = 460; // distancia de la cámara a la celda (unidades de escena)
const UMBRAL_DETALLE = 130; // celdas con la forma detallada
const CUPO = { cerca: 4500, lejos: 26000 };
const EN_HILERA = 1.7; // separación de las matas de dosel dentro de cada línea del surco doble
const DOBLE = 0.6; // media separación entre las dos líneas de cada surco
const CRUCE = 0.3; // desvío máximo de las matas de dosel a través de la línea
const PASO_BORDE = 1.5; // separación de las matas del borde
const AFUERA = -0.25; // las matas del borde quedan junto a la cara del lote, por dentro
const MINIMA = 0.6; // altura mínima del bloque para dibujar matas (el lote recién cortado no lleva)
const MADURA = EDADES_CANA.altura[EDADES_CANA.altura.length - 1];
const SOBRE = 0.06; // las hojas del dosel pasan un poco por encima de la altura del bloque
const MEMORIA = 160; // celdas generadas que se conservan
// Campos de cada mata: x, z, suelo, giro, escala, k (unidad en la lectura), borde (0 o 1), azar, factor de la tapa.
const CAMPOS = 9;

// Tinte por instancia solo en las hojas: los vértices con «propio» = 1 (tallos) conservan su color y llevan nudos:
// un anillo oscuro con un borde claro encima, cada NUDO de altura de la forma; se atenúan cuando ocupan poco en pantalla.
const NUDO = 0.3;
function crearMaterial(opciones) {
  const material = new THREE.MeshStandardMaterial(opciones);
  material.onBeforeCompile = (s) => {
    s.vertexShader = s.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float propio;\nvarying float vPropio;\nvarying float vNudo;')
      .replace('#include <color_vertex>', `#include <color_vertex>
#ifdef USE_INSTANCING_COLOR
vColor.xyz = mix(vColor.xyz, color.xyz, propio);
#endif
vPropio = propio;
vNudo = position.y / ${NUDO.toFixed(3)};`);
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vPropio;\nvarying float vNudo;')
      .replace('#include <color_fragment>', `#include <color_fragment>
if (vPropio > 0.5) {
  float n = fract(vNudo + 0.37);
  float k = 1.0 - smoothstep(0.15, 0.4, fwidth(vNudo));
  diffuseColor.rgb *= 1.0 + k * (0.18 * smoothstep(0.0, 0.05, n) * (1.0 - smoothstep(0.08, 0.16, n)) - 0.42 * smoothstep(0.86, 0.95, n));
}`);
  };
  material.customProgramCacheKey = () => 'mata-cana';
  return material;
}

export function crearCanaCerca({ centros, unidadDe, unidades }, lectura, altura, alRadio = () => {}) {
  const { columnas, filas } = centros;
  // Teselas de caña por celda y caja de cada celda (para la distancia y el encuadre).
  const porCelda = new Map();
  for (const u of lectura.conCana) {
    for (const t of unidades[u].teselas) {
      const celda = celdaDe(centros.x(t % columnas), centros.z(Math.floor(t / columnas)));
      if (!porCelda.has(celda)) porCelda.set(celda, []);
      porCelda.get(celda).push(t);
    }
  }
  const cajas = new Map();
  const columnasCelda = Math.ceil((2 * BORDE.x) / CELDA);
  for (const [celda, teselas] of porCelda) {
    const alturas = teselas.map((t) => altura(centros.x(t % columnas), centros.z(Math.floor(t / columnas))));
    const x0 = -BORDE.x + (celda % columnasCelda) * CELDA;
    const z0 = -BORDE.z + Math.floor(celda / columnasCelda) * CELDA;
    cajas.set(celda, new THREE.Box3(new THREE.Vector3(x0, Math.min(...alturas) - 2, z0), new THREE.Vector3(x0 + CELDA, Math.max(...alturas) + 5, z0 + CELDA)));
  }

  // Matas de una tesela: hileras de dosel con el rumbo del lote y matas de borde en los lados que dan a otra unidad.
  function matasDe(t, azar, salida) {
    const i = t % columnas;
    const j = Math.floor(t / columnas);
    const ui = unidadDe[t];
    const u = unidades[ui];
    const k = lectura.indice.get(ui);
    const misma = (a, b) => a >= 0 && b >= 0 && a < columnas && b < filas && unidadDe[b * columnas + a] === ui;
    const lados = { oeste: !misma(i - 1, j), este: !misma(i + 1, j), norte: !misma(i, j - 1), sur: !misma(i, j + 1) };
    const cx = centros.x(i);
    const cz = centros.z(j);
    const x0 = cx - LADO / 2 + (lados.oeste ? RETIRO : 0);
    const x1 = cx + LADO / 2 - (lados.este ? RETIRO : 0);
    const z0 = cz - LADO / 2 + (lados.norte ? RETIRO : 0);
    const z1 = cz + LADO / 2 - (lados.sur ? RETIRO : 0);
    const poner = (x, z, borde) =>
      salida.push(x, z, altura(x, z) + BASE, azar() * Math.PI * 2, 0.85 + 0.3 * azar(), k, borde, azar(), factorCana(x, z));
    // Dosel: surco doble en cada cresta (s = m + 0,5 periodos, dos líneas a ±DOBLE) y matas cada EN_HILERA a lo
    // largo de cada línea, alternadas entre las dos líneas.
    const d = [Math.cos(u.surco ?? 0), Math.sin(u.surco ?? 0)];
    const p = [-d[1], d[0]];
    const esquinas = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]];
    const sv = esquinas.map(([x, z]) => (x * p[0] + z * p[1]) / PERIODO_SURCO);
    const tv = esquinas.map(([x, z]) => (x * d[0] + z * d[1]) / EN_HILERA);
    for (let m = Math.ceil(Math.min(...sv) - 0.5); m + 0.5 <= Math.max(...sv); m++) {
      for (let n = Math.ceil(Math.min(...tv)) - 1; n <= Math.max(...tv); n++) {
        for (const lado of [-1, 1]) {
          const a = (n + (lado > 0 ? 0.5 : 0) + (azar() - 0.5) * 0.5) * EN_HILERA;
          const s = (m + 0.5) * PERIODO_SURCO + lado * DOBLE + (azar() - 0.5) * CRUCE;
          const x = d[0] * a + p[0] * s;
          const z = d[1] * a + p[1] * s;
          if (x >= x0 && x <= x1 && z >= z0 && z <= z1) poner(x, z, 0);
        }
      }
    }
    // Borde: matas frente a cada cara exterior del bloque.
    const linea = (xa, za, xb, zb, nx, nz) => {
      const largo = Math.hypot(xb - xa, zb - za);
      for (let r = PASO_BORDE * (0.3 + 0.4 * azar()); r < largo; r += PASO_BORDE * (0.8 + 0.4 * azar())) {
        poner(xa + ((xb - xa) * r) / largo + nx * AFUERA, za + ((zb - za) * r) / largo + nz * AFUERA, 1);
      }
    };
    if (lados.oeste) linea(x0, z0, x0, z1, -1, 0);
    if (lados.este) linea(x1, z0, x1, z1, 1, 0);
    if (lados.norte) linea(x0, z0, x1, z0, 0, -1);
    if (lados.sur) linea(x0, z1, x1, z1, 0, 1);
  }

  const memoria = new Map();
  function celdaGenerada(celda) {
    if (memoria.has(celda)) return memoria.get(celda);
    const azar = crearAzar((SEMILLA + 401 + celda * 7919) >>> 0);
    const salida = [];
    for (const t of porCelda.get(celda)) matasDe(t, azar, salida);
    const datos = new Float32Array(salida);
    memoria.set(celda, datos);
    if (memoria.size > MEMORIA) memoria.delete(memoria.keys().next().value);
    return datos;
  }

  // Mallas instanciadas por nivel, con color por instancia (el del lote).
  const formas = matasCana();
  const material = crearMaterial(formas.material);
  const mallas = {};
  for (const id of Object.keys(CUPO)) {
    const malla = new THREE.InstancedMesh(formas[id], material, CUPO[id]);
    malla.name = `cana-cerca-${id}`;
    malla.receiveShadow = true;
    malla.frustumCulled = false;
    malla.setColorAt(0, new THREE.Color());
    malla.count = 0;
    mallas[id] = malla;
  }

  let orden = []; // [distancia, celda], de la más cercana a la más lejana
  let activo = true;
  let radio = 0;
  let corte = -1; // lugar en el orden de la primera celda incompleta (−1 si todas tienen matas)
  const cuenta = { cerca: 0, lejos: 0 };
  const tipo = { dosel: 0, borde: 0 };
  const matriz = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const eje = new THREE.Vector3(0, 1, 0);
  const pos = new THREE.Vector3();
  const esc = new THREE.Vector3();
  const tinte = new THREE.Color();

  function poner(id, x, y, z, giro, sx, sy, brillo, k) {
    const lugar = cuenta[id]++;
    mallas[id].setMatrixAt(lugar, matriz.compose(pos.set(x, y, z), q.setFromAxisAngle(eje, giro), esc.set(sx, sy, sx)));
    tinte.setRGB(lectura.c[k * 3] * brillo, lectura.c[k * 3 + 1] * brillo, lectura.c[k * 3 + 2] * brillo);
    mallas[id].setColorAt(lugar, tinte);
  }


  // Escribe las matas de las celdas en orden hasta llenar un cupo; el radio cubierto llega a la primera celda incompleta.
  function llenar() {
    cuenta.cerca = cuenta.lejos = tipo.dosel = tipo.borde = 0;
    radio = activo && orden.length ? UMBRAL_CANA : 0;
    corte = -1;
    recorrido: for (const [lugar, [distancia, celda]] of (activo ? orden : []).entries()) {
      const cerca = distancia < UMBRAL_DETALLE;
      const m = celdaGenerada(celda);
      for (let i = 0; i < m.length; i += CAMPOS) {
        const k = m[i + 5];
        const w = lectura.w[k];
        const h = lectura.h[k];
        if (w < 0.02 || h < MINIMA) continue;
        const [x, z, suelo, giro, escala] = [m[i], m[i + 1], m[i + 2], m[i + 3], m[i + 4]];
        const brillo = 1 + 0.18 * m[i + 7];
        const alto = h * m[i + 8];
        // Nivel detallado en las celdas cercanas mientras quede cupo; si no, el lejano.
        const id = cerca && cuenta.cerca < CUPO.cerca ? 'cerca' : 'lejos';
        if (cuenta[id] >= CUPO[id]) {
          radio = distancia;
          corte = lugar;
          break recorrido;
        }
        const ancho = escala * (0.6 + 0.4 * (h / MADURA)) * w;
        const borde = m[i + 6] === 1;
        tipo[borde ? 'borde' : 'dosel'] += 1;
        // El borde arranca en el suelo; el dosel, en la tapa hundida, y sus hojas pasan un poco sobre el bloque.
        if (borde) poner(id, x, suelo, z, giro, ancho, (alto / ALTO) * w, brillo, k);
        else poner(id, x, suelo + alto * (1 - HUNDIR), z, giro, ancho, ((alto * (HUNDIR + SOBRE)) / ALTO) * w, brillo, k);
      }
    }
    // El resto de los arreglos queda en cero: el estado no depende del camino de la cámara.
    for (const [id, malla] of Object.entries(mallas)) {
      malla.count = cuenta[id];
      malla.instanceMatrix.array.fill(0, cuenta[id] * 16);
      malla.instanceColor.array.fill(0, cuenta[id] * 3);
      malla.instanceMatrix.needsUpdate = true;
      malla.instanceColor.needsUpdate = true;
    }
    alRadio(radio);
  }

  // Celdas de caña a menos del umbral y dentro del encuadre, de la más cercana a la más lejana.
  const encuadre = new THREE.Frustum();
  const proyeccion = new THREE.Matrix4();
  function medir(camara) {
    encuadre.setFromProjectionMatrix(proyeccion.multiplyMatrices(camara.projectionMatrix, camara.matrixWorldInverse));
    const lista = [];
    for (const [celda, caja] of cajas) {
      const d = caja.distanceToPoint(camara.position);
      if (d < UMBRAL_CANA && encuadre.intersectsBox(caja)) lista.push([d, celda]);
    }
    lista.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const igual = lista.length === orden.length && lista.every((c, i) => c[1] === orden[i][1] && (c[0] < UMBRAL_DETALLE) === (orden[i][0] < UMBRAL_DETALLE));
    orden = lista;
    if (!igual) {
      llenar();
      return true;
    }
    // Mismas celdas: solo cambia la distancia de la celda del corte.
    if (corte >= 0 && activo) {
      radio = orden[corte][0];
      alRadio(radio);
    }
    return false;
  }

  return {
    mallas: Object.values(mallas),
    medir,
    // Durante una transición, las matas siguen el estado de sus lotes.
    avanzar: () => orden.length && activo && llenar(),
    liviano(liviano) {
      activo = !liviano;
      llenar();
    },
    datos: () => ({ celdas: activo ? orden.length : 0, ...cuenta, ...tipo, generadas: memoria.size, radio: Math.round(radio) }),
    arreglos: () => Object.values(mallas).flatMap((m) => [m.instanceMatrix.array, m.instanceColor.array]),
  };
}
