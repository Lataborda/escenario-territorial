// Calidad del dibujo (etapa 7.c): tres niveles en la clave «calidad» del estado. Alta: todo. Media: sin oclusión ni
// miniatura, relación de píxeles 1 y la mitad de la caña cercana. Liviana: además, sin sombras ni viento, la mitad de
// la vegetación y sin matas de caña. La tecla V recorre los tres; #calidad= la fija y la detección de
// src/escena/deteccion.js la baja un nivel en un equipo lento.
export const NIVELES = ['alta', 'media', 'liviana'];

export const esNivel = (valor) => NIVELES.includes(valor);

/** Nivel siguiente del recorrido de la tecla V: alta → media → liviana → alta. */
export const siguienteCalidad = (nivel) => NIVELES[(NIVELES.indexOf(nivel) + 1) % NIVELES.length];

/** Nivel inferior, o null si ya es el más bajo. */
export const calidadInferior = (nivel) => NIVELES[NIVELES.indexOf(nivel) + 1] ?? null;

// Rótulos de la interfaz (indicador de momento, vista del presentador y medidor).
export const NOMBRE_CALIDAD = { alta: 'Calidad alta', media: 'Calidad media', liviana: 'Calidad liviana' };
