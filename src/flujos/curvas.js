// Rutas de los flujos (etapa 8): polilíneas en la escena con su largo acumulado. Tres formas de trazarlas: sobre el
// relieve, en arco entre dos puntos y por la pendiente hasta un cauce (escorrentía), con su continuación aguas abajo.
import { rejillaTeselas, teselaDe } from '../coberturas/rejilla.js';
import { dentro } from '../terreno/plano.js';

const PASO = 6; // separación de los puntos de una ruta sobre el relieve
const MARGEN_CAUCE = 3; // la escorrentía llega al cauce a esta distancia de su borde

/** lista: [[x, y, z], …]. Devuelve { puntos, acumulado, largo, n }. */
export function crearRuta(lista) {
  const n = lista.length;
  const puntos = new Float32Array(n * 3);
  const acumulado = new Float32Array(n);
  lista.forEach((p, k) => {
    puntos.set(p, k * 3);
    if (k) acumulado[k] = acumulado[k - 1] + Math.hypot(p[0] - lista[k - 1][0], p[1] - lista[k - 1][1], p[2] - lista[k - 1][2]);
  });
  return { puntos, acumulado, largo: n ? acumulado[n - 1] : 0, n };
}

/** Escribe en destino (desde el índice i) el punto de la ruta a la distancia s de su inicio. */
export function puntoEn(ruta, s, destino, i) {
  const { puntos, acumulado, n } = ruta;
  let a = 0;
  let b = n - 1;
  while (b - a > 1) {
    const m = (a + b) >> 1;
    if (acumulado[m] <= s) a = m;
    else b = m;
  }
  const tramo = acumulado[b] - acumulado[a];
  const t = tramo > 0 ? Math.min(1, Math.max(0, (s - acumulado[a]) / tramo)) : 0;
  for (let c = 0; c < 3; c++) destino[i + c] = puntos[a * 3 + c] + (puntos[b * 3 + c] - puntos[a * 3 + c]) * t;
}

/** Segmentos [x1, y1, z1, x2, y2, z2, …] de una ruta, para crearTrazo().fijarPuntos. */
export function segmentosDe(ruta, salida = []) {
  const p = ruta.puntos;
  for (let k = 0; k < ruta.n - 1; k++) salida.push(p[k * 3], p[k * 3 + 1], p[k * 3 + 2], p[k * 3 + 3], p[k * 3 + 4], p[k * 3 + 5]);
  return salida;
}

/** Polilínea [[x, z], …] sobre la superficie, con puntos cada PASO y elevada «alto». */
export function sobreRelieve(xz, superficie, alto = 1) {
  const lista = [];
  xz.forEach(([x, z], k) => {
    if (k) {
      const [x0, z0] = xz[k - 1];
      const n = Math.max(1, Math.ceil(Math.hypot(x - x0, z - z0) / PASO));
      for (let j = 1; j < n; j++) {
        const xa = x0 + ((x - x0) * j) / n;
        const za = z0 + ((z - z0) * j) / n;
        lista.push([xa, superficie(xa, za) + alto, za]);
      }
    }
    lista.push([x, superficie(x, z) + alto, z]);
  });
  return crearRuta(lista);
}

/**
 * Arco de a a b ({ x, z }): la flecha crece con la distancia y «lado» (−1, 0 o 1) lo comba hacia un costado, para
 * separar la ida del retorno. Nunca queda bajo el relieve.
 */
export function arco(a, b, superficie, { alto = 2, flecha = 0.14, lado = 0, comba = 0.1, pasos = 28 } = {}) {
  const d = Math.hypot(b.x - a.x, b.z - a.z) || 1;
  const px = (-(b.z - a.z) / d) * lado * comba * d;
  const pz = ((b.x - a.x) / d) * lado * comba * d;
  const ya = superficie(a.x, a.z) + alto;
  const yb = superficie(b.x, b.z) + alto;
  const lista = [];
  for (let k = 0; k <= pasos; k++) {
    const t = k / pasos;
    const curva = 4 * t * (1 - t);
    const x = a.x + (b.x - a.x) * t + px * curva;
    const z = a.z + (b.z - a.z) * t + pz * curva;
    const y = ya + (yb - ya) * t + Math.max(10, flecha * d) * curva;
    lista.push([x, Math.max(y, superficie(x, z) + alto), z]);
  }
  return crearRuta(lista);
}

// Punto de cauce visible más cercano a (x, z), o null a más de «alcance».
function cauceCercano(x, z, alcance) {
  let mejor = null;
  let dMin = alcance;
  for (const r of rejillaTeselas().cauces.rios) {
    for (const m of r.muestras) {
      if (m.sumergido || !dentro(m.x, m.z)) continue;
      const d = Math.hypot(m.x - x, m.z - z);
      if (d < dMin) {
        dMin = d;
        mejor = m;
      }
    }
  }
  return mejor;
}

/**
 * Escorrentía desde (x, z) hasta el cauce más cercano: en cada paso la ruta combina la pendiente del relieve con el
 * rumbo al cauce (peso «rumbo»), para salvar los resaltos del relieve. Devuelve { xz, rio, posicion } (índice del
 * río en rejillaTeselas().cauces.rios y posición a lo largo de su trazo) o null si no hay cauce al alcance, la ruta
 * sale del bloque o sube más que la tolerancia.
 */
export function descenso(x, z, altura, { paso = 4, maximo = 120, delta = 9, tolerancia = 6, rumbo = 0.45, alcance = 260 } = {}) {
  const { centros, cauces } = rejillaTeselas();
  const destino = cauceCercano(x, z, alcance);
  if (!destino) return null;
  const xz = [[x, z]];
  let minima = altura(x, z);
  for (let k = 0; k < maximo; k++) {
    const gx = altura(x + delta, z) - altura(x - delta, z);
    const gz = altura(x, z + delta) - altura(x, z - delta);
    const g = Math.hypot(gx, gz) || 1;
    const rx = destino.x - x;
    const rz = destino.z - z;
    const r = Math.hypot(rx, rz) || 1;
    const dx = (-gx / g) * (1 - rumbo) + (rx / r) * rumbo;
    const dz = (-gz / g) * (1 - rumbo) + (rz / r) * rumbo;
    const d = Math.hypot(dx, dz) || 1;
    x += (dx / d) * paso;
    z += (dz / d) * paso;
    if (!dentro(x, z)) return null;
    const h = altura(x, z);
    if (h > minima + tolerancia) return null;
    minima = Math.min(minima, h);
    xz.push([x, z]);
    const t = teselaDe(centros, x, z);
    if (t >= 0 && cauces.borde[t] < MARGEN_CAUCE) return { xz, rio: cauces.rio[t], posicion: cauces.posicion[t] };
  }
  return null;
}

/** Puntos [[x, z], …] del cauce desde una posición de su trazo hasta la salida del bloque, por el cauce receptor. */
export function aguasAbajo(rio, posicion, xz = []) {
  const { rios } = rejillaTeselas().cauces;
  const r = rios[rio];
  for (let k = Math.ceil(posicion); k < r.muestras.length; k++) {
    const m = r.muestras[k];
    if (!dentro(m.x, m.z)) return xz;
    if (m.sumergido && r.padre) break;
    xz.push([m.x, m.z]);
  }
  const padre = rios.findIndex((p) => p.id === r.padre);
  if (padre < 0 || !xz.length) return xz;
  // Entrada al cauce receptor: su muestra más cercana al último punto.
  const [ux, uz] = xz[xz.length - 1];
  let mejor = 0;
  let dMin = Infinity;
  rios[padre].muestras.forEach((m, k) => {
    const d = Math.hypot(m.x - ux, m.z - uz);
    if (d < dMin) {
      dMin = d;
      mejor = k;
    }
  });
  return aguasAbajo(padre, mejor, xz);
}
