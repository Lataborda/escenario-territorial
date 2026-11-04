// Terreno de la cuenca: relieve, agua, bloque recortado, límite departamental y anclas.
// Exporta altura(x, z), superficie(x, z) y las anclas para los demás módulos.
import * as THREE from 'three';
import { ENTIDADES, crearRejilla, crearConsulta } from './plano.js';
import { trazarRios, nivelAgua, puntoDelRio } from './hidrografia.js';
import { calcularRelieve } from './relieve.js';
import { colorearTerreno } from './colores.js';
import { crearSuperficie, crearAgua } from './malla.js';
import { crearBloque } from './bloque.js';
import { crearLimite } from './limite.js';
import { calcularAnclas, crearMarcadores, revisarAnclas } from './anclas.js';
import { huella } from '../util/azar.js';

const PASO_REJILLA = 3; // separación de vértices en unidades de escena

let actual = null;

export function generarTerreno({ exageracion = 2, mostrarAnclas = false } = {}) {
  const rejilla = crearRejilla(PASO_REJILLA);
  const rios = trazarRios();
  const relieve = calcularRelieve(rejilla, rios);
  const alturasMundo = relieve.alturas.map((h) => h * exageracion);
  const nivelesMundo = relieve.niveles.map((h) => h * exageracion);

  const consultaAltura = crearConsulta(rejilla, alturasMundo);
  const nivel = (x, z) => {
    const n = nivelAgua(rios, x, z);
    return n == null ? null : n * exageracion;
  };
  const superficie = (x, z) => Math.max(consultaAltura(x, z), nivel(x, z) ?? -Infinity);

  const grupo = new THREE.Group();
  grupo.name = 'terreno';
  const malla = crearSuperficie(rejilla, alturasMundo, colorearTerreno(rejilla, relieve));
  const agua = crearAgua(rios, exageracion);
  grupo.add(malla, agua, crearBloque(rejilla, alturasMundo, nivelesMundo));

  const limite = ENTIDADES.find((e) => e.tipo === 'limite');
  if (limite) grupo.add(crearLimite(limite, superficie));

  const anclas = calcularAnclas(ENTIDADES, {
    superficie,
    puntoDelRio: (id, x, z) => puntoDelRio(rios, id, x, z),
  });
  const marcadores = crearMarcadores(anclas, mostrarAnclas);
  grupo.add(marcadores);

  actual = {
    exageracion,
    rejilla,
    altura: consultaAltura,
    superficie,
    anclas,
    marcadores,
    revisar: () => revisarAnclas(anclas, [malla, agua]),
    huella: huella([alturasMundo, nivelesMundo.map((n) => (Number.isNaN(n) ? -1 : n)), agua.geometry.attributes.position.array]),
  };
  return grupo;
}

// Altura del terreno (sin agua) en coordenadas de escena.
export const altura = (x, z) => (actual ? actual.altura(x, z) : 0);

// Altura de la superficie visible: terreno o lámina de agua.
export const superficie = (x, z) => (actual ? actual.superficie(x, z) : 0);

// Posición de un ancla de territorio.json sobre la superficie (copia), o null.
export const ancla = (id) => actual?.anclas.get(id)?.clone() ?? null;

export const datosTerreno = () =>
  actual && {
    exageracion: actual.exageracion,
    huella: actual.huella,
    vertices: actual.rejilla.total,
    anclas: actual.anclas.size,
    anclasVisibles: actual.marcadores.visible,
  };

export const revisarAnclasTerreno = () => (actual ? actual.revisar() : null);
