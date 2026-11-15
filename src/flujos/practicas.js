// Prácticas de conservación en una finca de ladera (paso de ladera de P09, capa «practicas_conservacion»): curvas a
// nivel calculadas sobre el relieve de la finca y repartidas por el uso de cada lote (contenido/procesos.json,
// practicas). Curvas a nivel y terrazas como trazos; barreras vivas, una de cada «cada» curvas, con trazo grueso y
// puntos fijos. El agua baja por la pendiente y se detiene en cada barrera (infiltración).
import * as THREE from 'three';
import contenido from '../../contenido/procesos.json';
import { LADO, teselaDe } from '../coberturas/rejilla.js';
import { obtenerFincas } from '../fincas/trazado.js';
import { crearTrazo } from '../escena/lineas.js';
import { crearNube } from './particulas.js';
import { crearRuta } from './curvas.js';
import { ESTILO } from './estilo.js';

const CELDA = 3; // paso de la rejilla del terreno
const ALTO = 0.9; // sobre la superficie
const ALTO_ROTULO = 10;
const PUNTO_CADA = 3; // un punto fijo de barrera cada tantos tramos
const AGUA_CADA = 4; // una ruta de agua cada tantos tramos de barrera
const PASO_AGUA = 2; // unidades entre puntos de la ruta de agua
const PASOS_AGUA = 8; // largo máximo de la ruta (pasos cuesta arriba desde la barrera)

const datos = contenido.practicas;

// Tramos de las curvas de nivel (cada «intervalo» de altura) en las celdas de una caja: { x1, z1, x2, z2, y, nivel }.
function curvasDeNivel(superficie, caja, intervalo) {
  const tramos = [];
  const corte = (pa, pb, nivel) => {
    const t = (nivel - pa[2]) / (pb[2] - pa[2]);
    return [pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t];
  };
  for (let z = caja.z0; z < caja.z1; z += CELDA) {
    for (let x = caja.x0; x < caja.x1; x += CELDA) {
      const p = [[x, z], [x + CELDA, z], [x + CELDA, z + CELDA], [x, z + CELDA]].map(([a, b]) => [a, b, superficie(a, b)]);
      const h = p.map((q) => q[2]);
      for (let nivel = Math.ceil(Math.min(...h) / intervalo); nivel * intervalo < Math.max(...h); nivel++) {
        const y = nivel * intervalo;
        const cruces = [];
        for (let k = 0; k < 4; k++) {
          const a = p[k];
          const b = p[(k + 1) % 4];
          if (a[2] < y !== b[2] < y) cruces.push(corte(a, b, y));
        }
        for (let k = 0; k + 1 < cruces.length; k += 2) {
          tramos.push({ x1: cruces[k][0], z1: cruces[k][1], x2: cruces[k + 1][0], z2: cruces[k + 1][1], y, nivel });
        }
      }
    }
  }
  return tramos;
}

/** altura y superficie: consultas del terreno. */
export function crearPracticas({ altura, superficie }) {
  const { fincas, centros } = obtenerFincas(altura);
  const finca = fincas.find((f) => f.id === datos.finca);
  if (!finca) throw new Error(`finca desconocida «${datos.finca}»`);
  const xs = finca.teselas.map((t) => centros.x(t % centros.columnas));
  const zs = finca.teselas.map((t) => centros.z(Math.floor(t / centros.columnas)));
  const h = LADO / 2;
  const caja = { x0: Math.min(...xs) - h, x1: Math.max(...xs) + h, z0: Math.min(...zs) - h, z1: Math.max(...zs) + h };
  const usoEn = (x, z) => {
    const k = finca.loteDe.get(teselaDe(centros, x, z));
    return k != null && k >= 0 ? finca.lotes[k].uso : null;
  };
  // Cada tramo toma la práctica del lote donde cae su punto medio: la barrera viva sustituye a la curva en su nivel.
  const tramos = Object.fromEntries(datos.practicas.map((p) => [p.id, []]));
  for (const t of curvasDeNivel(superficie, caja, datos.intervalo)) {
    const uso = usoEn((t.x1 + t.x2) / 2, (t.z1 + t.z2) / 2);
    if (!uso) continue;
    const propias = datos.practicas.filter((p) => p.usos.includes(uso) && t.nivel % (p.cada ?? 1) === 0);
    const practica = propias.sort((a, b) => (b.cada ?? 1) - (a.cada ?? 1))[0];
    if (practica) tramos[practica.id].push(t);
  }
  const medio = (t) => [(t.x1 + t.x2) / 2, t.y + ALTO, (t.z1 + t.z2) / 2];

  const grupo = new THREE.Group();
  grupo.name = 'flujos-practicas';
  const trazos = {};
  for (const p of datos.practicas) {
    trazos[p.id] = crearTrazo(`practica-${p.id}`, altura, ESTILO[p.id].linea);
    trazos[p.id].fijarPuntos(tramos[p.id].flatMap((t) => [t.x1, t.y + ALTO, t.z1, t.x2, t.y + ALTO, t.z2]));
    grupo.add(trazos[p.id].grupo);
  }

  // Barreras vivas: puntos fijos sobre la curva. Agua: rutas cortas que bajan por la pendiente hasta la barrera.
  const barreras = tramos[datos.infiltracion.en] ?? [];
  const puntos = barreras.filter((t, k) => k % PUNTO_CADA === 0).map((t) => ({ ruta: crearRuta([medio(t)]) }));
  const rutasAgua = [];
  barreras.forEach((t, k) => {
    if (k % AGUA_CADA !== 2) return;
    let [x, , z] = medio(t);
    const lista = [[x, superficie(x, z) + ALTO, z]];
    for (let n = 0; n < PASOS_AGUA; n++) {
      const gx = superficie(x + 1, z) - superficie(x - 1, z);
      const gz = superficie(x, z + 1) - superficie(x, z - 1);
      const g = Math.hypot(gx, gz);
      if (g < 1e-4) break;
      x += (gx / g) * PASO_AGUA;
      z += (gz / g) * PASO_AGUA;
      if (!usoEn(x, z)) break;
      lista.unshift([x, superficie(x, z) + ALTO, z]);
    }
    if (lista.length > 3) rutasAgua.push({ ruta: crearRuta(lista) });
  });
  const nubes = {
    barreras: crearNube('barreras_vivas', ESTILO[datos.infiltracion.en]),
    agua: crearNube('infiltracion', ESTILO.infiltracion),
  };
  grupo.add(nubes.barreras.puntos, nubes.agua.puntos);

  // Rótulo de una práctica: sobre el tramo más cercano al centro de sus tramos o, con «extremo» (norte, sur,
  // oriente u occidente), sobre el tramo más alejado en ese rumbo.
  const RUMBOS = { norte: [0, -1], sur: [0, 1], oriente: [1, 0], occidente: [-1, 0] };
  const lugar = ({ en, extremo }) => {
    const lista = tramos[en] ?? [];
    if (!lista.length) return null;
    const xz = (t) => [(t.x1 + t.x2) / 2, (t.z1 + t.z2) / 2];
    const c = lista.reduce((s, t) => [s[0] + xz(t)[0], s[1] + xz(t)[1]], [0, 0]).map((v) => v / lista.length);
    const r = RUMBOS[extremo];
    const valor = (t) => (r ? -(xz(t)[0] * r[0] + xz(t)[1] * r[1]) : Math.hypot(xz(t)[0] - c[0], xz(t)[1] - c[1]));
    return medio(lista.reduce((m, t) => (valor(t) < valor(m) ? t : m)));
  };

  return {
    capa: datos.capa,
    grupo,
    nubes: Object.values(nubes),
    rotulos: datos.rotulos
      .map((r) => {
        const p = lugar(r);
        return p && { ...r, punto: [p[0], p[1] + (r.lado === 'abajo' ? 0 : ALTO_ROTULO), p[2]] };
      })
      .filter(Boolean),
    aplicar(escenario, factor) {
      nubes.barreras.fijar(puntos, 1);
      nubes.agua.fijar(rutasAgua, factor);
    },
    datos: () => ({
      finca: finca.id,
      tramos: Object.fromEntries(Object.entries(tramos).map(([id, l]) => [id, l.length])),
      puntosBarrera: puntos.length,
      rutasAgua: rutasAgua.length,
      segmentos: Object.values(trazos).reduce((s, t) => s + t.cantidad(), 0),
    }),
  };
}
