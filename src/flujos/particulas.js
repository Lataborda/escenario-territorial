// Nube de partículas de un flujo (etapa 8): un THREE.Points con sombreador propio, en una sola llamada de dibujo y
// sin triángulos. Cada partícula recorre una ruta (curvas.js) según el reloj de flujos.js; la posición se calcula en
// CPU. Forma (círculo, cuadrado o rombo), color y halo oscuro por flujo (estilo.js); tamaño en píxeles de pantalla.
// Se dibuja en la superposición, sin prueba de profundidad, como los trazos de las capas.
import * as THREE from 'three';
import { crearAzar, semillaTexto } from '../util/azar.js';
import { puntoEn } from './curvas.js';
import { FORMAS } from './estilo.js';

const ALTO_REFERENCIA = 1080; // el tamaño de estilo.js vale para esta altura de ventana
const DESVANECER = 14; // unidades de escena en que la partícula aparece y desaparece en los extremos de la ruta

const VERTICES = /* glsl */ `
attribute float opacidad;
uniform float uTamano;
varying float vOpacidad;
void main() {
  vOpacidad = opacidad;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  gl_PointSize = uTamano;
}
`;

const FRAGMENTOS = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uHalo;
uniform float uForma;
uniform float uOpacidad; // fundido de la capa (src/escena/aparicion.js)
varying float vOpacidad;
void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float d = length( c );
  if ( uForma > 1.5 ) d = abs( c.x ) + abs( c.y );
  else if ( uForma > 0.5 ) d = max( abs( c.x ), abs( c.y ) ) * 1.12;
  float borde = fwidth( d );
  float cuerpo = 1.0 - smoothstep( 0.62 - borde, 0.62 + borde, d );
  float contorno = 1.0 - smoothstep( 0.96 - borde, 0.96 + borde, d );
  if ( contorno * vOpacidad * uOpacidad < 0.01 ) discard;
  gl_FragColor = vec4( mix( uHalo, uColor, cuerpo ), contorno * vOpacidad * uOpacidad );
  #include <colorspace_fragment>
}
`;

/** estilo: entrada de ESTILO. Devuelve { puntos, fijar(rutas, factor), avanzar(t), cantidad(), huella() }. */
export function crearNube(nombre, estilo) {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(estilo.color) },
      uHalo: { value: new THREE.Color(estilo.halo) },
      uForma: { value: FORMAS[estilo.forma] ?? 0 },
      uTamano: { value: estilo.tamano },
      uOpacidad: { value: 1 },
    },
    vertexShader: VERTICES,
    fragmentShader: FRAGMENTOS,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const puntos = new THREE.Points(new THREE.BufferGeometry(), material);
  puntos.name = `flujo-${nombre}`;
  puntos.frustumCulled = false;
  puntos.renderOrder = 60;
  // Tamaño en píxeles del lienzo: sigue a la ventana y a la relación de píxeles.
  puntos.onBeforeRender = (renderizador) => {
    material.uniforms.uTamano.value = Math.max(3, (estilo.tamano * renderizador.domElement.height) / ALTO_REFERENCIA);
  };

  let particulas = []; // { ruta, fase, sentido, dx, dz }
  let posiciones = new Float32Array(0);
  let opacidades = new Float32Array(0);

  /**
   * rutas: [{ ruta, sentido (1 o −1), dispersion (desvío lateral en unidades), separacion }]. factor: fracción de
   * partículas (calidad). El reparto es fijo: misma semilla, mismas fases.
   */
  function fijar(rutas, factor = 1) {
    const azar = crearAzar(semillaTexto(nombre));
    particulas = [];
    for (const r of rutas) {
      const separacion = r.separacion ?? estilo.separacion;
      const n = r.ruta.largo > 0 && separacion > 0 ? Math.max(1, Math.round((r.ruta.largo / separacion) * factor)) : 1;
      for (let i = 0; i < n; i++) {
        const fase = (i + azar()) / n;
        const a = azar() * Math.PI * 2;
        const d = (r.dispersion ?? 0) * Math.sqrt(azar());
        particulas.push({ ruta: r.ruta, fase, sentido: r.sentido ?? 1, dx: Math.cos(a) * d, dz: Math.sin(a) * d });
      }
    }
    posiciones = new Float32Array(particulas.length * 3);
    opacidades = new Float32Array(particulas.length);
    puntos.geometry.dispose();
    puntos.geometry = new THREE.BufferGeometry();
    puntos.geometry.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
    puntos.geometry.setAttribute('opacidad', new THREE.BufferAttribute(opacidades, 1));
    puntos.userData.vacio = !particulas.length;
  }

  function avanzar(t) {
    particulas.forEach((p, i) => {
      const { largo } = p.ruta;
      let s = 0;
      if (largo > 0) {
        const f = p.fase + (p.sentido * t * estilo.velocidad) / largo;
        s = (f - Math.floor(f)) * largo;
      }
      puntoEn(p.ruta, s, posiciones, i * 3);
      posiciones[i * 3] += p.dx;
      posiciones[i * 3 + 2] += p.dz;
      const margen = Math.min(DESVANECER, largo * 0.2);
      opacidades[i] = margen > 0 ? Math.min(1, s / margen, (largo - s) / margen) : 1;
    });
    if (!particulas.length) return;
    puntos.geometry.attributes.position.needsUpdate = true;
    puntos.geometry.attributes.opacidad.needsUpdate = true;
  }

  return {
    puntos,
    fijar,
    avanzar,
    cantidad: () => particulas.length,
    // Verificación: suma de las posiciones (cambia con el reloj; igual con el mismo tiempo).
    huella: () => Number(posiciones.reduce((s, v, k) => s + v * ((k % 7) + 1), 0).toFixed(2)),
  };
}
