// Revisión de una página con Playwright: carga, errores, solicitudes, captura y rendimiento.
import path from 'node:path';

export const VENTANA = { width: 1600, height: 900 };
const ESPERA_MS = 30000;
const MEDICION_FPS_MS = 3000;
const FAMILIAS = ['IBM Plex Sans', 'Fraunces'];

// Una solicitud es local si va al origen permitido o no sale del equipo.
function esLocal(url, origen) {
  if (/^(data|blob|file|about):/.test(url)) return true;
  return origen ? url.startsWith(origen) : false;
}

async function medirFps(pagina, duracion) {
  return pagina.evaluate(
    (ms) =>
      new Promise((resolver) => {
        let cuadros = 0;
        const inicio = performance.now();
        function contar() {
          cuadros += 1;
          const transcurrido = performance.now() - inicio;
          if (transcurrido < ms) requestAnimationFrame(contar);
          else resolver(Math.round((cuadros * 10000) / transcurrido) / 10);
        }
        requestAnimationFrame(contar);
      }),
    duracion,
  );
}

function leerTipografias(pagina, familias) {
  return pagina.evaluate((lista) => {
    const caras = [...document.fonts];
    return lista.map((familia) => {
      const propias = caras.filter((c) => c.family.replace(/["']/g, '') === familia);
      const cargadas = propias.filter((c) => c.status === 'loaded').length;
      return { familia, caras: propias.length, cargadas };
    });
  }, familias);
}

/**
 * Abre `url` y devuelve el resultado de la revisión.
 * opciones: { origen, captura (ruta del PNG o null), medir (bool), extra (función async que recibe la página), ventana }
 * Sin `origen`, toda solicitud http(s) se bloquea: simula equipo sin red y sin servidor.
 */
export async function revisarPagina(navegador, url, { origen = null, captura = null, medir = false, extra = null, ventana = VENTANA }) {
  const contexto = await navegador.newContext({ viewport: ventana, deviceScaleFactor: 1 });
  const pagina = await contexto.newPage();
  const r = { url, cargo: false, ms: null, errores: [], avisos: [], solicitudes: 0, externas: [] };

  pagina.on('console', (m) => {
    if (m.type() === 'error') r.errores.push(m.text());
    else if (m.type() === 'warning') r.avisos.push(m.text());
  });
  pagina.on('pageerror', (e) => r.errores.push(`Excepción: ${e.message}`));
  pagina.on('request', (s) => {
    r.solicitudes += 1;
    if (!esLocal(s.url(), origen)) r.externas.push(s.url());
  });
  await contexto.route(
    (u) => u.protocol.startsWith('http'),
    (ruta) => (esLocal(ruta.request().url(), origen) ? ruta.continue() : ruta.abort()),
  );

  const inicio = Date.now();
  try {
    await pagina.goto(url, { waitUntil: 'load', timeout: ESPERA_MS });
    await pagina.waitForFunction(() => document.documentElement.dataset.listo === '1', null, {
      timeout: ESPERA_MS,
    });
    r.cargo = true;
    r.ms = Date.now() - inicio;
  } catch (error) {
    r.errores.push(`La página no quedó lista: ${error.message.split('\n')[0]}`);
  }

  if (r.cargo) {
    if (captura) {
      await pagina.screenshot({ path: captura });
      r.captura = path.basename(captura);
    }
    if (medir) r.fps = await medirFps(pagina, MEDICION_FPS_MS);
    r.estadisticas = await pagina.evaluate(() => window.escenario?.estadisticas?.() ?? null);
    r.tipografias = await leerTipografias(pagina, FAMILIAS);
    r.webgl = await pagina.evaluate(() => {
      const gl = document.querySelector('canvas')?.getContext('webgl2');
      const ext = gl?.getExtension('WEBGL_debug_renderer_info');
      return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : null;
    });
    if (extra) {
      try {
        r.extra = await extra(pagina);
      } catch (error) {
        r.errores.push(`Revisión adicional: ${error.message.split('\n')[0]}`);
      }
    }
  }
  await contexto.close();
  return r;
}
