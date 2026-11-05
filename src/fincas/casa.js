// Casas de las fincas (vivienda o bodega con tejado a dos aguas) y familia junto a la casa: figuras genéricas de
// peón de maqueta, sin rasgos. Mallas instanciadas para las cuatro fincas. Datos de cada finca: src/fincas/trazado.js.
import * as THREE from 'three';
import { crearCaja, crearTejado } from '../asentamientos/asentamientos.js';
import { CASA } from './estilo.js';

const HUNDIMIENTO = 1.5; // los muros bajan bajo el terreno: sin huecos en pendiente
const ALERO = 0.3;
const TEJADO = 0.42; // altura del tejado por unidad de fondo

// Peón: cuerpo troncocónico y cabeza esférica; alto 1, base en y = 0.
function crearPeon() {
  const cuerpo = new THREE.CylinderGeometry(0.17, 0.27, 0.68, 10);
  cuerpo.translate(0, 0.34, 0);
  const cabeza = new THREE.SphereGeometry(0.16, 12, 8);
  cabeza.translate(0, 0.84, 0);
  return { cuerpo, cabeza };
}

function instanciar(nombre, geometria, material, lista) {
  const malla = new THREE.InstancedMesh(geometria, material, Math.max(1, lista.length));
  malla.name = nombre;
  malla.castShadow = true;
  malla.receiveShadow = true;
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const eje = new THREE.Vector3(0, 1, 0);
  const color = new THREE.Color();
  lista.forEach((e, i) => {
    malla.setMatrixAt(i, m.compose(new THREE.Vector3(e.x, e.y, e.z), q.setFromAxisAngle(eje, e.giro ?? 0), new THREE.Vector3(...e.escala)));
    malla.setColorAt(i, color.setHex(e.color));
  });
  malla.count = lista.length;
  malla.computeBoundingSphere();
  return malla;
}

// Mínimo del terreno bajo la planta de la casa.
function suelo(altura, x, z, ancho, fondo) {
  let minimo = Infinity;
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, 0]]) minimo = Math.min(minimo, altura(x + (a * ancho) / 2, z + (b * fondo) / 2));
  return minimo;
}

/** fincas: lista de obtenerFincas(). Devuelve { grupo, familias: [{ id, x, y, z }] }. */
export function crearCasas(fincas, altura) {
  const muros = [];
  const tejados = [];
  const cuerpos = [];
  const cabezas = [];
  const familias = [];
  for (const f of fincas) {
    const c = CASA[f.receta.casa ?? 'vivienda'];
    const { x, z, giro } = f.casa;
    // La casa queda al fondo del solar; la familia, delante (hacia el sur, que mira a la cámara general).
    const cx = x;
    const cz = z - 0.6;
    const y0 = suelo(altura, cx, cz, c.ancho, c.fondo);
    const cima = altura(cx, cz) + c.alto;
    muros.push({ x: cx, y: y0 - HUNDIMIENTO, z: cz, giro, escala: [c.ancho, cima - y0 + HUNDIMIENTO, c.fondo], color: c.pared });
    tejados.push({ x: cx, y: cima, z: cz, giro, escala: [c.ancho + ALERO, TEJADO * c.fondo, c.fondo + ALERO], color: c.techo });
    if (!f.receta.familia) continue;
    const { alto, colores, cabeza } = CASA.familia;
    alto.forEach((h, k) => {
      const px = cx - 1.5 + k * 1;
      const pz = cz + c.fondo / 2 + 1.1 + (k % 2) * 0.25;
      const py = altura(px, pz);
      cuerpos.push({ x: px, y: py, z: pz, escala: [h, h, h], color: colores[k] });
      cabezas.push({ x: px, y: py, z: pz, escala: [h, h, h], color: cabeza });
    });
    familias.push({ id: f.id, x: cx, y: altura(cx, cz + c.fondo / 2 + 1.2) + 2.2, z: cz + c.fondo / 2 + 1.2 });
  }
  const grupo = new THREE.Group();
  grupo.name = 'casas';
  const mate = new THREE.MeshStandardMaterial({ roughness: 0.9 });
  const peon = crearPeon();
  grupo.add(
    instanciar('casas-muros', crearCaja(), mate, muros),
    instanciar('casas-tejados', crearTejado(), new THREE.MeshStandardMaterial({ roughness: 0.85, flatShading: true }), tejados),
    instanciar('familia-cuerpos', peon.cuerpo, mate, cuerpos),
    instanciar('familia-cabezas', peon.cabeza, mate, cabezas),
  );
  return { grupo, familias, cuentas: { casas: muros.length, figuras: cuerpos.length } };
}
