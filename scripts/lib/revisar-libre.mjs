// Revisión del modo libre: doble clic hacia un punto del relieve, marcha con WASD y flechas, cámara sobre
// el relieve, objetivo dentro de la maqueta, botonera y salida. Página con #captura=1 (vuelos inmediatos)
// y ciclo de dibujo en pausa: la marcha avanza con cuadros manuales de dt fijo.
import path from 'node:path';
import { estado, pausarDibujo, dibujarCuadro } from './revisar-paradas.mjs';

const DT = 0.05;
const PISO = 6; // src/navegacion/limites.js, MARGEN.piso
const MARGEN_MINIMO = 14; // MARGEN.minimo
const BORDE = { x: 600, z: 450 }; // mitad de MEDIDAS (src/escena/maqueta.js)
const SALTO_MAXIMO = 0.35; // cambio máximo del desplazamiento por cuadro, en fracción del mayor
const CALIDAD_JPEG = 60;

const leer = (pagina) => pagina.evaluate(() => window.escenario.libre.leer());
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const horizontal = (a, b) => Math.hypot(a[0] - b[0], a[2] - b[2]);
const dentro = (o) => Math.abs(o[0]) <= BORDE.x + 1e-6 && Math.abs(o[2]) <= BORDE.z + 1e-6;

// n cuadros manuales de dt; devuelve la lectura de cada uno.
const cuadros = (pagina, n, dt = DT) =>
  pagina.evaluate(
    ([k, d]) => Array.from({ length: k }, () => (window.escenario.libre.paso(d), window.escenario.libre.leer())),
    [n, dt],
  );

// Mantiene teclas pulsadas durante n cuadros y deja n2 cuadros para frenar.
async function marchar(pagina, teclas, n, n2, dt = DT) {
  for (const t of teclas) await pagina.keyboard.down(t);
  const durante = await cuadros(pagina, n, dt);
  for (const t of [...teclas].reverse()) await pagina.keyboard.up(t);
  return [...durante, ...(await cuadros(pagina, n2, dt))];
}

// Desplazamiento del objetivo por cuadro; suavidad (sin saltos) y detención al soltar.
function analizar(inicio, lecturas, eje) {
  const objetivos = [inicio.objetivo, ...lecturas.map((l) => l.objetivo)];
  const pasos = objetivos.slice(1).map((o, i) => horizontal(o, objetivos[i]));
  const mayor = Math.max(...pasos);
  const saltos = pasos.slice(1).map((d, i) => Math.abs(d - pasos[i]));
  const fin = objetivos.at(-1);
  const dx = fin[0] - inicio.objetivo[0];
  const dz = fin[2] - inicio.objetivo[2];
  const total = Math.hypot(dx, dz);
  return {
    recorrido: Number(total.toFixed(1)),
    direccion: total > 0 ? Number(((dx * eje[0] + dz * eje[1]) / total).toFixed(3)) : 0,
    salto: mayor > 0 ? Number((Math.max(pasos[0], ...saltos) / mayor).toFixed(2)) : 0,
    detenida: pasos.at(-1) < mayor * 0.01,
    sobre: Number(Math.min(...lecturas.map((l) => l.sobre)).toFixed(1)),
    dentro: lecturas.every((l) => dentro(l.objetivo)),
  };
}

// Ejes horizontales de la vista: adelante y derecha.
function ejes(l) {
  const ax = l.objetivo[0] - l.posicion[0];
  const az = l.objetivo[2] - l.posicion[2];
  const n = Math.hypot(ax, az);
  return { adelante: [ax / n, az / n], derecha: [-az / n, ax / n] };
}

// Un punto de la ventana sobre el lienzo que no toca la maqueta (fondo).
const puntoFuera = (pagina) =>
  pagina.evaluate(() => {
    for (let y = 10; y < innerHeight; y += 40) {
      for (let x = innerWidth / 3; x < innerWidth; x += 40) {
        if (document.elementFromPoint(x, y)?.tagName === 'CANVAS' && !window.escenario.libre.puntoBajo(x, y)) return { x, y };
      }
    }
    return null;
  });

export async function revisarLibre(pagina, { dirCapturas }) {
  await pausarDibujo(pagina);
  // irA directo: si el hash ya es #p=P01, cambiarlo de nuevo no dispara «hashchange».
  await pagina.evaluate(() => window.escenario.irA('P01', { instantanea: true }));
  const r = {};
  const blanco = await pagina.evaluate(() => window.escenario.proyectar('piedemonte'));
  const ancla = await pagina.evaluate(() => window.escenario.ancla('piedemonte'));

  // En el recorrido, el doble clic no mueve la cámara.
  const pedida = (await estado(pagina)).camara;
  await pagina.mouse.dblclick(blanco.x, blanco.y);
  r.recorridoQuieto = igual(pedida, (await estado(pagina)).camara);

  // Doble clic fuera de la maqueta (fondo de la vista general): sin vuelo.
  await pagina.keyboard.press('o');
  const fuera = await puntoFuera(pagina);
  if (fuera) await pagina.mouse.dblclick(fuera.x, fuera.y);
  r.fueraQuieto = Boolean(fuera) && igual(pedida, (await estado(pagina)).camara);

  // Doble clic dos veces sobre el mismo punto: vuela hasta él y acerca a la mitad cada vez.
  const inicial = await leer(pagina);
  await pagina.mouse.dblclick(blanco.x, blanco.y);
  const primero = await leer(pagina);
  const otra = await pagina.evaluate((p) => window.escenario.proyectarPunto(p), primero.objetivo);
  await pagina.mouse.dblclick(otra.x, otra.y);
  const segundo = await leer(pagina);
  const camara = (await estado(pagina)).camara;
  r.vuelo = {
    error: Number(horizontal(primero.objetivo, ancla).toFixed(1)),
    distancias: [inicial, primero, segundo].map((l) => Math.round(l.distancia)),
    duracion: Number(camara.duracion?.toFixed(2)),
    punto: Boolean(camara.punto),
  };
  r.vuelo.correcto =
    r.vuelo.punto && r.vuelo.error < 8 && horizontal(segundo.objetivo, primero.objetivo) < 8 &&
    Math.abs(primero.distancia - inicial.distancia / 2) < 1 && Math.abs(segundo.distancia - primero.distancia / 2) < 1 &&
    camara.duracion >= 1.5 && camara.duracion <= 2.5;

  // W: adelante. Flecha derecha: a la derecha, sin cambiar de parada.
  const e0 = ejes(segundo);
  r.adelante = analizar(segundo, await marchar(pagina, ['w'], 30, 40), e0.adelante);
  await dibujarCuadro(pagina);
  r.captura = 'libre.jpg';
  await pagina.screenshot({ path: path.join(dirCapturas, r.captura), type: 'jpeg', quality: CALIDAD_JPEG });
  const l1 = await leer(pagina);
  r.derecha = analizar(l1, await marchar(pagina, ['ArrowRight'], 20, 40), ejes(l1).derecha);
  const e1 = await estado(pagina);
  r.flechaSinParada = e1.parada === 'P01' && e1.modo === 'libre';

  // Mayús + A durante 30 s: el objetivo llega al borde con frenado y no sale.
  const l2 = await leer(pagina);
  const borde = await marchar(pagina, ['Shift', 'a'], 600, 20);
  const fin = borde.at(-1).objetivo;
  r.borde = {
    dentro: borde.every((l) => dentro(l.objetivo)),
    holgura: Number(Math.min(BORDE.x - Math.abs(fin[0]), BORDE.z - Math.abs(fin[2])).toFixed(2)),
    sobre: Number(Math.min(...borde.map((l) => l.sobre)).toFixed(1)),
    salto: analizar(l2, borde, ejes(l2).derecha.map((v) => -v)).salto,
  };

  // Cámara bajo el relieve (como si la órbita la empujara): sube en el primer cuadro y luego hasta el margen.
  await pagina.evaluate(() => window.escenario.vista('ladera', { distancia: 60, elevacion: -10, azimut: 60 }));
  const hundida = (await leer(pagina)).sobre;
  const subida = await cuadros(pagina, 60, 1 / 60);
  r.relieve = {
    inicial: Number(hundida.toFixed(1)),
    primerCuadro: Number(subida[0].sobre.toFixed(1)),
    final: Number(subida.at(-1).sobre.toFixed(1)),
  };
  r.relieve.correcto = hundida < 0 && subida.every((l) => l.sobre >= PISO - 0.01) && r.relieve.final >= MARGEN_MINIMO - 0.5;

  // Botonera en modo libre: escala desde el objetivo actual.
  const l3 = await leer(pagina);
  await pagina.click('.escala[data-escala="vereda"]');
  const l4 = await leer(pagina);
  r.botonera = horizontal(l3.objetivo, l4.objetivo) < 0.5 && Math.abs(l4.distancia - 900) < 1 && (await estado(pagina)).escala === 'vereda';

  // O: vuelve al recorrido con la cámara de la parada.
  await pagina.keyboard.press('o');
  const bloque = (await estado(pagina)).camara;
  r.salida = (await estado(pagina)).modo === 'recorrido' && (await pagina.evaluate((b) => window.escenario.desvioBloque(b), bloque)) < 0.5;

  const marchaBien = (m) => m.direccion > 0.98 && m.salto <= SALTO_MAXIMO && m.detenida && m.sobre >= PISO - 0.01 && m.dentro && m.recorrido > 10;
  r.correcto =
    r.recorridoQuieto && r.vuelo.correcto && r.fueraQuieto && marchaBien(r.adelante) && marchaBien(r.derecha) && r.flechaSinParada &&
    r.borde.dentro && r.borde.holgura < 2 && r.borde.sobre >= PISO - 0.01 && r.borde.salto <= SALTO_MAXIMO &&
    r.relieve.correcto && r.botonera && r.salida;
  await pausarDibujo(pagina, false);
  return r;
}
