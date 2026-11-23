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

/** Punto de un rótulo: sobre la finca «en» o en el punto medio de las dos fincas «entre» (etapa 10.b.b). */
export function puntoRotulo(r, fincas, superficie, alto = ALTO_ROTULO) {
  const anclas = (r.entre ?? [r.en]).map((id) => fincas.find((f) => f.id === id)?.ancla);
  if (!anclas.length || anclas.some((a) => !a)) return null;
  const x = anclas.reduce((s, a) => s + a.x, 0) / anclas.length;
  const z = anclas.reduce((s, a) => s + a.z, 0) / anclas.length;
  return [x, superficie(x, z) + (r.lado === 'abajo' ? 0 : alto), z];
}

/**
 * superficie y altura: consultas del terreno. bloque, nombre y estilo: otra capa con el mismo dibujo (las fincas
 * como islas de la etapa 10.b.b, contenido/actores.json, red.efectos.islas).
 */
export function crearLindero({ superficie, altura, bloque = datos, nombre = 'lindero', estilo = ESTILO.lindero }) {
  const fincas = obtenerFincas(altura).fincas.filter((f) => bloque.fincas.includes(f.id));
  const trazo = crearTrazo(`${nombre}-resaltado`, altura, { ...estilo.linea, alto: ALTO });
  trazo.fijar(fincas.flatMap((f) => f.perimetro));
  const grupo = new THREE.Group();
  grupo.name = `actores-${nombre}`;
  grupo.add(trazo.grupo);
  return {
    capa: bloque.capa,
    grupo,
    nubes: [],
    rotulos: bloque.rotulos
      .map((r) => {
        const punto = puntoRotulo(r, fincas, superficie);
        return punto ? { ...r, punto } : null;
      })
      .filter(Boolean),
    aplicar() {},
    datos: () => ({ fincas: fincas.map((f) => f.id), segmentos: trazo.cantidad() }),
  };
}
