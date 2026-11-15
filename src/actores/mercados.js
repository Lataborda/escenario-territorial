// Mercados agroecológicos (capa «mercados», P18 a P20): un marcador simbólico sobre cada cabecera con mercado en el
// escenario actual (siete en S0 y S1; nueve en S2 y S3, con las cabeceras del sur). Sin enlaces: los traza
// enlaces.js en su propia capa. Nodos y rótulos en contenido/actores.json (red).
import * as THREE from 'three';
import contenido from '../../contenido/actores.json';
import { crearNube } from '../flujos/particulas.js';
import { crearRuta } from '../flujos/curvas.js';
import { ESTILO } from './estilo.js';

export const ALTO_NODO = 6; // sobre la superficie
const ALTO_ROTULO = 22;
const datos = contenido.red.mercados;

/** nodos: crearNodos(). */
export function crearMercados({ nodos }) {
  const nube = crearNube('mercado', ESTILO.mercado);
  const grupo = new THREE.Group();
  grupo.name = 'actores-mercados';
  grupo.add(nube.puntos);
  let visibles = [];
  function aplicar(escenario) {
    visibles = nodos.lista(escenario, ['mercado']);
    nube.fijar(visibles.map((n) => ({ ruta: crearRuta([[n.x, n.y + ALTO_NODO, n.z]]) })), 1);
    nube.avanzar(0);
  }
  return {
    capa: datos.capa,
    grupo,
    nubes: [nube],
    rotulos: datos.rotulos.map((r) => {
      const n = nodos.de(r.en);
      return { ...r, punto: [n.x, n.y + (r.lado === 'abajo' ? 0 : ALTO_ROTULO), n.z] };
    }),
    aplicar,
    datos: () => ({ mercados: visibles.length, ids: visibles.map((n) => n.id) }),
  };
}
