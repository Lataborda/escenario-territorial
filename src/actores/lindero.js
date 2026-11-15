// Lindero de las fincas tipo resaltado (capa «lindero_territorio», P13): el límite de la propiedad, con una familia
// que decide, frente a las figuras territoriales (figuras.js). Usa el perímetro de las fincas ya trazadas
// (src/fincas/trazado.js). No cambia con el escenario. Fincas y rótulos en contenido/actores.json (red.lindero).
import * as THREE from 'three';
import contenido from '../../contenido/actores.json';
import { obtenerFincas } from '../fincas/trazado.js';
import { crearTrazo } from '../escena/lineas.js';
import { ESTILO } from './estilo.js';

const ALTO = 1.4; // sobre el terreno
const ALTO_ROTULO = 20;
const datos = contenido.red.lindero;

/** superficie y altura: consultas del terreno. */
export function crearLindero({ superficie, altura }) {
  const fincas = obtenerFincas(altura).fincas.filter((f) => datos.fincas.includes(f.id));
  const trazo = crearTrazo('lindero-resaltado', altura, { ...ESTILO.lindero.linea, alto: ALTO });
  trazo.fijar(fincas.flatMap((f) => f.perimetro));
  const grupo = new THREE.Group();
  grupo.name = 'actores-lindero';
  grupo.add(trazo.grupo);
  return {
    capa: datos.capa,
    grupo,
    nubes: [],
    rotulos: datos.rotulos
      .map((r) => {
        const f = fincas.find((x) => x.id === r.en);
        return f ? { ...r, punto: [f.ancla.x, superficie(f.ancla.x, f.ancla.z) + (r.lado === 'abajo' ? 0 : ALTO_ROTULO), f.ancla.z] } : null;
      })
      .filter(Boolean),
    aplicar() {},
    datos: () => ({ fincas: fincas.map((f) => f.id), segmentos: trazo.cantidad() }),
  };
}
