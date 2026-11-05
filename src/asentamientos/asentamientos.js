// Ciudad intermedia y cabeceras: placas de calle y de manzana, edificaciones con tejado a dos aguas o azotea,
// y árboles de plaza y de patio. Tres mallas instanciadas para todos los asentamientos. No cambian con el escenario.
import * as THREE from 'three';
import { ENTIDADES, aMundoX, aMundoZ } from '../terreno/plano.js';
import { SEMILLA } from '../terreno/relieve.js';
import { crearAzar, huella } from '../util/azar.js';
import { crearTrama, COLORES, RADIO } from './trama.js';
import { arbolUrbano } from '../coberturas/especies.js';

const ESPESOR = { calle: 0.15, anden: 0.32 };
const HUNDIMIENTO = 2; // las placas y los muros bajan bajo el terreno: sin huecos en pendiente
const ALERO = 0.25; // vuelo del tejado
const TEJADO = 0.45; // altura del tejado por unidad de fondo

// Prisma de tejado a dos aguas: base 1 × 1 en y = 0, cumbrera a lo largo de x, altura 1. Lo usan también las fincas.
export function crearTejado() {
  const g = new THREE.BufferGeometry();
  const v = [-0.5, 0, -0.5, 0.5, 0, -0.5, 0.5, 1, 0, -0.5, 1, 0, -0.5, 0, 0.5, 0.5, 0, 0.5];
  // Faldones norte y sur, y hastiales oriente y occidente.
  const caras = [0, 3, 1, 1, 3, 2, 4, 5, 3, 5, 2, 3, 1, 2, 5, 0, 4, 3];
  g.setAttribute('position', new THREE.Float32BufferAttribute(caras.flatMap((i) => v.slice(i * 3, i * 3 + 3)), 3));
  g.computeVertexNormals();
  return g;
}

// Caja unitaria con la base en y = 0.
export function crearCaja() {
  const g = new THREE.BoxGeometry(1, 1, 1);
  g.translate(0, 0.5, 0);
  return g;
}

// Mínimo del terreno en las esquinas de un rectángulo girado.
function sueloMinimo(altura, x, z, ancho, fondo, giro) {
  const c = Math.cos(giro);
  const s = Math.sin(giro);
  let minimo = Infinity;
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, 0]]) {
    const lx = (a * ancho) / 2;
    const lz = (b * fondo) / 2;
    minimo = Math.min(minimo, altura(x + lx * c - lz * s, z + lx * s + lz * c));
  }
  return minimo;
}

export function crearAsentamientos({ altura }) {
  const azar = crearAzar(SEMILLA + 171);
  const lista = ENTIDADES.filter((e) => e.tipo === 'asentamiento' && typeof e.x === 'number');
  const tramas = lista.map((e) => ({
    id: e.id,
    ...crearTrama({ x: aMundoX(e.x), z: aMundoZ(e.z), clase: e.id === 'ciudad' ? 'ciudad' : 'cabecera', giro: (azar() - 0.5) * 0.5, azar }),
  }));
  const cajas = [];
  const tejados = [];
  const arboles = [];
  for (const t of tramas) {
    for (const m of t.manzanas) {
      const y = altura(m.x, m.z);
      cajas.push({ x: m.x, z: m.z, y0: y - HUNDIMIENTO, y1: y + ESPESOR.calle, ancho: m.paso, fondo: m.paso, giro: m.giro, color: COLORES.calle });
      cajas.push({ x: m.x, z: m.z, y0: y - HUNDIMIENTO, y1: y + ESPESOR.anden, ancho: m.lado, fondo: m.lado, giro: m.giro, color: m.plaza ? COLORES.plaza : COLORES.anden });
    }
    for (const e of t.edificios) {
      const y = sueloMinimo(altura, e.x, e.z, e.ancho, e.fondo, e.giro) + ESPESOR.anden;
      const cima = altura(e.x, e.z) + ESPESOR.anden + e.alto;
      cajas.push({ x: e.x, z: e.z, y0: y - HUNDIMIENTO, y1: cima, ancho: e.ancho, fondo: e.fondo, giro: e.giro, color: e.pared });
      if (e.tejado) tejados.push({ x: e.x, z: e.z, y0: cima, y1: cima + TEJADO * e.fondo, ancho: e.ancho + ALERO, fondo: e.fondo + ALERO, giro: e.giro, color: e.techo });
    }
    for (const a of t.arboles) arboles.push({ x: a.x, z: a.z, y0: altura(a.x, a.z) + ESPESOR.anden, escala: 0.42 + 0.18 * azar(), giro: azar() * Math.PI * 2 });
  }

  const matriz = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const eje = new THREE.Vector3(0, 1, 0);
  const p = new THREE.Vector3();
  const s = new THREE.Vector3();
  const color = new THREE.Color();
  // El giro de la trama gira (1, 0) hacia (cos, sen) en el plano x-z: en Three.js equivale a −giro sobre y.
  function instanciar(nombre, geometria, material, elementos, medida) {
    const malla = new THREE.InstancedMesh(geometria, material, Math.max(1, elementos.length));
    malla.name = nombre;
    malla.castShadow = true;
    malla.receiveShadow = true;
    elementos.forEach((e, i) => {
      malla.setMatrixAt(i, matriz.compose(p.set(e.x, e.y0, e.z), q.setFromAxisAngle(eje, -e.giro), medida(e, s)));
      malla.setColorAt(i, color.setHex(e.color ?? 0xffffff));
    });
    malla.count = elementos.length;
    malla.computeBoundingSphere();
    return malla;
  }
  const grupo = new THREE.Group();
  grupo.name = 'asentamientos';
  const mate = new THREE.MeshStandardMaterial({ roughness: 0.92 });
  const edificios = instanciar('edificaciones', crearCaja(), mate, cajas, (e, v) => v.set(e.ancho, e.y1 - e.y0, e.fondo));
  const techos = instanciar('tejados', crearTejado(), new THREE.MeshStandardMaterial({ roughness: 0.85, flatShading: true }), tejados, (e, v) => v.set(e.ancho, e.y1 - e.y0, e.fondo));
  const arbol = arbolUrbano();
  const copas = instanciar('arboles-urbanos', arbol.geometria, new THREE.MeshStandardMaterial(arbol.material), arboles, (e, v) => v.setScalar(e.escala));
  grupo.add(edificios, techos, copas);

  return {
    grupo,
    huella: () => huella([edificios.instanceMatrix.array, techos.instanceMatrix.array, copas.instanceMatrix.array]),
    datos: () => ({
      asentamientos: tramas.map((t) => ({
        id: t.id,
        manzanas: t.manzanas.length,
        edificios: t.edificios.length,
        fuera: t.edificios.filter((e) => Math.hypot(e.x - aMundoX(lista.find((x) => x.id === t.id).x), e.z - aMundoZ(lista.find((x) => x.id === t.id).z)) > (t.id === 'ciudad' ? RADIO.ciudad : RADIO.cabecera)).length,
      })),
      instancias: { cajas: cajas.length, tejados: tejados.length, arboles: arboles.length },
    }),
  };
}
