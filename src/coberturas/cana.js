// Caña cercana: matas instanciadas en las celdas de caña próximas a la cámara y dentro del encuadre. Hileras sobre
// los surcos de cada lote (superficie.js) con hojas sobre el dosel del bloque, y tallos con hojas frente a la cara
// del borde de cada lote. Las matas de una celda se generan al acercarse, con semilla por celda, y se guardan. Un
// cupo fijo limita las instancias: primero las celdas más cercanas. Las matas siguen la altura, el peso de caña y el
// color actuales de su lote (lectura de teselas.js). El lote recién cortado no lleva matas. El modo liviano las retira.
import * as THREE from 'three';
import { crearAzar } from '../util/azar.js';
import { SEMILLA } from '../terreno/relieve.js';
import { BORDE } from '../terreno/plano.js';
import { CELDA, celdaDe } from './detalle.js';
import { LADO } from './rejilla.js';
import { BASE, RETIRO, factorCana } from './teselas.js';
import { PERIODO_SURCO } from './superficie.js';
import { EDADES_CANA } from './tipos.js';
import { matasCana } from './arboles.js';

export const UMBRAL_CANA = 460; // distancia de la cámara a la celda (unidades de escena)
const CUPO = { copa: 12000, borde: 6000, espiga: 4000 };
const EN_HILERA = 1.6; // separación de las matas de dosel dentro de la hilera
const PASO_BORDE = 1.1; // separación de las matas del borde
const AFUERA = 0.25; // las matas del borde quedan frente a la cara del bloque
const MINIMA = 0.6; // altura mínima del bloque para dibujar matas (el lote recién cortado no lleva)
const MADURA = EDADES_CANA.altura[EDADES_CANA.altura.length - 1];
const ALTO_BORDE = 2.5; // alto de la mata del borde en escala 1
const MEMORIA = 160; // celdas generadas que se conservan
// Campos de cada mata: x, z, suelo, giro, escala, k (unidad en la lectura), borde (0 o 1), azar, factor de la tapa.
const CAMPOS = 9;

export function crearCanaCerca({ centros, unidadDe, unidades }, lectura, altura) {
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
    // Dosel: crestas de los surcos (s = m + 0,5 periodos) y matas cada EN_HILERA a lo largo de la hilera.
    const d = [Math.cos(u.surco ?? 0), Math.sin(u.surco ?? 0)];
    const p = [-d[1], d[0]];
    const esquinas = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]];
    const sv = esquinas.map(([x, z]) => (x * p[0] + z * p[1]) / PERIODO_SURCO);
    const tv = esquinas.map(([x, z]) => (x * d[0] + z * d[1]) / EN_HILERA);
    for (let m = Math.ceil(Math.min(...sv) - 0.5); m + 0.5 <= Math.max(...sv); m++) {
      const s = (m + 0.5) * PERIODO_SURCO;
      for (let n = Math.ceil(Math.min(...tv)); n <= Math.max(...tv); n++) {
        const a = (n + (azar() - 0.5) * 0.5) * EN_HILERA;
        const x = d[0] * a + p[0] * s;
        const z = d[1] * a + p[1] * s;
        if (x >= x0 && x <= x1 && z >= z0 && z <= z1) poner(x, z, 0);
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

  // Mallas instanciadas: dosel, borde y espiga, con color por instancia (el del lote).
  const formas = matasCana();
  const material = new THREE.MeshStandardMaterial(formas.material);
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

  let orden = [];
  let activo = true;
  const cuenta = { copa: 0, borde: 0, espiga: 0 };
  const matriz = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const eje = new THREE.Vector3(0, 1, 0);
  const pos = new THREE.Vector3();
  const esc = new THREE.Vector3();
  const tinte = new THREE.Color();

  function poner(id, x, y, z, giro, sx, sy, brillo, k) {
    const lugar = cuenta[id]++;
    mallas[id].setMatrixAt(lugar, matriz.compose(pos.set(x, y, z), q.setFromAxisAngle(eje, giro), esc.set(sx, sy, sx)));
    if (k < 0) tinte.setScalar(brillo);
    else tinte.setRGB(lectura.c[k * 3] * brillo, lectura.c[k * 3 + 1] * brillo, lectura.c[k * 3 + 2] * brillo);
    mallas[id].setColorAt(lugar, tinte);
  }

  // Escribe las matas de las celdas en orden hasta llenar un cupo.
  function llenar() {
    for (const id of Object.keys(cuenta)) cuenta[id] = 0;
    recorrido: for (const celda of activo ? orden : []) {
      const m = celdaGenerada(celda);
      for (let i = 0; i < m.length; i += CAMPOS) {
        const k = m[i + 5];
        const w = lectura.w[k];
        const h = lectura.h[k];
        if (w < 0.02 || h < MINIMA) continue;
        const [x, z, suelo, giro, escala] = [m[i], m[i + 1], m[i + 2], m[i + 3], m[i + 4]];
        const azar = m[i + 7];
        const tope = suelo + h * m[i + 8];
        if (m[i + 6] === 1) {
          if (cuenta.borde >= CUPO.borde) break recorrido;
          poner('borde', x, suelo, z, giro, escala * w, ((tope - suelo) / ALTO_BORDE) * w, 0.95 + 0.15 * azar, k);
          continue;
        }
        if (cuenta.copa >= CUPO.copa) break recorrido;
        const e = escala * (0.7 + 0.3 * (h / MADURA)) * w;
        poner('copa', x, tope - 0.3, z, giro, e, e, 0.95 + 0.15 * azar, k);
        if (h > 0.85 * MADURA && azar < 0.3 && cuenta.espiga < CUPO.espiga) poner('espiga', x, tope - 0.2, z, giro, escala * w, escala * w, 0.9 + 0.2 * azar, -1);
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
    const nuevo = lista.map((x) => x[1]);
    if (nuevo.length === orden.length && nuevo.every((c, i) => c === orden[i])) return false;
    orden = nuevo;
    llenar();
    return true;
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
    datos: () => ({ celdas: activo ? orden.length : 0, ...cuenta, generadas: memoria.size }),
    arreglos: () => Object.values(mallas).flatMap((m) => [m.instanceMatrix.array, m.instanceColor.array]),
  };
}
