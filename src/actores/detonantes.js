// Rótulo de los detonantes (capa «detonantes», etapa 10.b.b): con el panel de condiciones, un solo rótulo que nombra
// los detonantes activos (crisis, discurso movilizador) sin cambio del paisaje. Uno solo, para no pasar de siete
// rótulos con todas las condiciones. Punto, texto y títulos en contenido/actores.json (red.efectos.detonantes): el
// título es el de la entrada cuyas condiciones coinciden con las activas entre las listadas; sin ninguna, no se ve.
import * as THREE from 'three';
import contenido from '../../contenido/actores.json';
import { obtener } from '../estado.js';

const ALTO_ROTULO = 22;
const datos = contenido.red.efectos.detonantes;
const listadas = [...new Set(datos.titulos.flatMap((t) => t.condiciones))];
const clave = (ids) => [...ids].sort().join();

/** Título del rótulo para unas condiciones activas, o null. */
export function tituloDetonante(condiciones = []) {
  const activas = clave(listadas.filter((c) => condiciones.includes(c)));
  return datos.titulos.find((t) => clave(t.condiciones) === activas)?.titulo ?? null;
}

/** nodos: crearNodos(). */
export function crearDetonantes({ nodos }) {
  const n = nodos.de(datos.en);
  const grupo = new THREE.Group();
  grupo.name = 'actores-detonantes';
  return {
    capa: datos.capa,
    grupo,
    nubes: [],
    rotulos: n
      ? [
          {
            id: 'detonante',
            titulo: '',
            texto: datos.texto,
            lado: datos.lado,
            punto: [n.x, n.y + (datos.alto ?? (datos.lado === 'abajo' ? 0 : ALTO_ROTULO)), n.z],
            tituloDe: (e) => tituloDetonante(e.condiciones),
          },
        ]
      : [],
    aplicar() {},
    datos: () => ({ titulo: tituloDetonante(obtener().condiciones) }),
  };
}
