// Revisión de la escena de la teoría de cambio (etapa 10.b.b), desde revisar-reglas.mjs con el panel abierto en P19:
// cada condición sola (y la pareja que reemplaza el corredor incompleto) enciende las capas que deriva el motor, con
// el título del detonante y los actores ligados a los efectos presentes; rótulos sin encimarse; triángulos y llamadas
// de cada capa nueva; y el fundido de las capas en una carga sin #captura=1 (empieza en 0 y termina en 1; al ocultar,
// el grupo sigue visible mientras se funde). Capturas efectos-*.jpg.
import path from 'node:path';

const MAXIMO_ROTULOS = 7;
const ESPERA_FUNDIDO_MS = 30000; // sin tarjeta gráfica, un cuadro puede tardar varios segundos

// Capas de actores encendidas, rótulos de escena y presupuesto del cuadro.
function leerEscena() {
  for (let k = 0; k < 2; k++) window.escenario.dibujarCuadro();
  const capas = window.escenario.actores().capas;
  const cajas = [...document.querySelectorAll('.rotulos-flujos > *, .rotulos-finca > *')].filter((x) => !x.hidden && x.offsetParent !== null);
  const r = cajas.map((x) => x.getBoundingClientRect());
  const cruzan = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  return {
    estado: window.escenario.estado().capas,
    visibles: Object.entries(capas).filter(([, v]) => v.visible).map(([k]) => k),
    detonante: capas.detonantes?.titulo ?? null,
    actores: capas.actores_efecto?.actores ?? [],
    rotulos: cajas.map((x) => x.querySelector('strong')?.textContent ?? x.textContent),
    encimados: r.filter((a, i) => r.some((b, j) => j > i && cruzan(a, b))).length,
    triangulos: window.escenario.estadisticas().triangulos,
    llamadas: window.escenario.estadisticas().llamadas,
  };
}

export async function revisarEfectos(pagina, { dirCapturas, datos, motor, urlReglas }) {
  const d = datos.condiciones;
  const red = datos.actores.red;
  const vacio = d.preajustes.find((p) => !p.condiciones.length);
  const r = { casos: [], capturas: [], capasNuevas: [] };
  const capasActores = new Set(['detonantes', 'fincas_islas', 'corredor_incompleto', 'actores_efecto', 'mercados']);
  const efectosActor = new Map(datos.actores.actores.map((a) => [a.id, a.efectos ?? []]));
  const titulos = red.efectos.detonantes.titulos;
  const listadas = [...new Set(titulos.flatMap((t) => t.condiciones))];
  const clave = (ids) => [...ids].sort().join();
  const tituloEsperado = (ids) => titulos.find((t) => clave(t.condiciones) === clave(listadas.filter((c) => ids.includes(c))))?.titulo ?? null;

  await pagina.click(`.cond-preajuste[data-preajuste="${vacio.id}"]`);
  const base = await pagina.evaluate(leerEscena);
  // Cada condición sola y, por cada regla que reemplaza un efecto, la pareja que la deja sin cumplir (por ejemplo,
  // prácticas y conectividad: el corredor en lugar del corredor incompleto).
  const parejas = d.reglas.filter((x) => x.reemplaza?.length && !x.escenario && (x.si.ninguna ?? []).length === 1);
  const casos = [...d.condiciones.map((c) => [c.id]), ...parejas.map((x) => [...(x.si.todas ?? []), ...x.si.ninguna])];
  for (const ids of casos) {
    await pagina.click(`.cond-preajuste[data-preajuste="${vacio.id}"]`);
    for (const id of ids) await pagina.click(`.cond-interruptor[data-condicion="${id}"]`);
    const m = await pagina.evaluate(leerEscena);
    const x = motor.evaluar(ids);
    const presentes = new Set(x.efectos);
    const actores = [...efectosActor].filter(([, e]) => e.some((y) => presentes.has(y))).map(([a]) => a).sort();
    const esperadas = x.capas.filter((c) => capasActores.has(c));
    const nombre = ids.join('+');
    r.casos.push({
      id: nombre,
      capas: x.capas,
      enEstado: x.capas.every((c) => m.estado.includes(c)),
      visibles: esperadas.every((c) => m.visibles.includes(c)),
      detonante: m.detonante === tituloEsperado(ids) || !x.capas.includes('detonantes'),
      tituloDetonante: m.detonante,
      actores: !x.capas.includes('actores_efecto') || m.actores.join() === actores.join(),
      listaActores: m.actores,
      rotulos: m.rotulos.length,
      encimados: m.encimados,
      triangulos: m.triangulos - base.triangulos,
      llamadas: m.llamadas - base.llamadas,
    });
  }
  // Capturas de los tres dibujos nuevos sobre la maqueta.
  const muestras = [
    ['efectos-islas.jpg', casos.find((c) => motor.evaluar(c).capas.includes('fincas_islas'))],
    ['efectos-corredor.jpg', casos.find((c) => motor.evaluar(c).capas.includes('corredor_incompleto'))],
    ['efectos-actores.jpg', d.condiciones.filter((c) => motor.evaluar([c.id]).capas.includes('actores_efecto')).map((c) => c.id)],
  ];
  for (const [archivo, ids] of muestras) {
    if (!ids?.length) continue;
    await pagina.click(`.cond-preajuste[data-preajuste="${vacio.id}"]`);
    for (const id of ids) await pagina.click(`.cond-interruptor[data-condicion="${id}"]`);
    await pagina.evaluate(() => window.escenario.dibujarCuadro());
    await pagina.screenshot({ path: path.join(dirCapturas, archivo), type: 'jpeg', quality: 82 });
    r.capturas.push(archivo);
  }
  r.actoresJuntos = (await pagina.evaluate(leerEscena)).actores;

  // Fundido: carga sin #captura=1; el preajuste con red enciende sus capas desde 0 y las apaga fundiendo.
  const conRed = d.preajustes.find((p) => motor.evaluar(p.condiciones).capas.includes('poligono_red'));
  const sinCaptura = urlReglas.replace(/&?captura=1/, '');
  await pagina.goto('about:blank');
  await pagina.goto(sinCaptura);
  await pagina.waitForFunction(() => document.documentElement.dataset.listo === '1', null, { timeout: 60000 });
  // Sin ciclo de dibujo la página responde de inmediato; el reloj de GSAP sigue los cuadros del navegador.
  await pagina.evaluate(() => window.escenario.dibujo(false));
  const fundido = await pagina.evaluate(async ([preajuste, vacioId, espera]) => {
    const capa = () => window.escenario.actores().capas.poligono_red;
    const esperar = async (fn) => {
      const t0 = performance.now();
      while (!fn() && performance.now() - t0 < espera) await new Promise((s) => setTimeout(s, 50));
      return fn();
    };
    document.querySelector(`.cond-preajuste[data-preajuste="${preajuste}"]`).click();
    const alEntrar = { visible: capa().visible, opacidad: capa().opacidad };
    const entra = await esperar(() => capa().opacidad === 1);
    document.querySelector(`.cond-preajuste[data-preajuste="${vacioId}"]`).click();
    const alSalir = { visible: capa().visible, opacidad: capa().opacidad };
    const sale = await esperar(() => !capa().visible && capa().opacidad === 0);
    return { alEntrar, entra, alSalir, sale };
  }, [conRed.id, vacio.id, ESPERA_FUNDIDO_MS]);
  r.fundido = { preajuste: conRed.id, ...fundido, gradual: fundido.alEntrar.visible && fundido.alEntrar.opacidad < 1 && fundido.entra && fundido.alSalir.visible && fundido.alSalir.opacidad > 0 && fundido.sale };
  // Con #captura=1, inmediato (la página vuelve a la carga de la revisión de reglas).
  await pagina.goto('about:blank');
  await pagina.goto(urlReglas);
  await pagina.waitForFunction(() => document.documentElement.dataset.listo === '1', null, { timeout: 60000 });
  await pagina.evaluate(() => window.escenario.dibujo(false));
  r.inmediato = await pagina.evaluate(([preajuste, vacioId]) => {
    document.querySelector(`.cond-preajuste[data-preajuste="${preajuste}"]`).click();
    const c = window.escenario.actores().capas.poligono_red;
    const entra = c.visible && c.opacidad === 1;
    document.querySelector(`.cond-preajuste[data-preajuste="${vacioId}"]`).click();
    const s = window.escenario.actores().capas.poligono_red;
    return entra && !s.visible && s.opacidad === 0;
  }, [conRed.id, vacio.id]);
  return r;
}

export function fallasEfectos(r) {
  if (!r) return ['Escena de la teoría de cambio: sin datos'];
  const f = [];
  const falla = (texto) => f.push(`Escena de la teoría de cambio: ${texto}`);
  for (const c of r.casos) {
    if (!c.enEstado || !c.visibles) falla(`${c.id}: capas derivadas sin encender (${c.capas.join(', ')})`);
    if (!c.detonante) falla(`${c.id}: rótulo de detonante «${c.tituloDetonante}»`);
    if (!c.actores) falla(`${c.id}: actores por efecto ${c.listaActores.join(', ') || 'ninguno'}`);
    if (c.rotulos > MAXIMO_ROTULOS || c.encimados) falla(`${c.id}: ${c.rotulos} rótulos, ${c.encimados} encimados`);
  }
  if (!r.fundido.gradual) falla(`fundido sin captura: al entrar ${JSON.stringify(r.fundido.alEntrar)}, llega a 1 ${r.fundido.entra}; al salir ${JSON.stringify(r.fundido.alSalir)}, se oculta ${r.fundido.sale}`);
  if (!r.inmediato) falla('con #captura=1 el cambio de capa no es inmediato');
  return f;
}

const si = (v) => (v ? 'sí' : 'no');

export function seccionEfectos(r) {
  if (!r) return ['- Escena de la teoría de cambio: sin datos'];
  const lineas = ['', '### Escena de la teoría de cambio (etapa 10.b.b)', '', '| Condiciones | Capas derivadas | Detonante | Actores por efecto | Rótulos | Triángulos (+) | Llamadas (+) |', '|---|---|---|---|---|---|---|'];
  for (const c of r.casos) {
    lineas.push(`| ${c.id} | ${c.capas.join(', ') || 'ninguna'} | ${c.tituloDetonante ?? '—'} | ${c.listaActores.join(', ') || '—'} | ${c.rotulos} (${c.encimados} encimados) | ${c.triangulos} | ${c.llamadas} |`);
  }
  lineas.push(
    '',
    `- Capas derivadas encendidas y visibles en ${r.casos.filter((c) => c.enEstado && c.visibles).length} de ${r.casos.length} casos; rótulos sin encimarse y ${MAXIMO_ROTULOS} como máximo: ${si(r.casos.every((c) => c.rotulos <= MAXIMO_ROTULOS && !c.encimados))}`,
    `- Fundido sin \`#captura=1\` (${r.fundido.preajuste}, polígono de la red): al encender, visible con opacidad ${r.fundido.alEntrar.opacidad} y llega a 1: ${si(r.fundido.entra)}; al apagar, sigue visible con opacidad ${r.fundido.alSalir.opacidad} y se oculta al terminar: ${si(r.fundido.sale)}. Con \`#captura=1\`, inmediato: ${si(r.inmediato)}. Sin tarjeta gráfica, un cuadro tarda segundos y el reloj del fundido salta; la duración (0,8 s de entrada, 0,5 s de salida) se aprecia en un equipo con tarjeta gráfica`,
    `- Capturas: ${r.capturas.map((c) => `\`capturas/${c}\``).join(', ')}`,
  );
  return lineas;
}
