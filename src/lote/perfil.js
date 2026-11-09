// Dibujo del perfil de suelo en un lienzo, con semilla fija (la imagen es idéntica en cada carga): horizontes de
// límites ondulados (fracciones de contenido/lote.json, suelo.horizontes), agregados y materia orgánica, raíces
// fibrosas desde las matas de la superficie, hifas junto a las raíces, galerías, lombrices y artrópodos. Esquema
// ilustrativo. Devuelve el lienzo y la posición (fracciones u desde la izquierda, v desde arriba) de cada rasgo
// rotulado.
import { crearAzar, crearRuidos } from '../util/azar.js';

const COLORES = { o: '#3a2a1c', a: '#3f2c1f', b: '#7a4b2d', c: '#9c7c53' };
const RASGOS = { raices: [0.62, 0.2], hifas: [0.36, 0.3], macrofauna: [0.74, 0.47], materia: [0.2, 0.09] };
const SEMILLA = 8803;

// Límite inferior ondulado de cada horizonte, en fracciones de alto.
function limites(horizontes, ruido) {
  let acumulado = 0;
  return horizontes.map((h, k) => {
    acumulado += h.fraccion;
    const base = acumulado;
    const ultimo = k === horizontes.length - 1;
    return (u) => (ultimo ? 1.01 : base + 0.018 * ruido(u * 3.1, k * 7.3) + 0.008 * ruido(u * 11, k * 3.1));
  });
}

function trazo(ctx, puntos, ancho, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = ancho;
  ctx.lineCap = 'round';
  ctx.beginPath();
  puntos.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
}

// Raíz con ramificaciones: camino que baja con desvíos; las ramas salen hacia los lados.
function raiz(ctx, azar, x, y, largo, ancho, nivel = 0) {
  const puntos = [[x, y]];
  let a = Math.PI / 2 + (azar() - 0.5) * 0.5;
  const n = 14;
  for (let k = 0; k < n; k++) {
    a += (azar() - 0.5) * 0.45;
    a = Math.min(Math.max(a, 0.35), Math.PI - 0.35);
    x += Math.cos(a) * (largo / n);
    y += Math.sin(a) * (largo / n);
    puntos.push([x, y]);
    if (nivel < 2 && azar() < 0.22) {
      const [px, py] = puntos[puntos.length - 1];
      raiz(ctx, azar, px, py, largo * 0.38, ancho * 0.55, nivel + 1);
    }
  }
  trazo(ctx, puntos, ancho, nivel ? '#cdb58a' : '#d8c296');
}

function lombriz(ctx, azar, x, y, largo, rumbo) {
  const puntos = [];
  for (let k = 0; k <= 16; k++) {
    const t = k / 16;
    puntos.push([x + Math.cos(rumbo) * largo * t + Math.sin(t * 6 + rumbo) * 6, y + Math.sin(rumbo) * largo * t + Math.cos(t * 5) * 5]);
  }
  trazo(ctx, puntos, 15, '#2a1c13'); // galería
  trazo(ctx, puntos, 9, '#b9726a');
  for (let k = 2; k < puntos.length - 1; k += 2) {
    const [px, py] = puntos[k];
    ctx.fillStyle = '#9d5a54';
    ctx.beginPath();
    ctx.arc(px, py, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#d08b80';
  ctx.beginPath();
  ctx.arc(...puntos[puntos.length - 1], 5, 0, Math.PI * 2);
  ctx.fill();
}

// Larva de escarabajo (forma de C) y artrópodos pequeños.
function larva(ctx, x, y) {
  ctx.strokeStyle = '#efe6cf';
  ctx.lineWidth = 11;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x, y, 13, 0.4, Math.PI * 1.7);
  ctx.stroke();
  ctx.fillStyle = '#a4702e';
  ctx.beginPath();
  ctx.arc(x + 12 * Math.cos(1.7 * Math.PI), y + 12 * Math.sin(1.7 * Math.PI), 6, 0, Math.PI * 2);
  ctx.fill();
}

function artropodo(ctx, azar, x, y) {
  ctx.fillStyle = '#1d1510';
  ctx.beginPath();
  ctx.ellipse(x, y, 6, 3.5, azar() * Math.PI, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1d1510';
  ctx.lineWidth = 1.2;
  for (let k = -1; k <= 1; k++) trazo(ctx, [[x - 6, y + k * 3], [x + 6, y - k * 3]], 1.2, '#1d1510');
}

/** horizontes: suelo.horizontes de contenido/lote.json; ancho y alto en píxeles. */
export function dibujarPerfil(horizontes, { ancho = 1024, alto = 1110, raicesDesde = [] } = {}) {
  const lienzo = document.createElement('canvas');
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext('2d');
  const azar = crearAzar(SEMILLA);
  const { onda, grano } = crearRuidos(SEMILLA, ['onda', 'grano']);
  const lim = limites(horizontes, onda);

  // Horizontes: cada uno cubre desde arriba hasta su límite inferior ondulado; del más hondo al más alto.
  for (let k = horizontes.length - 1; k >= 0; k--) {
    ctx.fillStyle = COLORES[horizontes[k].id] ?? '#6b5038';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let x = 0; x <= ancho; x += 8) ctx.lineTo(x, lim[k](x / ancho) * alto);
    ctx.lineTo(ancho, 0);
    ctx.fill();
  }
  // Textura: agregados en A, bloques en B, fragmentos de roca en C, residuos en O.
  const horizonteEn = (u, v) => horizontes[lim.findIndex((f) => v < f(u))]?.id ?? 'c';
  for (let n = 0; n < 2600; n++) {
    const u = azar();
    const v = azar();
    const h = horizonteEn(u, v);
    const x = u * ancho;
    const y = v * alto;
    if (h === 'o') {
      ctx.fillStyle = azar() < 0.5 ? 'rgba(120, 96, 58, 0.6)' : 'rgba(84, 64, 40, 0.6)';
      ctx.fillRect(x, y, 6 + azar() * 14, 1.5 + azar() * 2.5);
    } else if (h === 'a') {
      ctx.fillStyle = azar() < 0.6 ? 'rgba(20, 13, 8, 0.55)' : 'rgba(110, 82, 55, 0.5)';
      ctx.beginPath();
      ctx.arc(x, y, 2 + azar() * 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (h === 'b') {
      if (azar() < 0.5) continue;
      ctx.strokeStyle = 'rgba(60, 34, 18, 0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, 14 + azar() * 22, 10 + azar() * 16);
    } else {
      if (azar() < 0.7) continue;
      ctx.fillStyle = azar() < 0.5 ? '#b9a07a' : '#83694a';
      ctx.beginPath();
      ctx.ellipse(x, y, 6 + azar() * 14, 4 + azar() * 9, azar() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Variación suave de tono.
  for (let y = 0; y < alto; y += 16) {
    for (let x = 0; x < ancho; x += 16) {
      const g = grano(x / 90, y / 90);
      ctx.fillStyle = g > 0 ? `rgba(255, 240, 210, ${(0.05 * g).toFixed(3)})` : `rgba(0, 0, 0, ${(-0.07 * g).toFixed(3)})`;
      ctx.fillRect(x, y, 16, 16);
    }
  }
  // Materia orgánica en transformación: residuos y partículas oscuras arriba.
  const [mu, mv] = RASGOS.materia;
  for (let n = 0; n < 60; n++) {
    ctx.fillStyle = azar() < 0.5 ? 'rgba(160, 132, 82, 0.8)' : '#211710';
    ctx.fillRect(mu * ancho + (azar() - 0.5) * 200, mv * alto + (azar() - 0.5) * 70, 4 + azar() * 12, 2 + azar() * 3);
  }
  // Raíces fibrosas desde las matas de la superficie; más densas en A.
  const fuentes = raicesDesde.length ? raicesDesde : [0.15, 0.38, 0.62, 0.85];
  for (const u of fuentes) for (let k = 0; k < 9; k++) raiz(ctx, azar, (u + (azar() - 0.5) * 0.08) * ancho, 0.05 * alto, (0.22 + azar() * 0.35) * alto, 3.2);
  // Hifas: red fina y clara alrededor de su punto.
  const [hu, hv] = RASGOS.hifas;
  ctx.globalAlpha = 0.85;
  for (let n = 0; n < 70; n++) {
    let x = hu * ancho + (azar() - 0.5) * 210;
    let y = hv * alto + (azar() - 0.5) * 150;
    const puntos = [[x, y]];
    for (let k = 0; k < 6; k++) {
      x += (azar() - 0.5) * 34;
      y += (azar() - 0.5) * 34;
      puntos.push([x, y]);
    }
    trazo(ctx, puntos, 1.4, '#f4f0e4');
  }
  ctx.globalAlpha = 1;
  // Macrofauna: lombrices con su galería, una larva y artrópodos.
  const [fu, fv] = RASGOS.macrofauna;
  lombriz(ctx, azar, fu * ancho - 90, fv * alto - 20, 170, 0.35);
  lombriz(ctx, azar, 0.18 * ancho, 0.52 * alto, 130, -0.5);
  larva(ctx, 0.48 * ancho, 0.17 * alto);
  for (let n = 0; n < 7; n++) artropodo(ctx, azar, (0.08 + azar() * 0.84) * ancho, (0.06 + azar() * 0.2) * alto);
  return { lienzo, rasgos: RASGOS, limites: lim.map((f) => f(0.0)) };
}
