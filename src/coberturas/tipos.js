// Tipos de cobertura: color, altura de la tesela, vegetación y forma en la leyenda. Datos de dibujo, sin escala.
// Los nombres en pantalla están en contenido/territorio.json (coberturas.tipos); las proporciones por zona
// y escenario, en contenido/escenarios.json. Este archivo no importa Three.js: lo usa también el validador.

// Densidad de vegetación en elementos por 100 unidades² de escena, por especie de arboles.js (saman, seco, ceiba,
// ribereno, guadua, andino, helecho, frailejon, junco). copa: color de la copa en la leyenda.
// altura: elevación de la tesela sobre su base; null: sin tesela. La caña toma la altura de la edad del lote.
// edades: color de la caña recién cortada, en crecimiento y madura (el de la leyenda es el de la madura).
export const TIPOS = {
  cana: { color: 0xadb24e, edades: [0xc9b47e, 0xc4d064, 0xadb24e], variacion: 0.08, altura: 2.7, familia: 'cana', forma: 'surcos' },
  cana_organica: { color: 0x5c9f68, edades: [0xb8b27c, 0x86c47c, 0x5c9f68], variacion: 0.05, altura: 2.7, familia: 'cana', forma: 'surcos_puntos' },
  pastura: { color: 0xd8d69e, variacion: 0.05, altura: 0, saman: 0.12, copa: 0x5c7c45, forma: 'pasto' },
  // El silvopastoreo suma setos de leucaena en hileras (mosaico.js).
  silvopastoril: { color: 0xadc07c, variacion: 0.04, altura: 0, saman: 0.55, copa: 0x5c7c45, forma: 'arboles_dispersos', mosaico: true },
  bosque_seco: { color: 0x7a8352, variacion: 0.04, altura: 0, seco: 3.2, ceiba: 0.3, copa: 0x7f8c4a, forma: 'arboles' },
  humedal: { color: 0x6c9e9a, variacion: 0.03, altura: -0.15, junco: 3, ribereno: 0.15, copa: 0x6b8a55, forma: 'agua' },
  ripario: { color: 0x6c8c55, variacion: 0.04, altura: 0, ribereno: 3, guadua: 0.9, copa: 0x52804c, forma: 'ribera' },
  bosque_altoandino: { altura: null, andino: 1.5, helecho: 0.35, copa: 0x3f6448, forma: 'bosque' },
  paramo: { altura: null, frailejon: 1.6, forma: 'roseta' },
  // Mosaico campesino de la ladera: la vegetación sale de mosaico.js (especies con dos niveles de detalle).
  cafe: { color: 0x5f6a38, variacion: 0.05, altura: 0, forma: 'cafe', mosaico: true },
  platano: { color: 0x7d8f45, variacion: 0.05, altura: 0, forma: 'platano', mosaico: true },
  frutales: { color: 0x93a85a, variacion: 0.05, altura: 0, forma: 'frutales', mosaico: true },
  huerta: { color: 0x7a5a3e, variacion: 0.06, altura: 0, forma: 'huerta', mosaico: true },
};

// Edades de la caña: identificador (las fracciones están en contenido/escenarios.json, edades_cana) y altura del
// bloque sobre su base. La edad es fija por lote e igual en todos los escenarios.
export const EDADES_CANA = { ids: ['cortado', 'crecimiento', 'maduro'], altura: [0.3, 1.55, 2.7] };

// Colores fijos de la vegetación y de las especies (arboles.js, especies.js).
export const VEGETACION = {
  tronco: 0x6b5844,
  troncoClaro: 0x8a8070,
  saman: 0x5f8a3e,
  seco: 0x7d8a48,
  secoClaro: 0xa39a52,
  ceiba: 0x6f8f46,
  ribereno: 0x4f7d45,
  andino: 0x3d6142,
  andinoClaro: 0x557a4c,
  helecho: 0x5b8a3a,
  leucaena: 0x6c9a45,
  guadua: 0xa6b85a,
  guaduaHoja: 0x7fa548,
  junco: 0x7f9c5c,
  enea: 0x6b4a2e,
  frailejonHoja: 0xbcc09a,
  frailejonFalda: 0x8e8068,
  frailejonFlor: 0xe0c040,
  frailejonTallo: 0x5d4e3d,
  // Tallos de la caña, de verde amarillento a morado (referencias/cana-mata.webp), y hojas secas de la base.
  canaTallos: [0xb9b46c, 0xa6ae62, 0xc4b97c, 0x93707a, 0x9c8c6a],
  canaSeca: 0xb3a06c,
  cafeto: 0x2f5a2c,
  cereza: 0xb3262a,
  guamo: 0x557f3e,
  platano: 0x6f9e3c,
  pseudotallo: 0x7d8a48,
  racimoPlatano: 0x9fae42,
  bellota: 0x6b2a3a,
  citrico: 0x3f6b34,
  naranja: 0xe8892a,
  mango: 0x2f5530,
  mangoNuevo: 0x5e6a34,
  suelo: 0x5e4130,
  sueloClaro: 0x735238,
  hortaliza: 0x9cc65e,
  maiz: 0x7ea341,
  espiga: 0xc9a65a,
};

// Tonos de las eras de la huerta: lechuga, col rizada, lechuga morada, repollo, cebolla y cilantro.
export const HORTALIZAS = [0x9cc65e, 0x4e7c46, 0x8e4652, 0x8fb4a2, 0x6f9e48, 0xb7c96a];

// Clases de unidad por zona de territorio.json. La montaña (bosque altoandino y páramo) no lleva teselas.
export const CLASES_POR_ZONA = {
  plano: ['parcelas', 'orillas'],
  piedemonte: ['parcelas', 'orillas'],
  ladera: ['parcelas', 'orillas'],
  bosque_altoandino: ['celdas'],
  paramo: ['celdas'],
};
export const ZONAS_CON_TESELAS = ['plano', 'piedemonte', 'ladera'];

export const TIPOS_POR_CLASE = {
  parcelas: ['cana', 'cana_organica', 'pastura', 'silvopastoril', 'bosque_seco', 'humedal', 'cafe', 'platano', 'frutales', 'huerta'],
  orillas: ['ripario', 'cana', 'cana_organica', 'pastura', 'cafe', 'platano'],
  celdas: ['bosque_altoandino', 'paramo'],
};

// Orden de asignación y criterio con que cada tipo elige sus unidades (ver asignacion.js).
// dispersion: orden aleatorio con distancia mínima decreciente (relictos aislados con fracción baja).
// cota: de la unidad más baja a la más alta, con ruido (unidades de escena).
export const ASIGNACION = [
  { tipo: 'humedal', criterio: 'cercania', entidad: 'humedal' },
  { tipo: 'bosque_seco', criterio: 'dispersion', radio: 150, lejosDeCauces: 45 },
  { tipo: 'ripario', criterio: 'dispersion', radio: 110 },
  { tipo: 'bosque_altoandino', criterio: 'altitud' },
  { tipo: 'paramo', criterio: 'altitud' },
  { tipo: 'cana', criterio: 'occidente', organica: { tipo: 'cana_organica', criterio: 'manchas' } },
  // Ladera: huertas caseras dispersas; café y plátano en la franja baja; frutales en manchas.
  { tipo: 'huerta', criterio: 'dispersion', radio: 40 },
  { tipo: 'cafe', criterio: 'cota', ruido: 30 },
  { tipo: 'platano', criterio: 'cota', ruido: 45, desfase: 5.1 },
  { tipo: 'frutales', criterio: 'manchas', escala: 90, desfase: 2.3 },
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
