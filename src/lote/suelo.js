// Corte de suelo bajo el lote (etapa 7, parada P07 y escala de suelo): bloque extraído del lote de caña
// agroecológica de la finca faro (ancla «corte_suelo»), que sube desde el terreno y queda a la vista sobre su huella,
// con el perfil dibujado en la cara que mira a la cámara (perfil.js), horizontes en los costados, caña encima y guías
// de trazo discontinuo hasta la huella. Medidas en contenido/lote.json (suelo.medidas). Visible con la capa
// «corte_suelo» o en la escala de suelo.
import * as THREE from 'three';
import gsap from 'gsap';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import contenido from '../../contenido/lote.json';
import { obtener, suscribir } from '../estado.js';
import { ENTIDADES, aMundoX, aMundoZ } from '../terreno/plano.js';
import { matasCana } from '../coberturas/mata.js';
import { crearMaterialMata } from '../coberturas/cana.js';
import { TIPOS } from '../coberturas/tipos.js';
import { crearAzar } from '../util/azar.js';
import { dibujarPerfil } from './perfil.js';
import { visibleCorte } from './disposicion.js';
import { pedirSombra } from '../escena/pedidos.js';

const SUBIDA = 1.4; // s
const MATAS = [4, 2]; // matas de caña sobre el bloque (a lo ancho y a lo hondo)
const TAPA = 0x4a3524;


function textura(lienzo) {
  const t = new THREE.CanvasTexture(lienzo);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Materiales de las caras: perfil al frente, horizontes en los costados y atrás. El brillo propio conserva la
// lectura del perfil con cualquier luz.
function materiales(perfil, costado) {
  const cara = (lienzo, repetir = 1) => {
    const mapa = textura(lienzo);
    mapa.repeat.set(repetir, 1);
    return new THREE.MeshStandardMaterial({ map: mapa, emissive: 0xffffff, emissiveMap: mapa, emissiveIntensity: 0.32, roughness: 1 });
  };
  const frente = cara(perfil);
  const lado = cara(costado, 0.6);
  const tapa = new THREE.MeshStandardMaterial({ color: TAPA, roughness: 1 });
  // Orden de BoxGeometry: +x, −x, +y, −y, +z, −z.
  return [lado, lado, tapa, tapa, frente, lado];
}

function guias(nombre, ancho) {
  const material = new LineMaterial({ color: 0xfbf9f4, linewidth: ancho, worldUnits: false, dashed: true, dashSize: 0.6, gapSize: 0.45, transparent: true, opacity: 0.85 });
  const linea = new LineSegments2(new LineSegmentsGeometry(), material);
  linea.name = nombre;
  linea.frustumCulled = false;
  return linea;
}

/** altura(x, z): terreno; instantanea: sin subida animada (#captura=1). */
export function crearCorte({ altura, instantanea = false }) {
  const s = contenido.suelo;
  const m = s.medidas;
  const e = ENTIDADES.find((x) => x.id === 'corte_suelo');
  const x = aMundoX(e.x);
  const z = aMundoZ(e.z);
  const suelo = altura(x, z);
  const giro = THREE.MathUtils.degToRad(m.frente);
  const derecha = new THREE.Vector3(Math.cos(giro), 0, -Math.sin(giro));
  const normal = new THREE.Vector3(Math.sin(giro), 0, Math.cos(giro));

  // Matas sobre el bloque: sus posiciones (u) dan el origen de las raíces del perfil.
  const azar = crearAzar(8851);
  const matas = [];
  for (let i = 0; i < MATAS[0]; i++) {
    for (let k = 0; k < MATAS[1]; k++) matas.push({ u: (i + 0.5) / MATAS[0] + (azar() - 0.5) * 0.08, w: (k + 0.5) / MATAS[1] + (azar() - 0.5) * 0.1 });
  }
  const perfil = dibujarPerfil(s.horizontes, { raicesDesde: matas.filter((p) => p.w > 0.5).map((p) => p.u) });
  const costado = dibujarPerfil(s.horizontes, { ancho: 512, alto: 1110 }).lienzo;

  const bloque = new THREE.Group();
  bloque.name = 'corte-suelo';
  const caja = new THREE.Mesh(new THREE.BoxGeometry(m.ancho, m.alto, m.fondo), materiales(perfil.lienzo, costado));
  caja.position.y = m.alto / 2;
  caja.castShadow = true;
  caja.receiveShadow = false; // sin acné de sombra sobre el perfil dibujado
  bloque.add(caja);
  const formas = matasCana();
  const mallaMatas = new THREE.InstancedMesh(formas.cerca, crearMaterialMata(formas.material), matas.length);
  mallaMatas.name = 'corte-suelo-cana';
  const matriz = new THREE.Matrix4();
  const color = new THREE.Color(TIPOS.cana_organica.edades[2]);
  matas.forEach((p, k) => {
    matriz.compose(
      new THREE.Vector3((p.u - 0.5) * m.ancho, m.alto, (p.w - 0.5) * m.fondo),
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), azar() * Math.PI * 2),
      new THREE.Vector3(0.95, 0.95, 0.95),
    );
    mallaMatas.setMatrixAt(k, matriz);
    mallaMatas.setColorAt(k, color);
  });
  mallaMatas.castShadow = true;
  bloque.add(mallaMatas);
  bloque.position.set(x, suelo + m.separacion, z);
  bloque.rotation.y = giro;

  // Guías: huella en el suelo y aristas verticales hasta el bloque.
  const esquinas = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) =>
    new THREE.Vector3(x, 0, z).addScaledVector(derecha, (a * m.ancho) / 2).addScaledVector(normal, (b * m.fondo) / 2),
  );
  const huella = esquinas.map((p) => new THREE.Vector3(p.x, altura(p.x, p.z) + 0.45, p.z));
  const guia = guias('corte-suelo-guias', 2);
  const puntos = [];
  huella.forEach((p, k) => puntos.push(...p.toArray(), ...huella[(k + 1) % 4].toArray()));
  huella.forEach((p) => puntos.push(...p.toArray(), p.x, suelo + m.separacion, p.z));
  guia.geometry.setPositions(puntos);
  guia.computeLineDistances();

  const grupo = new THREE.Group();
  grupo.name = 'corte';
  grupo.add(bloque, guia);
  const base = suelo + m.separacion;
  let tween = null;
  let mostrado = null;
  function pintar(estado) {
    const ver = visibleCorte(estado);
    if (ver === mostrado) return;
    mostrado = ver;
    tween?.kill();
    pedirSombra();
    if (!ver) {
      grupo.visible = false;
      return;
    }
    grupo.visible = true;
    if (instantanea) {
      bloque.position.y = base;
      guia.visible = true;
      return;
    }
    // Sube desde bajo el terreno hasta su lugar sobre la huella.
    guia.visible = false;
    bloque.position.y = suelo - m.alto - 0.5;
    // La sombra del bloque sigue la subida.
    tween = gsap.to(bloque.position, {
      y: base,
      duration: SUBIDA,
      ease: 'power2.out',
      onUpdate: pedirSombra,
      onComplete: () => {
        guia.visible = true;
        pedirSombra();
      },
    });
  }
  suscribir(['capas', 'escala'], pintar);
  pintar(obtener());

  // Punto de la cara dibujada en fracciones (u desde la izquierda, v desde arriba), en la posición actual.
  function puntoCara(u, v, afuera = 0) {
    return new THREE.Vector3(x, bloque.position.y + (1 - v) * m.alto, z)
      .addScaledVector(derecha, (u - 0.5) * m.ancho)
      .addScaledVector(normal, m.fondo / 2 + afuera);
  }

  return {
    grupo,
    perfil,
    puntoCara,
    visible: () => grupo.visible,
    enSuLugar: () => grupo.visible && Math.abs(bloque.position.y - base) < 0.01,
    // Verificación: posición, medidas y estado de la subida.
    datos: () => ({
      visible: grupo.visible,
      enSuLugar: grupo.visible && Math.abs(bloque.position.y - base) < 0.01,
      centro: [x, base + m.alto / 2, z],
      base: Number((base - suelo).toFixed(2)),
      medidas: m,
    }),
  };
}
