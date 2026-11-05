// Contorno de la estructura ecológica principal (EEP) del paisaje en cada escenario: borde de las teselas con
// cobertura de la EEP (TIPOS_EEP, incluidos los lotes de bosque y guadual de las fincas) o con agua de un cauce.
// Conexión de cada finca con la EEP: tramos del lindero cubiertos por dentro (lote de la EEP o cerca viva) con
// la EEP afuera. Segmentos [x1, z1, x2, z2] para la capa «eep» (src/escena/lineas.js). Sin Three.js.
import { TIPOS_EEP } from './tipos.js';
import { INDICE, NINGUNA } from './asignacion.js';
import { LADO } from './rejilla.js';
import { MARGEN_CAUCE } from '../fincas/region.js';

const EEP = new Set(TIPOS_EEP.map((t) => INDICE.get(t)));

export function crearContornoEep({ centros, unidadDe }, cauces) {
  const { columnas, filas } = centros;
  const memoria = new Map();
  function mascara(asignacion) {
    const m = new Uint8Array(centros.total);
    for (let t = 0; t < centros.total; t++) {
      const u = unidadDe[t];
      const indice = u >= 0 ? asignacion[u] : NINGUNA;
      m[t] = (indice !== NINGUNA && EEP.has(indice)) || cauces.borde[t] < MARGEN_CAUCE ? 1 : 0;
    }
    return m;
  }
  // Lados entre una tesela de la EEP y una vecina fuera de ella (el borde de la maqueta no se traza).
  function contorno(asignacion) {
    const m = mascara(asignacion);
    const h = LADO / 2;
    const segmentos = [];
    for (let j = 0; j < filas; j++) {
      for (let i = 0; i < columnas; i++) {
        const t = j * columnas + i;
        const x = centros.x(i);
        const z = centros.z(j);
        if (i + 1 < columnas && m[t] !== m[t + 1]) segmentos.push([x + h, z - h, x + h, z + h]);
        if (j + 1 < filas && m[t] !== m[t + columnas]) segmentos.push([x - h, z + h, x + h, z + h]);
      }
    }
    return segmentos;
  }
  // Tramos de conexión por finca: { F1: [segmentos], ... }.
  function conexiones(asignacion, fincas) {
    const m = mascara(asignacion);
    return Object.fromEntries(fincas.map((f) => [f.id, f.lindero.filter((b) => (b.eep || b.cerca) && b.fuera >= 0 && m[b.fuera]).map((b) => b.s)]));
  }
  const guardado = (clave, fn) => {
    if (!memoria.has(clave)) memoria.set(clave, fn());
    return memoria.get(clave);
  };
  return {
    segmentos: (id, asignacion) => guardado(`contorno:${id}`, () => contorno(asignacion)),
    conexiones: (id, asignacion, fincas) => guardado(`conexion:${id}`, () => conexiones(asignacion, fincas)),
  };
}
