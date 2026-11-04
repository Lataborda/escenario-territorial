// Límite departamental: línea discontinua gris sobre el terreno (semántica fija: gobernanza gris).
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { BORDE, aMundoZ, aPlanoU } from './plano.js';

const COLOR = 0x55514b;
const SOBRE_SUPERFICIE = 1.5;
const PASO = 2;

// Trazo levemente irregular a lo largo de z = v (de occidente a oriente).
export function crearLimite(entidad, superficie) {
  const v = typeof entidad.z === 'number' ? entidad.z : (entidad.z[0] + entidad.z[1]) / 2;
  const puntos = [];
  for (let x = -BORDE.x; x <= BORDE.x + 1e-6; x += PASO) {
    const u = aPlanoU(x);
    const z = aMundoZ(v + 0.006 * Math.sin(u * 2 * Math.PI * 3.2 + 0.4) + 0.003 * Math.sin(u * 2 * Math.PI * 9.1));
    puntos.push(x, superficie(x, z) + SOBRE_SUPERFICIE, z);
  }
  const geometria = new LineGeometry();
  geometria.setPositions(puntos);
  const material = new LineMaterial({
    color: COLOR,
    linewidth: 3,
    dashed: true,
    dashSize: 12,
    gapSize: 7,
    worldUnits: false,
  });
  const ajustar = () => material.resolution.set(window.innerWidth, window.innerHeight);
  ajustar();
  window.addEventListener('resize', ajustar);
  const linea = new Line2(geometria, material);
  linea.computeLineDistances();
  linea.name = 'limite_departamental';
  return linea;
}
