// Unidades de cobertura sobre una rejilla de teselas de 6 unidades de escena: parcelas del plano, del piedemonte
// y de la ladera campesina, orillas de los cauces, celdas de montaña, lotes de las fincas tipo (src/fincas/) y
// reservas para módulos posteriores.
import { crearAzar, crearRuidos } from '../util/azar.js';
import { ENTIDADES, ZONAS, aPlanoU, aPlanoV, aMundoX, aMundoZ } from '../terreno/plano.js';
import { enPosicion } from '../terreno/hidrografia.js';
import { SEMILLA } from '../terreno/relieve.js';
import { obtenerVias } from '../vias/trazado.js';
import { obtenerFincas } from '../fincas/trazado.js';
import { CLASES_POR_ZONA, ZONAS_CON_TESELAS, RESERVAS } from './tipos.js';
import { LADO, rejillaTeselas } from './rejilla.js';

export { LADO };

const BANDA = { rio_cauca: 18, rio_tributario: 15 }; // ancho de la orilla desde el borde del cauce
const BANDA_QUEBRADA = 11;
const MARGEN_CAUCE = 3; // el centro de una tesela queda al menos a esta distancia del borde del cauce
const LARGO_ORILLA = 36; // largo de cada unidad de orilla a lo largo del cauce
// Filas y columnas de teselas por parcela: grandes en el plano y el piedemonte, pequeñas en la ladera campesina.
const CATASTROS = { grande: { alto: [7, 8, 9], ancho: [5, 10] }, pequeno: { alto: [2, 3, 3, 4], ancho: [2, 4] } };
const CATASTRO_DE = { ladera: 'pequeno' };
const CELDA = 5; // teselas por lado de una celda de montaña
const MINIMO = 3; // teselas mínimas de una parcela

// Zona con el mismo límite irregular que el color del terreno (src/terreno/colores.js).
function crearZonificador() {
  const { detalle } = crearRuidos(SEMILLA, ['montana', 'detalle', 'llanura']);
  return (u, v) => {
    const uz = u + 0.016 * detalle(v * 7.1, u * 3.3 + 11);
    return (ZONAS.find((z) => uz < z.hasta) ?? ZONAS[ZONAS.length - 1]).id;
  };
}

function claveOrilla(rios, cauces, t, x, z) {
  const r = rios[cauces.rio[t]];
  const m = r.muestras;
  const k = Math.min(Math.floor(cauces.posicion[t]), m.length - 2);
  const a = m[k];
  const b = m[k + 1];
  const lado = (b.x - a.x) * (z - a.z) - (b.z - a.z) * (x - a.x) > 0 ? 'i' : 'd';
  const s = enPosicion(m, cauces.posicion[t], 's');
  return { clave: `orilla:${r.id}:${lado}:${Math.floor(s / LARGO_ORILLA)}`, rio: r.id };
}

// Reservas: entidades de territorio.json con radio (primero por id, después por tipo).
function crearReservas() {
  const lista = [];
  for (const e of ENTIDADES) {
    if (typeof e.x !== 'number' || typeof e.z !== 'number') continue;
    const regla = RESERVAS.find((r) => r.id === e.id) ?? RESERVAS.find((r) => !r.id && r.tipo === e.tipo);
    if (regla) lista.push({ entidad: e.id, x: aMundoX(e.x), z: aMundoZ(e.z), radio: regla.radio, cobertura: regla.cobertura ?? null });
  }
  return lista;
}

// Bandas de parcelas: filas de alto variable y columnas de ancho variable por banda.
function crearCatastro(centros, azar, { alto: ALTO, ancho: ANCHO }) {
  const fila = new Int16Array(centros.filas);
  const columnas = [];
  let j = 0;
  for (let b = 0; j < centros.filas; b++) {
    const alto = ALTO[Math.floor(azar() * ALTO.length)];
    const col = new Int16Array(centros.columnas);
    let i = Math.floor(azar() * ANCHO[1]) - ANCHO[1];
    for (let c = 0; i < centros.columnas; c++) {
      const ancho = ANCHO[0] + Math.floor(azar() * (ANCHO[1] - ANCHO[0] + 1));
      for (let k = Math.max(i, 0); k < Math.min(i + ancho, centros.columnas); k++) col[k] = c;
      i += ancho;
    }
    for (let k = j; k < Math.min(j + alto, centros.filas); k++) fila[k] = b;
    columnas.push(col);
    j += alto;
  }
  return { fila, columnas };
}

// Clasifica cada tesela y agrupa por clave. Devuelve la rejilla, la unidad de cada tesela y las unidades.
// Las vías abren un corredor sin parcelas (src/vias/trazado.js).
export function crearUnidades(altura) {
  const { centros, cauces } = rejillaTeselas();
  const vias = obtenerVias(altura).mascara;
  const fincas = obtenerFincas(altura);
  const zonaDe = crearZonificador();
  const reservas = crearReservas();
  const azar = crearAzar(SEMILLA + 51);
  const catastros = Object.fromEntries(Object.entries(CATASTROS).map(([k, medidas]) => [k, crearCatastro(centros, azar, medidas)]));
  const grupos = new Map();

  for (let j = 0; j < centros.filas; j++) {
    for (let i = 0; i < centros.columnas; i++) {
      const t = j * centros.columnas + i;
      const x = centros.x(i);
      const z = centros.z(j);
      const zona = zonaDe(aPlanoU(x), aPlanoV(z));
      const clases = CLASES_POR_ZONA[zona] ?? [];
      const borde = cauces.borde[t];
      if (borde < MARGEN_CAUCE || vias[t]) continue;
      let g = null;
      const banda = cauces.rio[t] >= 0 ? BANDA[cauces.rios[cauces.rio[t]].id] ?? BANDA_QUEBRADA : 0;
      const reserva = reservas.find((r) => Math.hypot(x - r.x, z - r.z) < r.radio);
      const finca = fincas.fincas[fincas.fincaDe[t]];
      // Lote de una finca tipo, con uso fijo; el solar de la casa queda sin tesela.
      if (finca && fincas.loteDe[t] < 0) continue;
      if (finca) {
        const lote = fincas.loteDe[t];
        g = { clase: 'lotes', clave: `lote:${finca.id}:${lote}`, finca: finca.id, lote, cobertura: finca.lotes[lote].uso };
      } else if (clases.includes('orillas') && borde < banda) g = { clase: 'orillas', ...claveOrilla(cauces.rios, cauces, t, x, z) };
      else if (reserva) g = { clase: 'reservas', clave: `reserva:${reserva.entidad}`, reserva };
      else if (clases.includes('parcelas')) {
        const catastro = catastros[CATASTRO_DE[zona] ?? 'grande'];
        const b = catastro.fila[j];
        g = { clase: 'parcelas', clave: `parcela:${zona}:${b}:${catastro.columnas[b][i]}` };
      } else if (clases.includes('celdas')) {
        g = { clase: 'celdas', clave: `celda:${zona}:${Math.floor(i / CELDA)}:${Math.floor(j / CELDA)}` };
      }
      if (!g) continue;
      if (!grupos.has(g.clave)) grupos.set(g.clave, { ...g, teselas: [], zonas: new Map(), cauce: Infinity });
      const u = grupos.get(g.clave);
      u.teselas.push(t);
      u.zonas.set(zona, (u.zonas.get(zona) ?? 0) + 1);
      u.cauce = Math.min(u.cauce, borde);
    }
  }

  const unidadDe = new Int32Array(centros.total).fill(-1);
  const unidades = [];
  for (const g of grupos.values()) {
    if (g.clase === 'parcelas' && g.teselas.length < MINIMO) continue;
    const zona = [...g.zonas.entries()].sort((a, b) => b[1] - a[1])[0][0];
    let sx = 0;
    let sz = 0;
    for (const t of g.teselas) {
      sx += centros.x(t % centros.columnas);
      sz += centros.z(Math.floor(t / centros.columnas));
    }
    const indice = unidades.length;
    for (const t of g.teselas) unidadDe[t] = indice;
    unidades.push({
      indice,
      clave: g.clave,
      clase: g.clase,
      zona,
      teselas: g.teselas,
      x: sx / g.teselas.length,
      z: sz / g.teselas.length,
      area: g.teselas.length * LADO * LADO,
      teselado: g.clase === 'reservas' || ZONAS_CON_TESELAS.includes(zona),
      relieve: zona === 'ladera', // teselas que siguen la rejilla del terreno
      cauce: g.cauce,
      rio: g.rio ?? null,
      entidad: g.reserva?.entidad ?? g.finca ?? null,
      cobertura: g.reserva?.cobertura ?? g.cobertura ?? null,
      finca: g.finca ?? null,
      lote: g.lote ?? null,
      retardo: azar(), // escalonamiento de la transición
    });
  }
  return { centros, unidadDe, unidades };
}
