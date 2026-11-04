// Elementos instanciados de la vegetación, con transición de escenario y, si la especie lo pide, dos niveles de
// detalle. Cada puesto tiene lugar fijo; visible(puesto, indiceTipo) decide si se ve con una asignación y
// colorDe(puesto, indiceTipo, tinte) da su tinte. Solo se dibujan los puestos visibles o en transición. Con dos
// niveles, cada puesto va a la malla «cerca» o «lejos» según la distancia de su celda a la cámara (detalle.js).
import * as THREE from 'three';
import { celdaDe } from './detalle.js';

const FRACCION_LIVIANO = 0.5; // instancias que quedan en el modo liviano

export function crearInstancias({ id, puestos, mallas, visible, colorDe, umbral = 0 }) {
  const n = puestos.length;
  const niveles = umbral > 0 && mallas.some((m) => m.cerca) ? 2 : 1;
  // Una malla instanciada por forma y nivel: grupos[forma][nivel].
  const grupos = mallas.map((m) => {
    const material = new THREE.MeshStandardMaterial(m.material);
    const geometrias = niveles === 2 ? [m.lejos, m.cerca ?? m.lejos] : [m.lejos];
    return geometrias.map((g, nivel) => {
      const malla = new THREE.InstancedMesh(g, material, Math.max(n, 1));
      malla.name = `vegetacion-${id}${niveles === 2 ? ['-lejos', '-cerca'][nivel] : ''}`;
      malla.castShadow = m.sombra === true || (m.sombra === 'cerca' && nivel === 1); // 'cerca': solo el nivel cercano
      malla.receiveShadow = Boolean(m.recibe);
      malla.frustumCulled = false;
      if (m.colorInstancia) malla.setColorAt(0, new THREE.Color());
      return malla;
    });
  });
  const deNivel = [0, 1].slice(0, niveles).map((k) => grupos.map((g) => g[k]));
  const coloreadas = deNivel.map((lista) => lista.filter((_, f) => mallas[f].colorInstancia));

  const vis = { v: new Float32Array(n), v0: new Float32Array(n), v1: new Float32Array(n) };
  const color = { c: new Float32Array(n * 3), c0: new Float32Array(n * 3), c1: new Float32Array(n * 3) };
  const posicionDe = new Int32Array(n).fill(-1); // lugar en su malla; −1 si no se dibuja
  const nivelDe = new Uint8Array(n);
  const celdas = Int32Array.from(puestos, (e) => celdaDe(e.x, e.z));
  const propias = [...new Set(celdas)];
  const marcas = new Uint8Array(propias.length);
  let cercanas = new Set();
  const activos = [0, 0];
  let enLiviano = false;
  let cambian = [];
  const matriz = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const eje = new THREE.Vector3(0, 1, 0);
  const p = new THREE.Vector3();
  const s = new THREE.Vector3();
  const tinte = new THREE.Color();

  function escribir(i) {
    const lugar = posicionDe[i];
    if (lugar < 0) return;
    const e = puestos[i];
    const k = e.escala * vis.v[i];
    matriz.compose(p.set(e.x, e.y, e.z), q.setFromAxisAngle(eje, e.giro), s.set(k * e.ancho, k * e.alto, k * e.ancho));
    for (const m of deNivel[nivelDe[i]]) m.setMatrixAt(lugar, matriz);
    tinte.setRGB(color.c[i * 3], color.c[i * 3 + 1], color.c[i * 3 + 2]);
    for (const m of coloreadas[nivelDe[i]]) m.setColorAt(lugar, tinte);
  }

  const contar = () => {
    deNivel.forEach((lista, k) => {
      for (const m of lista) m.count = enLiviano ? Math.ceil(activos[k] * FRACCION_LIVIANO) : activos[k];
    });
  };

  // Lleva al frente los puestos que cumplen la condición, en el orden aleatorio de la lista (liviano uniforme).
  // El resto de los arreglos queda en cero: el estado no depende del camino recorrido.
  function compactar(incluir) {
    activos[0] = 0;
    activos[1] = 0;
    for (let i = 0; i < n; i++) {
      if (!incluir(i)) {
        posicionDe[i] = -1;
        continue;
      }
      nivelDe[i] = niveles === 2 && !enLiviano && cercanas.has(celdas[i]) ? 1 : 0;
      posicionDe[i] = activos[nivelDe[i]]++;
    }
    for (let i = 0; i < n; i++) escribir(i);
    deNivel.forEach((lista, k) => {
      for (const m of lista) {
        m.instanceMatrix.array.fill(0, activos[k] * 16);
        m.instanceMatrix.needsUpdate = true;
        if (m.instanceColor) {
          m.instanceColor.array.fill(0, activos[k] * 3);
          m.instanceColor.needsUpdate = true;
        }
      }
    });
    contar();
  }
  const recompactar = () => compactar((i) => posicionDe[i] >= 0);

  compactar(() => false);

  return {
    id,
    mallas: grupos.flat(),
    total: n,
    niveles,
    preparar(asignacion) {
      vis.v0.set(vis.v);
      color.c0.set(color.c);
      cambian = [];
      for (let i = 0; i < n; i++) {
        const e = puestos[i];
        const indice = asignacion[e.u.indice];
        vis.v1[i] = visible(e, indice) ? 1 : 0;
        if (vis.v1[i]) {
          colorDe(e, indice, tinte);
          color.c1.set([tinte.r, tinte.g, tinte.b], i * 3);
          if (vis.v0[i] === 0) color.c0.set(color.c1.subarray(i * 3, i * 3 + 3), i * 3);
        } else color.c1.set(color.c.subarray(i * 3, i * 3 + 3), i * 3);
        const igual = vis.v1[i] === vis.v[i] && color.c1.subarray(i * 3, i * 3 + 3).every((x, k) => x === color.c[i * 3 + k]);
        if (!igual) cambian.push(i);
      }
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
      for (const m of grupos.flat()) {
        m.instanceMatrix.needsUpdate = true;
        if (m.instanceColor) m.instanceColor.needsUpdate = true;
      }
      return intermedias;
    },
    liviano(activo) {
      enLiviano = activo;
      if (niveles === 2) recompactar();
      else contar();
    },
    // Reparte los puestos entre «cerca» y «lejos» si cambió alguna celda propia. cercana(celda, umbral).
    detalle(cercana) {
      if (niveles < 2) return false;
      let cambio = false;
      propias.forEach((c, k) => {
        const v = cercana(c, umbral) ? 1 : 0;
        if (v !== marcas[k]) {
          marcas[k] = v;
          cambio = true;
        }
      });
      if (!cambio) return false;
      cercanas = new Set(propias.filter((_, k) => marcas[k]));
      recompactar();
      return true;
    },
    visiblesAhora: () => vis.v.reduce((a, x) => a + (x > 0.5 ? 1 : 0), 0),
    cercaAhora: () => (niveles === 2 ? deNivel[1][0].count : 0),
    arreglos: () => grupos.flat().flatMap((m) => [m.instanceMatrix.array, ...(m.instanceColor ? [m.instanceColor.array] : [])]),
  };
}
