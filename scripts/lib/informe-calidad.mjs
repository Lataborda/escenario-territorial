// Sección «Calidad» del informe de verificación (datos de revisar-calidad.mjs).
const NIVELES = ['alta', 'media', 'liviana'];

export function seccionCalidad(r) {
  if (!r?.niveles) return [];
  const m = (x) => (x / 1e6).toFixed(2).replace('.', ',');
  const si = (x) => (x ? 'sí' : 'no');
  const n = r.niveles.niveles;
  const efectos = (l) => ['oclusión', 'miniatura', 'sombra', 'viento'].filter((_, i) => [l.oclusion, l.miniatura, l.sombra, l.viento][i]).join(', ') || 'ninguno';
  const d = (x) => (x ? `${x.deteccion.estado}, ${String(x.deteccion.cps).replace('.', ',')} cuadros por segundo en ${x.deteccion.medidos} cuadros (umbral ${x.deteccion.umbral}); calidad ${x.calidad}` : 'sin datos');
  return [
    '## Calidad',
    '',
    'Triángulos por cuadro con la cámara quieta, llamadas de dibujo y matas de caña del cupo por nivel (tecla V).',
    '',
    '| Vista | Alta | Media | Liviana |',
    '|---|---|---|---|',
    ...n.alta.vistas.map((a, i) => `| ${a.nombre} | ${NIVELES.map((k) => `${m(n[k].vistas[i].triangulos)} M, ${n[k].vistas[i].llamadas} llamadas, ${n[k].vistas[i].matas} matas`).join(' | ')} |`),
    '',
    ...NIVELES.map((k) => `- Calidad ${k}: efectos ${efectos(n[k].vistas[0].luz)}; ${n[k].vistas[0].instancias} instancias de vegetación en la vista general; radio de la caña cercana en P07 ${n[k].vistas[3].cupo.radio}; indicador «${n[k].indicador}»; hash \`calidad=${n[k].hash}\``),
    `- Tecla V: recorre los tres niveles ${si(r.niveles.ciclo)}; al volver a la alta, imagen igual a la inicial: ${si(r.niveles.vuelve)}`,
    `- Pantalla densa (dos píxeles por punto): relación de píxeles ${NIVELES.map((k) => `${String(r.densa?.[k].relacion).replace('.', ',')} (${k})`).join(', ')}`,
    `- Hash: \`${r.hash?.hash}\`; tras la recarga, calidad ${r.hash?.trasRecarga} y detección ${r.hash?.deteccion}; cambio manual de \`#calidad=\` aplicado: ${si(r.hash?.manual)}; carga directa con \`#calidad=liviana\`: ${r.directa?.calidad}`,
    `- Detección con umbral forzado (\`#deteccion=100000\`): ${d(r.forzada)}; aviso «${r.forzada?.aviso}»; tras la recarga, calidad ${r.forzada?.recarga?.calidad} y detección ${r.forzada?.recarga?.deteccion}`,
    `- Detección con umbral mínimo (\`#deteccion=0.001\`): ${d(r.minima)}; aviso: ${r.minima?.aviso ?? 'ninguno'}`,
    `- Detección con la tecla V durante la medida: ${r.cancelada?.deteccion.estado}; calidad ${r.cancelada?.calidad}`,
    `- En la verificación automática, sin \`#deteccion=\`: detección ${r.niveles.deteccion}. Los cuadros por segundo de la detección corresponden a un equipo sin tarjeta gráfica.`,
    `- Aviso de carga: «${r.carga?.texto}» visible antes de \`escenario:listo\` (cuadros del navegador con el aviso a la vista: ${r.carga?.cuadros}); oculto al quedar lista: ${si(r.carga?.oculto)}`,
    `- Rótulos del lote y del corte: ${r.rotulos?.rotulos.P07} en P07 y ${r.rotulos?.rotulos.P03} en P03; recolocaciones en 15 cuadros con la cámara quieta: ${r.rotulos?.quietas}; se recolocan al cambiar de vista: ${si(r.rotulos?.recoloca)}; mismo lugar al volver: ${si(r.rotulos?.mismoLugar)}`,
    r.errores.length ? `- Errores de consola: ${r.errores.join('; ')}` : '- Errores de consola: ninguno',
    '',
  ];
}
