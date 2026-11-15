// Agua y sedimentos (P09, capa «escorrentia_sedimentos»): agua que baja por los cauces hasta el río Cauca y rutas de
// escorrentía que descienden por la pendiente de la ladera y el piedemonte hasta el cauce más cercano. Cada ruta
// toma la clase de la cobertura de su punto de origen en el escenario actual (contenido/procesos.json, escorrentia):
// bajo cobertura arbórea llega agua clara; sin ella, el sedimento sigue por el cauce, que carga más aguas abajo.
import * as THREE from 'three';
import contenido from '../../contenido/procesos.json';
import { rejillaTeselas } from '../coberturas/rejilla.js';
import { dentro, zona, aMundoX, aMundoZ } from '../terreno/plano.js';
import { crearAzar } from '../util/azar.js';
import { crearTrazo } from '../escena/lineas.js';
import { crearNube } from './particulas.js';
import { sobreRelieve, descenso, aguasAbajo, segmentosDe } from './curvas.js';
import { ESTILO } from './estilo.js';

const SEMILLA = 8101;
const ALTO = 1.4; // sobre la superficie
const INTENTOS = 120; // puntos de origen que se prueban por ruta
const TRAMO_MINIMO = 12; // puntos de la ruta de ladera (unos 48 unidades)
const MARGEN = 0.03; // franja del borde norte y sur sin puntos de origen (fracción del plano)
const SEPARACION_CAUCE = 46; // entre partículas de sedimento de una misma ruta

const datos = contenido.escorrentia;
const CLASE_DE = new Map(datos.clases.flatMap((c) => c.coberturas.map((t) => [t, c.id])));

/** altura y superficie: consultas del terreno; coberturas: módulo de coberturas (tipoEn). */
export function crearAgua({ altura, superficie, coberturas }) {
  const { rios } = rejillaTeselas().cauces;
  const cauces = rios
    .map((r) => r.muestras.filter((m, k) => dentro(m.x, m.z) && k % 2 === 0).map((m) => [m.x, m.z]))
    .filter((xz) => xz.length > 1)
    .map((xz) => sobreRelieve(xz, superficie, ALTO));

  // Puntos de origen repartidos de norte a sur, con cobertura clasificada y ruta que llega a un cauce.
  const franjas = datos.zonas.map((id) => zona(id));
  const desde = Math.min(...franjas.map((f) => f.desde));
  const hasta = Math.max(...franjas.map((f) => f.hasta));
  const azar = crearAzar(SEMILLA);
  const escorrentias = [];
  // Prueba un punto de origen en la franja [v0, v1] del plano; true si su ruta llega a un cauce.
  const probar = (v0, v1) => {
    const x = aMundoX(desde + (hasta - desde) * azar());
    const z = aMundoZ(v0 + (v1 - v0) * azar());
    if (!CLASE_DE.has(coberturas.tipoEn(x, z, 'S0'))) return false;
    const d = descenso(x, z, altura);
    if (!d || d.xz.length < TRAMO_MINIMO) return false;
    escorrentias.push({
      x,
      z,
      ladera: sobreRelieve(d.xz, superficie, ALTO),
      completa: sobreRelieve([...d.xz, ...aguasAbajo(d.rio, d.posicion)], superficie, ALTO),
    });
    return true;
  };
  // Una ruta por franja de norte a sur; las franjas sin ruta se reponen con puntos de origen libres.
  const ancho = (1 - 2 * MARGEN) / datos.rutas;
  for (let k = 0; k < datos.rutas; k++) {
    for (let intento = 0; intento < INTENTOS; intento++) if (probar(MARGEN + k * ancho, MARGEN + (k + 1) * ancho)) break;
  }
  for (let intento = 0; escorrentias.length < datos.rutas && intento < INTENTOS * 20; intento++) probar(MARGEN, 1 - MARGEN);
  const clase = (e, escenario) => CLASE_DE.get(coberturas.tipoEn(e.x, e.z, escenario)) ?? 'agua';
  const conSedimento = (escenario) => escorrentias.filter((e) => clase(e, escenario) === 'sedimento');

  const nubes = { agua: crearNube('agua', ESTILO.agua), sedimento: crearNube('sedimento', ESTILO.sedimento) };
  const trazos = {
    agua: crearTrazo('escorrentia-agua', altura, ESTILO.agua.linea),
    sedimento: crearTrazo('escorrentia-sedimento', altura, ESTILO.sedimento.linea),
  };
  const grupo = new THREE.Group();
  grupo.name = 'flujos-agua';
  grupo.add(trazos.agua.grupo, trazos.sedimento.grupo, nubes.agua.puntos, nubes.sedimento.puntos);

  let pardas = [];
  function aplicar(escenario, factor) {
    pardas = conSedimento(escenario);
    const claras = escorrentias.filter((e) => !pardas.includes(e));
    nubes.agua.fijar([...cauces.map((ruta) => ({ ruta, dispersion: 2 })), ...claras.map((e) => ({ ruta: e.ladera }))], factor);
    nubes.sedimento.fijar(pardas.map((e) => ({ ruta: e.completa, dispersion: 2.5, separacion: SEPARACION_CAUCE })), factor);
    trazos.agua.fijarPuntos(claras.flatMap((e) => segmentosDe(e.ladera)));
    trazos.sedimento.fijarPuntos(pardas.flatMap((e) => segmentosDe(e.ladera)));
    for (const t of Object.values(trazos)) t.grupo.visible = !t.grupo.userData.vacio;
  }

  return {
    capa: datos.capa,
    grupo,
    nubes: Object.values(nubes),
    rotulos: [],
    aplicar,
    datos: () => ({
      cauces: cauces.length,
      rutas: escorrentias.length,
      pedidas: datos.rutas,
      conSedimento: pardas.length,
      // Rutas con sedimento por escenario, sin cambiar el estado.
      sedimentoEn: Object.fromEntries(['S0', 'S1', 'S2', 'S3'].map((id) => [id, conSedimento(id).length])),
      segmentos: trazos.agua.cantidad() + trazos.sedimento.cantidad(),
    }),
  };
}
