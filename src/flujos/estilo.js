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
  // Radios desde parches de hábitat (etapa 8.b): «relleno» es la opacidad del disco.
  enemigos: {
    color: 0xff9a7a, halo: 0x4a1408, forma: 'rombo', tamano: 10, velocidad: 14, separacion: 30, relleno: 0.2,
    linea: { color: 0xff9a7a, ancho: 2.4, halo: 0x4a1408, borde: 2, encima: true, orden: 40 },
  },
  polinizadores: {
    color: 0xffe866, halo: 0x4a3a00, forma: 'circulo', tamano: 9, velocidad: 28, separacion: 46, relleno: 0.13,
    linea: { color: 0xffe866, ancho: 2.4, halo: 0x4a3a00, borde: 2, encima: true, orden: 44 },
  },
  // Prácticas de conservación en la ladera (etapa 8.b): trazos sobre las curvas de nivel; la barrera viva lleva
  // puntos fijos y el agua que se infiltra baja hasta ella.
  curvas_nivel: { linea: { color: 0xfff3c4, ancho: 1.6, halo: 0x4a3a1a, borde: 1.6, encima: true, orden: 46 } },
  barreras_vivas: {
    color: 0x9be27a, halo: 0x12360c, forma: 'circulo', tamano: 9, velocidad: 0, separacion: 0,
    linea: { color: 0x6fce52, ancho: 3.2, halo: 0x12360c, borde: 2.2, encima: true, orden: 48 },
  },
  terrazas: { linea: { color: 0xe9c9a0, ancho: 5, halo: 0x553a1f, borde: 3, encima: true, orden: 50 } },
  infiltracion: { color: 0xbfe6ff, halo: 0x12324f, forma: 'circulo', tamano: 8, velocidad: 7, separacion: 9 },
  // Nodo fijo de la red de semillas.
  custodio: { color: 0xffffff, halo: 0x3b1450, forma: 'rombo', tamano: 26, velocidad: 0, separacion: 0 },
};

export const css = (hex) => `#${hex.toString(16).padStart(6, '0')}`;
