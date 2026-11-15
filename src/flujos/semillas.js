// Semillas entre custodios (P11, capa «red_semillas»): familias custodias como nodos y arcos de intercambio con
// partículas en ambos sentidos. Custodios y enlaces en contenido/procesos.json (semillas); los de posición propuesta
// van en coordenadas del plano.
import * as THREE from 'three';
import contenido from '../../contenido/procesos.json';
import { ENTIDADES, aMundoX, aMundoZ } from '../terreno/plano.js';
import { crearTrazo } from '../escena/lineas.js';
import { crearNube } from './particulas.js';
import { arco, crearRuta, segmentosDe } from './curvas.js';
import { ESTILO } from './estilo.js';

const ALTO = 3;
const ALTO_NODO = 5;
const ALTO_ROTULO = 20;

const datos = contenido.semillas;

/** superficie: consulta del terreno; ancla(id): posición de una entidad de territorio.json. */
export function crearSemillas({ superficie, altura, ancla }) {
  const custodios = new Map(
    datos.custodios.map((c) => {
      const p = c.ancla ? ancla(c.ancla) : null;
      const x = p ? p.x : aMundoX(c.x);
      const z = p ? p.z : aMundoZ(c.z);
      return [c.id, { ...c, x, z }];
    }),
  );
  const enlaces = datos.enlaces.map(([a, b]) => ({ a: custodios.get(a), b: custodios.get(b) })).filter((e) => e.a && e.b);
  const arcos = enlaces.map((e) => arco(e.a, e.b, superficie, { alto: ALTO, flecha: 0.2 }));
  const nodos = [...custodios.values()].map((c) => crearRuta([[c.x, superficie(c.x, c.z) + ALTO_NODO, c.z]]));

  const nubes = { semillas: crearNube('semillas', ESTILO.semillas), custodio: crearNube('custodio', ESTILO.custodio) };
  const trazo = crearTrazo('semillas', altura, ESTILO.semillas.linea);
  trazo.fijarPuntos(arcos.flatMap((r) => segmentosDe(r)));
  const grupo = new THREE.Group();
  grupo.name = 'flujos-semillas';
  grupo.add(trazo.grupo, nubes.semillas.puntos, nubes.custodio.puntos);

  // Intercambio: cada arco lleva partículas en los dos sentidos.
  const separacion = ESTILO.semillas.separacion * 2;
  function aplicar(escenario, factor) {
    nubes.semillas.fijar(arcos.flatMap((ruta) => [{ ruta, sentido: 1, separacion }, { ruta, sentido: -1, separacion }]), factor);
    nubes.custodio.fijar(nodos.map((ruta) => ({ ruta })), 1);
  }

  // Verificación: enlaces que cruzan el límite departamental y enlaces entre la ladera y el resguardo.
  const limite = ENTIDADES.find((e) => e.tipo === 'limite');
  const zLimite = limite ? aMundoZ(limite.z) : null;
  return {
    capa: datos.capa,
    grupo,
    nubes: Object.values(nubes),
    // Rótulo sobre un custodio («en») o, debajo de él, con «lado: abajo».
    rotulos: datos.rotulos.map((r) => {
      const c = custodios.get(r.en);
      return { ...r, punto: [c.x, superficie(c.x, c.z) + (r.lado === 'abajo' ? 0 : ALTO_ROTULO), c.z] };
    }),
    aplicar,
    datos: () => ({
      custodios: custodios.size,
      enlaces: enlaces.length,
      cruzanLimite: zLimite == null ? 0 : enlaces.filter((e) => (e.a.z - zLimite) * (e.b.z - zLimite) < 0).length,
      entreGrupos: enlaces.filter((e) => e.a.grupo !== e.b.grupo).length,
      segmentos: trazo.cantidad(),
    }),
  };
}
