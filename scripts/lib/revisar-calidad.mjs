// Revisión de la calidad adaptable (etapa 7.c.b): ciclo de la tecla V y efectos por nivel en cuatro vistas; calidad
// en el hash y tras la recarga; relación de píxeles en una pantalla densa; detección al arrancar con umbral forzado
// (baja una vez y avisa), con umbral mínimo (no baja) y cancelada por la tecla V; aviso de carga antes de
// «escenario:listo»; y rótulos del lote sin recolocación con la cámara quieta.
import { createHash } from 'node:crypto';
import { bloquearExternas, vigilar, VENTANA } from './revisar-pagina.mjs';
import { VISTAS_RENDIMIENTO } from './revisar-rendimiento.mjs';

export const NIVELES = ['alta', 'media', 'liviana'];
const ESPERA_MS = 30000;
const DETECCION_MS = 90000;
const AVISO = { media: 'Calidad media. Tecla V para cambiarla' };
const CUPO_MEDIO = { cerca: 2250, lejos: 13000, radio: 230 }; // mitad de CUPO y de UMBRAL_CANA (src/coberturas/cana.js)

const calidadDe = (pagina) => pagina.evaluate(() => window.escenario.estado().calidad);
// Huella del lienzo (solo la escena): la captura de la página incluye la interfaz, cuyo texto puede variar en
// algunos píxeles de suavizado según el orden de las paradas visitadas.
const huella = async (pagina) =>
  createHash('sha1')
    .update(
      await pagina.evaluate(() => {
        window.escenario.dibujarCuadro();
        return document.querySelector('canvas').toDataURL('image/png');
      }),
    )
    .digest('hex');
const listo = (pagina) => pagina.waitForFunction(() => document.documentElement.dataset.listo === '1', null, { timeout: ESPERA_MS });

/** Lleva la vista principal a un nivel de calidad con la tecla V (alta → media → liviana → alta). */
export async function fijarCalidad(pagina, nivel) {
  for (let i = 0; i < NIVELES.length && (await calidadDe(pagina)) !== nivel; i++) await pagina.keyboard.press('v');
  return (await calidadDe(pagina)) === nivel;
}

// Cifras de una vista con la cámara quieta (tres cuadros, como en revisar-rendimiento.mjs).
const cifrasDe = (pagina, v) =>
  pagina.evaluate(([id, paso]) => {
    window.escenario.irA(id, { paso, instantanea: true });
    for (let i = 0; i < 3; i++) window.escenario.dibujarCuadro();
    const d = window.escenario.coberturas().datos();
    const e = window.escenario.estadisticas();
    const l = window.escenario.luz();
    return {
      triangulos: e.triangulos,
      llamadas: e.llamadas,
      instancias: d.dibujadas,
      matas: d.cana.cerca.cerca + d.cana.cerca.lejos,
      cupo: { cerca: d.cana.cerca.cerca, lejos: d.cana.cerca.lejos, radio: d.cana.cerca.radio },
      luz: { oclusion: l.oclusion, miniatura: l.miniatura, sombra: l.sombra.activa, viento: l.viento.fuerza > 0 },
      lote: window.escenario.lote()?.detalle ?? null,
    };
  }, [v.id, v.paso]);

// Ciclo de la tecla V con el dibujo en pausa: cifras por nivel, indicador, hash y regreso a la imagen inicial.
async function revisarNiveles(pagina) {
  const r = { niveles: {}, deteccion: await pagina.evaluate(() => window.escenario.deteccion()?.estado ?? null) };
  await pagina.evaluate(() => window.escenario.dibujo(false));
  const ultima = VISTAS_RENDIMIENTO[VISTAS_RENDIMIENTO.length - 1];
  await cifrasDe(pagina, ultima);
  const base = await huella(pagina);
  for (const nivel of NIVELES) {
    const llego = await fijarCalidad(pagina, nivel);
    const vistas = [];
    for (const v of VISTAS_RENDIMIENTO) vistas.push({ nombre: v.nombre, ...(await cifrasDe(pagina, v)) });
    r.niveles[nivel] = {
      llego,
      vistas,
      hash: await pagina.evaluate(() => new URLSearchParams(location.hash.slice(1)).get('calidad')),
      indicador: await pagina.textContent('.momentos-detalle'),
    };
  }
  r.ciclo = (await fijarCalidad(pagina, 'alta')) && NIVELES.every((n) => r.niveles[n].llego);
  await cifrasDe(pagina, ultima);
  r.vuelve = (await huella(pagina)) === base;
  // La huella distingue los niveles: en la calidad media la imagen cambia.
  await fijarCalidad(pagina, 'media');
  r.distingue = (await huella(pagina)) !== base;
  await fijarCalidad(pagina, 'alta');
  return r;
}

// Rótulos del lote y del corte: sin recolocación con la cámara quieta y en el mismo lugar al volver a la vista.
async function revisarRotulos(pagina) {
  const leer = () =>
    pagina.evaluate(() => {
      for (let i = 0; i < 5; i++) window.escenario.dibujarCuadro();
      const antes = window.escenario.lote().rotulos.colocaciones;
      for (let i = 0; i < 5; i++) window.escenario.dibujarCuadro();
      const visibles = [...document.querySelectorAll('.rotulos-lote > *')].filter((e) => !e.hidden);
      return { quietas: window.escenario.lote().rotulos.colocaciones - antes, total: antes, lugares: visibles.map((e) => e.style.transform) };
    });
  await pagina.evaluate(() => window.escenario.irA('P07', { instantanea: true }));
  const p07 = await leer();
  await pagina.evaluate(() => window.escenario.irA('P03', { paso: 2, instantanea: true }));
  const p03 = await leer();
  await pagina.evaluate(() => window.escenario.irA('P07', { instantanea: true }));
  const regreso = await leer();
  return {
    rotulos: { P07: p07.lugares.length, P03: p03.lugares.length },
    quietas: p07.quietas + p03.quietas + regreso.quietas,
    recoloca: p03.total > p07.total && regreso.total > p03.total,
    mismoLugar: regreso.lugares.length > 0 && regreso.lugares.join('|') === p07.lugares.join('|'),
  };
}

// Hash: la calidad elegida sobrevive a la recarga y un cambio manual del hash la aplica.
async function revisarHash(pagina) {
  const r = {};
  await pagina.evaluate(() => window.escenario.dibujo(true));
  r.elegida = await fijarCalidad(pagina, 'media');
  r.hash = await pagina.evaluate(() => location.hash);
  await pagina.reload({ waitUntil: 'load', timeout: ESPERA_MS });
  await listo(pagina);
  r.trasRecarga = await calidadDe(pagina);
  r.efectos = await pagina.evaluate(() => {
    const l = window.escenario.luz();
    return { oclusion: l.oclusion, miniatura: l.miniatura, sombra: l.sombra.activa };
  });
  r.deteccion = await pagina.evaluate(() => window.escenario.deteccion()?.estado ?? null);
  await pagina.evaluate(() => (location.hash = 'p=P01&captura=1&calidad=liviana'));
  r.manual = await pagina
    .waitForFunction(() => window.escenario.estado().calidad === 'liviana' && !window.escenario.luz().sombra.activa, null, { timeout: 10000 })
    .then(() => true, () => false);
  return r;
}

// Pantalla densa (dos píxeles por punto): relación de píxeles y muestras de suavizado por nivel.
async function revisarDensa(pagina) {
  const r = {};
  for (const nivel of NIVELES) {
    await fijarCalidad(pagina, nivel);
    r[nivel] = await pagina.evaluate(() => {
      window.escenario.dibujarCuadro();
      return { relacion: window.escenario.estadisticas().relacionPixeles, lienzo: document.querySelector('canvas').width };
    });
  }
  return r;
}

// Detección al arrancar (página sin #captura=1): espera a que termine o se cancele.
async function revisarDeteccion(pagina, { tecla = false } = {}) {
  // Con la tecla V antes de terminar la medida, la detección se cancela y no baja otro nivel.
  if (tecla) await pagina.keyboard.press('v');
  const termino = await pagina
    .waitForFunction(() => ['hecha', 'cancelada'].includes(window.escenario.deteccion()?.estado), null, { timeout: DETECCION_MS })
    .then(() => true, () => false);
  await pagina.waitForTimeout(1500);
  return {
    termino,
    ...(await pagina.evaluate(() => {
      const aviso = document.querySelector('.aviso-autor');
      return {
        deteccion: window.escenario.deteccion(),
        calidad: window.escenario.estado().calidad,
        hash: new URLSearchParams(location.hash.slice(1)).get('calidad'),
        aviso: aviso && !aviso.hidden ? aviso.querySelector('strong').textContent : null,
        indicador: document.querySelector('.momentos-detalle').textContent,
      };
    })),
  };
}

// Cuenta los cuadros del navegador con el aviso de carga visible antes de «escenario:listo».
function vigilarCarga() {
  window.__carga = { cuadros: 0, texto: null };
  const contar = () => {
    if (document.documentElement.dataset.listo === '1') return;
    const e = document.getElementById('carga');
    if (e && !e.hidden && e.getBoundingClientRect().height > 0) {
      window.__carga.cuadros += 1;
      window.__carga.texto = e.textContent;
    }
    requestAnimationFrame(contar);
  };
  requestAnimationFrame(contar);
}

/** Abre sus propias páginas sobre la vista compilada. */
export async function revisarCalidad(navegador, url, { origen }) {
  const r = { errores: [], avisos: [], solicitudes: 0, externas: [] };
  async function conPagina(direccion, fn, { ventana = VENTANA, escala = 1, inicio = null } = {}) {
    const contexto = await navegador.newContext({ viewport: ventana, deviceScaleFactor: escala });
    await bloquearExternas(contexto, origen);
    const pagina = await contexto.newPage();
    vigilar(pagina, origen, r);
    if (inicio) await pagina.addInitScript(inicio);
    try {
      await pagina.goto(direccion, { waitUntil: 'load', timeout: ESPERA_MS });
      await listo(pagina);
      return await fn(pagina);
    } catch (error) {
      r.errores.push(`Calidad (${direccion.split('#')[1] ?? ''}): ${error.message.split('\n')[0]}`);
      return null;
    } finally {
      await contexto.close();
    }
  }

  const principal = await conPagina(
    `${url}#p=P01&captura=1`,
    async (pagina) => {
      const carga = await pagina.evaluate(() => ({ ...window.__carga, oculto: document.getElementById('carga').hidden }));
      const niveles = await revisarNiveles(pagina);
      const rotulos = await revisarRotulos(pagina);
      const hash = await revisarHash(pagina);
      return { carga, niveles, rotulos, hash };
    },
    { inicio: vigilarCarga },
  );
  Object.assign(r, principal ?? {});
  r.directa = await conPagina(`${url}#p=P01&captura=1&calidad=liviana`, async (pagina) => ({
    calidad: await calidadDe(pagina),
    deteccion: await pagina.evaluate(() => window.escenario.deteccion()?.estado ?? null),
    sombra: await pagina.evaluate(() => window.escenario.luz().sombra.activa),
  }));
  r.densa = await conPagina(`${url}#p=P01&captura=1`, revisarDensa, { ventana: { width: 800, height: 450 }, escala: 2 });
  r.forzada = await conPagina(`${url}#p=P01&deteccion=100000`, async (pagina) => {
    const d = await revisarDeteccion(pagina);
    // Con la calidad ya en el hash, la recarga la conserva y no vuelve a medir.
    await pagina.reload({ waitUntil: 'load', timeout: ESPERA_MS });
    await listo(pagina);
    return { ...d, recarga: { calidad: await calidadDe(pagina), deteccion: await pagina.evaluate(() => window.escenario.deteccion()?.estado ?? null) } };
  });
  r.minima = await conPagina(`${url}#p=P01&deteccion=0.001`, (pagina) => revisarDeteccion(pagina));
  r.cancelada = await conPagina(`${url}#p=P01&deteccion=100000`, (pagina) => revisarDeteccion(pagina, { tecla: true }));
  return r;
}

export function fallasCalidad(r) {
  if (!r?.niveles) return ['Calidad: sin datos', ...(r?.errores ?? [])];
  const f = [...r.errores.map((e) => `Calidad: ${e}`), ...r.externas.map((u) => `Calidad: solicitud externa ${u}`)];
  const { alta, media, liviana } = r.niveles.niveles;
  if (!r.niveles.ciclo) f.push('Calidad: la tecla V no recorre alta, media y liviana');
  if (!r.niveles.vuelve || !r.niveles.distingue) f.push('Calidad: al volver a la alta la imagen difiere de la inicial (o la huella no distingue los niveles)');
  if (r.niveles.deteccion !== 'inactiva') f.push('Calidad: la detección corre en la verificación sin #deteccion=');
  for (const [nivel, datos] of Object.entries(r.niveles.niveles)) {
    // Antes de la primera pulsación el hash no lleva calidad: vale la alta.
    if (datos.hash !== nivel && !(nivel === 'alta' && datos.hash == null)) f.push(`Calidad: el hash no lleva calidad=${nivel}`);
    const esperado = nivel === 'alta' ? /^(?!.*Calidad)/ : new RegExp(`Calidad ${nivel}$`);
    if (!esperado.test(datos.indicador)) f.push(`Calidad: indicador «${datos.indicador}» en la calidad ${nivel}`);
  }
  alta.vistas.forEach((a, i) => {
    const [m, l] = [media.vistas[i], liviana.vistas[i]];
    if (!(a.luz.oclusion && a.luz.miniatura && a.luz.sombra && a.luz.viento)) f.push(`Calidad alta: faltan efectos en ${a.nombre}`);
    if (m.luz.oclusion || m.luz.miniatura || !m.luz.sombra || !m.luz.viento) f.push(`Calidad media: efectos distintos de los previstos en ${a.nombre}`);
    if (l.luz.oclusion || l.luz.miniatura || l.luz.sombra || l.luz.viento) f.push(`Calidad liviana: quedan efectos en ${a.nombre}`);
    if (m.instancias !== a.instancias) f.push(`Calidad media: la vegetación cambia en ${a.nombre}`);
    if (a.instancias && !(l.instancias < a.instancias * 0.6)) f.push(`Calidad liviana: no reduce la vegetación en ${a.nombre}`);
    if (m.cupo.cerca > CUPO_MEDIO.cerca || m.cupo.lejos > CUPO_MEDIO.lejos || m.cupo.radio > CUPO_MEDIO.radio) f.push(`Calidad media: caña cercana sobre la mitad del cupo o del radio en ${a.nombre}`);
    if (m.matas > a.matas) f.push(`Calidad media: más matas de caña que en la alta en ${a.nombre}`);
    if (l.matas) f.push(`Calidad liviana: quedan matas de caña en ${a.nombre}`);
    if (!(m.triangulos <= a.triangulos && l.triangulos <= m.triangulos)) f.push(`Calidad: los triángulos no bajan con el nivel en ${a.nombre}`);
  });
  const matas = (nivel) => nivel.vistas.reduce((suma, v) => suma + v.matas, 0);
  if (!(matas(media) > 0 && matas(media) < matas(alta))) f.push('Calidad media: no conserva una parte de las matas de caña cercanas');
  const h = r.hash;
  if (!h?.elegida || !/calidad=media/.test(h.hash) || h.trasRecarga !== 'media') f.push('Calidad: el nivel elegido no sobrevive a la recarga');
  else if (h.efectos.oclusion || h.efectos.miniatura || !h.efectos.sombra) f.push('Calidad: tras la recarga los efectos no son los de la calidad media');
  if (h?.deteccion !== 'inactiva') f.push('Calidad: con #calidad= en el hash la detección no queda inactiva');
  if (!h?.manual) f.push('Calidad: un cambio manual de #calidad= no se aplica');
  if (r.directa?.calidad !== 'liviana' || r.directa?.sombra) f.push('Calidad: #calidad=liviana no se aplica al cargar');
  const d = r.densa;
  if (d?.alta.relacion !== 1.5 || d?.media.relacion !== 1 || d?.liviana.relacion !== 1) f.push('Calidad: relación de píxeles distinta de 1,5 (alta) y 1 (media y liviana) en una pantalla densa');
  const z = r.forzada;
  if (!z?.termino || z.deteccion.bajo !== 'media' || z.calidad !== 'media' || z.hash !== 'media') f.push('Calidad: la detección con umbral forzado no baja a la calidad media');
  else {
    if (z.aviso !== AVISO.media) f.push(`Calidad: aviso «${z.aviso}» al bajar sola`);
    if (z.recarga.calidad !== 'media' || z.recarga.deteccion !== 'inactiva') f.push('Calidad: tras bajar sola, la recarga no conserva el nivel o vuelve a medir');
  }
  const n = r.minima;
  if (!n?.termino || n.deteccion.estado !== 'hecha' || n.deteccion.bajo || n.calidad !== 'alta' || n.aviso) f.push('Calidad: la detección con umbral mínimo cambia la calidad');
  const c = r.cancelada;
  if (!c?.termino || c.deteccion.estado !== 'cancelada' || c.calidad !== 'media') f.push('Calidad: la tecla V no cancela la detección');
  if (!(r.carga?.cuadros > 0) || r.carga.texto !== 'Cargando…' || !r.carga.oculto) f.push('Carga: el aviso «Cargando…» no se ve antes de la escena o no se oculta al quedar lista');
  const t = r.rotulos;
  if (!t || t.quietas !== 0) f.push(`Rótulos del lote: ${t?.quietas} recolocaciones con la cámara quieta`);
  if (!t?.recoloca || !t?.mismoLugar) f.push('Rótulos del lote: no se recolocan al cambiar de vista o no vuelven al mismo lugar');
  return f;
}

export { seccionCalidad } from './informe-calidad.mjs';
