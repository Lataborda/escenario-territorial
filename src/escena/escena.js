// Renderizador, cámara, luces, controles de órbita y ciclo de dibujo.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const COLOR_FONDO = 0xe8e4dc;
const RELACION_PIXELES_MAX = 2;

// Vista general inicial: ángulos en grados respecto del centro de la maqueta.
// Desde el suroccidente: la ladera, orientada al occidente, mira a la cámara.
const VISTA_GENERAL = { distancia: 2300, azimut: -30, elevacion: 38 };

function posicionEsferica({ distancia, azimut, elevacion }) {
  const az = THREE.MathUtils.degToRad(azimut);
  const el = THREE.MathUtils.degToRad(elevacion);
  return new THREE.Vector3(
    distancia * Math.cos(el) * Math.sin(az),
    distancia * Math.sin(el),
    distancia * Math.cos(el) * Math.cos(az),
  );
}

function crearLuces() {
  const grupo = new THREE.Group();
  grupo.name = 'luces';
  // Luz cenital suave: cielo claro y rebote cálido de la mesa.
  grupo.add(new THREE.HemisphereLight(0xffffff, 0xcfc6b8, 1.4));
  // Una sola sombra direccional, desde el noroccidente: la sombra cae hacia la cámara.
  const sol = new THREE.DirectionalLight(0xffffff, 2.0);
  sol.position.set(-700, 1800, -250);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  const s = sol.shadow.camera;
  s.left = -1100;
  s.right = 1100;
  s.top = 1100;
  s.bottom = -1100;
  s.near = 100;
  s.far = 4000;
  sol.shadow.bias = -0.0005;
  grupo.add(sol, sol.target);
  return grupo;
}

export function crearEscena(contenedor) {
  const renderizador = new THREE.WebGLRenderer({ antialias: true });
  renderizador.setPixelRatio(Math.min(window.devicePixelRatio, RELACION_PIXELES_MAX));
  renderizador.setSize(contenedor.clientWidth, contenedor.clientHeight);
  renderizador.shadowMap.enabled = true;
  renderizador.shadowMap.type = THREE.PCFShadowMap;
  contenedor.appendChild(renderizador.domElement);

  const escena = new THREE.Scene();
  escena.background = new THREE.Color(COLOR_FONDO);
  escena.add(crearLuces());

  const aspecto = contenedor.clientWidth / contenedor.clientHeight;
  const camara = new THREE.PerspectiveCamera(35, aspecto, 10, 20000);
  camara.position.copy(posicionEsferica(VISTA_GENERAL));
  camara.lookAt(0, 0, 0);

  // Modo libre: órbita y zoom sin pasar bajo la mesa.
  const controles = new OrbitControls(camara, renderizador.domElement);
  controles.enableDamping = true;
  controles.dampingFactor = 0.08;
  controles.minDistance = 300;
  controles.maxDistance = 5000;
  controles.maxPolarAngle = THREE.MathUtils.degToRad(84);
  controles.target.set(0, 0, 0);

  function ajustarTamano() {
    const ancho = contenedor.clientWidth;
    const alto = contenedor.clientHeight;
    camara.aspect = ancho / alto;
    camara.updateProjectionMatrix();
    renderizador.setSize(ancho, alto);
  }
  window.addEventListener('resize', ajustarTamano);

  let avisarPrimerCuadro;
  const primerCuadro = new Promise((resolver) => {
    avisarPrimerCuadro = resolver;
  });

  function cuadro() {
    controles.update();
    renderizador.render(escena, camara);
    if (avisarPrimerCuadro) {
      avisarPrimerCuadro();
      avisarPrimerCuadro = null;
    }
  }

  // Coloca la cámara al instante respecto de un punto (ángulos en grados).
  function mirar(objetivo, vista = VISTA_GENERAL) {
    const destino = objetivo ?? new THREE.Vector3();
    camara.position.copy(destino).add(posicionEsferica({ ...VISTA_GENERAL, ...vista }));
    controles.target.copy(destino);
    camara.lookAt(destino);
    controles.update();
  }

  return {
    escena,
    camara,
    renderizador,
    controles,
    mirar,
    agregar: (objeto) => escena.add(objeto),
    iniciar: () => renderizador.setAnimationLoop(cuadro),
    primerCuadro: () => primerCuadro,
    // Cifras de rendimiento para la verificación automática.
    estadisticas: () => ({
      llamadas: renderizador.info.render.calls,
      triangulos: renderizador.info.render.triangles,
      geometrias: renderizador.info.memory.geometries,
      texturas: renderizador.info.memory.textures,
      relacionPixeles: renderizador.getPixelRatio(),
    }),
  };
}
