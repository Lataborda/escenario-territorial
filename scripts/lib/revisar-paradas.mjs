// Revisión del recorrido: las paradas por hash (con captura), el teclado, la botonera, el clic y la tecla C.
import path from 'node:path';

export const CARPETA_PARADAS = 'paradas';
const CALIDAD_JPEG = 60;

export const dosCuadros = (pagina) =>
  pagina.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

// Sin ciclo de dibujo, la página responde de inmediato (SwiftShader tarda 0,4 s por cuadro).
export const pausarDibujo = (pagina, pausa = true) => pagina.evaluate((p) => window.escenario.dibujo(!p), pausa);
export const dibujarCuadro = (pagina) => pagina.evaluate(() => window.escenario.dibujarCuadro());

const marca = (pagina) =>
  pagina.evaluate(() => {
    const d = document.documentElement.dataset;
    return { parada: d.parada, paso: Number(d.paso), transicion: Boolean(d.transicion) };
  });

export const estado = (pagina) => pagina.evaluate(() => window.escenario.estado());

// Lleva la página a una parada cambiando el hash (con #captura=1 el cambio es inmediato).
export async function irPorHash(pagina, id, paso = 0) {
  await pagina.evaluate(([i, k]) => {
    location.hash = `p=${i}${k ? `&paso=${k}` : ''}&captura=1`;
  }, [id, paso]);
  await pagina.waitForFunction(
    ([i, k]) => {
      const d = document.documentElement.dataset;
      return d.parada === i && d.paso === String(k) && !d.transicion;
    },
    [id, paso],
    { timeout: 15000 },
  );
}

// Contenido y geometría del panel de ficha y de los demás paneles.
export const leerFicha = (pagina) =>
  pagina.evaluate(() => {
    const caja = (sel) => {
      const r = document.querySelector(sel)?.getBoundingClientRect();
      return r && { izq: r.left, arr: r.top, der: r.right, aba: r.bottom };
    };
    const cruzan = (a, b) => a && b && a.izq < b.der && b.izq < a.der && a.arr < b.aba && b.arr < a.aba;
    const f = document.querySelector('.ficha');
    const c = caja('.ficha');
    return {
      parada: f.dataset.parada,
      titulo: f.querySelector('.ficha-titulo')?.textContent,
      texto: f.querySelector('.ficha-texto')?.textContent,
      fuentes: f.querySelector('.ficha-fuentes')?.textContent.trim() ?? '',
      nFuentes: f.querySelectorAll('.fuente').length,
      pasoActual: f.querySelector('.ficha-paso.actual')?.textContent ?? null,
      desborde: f.scrollHeight > f.clientHeight + 1,
      dentro: c.izq >= 0 && c.arr >= 0 && c.der <= innerWidth && c.aba <= innerHeight,
      superpuesta: cruzan(c, caja('.botonera')) || cruzan(c, caja('.momentos')),
      alto: Math.round(c.aba - c.arr),
      letra: parseFloat(getComputedStyle(f.querySelector('.ficha-texto')).fontSize),
    };
  });

// Recorre todas las paradas por hash: ficha, fuente, cámara y escala; guarda una captura JPEG por parada.
// El ciclo de dibujo está en pausa: un cuadro manual antes de cada captura.
async function recorrerParadas(pagina, paradas, dirCapturas) {
  const filas = [];
  for (const p of paradas) {
    const fila = { id: p.id, carga: false };
    try {
      await irPorHash(pagina, p.id);
      await dibujarCuadro(pagina);
      await pagina.screenshot({ path: path.join(dirCapturas, CARPETA_PARADAS, `${p.id}.jpg`), type: 'jpeg', quality: CALIDAD_JPEG });
      const f = await leerFicha(pagina);
      const e = await estado(pagina);
      const desvio = await pagina.evaluate((c) => window.escenario.desvioBloque(c), p.camara);
      Object.assign(fila, {
        carga: true,
        ficha: f.parada === p.id && f.titulo === p.titulo && f.texto === p.ficha,
        fuente: f.nFuentes > 0 && f.fuentes.length > 0,
        camara: desvio < 0.5,
        escala: e.escala === p.escala,
      });
    } catch (error) {
      fila.error = error.message.split('\n')[0];
    }
    filas.push(fila);
  }
  return filas;
}

// Flechas: recorren cada parada y cada paso, hacia adelante y hacia atrás.
async function revisarFlechas(pagina, paradas) {
  const esperada = paradas.flatMap((p) => Array.from({ length: Math.max(1, p.pasos?.length ?? 0) }, (_, k) => `${p.id}.${k}`));
  await irPorHash(pagina, paradas[0].id);
  const ida = [`${(await marca(pagina)).parada}.0`];
  for (let i = 1; i < esperada.length; i++) {
    await pagina.keyboard.press(i % 3 === 0 ? 'Space' : i % 3 === 1 ? 'ArrowRight' : 'PageDown');
    const m = await marca(pagina);
    ida.push(`${m.parada}.${m.paso}`);
  }
  await pagina.keyboard.press('ArrowRight');
  const final = await marca(pagina);
  const vuelta = [`${final.parada}.${final.paso}`];
  for (let i = 1; i < esperada.length; i++) {
    await pagina.keyboard.press(i % 2 ? 'ArrowLeft' : 'PageUp');
    const m = await marca(pagina);
    vuelta.push(`${m.parada}.${m.paso}`);
  }
  const igual = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
  return { estados: esperada.length, ida: igual(ida, esperada), vuelta: igual(vuelta, [...esperada].reverse()) };
}

// Teclas 0 a 6, O, H y V.
async function revisarTeclas(pagina, paradas, momentos) {
  const r = { momentos: true };
  for (let n = 0; n < momentos.length; n++) {
    await pagina.keyboard.press(String(n));
    const primera = paradas.find((p) => p.momento === momentos[n].id)?.id;
    if ((await marca(pagina)).parada !== primera) r.momentos = false;
  }
  await irPorHash(pagina, 'P06');
  await pagina.keyboard.press('o');
  const libre = { e: await estado(pagina), c: await pagina.evaluate(() => window.escenario.controles()) };
  await pagina.keyboard.press('o');
  const vuelta = { e: await estado(pagina), c: await pagina.evaluate(() => window.escenario.controles()) };
  r.libre = libre.e.modo === 'libre' && libre.c.habilitados && !libre.c.desplazamiento && vuelta.e.modo === 'recorrido' && !vuelta.c.habilitados;
  const oculta = () => pagina.evaluate(() => document.querySelector('.interfaz').classList.contains('oculta'));
  await pagina.keyboard.press('h');
  const h1 = await oculta();
  await pagina.keyboard.press('h');
  r.interfaz = h1 && !(await oculta());
  await pagina.keyboard.press('v');
  const v1 = (await estado(pagina)).liviano;
  await pagina.keyboard.press('v');
  r.liviano = v1 && !(await estado(pagina)).liviano;
  return r;
}

// Tecla C: bloque de cámara en formato de parada; aplicado de nuevo, reproduce la vista.
async function revisarTeclaC(pagina, entidades) {
  const vista = { ancla: 'F2', distancia: 640, azimut: -47, elevacion: 33 };
  await pagina.evaluate((v) => window.escenario.vista(v.ancla, v), vista);
  await pagina.keyboard.press('c');
  const texto = (await estado(pagina)).aviso?.texto ?? '';
  const r = { texto, valido: false, desvio: null };
  try {
    const bloque = JSON.parse(texto.replace(/^"camara":\s*/, ''));
    const numeros = ['distancia', 'azimut', 'elevacion', 'duracion'].every((k) => typeof bloque[k] === 'number');
    r.desvio = Number((await pagina.evaluate((b) => window.escenario.desvioBloque(b), bloque)).toFixed(2));
    r.valido =
      entidades.has(bloque.ancla) && numeros && bloque.duracion >= 1.5 && bloque.duracion <= 3 &&
      bloque.ancla === vista.ancla && Math.abs(bloque.azimut - vista.azimut) <= 1 && r.desvio < vista.distancia * 0.01;
  } catch (error) {
    r.error = error.message;
  }
  return r;
}

// Botonera y clic en una finca: cambian escala y cámara sin cambiar de parada.
async function revisarBotoneraYClic(pagina) {
  await irPorHash(pagina, 'P01');
  await pagina.click('.escala[data-escala="cuenca"]');
  const e1 = await estado(pagina);
  const pulsado = await pagina.getAttribute('.escala[data-escala="cuenca"]', 'aria-pressed');
  const botonera = e1.parada === 'P01' && e1.escala === 'cuenca' && e1.camara.distancia > 0 && pulsado === 'true';
  await irPorHash(pagina, 'P01');
  const punto = await pagina.evaluate(() => window.escenario.proyectar('F1'));
  await pagina.mouse.click(punto.x, punto.y);
  const e2 = await estado(pagina);
  const clic = e2.parada === 'P01' && e2.foco === 'F1' && e2.escala === 'finca' && e2.camara.ancla === 'F1';
  return { botonera, clic };
}

export async function revisarRecorrido(pagina, { paradas, momentos, entidades, dirCapturas }) {
  await pausarDibujo(pagina);
  const r = { paradas: await recorrerParadas(pagina, paradas, dirCapturas) };
  r.flechas = await revisarFlechas(pagina, paradas);
  r.teclas = await revisarTeclas(pagina, paradas, momentos);
  r.teclaC = await revisarTeclaC(pagina, entidades);
  Object.assign(r, await revisarBotoneraYClic(pagina));
  r.trayectorias = await pagina.evaluate(() => window.escenario.revisarTrayectorias());
  await pausarDibujo(pagina, false);
  return r;
}
