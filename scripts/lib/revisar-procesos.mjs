// Revisión de los flujos de los procesos supraprediales (etapa 8.a): cada capa visible en su parada y apagada en
// P01; partículas que avanzan con el reloj e iguales con el mismo tiempo; rutas de escorrentía completas y con menos
// sedimento en S3 que en S0; nutrientes sin retorno en S0 y con retorno en S3; red de semillas que cruza el límite
// departamental y une la ladera con el resguardo; leyenda y rótulos; presupuesto gráfico de cada capa (triángulos y
// llamadas de dibujo que suma al cuadro). Página con #captura=1 (reloj quieto) en la ventana de 1600×900.
import path from 'node:path';

export const TOPE_TRIANGULOS = 50000; // PLAN, sección 4 (presupuesto gráfico por capa)
const MAXIMO_ROTULOS = 7;
const PARADAS = [
  { id: 'P09', capa: 'escorrentia_sedimentos', leyenda: ['agua', 'sedimento'] },
  { id: 'P10', capa: 'flujos_nutrientes', leyenda: ['nutrientes'] },
  { id: 'P11', capa: 'red_semillas', leyenda: ['semillas', 'custodio'] },
];

const ir = (pagina, id) => pagina.evaluate((id) => window.escenario.irA(id, { instantanea: true }), id);

// Cifras del cuadro, capas de flujo, leyenda y rótulos visibles.
function leer() {
  for (let k = 0; k < 2; k++) window.escenario.dibujarCuadro();
  const e = window.escenario.estadisticas();
  const caja = (x) => x.getBoundingClientRect();
  const cruzan = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  const visibles = (sel) => [...document.querySelectorAll(sel)].filter((x) => !x.hidden && x.offsetParent !== null);
  const interfaz = [...visibles('.ficha, .botonera, .momentos'), ...visibles('.columna-derecha > *')].map(caja);
  const rotulos = visibles('.rotulos-flujos > *');
  const cajas = rotulos.map(caja);
  return {
    triangulos: e.triangulos,
    llamadas: e.llamadas,
    flujos: window.escenario.flujos(),
    leyenda: visibles('.flujos .capas-entrada').map((x) => x.dataset.flujo),
    rotulos: rotulos.map((x) => x.dataset.rotulo),
    enEscena: visibles('.rotulos-finca > *').length,
    sobreInterfaz: cajas.filter((r) => interfaz.some((i) => cruzan(r, i))).length,
    fuera: cajas.filter((r) => r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight).length,
  };
}

export async function revisarProcesos(pagina, { dirCapturas }) {
  await pagina.evaluate(() => window.escenario.dibujo(false));
  const r = { paradas: [], capturas: [] };
  const foto = async (nombre) => {
    await pagina.screenshot({ path: path.join(dirCapturas, nombre), type: 'jpeg', quality: 82 });
    r.capturas.push(nombre);
  };
  await ir(pagina, 'P01');
  const p01 = await pagina.evaluate(leer);
  r.apagadasEnP01 = Object.values(p01.flujos.capas).every((c) => !c.visible) && !p01.leyenda.length;

  for (const p of PARADAS) {
    await ir(pagina, p.id);
    const con = await pagina.evaluate(leer);
    const capa = con.flujos.capas[p.capa];
    // Reloj: la huella de las partículas cambia con el tiempo y se repite con el mismo tiempo.
    const huellas = [];
    for (const t of [0, 2, 0]) {
      huellas.push(await pagina.evaluate(([t, id]) => {
        window.escenario.fijarRelojFlujos(t);
        return window.escenario.flujos().capas[id].huella;
      }, [t, p.capa]));
    }
    await pagina.evaluate(() => window.escenario.fijarRelojFlujos(null));
    await foto(`flujos-${p.id}.jpg`);
    // Presupuesto: el mismo cuadro sin la capa.
    const capas = await pagina.evaluate(() => {
      const encendidas = window.escenario.estado().capas;
      window.escenario.capas([]);
      return encendidas;
    });
    const sin = await pagina.evaluate(leer);
    await pagina.evaluate((lista) => window.escenario.capas(lista), capas);
    r.paradas.push({
      ...p,
      visible: capa.visible,
      solo: Object.entries(con.flujos.capas).every(([id, c]) => c.visible === (id === p.capa)),
      datos: capa,
      avanza: huellas[0] !== huellas[1],
      repite: huellas[0] === huellas[2],
      leyendaVista: con.leyenda,
      rotulos: con.rotulos,
      enEscena: con.enEscena,
      sobreInterfaz: con.sobreInterfaz,
      fuera: con.fuera,
      triangulos: con.triangulos - sin.triangulos,
      llamadas: con.llamadas - sin.llamadas,
    });
  }

  // Nutrientes en S3: arcos de retorno, su entrada en la leyenda y el rótulo del escenario.
  await ir(pagina, 'P10');
  await pagina.evaluate(() => window.escenario.cambiarEscenario('S3'));
  const s3 = await pagina.evaluate(leer);
  r.retorno = { datos: s3.flujos.capas.flujos_nutrientes, leyenda: s3.leyenda, rotulos: s3.rotulos };
  await foto('flujos-P10-S3.jpg');
  await pagina.evaluate(() => window.escenario.cambiarEscenario('S0'));
  return r;
}

export function fallasProcesos(r) {
  if (!r?.paradas?.length) return ['Procesos: sin datos de la revisión'];
  const f = [];
  if (!r.apagadasEnP01) f.push('Procesos: hay flujos o leyenda de flujos visibles en P01');
  for (const p of r.paradas) {
    const d = p.datos;
    if (!p.visible || !p.solo) f.push(`Procesos ${p.id}: la capa «${p.capa}» no es la única capa de flujo visible`);
    if (!d.particulas) f.push(`Procesos ${p.id}: sin partículas`);
    if (!p.avanza || !p.repite) f.push(`Procesos ${p.id}: las partículas no siguen el reloj (avanza ${p.avanza}, repite ${p.repite})`);
    if (p.leyendaVista.join() !== p.leyenda.join()) f.push(`Procesos ${p.id}: leyenda ${p.leyendaVista.join(', ') || 'vacía'} (esperada ${p.leyenda.join(', ')})`);
    if (p.triangulos > TOPE_TRIANGULOS) f.push(`Procesos ${p.id}: la capa suma ${p.triangulos} triángulos (tope ${TOPE_TRIANGULOS})`);
    if (p.enEscena > MAXIMO_ROTULOS) f.push(`Procesos ${p.id}: ${p.enEscena} rótulos en escena (máximo ${MAXIMO_ROTULOS})`);
    if (p.sobreInterfaz || p.fuera) f.push(`Procesos ${p.id}: rótulos sobre la interfaz (${p.sobreInterfaz}) o fuera de la ventana (${p.fuera})`);
  }
  const [agua, nutrientes, semillas] = r.paradas.map((p) => p.datos);
  if (agua.rutas !== agua.pedidas) f.push(`Procesos P09: ${agua.rutas} rutas de escorrentía de ${agua.pedidas}`);
  if (!agua.sedimentoEn.S0 || agua.sedimentoEn.S3 > agua.sedimentoEn.S0) f.push(`Procesos P09: rutas con sedimento S0 ${agua.sedimentoEn.S0} y S3 ${agua.sedimentoEn.S3}`);
  if (nutrientes.retorno || r.paradas[1].rotulos.join() !== 'sin_retorno') f.push('Procesos P10: retorno o rótulo inesperado en S0');
  if (!r.retorno.datos.retorno || r.retorno.datos.arcos !== 2 * nutrientes.arcos) f.push('Procesos P10: sin arcos de retorno en S3');
  if (!r.retorno.leyenda.includes('retorno') || r.retorno.rotulos.join() !== 'con_retorno') f.push('Procesos P10: leyenda o rótulo del retorno ausente en S3');
  if (!semillas.cruzanLimite || !semillas.entreGrupos) f.push('Procesos P11: la red de semillas no cruza el límite departamental o no une la ladera con el resguardo');
  if (r.paradas[2].rotulos.length !== 2) f.push(`Procesos P11: ${r.paradas[2].rotulos.length} rótulos (esperados 2)`);
  return f;
}

export function seccionProcesos(r) {
  if (!r?.paradas?.length) return ['## Procesos supraprediales', '', '- Sin datos', ''];
  const [agua, nutrientes, semillas] = r.paradas.map((p) => p.datos);
  const nubes = (d) => Object.entries(d.nubes).map(([n, c]) => `${n.replace('flujo-', '')} ${c}`).join(', ');
  const sed = Object.entries(agua.sedimentoEn).map(([e, n]) => `${e} ${n}`).join(', ');
  return [
    '## Procesos supraprediales',
    '',
    `- Flujos apagados en P01: ${r.apagadasEnP01 ? 'sí' : 'no'}`,
    `- P09, agua y sedimentos: ${agua.cauces} cauces y ${agua.rutas} rutas de escorrentía de ${agua.pedidas}; rutas con sedimento por escenario: ${sed}; partículas: ${nubes(agua)}`,
    `- P10, nutrientes: ${nutrientes.origenes} orígenes, ${nutrientes.arcos} arcos en S0 (retorno ${nutrientes.retorno ? 'sí' : 'no'}) y ${r.retorno.datos.arcos} en S3 (retorno ${r.retorno.datos.retorno ? 'sí' : 'no'}); partículas: ${nubes(nutrientes)} en S0 y ${nubes(r.retorno.datos)} en S3`,
    `- P11, semillas: ${semillas.custodios} custodios y ${semillas.enlaces} enlaces; ${semillas.cruzanLimite} cruzan el límite departamental y ${semillas.entreGrupos} unen la ladera con el resguardo; partículas: ${nubes(semillas)}`,
    ...r.paradas.map(
      (p) =>
        `- ${p.id}, presupuesto gráfico de la capa: ${p.triangulos} triángulos (tope ${TOPE_TRIANGULOS}) y ${p.llamadas} llamadas de dibujo; ${p.datos.particulas} partículas; reloj: avanza ${p.avanza ? 'sí' : 'no'}, repite ${p.repite ? 'sí' : 'no'}; leyenda: ${p.leyendaVista.join(', ')}; rótulos: ${p.rotulos.join(', ') || 'ninguno'} (${p.enEscena} en escena)`,
    ),
    `- Capturas: ${r.capturas.map((x) => `\`capturas/${x}\``).join(', ')}`,
    '',
  ];
}
