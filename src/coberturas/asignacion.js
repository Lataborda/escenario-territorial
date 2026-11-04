// Asignación de coberturas por escenario. En cada grupo (zona y clase de unidad) los tipos toman, en el orden
// de ASIGNACION, la fracción pedida de las unidades según su criterio. Cada criterio da un orden fijo:
// entre escenarios cambian solo las unidades necesarias.
import { crearAzar, crearRuidos } from '../util/azar.js';
import { ENTIDADES, aMundoX, aMundoZ } from '../terreno/plano.js';
import { SEMILLA } from '../terreno/relieve.js';
import { ASIGNACION, TIPOS } from './tipos.js';

export const LISTA_TIPOS = Object.keys(TIPOS);
export const NINGUNA = 255;
export const INDICE = new Map(LISTA_TIPOS.map((t, i) => [t, i]));

// Semilla numérica estable a partir de un texto.
function semillaDe(texto) {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 0x01000193) >>> 0;
  return (h ^ SEMILLA) >>> 0;
}

function barajar(lista, azar) {
  const r = [...lista];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

// Orden aleatorio con distancia mínima decreciente: con fracción baja, unidades separadas entre sí.
function dispersar(unidades, { radio, lejosDeCauces = 0 }, azar) {
  const pendientes = barajar(unidades, azar);
  const orden = [];
  const tomada = new Set();
  for (const r of [radio, radio / 2, radio / 4, 0]) {
    for (const u of pendientes) {
      if (tomada.has(u)) continue;
      if (r > radio / 4 && u.cauce < lejosDeCauces) continue;
      if (orden.some((o) => Math.hypot(o.x - u.x, o.z - u.z) < r)) continue;
      orden.push(u);
      tomada.add(u);
    }
  }
  return orden;
}

function crearCriterios(altura) {
  const ruidos = crearRuidos(SEMILLA + 7, ['manchas', 'occidente']);
  const posicion = (id) => {
    const e = ENTIDADES.find((x) => x.id === id);
    return { x: aMundoX(e.x), z: aMundoZ(e.z) };
  };
  const porClave = (lista, clave) => lista.map((u) => [clave(u), u]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);
  return {
    cercania: (lista, regla) => {
      const p = posicion(regla.entidad);
      return porClave(lista, (u) => Math.hypot(u.x - p.x, u.z - p.z));
    },
    dispersion: (lista, regla, azar) => dispersar(lista, regla, azar),
    // Las celdas más altas primero: con fracción menor, el bosque se retira desde abajo.
    altitud: (lista) => porClave(lista, (u) => -altura(u.x, u.z)),
    // La caña prefiere el plano abierto, lejos del piedemonte.
    occidente: (lista) => porClave(lista, (u) => u.x + 70 * ruidos.occidente(u.x / 160, u.z / 160)),
    manchas: (lista, { escala = 230, desfase = 0 }) => porClave(lista, (u) => ruidos.manchas(u.x / escala + desfase, u.z / escala)),
    cota: (lista, { ruido = 0, desfase = 0 }) => porClave(lista, (u) => altura(u.x, u.z) + ruido * ruidos.manchas(u.x / 120 + desfase, u.z / 120)),
    azar: (lista, regla, azar) => barajar(lista, azar),
  };
}

// Toma hasta k unidades libres en el orden dado y les asigna el tipo.
function tomar(orden, k, libre, asignacion, tipo) {
  const tomadas = [];
  for (const u of orden) {
    if (tomadas.length >= k) break;
    if (!libre.has(u)) continue;
    libre.delete(u);
    asignacion[u.indice] = INDICE.get(tipo);
    tomadas.push(u);
  }
  return tomadas;
}

// Devuelve Map id de escenario -> Uint8Array con el índice del tipo de cada unidad (NINGUNA si no tiene).
export function asignarEscenarios({ unidades }, escenarios, altura) {
  const criterios = crearCriterios(altura);
  const grupos = new Map();
  for (const u of unidades) {
    if (u.clase === 'reservas') continue;
    const clave = `${u.zona}.${u.clase}`;
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(u);
  }
  // Órdenes fijos por grupo y criterio, calculados una sola vez.
  const cache = new Map();
  const ordenDe = (clave, lista, regla) => {
    const id = `${clave}|${regla.tipo}|${regla.criterio}`;
    if (!cache.has(id)) cache.set(id, criterios[regla.criterio](lista, regla, crearAzar(semillaDe(id))));
    return cache.get(id);
  };

  const resultado = new Map();
  for (const escenario of escenarios) {
    const asignacion = new Uint8Array(unidades.length).fill(NINGUNA);
    for (const u of unidades) if (u.cobertura) asignacion[u.indice] = INDICE.get(u.cobertura);
    for (const [clave, lista] of grupos) {
      const [zona, clase] = clave.split('.');
      const fracciones = escenario.coberturas?.[zona]?.[clase] ?? {};
      const libre = new Set(lista);
      for (const regla of ASIGNACION) {
        const propia = fracciones[regla.tipo] ?? 0;
        const organica = regla.organica ? fracciones[regla.organica.tipo] ?? 0 : 0;
        if (propia + organica <= 0) continue;
        const familia = tomar(ordenDe(clave, lista, regla), Math.round((propia + organica) * lista.length), libre, asignacion, regla.tipo);
        if (organica > 0) {
          // Dentro de la familia: la caña en manejo orgánico ocupa parte de la misma extensión.
          const dentro = new Set(familia);
          const orden = ordenDe(clave, lista, regla.organica).filter((u) => dentro.has(u));
          tomar(orden, Math.round(organica * lista.length), dentro, asignacion, regla.organica.tipo);
        }
      }
    }
    resultado.set(escenario.id, asignacion);
  }
  return resultado;
}

export const tipoDe = (indice) => (indice === NINGUNA ? null : LISTA_TIPOS[indice]);
