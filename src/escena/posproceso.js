// Posproceso de diorama (etapa 5.c.c). La escena se dibuja en un destino con MSAA y textura de profundidad; la
// oclusión ambiental sale de esa profundidad a media resolución (sin un segundo dibujo de la escena) y se suaviza
// respetando los bordes; el desenfoque de miniatura (tilt-shift) va en dos pasadas separables y la última escribe en
// sRGB. Patrón de muestreo fijo: el resultado depende solo de la escena y de la cámara (sin ruido temporal). Solo afecta
// al lienzo: la interfaz HTML queda nítida. Reacciona a «liviano» (dibujo directo, sin posproceso) y a «miniatura»
// (tecla M). Intensidades del hash: #ao=0 a 1 y #mini=0 a 1 (0 apaga el efecto).
import * as THREE from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { obtener, suscribir } from '../estado.js';
import { VERTICES, OCLUSION, SUAVIZADO, DIFUSION } from './sombreadores.js';

const MSAA = 4;
const RADIO_OCLUSION = 0.022; // radio de la oclusión en pantalla, como fracción del alto de la imagen
const RADIO_MUNDO = [0.4, 8]; // límites del radio en unidades de escena
const FUERZA_OCLUSION = 0.7; // oscurecimiento máximo con #ao=1
const MINIATURA = { centro: 0.5, banda: 0.15, radio: 0.0065 }; // banda nítida: ±15 % del alto; radio: fracción del alto

const material = (fragmentShader, uniforms, defines = {}) =>
  new THREE.ShaderMaterial({ vertexShader: VERTICES, fragmentShader, uniforms, defines, depthTest: false, depthWrite: false });

export function crearPosproceso(renderizador, escena, camara, { oclusion = 1, miniatura = 1 } = {}) {
  const lineal = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false };
  const principal = new THREE.WebGLRenderTarget(1, 1, {
    ...lineal,
    samples: MSAA,
    colorSpace: THREE.SRGBColorSpace,
    depthTexture: new THREE.DepthTexture(1, 1),
  });
  const intermedio = new THREE.WebGLRenderTarget(1, 1, { ...lineal, colorSpace: THREE.SRGBColorSpace, depthBuffer: false });
  const cercano = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, generateMipmaps: false };
  const crudo = new THREE.WebGLRenderTarget(1, 1, { ...cercano, type: THREE.HalfFloatType, depthBuffer: false });
  const suave = new THREE.WebGLRenderTarget(1, 1, { ...lineal, type: THREE.HalfFloatType, depthBuffer: false });

  const pOclusion = material(OCLUSION, {
    tProfundidad: { value: principal.depthTexture },
    tamano: { value: new THREE.Vector2() },
    proyeccionInversa: { value: new THREE.Matrix4() },
    escalaPx: { value: 1 },
    radioPx: { value: 1 },
    radioMundo: { value: new THREE.Vector2(...RADIO_MUNDO) },
  });
  const pSuavizado = material(SUAVIZADO, { tOclusion: { value: crudo.texture } });
  const difusion = (conOclusion, color, direccion) =>
    material(
      DIFUSION,
      {
        tColor: { value: color.texture },
        tOclusion: { value: suave.texture },
        intensidadOclusion: { value: 0 },
        tamano: { value: new THREE.Vector2() },
        direccion: { value: new THREE.Vector2(...direccion) },
        radioMaximo: { value: 0 },
        centro: { value: MINIATURA.centro },
        banda: { value: MINIATURA.banda },
      },
      { CON_OCLUSION: conOclusion ? 1 : 0 },
    );
  const pHorizontal = difusion(true, principal, [1, 0]);
  const pVertical = difusion(false, intermedio, [0, 1]);
  const cuadro = new FullScreenQuad();

  const ajuste = { oclusion: Math.max(0, oclusion), miniatura: Math.max(0, miniatura) };
  let liviano = obtener().liviano;
  let conMiniatura = obtener().miniatura;
  suscribir(['liviano', 'miniatura'], (e) => {
    liviano = e.liviano;
    conMiniatura = e.miniatura;
  });
  const efectos = () => ({
    oclusion: !liviano && ajuste.oclusion > 0,
    miniatura: !liviano && conMiniatura && ajuste.miniatura > 0,
  });

  // Tamaño de los destinos según el lienzo (cambia con la ventana y con la relación de píxeles del modo liviano).
  const lienzo = new THREE.Vector2();
  const medida = new THREE.Vector2();
  function ajustar() {
    renderizador.getDrawingBufferSize(lienzo);
    if (lienzo.equals(medida)) return;
    medida.copy(lienzo);
    const [w, h] = [lienzo.x, lienzo.y];
    const [mw, mh] = [Math.ceil(w / 2), Math.ceil(h / 2)];
    principal.setSize(w, h);
    intermedio.setSize(w, h);
    crudo.setSize(mw, mh);
    suave.setSize(mw, mh);
    pOclusion.uniforms.tamano.value.set(mw, mh);
    pOclusion.uniforms.radioPx.value = RADIO_OCLUSION * mh;
    for (const p of [pHorizontal, pVertical]) {
      p.uniforms.tamano.value.set(w, h);
      p.uniforms.radioMaximo.value = MINIATURA.radio * h * ajuste.miniatura;
    }
  }

  function pasada(p, destino) {
    cuadro.material = p;
    renderizador.setRenderTarget(destino);
    cuadro.render(renderizador);
  }

  function dibujar() {
    const e = efectos();
    if (!e.oclusion && !e.miniatura) {
      renderizador.setRenderTarget(null);
      renderizador.render(escena, camara);
      return;
    }
    ajustar();
    renderizador.setRenderTarget(principal);
    renderizador.render(escena, camara);
    if (e.oclusion) {
      pOclusion.uniforms.proyeccionInversa.value.copy(camara.projectionMatrixInverse);
      pOclusion.uniforms.escalaPx.value = (camara.projectionMatrix.elements[5] * medida.y) / 4;
      pasada(pOclusion, crudo);
      pasada(pSuavizado, suave);
    }
    pHorizontal.uniforms.intensidadOclusion.value = e.oclusion ? FUERZA_OCLUSION * ajuste.oclusion : 0;
    pHorizontal.uniforms.radioMaximo.value = e.miniatura ? MINIATURA.radio * medida.y * ajuste.miniatura : 0;
    pasada(pHorizontal, e.miniatura ? intermedio : null);
    if (e.miniatura) pasada(pVertical, null);
  }

  return {
    dibujar,
    // Verificación y medidor: efectos activos e intensidades.
    datos: () => ({ ...efectos(), intensidad: { ...ajuste }, msaa: MSAA, tamano: medida.toArray() }),
  };
}
