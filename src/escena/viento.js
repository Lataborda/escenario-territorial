// Viento leve en la vegetación (etapa 5.c.c): desplazamiento en el sombreador de vértices, sin costo de CPU. Las
// formas tienen la base en y = 0: el vaivén crece con el cuadrado de la altura relativa y sigue una onda que recorre
// el plano con ráfagas lentas. Un reloj compartido por todos los materiales; quieto (tiempo fijo) en la verificación
// automática y con #captura=1, para que las capturas sean idénticas en cada carga. El modo liviano lo apaga.
// La sombra proyectada no sigue el vaivén (amplitud pequeña).
import { obtener, suscribir } from '../estado.js';

const RELOJ = { tiempo: { value: 0 }, fuerza: { value: 1 } };
const DT_MAXIMO = 0.1; // s: un cuadro lento no hace saltar el vaivén

let quieto = false;
let fijado = null;
let intensidad = 1;

// Inicio desde la escena: intensidad del hash (#viento=0 lo apaga) y reloj quieto en la verificación.
export function crearViento({ captura = false, viento = 1 } = {}) {
  quieto = captura || navigator.webdriver === true;
  intensidad = viento;
  const aplicar = ({ liviano }) => {
    RELOJ.fuerza.value = liviano ? 0 : intensidad;
  };
  suscribir('liviano', aplicar);
  aplicar(obtener());
  return {
    avanzar(dt) {
      if (quieto || fijado != null) return;
      RELOJ.tiempo.value += Math.min(dt, DT_MAXIMO);
    },
    // Verificación: fija el reloj en t segundos (null lo devuelve a su marcha).
    fijar(t) {
      fijado = t;
      if (t != null) RELOJ.tiempo.value = t;
    },
    datos: () => ({ tiempo: Number(RELOJ.tiempo.value.toFixed(3)), fuerza: RELOJ.fuerza.value, quieto: quieto || fijado != null }),
  };
}

const VAIVEN = /* glsl */ `
vec4 mvPosition = vec4( transformed, 1.0 );
vec3 vientoBase = vec3( 0.0 );
float vientoEscala = 1.0;
#ifdef USE_INSTANCING
mvPosition = instanceMatrix * mvPosition;
vientoBase = instanceMatrix[ 3 ].xyz;
vientoEscala = length( instanceMatrix[ 1 ].xyz );
#endif
{
  float h = clamp( position.y / uVientoAlto, 0.0, 1.4 );
  float peso = h * h * ( PESO_VIENTO );
  float fase = uVientoTiempo * 1.6 + dot( vientoBase.xz, vec2( 0.045, 0.031 ) );
  float rafaga = 0.6 + 0.4 * sin( uVientoTiempo * 0.37 + dot( vientoBase.xz, vec2( 0.007, 0.005 ) ) );
  float vaiven = 0.5 + 0.5 * sin( fase ) + 0.22 * sin( fase * 2.7 + position.x * 1.9 + position.z * 1.3 );
  vec2 d = vec2( 0.8, 0.6 ) * vaiven * rafaga + vec2( -0.6, 0.8 ) * 0.25 * sin( fase * 1.3 + 1.7 );
  mvPosition.xz += d * ( uVientoAmplitud * uVientoAlto * vientoEscala * peso * uVientoFuerza );
}
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;
`;

/**
 * Agrega el vaivén a un material (encadena el onBeforeCompile previo). alto: altura de la forma en su escala local;
 * amplitud: desplazamiento en la punta como fracción del alto; peso: expresión GLSL por vértice (por ejemplo, para
 * que los tallos de la caña se muevan menos que las hojas).
 */
export function conViento(material, { alto, amplitud = 0.012, peso = '1.0' }) {
  const previo = material.onBeforeCompile;
  // Clave del programa previo: la propia del material o el texto de su onBeforeCompile.
  const propia = Object.prototype.hasOwnProperty.call(material, 'customProgramCacheKey');
  const clave = propia ? material.customProgramCacheKey() : previo.toString();
  const propios = { uVientoAlto: { value: Math.max(alto, 0.01) }, uVientoAmplitud: { value: amplitud } };
  material.onBeforeCompile = (s, renderizador) => {
    previo.call(material, s, renderizador);
    Object.assign(s.uniforms, propios, { uVientoTiempo: RELOJ.tiempo, uVientoFuerza: RELOJ.fuerza });
    s.vertexShader = s.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uVientoTiempo;\nuniform float uVientoFuerza;\nuniform float uVientoAlto;\nuniform float uVientoAmplitud;')
      .replace('#include <project_vertex>', VAIVEN.replace('PESO_VIENTO', peso));
  };
  // Mismo programa para todas las formas con el mismo peso: alto y amplitud van en uniformes propios.
  material.customProgramCacheKey = () => `${clave}|viento:${peso}`;
  material.userData.viento = propios;
  return material;
}
