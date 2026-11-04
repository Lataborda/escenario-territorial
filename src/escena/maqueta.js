// Base de la maqueta: medidas del bloque y mesa que recibe la sombra. El bloque lo genera src/terreno/.
import * as THREE from 'three';

// Medidas en unidades de escena. x de occidente a oriente, z de norte a sur.
export const MEDIDAS = { ancho: 1200, fondo: 900, espesor: 90 };

function crearMesa(espesor) {
  const mesa = new THREE.Mesh(
    new THREE.PlaneGeometry(8000, 8000),
    new THREE.ShadowMaterial({ opacity: 0.16 }),
  );
  mesa.name = 'mesa';
  mesa.rotation.x = -Math.PI / 2;
  mesa.position.y = -espesor - 0.5;
  mesa.receiveShadow = true;
  return mesa;
}

export function crearMaqueta() {
  const grupo = new THREE.Group();
  grupo.name = 'maqueta';
  grupo.add(crearMesa(MEDIDAS.espesor));
  return grupo;
}
