// Vegetación instanciada de la etapa 5.a: árboles (copa y tronco), guadua, juncos y frailejones, una malla por
// geometría. Cada unidad tiene posiciones fijas; el tipo de cobertura decide cuántas se ven (densidad) y el color
// de la copa. La transición y el modo liviano están en instancias.js.
import { crearAzar } from '../util/azar.js';
import { SEMILLA } from '../terreno/relieve.js';
import { LADO } from './unidades.js';
import { BASE } from './teselas.js';
import { TIPOS, VEGETACION } from './tipos.js';
import { NINGUNA, LISTA_TIPOS } from './asignacion.js';
import { crearCopa, crearTronco, crearGuadua, crearJunco, crearFrailejon } from './geometrias.js';
import { crearInstancias } from './instancias.js';

const HUNDIMIENTO = 0.5; // la base se hunde en el terreno de ladera

// Escala [mínima, máxima] y proporción de la copa [ancho, alto] por clase de elemento y zona.
const FORMAS = {
  arbol: { escala: [2.5, 3.5], montana: { ancho: [1, 1.2], alto: [1.3, 1.65] }, plano: { ancho: [1, 1.25], alto: [0.72, 0.92] } },
  guadua: { escala: [0.9, 1.25] },
  junco: { escala: [0.8, 1.3] },
  frailejon: { escala: [1.1, 1.7] },
};

const CLASES = [
  { id: 'arbol', mallas: [{ crear: crearCopa, sombra: true, color: true }, { crear: crearTronco, color: VEGETACION.tronco }] },
  { id: 'guadua', mallas: [{ crear: crearGuadua, sombra: true, color: true }], fijo: VEGETACION.guadua },
  { id: 'junco', mallas: [{ crear: crearJunco, color: true }], fijo: VEGETACION.junco },
  { id: 'frailejon', mallas: [{ crear: crearFrailejon, sombra: true, color: true, porVertice: true }], fijo: 0xffffff },
];

const entre = (azar, [a, b]) => a + (b - a) * azar();
const densidad = (indice, clase) => (indice === NINGUNA ? 0 : TIPOS[LISTA_TIPOS[indice]][clase] ?? 0);
const visibles = (u, indice, clase) => Math.round((u.area * densidad(indice, clase)) / 100);

function barajar(lista, azar) {
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
}

// Posiciones de una clase de elemento en todas las unidades, en orden aleatorio global (modo liviano uniforme).
function generarPuestos(clase, { centros, unidades }, asignaciones, altura, azar) {
  const puestos = [];
  const forma = FORMAS[clase];
  for (const u of unidades) {
    let maximo = 0;
    for (const a of asignaciones.values()) maximo = Math.max(maximo, visibles(u, a[u.indice], clase));
    const montana = u.clase === 'celdas' || u.zona === 'ladera';
    const proporcion = forma[montana ? 'montana' : 'plano'];
    for (let rango = 0; rango < maximo; rango++) {
      const t = u.teselas[Math.floor(azar() * u.teselas.length)];
      const x = centros.x(t % centros.columnas) + (azar() - 0.5) * LADO * 0.9;
      const z = centros.z(Math.floor(t / centros.columnas)) + (azar() - 0.5) * LADO * 0.9;
      puestos.push({
        u,
        rango,
        x,
        y: altura(x, z) + (u.teselado ? BASE : -HUNDIMIENTO),
        z,
        giro: azar() * Math.PI * 2,
        escala: entre(azar, forma.escala),
        ancho: proporcion ? entre(azar, proporcion.ancho) : 1,
        alto: proporcion ? entre(azar, proporcion.alto) : 1,
        matiz: 0.88 + 0.24 * azar(),
        retardo: 0.7 * u.retardo + 0.3 * azar(),
      });
    }
  }
  return barajar(puestos, azar);
}

function crearClase(def, datos, asignaciones, altura, azar) {
  return crearInstancias({
    id: def.id,
    puestos: generarPuestos(def.id, datos, asignaciones, altura, azar),
    mallas: def.mallas.map((m) => ({
      lejos: m.crear(),
      material: { flatShading: true, roughness: 0.9, vertexColors: Boolean(m.porVertice), ...(typeof m.color === 'number' ? { color: m.color } : {}) },
      sombra: m.sombra,
      colorInstancia: m.color === true,
    })),
    visible: (e, indice) => e.rango < visibles(e.u, indice, def.id),
    colorDe: (e, indice, tinte) => tinte.setHex(def.fijo ?? TIPOS[LISTA_TIPOS[indice]].copa ?? 0xffffff).multiplyScalar(e.matiz),
  });
}

export function crearVegetacion(datos, asignaciones, altura) {
  const azar = crearAzar(SEMILLA + 91);
  const clases = CLASES.map((def) => crearClase(def, datos, asignaciones, altura, azar));
  return {
    clases,
    mallas: clases.flatMap((c) => c.mallas),
    preparar: (asignacion) => clases.reduce((suma, c) => suma + c.preparar(asignacion), 0),
    avanzar: (t, progreso) => clases.reduce((suma, c) => suma + c.avanzar(t, progreso), 0),
    liviano: (activo) => clases.forEach((c) => c.liviano(activo)),
    arreglos: () => clases.flatMap((c) => c.arreglos()),
  };
}
