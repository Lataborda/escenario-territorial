// Rótulos del lote y del corte de suelo sobre la escena (etapa 7). Niveles de organización (capa del nivel, P03),
// marcadores numerados de las interacciones entre especies (capa «interacciones»; el número remite al panel de
// src/ui/interacciones.js) y corte de suelo: horizontes a la izquierda, biota a la derecha y rótulo de cierre encima
// (visible con el corte en su lugar). Textos en contenido/lote.json. Elementos de
// la interfaz con panel propio, colocados en cada cuadro sobre la proyección de su punto; un rótulo que se cruza con
// otro ya colocado sube hasta quedar libre.
import './lote.css';
import contenido from '../../contenido/lote.json';
import { obtener, suscribir } from '../estado.js';
import { plantaCercana, puntoDeLote } from './disposicion.js';
import { SUELO, ALTO } from './lote.js';
import { marca } from '../ui/capas.js';

const SEPARACION = 6; // px entre rótulos que se cruzan

function crear(capa, clase, titulo, texto, enLinea = false) {
  const e = document.createElement('div');
  e.className = `rotulo-finca resaltado rotulo-lote ${clase}`;
  e.hidden = true;
  const t = document.createElement('strong');
  t.textContent = titulo;
  e.append(t);
  if (texto) {
    const s = document.createElement('span');
    s.textContent = enLinea ? ` ${texto}` : texto;
    e.append(s);
  }
  if (enLinea) e.classList.add('en-linea');
  capa.append(e);
  return e;
}

/** lote y corte: módulos de lote.js y suelo.js; proyectar(x, y, z) → { x, y } en píxeles o null. */
export function crearRotulosLote({ contenedor, lote, corte, altura, proyectar, alCuadro }) {
  const capa = document.createElement('div');
  capa.className = 'rotulos-finca rotulos-lote';
  capa.setAttribute('aria-hidden', 'true');
  contenedor.prepend(capa);
  const d = lote.disposicion;
  const enSuelo = (x, z, alto) => [x, altura(x, z) + SUELO + alto, z];
  const centroLote = (r, alto) => enSuelo((r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2, alto);
  const organismo = d.plantas.find((p) => p.organismo);
  const lugares = {
    planta: enSuelo(organismo.x, organismo.z, ALTO.cafeto + 0.25),
    policultivo: centroLote(d.policultivo, ALTO.guamo + 1.2),
    // Monocultivo: hacia el policultivo, para que el rótulo quede en la vista de población.
    monocultivo: enSuelo(d.monocultivo.x0 + 0.72 * (d.monocultivo.x1 - d.monocultivo.x0), (d.monocultivo.z0 + d.monocultivo.z1) / 2, ALTO.cana + 1.4),
    lotes: centroLote(d.todo, 9),
  };

  // Rótulos de los niveles y de las interacciones, con su punto fijo.
  const fijos = [];
  for (const n of contenido.niveles) {
    for (const r of n.rotulos) fijos.push({ e: crear(capa, `nivel nivel-${n.id}`, r.titulo, r.texto), capa: n.capa, punto: lugares[r.en], ancla: 'arriba' });
  }
  contenido.interacciones.forEach((i, k) => {
    const { x, z } = puntoDeLote(d[i.lote], i.lugar);
    const p = plantaCercana(d.plantas, i.en, i.lote, x, z);
    const e = document.createElement('div');
    e.className = 'rotulo-finca marcador';
    e.hidden = true;
    e.append(marca(k + 1));
    capa.append(e);
    fijos.push({ e, capa: 'interacciones', punto: enSuelo(p.x, p.z, ALTO[i.en] * p.escala + 0.4), ancla: 'centro', id: i.id });
  });

  // Rótulos del corte: punto sobre la cara dibujada (se mueve con la subida del bloque).
  const s = contenido.suelo;
  const limites = corte.perfil.limites;
  const delCorte = [];
  s.horizontes.forEach((h, k) => {
    const v = ((k ? limites[k - 1] : 0) + Math.min(limites[k], 1)) / 2;
    delCorte.push({ e: crear(capa, 'lado-izquierdo', h.rotulo, h.texto, true), u: 0, v, afuera: 0, ancla: 'izquierda' });
  });
  for (const b of s.biota) {
    const [, v] = corte.perfil.rasgos[b.id];
    delCorte.push({ e: crear(capa, 'lado-derecho', b.rotulo, b.texto, true), u: 1, v, afuera: 0, ancla: 'derecha' });
  }
  delCorte.push({ e: crear(capa, 'cierre', s.cierre.titulo, s.cierre.texto), u: 0.5, v: -0.3, afuera: 0, ancla: 'arriba' });

  let activos = [];
  function pintar({ capas }) {
    for (const r of [...fijos, ...delCorte]) r.e.hidden = true;
    activos = fijos.filter((r) => capas.includes(r.capa));
    colocar();
  }

  function colocar() {
    const lista = [...activos];
    if (corte.enSuLugar()) {
      for (const r of delCorte) lista.push({ ...r, punto: corte.puntoCara(r.u, r.v, r.afuera).toArray() });
    } else for (const r of delCorte) r.e.hidden = true;
    const ancho = window.innerWidth;
    const alto = window.innerHeight;
    const ocupadas = [];
    for (const r of lista) {
      const p = proyectar(...r.punto);
      const fuera = !p || p.x < 0 || p.y < 0 || p.x > ancho || p.y > alto;
      r.e.hidden = fuera;
      if (fuera) continue;
      const w = r.e.offsetWidth;
      const h = r.e.offsetHeight;
      // Caja en pantalla según el ancla: arriba (punta en el punto), a la izquierda o a la derecha del punto.
      let x0 = r.ancla === 'izquierda' ? p.x - w - 12 : r.ancla === 'derecha' ? p.x + 12 : p.x - w / 2;
      let y0 = r.ancla === 'arriba' ? p.y - h - 10 : p.y - h / 2;
      if (r.ancla === 'centro') x0 = p.x - w / 2;
      for (let intento = 0; intento < 12; intento++) {
        const choque = ocupadas.find((o) => x0 < o.x1 && x0 + w > o.x0 && y0 < o.y1 && y0 + h > o.y0);
        if (!choque) break;
        y0 = choque.y0 - h - SEPARACION;
      }
      ocupadas.push({ x0, y0, x1: x0 + w, y1: y0 + h });
      r.e.style.transform = `translate(${x0.toFixed(1)}px, ${y0.toFixed(1)}px)`;
    }
  }

  suscribir(['capas', 'escala'], pintar);
  pintar(obtener());
  alCuadro(colocar);
  return {
    // Verificación: rótulos visibles por grupo.
    visibles: () => ({
      niveles: fijos.filter((r) => r.capa !== 'interacciones' && !r.e.hidden).length,
      interacciones: fijos.filter((r) => r.capa === 'interacciones' && !r.e.hidden).map((r) => r.id),
      corte: delCorte.filter((r) => !r.e.hidden).length,
    }),
  };
}
