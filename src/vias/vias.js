// Vías: calzada en cinta sobre el relieve, línea central discontinua en las troncales y puentes con baranda sobre
// los cauces, en una sola malla. No cambia con el escenario: se dibuja igual en S0 a S3.
import * as THREE from 'three';
import { obtenerVias } from './trazado.js';
import { CATEGORIAS } from './red.js';
import { huella } from '../util/azar.js';

const ELEVACION = 0.3; // separación de la calzada sobre el terreno
const ARCO = 0.8; // flecha del tablero sobre la recta entre estribos
const BARANDA = 0.55;
const LINEA = { ancho: 0.24, trazo: 3, elevacion: 0.05 };
const COLOR_PUENTE = 0xa29d93;
const COLOR_BARANDA = 0xd8d3c8;

export function crearVias({ altura }) {
  const { trazos, mascara } = obtenerVias(altura);
  const pos = [];
  const col = [];
  const ind = [];
  const c = new THREE.Color();
  const vertice = (x, y, z, hex) => {
    pos.push(x, y, z);
    c.setHex(hex);
    col.push(c.r, c.g, c.b);
    return pos.length / 3 - 1;
  };
  // Cuadrilátero a-b-c-d con la cara hacia arriba (o hacia afuera); doble: también la cara opuesta.
  const cuadro = (a, b, cc, d, doble = false) => {
    ind.push(a, b, d, d, b, cc);
    if (doble) ind.push(a, d, b, d, cc, b);
  };
  let longitud = 0;
  let puentes = 0;

  for (const v of trazos) {
    const cat = CATEGORIAS[v.categoria];
    const p = v.puntos;
    const n = p.length;
    const normal = p.map((_, k) => {
      const a = p[Math.max(0, k - 1)];
      const b = p[Math.min(n - 1, k + 1)];
      const l = Math.hypot(b.x - a.x, b.z - a.z) || 1;
      return [-(b.z - a.z) / l, (b.x - a.x) / l];
    });
    const w = v.ancho / 2;
    const yI = p.map((q, k) => altura(q.x + normal[k][0] * w, q.z + normal[k][1] * w) + ELEVACION);
    const yD = p.map((q, k) => altura(q.x - normal[k][0] * w, q.z - normal[k][1] * w) + ELEVACION);
    const tablero = new Uint8Array(n);
    // Puentes: tablero recto con un arco leve entre los estribos, nunca bajo el terreno.
    for (const [a, b] of v.puentes) {
      const ya = (yI[a] + yD[a]) / 2;
      const yb = (yI[b] + yD[b]) / 2;
      for (let k = a; k <= b; k++) {
        const t = (k - a) / Math.max(1, b - a);
        const y = ya + (yb - ya) * t + ARCO * Math.sin(Math.PI * t);
        yI[k] = Math.max(y, yI[k]);
        yD[k] = Math.max(y, yD[k]);
        tablero[k] = 1;
      }
      puentes += 1;
    }
    let previo = null;
    let s = 0;
    for (let k = 0; k < n; k++) {
      const q = p[k];
      const [nx, nz] = normal[k];
      const color = tablero[k] ? COLOR_PUENTE : cat.color;
      const actual = [vertice(q.x + nx * w, yI[k], q.z + nz * w, color), vertice(q.x - nx * w, yD[k], q.z - nz * w, color)];
      if (previo) {
        cuadro(previo[0], actual[0], actual[1], previo[1]);
        s += Math.hypot(q.x - p[k - 1].x, q.z - p[k - 1].z);
        // Baranda a cada lado del tablero.
        if (tablero[k] && tablero[k - 1]) {
          for (const lado of [0, 1]) {
            const signo = lado ? -1 : 1;
            const ya = lado ? yD[k - 1] : yI[k - 1];
            const yb = lado ? yD[k] : yI[k];
            const o = p[k - 1];
            const [ox, oz] = normal[k - 1];
            const a = vertice(o.x + signo * ox * w, ya, o.z + signo * oz * w, COLOR_BARANDA);
            const b = vertice(q.x + signo * nx * w, yb, q.z + signo * nz * w, COLOR_BARANDA);
            const cc = vertice(q.x + signo * nx * w, yb + BARANDA, q.z + signo * nz * w, COLOR_BARANDA);
            const d = vertice(o.x + signo * ox * w, ya + BARANDA, o.z + signo * oz * w, COLOR_BARANDA);
            cuadro(a, b, cc, d, true);
          }
        }
        // Línea central discontinua.
        if (cat.linea && Math.floor(s / LINEA.trazo) % 2 === 0) {
          const o = p[k - 1];
          const [ox, oz] = normal[k - 1];
          const l = LINEA.ancho / 2;
          const ya = (yI[k - 1] + yD[k - 1]) / 2 + LINEA.elevacion;
          const yb = (yI[k] + yD[k]) / 2 + LINEA.elevacion;
          cuadro(
            vertice(o.x + ox * l, ya, o.z + oz * l, cat.linea),
            vertice(q.x + nx * l, yb, q.z + nz * l, cat.linea),
            vertice(q.x - nx * l, yb, q.z - nz * l, cat.linea),
            vertice(o.x - ox * l, ya, o.z - oz * l, cat.linea),
          );
        }
      }
      previo = actual;
    }
    longitud += s;
  }

  const geometria = new THREE.BufferGeometry();
  const posiciones = new Float32Array(pos);
  geometria.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
  geometria.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geometria.setIndex(ind);
  geometria.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
  const malla = new THREE.Mesh(geometria, material);
  malla.name = 'vias';
  malla.receiveShadow = true;

  return {
    malla,
    huella: () => huella([posiciones]),
    datos: () => ({
      trazos: trazos.length,
      porCategoria: Object.fromEntries(Object.keys(CATEGORIAS).map((k) => [k, trazos.filter((v) => v.categoria === k).length])),
      longitud: Math.round(longitud),
      puentes,
      corredor: mascara.reduce((a, x) => a + x, 0),
      vertices: posiciones.length / 3,
    }),
  };
}
