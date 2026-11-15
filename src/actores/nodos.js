// Nodos de la red (contenido/actores.json, red.nodos): mercados, familias productoras y aliados, con su posición en
// la escena (ancla de territorio.json o coordenadas del plano) y los escenarios en que existen.
import contenido from '../../contenido/actores.json';
import { ENTIDADES, aMundoX, aMundoZ } from '../terreno/plano.js';

/** superficie: consulta del terreno; ancla(id): posición de una entidad de territorio.json. */
export function crearNodos({ superficie, ancla }) {
  const mapa = new Map(
    contenido.red.nodos.map((n) => {
      const p = n.ancla ? ancla(n.ancla) : null;
      const x = p ? p.x : aMundoX(n.x);
      const z = p ? p.z : aMundoZ(n.z);
      return [n.id, { ...n, x, z, y: superficie(x, z) }];
    }),
  );
  const en = (n, escenario) => !n.escenarios || n.escenarios.includes(escenario);
  const limite = ENTIDADES.find((e) => e.tipo === 'limite');
  return {
    de: (id) => mapa.get(id),
    en,
    /** Nodos que representan a un actor de la lista (campo «actor»): los dibuja marcadores.js. */
    actores: () => [...mapa.values()].filter((n) => n.actor),
    /** Nodos presentes en el escenario, de los tipos indicados (todos si se omite). */
    lista: (escenario, tipos) => [...mapa.values()].filter((n) => en(n, escenario) && (!tipos || tipos.includes(n.tipo))),
    // Límite departamental en la escena (z), para la verificación y el polígono.
    zLimite: limite ? aMundoZ(limite.z) : null,
  };
}
