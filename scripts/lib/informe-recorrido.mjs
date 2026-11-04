// Sección «Recorrido» del informe y fallas que la verificación debe reportar.
import { CARPETA_PARADAS } from './revisar-paradas.mjs';

const RAZON_MAXIMA = 4; // paso mayor frente al paso medio del vuelo muestreado

const si = (v) => (v ? 'sí' : 'no');
const contar = (filas, campo) => filas.filter((f) => f[campo]).length;

function resumenTrayectorias(t = []) {
  const moviles = t.filter((x) => x.longitud > 0);
  return {
    tramos: t.length,
    moviles: moviles.length,
    razon: Math.max(0, ...moviles.map((x) => x.razon)),
    extremos: t.every((x) => x.extremos),
    finitos: t.every((x) => x.finitos),
  };
}

// Modo libre (scripts/lib/revisar-libre.mjs).
function lineasLibre(l) {
  if (!l) return ['- Modo libre: sin resultados'];
  const marcha = (x) =>
    `${x.recorrido} unidades, dirección ${x.direccion}, salto ${x.salto}, detenida ${si(x.detenida)}, cámara a ${x.sobre} o más sobre el relieve, dentro ${si(x.dentro)}`;
  const v = l.vuelo;
  return [
    `- Modo libre: correcto ${si(l.correcto)}; captura \`capturas/${l.captura}\``,
    `  - Doble clic: en el recorrido sin efecto ${si(l.recorridoQuieto)}; fuera de la maqueta sin efecto ${si(l.fueraQuieto)}; vuelo al punto ${si(v.correcto)} (error ${v.error}, distancias ${v.distancias.join(' → ')}, duración ${v.duracion} s)`,
    `  - Marcha con W: ${marcha(l.adelante)}`,
    `  - Marcha con flecha derecha: ${marcha(l.derecha)}; sin cambio de parada ${si(l.flechaSinParada)}`,
    `  - Borde (Mayús + A, 30 s): dentro ${si(l.borde.dentro)}; holgura final ${l.borde.holgura}; salto ${l.borde.salto}; cámara a ${l.borde.sobre} o más sobre el relieve`,
    `  - Cámara bajo el relieve: ${l.relieve.inicial} → ${l.relieve.primerCuadro} en el primer cuadro → ${l.relieve.final} (${si(l.relieve.correcto)})`,
    `  - Botonera desde el objetivo actual ${si(l.botonera)}; tecla O de vuelta a la parada ${si(l.salida)}`,
  ];
}

export function fallasRecorrido({ recorrido: r, transiciones: t, legibilidad: l }) {
  const f = [];
  if (!r) return ['Recorrido: sin resultados'];
  const n = r.paradas.length;
  for (const campo of ['carga', 'ficha', 'fuente', 'camara', 'escala']) {
    const malas = r.paradas.filter((p) => !p[campo]).map((p) => p.id);
    if (malas.length) f.push(`Recorrido: ${campo} con fallas en ${malas.join(', ')} (de ${n})`);
  }
  if (!r.flechas?.ida || !r.flechas?.vuelta) f.push('Recorrido: las flechas no siguen el orden de paradas y pasos');
  for (const [k, v] of Object.entries(r.teclas ?? {})) if (!v) f.push(`Recorrido: la tecla de «${k}» no responde`);
  if (!r.teclaC?.valido) f.push('Recorrido: la tecla C no produce un bloque de cámara válido');
  if (!r.botonera) f.push('Recorrido: la botonera no cambia la escala');
  if (!r.clic) f.push('Recorrido: el clic en una finca no la fija como punto de interés');
  const tr = resumenTrayectorias(r.trayectorias);
  if (!tr.extremos || !tr.finitos || tr.razon > RAZON_MAXIMA) f.push('Recorrido: trayectorias de cámara con saltos');
  if (!t?.correcto) f.push('Recorrido: transiciones fuera de 1,5 a 3 s');
  if (!r.modoLibre?.correcto) f.push('Recorrido: el modo libre no cumple (doble clic, marcha, relieve, borde o salida)');
  if (!l?.hashDirecto) f.push('Recorrido: el hash #p=P14&paso=2 no abre la parada y el paso');
  if (l?.fallidas?.length) f.push(`Recorrido: fichas no legibles a 1280×720 en ${l.fallidas.join(', ')}`);
  return f;
}

export function seccionRecorrido({ recorrido: r, transiciones: t, legibilidad: l }) {
  if (!r) return ['## Recorrido', '', '- Sin resultados', ''];
  const p = r.paradas;
  const tr = resumenTrayectorias(r.trayectorias);
  const m = (x) => (x ? `declarada ${x.declarada} s, medida ${x.medida} s (intervalo máximo entre cuadros ${x.intervalo} s)` : 'sin datos');
  return [
    '## Recorrido',
    '',
    `- Paradas por hash (\`#p=ID&captura=1\`): cargan ${contar(p, 'carga')} de ${p.length}; ficha correcta ${contar(p, 'ficha')}; con fuente ${contar(p, 'fuente')}; cámara en su lugar ${contar(p, 'camara')}; escala ${contar(p, 'escala')}`,
    `- Capturas: \`capturas/${CARPETA_PARADAS}/P01.jpg\` a \`${p.at(-1)?.id}.jpg\``,
    `- Flechas, espacio y Av Pág/Re Pág (${r.flechas?.estados} estados con pasos): adelante ${si(r.flechas?.ida)}; atrás ${si(r.flechas?.vuelta)}`,
    `- Teclas: 0 a 6 ${si(r.teclas?.momentos)}; O ${si(r.teclas?.libre)}; H ${si(r.teclas?.interfaz)}; V ${si(r.teclas?.liviano)}`,
    `- Tecla C: ${si(r.teclaC?.valido)}, \`${r.teclaC?.texto}\`; desvío al aplicarlo ${r.teclaC?.desvio}`,
    `- Botonera: ${si(r.botonera)}; clic en una finca: ${si(r.clic)}`,
    `- Transiciones en modo liviano: entre paradas ${m(t?.parada)}; botonera ${m(t?.botonera)}; doble clic en modo libre ${m(t?.libre)}; correctas ${si(t?.correcto)}`,
    ...lineasLibre(r.modoLibre),
    `- Trayectorias muestreadas: ${tr.tramos} tramos (${tr.moviles} con movimiento); razón máxima entre paso mayor y paso medio ${tr.razon} (límite ${RAZON_MAXIMA}); extremos exactos ${si(tr.extremos)}`,
    `- Hash directo \`#p=P14&paso=2\`: ${si(l?.hashDirecto)}`,
    `- Fichas a 1280×720: legibles ${l?.legibles} de ${l?.total} (sin desborde, dentro de la ventana, sin superposición, letra ≥ 16 px); letra mínima ${l?.letra} px; ficha más alta ${l?.mayor?.id} (${l?.mayor?.alto} px de 720); captura \`capturas/${l?.captura}\``,
    '',
  ];
}
