// Colores y anchos (píxeles) de las capas de la finca. La leyenda de capas (src/ui/capas.js) usa los mismos
// colores; los rótulos están en contenido/fincas.json (capas). Sin Three.js.
export const ESTILO = {
  lindero: { color: 0x3d3226, ancho: 2.2, alto: 0.7, encima: false },
  conectores_internos: { color: 0xf2a33a, ancho: 3.5, halo: 0x3b2a12, alto: 1, encima: true, orden: 20 },
  conectores_externos: { color: 0xe2506e, ancho: 4.5, halo: 0x3a1420, alto: 1, encima: true, orden: 22 },
  eep: { color: 0x3cc8d8, ancho: 2.5, halo: 0x0f3a40, alto: 1, encima: true, orden: 16 },
  conexion_eep: { color: 0x3cc8d8, ancho: 7, halo: 0x0f3a40, alto: 1, encima: true, orden: 24 },
  agroecosistema_menor: { color: 0xffe14d, ancho: 5, halo: 0x3a3008, alto: 1, encima: true, orden: 26 },
  agroecosistema_mayor: { color: 0xffffff, ancho: 5, halo: 0x2b2a27, alto: 1, encima: true, orden: 28 },
};

// Capas del estado que encienden cada trazo (contenido/territorio.json, capas).
export const CAPAS_DE = {
  conectores_internos: ['conectores_internos', 'conectores_eap'],
  conectores_externos: ['conectores_externos', 'conectores_eap'],
  eep: ['eep'],
  conexion_eep: ['eep'],
  agroecosistema_menor: ['agroecosistema_menor'],
  agroecosistema_mayor: ['agroecosistema_mayor'],
};

export const activa = (trazo, capas) => (CAPAS_DE[trazo] ?? []).some((c) => capas.includes(c));
export const css = (hex) => `#${hex.toString(16).padStart(6, '0')}`;

// Casa, bodega y familia (unidades de escena; esquema sin escala: algo mayores que el resto para leerse a escala
// de finca).
export const CASA = {
  vivienda: { ancho: 4.6, fondo: 3.4, alto: 2.2, pared: 0xf0e6d2, techo: 0xa65232 },
  bodega: { ancho: 5.6, fondo: 4, alto: 2.6, pared: 0xd8d4ca, techo: 0x8c9096 },
  // Familia: figuras genéricas de peón de maqueta, sin rasgos (GUION, sección 10, precaución 7).
  familia: { alto: [2, 2.1, 1.4, 1.2], colores: [0x8a6d4b, 0x4f6d8a, 0xa8584a, 0x6f8a4f], cabeza: 0xeae2d2 },
};
