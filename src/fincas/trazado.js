// Fincas tipo (etapa 6): región, solar de la casa, lotes, lindero y conectores de cada receta de
// contenido/fincas.json. Se calcula una sola vez por carga; lo comparten las coberturas (lotes y cercas vivas) y
// el módulo visual de las fincas. Segmentos en coordenadas de escena: [x1, z1, x2, z2]. Sin Three.js.
import recetas from '../../contenido/fincas.json';
import { ENTIDADES, aMundoX, aMundoZ } from '../terreno/plano.js';
import { SEMILLA } from '../terreno/relieve.js';
import { crearAzar, semillaTexto } from '../util/azar.js';
import { rejillaTeselas, LADO } from '../coberturas/rejilla.js';
import { RESERVAS, TIPOS_EEP } from '../coberturas/tipos.js';
import { obtenerVias } from '../vias/trazado.js';
import { crearRegion, elegirSolar, MARGEN_CAUCE, VECINOS } from './region.js';
import { dividir } from './lotes.js';

export const RECETAS = recetas.fincas;

// Áreas de otras reservas (ciudad, cabeceras, ingenio, lote de la etapa 7) que la finca no ocupa.
function areasReservadas() {
  const lista = [];
  for (const e of ENTIDADES) {
    if (typeof e.x !== 'number' || typeof e.z !== 'number') continue;
    const r = RESERVAS.find((x) => x.id === e.id) ?? RESERVAS.find((x) => !x.id && x.tipo === e.tipo);
    if (r) lista.push({ x: aMundoX(e.x), z: aMundoZ(e.z), radio: r.radio });
  }
  return lista;
}

// Toma k elementos de la lista en orden aleatorio estable, hasta cubrir la fracción de la medida total.
function elegirFraccion(lista, fraccion, medida, azar) {
  if (fraccion <= 0) return new Set();
  if (fraccion >= 1) return new Set(lista);
  const orden = lista.map((x) => [x, azar()]).sort((a, b) => a[1] - b[1]).map(([x]) => x);
  const total = lista.reduce((s, x) => s + medida(x), 0);
  const elegidos = new Set();
  let suma = 0;
  for (const x of orden) {
    if (suma >= fraccion * total - 1e-6) break;
    elegidos.add(x);
    suma += medida(x);
  }
  return elegidos;
}

// Bordes de las teselas: perímetro (vecino fuera de la finca) y divisiones (vecinos en lotes distintos).
function bordes(finca, centros) {
  const { columnas } = centros;
  const h = LADO / 2;
  const dentro = new Set(finca.teselas);
  const perimetro = [];
  const divisiones = [];
  for (const t of finca.teselas) {
    const i = t % columnas;
    const j = Math.floor(t / columnas);
    const x = centros.x(i);
    const z = centros.z(j);
    VECINOS.forEach(([di, dj], lado) => {
      const enRejilla = i + di >= 0 && i + di < columnas && j + dj >= 0 && j + dj < centros.filas;
      const n = enRejilla ? (j + dj) * columnas + i + di : -1;
      // Extremos del lado común: perpendicular a la dirección del vecino.
      const s = di ? [x + di * h, z - h, x + di * h, z + h] : [x - h, z + dj * h, x + h, z + dj * h];
      const fuera = !enRejilla || !dentro.has(n);
      if (fuera) perimetro.push({ s, t, n, lado, linea: di ? `${lado}:${i}` : `${lado}:${j}` });
      else if (n > t && finca.loteDe.get(n) !== finca.loteDe.get(t)) {
        const a = finca.loteDe.get(t);
        const b = finca.loteDe.get(n);
        divisiones.push({ s, t, n, par: a < 0 || b < 0 ? null : `${Math.min(a, b)}-${Math.max(a, b)}` });
      }
    });
  }
  return { perimetro, divisiones };
}

// Punto de rótulo de un lote: la tesela más alejada del borde del lote (centro aproximado).
function puntoInterior(lote, centros, vecinos, loteDe, k) {
  const { columnas } = centros;
  const nivel = new Map();
  const cola = [];
  for (const t of lote.teselas) {
    const v = vecinos(t);
    if (v.length < 4 || v.some((n) => loteDe.get(n) !== k)) {
      nivel.set(t, 0);
      cola.push(t);
    }
  }
  for (let q = 0; q < cola.length; q++) {
    for (const n of vecinos(cola[q])) {
      if (loteDe.get(n) !== k || nivel.has(n)) continue;
      nivel.set(n, nivel.get(cola[q]) + 1);
      cola.push(n);
    }
  }
  const mejor = lote.teselas.reduce((a, b) => ((nivel.get(b) ?? 0) > (nivel.get(a) ?? 0) ? b : a));
  return { x: centros.x(mejor % columnas), z: centros.z(Math.floor(mejor / columnas)) };
}

function trazarFinca(receta, indice, { centros, cauces, vias, ocupada, reservas }) {
  const e = ENTIDADES.find((x) => x.id === receta.id);
  const cx = aMundoX(e.x);
  const cz = aMundoZ(e.z);
  const azar = crearAzar(semillaTexto(`finca ${receta.id}`, SEMILLA));
  const { columnas } = centros;
  const xs = (t) => centros.x(t % columnas);
  const zs = (t) => centros.z(Math.floor(t / columnas));
  const libre = (t) =>
    ocupada[t] < 0 && !vias[t] && cauces.borde[t] >= MARGEN_CAUCE && !reservas.some((r) => Math.hypot(xs(t) - r.x, zs(t) - r.z) < r.radio);
  const { teselas } = crearRegion({ centros, cx, cz, tamano: receta.tamano, azar, libre, paso: (t) => Boolean(vias[t]) });
  for (const t of teselas) ocupada[t] = indice;
  const solar = elegirSolar({ centros, teselas, vias, borde: cauces.borde });
  const { loteDe, lotes, vecinos } = dividir({ receta, centros, teselas, solar, borde: cauces.borde, azar });
  const finca = { id: receta.id, indice, receta, nombre: receta.nombre, ancla: { x: cx, z: cz }, teselas, loteDe, lotes, solar };
  finca.casa = { x: xs(solar), z: zs(solar), giro: (azar() - 0.5) * 0.3 };
  lotes.forEach((l, k) => Object.assign(l, puntoInterior(l, centros, vecinos, loteDe, k), { area: l.teselas.length * LADO * LADO }));

  const { perimetro, divisiones } = bordes(finca, centros);
  const eep = (k) => k >= 0 && TIPOS_EEP.includes(lotes[k].uso);
  // Cercas vivas del lindero: por tramos rectos (lado y línea), sin los lotes de la EEP ni el solar.
  const candidatos = perimetro.filter((b) => !eep(loteDe.get(b.t)) && b.t !== solar);
  const lineas = [...new Set(candidatos.map((b) => b.linea))];
  const largo = (l) => candidatos.filter((b) => b.linea === l).length;
  const elegidas = elegirFraccion(lineas, receta.conectores.externos, largo, azar);
  // Cercas vivas internas: por par de lotes vecinos (todo el lado común), sin el solar.
  const pares = [...new Set(divisiones.filter((b) => b.par).map((b) => b.par))];
  const comun = (p) => divisiones.filter((b) => b.par === p).length;
  const internas = elegirFraccion(pares, receta.conectores.internos, comun, azar);
  return {
    ...finca,
    perimetro: perimetro.map((b) => b.s),
    divisiones: divisiones.map((b) => b.s),
    externos: candidatos.filter((b) => elegidas.has(b.linea)).map((b) => b.s),
    // Cercas vivas del lindero con el centro de la tesela interior: los árboles van un poco hacia adentro.
    cercasLindero: candidatos.filter((b) => elegidas.has(b.linea)).map((b) => ({ s: b.s, hacia: [xs(b.t), zs(b.t)] })),
    internos: divisiones.filter((b) => b.par && internas.has(b.par)).map((b) => b.s),
    // Lindero con la tesela de afuera y lo que lo cubre por dentro (lote de la EEP o cerca viva): la conexión con
    // la EEP depende del escenario y se calcula en src/coberturas/eep.js.
    lindero: perimetro.map((b) => ({ s: b.s, fuera: b.n, eep: eep(loteDe.get(b.t)), cerca: elegidas.has(b.linea) && candidatos.includes(b) })),
  };
}

function trazarFincas(altura) {
  const { centros, cauces } = rejillaTeselas();
  const vias = obtenerVias(altura).mascara;
  const ocupada = new Int8Array(centros.total).fill(-1);
  const reservas = areasReservadas();
  const fincas = RECETAS.map((r, k) => trazarFinca(r, k, { centros, cauces, vias, ocupada, reservas }));
  // Lote de cada tesela de finca: −1 fuera de las fincas o en el solar.
  const loteDe = new Int16Array(centros.total).fill(-1);
  for (const f of fincas) for (const [t, k] of f.loteDe) loteDe[t] = k;
  return { fincas, fincaDe: ocupada, loteDe, centros };
}

let memoria = null;

// Fincas trazadas (una sola vez por carga): { fincas, fincaDe, loteDe, centros }.
export function obtenerFincas(altura) {
  if (!memoria) memoria = trazarFincas(altura);
  return memoria;
}

// Finca que contiene un punto de la escena, o null (clic sobre el lindero).
export function fincaEn(x, z) {
  if (!memoria) return null;
  const { centros, fincaDe, fincas } = memoria;
  const i = Math.floor((x - centros.x0 + LADO / 2) / LADO);
  const j = Math.floor((z - centros.z0 + LADO / 2) / LADO);
  if (i < 0 || j < 0 || i >= centros.columnas || j >= centros.filas) return null;
  const k = fincaDe[j * centros.columnas + i];
  return k >= 0 ? fincas[k] : null;
}
