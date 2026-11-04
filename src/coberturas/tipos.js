// Tipos de cobertura: color, altura de la tesela, vegetación y forma en la leyenda. Datos de dibujo, sin escala.
// Los nombres en pantalla están en contenido/territorio.json (coberturas.tipos); las proporciones por zona
// y escenario, en contenido/escenarios.json. Este archivo no importa Three.js: lo usa también el validador.

// Densidad de vegetación en elementos por 100 unidades² de escena.
// altura: elevación de la tesela sobre su base (la caña forma un bloque); null: sin tesela.
export const TIPOS = {
  cana: { color: 0xb3b956, variacion: 0.1, altura: 2.4, familia: 'cana', forma: 'surcos' },
  cana_organica: { color: 0x62a873, variacion: 0.06, altura: 2.4, familia: 'cana', forma: 'surcos_puntos' },
  pastura: { color: 0xd8d69e, variacion: 0.05, altura: 0, arbol: 0.12, copa: 0x5c7c45, forma: 'pasto' },
  silvopastoril: { color: 0xadc07c, variacion: 0.04, altura: 0, arbol: 0.9, copa: 0x5c7c45, forma: 'arboles_dispersos' },
  bosque_seco: { color: 0x7a8352, variacion: 0.04, altura: 0, arbol: 3.6, copa: 0x7f8c4a, forma: 'arboles' },
  humedal: { color: 0x6c9e9a, variacion: 0.03, altura: -0.15, junco: 3, arbol: 0.15, copa: 0x6b8a55, forma: 'agua' },
  ripario: { color: 0x6c8c55, variacion: 0.04, altura: 0, arbol: 3, guadua: 0.9, copa: 0x52804c, forma: 'ribera' },
  bosque_altoandino: { altura: null, arbol: 1.8, copa: 0x3f6448, forma: 'bosque' },
  paramo: { altura: null, frailejon: 1.6, forma: 'roseta' },
};

// Colores fijos de la vegetación (la copa depende del tipo).
export const VEGETACION = {
  tronco: 0x6b5844,
  guadua: 0xa6b85a,
  junco: 0x7f9c5c,
  frailejonHoja: 0xbcc09a,
  frailejonTallo: 0x5d4e3d,
};

// Clases de unidad por zona de territorio.json. Solo el plano y el piedemonte llevan teselas en la etapa 5.a.
export const CLASES_POR_ZONA = {
  plano: ['parcelas', 'orillas'],
  piedemonte: ['parcelas', 'orillas'],
  ladera: ['orillas'],
  bosque_altoandino: ['celdas'],
  paramo: ['celdas'],
};
export const ZONAS_CON_TESELAS = ['plano', 'piedemonte'];

export const TIPOS_POR_CLASE = {
  parcelas: ['cana', 'cana_organica', 'pastura', 'silvopastoril', 'bosque_seco', 'humedal'],
  orillas: ['ripario', 'cana', 'cana_organica', 'pastura'],
  celdas: ['bosque_altoandino', 'paramo'],
};

// Orden de asignación y criterio con que cada tipo elige sus unidades (ver asignacion.js).
// dispersion: orden aleatorio con distancia mínima decreciente (relictos aislados con fracción baja).
export const ASIGNACION = [
  { tipo: 'humedal', criterio: 'cercania', entidad: 'humedal' },
  { tipo: 'bosque_seco', criterio: 'dispersion', radio: 150, lejosDeCauces: 45 },
  { tipo: 'ripario', criterio: 'dispersion', radio: 110 },
  { tipo: 'bosque_altoandino', criterio: 'altitud' },
  { tipo: 'paramo', criterio: 'altitud' },
  { tipo: 'cana', criterio: 'occidente', organica: { tipo: 'cana_organica', criterio: 'manchas' } },
  { tipo: 'silvopastoril', criterio: 'manchas' },
  { tipo: 'pastura', criterio: 'azar' },
];

// Áreas reservadas para módulos posteriores (radio en unidades de escena). Se busca primero por id.
// F1 muestra un sistema silvopastoril provisional hasta la etapa 6.
export const RESERVAS = [
  { id: 'ciudad', radio: 70 },
  { id: 'ingenio', radio: 20 },
  { id: 'F1', radio: 46, cobertura: 'silvopastoril' },
  { id: 'lote', radio: 16 },
  { tipo: 'asentamiento', radio: 22 },
];

// Tipos que aparecen en un escenario: proporción positiva en alguna zona o reserva con cobertura.
export function tiposPresentes(escenario) {
  const presentes = new Set(RESERVAS.filter((r) => r.cobertura).map((r) => r.cobertura));
  for (const clases of Object.values(escenario?.coberturas ?? {})) {
    for (const fracciones of Object.values(clases)) {
      for (const [tipo, f] of Object.entries(fracciones)) if (f > 0) presentes.add(tipo);
    }
  }
  return presentes;
}
