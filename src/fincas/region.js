// Región de una finca sobre la rejilla de teselas: rectángulo de la receta centrado en el ancla, con esquinas
// recortadas al azar (semilla fija). La región crece desde el ancla sin cruzar cauces; las vías la atraviesan sin
// formar parte de ella. Datos de dibujo, sin Three.js.

export const MARGEN_CAUCE = 3; // igual que unidades.js: más cerca del cauce no hay tesela
const RECORTE = { probabilidad: 0.7, fraccion: 0.32 }; // esquinas recortadas: probabilidad y fracción máxima del lado

export const VECINOS = [[1, 0], [-1, 0], [0, 1], [0, -1]]; // oriente, occidente, sur, norte

// Rectángulo de la receta con las esquinas recortadas: función (i, j) → dentro.
function crearMolde(i0, j0, [ancho, fondo], azar) {
  const ia = i0 - Math.floor(ancho / 2);
  const ja = j0 - Math.floor(fondo / 2);
  const recortes = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([ex, ez]) => {
    if (azar() > RECORTE.probabilidad) return null;
    return { ex, ez, w: 1 + Math.floor(azar() * ancho * RECORTE.fraccion), h: 1 + Math.floor(azar() * fondo * RECORTE.fraccion) };
  });
  return (i, j) => {
    const a = i - ia;
    const b = j - ja;
    if (a < 0 || b < 0 || a >= ancho || b >= fondo) return false;
    for (const r of recortes) {
      if (!r) continue;
      const enX = r.ex ? a >= ancho - r.w : a < r.w;
      const enZ = r.ez ? b >= fondo - r.h : b < r.h;
      if (enX && enZ) return false;
    }
    return true;
  };
}

// Teselas de la finca: { teselas, inicio }. libre(t): la tesela puede ser de la finca; paso(t): se puede cruzar.
export function crearRegion({ centros, cx, cz, tamano, azar, libre, paso }) {
  const { columnas, filas } = centros;
  const i0 = Math.floor((cx - centros.x0 + centros.paso / 2) / centros.paso);
  const j0 = Math.floor((cz - centros.z0 + centros.paso / 2) / centros.paso);
  const molde = crearMolde(i0, j0, tamano, azar);
  const valida = (i, j) => i >= 0 && j >= 0 && i < columnas && j < filas && molde(i, j);
  // Inicio: la tesela libre del molde más cercana al ancla.
  let inicio = -1;
  let mejor = Infinity;
  for (let j = j0 - tamano[1]; j <= j0 + tamano[1]; j++) {
    for (let i = i0 - tamano[0]; i <= i0 + tamano[0]; i++) {
      if (!valida(i, j) || !libre(j * columnas + i)) continue;
      const d = Math.hypot(centros.x(i) - cx, centros.z(j) - cz);
      if (d < mejor) [mejor, inicio] = [d, j * columnas + i];
    }
  }
  if (inicio < 0) return { teselas: [], inicio };
  const vistas = new Set([inicio]);
  const cola = [inicio];
  const teselas = [];
  while (cola.length) {
    const t = cola.shift();
    if (libre(t)) teselas.push(t);
    const i = t % columnas;
    const j = Math.floor(t / columnas);
    for (const [di, dj] of VECINOS) {
      const n = (j + dj) * columnas + i + di;
      if (!valida(i + di, j + dj) || vistas.has(n) || !(libre(n) || paso(n))) continue;
      vistas.add(n);
      cola.push(n);
    }
  }
  return { teselas: teselas.sort((a, b) => a - b), inicio };
}

// Solar de la casa: tesela de la región junto a una vía y lejos del cauce, la más próxima al centro de la finca;
// sin vía vecina, la tesela más próxima al centro. Devuelve el índice de la tesela.
export function elegirSolar({ centros, teselas, vias, borde }) {
  const { columnas } = centros;
  let sx = 0;
  let sz = 0;
  for (const t of teselas) {
    sx += centros.x(t % columnas);
    sz += centros.z(Math.floor(t / columnas));
  }
  const mx = sx / teselas.length;
  const mz = sz / teselas.length;
  const distancia = (t) => Math.hypot(centros.x(t % columnas) - mx, centros.z(Math.floor(t / columnas)) - mz);
  const junto = (t) => VECINOS.some(([di, dj]) => {
    const i = (t % columnas) + di;
    const j = Math.floor(t / columnas) + dj;
    return i >= 0 && i < columnas && j >= 0 && j < centros.filas && vias[j * columnas + i];
  });
  const lejos = teselas.filter((t) => borde[t] > 24);
  const opciones = [lejos.filter(junto), lejos, teselas].find((l) => l.length);
  return opciones.reduce((a, b) => (distancia(b) < distancia(a) ? b : a));
}
