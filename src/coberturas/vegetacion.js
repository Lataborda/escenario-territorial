// Vegetación instanciada: árboles (copa y tronco), guadua, juncos y frailejones, una malla por geometría.
// Cada unidad tiene posiciones fijas; el tipo de cobertura decide cuántas se ven (densidad) y el color de la copa.
import * as THREE from 'three';
import { crearAzar } from '../util/azar.js';
import { SEMILLA } from '../terreno/relieve.js';
import { LADO } from './unidades.js';
import { BASE } from './teselas.js';
import { TIPOS, VEGETACION } from './tipos.js';
import { NINGUNA, LISTA_TIPOS } from './asignacion.js';
import { crearCopa, crearTronco, crearGuadua, crearJunco, crearFrailejon } from './geometrias.js';

const FRACCION_LIVIANO = 0.5; // instancias que quedan en el modo liviano
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
  const puestos = generarPuestos(def.id, datos, asignaciones, altura, azar);
  const n = puestos.length;
  const mallas = def.mallas.map((m) => {
    const material = new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.9, vertexColors: Boolean(m.porVertice) });
    if (typeof m.color === 'number') material.color.setHex(m.color);
    const malla = new THREE.InstancedMesh(m.crear(), material, Math.max(n, 1));
    malla.name = `vegetacion-${def.id}`;
    malla.castShadow = Boolean(m.sombra);
    malla.frustumCulled = false;
    if (m.color === true) malla.setColorAt(0, new THREE.Color());
    return malla;
  });
  const coloreadas = mallas.filter((_, k) => def.mallas[k].color === true);
  const vis = { v: new Float32Array(n), v0: new Float32Array(n), v1: new Float32Array(n) };
  const color = { c: new Float32Array(n * 3), c0: new Float32Array(n * 3), c1: new Float32Array(n * 3) };
  const matriz = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const eje = new THREE.Vector3(0, 1, 0);
  const p = new THREE.Vector3();
  const s = new THREE.Vector3();
  const tinte = new THREE.Color();
  let cambian = [];
  // Solo se dibujan los puestos visibles o en transición: posicionDe da su lugar en la malla (−1 si no se dibuja).
  const posicionDe = new Int32Array(n).fill(-1);
  let activos = 0;
  let enLiviano = false;

  function escribir(i) {
    const lugar = posicionDe[i];
    if (lugar < 0) return;
    const e = puestos[i];
    const k = e.escala * vis.v[i];
    matriz.compose(p.set(e.x, e.y, e.z), q.setFromAxisAngle(eje, e.giro), s.set(k * e.ancho, k * e.alto, k * e.ancho));
    for (const m of mallas) m.setMatrixAt(lugar, matriz);
    tinte.setRGB(color.c[i * 3], color.c[i * 3 + 1], color.c[i * 3 + 2]);
    for (const m of coloreadas) m.setColorAt(lugar, tinte);
  }

  const contar = () => {
    for (const m of mallas) m.count = enLiviano ? Math.ceil(activos * FRACCION_LIVIANO) : activos;
  };

  // Lleva al frente los puestos que cumplen la condición, en el orden aleatorio global (liviano uniforme).
  // El resto de los arreglos queda en cero: el estado no depende del camino recorrido.
  function compactar(incluir) {
    activos = 0;
    for (let i = 0; i < n; i++) posicionDe[i] = incluir(i) ? activos++ : -1;
    for (let i = 0; i < n; i++) escribir(i);
    for (const m of mallas) {
      m.instanceMatrix.array.fill(0, activos * 16);
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) {
        m.instanceColor.array.fill(0, activos * 3);
        m.instanceColor.needsUpdate = true;
      }
    }
    contar();
  }

  compactar(() => false);

  return {
    id: def.id,
    mallas,
    total: n,
    preparar(asignacion) {
      vis.v0.set(vis.v);
      color.c0.set(color.c);
      cambian = [];
      puestos.forEach((e, i) => {
        const indice = asignacion[e.u.indice];
        vis.v1[i] = e.rango < visibles(e.u, indice, def.id) ? 1 : 0;
        if (vis.v1[i]) {
          tinte.setHex(def.fijo ?? TIPOS[LISTA_TIPOS[indice]].copa ?? 0xffffff).multiplyScalar(e.matiz);
          color.c1.set([tinte.r, tinte.g, tinte.b], i * 3);
          if (vis.v0[i] === 0) color.c0.set(color.c1.subarray(i * 3, i * 3 + 3), i * 3);
        } else color.c1.set(color.c.subarray(i * 3, i * 3 + 3), i * 3);
        const igual = vis.v1[i] === vis.v[i] && color.c1.subarray(i * 3, i * 3 + 3).every((x, k) => x === color.c[i * 3 + k]);
        if (!igual) cambian.push(i);
      });
      compactar((i) => vis.v[i] > 0 || vis.v1[i] > 0);
      return cambian.length;
    },
    avanzar(t, progreso) {
      let intermedias = 0;
      for (const i of cambian) {
        const f = progreso(t, puestos[i].retardo);
        // Al final se copia la llegada: el estado coincide con el de una carga directa.
        const mezcla = (a, b) => (f >= 1 ? b : a + (b - a) * f);
        vis.v[i] = mezcla(vis.v0[i], vis.v1[i]);
        // Al quedar oculto, el color vuelve a cero: el estado no depende del camino recorrido.
        const oculto = f >= 1 && vis.v1[i] === 0;
        for (let k = 0; k < 3; k++) color.c[i * 3 + k] = oculto ? 0 : mezcla(color.c0[i * 3 + k], color.c1[i * 3 + k]);
        if (f > 0 && f < 1) intermedias += 1;
        escribir(i);
      }
      if (!cambian.length) return 0;
      // Al terminar, los puestos ocultos dejan de dibujarse.
      if (t >= 1) compactar((i) => vis.v[i] > 0);
      for (const m of mallas) {
        m.instanceMatrix.needsUpdate = true;
        if (m.instanceColor) m.instanceColor.needsUpdate = true;
      }
      return intermedias;
    },
    liviano(activo) {
      enLiviano = activo;
      contar();
    },
    visiblesAhora: () => vis.v.reduce((a, x) => a + (x > 0.5 ? 1 : 0), 0),
    arreglos: () => mallas.flatMap((m) => [m.instanceMatrix.array, ...(m.instanceColor ? [m.instanceColor.array] : [])]),
  };
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
