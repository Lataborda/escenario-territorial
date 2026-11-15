// Color, forma y tamaño de cada flujo (etapa 8). La leyenda (src/ui/flujos.js) usa los mismos valores; los rótulos
// están en contenido/procesos.json. Sin Three.js. tamano: diámetro de la partícula en píxeles a 1920×1080.
// linea: trazo bajo las partículas (crearTrazo de src/escena/lineas.js). velocidad en unidades de escena por
// segundo; separacion: distancia entre partículas de una misma ruta.
export const FORMAS = { circulo: 0, cuadrado: 1, rombo: 2 };

export const ESTILO = {
  agua: {
    color: 0xbfe6ff, halo: 0x12324f, forma: 'circulo', tamano: 9, velocidad: 26, separacion: 26,
    linea: { color: 0xbfe6ff, ancho: 2, halo: 0x12324f, borde: 2, encima: true, orden: 30 },
  },
  sedimento: {
    color: 0xc9772e, halo: 0x3a1c08, forma: 'cuadrado', tamano: 11, velocidad: 26, separacion: 20,
    linea: { color: 0xc9772e, ancho: 2.2, halo: 0x3a1c08, borde: 2, encima: true, orden: 32 },
  },
  nutrientes: {
    color: 0xffb02e, halo: 0x402405, forma: 'circulo', tamano: 13, velocidad: 70, separacion: 64,
    linea: { color: 0xffb02e, ancho: 2.6, halo: 0x402405, borde: 2.4, encima: true, orden: 34 },
  },
  retorno: {
    color: 0x8fe38a, halo: 0x10360f, forma: 'rombo', tamano: 14, velocidad: 70, separacion: 64,
    linea: { color: 0x8fe38a, ancho: 2.6, halo: 0x10360f, borde: 2.4, encima: true, orden: 36 },
  },
  semillas: {
    color: 0xf2c8ff, halo: 0x3b1450, forma: 'rombo', tamano: 12, velocidad: 34, separacion: 40,
    linea: { color: 0xd9a2f2, ancho: 2.6, halo: 0x3b1450, borde: 2.4, encima: true, orden: 38 },
  },
  // Nodo fijo de la red de semillas.
  custodio: { color: 0xffffff, halo: 0x3b1450, forma: 'rombo', tamano: 26, velocidad: 0, separacion: 0 },
};

export const css = (hex) => `#${hex.toString(16).padStart(6, '0')}`;
