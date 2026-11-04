// Anclas de cámara sobre la superficie, calculadas desde contenido/territorio.json.
// Marcadores de anclas (modo autor): visibles según «anclas» del estado (tecla A).
import * as THREE from 'three';
import { obtener, suscribir } from '../estado.js';
import { aMundoX, aMundoZ } from './plano.js';

const COLOR_MARCADOR = 0xd6336c;
const TOLERANCIA = 0.05;

const centro = (valor) => (Array.isArray(valor) ? (valor[0] + valor[1]) / 2 : valor);

// Devuelve un Map id -> Vector3 con la altura de la superficie visible (terreno o agua).
export function calcularAnclas(entidades, { superficie, puntoDelRio }) {
  const anclas = new Map();
  for (const e of entidades) {
    const u = e.ancla?.x ?? centro(e.x);
    const v = e.ancla?.z ?? centro(e.z);
    if (typeof u !== 'number' || typeof v !== 'number') continue;
    let x = aMundoX(u);
    let z = aMundoZ(v);
    // Los ríos se anclan sobre su propio cauce.
    if (e.tipo === 'rio') {
      const p = puntoDelRio(e.id, x, z);
      if (p) {
        x = p.x;
        z = p.z;
      }
    }
    anclas.set(e.id, new THREE.Vector3(x, superficie(x, z), z));
  }
  return anclas;
}

// Conos con la punta en cada ancla, en una sola llamada de dibujo.
export function crearMarcadores(anclas) {
  const geometria = new THREE.ConeGeometry(5, 18, 10);
  geometria.rotateX(Math.PI);
  geometria.translate(0, 9, 0);
  const material = new THREE.MeshBasicMaterial({ color: COLOR_MARCADOR });
  const marcadores = new THREE.InstancedMesh(geometria, material, anclas.size);
  const m = new THREE.Matrix4();
  let k = 0;
  for (const p of anclas.values()) {
    m.makeTranslation(p.x, p.y, p.z);
    marcadores.setMatrixAt(k++, m);
  }
  marcadores.instanceMatrix.needsUpdate = true;
  marcadores.computeBoundingSphere();
  marcadores.name = 'anclas';
  marcadores.visible = obtener().anclas;
  suscribir('anclas', (e) => {
    marcadores.visible = e.anclas;
  });
  return marcadores;
}

// Comprueba con rayos verticales que cada ancla queda sobre la malla visible.
export function revisarAnclas(anclas, objetivos) {
  const rayo = new THREE.Raycaster();
  const abajo = new THREE.Vector3(0, -1, 0);
  const resultado = { total: anclas.size, maximo: 0, fuera: [], sinImpacto: [] };
  for (const [id, p] of anclas) {
    rayo.set(new THREE.Vector3(p.x, 5000, p.z), abajo);
    const impacto = rayo.intersectObjects(objetivos, false)[0];
    if (!impacto) {
      resultado.sinImpacto.push(id);
      continue;
    }
    const desvio = Math.abs(impacto.point.y - p.y);
    resultado.maximo = Math.max(resultado.maximo, desvio);
    if (desvio > TOLERANCIA) resultado.fuera.push(`${id} (${desvio.toFixed(3)})`);
  }
  resultado.maximo = Number(resultado.maximo.toFixed(4));
  return resultado;
}
