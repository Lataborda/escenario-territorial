// Red vial esquemática: categorías y tramos entre entidades de territorio.json o puntos del borde [u, v].
// Datos de dibujo, sin escala. El trazado sobre el relieve lo calcula trazado.js.

// ancho en unidades de escena; color de la calzada; linea: color de la línea central discontinua.
export const CATEGORIAS = {
  troncal: { ancho: 4.2, color: 0x5d5b57, linea: 0xe2c35a },
  secundaria: { ancho: 3.2, color: 0x6c6964 },
  veredal: { ancho: 2.4, color: 0xb39770 }, // vía destapada
};

// Cada tramo une puntos consecutivos. La vía principal del plano corre de norte a sur por la ciudad;
// la del piedemonte une las cabeceras del pie de la cordillera; las veredales suben a la ladera.
export const RED = [
  { categoria: 'troncal', puntos: [[0.17, 0], 'CAB1', 'ciudad', 'CAB2', 'CAB8', [0.31, 1]] },
  { categoria: 'troncal', puntos: [[0.45, 0], 'CAB3', 'CAB4', 'CAB6', 'CAB9', [0.55, 1]] },
  { categoria: 'secundaria', puntos: ['ciudad', 'CAB7'] },
  { categoria: 'secundaria', puntos: ['ciudad', 'CAB3'] },
  { categoria: 'secundaria', puntos: ['ciudad', 'CAB4'] },
  { categoria: 'secundaria', puntos: ['CAB2', 'CAB6'] },
  { categoria: 'secundaria', puntos: ['CAB3', 'CAB5'] },
  { categoria: 'veredal', puntos: ['CAB4', 'escuela', 'F3', 'F2', 'acueducto'] },
  { categoria: 'veredal', puntos: ['CAB5', [0.73, 0.1]] },
  { categoria: 'veredal', puntos: ['CAB6', [0.74, 0.62]] },
  { categoria: 'veredal', puntos: ['CAB9', 'resguardo'] },
  { categoria: 'veredal', puntos: ['CAB8', 'consejo'] },
];

// Áreas que las vías rodean (radio en unidades de escena): fincas y lotes que construyen etapas posteriores.
export const EVITAR = [
  { id: 'ingenio', radio: 24 },
  { id: 'F1', radio: 50 },
  { id: 'lote', radio: 20 },
  { id: 'humedal', radio: 40 },
];
