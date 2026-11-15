// Marcadores de los actores (capa «actores», P13 y P21): un punto simbólico por actor, con color y forma según su
// categoría (familias productoras, organización comunitaria, institución pública, aliado externo, régimen, consumo).
// Sin figuras humanas. Los actores existen en todos los escenarios; sus enlaces (enlaces.js) solo donde hay red.
// Rótulos según el escenario, siete en escena como máximo entre todas las capas de la parada. Nodos de actor
// (con «actor») y rótulos en contenido/actores.json (red.nodos y red.marcadores).
import * as THREE from 'three';
import contenido from '../../contenido/actores.json';
import { crearNube } from '../flujos/particulas.js';
import { crearRuta } from '../flujos/curvas.js';
import { ESTILO } from './estilo.js';
import { ALTO_NODO } from './mercados.js';

const ALTO_ROTULO = 22;
const datos = contenido.red.marcadores;

/** nodos: crearNodos(). */
export function crearMarcadores({ nodos }) {
  const lista = nodos.actores();
  const categorias = [...new Set(lista.map((n) => n.tipo))];
  const nubes = new Map(categorias.map((c) => [c, crearNube(`actor-${c}`, ESTILO[c])]));
  const grupo = new THREE.Group();
  grupo.name = 'actores-marcadores';
  grupo.add(...[...nubes.values()].map((n) => n.puntos));
  let visibles = [];
  function aplicar(escenario) {
    visibles = lista.filter((n) => nodos.en(n, escenario));
    for (const [categoria, nube] of nubes) {
      nube.fijar(visibles.filter((n) => n.tipo === categoria).map((n) => ({ ruta: crearRuta([[n.x, n.y + ALTO_NODO, n.z]]) })), 1);
      nube.avanzar(0);
    }
  }
  return {
    capa: datos.capa,
    grupo,
    nubes: [...nubes.values()],
    rotulos: datos.rotulos.map((r) => {
      const n = nodos.de(r.en);
      return { ...r, punto: [n.x, n.y + (r.lado === 'abajo' ? 0 : ALTO_ROTULO), n.z] };
    }),
    aplicar,
    datos: () => ({
      marcadores: visibles.length,
      actores: [...new Set(visibles.map((n) => n.actor))].sort(),
      categorias: Object.fromEntries(categorias.map((c) => [c, visibles.filter((n) => n.tipo === c).length])),
    }),
  };
}
