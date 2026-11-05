// Renderizador, cámara, luces, controles de órbita y ciclo de dibujo. Luz de diorama (etapa 5.c.c): sol cálido con
// sombra suave, cielo claro, viento (viento.js) y posproceso con oclusión ambiental y miniatura (posproceso.js).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { obtener, suscribir } from '../estado.js';
import { crearPosproceso } from './posproceso.js';
import { crearViento } from './viento.js';

const COLOR_FONDO = 0xe8e4dc;
const RELACION_PIXELES_MAX = 2;
// Con la interfaz visible, el centro de la vista se corre a la izquierda para quedar
// entre la botonera y la ficha (medidas de src/ui/interfaz.css, en rem).
const DESPLAZAMIENTO_REM = 8;

// Vista general inicial: ángulos en grados respecto del centro de la maqueta.
// Desde el suroccidente: la ladera, orientada al occidente, mira a la cámara.
const VISTA_GENERAL = { distancia: 2500, azimut: -30, elevacion: 38 };
// Sombra suave: radio del filtro PCF en texeles del mapa e intensidad (la luz del cielo aclara la sombra).
const SOMBRA = { mapa: 2048, radio: 3, intensidad: 0.85 };

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
  // Luz cenital suave: cielo claro, algo frío, y rebote cálido de la mesa.
  grupo.add(new THREE.HemisphereLight(0xf6f8ff, 0xd3c8b6, 1.4));
  // Una sola sombra direccional, desde el noroccidente: la sombra cae hacia la cámara. Sol de tarde, algo cálido.
  const sol = new THREE.DirectionalLight(0xfff4e2, 2.05);
  sol.position.set(-700, 1800, -250);
  sol.castShadow = true;
  sol.shadow.mapSize.set(SOMBRA.mapa, SOMBRA.mapa);
  sol.shadow.radius = SOMBRA.radio;
  sol.shadow.intensity = SOMBRA.intensidad;
  const s = sol.shadow.camera;
  s.left = -1100;
  s.right = 1100;
  s.top = 1100;
  s.bottom = -1100;
  s.near = 100;
  s.far = 4000;
  sol.shadow.bias = -0.0005;
  grupo.add(sol, sol.target);
  return { grupo, sol };
}

/** opciones: { captura, viento, oclusion, miniatura } (parámetros del hash, parametros.js). */
export function crearEscena(contenedor, opciones = {}) {
  const renderizador = new THREE.WebGLRenderer({ antialias: true });
  renderizador.setPixelRatio(Math.min(window.devicePixelRatio, RELACION_PIXELES_MAX));
  renderizador.setSize(contenedor.clientWidth, contenedor.clientHeight);
  renderizador.shadowMap.enabled = true;
  renderizador.shadowMap.type = THREE.PCFShadowMap;
  // Cifras de todas las pasadas del cuadro (sombra, escena y posproceso): se ponen en cero al empezar cada cuadro.
  renderizador.info.autoReset = false;
  contenedor.appendChild(renderizador.domElement);

  const escena = new THREE.Scene();
  escena.background = new THREE.Color(COLOR_FONDO);
  const luces = crearLuces();
  escena.add(luces.grupo);

  const aspecto = contenedor.clientWidth / contenedor.clientHeight;
  const camara = new THREE.PerspectiveCamera(35, aspecto, 10, 20000);
  camara.position.copy(posicionEsferica(VISTA_GENERAL));
  camara.lookAt(0, 0, 0);
  const posproceso = crearPosproceso(renderizador, escena, camara, opciones);
  const viento = crearViento(opciones);

  // Modo libre: órbita y zoom sin pasar bajo la mesa. Sin arrastre lateral: el objetivo se mueve con
  // el doble clic y el teclado (src/navegacion/libre.js), que también limita la cámara. Inactivos en el recorrido.
  const controles = new OrbitControls(camara, renderizador.domElement);
  controles.enableDamping = true;
  controles.dampingFactor = 0.08;
  controles.enablePan = false;
  controles.minDistance = 40;
  controles.maxDistance = 5000;
  controles.maxPolarAngle = THREE.MathUtils.degToRad(84);
  controles.target.set(0, 0, 0);
  controles.enabled = false;

  function desplazar() {
    const ancho = contenedor.clientWidth;
    const alto = contenedor.clientHeight;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const dx = obtener().interfaz ? Math.round(DESPLAZAMIENTO_REM * rem) : 0;
    if (dx) camara.setViewOffset(ancho, alto, dx, 0, ancho, alto);
    else camara.clearViewOffset();
  }

  function ajustarTamano() {
    const ancho = contenedor.clientWidth;
    const alto = contenedor.clientHeight;
    camara.aspect = ancho / alto;
    desplazar();
    camara.updateProjectionMatrix();
    renderizador.setSize(ancho, alto);
  }
  window.addEventListener('resize', ajustarTamano);
  suscribir('interfaz', desplazar);
  desplazar();

  // Modo liviano (tecla V): sin sombras y con relación de píxeles 1.
  suscribir('liviano', ({ liviano }) => {
    luces.sol.castShadow = !liviano;
    renderizador.setPixelRatio(liviano ? 1 : Math.min(window.devicePixelRatio, RELACION_PIXELES_MAX));
  });

  let avisarPrimerCuadro;
  const primerCuadro = new Promise((resolver) => {
    avisarPrimerCuadro = resolver;
  });

  // Funciones por cuadro (dt en segundos), después de los controles y antes del dibujo.
  // Una que falla se registra una vez y sale de la lista.
  const porCuadro = [];
  let ultimo = null;
  function cadaCuadro() {
    const ahora = performance.now();
    const dt = ultimo == null ? 0 : (ahora - ultimo) / 1000;
    ultimo = ahora;
    for (const fn of [...porCuadro]) {
      try {
        fn(dt);
      } catch (error) {
        console.error('Función por cuadro:', error);
        porCuadro.splice(porCuadro.indexOf(fn), 1);
      }
    }
  }

  let marca = null;
  function cuadro() {
    const ahora = performance.now();
    viento.avanzar(marca == null ? 0 : (ahora - marca) / 1000);
    marca = ahora;
    if (controles.enabled) controles.update();
    cadaCuadro();
    renderizador.info.reset();
    posproceso.dibujar();
    if (avisarPrimerCuadro) {
      avisarPrimerCuadro();
      avisarPrimerCuadro = null;
    }
  }

  // Coloca la cámara en una posición mirando a un objetivo.
  function colocar(posicion, objetivo) {
    camara.position.copy(posicion);
    controles.target.copy(objetivo);
    camara.lookAt(objetivo);
  }

  // Coloca la cámara al instante respecto de un punto (ángulos en grados). Uso de la verificación.
  function mirar(objetivo, vista = VISTA_GENERAL) {
    const destino = objetivo ?? new THREE.Vector3();
    colocar(destino.clone().add(posicionEsferica({ ...VISTA_GENERAL, ...vista })), destino);
  }

  return {
    escena,
    camara,
    renderizador,
    controles,
    colocar,
    mirar,
    agregar: (objeto) => escena.add(objeto),
    alCuadro: (fn) => porCuadro.push(fn),
    iniciar: () => renderizador.setAnimationLoop(cuadro),
    // Verificación: sin ciclo de dibujo el navegador responde de inmediato; un cuadro antes de cada captura.
    pausar: () => renderizador.setAnimationLoop(null),
    dibujar: cuadro,
    primerCuadro: () => primerCuadro,
    // Cifras de rendimiento para la verificación automática.
    estadisticas: () => ({
      llamadas: renderizador.info.render.calls,
      triangulos: renderizador.info.render.triangles,
      geometrias: renderizador.info.memory.geometries,
      texturas: renderizador.info.memory.textures,
      relacionPixeles: renderizador.getPixelRatio(),
    }),
    // Luz y posproceso: efectos activos, sombra y viento.
    luz: () => ({
      ...posproceso.datos(),
      sombra: { activa: luces.sol.castShadow, radio: luces.sol.shadow.radius, intensidad: luces.sol.shadow.intensity, mapa: luces.sol.shadow.mapSize.x },
      viento: viento.datos(),
    }),
    fijarViento: (t) => viento.fijar(t),
  };
}
