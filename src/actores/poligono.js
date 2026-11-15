// Polígono del territorio de la red (capa «poligono_red», P20): envolvente convexa de los nodos enlazados por las
// relaciones de la red (mercados y familias con enlaces de comercio) en el escenario actual, con un margen. Contorno grueso y relleno translúcido sobre el relieve. El
// territorio lo trazan sus actores: sin coordenadas fijas. Existe en los escenarios de contenido/actores.json
// (red.poligono); en S0 la capa no dibuja nada.
import * as THREE from 'three';
import contenido from '../../contenido/actores.json';
import { BORDE } from '../terreno/plano.js';
import { crearTrazo } from '../escena/lineas.js';
import { ESTILO } from './estilo.js';
import { crearRelleno, abanico } from './relleno.js';

const PASO = 10; // separación de los puntos del contorno
const ANILLOS = 14; // coronas del relleno, para que siga el relieve
const ALTO = 2; // sobre la superficie
const ESQUINA = 12; // puntos del margen alrededor de cada nodo
const HOLGURA = 3; // el contorno no llega al borde del bloque
const ALTO_ROTULO = 22;

const datos = contenido.red.poligono;
const estilo = ESTILO.poligono;

// Envolvente convexa de puntos [x, z] (cadena monótona).
function envolvente(puntos) {
  const p = [...puntos].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const giro = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const mitad = (lista) => {
    const h = [];
    for (const q of lista) {
      while (h.length >= 2 && giro(h[h.length - 2], h[h.length - 1], q) <= 0) h.pop();
      h.push(q);
    }
    h.pop();
    return h;
  };
  return [...mitad(p), ...mitad(p.reverse())];
}

// Contorno con margen, dentro del bloque y con puntos cada PASO.
function contorno(nodos, margen) {
  const limitar = (v, tope) => Math.min(tope - HOLGURA, Math.max(HOLGURA - tope, v));
  const alrededor = nodos.flatMap((n) =>
    Array.from({ length: ESQUINA }, (_, k) => {
      const a = (k / ESQUINA) * Math.PI * 2;
      return [limitar(n.x + Math.cos(a) * margen, BORDE.x), limitar(n.z + Math.sin(a) * margen, BORDE.z)];
    }),
  );
  const h = envolvente(alrededor);
  const puntos = [];
  h.forEach(([x, z], k) => {
    const [x2, z2] = h[(k + 1) % h.length];
    const n = Math.max(1, Math.round(Math.hypot(x2 - x, z2 - z) / PASO));
    for (let j = 0; j < n; j++) puntos.push([x + ((x2 - x) * j) / n, z + ((z2 - z) * j) / n]);
  });
  return puntos;
}

/** nodos: crearNodos(); superficie y altura: consultas del terreno. */
export function crearPoligono({ nodos, superficie, altura }) {
  const relleno = crearRelleno('poligono-red-relleno', estilo);
  const trazo = crearTrazo('poligono-red', altura, estilo.linea);
  const grupo = new THREE.Group();
  grupo.name = 'actores-poligono';
  grupo.add(relleno, trazo.grupo);

  const vigente = (escenario) => !datos.escenarios || datos.escenarios.includes(escenario);
  // Nodos de la red: los que aparecen en los pares de las relaciones indicadas.
  const deLaRed = [...new Set(contenido.red.relaciones.filter((r) => datos.relaciones.includes(r.id)).flatMap((r) => r.pares ?? []).flat())].map((id) => nodos.de(id));
  const trazar = (escenario) => {
    const lista = vigente(escenario) ? deLaRed.filter((n) => nodos.en(n, escenario)) : [];
    return { lista, puntos: lista.length >= 3 ? contorno(lista, datos.margen) : [] };
  };
  let actual = { lista: [], puntos: [] };
  function aplicar(escenario) {
    actual = trazar(escenario);
    const { puntos } = actual;
    relleno.geometry.dispose();
    const centro = puntos.length ? [0, 1].map((k) => puntos.reduce((s, p) => s + p[k], 0) / puntos.length) : null;
    relleno.geometry = centro ? abanico(puntos, centro, superficie, { alto: ALTO, anillos: ANILLOS }) : new THREE.BufferGeometry();
    relleno.visible = Boolean(centro);
    const lados = [];
    puntos.forEach(([x, z], k) => {
      const [x2, z2] = puntos[(k + 1) % puntos.length];
      lados.push(x, superficie(x, z) + ALTO, z, x2, superficie(x2, z2) + ALTO, z2);
    });
    trazo.fijarPuntos(lados);
  }

  // Cruces del contorno con el límite departamental: [x, z] de occidente a oriente.
  const cruces = (puntos) =>
    puntos
      .filter(([, z], k) => (z - nodos.zLimite) * (puntos[(k + 1) % puntos.length][1] - nodos.zLimite) < 0)
      .sort((a, b) => a[0] - b[0]);
  // Lugar de un rótulo: un nodo de la red («en» con su id) o, con «en: cruce», el cruce del polígono del primer
  // escenario en que existe con el límite departamental, en el «extremo» indicado.
  const base = trazar(datos.escenarios?.[0] ?? 'S2').puntos;
  const lugar = (r) => {
    const n = nodos.de(r.en);
    if (n) return [n.x, n.y + (r.lado === 'abajo' ? 0 : ALTO_ROTULO), n.z];
    const c = cruces(base);
    if (!c.length) return null;
    const [x, z] = r.extremo === 'occidente' ? c[0] : c[c.length - 1];
    return [x, superficie(x, z) + ALTO, z];
  };

  return {
    capa: datos.capa,
    grupo,
    nubes: [],
    rotulos: datos.rotulos.map((r) => ({ ...r, punto: lugar(r) })).filter((r) => r.punto),
    aplicar,
    datos: () => {
      const { lista, puntos } = actual;
      const sur = (z) => z > nodos.zLimite;
      return {
        nodos: lista.length,
        vertices: puntos.length,
        nodosNorte: lista.filter((n) => !sur(n.z)).length,
        nodosSur: lista.filter((n) => sur(n.z)).length,
        verticesNorte: puntos.filter(([, z]) => !sur(z)).length,
        verticesSur: puntos.filter(([, z]) => sur(z)).length,
        cruces: cruces(puntos).length,
        triangulos: (relleno.geometry.index?.count ?? 0) / 3,
        segmentos: trazo.cantidad(),
      };
    },
  };
}
