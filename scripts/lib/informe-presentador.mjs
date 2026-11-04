// Sección del informe y fallas de la vista del presentador y del respaldo en imágenes.

const lista = (elementos, vacio = 'ninguno') =>
  elementos?.length ? '\n' + elementos.map((e) => `  - ${String(e).slice(0, 300)}`).join('\n') : ` ${vacio}`;

export function fallasPresentador(presentador, respaldo) {
  const f = [];
  if (!presentador.cargo) f.push('Presentador: no se conectó con la vista principal');
  if (presentador.errores.length) f.push(`Presentador: ${presentador.errores.length} errores de consola`);
  if (presentador.externas.length) f.push(`Presentador: ${presentador.externas.length} solicitudes externas`);
  for (const p of presentador.pruebas.filter((x) => !x.ok)) f.push(`Presentador: falla «${p.nombre}»`);
  if (respaldo.existe) {
    if (!respaldo.cargo) f.push('Respaldo: no abre sin servidor');
    if (respaldo.errores.length) f.push(`Respaldo: ${respaldo.errores.length} errores de consola`);
    if (respaldo.externas.length) f.push(`Respaldo: ${respaldo.externas.length} solicitudes externas`);
    if (respaldo.cargo && respaldo.cargadas !== respaldo.total) f.push(`Respaldo: ${respaldo.cargadas} de ${respaldo.total} imágenes cargan`);
    if (respaldo.cargo && !respaldo.navegacion) f.push('Respaldo: el teclado no navega como se espera');
  }
  return f;
}

export function seccionPresentador(presentador, respaldo) {
  const c = presentador.cronometro ?? {};
  const l = [
    '## Vista del presentador (dos pestañas del mismo navegador)',
    '',
    `- Dirección: \`${presentador.url}\``,
    `- Conexión con la vista principal: ${presentador.cargo ? `sí, ${presentador.ms} ms` : 'no'}`,
    `- Pruebas de sincronía y cronómetro: ${presentador.correctas} de ${presentador.pruebas.length} correctas`,
    ...presentador.pruebas.map((p) => `  - ${p.ok ? 'sí' : 'NO'}: ${p.nombre}`),
    c.m0 ? `- Cronómetro con reloj simulado: M0 ${c.m0}; M1 ${c.m1}; desvío acumulado ${c.acumulado}` : null,
    presentador.captura ? `- Captura: \`capturas/${presentador.captura}\` (1440×900)` : null,
    `- Errores de consola (ambas pestañas):${lista(presentador.errores)}`,
    `- Solicitudes: ${presentador.solicitudes} en total; externas:${lista(presentador.externas, 'ninguna')}`,
    `- Avisos de consola (no bloquean):${lista(presentador.avisos)}`,
    '',
    '## Respaldo en imágenes (file://, sin servidor y sin red)',
    '',
  ];
  if (!respaldo.existe) {
    l.push('- No generado: ejecutar `npm run respaldo`.', '');
    return l.filter((x) => x !== null);
  }
  l.push(
    `- Dirección: \`respaldo/index.html\``,
    `- Carga: ${respaldo.cargo ? `sí, ${respaldo.ms} ms` : 'no'}`,
    `- Imágenes: ${respaldo.cargadas} de ${respaldo.total} cargan (${(respaldo.medidas ?? []).join(', ')}); estados del recorrido: ${respaldo.esperados}`,
    `- Teclado (flechas, Fin, tecla 3, hash): ${respaldo.navegacion ? 'sí' : 'no'}`,
    `- Contenido igual al de la generación: ${respaldo.actualizado ? 'sí' : `no (respaldo ${respaldo.huella}, actual ${respaldo.huellaActual}); regenerar con \`npm run respaldo\``}`,
    respaldo.total !== respaldo.esperados ? `- Aviso: el respaldo tiene ${respaldo.total} imágenes y el recorrido ${respaldo.esperados} estados; regenerar` : null,
    `- Errores de consola:${lista(respaldo.errores)}`,
    `- Solicitudes externas:${lista(respaldo.externas, 'ninguna')}`,
    '',
  );
  return l.filter((x) => x !== null);
}
