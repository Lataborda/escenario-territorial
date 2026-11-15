// Nutrientes de las fincas a la ciudad (P10, capa «flujos_nutrientes»): arcos de las fincas tipo y de parcelas de
// posición propuesta hacia la ciudad, con partículas en un solo sentido. En los escenarios con retorno
// (contenido/procesos.json, nutrientes.retorno) aparecen los arcos de regreso, combados hacia el otro costado.
import * as THREE from 'three';
import contenido from '../../contenido/procesos.json';
import { aMundoX, aMundoZ } from '../terreno/plano.js';
import { crearTrazo } from '../escena/lineas.js';
import { crearNube } from './particulas.js';
import { arco, segmentosDe } from './curvas.js';
import { ESTILO } from './estilo.js';

const ALTO = 3;
const COMBA = 0.6; // costado de la ida; el retorno toma el opuesto

const datos = contenido.nutrientes;

/** superficie: consulta del terreno; ancla(id): posición de una entidad de territorio.json. */
export function crearNutrientes({ superficie, altura, ancla }) {
  const lugar = (o) => {
    const p = o.ancla ? ancla(o.ancla) : null;
    return p ? { x: p.x, z: p.z } : { x: aMundoX(o.x), z: aMundoZ(o.z) };
  };
  const ciudad = lugar({ ancla: datos.destino });
  const origenes = datos.origenes.map(lugar);
  const idas = origenes.map((o) => arco(o, ciudad, superficie, { alto: ALTO, lado: COMBA }));
  const vueltas = origenes.map((o) => arco(ciudad, o, superficie, { alto: ALTO, lado: COMBA }));

  const nubes = { nutrientes: crearNube('nutrientes', ESTILO.nutrientes), retorno: crearNube('retorno', ESTILO.retorno) };
  const trazos = {
    nutrientes: crearTrazo('nutrientes', altura, ESTILO.nutrientes.linea),
    retorno: crearTrazo('nutrientes-retorno', altura, ESTILO.retorno.linea),
  };
  trazos.nutrientes.fijarPuntos(idas.flatMap((r) => segmentosDe(r)));
  const grupo = new THREE.Group();
  grupo.name = 'flujos-nutrientes';
  grupo.add(trazos.nutrientes.grupo, trazos.retorno.grupo, nubes.nutrientes.puntos, nubes.retorno.puntos);

  let conRetorno = false;
  function aplicar(escenario, factor) {
    conRetorno = datos.retorno.escenarios.includes(escenario);
    nubes.nutrientes.fijar(idas.map((ruta) => ({ ruta })), factor);
    nubes.retorno.fijar(conRetorno ? vueltas.map((ruta) => ({ ruta })) : [], factor);
    trazos.retorno.fijarPuntos(conRetorno ? vueltas.flatMap((r) => segmentosDe(r)) : []);
    trazos.retorno.grupo.visible = conRetorno;
  }

  return {
    capa: datos.capa,
    grupo,
    nubes: Object.values(nubes),
    rotulos: datos.rotulos.map((r) => {
      const p = ancla(r.ancla);
      return { ...r, punto: [p.x, p.y, p.z] };
    }),
    aplicar,
    datos: () => ({
      origenes: origenes.length,
      retorno: conRetorno,
      arcos: idas.length + (conRetorno ? vueltas.length : 0),
      segmentos: trazos.nutrientes.cantidad() + trazos.retorno.cantidad(),
    }),
  };
}
