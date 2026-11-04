// Vista del presentador: sincronía en ida y vuelta con la vista principal (dos pestañas del mismo
// navegador) y cronómetro con reloj simulado. Captura en verificacion/capturas/presentador.png.
import path from 'node:path';
import { bloquearExternas, vigilar } from './revisar-pagina.mjs';
import { pausarDibujo } from './revisar-paradas.mjs';

export const VENTANA_PRESENTADOR = { width: 1440, height: 900 };
const ESPERA_MS = 30000;
const MINUTO = 60000;
// Reloj simulado del presentador: el cronómetro avanza solo cuando la prueba lo indica.
const RELOJ = new Date('2026-11-04T08:00:00-05:00');

const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

// Sondeo desde Node: con el reloj simulado, los temporizadores de la página no avanzan solos.
async function esperar(pagina, fn, arg, ms = 10000) {
  const limite = Date.now() + ms;
  while (Date.now() < limite) {
    if (await pagina.evaluate(fn, arg).catch(() => false)) return true;
    await pausa(50);
  }
  return false;
}

const enPrincipal = (pagina, [parada, paso = 0]) =>
  esperar(pagina, ([i, k]) => document.documentElement.dataset.parada === i && document.documentElement.dataset.paso === String(k), [parada, paso]);

const enPresentador = (pagina, [parada, paso = 0]) =>
  esperar(pagina, ([i, k]) => {
    const a = document.querySelector('.actual');
    return a?.dataset.parada === i && a?.dataset.paso === String(k);
  }, [parada, paso]);

// Ambas vistas en la misma parada y paso.
const ambas = async (principal, presentador, destino) =>
  (await enPrincipal(principal, destino)) && (await enPresentador(presentador, destino));

const leerCrono = (pagina) => pagina.evaluate(() => window.presentador.cronometro());
const fila = (l, id) => l.filas.find((f) => f.id === id);
const textoDesvio = (pagina, id) => pagina.textContent(`.crono-tabla tbody tr[data-momento="${id}"] td:last-child`);

async function abrirPresentador(pagina, url) {
  await pagina.goto(url, { waitUntil: 'load', timeout: ESPERA_MS });
  return esperar(pagina, () => document.documentElement.dataset.listo === '1' && document.querySelector('.presentador')?.dataset.conexion === 'si', null, ESPERA_MS);
}

async function pruebasSincronia(principal, presentador, prueba) {
  await prueba('estado inicial P01 en las dos vistas', () => ambas(principal, presentador, ['P01']));
  await presentador.click('#siguiente');
  await prueba('botón Siguiente del presentador mueve la principal a P02', () => ambas(principal, presentador, ['P02']));
  await principal.keyboard.press('ArrowRight');
  await prueba('flecha en la principal llega al presentador (P03, paso 1)', async () =>
    (await ambas(principal, presentador, ['P03', 0])) &&
    (await esperar(presentador, () => document.querySelector('.siguiente')?.dataset.siguiente === 'P03.1')));
  await presentador.keyboard.press('ArrowRight');
  await prueba('flecha en el presentador avanza un paso (P03, paso 2)', () => ambas(principal, presentador, ['P03', 1]));
  await presentador.keyboard.press('ArrowLeft');
  await presentador.keyboard.press('PageUp');
  await prueba('flecha izquierda y Re Pág en el presentador retroceden a P02', () => ambas(principal, presentador, ['P02']));
  await presentador.click('.indice-parada button[data-parada="P14"]');
  await prueba('clic en el índice lleva la principal a P14', () => ambas(principal, presentador, ['P14']));
  await presentador.keyboard.press('5');
  await prueba('tecla 5 en el presentador lleva a la primera parada de M5', () => ambas(principal, presentador, ['P22']));
  await presentador.click('#libre');
  await prueba('modo libre desde el presentador', async () =>
    (await esperar(principal, () => window.escenario.estado().modo === 'libre')) &&
    (await esperar(presentador, () => document.querySelector('#libre')?.getAttribute('aria-pressed') === 'true')));
  await presentador.keyboard.press('o');
  await prueba('tecla O en el presentador vuelve al recorrido', () => esperar(principal, () => window.escenario.estado().modo === 'recorrido'));
  await presentador.keyboard.press('h');
  const oculta = () => document.querySelector('.interfaz')?.classList.contains('oculta');
  await prueba('tecla H en el presentador oculta la interfaz principal', async () =>
    (await esperar(principal, oculta)) && (await esperar(presentador, () => document.querySelector('#interfaz')?.getAttribute('aria-pressed') === 'false')));
  await presentador.click('#interfaz');
  await prueba('botón Interfaz la muestra de nuevo', () => esperar(principal, () => !document.querySelector('.interfaz')?.classList.contains('oculta')));
  await principal.evaluate(() => (location.hash = 'p=P20&captura=1'));
  await prueba('cambio de hash en la principal llega al presentador (P20)', () => ambas(principal, presentador, ['P20']));
  await presentador.click('.indice-parada button[data-parada="P11"]');
  await ambas(principal, presentador, ['P11']);
  await prueba('«Omitir» salta la parada saltable P12', async () => {
    if (!(await presentador.isVisible('#omitir'))) return false;
    await presentador.click('#omitir');
    return ambas(principal, presentador, ['P13']);
  });
}

async function pruebasCronometro(principal, presentador, prueba, { url, dirCapturas }) {
  const r = {};
  await presentador.click('.indice-parada button[data-parada="P01"]');
  await ambas(principal, presentador, ['P01']);
  await presentador.click('#crono-marcha');
  await presentador.clock.fastForward(MINUTO);
  let l = await leerCrono(presentador);
  r.m0 = await textoDesvio(presentador, 'M0');
  await prueba('M0 tras 1 min: desvío −2:00 frente a 3 min', () => l.enMarcha && fila(l, 'M0').real === MINUTO && r.m0 === '−2:00');
  await presentador.click('.indice-parada button[data-parada="P03"]');
  await ambas(principal, presentador, ['P03']);
  await presentador.clock.fastForward(7 * MINUTO);
  l = await leerCrono(presentador);
  r.m1 = await textoDesvio(presentador, 'M1');
  await prueba('M1 tras 7 min: desvío +1:00 frente a 6 min; total 8:00', () =>
    fila(l, 'M1').real === 7 * MINUTO && r.m1 === '+1:00' && fila(l, 'M0').desvio === -2 * MINUTO && l.total === 8 * MINUTO && !l.retraso);
  await presentador.clock.fastForward(3 * MINUTO);
  l = await leerCrono(presentador);
  r.acumulado = await presentador.textContent('.crono-acumulado');
  await prueba('desvío acumulado +2:00 marca retraso y resalta las saltables', async () =>
    l.acumulado === 2 * MINUTO && l.retraso && r.acumulado === '+2:00' &&
    (await esperar(presentador, () => document.querySelector('.presentador').dataset.retraso === 'si')));
  await presentador.click('.indice-parada button[data-parada="P14"]');
  await ambas(principal, presentador, ['P14']);
  await presentador.keyboard.press('ArrowRight');
  await ambas(principal, presentador, ['P14', 1]);
  r.captura = 'presentador.png';
  await presentador.screenshot({ path: path.join(dirCapturas, r.captura) });
  await presentador.click('#crono-marcha');
  await presentador.clock.fastForward(MINUTO);
  l = await leerCrono(presentador);
  await prueba('en pausa el total no avanza (11:00)', () => !l.enMarcha && l.total === 11 * MINUTO);
  r.recarga = await abrirPresentador(presentador, url);
  l = await leerCrono(presentador);
  await prueba('una recarga del presentador conserva el cronómetro y la parada', async () =>
    r.recarga && l.total === 11 * MINUTO && fila(l, 'M1').real === 10 * MINUTO && (await enPresentador(presentador, ['P14', 1])));
  await presentador.click('#crono-reinicio');
  l = await leerCrono(presentador);
  await prueba('Reiniciar deja el cronómetro en cero', () => l.total === 0 && !l.iniciado);
  return r;
}

/** Abre la vista principal y la del presentador en el mismo contexto y comprueba la sincronía. */
export async function revisarPresentador(navegador, url, { origen, dirCapturas }) {
  const urlPresentador = new URL('presentador.html', url).href;
  const r = { url: urlPresentador, cargo: false, ms: null, errores: [], avisos: [], solicitudes: 0, externas: [], pruebas: [] };
  const contexto = await navegador.newContext({ viewport: VENTANA_PRESENTADOR, deviceScaleFactor: 1 });
  await bloquearExternas(contexto, origen);
  const principal = await contexto.newPage();
  const presentador = await contexto.newPage();
  vigilar(principal, origen, r);
  vigilar(presentador, origen, r);
  const prueba = async (nombre, fn) => {
    let ok = false;
    try {
      ok = Boolean(await fn());
    } catch (error) {
      r.errores.push(`Prueba «${nombre}»: ${error.message.split('\n')[0]}`);
    }
    r.pruebas.push({ nombre, ok });
  };
  try {
    await presentador.clock.install({ time: RELOJ });
    await principal.goto(`${url}#p=P01&captura=1`, { waitUntil: 'load', timeout: ESPERA_MS });
    await principal.waitForFunction(() => document.documentElement.dataset.listo === '1', null, { timeout: ESPERA_MS });
    await pausarDibujo(principal);
    const inicio = Date.now();
    r.cargo = await abrirPresentador(presentador, urlPresentador);
    r.ms = Date.now() - inicio;
    if (!r.cargo) throw new Error('el presentador no se conectó con la vista principal');
    await presentador.clock.pauseAt(new Date(RELOJ.getTime() + MINUTO));
    await pruebasSincronia(principal, presentador, prueba);
    r.cronometro = await pruebasCronometro(principal, presentador, prueba, { url: urlPresentador, dirCapturas });
    r.captura = r.cronometro.captura;
  } catch (error) {
    r.errores.push(`Presentador: ${error.message.split('\n')[0]}`);
  } finally {
    await contexto.close();
  }
  r.correctas = r.pruebas.filter((p) => p.ok).length;
  return r;
}
