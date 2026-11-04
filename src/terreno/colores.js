// Color del terreno por zona, altitud y pendiente; orillas de los cauces.
import * as THREE from 'three';
import { ZONAS, aPlanoU, aPlanoV } from './plano.js';
import { suave } from '../util/interpolar.js';

// Paleta por zona (tonos de maqueta, apagados). Las coberturas llegan en la etapa 5.
const PALETA = {
  plano: 0xc9c38c,
  piedemonte: 0xadb47a,
  ladera: 0x91a766,
  bosque_altoandino: 0x5b7a4c,
  paramo: 0xa09c74,
};
const RESPALDO = 0xb5b285;
const ROCA = 0x8a7b67;
const CUMBRE = 0xc4bfae;
const ORILLA = 0xbca883;
const LECHO = 0x7e705b;

const TRANSICION = 0.014; // media anchura de la mezcla entre zonas (en u)
const EXAGERACION_REFERENCIA = 2; // la pendiente se mide igual con cualquier exageración

const color = (hex) => new THREE.Color(hex);

export function colorearTerreno(rejilla, { alturas, canal, ruidos }) {
  const { columnas, filas, paso, total } = rejilla;
  const zonas = ZONAS.map((z) => ({ ...z, color: color(PALETA[z.id] ?? RESPALDO) }));
  const roca = color(ROCA);
  const cumbre = color(CUMBRE);
  const orilla = color(ORILLA);
  const lecho = color(LECHO);
  const colores = new Float32Array(total * 3);
  const c = new THREE.Color();
  let hMax = -Infinity;
  for (let i = 0; i < total; i++) hMax = Math.max(hMax, alturas[i]);

  for (let j = 0; j < filas; j++) {
    for (let i = 0; i < columnas; i++) {
      const idx = j * columnas + i;
      const x = rejilla.x(i);
      const z = rejilla.z(j);
      const u = aPlanoU(x);
      const v = aPlanoV(z);
      const h = alturas[idx];

      // Zona con límite irregular.
      const uz = u + 0.016 * ruidos.detalle(v * 7.1, u * 3.3 + 11);
      c.copy(zonas[0]?.color ?? color(RESPALDO));
      for (let k = 0; k < zonas.length - 1; k++) {
        c.lerp(zonas[k + 1].color, suave(zonas[k].hasta - TRANSICION, zonas[k].hasta + TRANSICION, uz));
      }

      // Pendiente con diferencias centradas.
      const hx = alturas[j * columnas + Math.min(i + 1, columnas - 1)] - alturas[j * columnas + Math.max(i - 1, 0)];
      const hz = alturas[Math.min(j + 1, filas - 1) * columnas + i] - alturas[Math.max(j - 1, 0) * columnas + i];
      const gx = (hx * EXAGERACION_REFERENCIA) / (2 * paso);
      const gz = (hz * EXAGERACION_REFERENCIA) / (2 * paso);
      const vertical = 1 / Math.sqrt(1 + gx * gx + gz * gz);
      c.lerp(roca, suave(0.8, 0.5, vertical) * 0.75);

      // Cumbres del páramo más claras.
      c.lerp(cumbre, suave(hMax * 0.86, hMax, h) * 0.5);

      // Orillas y lecho.
      const dc = canal[idx];
      if (dc < 0) c.lerp(lecho, 0.8);
      else c.lerp(orilla, (1 - suave(0, 6, dc)) * 0.45);

      // Variación fina para que el plano no se vea liso.
      const variacion = 1 + 0.045 * ruidos.detalle(x / 18, z / 18);
      colores[idx * 3] = c.r * variacion;
      colores[idx * 3 + 1] = c.g * variacion;
      colores[idx * 3 + 2] = c.b * variacion;
    }
  }
  return colores;
}
