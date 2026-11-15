// Figuras territoriales (capa «figuras_territoriales», P13): resguardo indígena, consejo comunitario y reserva
// natural. Contorno, relleno translúcido y rótulo, sin rasgos figurativos (GUION, precaución 7). Las figuras
// genéricas (decisión D3) tienen una extensión propuesta alrededor de su ancla; la que declara una finca toma el
// lindero de esa finca. No cambian con el escenario. Figuras y rótulos en contenido/actores.json (red.figuras).
import * as THREE from 'three';
import contenido from '../../contenido/actores.json';
import { BORDE } from '../terreno/plano.js';
import { obtenerFincas } from '../fincas/trazado.js';
import { LADO } from '../coberturas/rejilla.js';
import { crearTrazo } from '../escena/lineas.js';
import { crearAzar, semillaTexto } from '../util/azar.js';
import { ESTILO } from './estilo.js';
import { crearRelleno, abanico, baldosas } from './relleno.js';

const LADOS = 72; // puntos del contorno de una figura genérica
const ALTO = 1.8; // sobre la superficie
const ALTO_ROTULO = 24;
const HOLGURA = 3; // el contorno no llega al borde del bloque
const datos = contenido.red.figuras;

// Contorno irregular y fijo (misma semilla, misma forma) de radio medio «radio» alrededor de (x, z).
function contornoDe(id, x, z, radio) {
  const azar = crearAzar(semillaTexto(`figura-${id}`));
  const f1 = azar() * Math.PI * 2;
  const f2 = azar() * Math.PI * 2;
  const limitar = (v, tope) => Math.min(tope - HOLGURA, Math.max(HOLGURA - tope, v));
  return Array.from({ length: LADOS }, (_, k) => {
    const a = (k / LADOS) * Math.PI * 2;
    const r = radio * (1 + 0.16 * Math.sin(3 * a + f1) + 0.09 * Math.sin(5 * a + f2));
    return [limitar(x + Math.cos(a) * r, BORDE.x), limitar(z + Math.sin(a) * r, BORDE.z)];
  });
}

/** superficie y altura: consultas del terreno; ancla(id): posición de una entidad de territorio.json. */
export function crearFiguras({ superficie, altura, ancla }) {
  const { fincas, centros } = obtenerFincas(altura);
  const grupo = new THREE.Group();
  grupo.name = 'actores-figuras';
  const figuras = datos.figuras
    .map((f) => {
      const estilo = ESTILO[f.estilo];
      const relleno = crearRelleno(`figura-${f.id}-relleno`, estilo);
      const trazo = crearTrazo(`figura-${f.id}`, altura, { ...estilo.linea, alto: ALTO });
      let centro;
      if (f.finca) {
        // Figura sobre una finca: su lindero y sus teselas.
        const finca = fincas.find((x) => x.id === f.finca);
        if (!finca) return null;
        relleno.geometry = baldosas(finca.teselas, centros, LADO, superficie, ALTO);
        trazo.fijar(finca.perimetro);
        centro = finca.ancla;
      } else {
        const p = ancla(f.ancla);
        const puntos = contornoDe(f.id, p.x, p.z, f.radio);
        relleno.geometry = abanico(puntos, [p.x, p.z], superficie, { alto: ALTO, anillos: 8 });
        trazo.fijarPuntos(puntos.flatMap(([x, z], k) => {
          const [x2, z2] = puntos[(k + 1) % puntos.length];
          return [x, superficie(x, z) + ALTO, z, x2, superficie(x2, z2) + ALTO, z2];
        }));
        centro = { x: p.x, z: p.z };
      }
      grupo.add(relleno, trazo.grupo);
      return { ...f, centro, triangulos: (relleno.geometry.index?.count ?? 0) / 3, segmentos: trazo.cantidad() };
    })
    .filter(Boolean);

  return {
    capa: datos.capa,
    grupo,
    nubes: [],
    rotulos: datos.rotulos
      .map((r) => {
        const f = figuras.find((x) => x.id === r.en);
        return f ? { ...r, punto: [f.centro.x, superficie(f.centro.x, f.centro.z) + (r.lado === 'abajo' ? 0 : ALTO_ROTULO), f.centro.z] } : null;
      })
      .filter(Boolean),
    aplicar() {},
    datos: () => ({
      figuras: figuras.map((f) => f.id),
      sobreFinca: figuras.filter((f) => f.finca).map((f) => f.finca),
      triangulos: figuras.reduce((s, f) => s + f.triangulos, 0),
      segmentos: figuras.reduce((s, f) => s + f.segmentos, 0),
    }),
  };
}
