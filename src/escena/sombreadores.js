// Sombreadores del posproceso de diorama (posproceso.js). Coordenadas de píxel con gl_FragCoord; sin ruido temporal:
// la rotación de las muestras sigue un patrón de Bayer de 4×4, fijo por píxel, que el suavizado de 4×4 promedia.

export const VERTICES = /* glsl */ `
void main() {
  gl_Position = vec4( position.xy, 0.0, 1.0 );
}
`;

// Oclusión ambiental desde la profundidad, a media resolución. Normal reconstruida con los vecinos de menor salto;
// muestras en espiral dentro de un radio fijo en pantalla, limitado en unidades de escena. Salida: oclusión (r) y
// profundidad de vista (g) para el suavizado.
export const OCLUSION = /* glsl */ `
uniform sampler2D tProfundidad;
uniform vec2 tamano;
uniform mat4 proyeccionInversa;
uniform float escalaPx;
uniform float radioPx;
uniform vec2 radioMundo;

const int MUESTRAS = 12;

vec3 vista( vec2 uv ) {
  float d = textureLod( tProfundidad, uv, 0.0 ).x;
  vec4 p = proyeccionInversa * vec4( vec3( uv, d ) * 2.0 - 1.0, 1.0 );
  return p.xyz / p.w;
}

float bayer( vec2 p ) {
  ivec2 q = ivec2( mod( p, 4.0 ) );
  int b[ 16 ] = int[ 16 ]( 0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5 );
  return ( float( b[ q.x + q.y * 4 ] ) + 0.5 ) / 16.0;
}

void main() {
  vec2 t = 1.0 / tamano;
  vec2 uv = gl_FragCoord.xy * t;
  if ( textureLod( tProfundidad, uv, 0.0 ).x >= 1.0 ) {
    gl_FragColor = vec4( 1.0, 1.0e4, 0.0, 1.0 );
    return;
  }
  vec3 p = vista( uv );
  vec3 l = vista( uv - vec2( t.x, 0.0 ) );
  vec3 r = vista( uv + vec2( t.x, 0.0 ) );
  vec3 b = vista( uv - vec2( 0.0, t.y ) );
  vec3 a = vista( uv + vec2( 0.0, t.y ) );
  vec3 dx = abs( r.z - p.z ) < abs( p.z - l.z ) ? r - p : p - l;
  vec3 dy = abs( a.z - p.z ) < abs( p.z - b.z ) ? a - p : p - b;
  vec3 n = normalize( cross( dx, dy ) );
  float z = - p.z;
  float porUnidad = escalaPx / z;
  float radio = clamp( radioPx / porUnidad, radioMundo.x, radioMundo.y );
  float rpx = radio * porUnidad;
  float giro = bayer( gl_FragCoord.xy );
  float suma = 0.0;
  for ( int i = 0; i < MUESTRAS; i ++ ) {
    float f = ( float( i ) + giro ) / float( MUESTRAS );
    float ang = float( i ) * 2.3999632 + giro * 6.2831853;
    vec2 o = vec2( cos( ang ), sin( ang ) ) * max( f * rpx, 1.0 ) * t;
    vec3 v = vista( uv + o ) - p;
    float dist = length( v );
    float caida = 1.0 - smoothstep( 0.5 * radio, radio, dist );
    suma += max( dot( v, n ) / max( dist, 1.0e-4 ) - 0.1, 0.0 ) * caida;
  }
  gl_FragColor = vec4( clamp( 1.0 - 1.6 * suma / float( MUESTRAS ), 0.0, 1.0 ), z, 0.0, 1.0 );
}
`;

// Suavizado de 4×4 de la oclusión que respeta los saltos de profundidad (cubre las 16 rotaciones del patrón).
export const SUAVIZADO = /* glsl */ `
uniform sampler2D tOclusion;

void main() {
  ivec2 p = ivec2( gl_FragCoord.xy );
  ivec2 limite = textureSize( tOclusion, 0 ) - 1;
  vec2 c = texelFetch( tOclusion, p, 0 ).rg;
  float tolerancia = 0.03 * c.g + 0.2;
  float suma = 0.0;
  float peso = 0.0;
  for ( int j = -2; j < 2; j ++ ) {
    for ( int i = -2; i < 2; i ++ ) {
      vec2 s = texelFetch( tOclusion, clamp( p + ivec2( i, j ), ivec2( 0 ), limite ), 0 ).rg;
      float w = 1.0 - smoothstep( 0.0, tolerancia, abs( s.g - c.g ) );
      suma += s.r * w;
      peso += w;
    }
  }
  gl_FragColor = vec4( suma / max( peso, 1.0e-4 ), c.g, 0.0, 1.0 );
}
`;

// Composición y desenfoque de miniatura en una dirección: nítido en la banda del foco y gaussiano hacia arriba y abajo.
// La pasada horizontal aplica la oclusión (CON_OCLUSION = 1); la última pasada escribe en sRGB (colorspace_fragment).
export const DIFUSION = /* glsl */ `
uniform sampler2D tColor;
uniform sampler2D tOclusion;
uniform float intensidadOclusion;
uniform vec2 tamano;
uniform vec2 direccion;
uniform float radioMaximo;
uniform float centro;
uniform float banda;

vec3 muestra( vec2 uv ) {
  vec3 c = texture( tColor, uv ).rgb;
#if CON_OCLUSION == 1
  c *= mix( 1.0, texture( tOclusion, uv ).r, intensidadOclusion );
#endif
  return c;
}

void main() {
  vec2 uv = gl_FragCoord.xy / tamano;
  float r = radioMaximo * smoothstep( banda, 0.5, abs( uv.y - centro ) );
  vec3 color;
  if ( r < 0.3 ) {
    color = muestra( uv );
  } else {
    vec3 suma = vec3( 0.0 );
    float peso = 0.0;
    for ( int k = -4; k <= 4; k ++ ) {
      float w = exp( - float( k * k ) / 8.0 );
      suma += muestra( uv + direccion * ( float( k ) * r * 0.25 ) / tamano ) * w;
      peso += w;
    }
    color = suma / peso;
  }
  gl_FragColor = vec4( color, 1.0 );
  #include <colorspace_fragment>
}
`;
