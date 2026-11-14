// Material de la vegetación, la caña, el lote y las teselas (etapa 7.d). MATE = true usa MeshLambertMaterial, sin
// brillo especular y más barato por píxel que MeshStandardMaterial; los sombreadores propios (viento.js, cana.js,
// superficie.js y lote/formas.js) usan fragmentos comunes a los dos. El agua y el terreno conservan el suyo.
import * as THREE from 'three';

export const MATE = true;

/** opciones de MeshStandardMaterial; con MATE se descartan las que el material mate no tiene. */
export function crearMaterial(opciones = {}) {
  if (!MATE) return new THREE.MeshStandardMaterial(opciones);
  const { roughness, metalness, ...resto } = opciones;
  return new THREE.MeshLambertMaterial(resto);
}
