// Parches de hábitat (etapa 8.b): grupos de teselas contiguas con las coberturas indicadas en un escenario, dentro
// de un alcance alrededor de un punto. Solo consulta la cobertura (coberturas.tipoEn) y la rejilla de teselas.
// Devuelve los parches más cercanos al punto, con su centro, su número de teselas y el radio del círculo de igual área.
import { rejillaTeselas, LADO } from '../coberturas/rejilla.js';

const VECINOS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/** tipoEn(x, z, escenario); centro { x, z }; alcance en unidades; coberturas: tipos de hábitat. */
export function hallarParches({ tipoEn, escenario, centro, alcance, coberturas, minimo = 1, maximo = 8 }) {
  const { centros } = rejillaTeselas();
  const tipos = new Set(coberturas);
  const limite = (v, tope) => Math.min(tope - 1, Math.max(0, v));
  const i0 = limite(Math.floor((centro.x - alcance - centros.x0) / LADO), centros.columnas);
  const i1 = limite(Math.ceil((centro.x + alcance - centros.x0) / LADO), centros.columnas);
  const j0 = limite(Math.floor((centro.z - alcance - centros.z0) / LADO), centros.filas);
  const j1 = limite(Math.ceil((centro.z + alcance - centros.z0) / LADO), centros.filas);
  const ancho = i1 - i0 + 1;
  const alto = j1 - j0 + 1;
  // 1: tesela de hábitat sin visitar; 0: el resto.
  const marca = new Uint8Array(ancho * alto);
  for (let j = 0; j < alto; j++) {
    for (let i = 0; i < ancho; i++) {
      if (tipos.has(tipoEn(centros.x(i0 + i), centros.z(j0 + j), escenario))) marca[j * ancho + i] = 1;
    }
  }
  const parches = [];
  for (let inicio = 0; inicio < marca.length; inicio++) {
    if (!marca[inicio]) continue;
    marca[inicio] = 0;
    const pila = [inicio];
    let n = 0;
    let sx = 0;
    let sz = 0;
    while (pila.length) {
      const t = pila.pop();
      const i = t % ancho;
      const j = (t - i) / ancho;
      n++;
      sx += centros.x(i0 + i);
      sz += centros.z(j0 + j);
      for (const [di, dj] of VECINOS) {
        const a = i + di;
        const b = j + dj;
        if (a < 0 || b < 0 || a >= ancho || b >= alto || !marca[b * ancho + a]) continue;
        marca[b * ancho + a] = 0;
        pila.push(b * ancho + a);
      }
    }
    if (n < minimo) continue;
    const x = sx / n;
    const z = sz / n;
    const distancia = Math.hypot(x - centro.x, z - centro.z);
    if (distancia <= alcance) parches.push({ x, z, teselas: n, radio: Math.sqrt((n * LADO * LADO) / Math.PI), distancia });
  }
  return parches.sort((a, b) => a.distancia - b.distancia).slice(0, maximo);
}
