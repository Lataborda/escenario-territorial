// Trazos de segmentos sobre el relieve con ancho en píxeles de pantalla (LineSegments2 de Three.js). Un trazo
// lleva un halo oscuro debajo para leerse sobre cualquier cobertura. Segmentos: [x1, z1, x2, z2] en la escena;
// cada uno se parte en tramos de PASO y se eleva «alto» sobre el terreno.
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

const PASO = 3; // igual al paso de la rejilla del terreno

function posiciones(segmentos, altura, alto) {
  const v = [];
  for (const [x1, z1, x2, z2] of segmentos) {
    const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, z2 - z1) / PASO));
    for (let k = 0; k < n; k++) {
      const a = k / n;
      const b = (k + 1) / n;
      const xa = x1 + (x2 - x1) * a;
      const za = z1 + (z2 - z1) * a;
      const xb = x1 + (x2 - x1) * b;
      const zb = z1 + (z2 - z1) * b;
      v.push(xa, altura(xa, za) + alto, za, xb, altura(xb, zb) + alto, zb);
    }
  }
  return new Float32Array(v);
}

function linea(nombre, color, ancho, encima, orden) {
  const material = new LineMaterial({ color, linewidth: ancho, worldUnits: false, depthTest: !encima, depthWrite: false });
  const malla = new LineSegments2(new LineSegmentsGeometry(), material);
  malla.name = nombre;
  malla.renderOrder = orden;
  malla.frustumCulled = false;
  return malla;
}

/**
 * estilo: { color, ancho (px), halo (color) , alto (sobre el terreno), encima (sin prueba de profundidad), orden }.
 * Devuelve { grupo, fijar(segmentos), cantidad() }. Sin segmentos el grupo queda oculto.
 */
export function crearTrazo(nombre, altura, estilo) {
  const grupo = new THREE.Group();
  grupo.name = nombre;
  const orden = estilo.orden ?? 10;
  const partes = [];
  if (estilo.halo != null) partes.push(linea(`${nombre}-halo`, estilo.halo, estilo.ancho + (estilo.borde ?? 3), estilo.encima, orden));
  partes.push(linea(nombre, estilo.color, estilo.ancho, estilo.encima, orden + 1));
  grupo.add(...partes);
  let cantidad = 0;
  function fijar(segmentos) {
    cantidad = segmentos.length;
    const arreglo = posiciones(segmentos, altura, estilo.alto ?? 0.6);
    for (const p of partes) {
      p.geometry.dispose();
      p.geometry = new LineSegmentsGeometry();
      if (arreglo.length) p.geometry.setPositions(arreglo);
    }
    grupo.userData.vacio = !arreglo.length;
  }
  return { grupo, fijar, cantidad: () => cantidad };
}
