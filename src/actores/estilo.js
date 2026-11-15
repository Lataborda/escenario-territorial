// Color, forma y ancho de los elementos de la red de actores (etapa 9.a). La leyenda (src/ui/flujos.js) usa los
// mismos valores; los rótulos están en contenido/actores.json (red). Sin Three.js. tamano: diámetro del punto en
// píxeles a 1920×1080; separacion: distancia entre las cuentas fijas de un enlace; arco: forma del enlace (flecha,
// lado y comba de src/flujos/curvas.js). Las capas son quietas: velocidad 0.
export const ESTILO = {
  // Nodos.
  mercado: { color: 0xfff3d9, halo: 0x3a2410, forma: 'cuadrado', tamano: 30, velocidad: 0, separacion: 0 },
  familia: { color: 0xffffff, halo: 0x4a3205, forma: 'circulo', tamano: 16, velocidad: 0, separacion: 0 },
  aliado: { color: 0xffffff, halo: 0x0c3b34, forma: 'rombo', tamano: 24, velocidad: 0, separacion: 0 },
  // Enlaces por tipo de relación: trazo grueso con halo y cuentas fijas de forma propia.
  comercio: {
    color: 0xffc247, halo: 0x4a3205, forma: 'circulo', tamano: 9, velocidad: 0, separacion: 24,
    linea: { color: 0xffc247, ancho: 4, halo: 0x4a3205, borde: 2.6, encima: true, orden: 34 },
    arco: { flecha: 0.1 },
  },
  garantia: {
    color: 0xa5f2e3, halo: 0x0c3b34, forma: 'rombo', tamano: 12, velocidad: 0, separacion: 26,
    linea: { color: 0x5fd6c0, ancho: 3.2, halo: 0x0c3b34, borde: 2.4, encima: true, orden: 38 },
    arco: { flecha: 0.17, lado: 1, comba: 0.12 },
  },
  // Polígono del territorio de la red: «relleno» es la opacidad de la superficie.
  poligono: { color: 0xfff1c9, relleno: 0.26, linea: { color: 0xfff7e0, ancho: 4.5, halo: 0x2b2118, borde: 3, encima: true, orden: 26 } },
  // Límites administrativos: trazo discontinuo («guion» y «hueco» en unidades de escena).
  limite_departamental: { guion: 16, hueco: 9, linea: { color: 0xffffff, ancho: 3.4, halo: 0x2e2a25, borde: 2.6, encima: true, orden: 22 } },
  limite_municipal: { guion: 7, hueco: 6, linea: { color: 0xece7dd, ancho: 1.6, halo: 0x2e2a25, borde: 1.6, encima: true, orden: 20 } },
};
