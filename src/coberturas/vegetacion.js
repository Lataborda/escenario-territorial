// Vegetación natural, de la pastura y del silvopastoreo: una clase instanciada por especie de arboles.js, con dos
// niveles de detalle. Cada unidad tiene posiciones fijas por especie; el tipo de cobertura decide cuántas se ven
// (densidad en tipos.js). La transición, el modo liviano y el nivel de detalle están en instancias.js.
import { crearAzar } from '../util/azar.js';
import { SEMILLA } from '../terreno/relieve.js';
import { LADO } from './unidades.js';
import { BASE } from './teselas.js';
import { TIPOS } from './tipos.js';
import { NINGUNA, LISTA_TIPOS } from './asignacion.js';
import { ARBOLES } from './arboles.js';
import { crearInstancias } from './instancias.js';

const HUNDIMIENTO = 0.5; // la base se hunde en el terreno de ladera

const entre = (azar, [a, b]) => a + (b - a) * azar();
const densidad = (indice, especie) => (indice === NINGUNA ? 0 : TIPOS[LISTA_TIPOS[indice]][especie] ?? 0);
const visibles = (u, indice, especie) => Math.round((u.area * densidad(indice, especie)) / 100);

function barajar(lista, azar) {
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
}

// Posiciones de una especie en todas las unidades, en orden aleatorio global (modo liviano uniforme).
function generarPuestos(especie, { centros, unidades }, asignaciones, altura, azar) {
  const puestos = [];
  const forma = ARBOLES[especie];
  for (const u of unidades) {
    let maximo = 0;
    for (const a of asignaciones.values()) maximo = Math.max(maximo, visibles(u, a[u.indice], especie));
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
        ancho: entre(azar, forma.ancho),
        alto: entre(azar, forma.alto),
        tinte: forma.tintes[Math.floor(azar() * forma.tintes.length)],
        matiz: 0.88 + 0.22 * azar(),
        retardo: 0.7 * u.retardo + 0.3 * azar(),
      });
    }
  }
  return barajar(puestos, azar);
}

export function crearVegetacion(datos, asignaciones, altura) {
  const azar = crearAzar(SEMILLA + 91);
  const clases = Object.keys(ARBOLES)
    .map((especie) => ({ especie, puestos: generarPuestos(especie, datos, asignaciones, altura, azar) }))
    .filter(({ puestos }) => puestos.length)
    .map(({ especie, puestos }) =>
      crearInstancias({
        id: especie,
        puestos,
        mallas: ARBOLES[especie].mallas(),
        umbral: ARBOLES[especie].umbral,
        visible: (e, indice) => e.rango < visibles(e.u, indice, especie),
        colorDe: (e, indice, tinte) => tinte.setHex(e.tinte).multiplyScalar(e.matiz),
      }),
    );
  return {
    clases,
    mallas: clases.flatMap((c) => c.mallas),
    preparar: (asignacion) => clases.reduce((suma, c) => suma + c.preparar(asignacion), 0),
    avanzar: (t, progreso) => clases.reduce((suma, c) => suma + c.avanzar(t, progreso), 0),
    liviano: (activo) => clases.forEach((c) => c.liviano(activo)),
    mirar: (...a) => clases.reduce((cambio, c) => c.mirar(...a) || cambio, false),
    arreglos: () => clases.flatMap((c) => c.arreglos()),
  };
}
