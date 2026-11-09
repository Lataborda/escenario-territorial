// Disposición del lote de la etapa 7 (sin Three.js): rectángulos del policultivo y del monocultivo desde el ancla
// «lote» y las medidas de contenido/lote.json, y puestos de las plantas con semilla fija. Hileras a lo largo del eje
// norte y sur (en curva de nivel: la ladera sube hacia el oriente). El policultivo se centra en la entidad «lote»;
// la entidad «organismo» (territorio.json) marca el cafeto del nivel de organismo, con un claro sin guamos ni
// plátanos alrededor para que la cámara de P03 lo vea. El monocultivo queda al occidente. coberturas/unidades.js reserva las teselas de
// ambos rectángulos.
import contenido from '../../contenido/lote.json';
import { ENTIDADES, aMundoX, aMundoZ } from '../terreno/plano.js';
import { crearAzar } from '../util/azar.js';

export const LADO = 6; // igual que coberturas/rejilla.js
export const ORILLA = 0.9; // distancia mínima de una planta al borde del lote
const HOLGURA = { guamo: 1.5, platano: 1.1 }; // ningún cafeto tan cerca del tronco
const CLARO = { guamo: 8, platano: 4 }; // ningún tronco tan cerca del cafeto del nivel de organismo
const SEMILLA = 7031;
const ajustar = (v) => Math.round(v / LADO) * LADO;

const entidad = ENTIDADES.find((e) => e.id === 'lote');
const planta = ENTIDADES.find((e) => e.id === 'organismo');

// Rectángulos { x0, x1, z0, z1 } en la escena.
export function rectangulos() {
  const { policultivo: p, monocultivo: m } = contenido.lotes;
  const cx = aMundoX(entidad.x);
  const cz = aMundoZ(entidad.z);
  const x0 = ajustar(cx - p.ancho / 2);
  const z0 = ajustar(cz - p.fondo / 2);
  const poli = { x0, x1: x0 + p.ancho, z0, z1: z0 + p.fondo };
  const zm = ajustar((poli.z0 + poli.z1) / 2 - m.fondo / 2);
  const mono = { x0: x0 - m.ancho, x1: x0, z0: zm, z1: zm + m.fondo };
  const todo = { x0: mono.x0, x1: poli.x1, z0: Math.min(poli.z0, mono.z0), z1: Math.max(poli.z1, mono.z1) };
  const organismo = { x: aMundoX(planta.x), z: aMundoZ(planta.z) };
  return { policultivo: poli, monocultivo: mono, todo, centro: { x: cx, z: cz }, organismo };
}

// El corte de suelo (suelo.js) y su panel (ui/materia.js) se ven con su capa o en la escala de suelo.
export const visibleCorte = ({ capas, escala }) => capas.includes('corte_suelo') || escala === 'suelo';

export const dentro = (r, x, z, margen = 0) => x > r.x0 + margen && x < r.x1 - margen && z > r.z0 + margen && z < r.z1 - margen;

// Rejilla de una especie dentro de una franja, alineada con el punto (ax, az): hileras cada b, plantas cada a.
function rejilla(r, [a, b], ax, az, azar, temblor) {
  const lista = [];
  const i0 = Math.ceil((r.x0 + ORILLA - ax) / b);
  const i1 = Math.floor((r.x1 - ORILLA - ax) / b);
  const j0 = Math.ceil((r.z0 + ORILLA - az) / a);
  const j1 = Math.floor((r.z1 - ORILLA - az) / a);
  for (let i = i0; i <= i1; i++) {
    for (let j = j0; j <= j1; j++) {
      const t = i === 0 && j === 0 ? 0 : temblor;
      lista.push({ x: ax + i * b + (azar() - 0.5) * t * b, z: az + j * a + (azar() - 0.5) * t * a, i, j });
    }
  }
  return lista;
}

// Puestos de las plantas: { especie, lote, franja, x, z, giro, escala, organismo }.
function calcularPlantas() {
  const r = rectangulos();
  const azar = crearAzar(SEMILLA);
  const plantas = [];
  const poner = (especie, lote, franja, p, extra = {}) =>
    plantas.push({ especie, lote, franja, x: p.x, z: p.z, giro: azar() * Math.PI * 2, escala: 0.9 + azar() * 0.2, organismo: false, ...extra });

  // Policultivo: franjas de occidente a oriente; la última ocupa el resto.
  const { franjas } = contenido.lotes.policultivo;
  let x = r.policultivo.x0;
  franjas.forEach((f, k) => {
    const ancho = k === franjas.length - 1 ? r.policultivo.x1 - x : f.ancho;
    const rf = { ...r.policultivo, x0: x, x1: x + ancho };
    x += ancho;
    // Especies de porte mayor primero: los cafetos dejan libre el pie de guamos y plátanos.
    const orden = [...f.especies].sort((a, b) => (HOLGURA[b.especie] ?? 0) - (HOLGURA[a.especie] ?? 0));
    const troncos = [];
    for (const e of orden) {
      if (e.sobre) continue;
      // Alineación: los cafetos con el ancla (cafeto del nivel de organismo); las demás especies, con la franja.
      const enAncla = e.especie === 'cafeto';
      const ax = enAncla ? r.organismo.x : rf.x0 + e.separacion[1] / 2;
      const az = enAncla ? r.organismo.z : rf.z0 + e.separacion[0] / 2;
      for (const p of rejilla(rf, e.separacion, ax, az, azar, enAncla ? 0.12 : 0.2)) {
        const organismo = enAncla && p.i === 0 && p.j === 0;
        if (!organismo && troncos.some((t) => Math.hypot(t.x - p.x, t.z - p.z) < t.holgura)) continue;
        if (HOLGURA[e.especie]) {
          // Claro alrededor del cafeto del nivel de organismo.
          if (Math.hypot(p.x - r.organismo.x, p.z - r.organismo.z) < CLARO[e.especie]) continue;
          troncos.push({ ...p, holgura: HOLGURA[e.especie] });
        }
        poner(e.especie, 'policultivo', f.id, p, organismo ? { organismo: true, giro: 0.6, escala: 1 } : {});
      }
    }
    // Especies que crecen apoyadas en otra (fríjol en el maíz): una fracción de sus plantas.
    for (const e of f.especies.filter((x) => x.sobre)) {
      for (const base of plantas.filter((p) => p.franja === f.id && p.especie === e.sobre)) {
        if (azar() < e.fraccion) poner(e.especie, 'policultivo', f.id, base, { escala: base.escala });
      }
    }
  });

  // Monocultivo: una sola especie en hileras.
  for (const e of contenido.lotes.monocultivo.especies) {
    const rm = r.monocultivo;
    for (const p of rejilla(rm, e.separacion, rm.x0 + e.separacion[1] / 2, rm.z0 + e.separacion[0] / 2, azar, 0.15)) {
      poner(e.especie, 'monocultivo', null, p);
    }
  }
  return plantas;
}

let memoria = null;
export function obtenerDisposicion() {
  if (!memoria) memoria = { ...rectangulos(), plantas: calcularPlantas() };
  return memoria;
}

// Planta más cercana a un punto entre las de una especie y un lote (rótulos de interacciones).
export function plantaCercana(plantas, especie, lote, x, z) {
  let mejor = null;
  for (const p of plantas) {
    if (p.especie !== especie || p.lote !== lote) continue;
    const d = Math.hypot(p.x - x, p.z - z);
    if (!mejor || d < mejor.d) mejor = { p, d };
  }
  return mejor?.p ?? null;
}

// Punto de un lote en fracciones de ancho y fondo.
export function puntoDeLote(r, [fx, fz]) {
  return { x: r.x0 + fx * (r.x1 - r.x0), z: r.z0 + fz * (r.z1 - r.z0) };
}
