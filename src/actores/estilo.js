// Color, forma y ancho de los elementos de la red de actores (etapa 9.a). La leyenda (src/ui/flujos.js) usa los
// mismos valores; los rótulos están en contenido/actores.json (red). Sin Three.js. tamano: diámetro del punto en
// píxeles a 1920×1080; separacion: distancia entre las cuentas fijas de un enlace; arco: forma del enlace (flecha,
// lado y comba de src/flujos/curvas.js). Las capas son quietas: velocidad 0.
export const ESTILO = {
  // Nodos.
  mercado: { color: 0xfff3d9, halo: 0x3a2410, forma: 'cuadrado', tamano: 30, velocidad: 0, separacion: 0 },
  familia: { color: 0xffffff, halo: 0x4a3205, forma: 'circulo', tamano: 16, velocidad: 0, separacion: 0 },
  aliado: { color: 0xffffff, halo: 0x0c3b34, forma: 'rombo', tamano: 24, velocidad: 0, separacion: 0 },
  // Categorías de actor (etapa 9.b), además de «familia» y «aliado».
  comunitario: { color: 0xb9f29b, halo: 0x12360c, forma: 'rombo', tamano: 24, velocidad: 0, separacion: 0 },
  institucional: { color: 0xa9d4ff, halo: 0x0d2a4a, forma: 'cuadrado', tamano: 22, velocidad: 0, separacion: 0 },
  regimen: { color: 0xf08a70, halo: 0x4a1408, forma: 'cuadrado', tamano: 22, velocidad: 0, separacion: 0 },
  consumo: { color: 0xffe08a, halo: 0x4a3a00, forma: 'circulo', tamano: 22, velocidad: 0, separacion: 0 },
  // Enlaces por tipo de relación: trazo grueso con halo y cuentas fijas de forma propia.
  comercio: {
    color: 0xffc247, halo: 0x4a3205, forma: 'circulo', tamano: 9, velocidad: 0, separacion: 24,
    linea: { color: 0xffc247, ancho: 4, halo: 0x4a3205, borde: 2.6, encima: true, orden: 34 },
    arco: { flecha: 0.1 },
    nodos: true,
  },
  garantia: {
    color: 0xa5f2e3, halo: 0x0c3b34, forma: 'rombo', tamano: 12, velocidad: 0, separacion: 26,
    linea: { color: 0x5fd6c0, ancho: 3.2, halo: 0x0c3b34, borde: 2.4, encima: true, orden: 38 },
    arco: { flecha: 0.17, lado: 1, comba: 0.12 },
    nodos: true,
  },
  // Enlaces entre actores (etapa 9.b): sus nodos los dibuja marcadores.js.
  conocimiento: {
    color: 0xb5dcff, halo: 0x0d2a4a, forma: 'cuadrado', tamano: 10, velocidad: 0, separacion: 26,
    linea: { color: 0x7fbcff, ancho: 3.2, halo: 0x0d2a4a, borde: 2.4, encima: true, orden: 40 },
    arco: { flecha: 0.2, lado: -1, comba: 0.1 },
  },
  semillas: {
    color: 0xf2c8ff, halo: 0x3b1450, forma: 'rombo', tamano: 12, velocidad: 0, separacion: 28,
    linea: { color: 0xd9a2f2, ancho: 3.2, halo: 0x3b1450, borde: 2.4, encima: true, orden: 42 },
    arco: { flecha: 0.14, lado: 1, comba: 0.06 },
  },
  gobernanza: {
    color: 0xe8e3da, halo: 0x2e2a25, forma: 'circulo', tamano: 9, velocidad: 0, separacion: 22,
    linea: { color: 0xcfc9be, ancho: 3.2, halo: 0x2e2a25, borde: 2.4, encima: true, orden: 44 },
    arco: { flecha: 0.12, lado: -1, comba: 0.05 },
  },
  proximidad: {
    color: 0xffe9a8, halo: 0x4a3205, forma: 'circulo', tamano: 9, velocidad: 0, separacion: 20,
    linea: { color: 0xffd060, ancho: 3.6, halo: 0x4a3205, borde: 2.6, encima: true, orden: 46 },
    arco: { flecha: 0.12 },
    nodos: true,
  },
  compras: {
    color: 0xffb48a, halo: 0x4a1c08, forma: 'cuadrado', tamano: 10, velocidad: 0, separacion: 22,
    linea: { color: 0xff8f52, ancho: 3.6, halo: 0x4a1c08, borde: 2.6, encima: true, orden: 48 },
    arco: { flecha: 0.2, lado: 1, comba: 0.14 },
    nodos: true,
  },
  // Polígono del territorio de la red: «relleno» es la opacidad de la superficie.
  poligono: { color: 0xfff1c9, relleno: 0.26, linea: { color: 0xfff7e0, ancho: 4.5, halo: 0x2b2118, borde: 3, encima: true, orden: 26 } },
  // Figuras territoriales y lindero resaltado de las fincas (etapa 9.b).
  figura_territorial: { color: 0xf7b6e0, relleno: 0.3, linea: { color: 0xf7a8d8, ancho: 3.6, halo: 0x4a1038, borde: 2.6, encima: true, orden: 28 } },
  reserva_natural: { color: 0x9be27a, relleno: 0.3, linea: { color: 0x7fd65c, ancho: 7, halo: 0x12360c, borde: 2.6, encima: true, orden: 28 } },
  lindero: { linea: { color: 0xfff7e0, ancho: 3, halo: 0x2b2118, borde: 2.4, encima: true, orden: 32 } },
  // Límites administrativos: trazo discontinuo («guion» y «hueco» en unidades de escena).
  limite_departamental: { guion: 16, hueco: 9, linea: { color: 0xffffff, ancho: 3.4, halo: 0x2e2a25, borde: 2.6, encima: true, orden: 22 } },
  limite_municipal: { guion: 7, hueco: 6, linea: { color: 0xece7dd, ancho: 1.6, halo: 0x2e2a25, borde: 1.6, encima: true, orden: 20 } },
};
