// Métricas de una asignación, para la verificación: proporción de cada tipo en el plano y en la ladera, y
// aislamiento de relictos.
import { LADO } from './unidades.js';
import { tipoDe } from './asignacion.js';

const SEPARACION_AISLADO = 60; // distancia de borde a borde (unidades de escena) para contar un relicto como aislado
const BOSQUE = ['bosque_seco', 'ripario'];

const redondear = (x, d = 3) => Number(x.toFixed(d));

// Área de cada tipo en las parcelas y orillas de una zona.
function proporciones(unidades, asignacion, zona) {
  const area = {};
  let total = 0;
  for (const u of unidades) {
    if (u.zona !== zona || u.clase === 'celdas' || u.clase === 'reservas') continue;
    const t = tipoDe(asignacion[u.indice]) ?? 'ninguna';
    area[t] = (area[t] ?? 0) + u.area;
    total += u.area;
  }
  return Object.fromEntries(Object.entries(area).map(([t, a]) => [t, redondear(a / total)]));
}

// Separación de borde a borde entre cada relicto y la unidad de bosque más cercana (relicto u orilla con bosque).
function aislamiento({ unidades, centros }, asignacion) {
  const punto = (t) => [centros.x(t % centros.columnas), centros.z(Math.floor(t / centros.columnas))];
  const bosques = unidades.filter((u) => BOSQUE.includes(tipoDe(asignacion[u.indice])));
  const relictos = bosques.filter((u) => tipoDe(asignacion[u.indice]) === 'bosque_seco' && u.zona === 'plano');
  const separaciones = relictos.map((r) => {
    const propios = r.teselas.map(punto);
    let minimo = Infinity;
    for (const otro of bosques) {
      if (otro === r || Math.hypot(otro.x - r.x, otro.z - r.z) - minimo > 400) continue;
      for (const t of otro.teselas) {
        const [x, z] = punto(t);
        for (const [px, pz] of propios) minimo = Math.min(minimo, Math.hypot(x - px, z - pz) - LADO);
      }
    }
    return Math.max(0, minimo);
  });
  return {
    relictos: relictos.length,
    aislados: separaciones.filter((s) => s >= SEPARACION_AISLADO).length,
    contiguos: separaciones.filter((s) => s <= 0).length,
    separacionMinima: separaciones.length ? redondear(Math.min(...separaciones), 1) : null,
    separacionMediana: separaciones.length ? redondear([...separaciones].sort((a, b) => a - b)[Math.floor(separaciones.length / 2)], 1) : null,
    umbral: SEPARACION_AISLADO,
  };
}

// Conjunto de unidades con caña (cualquier manejo), para comparar la geometría de la matriz entre escenarios.
export function extensionCana(unidades, asignacion) {
  return unidades.filter((u) => (tipoDe(asignacion[u.indice]) ?? '').startsWith('cana')).map((u) => u.indice);
}

export function medirAsignacion(datos, asignacion) {
  const plano = proporciones(datos.unidades, asignacion, 'plano');
  return {
    proporciones: plano,
    ladera: proporciones(datos.unidades, asignacion, 'ladera'),
    cana: redondear((plano.cana ?? 0) + (plano.cana_organica ?? 0)),
    aislamiento: aislamiento(datos, asignacion),
  };
}
