// Red de actores (etapas 9.a y 9.b): mercados, enlaces por tipo de relación, polígono del territorio de la red,
// límites administrativos, figuras territoriales, lindero de las fincas y marcadores de los actores. Cada capa
// (un archivo por capa en esta carpeta) se enciende con su capa del estado y se arma para el escenario actual. Capas quietas, en la superposición: trazos y puntos, sin reloj ni pedidos de
// cuadro. Misma forma de capa que src/flujos/flujos.js, para compartir rótulos y leyenda. Reacciona a «capas» y
// «escenario».
import * as THREE from 'three';
import { obtener, suscribir } from '../estado.js';
import { crearNodos } from './nodos.js';
import { crearMercados } from './mercados.js';
import { crearEnlaces } from './enlaces.js';
import { crearPoligono } from './poligono.js';
import { crearLimites } from './limites.js';
import { crearFiguras } from './figuras.js';
import { crearLindero } from './lindero.js';
import { crearMarcadores } from './marcadores.js';

// Una capa que falla se registra y deja seguir a las demás.
function montar(nombre, crear) {
  try {
    return crear();
  } catch (error) {
    console.error(`Actores, ${nombre}:`, error);
    return null;
  }
}

/** altura, superficie y ancla: consultas del terreno. */
export function crearActores({ altura, superficie, ancla }) {
  const nodos = crearNodos({ superficie, ancla });
  const capas = [
    montar('límites administrativos', () => crearLimites({ superficie, altura })),
    montar('figuras territoriales', () => crearFiguras({ superficie, altura, ancla })),
    montar('polígono de la red', () => crearPoligono({ nodos, superficie, altura })),
    montar('lindero de las fincas', () => crearLindero({ superficie, altura })),
    montar('enlaces', () => crearEnlaces({ nodos, superficie, altura })),
    montar('mercados', () => crearMercados({ nodos })),
    montar('marcadores de actores', () => crearMarcadores({ nodos })),
  ]
    .flat()
    .filter(Boolean);
  const grupo = new THREE.Group();
  grupo.name = 'actores';
  for (const c of capas) {
    c.grupo.visible = false;
    grupo.add(c.grupo);
  }

  const armadas = new Map(); // capa -> escenario con que se armó
  function pintar({ capas: activas, escenario }) {
    for (const c of capas) {
      const visible = activas.includes(c.capa);
      if (visible && armadas.get(c) !== escenario) {
        c.aplicar(escenario);
        armadas.set(c, escenario);
      }
      c.grupo.visible = visible;
    }
  }
  suscribir(['capas', 'escenario'], pintar);
  pintar(obtener());

  return {
    grupo,
    capas,
    // Verificación: una entrada por capa del estado; las de enlaces llevan la clave de su relación («enlaces_…»).
    datos: () => ({
      capas: Object.fromEntries(capas.map((c) => [c.clave ?? c.capa, { visible: c.grupo.visible, puntos: c.nubes.reduce((s, n) => s + n.cantidad(), 0), ...c.datos() }])),
    }),
  };
}
