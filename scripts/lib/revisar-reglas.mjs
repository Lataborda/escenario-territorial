// Revisión de la teoría de cambio (etapa 10.a): panel de condiciones en P19, preajustes con su escenario y capturas
// distinguibles, cada condición sola sin cambio de escenario y con su aviso, rótulos de escena, hash #c=, tecla T en
// otra parada y código sin reglas escritas (criterios de la etapa 10). La página abre en #p=P19&c=…&captura=1.
import path from 'node:path';
import { readFile, readdir } from 'node:fs/promises';
import { crearMotor } from '../../src/reglas/motor.js';
import { ir } from './revisar-procesos.mjs';
import { irPorHash } from './revisar-paradas.mjs';

const MAXIMO_ROTULOS = 7;
const PARADA = 'P19';
const DIFERENCIA_MINIMA = 0.02; // fracción de la maqueta (celdas distintas del fondo) que cambia entre dos preajustes
const CON_REGLAS = ['src/reglas', 'src/ui/condiciones.js']; // código que no debe nombrar reglas
// La página abre con el primer preajuste distinto del escenario de base: comprueba la carga directa con #c=.
const abiertaCon = (datos) => datos.condiciones.preajustes.find((p) => p.escenario !== datos.condiciones.derivacion.escenario_base).condiciones;
export const hashDeReglas = (datos) => `#p=${PARADA}&c=${abiertaCon(datos).join(',')}&captura=1`;

// Estado, panel, rótulos de escena y firma de la imagen (rejilla de 160 × 90 con el color medio del lienzo).
function leer() {
  for (let k = 0; k < 2; k++) window.escenario.dibujarCuadro();
  const lienzo = document.querySelector('#escena canvas');
  const copia = document.createElement('canvas');
  copia.width = 160;
  copia.height = 90;
  const ctx = copia.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(lienzo, 0, 0, 160, 90);
  const caja = (x) => x.getBoundingClientRect();
  const cruzan = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  const visibles = (sel) => [...document.querySelectorAll(sel)].filter((x) => !x.hidden && x.offsetParent !== null);
  const panel = document.querySelector('.condiciones');
  const abierto = !panel.hidden;
  const interfaz = [...visibles('.ficha, .botonera, .momentos, .condiciones'), ...visibles('.columna-derecha > *')].map(caja);
  const cajas = visibles('.rotulos-flujos > *, .rotulos-finca > *').map(caja);
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const conTexto = [...panel.querySelectorAll('*')].filter((x) => x.offsetParent !== null && [...x.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  const e = window.escenario.estado();
  const c = abierto ? caja(panel) : null;
  return {
    escenario: e.escenario,
    condiciones: e.condiciones,
    capas: e.capas,
    hash: location.hash,
    huella: window.escenario.coberturas().huella(),
    firma: [...ctx.getImageData(0, 0, 160, 90).data],
    triangulos: window.escenario.estadisticas().triangulos,
    llamadas: window.escenario.estadisticas().llamadas,
    abierto,
    botonera: visibles('.botonera').length > 0,
    interruptores: visibles('.cond-interruptor').length,
    activas: visibles('.cond-interruptor[aria-pressed="true"]').map((x) => x.dataset.condicion),
    sinEfecto: visibles('.cond-interruptor.sin-efecto').map((x) => x.dataset.condicion),
    preajuste: visibles('.cond-preajuste[aria-pressed="true"]').map((x) => x.dataset.preajuste),
    rotuloEscenario: abierto ? panel.querySelector('.cond-escenario').textContent : '',
    efectos: abierto ? panel.querySelector('.cond-efectos').textContent : '',
    avisos: visibles('.cond-aviso').map((x) => ({ id: x.dataset.condicion, texto: x.textContent })),
    mensaje: visibles('.cond-mensaje').map((x) => x.textContent)[0] ?? '',
    cortado: abierto ? panel.scrollHeight - panel.clientHeight : 0,
    dentro: !c || (c.left >= 0 && c.top >= 0 && c.right <= innerWidth && c.bottom <= innerHeight),
    sobreOtros: c ? visibles('.ficha, .momentos, .rotulo-esquema, .columna-derecha > *').map(caja).filter((i) => cruzan(c, i)).length : 0,
    letra: abierto ? Math.min(...conTexto.map((x) => parseFloat(getComputedStyle(x).fontSize) / rem)) : null,
    rotulos: cajas.length,
    encimados: cajas.filter((a, i) => cajas.some((b, j) => j > i && cruzan(a, b))).length,
    sobreInterfaz: cajas.filter((r) => interfaz.some((i) => cruzan(r, i))).length,
    fuera: cajas.filter((r) => r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight).length,
  };
}

// Fracción de las celdas de la maqueta (las que no tienen el color del fondo, tomado de la primera celda) con un
// cambio de color apreciable entre dos firmas.
function diferencia(a, b) {
  const lejos = (x, i, y, j) => Math.abs(x[i] - y[j]) + Math.abs(x[i + 1] - y[j + 1]) + Math.abs(x[i + 2] - y[j + 2]) > 24;
  let distintas = 0;
  let maqueta = 0;
  for (let i = 0; i < a.length; i += 4) {
    if (!lejos(a, i, a, 0) && !lejos(b, i, b, 0)) continue;
    maqueta += 1;
    if (lejos(a, i, b, i)) distintas += 1;
  }
  return maqueta ? distintas / maqueta : 0;
}

// Claves del contenido (condiciones, reglas, efectos, escenarios, preajustes) escritas en el código, sin contar comentarios.
async function reglasEnCodigo(raiz, datos) {
  const d = datos.condiciones;
  const claves = [
    ...d.condiciones.map((c) => c.id),
    ...d.reglas.map((r) => r.id),
    ...Object.keys(d.efectos),
    ...datos.escenarios.escenarios.map((e) => e.id),
  ];
  const archivos = [];
  for (const ruta of CON_REGLAS) {
    if (ruta.endsWith('.js')) archivos.push(ruta);
    else for (const n of await readdir(path.join(raiz, ruta))) archivos.push(path.join(ruta, n));
  }
  const halladas = [];
  for (const archivo of archivos) {
    const codigo = (await readFile(path.join(raiz, archivo), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\s\/\/ .*$/gm, '');
    for (const k of claves) if (new RegExp(`(?<![\\w.])${k}(?![\\w])`).test(codigo)) halladas.push(`${archivo}: ${k}`);
  }
  return { archivos, halladas };
}

export async function revisarReglas(pagina, { dirCapturas, datos, raiz }) {
  const d = datos.condiciones;
  const motor = crearMotor(d);
  const base = d.derivacion.escenario_base;
  await pagina.evaluate(() => window.escenario.dibujo(false));
  const pulsar = (selector) => pagina.click(selector);
  const r = { capturas: [], preajustes: [], solas: [] };

  // Carga directa con #c=: el panel abre con esas condiciones y el escenario derivado.
  const directa = await pagina.evaluate(leer);
  const esperadaDirecta = motor.evaluar(abiertaCon(datos));
  r.directa = {
    condiciones: directa.condiciones,
    escenario: directa.escenario,
    correcta: directa.abierto && directa.condiciones.join() === esperadaDirecta.condiciones.join() && directa.escenario === esperadaDirecta.escenario,
  };

  // Preajustes: escenario, capas derivadas, panel, rótulos y captura.
  for (const p of d.preajustes) {
    await pulsar(`.cond-preajuste[data-preajuste="${p.id}"]`);
    const m = await pagina.evaluate(leer);
    const esperado = motor.evaluar(p.condiciones);
    const captura = `reglas-${p.id}.jpg`;
    await pagina.screenshot({ path: path.join(dirCapturas, captura), type: 'jpeg', quality: 82 });
    r.capturas.push(captura);
    r.preajustes.push({
      id: p.id,
      esperado: p.escenario,
      capasEsperadas: esperado.capas,
      conCapas: esperado.capas.every((c) => m.capas.includes(c)),
      activasEsperadas: esperado.condiciones,
      sinEfectoEsperadas: esperado.estado.filter((c) => c.activa && !c.territorial).map((c) => c.id),
      ...m,
    });
  }
  r.diferencias = [];
  for (let i = 0; i < r.preajustes.length; i++) {
    for (let j = i + 1; j < r.preajustes.length; j++) {
      const [a, b] = [r.preajustes[i], r.preajustes[j]];
      r.diferencias.push({ par: `${a.id} y ${b.id}`, fraccion: Number(diferencia(a.firma, b.firma).toFixed(3)), huellaDistinta: a.huella !== b.huella });
    }
  }
  for (const p of r.preajustes) delete p.firma;

  // Cada condición sola: el escenario de base, la marca de «sin efecto territorial» y su aviso con el mensaje.
  const vacio = d.preajustes.find((p) => !p.condiciones.length);
  for (const c of d.condiciones) {
    await pulsar(`.cond-preajuste[data-preajuste="${vacio.id}"]`);
    await pulsar(`.cond-interruptor[data-condicion="${c.id}"]`);
    const m = await pagina.evaluate(leer);
    const esperado = motor.evaluar([c.id]).estado.find((x) => x.id === c.id);
    r.solas.push({
      id: c.id,
      escenario: m.escenario,
      activa: m.activas.join() === c.id,
      aviso: esperado.territorial ? !m.avisos.length : m.sinEfecto.join() === c.id && m.avisos.some((a) => a.id === c.id) && m.mensaje.includes(c.mensaje_si_falta),
      texto: m.avisos[0]?.texto ?? '',
      hash: m.hash.includes(`c=${c.id}`),
      cortado: m.cortado,
      rotulos: m.rotulos,
    });
  }
  // Un segundo clic la desactiva.
  await pulsar(`.cond-interruptor[data-condicion="${d.condiciones.at(-1).id}"]`);
  const apagada = await pagina.evaluate(leer);
  r.apaga = apagada.condiciones.length === 0 && apagada.escenario === base && !/[#&]c=/.test(apagada.hash);

  // Tecla T en una parada con red: abre con el preajuste de su escenario, sin cambiar el escenario, y restituye al cerrar.
  const conRed = d.preajustes.find((p) => motor.evaluar(p.condiciones).capas.length > 0);
  const parada = datos.paradas.paradas.find((p) => p.id !== PARADA && p.estado.escenario === conRed.escenario && !p.pasos);
  await irPorHash(pagina, parada.id);
  const antes = await pagina.evaluate(leer);
  await pagina.keyboard.press('t');
  const abierta = await pagina.evaluate(leer);
  await pagina.keyboard.press('t');
  const cerrada = await pagina.evaluate(leer);
  r.teclaT = {
    parada: parada.id,
    abre: !antes.abierto && abierta.abierto && !abierta.botonera && abierta.escenario === antes.escenario && abierta.condiciones.join() === motor.preajusteDe(antes.escenario).join(),
    conserva: antes.capas.every((c) => abierta.capas.includes(c)),
    restituye: !cerrada.abierto && cerrada.botonera && cerrada.capas.join() === antes.capas.join() && cerrada.escenario === antes.escenario && !cerrada.condiciones.length,
  };
  // Al avanzar de parada, el panel se cierra.
  await ir(pagina, PARADA);
  await pagina.keyboard.press('ArrowRight');
  const siguiente = await pagina.evaluate(leer);
  r.cierraAlAvanzar = !siguiente.abierto && siguiente.botonera && !siguiente.condiciones.length;

  r.codigo = await reglasEnCodigo(raiz, datos);
  return r;
}

export function fallasReglas(r) {
  if (!r) return ['Teoría de cambio: sin datos'];
  const f = [];
  const falla = (texto) => f.push(`Teoría de cambio: ${texto}`);
  if (!r.directa.correcta) falla(`la carga con #c= dejó ${r.directa.escenario} con ${r.directa.condiciones.join(', ') || 'ninguna condición'}`);
  for (const p of r.preajustes) {
    const donde = `preajuste ${p.id}`;
    if (p.escenario !== p.esperado) falla(`${donde}: escenario ${p.escenario} (se espera ${p.esperado})`);
    if (p.huella == null || !p.abierto || p.botonera || p.interruptores < 1) falla(`${donde}: panel cerrado o botonera visible`);
    if (p.preajuste.join() !== p.id) falla(`${donde}: botón sin marcar`);
    if (p.activas.join() !== p.activasEsperadas.join()) falla(`${donde}: interruptores activos ${p.activas.join(', ')}`);
    if (p.sinEfecto.join() !== p.sinEfectoEsperadas.join()) falla(`${donde}: marcas sin efecto territorial ${p.sinEfecto.join(', ') || 'ninguna'} (se espera ${p.sinEfectoEsperadas.join(', ') || 'ninguna'})`);
    if (!p.conCapas) falla(`${donde}: faltan capas derivadas (${p.capasEsperadas.join(', ')})`);
    if (!p.rotuloEscenario.startsWith(p.esperado)) falla(`${donde}: el panel rotula «${p.rotuloEscenario}»`);
    if (p.cortado > 1 || !p.dentro || p.sobreOtros) falla(`${donde}: panel cortado (${p.cortado} px), fuera de la ventana o sobre otro panel`);
    if (p.letra < 0.99) falla(`${donde}: letra del panel de ${p.letra.toFixed(2)} rem`);
    if (p.rotulos > MAXIMO_ROTULOS) falla(`${donde}: ${p.rotulos} rótulos de escena (máximo ${MAXIMO_ROTULOS})`);
    if (p.encimados || p.sobreInterfaz || p.fuera) falla(`${donde}: rótulos encimados ${p.encimados}, sobre la interfaz ${p.sobreInterfaz}, fuera ${p.fuera}`);
  }
  for (const x of r.diferencias) {
    if (x.fraccion < DIFERENCIA_MINIMA || !x.huellaDistinta) falla(`${x.par} no se distinguen en captura (${(x.fraccion * 100).toFixed(1)} % de la maqueta; coberturas ${x.huellaDistinta ? 'distintas' : 'iguales'})`);
  }
  const base = r.preajustes.find((p) => !p.activasEsperadas.length)?.esperado;
  for (const c of r.solas) {
    if (c.escenario !== base) falla(`${c.id} sola produce ${c.escenario}`);
    if (!c.activa || !c.aviso) falla(`${c.id} sola: interruptor o aviso incorrecto («${c.texto}»)`);
    if (!c.hash) falla(`${c.id} sola: el hash no la guarda`);
    if (c.cortado > 1) falla(`${c.id} sola: panel cortado (${c.cortado} px)`);
  }
  if (!r.apaga) falla('un segundo clic no desactiva la condición');
  if (!r.teclaT.abre || !r.teclaT.conserva || !r.teclaT.restituye) falla(`tecla T en ${r.teclaT.parada}: abre ${r.teclaT.abre}, conserva las capas ${r.teclaT.conserva}, restituye ${r.teclaT.restituye}`);
  if (!r.cierraAlAvanzar) falla('el panel sigue abierto al avanzar de parada');
  for (const h of r.codigo.halladas) falla(`regla escrita en el código (${h})`);
  return f;
}

const si = (v) => (v ? 'sí' : 'no');

export function seccionReglas(r, resumen) {
  if (!r) return ['## Teoría de cambio', '', '- Sin datos', ''];
  const lineas = ['## Teoría de cambio (etapa 10.a)', ''];
  if (resumen) {
    lineas.push(
      `- Reglas (contenido/condiciones.json, ${resumen.combinaciones} combinaciones de condiciones): ${Object.entries(resumen.cuenta).map(([e, n]) => `${e} ${n}`).join(', ')}; condiciones mínimas por escenario: ${Object.entries(resumen.minimo).map(([e, n]) => `${e} ${n}`).join(', ')}`,
      `- Cada condición sola: ${resumen.solas.map((c) => `${c.id} ${c.escenario}`).join(', ')}`,
    );
  }
  lineas.push('', '| Preajuste | Condiciones | Escenario | Capas derivadas | Rótulos de escena | Triángulos | Llamadas |', '|---|---|---|---|---|---|---|');
  for (const p of r.preajustes) {
    lineas.push(`| ${p.id} | ${p.activas.join(', ') || 'ninguna'} | ${p.escenario} («${p.rotuloEscenario}») | ${p.capasEsperadas.join(', ') || 'ninguna'} | ${p.rotulos} | ${p.triangulos} | ${p.llamadas} |`);
  }
  lineas.push(
    '',
    `- Diferencia entre capturas de los preajustes (fracción de la maqueta que cambia; mínimo ${DIFERENCIA_MINIMA * 100} %): ${r.diferencias.map((x) => `${x.par} ${(x.fraccion * 100).toFixed(1)} %`).join('; ')}; coberturas distintas en todos los pares: ${si(r.diferencias.every((x) => x.huellaDistinta))}`,
    `- Condición sola: escenario de base en ${r.solas.filter((c) => c.escenario === r.preajustes.find((p) => !p.activasEsperadas.length)?.esperado).length} de ${r.solas.length}; aviso con la condición que falta en ${r.solas.filter((c) => c.aviso).length} de ${r.solas.length} (${r.solas.map((c) => c.texto.replace('▲', '').trim()).join('; ')})`,
    `- Panel: dentro de la ventana y sin cortes en los ${r.preajustes.length} preajustes: ${si(r.preajustes.every((p) => p.cortado <= 1 && p.dentro && !p.sobreOtros))}; letra mínima ${Math.min(...r.preajustes.map((p) => p.letra)).toFixed(2)} rem; botonera oculta con el panel abierto: ${si(r.preajustes.every((p) => !p.botonera))}`,
    `- Carga directa con \`#c=\`: ${r.directa.condiciones.join(', ')} deja ${r.directa.escenario}: ${si(r.directa.correcta)}; un segundo clic desactiva y borra \`c\` del hash: ${si(r.apaga)}`,
    `- Tecla T en ${r.teclaT.parada}: abre con el preajuste del escenario ${si(r.teclaT.abre)}, conserva las capas de la parada ${si(r.teclaT.conserva)}, restituye al cerrar ${si(r.teclaT.restituye)}; el panel se cierra al avanzar de parada: ${si(r.cierraAlAvanzar)}`,
    `- Reglas en el código (${r.codigo.archivos.join(', ')}): ${r.codigo.halladas.length ? r.codigo.halladas.join('; ') : 'ninguna clave de condición, regla, efecto ni escenario'}`,
    `- Presupuesto gráfico: el panel es HTML (cero triángulos); las capas derivadas son las ya medidas en las etapas 6 a 9`,
    `- Capturas: ${r.capturas.map((c) => `\`capturas/${c}\``).join(', ')}`,
    '',
  );
  return lineas;
}
