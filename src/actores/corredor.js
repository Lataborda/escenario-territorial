// Corredor incompleto (capa «corredor_incompleto», etapa 10.b.b): con la conectividad ecológica activa y sin
// prácticas eficaces en las fincas contiguas, un trazo discontinuo entre fincas vecinas con un hueco en el medio de
// cada tramo. Fincas, hueco y rótulo en contenido/actores.json (red.efectos.corredor_incompleto). No cambia con el
// escenario.
import * as THREE from 'three';
import contenido from '../../contenido/actores.json';
import { obtenerFincas } from '../fincas/trazado.js';
import { crearTrazo } from '../escena/lineas.js';
import { ESTILO } from './estilo.js';
import { puntoRotulo } from './lindero.js';

const ALTO = 2; // sobre el terreno
const RAYA = 9; // unidades de escena de cada raya del trazo discontinuo
const ESPACIO = 6;
const datos = contenido.red.efectos.corredor_incompleto;

// Rayas de a hacia b entre las fracciones desde y hasta del tramo.
function rayas(a, b, desde, hasta) {
  const largo = Math.hypot(b.x - a.x, b.z - a.z) * (hasta - desde);
  const segmentos = [];
  for (let d = 0; d < largo; d += RAYA + ESPACIO) {
    const t1 = desde + (d / largo) * (hasta - desde);
    const t2 = desde + (Math.min(d + RAYA, largo) / largo) * (hasta - desde);
    segmentos.push([a.x + (b.x - a.x) * t1, a.z + (b.z - a.z) * t1, a.x + (b.x - a.x) * t2, a.z + (b.z - a.z) * t2]);
  }
  return segmentos;
}

/** superficie y altura: consultas del terreno. */
export function crearCorredor({ superficie, altura }) {
  const lista = obtenerFincas(altura).fincas;
  const fincas = new Map(lista.map((f) => [f.id, f]));
  const mitad = (1 - datos.hueco) / 2;
  const segmentos = datos.tramos.flatMap(([i, j]) => {
    const [a, b] = [fincas.get(i)?.ancla, fincas.get(j)?.ancla];
    return a && b ? [...rayas(a, b, 0, mitad), ...rayas(a, b, 1 - mitad, 1)] : [];
  });
  const trazo = crearTrazo('corredor-incompleto', altura, { ...ESTILO.corredor_incompleto.linea, alto: ALTO });
  trazo.fijar(segmentos);
  const grupo = new THREE.Group();
  grupo.name = 'actores-corredor-incompleto';
  grupo.add(trazo.grupo);
  return {
    capa: datos.capa,
    grupo,
    nubes: [],
    rotulos: datos.rotulos
      .map((r) => {
        const punto = puntoRotulo(r, lista, superficie);
        return punto ? { ...r, punto } : null;
      })
      .filter(Boolean),
    aplicar() {},
    datos: () => ({ tramos: datos.tramos.length, segmentos: trazo.cantidad() }),
  };
}
