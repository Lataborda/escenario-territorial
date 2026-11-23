// Marcadores de los actores (capa «actores», P13 y P21): un punto simbólico por actor, con color y forma según su
// categoría (familias productoras, organización comunitaria, institución pública, aliado externo, régimen, consumo).
// Sin figuras humanas. Los actores existen en todos los escenarios; sus enlaces (enlaces.js) solo donde hay red.
// Rótulos según el escenario, siete en escena como máximo entre todas las capas de la parada. Nodos de actor
// (con «actor») y rótulos en contenido/actores.json (red.nodos y red.marcadores).
// Capa «actores_efecto» (etapa 10.b.b): con el panel de condiciones, los marcadores de los actores cuyo campo
// «efectos» incluye un efecto presente según el motor de reglas, sin rótulos.
import * as THREE from 'three';
import contenido from '../../contenido/actores.json';
import { crearNube } from '../flujos/particulas.js';
import { crearRuta } from '../flujos/curvas.js';
import { ESTILO } from './estilo.js';
import { ALTO_NODO } from './mercados.js';
import { motor } from '../reglas/reglas.js';

const ALTO_ROTULO = 22;
const datos = contenido.red.marcadores;
const EFECTOS = new Map(contenido.actores.map((a) => [a.id, a.efectos ?? []]));

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
  return [{
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
  }, crearPorEfecto(nodos, lista)];
}

// Marcadores de los actores ligados a los efectos presentes (capa «actores_efecto»): se arman de nuevo al cambiar
// las condiciones («armado»).
function crearPorEfecto(nodos, lista) {
  const conEfecto = lista.filter((n) => EFECTOS.get(n.actor)?.length);
  const categorias = [...new Set(conEfecto.map((n) => n.tipo))];
  const nubes = new Map(categorias.map((c) => [c, crearNube(`actor-efecto-${c}`, ESTILO[c])]));
  const grupo = new THREE.Group();
  grupo.name = 'actores-por-efecto';
  grupo.add(...[...nubes.values()].map((n) => n.puntos));
  let mostrados = [];
  function aplicar(escenario, estado) {
    const presentes = new Set(motor.evaluar(estado?.condiciones ?? []).efectos);
    mostrados = conEfecto.filter((n) => nodos.en(n, escenario) && EFECTOS.get(n.actor).some((e) => presentes.has(e)));
    for (const [categoria, nube] of nubes) {
      nube.fijar(mostrados.filter((n) => n.tipo === categoria).map((n) => ({ ruta: crearRuta([[n.x, n.y + ALTO_NODO, n.z]]) })), 1);
      nube.avanzar(0);
    }
  }
  return {
    capa: contenido.red.efectos.actores_efecto.capa,
    grupo,
    nubes: [...nubes.values()],
    rotulos: [],
    aplicar,
    armado: (e) => `${e.escenario}|${e.condiciones.join()}`,
    datos: () => ({ marcadores: mostrados.length, actores: [...new Set(mostrados.map((n) => n.actor))].sort() }),
  };
}
