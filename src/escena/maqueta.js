// Base de la maqueta: bloque recortado sobre una mesa que recibe la sombra.
import * as THREE from 'three';

// Medidas en unidades de escena. x de occidente a oriente, z de norte a sur.
export const MEDIDAS = { ancho: 1200, fondo: 900, espesor: 90 };

const COLORES = {
  superficie: 0xb9b58c,
  costado: 0x8b6b4b,
  base: 0x5e4632,
};

function crearBloque({ ancho, fondo, espesor }) {
  const geometria = new THREE.BoxGeometry(ancho, espesor, fondo);
  const costado = new THREE.MeshStandardMaterial({ color: COLORES.costado, roughness: 0.95 });
  const superficie = new THREE.MeshStandardMaterial({ color: COLORES.superficie, roughness: 0.9 });
  const base = new THREE.MeshStandardMaterial({ color: COLORES.base, roughness: 1 });
  // Orden de caras de BoxGeometry: +x, -x, +y, -y, +z, -z.
  const bloque = new THREE.Mesh(geometria, [costado, costado, superficie, base, costado, costado]);
  bloque.name = 'bloque';
  bloque.position.y = -espesor / 2;
  bloque.castShadow = true;
  bloque.receiveShadow = true;
  return bloque;
}

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
  grupo.add(crearBloque(MEDIDAS), crearMesa(MEDIDAS.espesor));
  return grupo;
}
