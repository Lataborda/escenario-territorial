// Rellenos translúcidos sobre el relieve para las capas de actores: abanico con coronas dentro de un contorno
// convexo o casi convexo (polígono de la red, figuras territoriales) y baldosas de teselas (figura sobre una finca).
// Se dibujan en la superposición, sin prueba de profundidad.
import * as THREE from 'three';

/** Malla vacía con el color y la opacidad («relleno») del estilo; «orden»: por debajo del trazo de su contorno. */
export function crearRelleno(nombre, estilo) {
  const malla = new THREE.Mesh(
    new THREE.BufferGeometry(),
    new THREE.MeshBasicMaterial({ color: estilo.color, transparent: true, opacity: estilo.relleno, depthTest: false, depthWrite: false, side: THREE.DoubleSide }),
  );
  malla.name = nombre;
  malla.renderOrder = estilo.linea.orden - 8;
  malla.frustumCulled = false;
  return malla;
}

function armar(posiciones, indices) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(posiciones, 3));
  g.setIndex(indices);
  g.computeBoundingSphere();
  return g;
}

/** Abanico desde el centro ([x, z]) hasta el contorno (lista de [x, z]), con «anillos» coronas que siguen el relieve. */
export function abanico(puntos, centro, superficie, { alto = 2, anillos = 14 } = {}) {
  const n = puntos.length;
  const posiciones = [centro[0], superficie(...centro) + alto, centro[1]];
  for (let c = 1; c <= anillos; c++) {
    for (const [x, z] of puntos) {
      const px = centro[0] + ((x - centro[0]) * c) / anillos;
      const pz = centro[1] + ((z - centro[1]) * c) / anillos;
      posiciones.push(px, superficie(px, pz) + alto, pz);
    }
  }
  const indices = [];
  for (let s = 0; s < n; s++) {
    const t = (s + 1) % n;
    indices.push(0, 1 + t, 1 + s);
    for (let c = 1; c < anillos; c++) {
      const a = 1 + (c - 1) * n;
      const b = a + n;
      indices.push(a + s, a + t, b + s, a + t, b + t, b + s);
    }
  }
  return armar(posiciones, indices);
}

/** Una baldosa por tesela (cuadrado de lado «lado» centrado en la tesela), con las esquinas sobre el relieve. */
export function baldosas(teselas, centros, lado, superficie, alto = 2) {
  const h = lado / 2;
  const posiciones = [];
  const indices = [];
  for (const t of teselas) {
    const x = centros.x(t % centros.columnas);
    const z = centros.z(Math.floor(t / centros.columnas));
    const base = posiciones.length / 3;
    for (const [dx, dz] of [[-h, -h], [h, -h], [h, h], [-h, h]]) posiciones.push(x + dx, superficie(x + dx, z + dz) + alto, z + dz);
    indices.push(base, base + 2, base + 1, base, base + 3, base + 2);
  }
  return armar(posiciones, indices);
}
