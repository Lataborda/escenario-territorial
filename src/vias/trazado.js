// Trazado de las vías: camino de menor costo (A*) sobre la rejilla de teselas entre los puntos de la red, con costo
// por pendiente, por cruce de cauces y por áreas que se rodean; suavizado, remuestreo, recorte en los asentamientos
// y tramos de puente. Se calcula una sola vez: lo usan las coberturas (corredor sin parcelas) y el dibujo de las vías.
import { ENTIDADES, BORDE, aMundoX, aMundoZ } from '../terreno/plano.js';
import { rejillaTeselas, teselaDe, distanciaACauce, LADO } from '../coberturas/rejilla.js';
import { RADIO } from '../asentamientos/trama.js';
import { RED, CATEGORIAS, EVITAR } from './red.js';

const PASO = 1.5; // separación de las muestras del trazo
const PENDIENTE = 45; // peso de la pendiente al cuadrado
const AGUA = 60; // costo adicional por tesela en un cauce
const RODEO = 40; // costo adicional por tesela en un área que se rodea
const REUSO = 0.5; // factor de costo sobre una tesela que ya tiene vía: los tramos se juntan
const ORILLA = 2; // una tesela a menos de esta distancia del borde del cauce cuenta como cauce
const PUENTE = 1.5; // margen sobre el cauce que cubre el tablero
const ESTRIBO = 4; // muestras de tablero a cada lado del cauce
// Vecindad de 16: pasos rectos, diagonales y de caballo (trazos menos escalonados).
const VECINOS = [];
for (let di = -2; di <= 2; di++) {
  for (let dj = -2; dj <= 2; dj++) {
    const g = Math.abs(di) + Math.abs(dj);
    if (g && ((Math.abs(di) < 2 && Math.abs(dj) < 2) || g === 3)) VECINOS.push([di, dj, Math.hypot(di, dj) * LADO]);
  }
}

function punto(p) {
  const limitar = (v, b) => Math.min(b - 1, Math.max(-b + 1, v));
  if (Array.isArray(p)) return { x: limitar(aMundoX(p[0]), BORDE.x), z: limitar(aMundoZ(p[1]), BORDE.z), radio: 0 };
  const e = ENTIDADES.find((x) => x.id === p);
  const radio = e.tipo === 'asentamiento' ? (e.id === 'ciudad' ? RADIO.ciudad : RADIO.cabecera) + 2 : 0;
  return { x: aMundoX(e.x), z: aMundoZ(e.z), radio };
}

function crearMonticulo() {
  const nodos = [];
  const claves = [];
  const cambiar = (a, b) => {
    [nodos[a], nodos[b]] = [nodos[b], nodos[a]];
    [claves[a], claves[b]] = [claves[b], claves[a]];
  };
  return {
    vacio: () => nodos.length === 0,
    poner(nodo, clave) {
      nodos.push(nodo);
      claves.push(clave);
      for (let i = nodos.length - 1; i > 0; ) {
        const p = (i - 1) >> 1;
        if (claves[p] <= claves[i]) break;
        cambiar(p, i);
        i = p;
      }
    },
    sacar() {
      const nodo = nodos[0];
      const n = nodos.pop();
      const c = claves.pop();
      if (nodos.length) {
        nodos[0] = n;
        claves[0] = c;
        for (let i = 0; ; ) {
          const a = 2 * i + 1;
          let m = i;
          if (a < nodos.length && claves[a] < claves[m]) m = a;
          if (a + 1 < nodos.length && claves[a + 1] < claves[m]) m = a + 1;
          if (m === i) break;
          cambiar(m, i);
          i = m;
        }
      }
      return nodo;
    },
  };
}

// Camino de menor costo entre dos teselas: lista de índices de tesela.
function buscar(origen, destino, costo, centros) {
  const { columnas, filas, total } = centros;
  const g = new Float64Array(total).fill(Infinity);
  const previo = new Int32Array(total).fill(-1);
  const cerrado = new Uint8Array(total);
  const dx = centros.x(destino % columnas);
  const dz = centros.z(Math.floor(destino / columnas));
  const h = (t) => REUSO * Math.hypot(centros.x(t % columnas) - dx, centros.z(Math.floor(t / columnas)) - dz);
  const abiertos = crearMonticulo();
  g[origen] = 0;
  abiertos.poner(origen, h(origen));
  while (!abiertos.vacio()) {
    const t = abiertos.sacar();
    if (cerrado[t]) continue;
    if (t === destino) break;
    cerrado[t] = 1;
    const i = t % columnas;
    const j = (t - i) / columnas;
    for (const [di, dj, d] of VECINOS) {
      const ni = i + di;
      const nj = j + dj;
      if (ni < 0 || nj < 0 || ni >= columnas || nj >= filas) continue;
      const n = nj * columnas + ni;
      if (cerrado[n]) continue;
      const c = g[t] + costo(t, n, d);
      if (c < g[n]) {
        g[n] = c;
        previo[n] = t;
        abiertos.poner(n, c + h(n));
      }
    }
  }
  const camino = [];
  for (let t = destino; t >= 0; t = previo[t]) camino.push(t);
  return camino.reverse();
}

// Suavizado de Chaikin (conserva los extremos) y remuestreo a paso fijo.
function suavizar(puntos, vueltas = 3) {
  let p = puntos;
  for (let v = 0; v < vueltas; v++) {
    const q = [p[0]];
    for (let k = 0; k < p.length - 1; k++) {
      const a = p[k];
      const b = p[k + 1];
      q.push({ x: 0.75 * a.x + 0.25 * b.x, z: 0.75 * a.z + 0.25 * b.z }, { x: 0.25 * a.x + 0.75 * b.x, z: 0.25 * a.z + 0.75 * b.z });
    }
    q.push(p[p.length - 1]);
    p = q;
  }
  const salida = [{ ...p[0] }];
  let resto = 0;
  for (let k = 0; k < p.length - 1; k++) {
    const a = p[k];
    const b = p[k + 1];
    const l = Math.hypot(b.x - a.x, b.z - a.z);
    for (let s = PASO - resto; s <= l; s += PASO) salida.push({ x: a.x + ((b.x - a.x) * s) / l, z: a.z + ((b.z - a.z) * s) / l });
    resto = (resto + l) % PASO;
  }
  return salida;
}

function trazarVias(altura) {
  const { centros, cauces } = rejillaTeselas();
  const { columnas, total } = centros;
  const cx = (t) => centros.x(t % columnas);
  const cz = (t) => centros.z(Math.floor(t / columnas));
  const alturas = new Float32Array(total);
  const agua = new Uint8Array(total);
  const rodeo = new Uint8Array(total);
  const usada = new Uint8Array(total);
  const mascara = new Uint8Array(total);
  const areas = EVITAR.map((a) => ({ ...punto(a.id), radio: a.radio }));
  for (let t = 0; t < total; t++) {
    alturas[t] = altura(cx(t), cz(t));
    agua[t] = cauces.borde[t] < ORILLA ? 1 : 0;
    rodeo[t] = areas.some((a) => Math.hypot(cx(t) - a.x, cz(t) - a.z) < a.radio) ? 1 : 0;
  }
  const costo = (t, n, d) => {
    const p = (alturas[n] - alturas[t]) / d;
    const c = d * (1 + PENDIENTE * p * p) + (agua[n] ? AGUA : 0) + (rodeo[n] ? RODEO : 0);
    return usada[n] ? c * REUSO : c;
  };

  const trazos = [];
  for (const tramo of RED) {
    const cat = CATEGORIAS[tramo.categoria];
    for (let k = 0; k < tramo.puntos.length - 1; k++) {
      const a = punto(tramo.puntos[k]);
      const b = punto(tramo.puntos[k + 1]);
      const camino = buscar(teselaDe(centros, a.x, a.z), teselaDe(centros, b.x, b.z), costo, centros);
      for (const t of camino) usada[t] = 1;
      const crudos = camino.map((t) => ({ x: cx(t), z: cz(t) }));
      crudos[0] = { x: a.x, z: a.z };
      crudos[crudos.length - 1] = { x: b.x, z: b.z };
      // Recorte dentro de la ciudad y las cabeceras: sus calles continúan la vía.
      const puntos = suavizar(crudos).filter((p) => Math.hypot(p.x - a.x, p.z - a.z) >= a.radio && Math.hypot(p.x - b.x, p.z - b.z) >= b.radio);
      if (puntos.length < 2) continue;
      trazos.push({ categoria: tramo.categoria, ancho: cat.ancho, puntos, puentes: puentes(puntos, cauces, centros) });
    }
  }
  // Corredor sin parcelas: teselas bajo la calzada y sus bordes.
  for (const v of trazos) {
    v.puntos.forEach((p, k) => {
      const q = v.puntos[Math.min(k + 1, v.puntos.length - 1)];
      const o = v.puntos[Math.max(k - 1, 0)];
      const l = Math.hypot(q.x - o.x, q.z - o.z) || 1;
      const nx = -(q.z - o.z) / l;
      const nz = (q.x - o.x) / l;
      for (const s of [-1, 0, 1]) {
        const t = teselaDe(centros, p.x + s * nx * (v.ancho / 2 + 1), p.z + s * nz * (v.ancho / 2 + 1));
        if (t >= 0) mascara[t] = 1;
      }
    });
  }
  return { trazos, mascara };
}

// Tramos de puente: muestras sobre un cauce, con estribos a cada lado. Devuelve pares [inicio, fin].
function puentes(puntos, cauces, centros) {
  const sobre = puntos.map((p) => {
    const t = teselaDe(centros, p.x, p.z);
    return t >= 0 && cauces.borde[t] < 15 && distanciaACauce(cauces.rios, p.x, p.z) < PUENTE;
  });
  const lista = [];
  for (let k = 0; k < sobre.length; k++) {
    if (!sobre[k]) continue;
    let fin = k;
    while (fin + 1 < sobre.length && sobre[fin + 1]) fin++;
    const tramo = [Math.max(0, k - ESTRIBO), Math.min(puntos.length - 1, fin + ESTRIBO)];
    const previo = lista[lista.length - 1];
    if (previo && tramo[0] <= previo[1]) previo[1] = tramo[1];
    else lista.push(tramo);
    k = fin;
  }
  return lista;
}

let memoria = null;

// Red trazada (una sola vez por carga): { trazos, mascara }.
export function obtenerVias(altura) {
  if (!memoria) memoria = trazarVias(altura);
  return memoria;
}
