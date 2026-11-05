// División de la finca en lotes según la receta (contenido/fincas.json). Cada lote toma la parte de las teselas
// que le da su área o su peso. Orden: lotes junto al cauce (crecen desde la orilla), lotes junto a la casa (crecen
// desde el solar) y el resto en franjas a lo largo del rumbo de la receta, partidas en divisiones.
// Al final, cada lote queda en una sola pieza. Sin Three.js.
import { VECINOS } from './region.js';

const ALCANCE_CAUCE = 45; // un lote «cauce» necesita un cauce a esta distancia de la finca, o va al lado opuesto a la casa

// Cuántas teselas toma cada lote: proporción de su medida, al menos una, con el redondeo en el lote mayor.
function cupos(lotes, total) {
  const medidas = lotes.map((l) => l.ha ?? l.peso);
  const suma = medidas.reduce((a, b) => a + b, 0);
  const n = medidas.map((m) => Math.max(1, Math.round((m / suma) * total)));
  const mayor = medidas.indexOf(Math.max(...medidas));
  n[mayor] += total - n.reduce((a, b) => a + b, 0);
  return n;
}

// Crecimiento contiguo: toma k teselas libres desde las semillas, siempre la de menor prioridad en el frente.
function crecer({ semillas, k, libre, vecinos, prioridad }) {
  const frente = new Set(semillas.filter((t) => libre.has(t)));
  const tomadas = [];
  while (tomadas.length < k) {
    let elegida = -1;
    let mejor = Infinity;
    for (const t of frente) {
      const p = prioridad(t);
      if (p < mejor || (p === mejor && t < elegida)) [mejor, elegida] = [p, t];
    }
    if (elegida < 0) {
      // Frente agotado (la región tiene piezas separadas): sigue por la tesela libre de menor prioridad.
      const resto = [...libre];
      if (!resto.length) break;
      elegida = resto.reduce((a, b) => (prioridad(b) < prioridad(a) ? b : a));
    }
    // Tras la primera tesela, el frente son solo sus vecinas y las de las siguientes: el lote queda en una pieza.
    if (!tomadas.length) frente.clear();
    frente.delete(elegida);
    libre.delete(elegida);
    tomadas.push(elegida);
    for (const n of vecinos(elegida)) if (libre.has(n)) frente.add(n);
  }
  return tomadas;
}

// Une a un lote vecino las piezas sueltas de cada lote (la pieza mayor se queda).
function unirPiezas(loteDe, teselas, vecinos) {
  for (let ronda = 0; ronda < 3; ronda++) {
    let cambios = 0;
    const porLote = new Map();
    for (const t of teselas) {
      const k = loteDe.get(t);
      if (k < 0) continue;
      if (!porLote.has(k)) porLote.set(k, []);
      porLote.get(k).push(t);
    }
    for (const [k, lista] of porLote) {
      const piezas = [];
      const vistas = new Set();
      for (const t of lista) {
        if (vistas.has(t)) continue;
        const pieza = [t];
        vistas.add(t);
        for (let q = 0; q < pieza.length; q++) {
          for (const n of vecinos(pieza[q])) if (!vistas.has(n) && loteDe.get(n) === k) vistas.add(n), pieza.push(n);
        }
        piezas.push(pieza);
      }
      piezas.sort((a, b) => b.length - a.length || a[0] - b[0]);
      for (const pieza of piezas.slice(1)) {
        const cuenta = new Map();
        for (const t of pieza) for (const n of vecinos(t)) {
          const otro = loteDe.get(n);
          if (otro != null && otro >= 0 && otro !== k) cuenta.set(otro, (cuenta.get(otro) ?? 0) + 1);
        }
        if (!cuenta.size) continue;
        const destino = [...cuenta.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0];
        for (const t of pieza) loteDe.set(t, destino);
        cambios += 1;
      }
    }
    if (!cambios) break;
  }
}

// Índice de corte de una lista ordenada por clave: el cambio de franja (clave / ancho de tesela) más próximo a k,
// si queda a menos de la mitad de una franja; si no, k. Los linderos entre franjas quedan rectos.
function corte(lista, clave, k, ancho) {
  const franja = (t) => Math.round(clave(t) / ancho);
  let mejor = k;
  let distancia = Infinity;
  for (let i = 1; i < lista.length; i++) {
    if (franja(lista[i]) === franja(lista[i - 1])) continue;
    if (Math.abs(i - k) < distancia) [distancia, mejor] = [Math.abs(i - k), i];
  }
  const tolerancia = Math.max(2, lista.length / 12);
  return distancia <= tolerancia ? mejor : k;
}

// Devuelve Map tesela → índice de lote (−1 en el solar) y la lista de lotes { uso, rotulo, ha, teselas }.
export function dividir({ receta, centros, teselas, solar, borde, azar }) {
  const { columnas } = centros;
  const dentro = new Set(teselas);
  const vecinos = (t) => VECINOS.map(([di, dj]) => {
    const i = (t % columnas) + di;
    const j = Math.floor(t / columnas) + dj;
    return i >= 0 && i < columnas && j >= 0 && j < centros.filas ? j * columnas + i : -1;
  }).filter((n) => dentro.has(n));
  const xs = (t) => centros.x(t % columnas);
  const zs = (t) => centros.z(Math.floor(t / columnas));
  const libre = new Set(teselas.filter((t) => t !== solar));
  const n = cupos(receta.lotes, libre.size);
  const loteDe = new Map([[solar, -1]]);
  // Sub-lotes: cada lote de la receta con divisiones da varios lotes del mismo uso.
  const lotes = [];
  const asignar = (r, lista) => {
    const k = lotes.length;
    lotes.push({ uso: r.uso, rotulo: r.rotulo, ha: r.ha ?? null, receta: receta.lotes.indexOf(r), teselas: lista });
    for (const t of lista) loteDe.set(t, k);
  };
  const casa = { x: xs(solar), z: zs(solar) };
  const aCasa = (t) => Math.hypot(xs(t) - casa.x, zs(t) - casa.z);
  const cauceCerca = Math.min(...teselas.map((t) => borde[t])) <= ALCANCE_CAUCE;
  const orden = [
    ...receta.lotes.filter((l) => l.ubicacion === 'cauce'),
    ...receta.lotes.filter((l) => l.ubicacion === 'casa'),
  ];
  let previas = [];
  for (const r of orden) {
    const k = n[receta.lotes.indexOf(r)];
    let lista;
    if (r.ubicacion === 'casa') {
      lista = crecer({ semillas: vecinos(solar), k, libre, vecinos, prioridad: aCasa });
    } else {
      const prioridad = cauceCerca ? (t) => borde[t] + 0.01 * aCasa(t) : (t) => -aCasa(t);
      const semillas = previas.length ? previas.flatMap(vecinos) : [[...libre].reduce((a, b) => (prioridad(b) < prioridad(a) ? b : a))];
      lista = crecer({ semillas, k, libre, vecinos, prioridad });
      previas = previas.concat(lista);
    }
    asignar(r, lista);
  }
  // Resto: franjas a lo largo del rumbo y divisiones a lo ancho.
  const resto = receta.lotes.filter((l) => !l.ubicacion);
  const rumbo = ((receta.rumbo ?? 0) * Math.PI) / 180;
  const [ax, az] = [Math.cos(rumbo), Math.sin(rumbo)];
  const ruido = new Map([...libre].map((t) => [t, (azar() - 0.5) * 0.6]));
  const largo = (t) => xs(t) * ax + zs(t) * az + ruido.get(t);
  const ancho = (t) => -xs(t) * az + zs(t) * ax;
  const orden2 = [...libre].sort((a, b) => largo(a) - largo(b) || a - b);
  const paso = centros.paso;
  let desde = 0;
  let objetivo = 0;
  resto.forEach((r, q) => {
    objetivo += n[receta.lotes.indexOf(r)];
    const hasta = q === resto.length - 1 ? orden2.length : corte(orden2, largo, Math.min(objetivo, orden2.length), paso);
    const franja = orden2.slice(desde, hasta).sort((a, b) => ancho(a) - ancho(b) || a - b);
    desde = hasta;
    const d = Math.max(1, Math.min(r.divisiones ?? 1, franja.length));
    const cortes = [0];
    for (let p = 1; p < d; p++) cortes.push(Math.max(cortes[p - 1] + 1, corte(franja, ancho, Math.round((p * franja.length) / d), paso)));
    cortes.push(franja.length);
    for (let p = 0; p < d; p++) asignar(r, franja.slice(cortes[p], cortes[p + 1]));
  });
  unirPiezas(loteDe, teselas, vecinos);
  // Teselas finales de cada lote (tras unir piezas); se descartan los lotes vacíos.
  for (const l of lotes) l.teselas = [];
  for (const t of teselas) if (loteDe.get(t) >= 0) lotes[loteDe.get(t)].teselas.push(t);
  const vivos = lotes.map((l, k) => [l, k]).filter(([l]) => l.teselas.length);
  const nuevo = new Map(vivos.map(([, k], q) => [k, q]));
  for (const t of teselas) if (loteDe.get(t) >= 0) loteDe.set(t, nuevo.get(loteDe.get(t)));
  return { loteDe, lotes: vivos.map(([l]) => l), vecinos };
}
