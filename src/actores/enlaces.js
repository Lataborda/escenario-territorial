// Enlaces de la red por tipo de relación (etapas 9.a y 9.b): comercio (capa «red_mercados»), garantía (capa «spg»),
// conocimiento, semillas y gobernanza (capa «vinculos_actores»), proximidades y compras públicas (sus capas). Cada
// relación lleva un trazo grueso en arco y cuentas fijas de forma propia; con «nodos: true» en su estilo dibuja
// también los nodos que no son mercados (familias y aliados). Un enlace existe en los escenarios de su relación y si sus dos nodos existen en el escenario: en S0 la
// capa no dibuja nada. Relaciones y pares en contenido/actores.json (red.relaciones).
import * as THREE from 'three';
import contenido from '../../contenido/actores.json';
import { crearTrazo } from '../escena/lineas.js';
import { crearNube } from '../flujos/particulas.js';
import { arco, crearRuta, segmentosDe } from '../flujos/curvas.js';
import { ESTILO } from './estilo.js';
import { ALTO_NODO } from './mercados.js';

const ALTO_ROTULO = 22;

/** nodos: crearNodos(); superficie y altura: consultas del terreno. Devuelve una capa por relación con pares. */
export function crearEnlaces({ nodos, superficie, altura }) {
  return contenido.red.relaciones.filter((r) => r.pares?.length).map((relacion) => {
    const estilo = ESTILO[relacion.id];
    const pares = relacion.pares.map(([a, b]) => [nodos.de(a), nodos.de(b)]);
    const tipos = estilo.nodos ? [...new Set(pares.flat().map((n) => n.tipo))].filter((t) => t !== 'mercado') : [];
    const trazo = crearTrazo(`enlaces-${relacion.id}`, altura, estilo.linea);
    const cuentas = crearNube(relacion.id, estilo);
    const extremos = new Map(tipos.map((t) => [t, crearNube(`${relacion.id}-${t}`, ESTILO[t])]));
    const grupo = new THREE.Group();
    grupo.name = `actores-enlaces-${relacion.id}`;
    grupo.add(trazo.grupo, cuentas.puntos, ...[...extremos.values()].map((n) => n.puntos));

    let activos = [];
    function aplicar(escenario) {
      const vigente = !relacion.escenarios || relacion.escenarios.includes(escenario);
      activos = vigente ? pares.filter(([a, b]) => nodos.en(a, escenario) && nodos.en(b, escenario)) : [];
      const arcos = activos.map(([a, b]) => arco(a, b, superficie, { alto: ALTO_NODO, ...estilo.arco }));
      trazo.fijarPuntos(arcos.flatMap((r) => segmentosDe(r)));
      cuentas.fijar(arcos.map((ruta) => ({ ruta })), 1);
      cuentas.avanzar(0);
      const enlazados = [...new Set(activos.flat())];
      for (const [tipo, nube] of extremos) {
        nube.fijar(enlazados.filter((n) => n.tipo === tipo).map((n) => ({ ruta: crearRuta([[n.x, n.y + ALTO_NODO, n.z]]) })), 1);
        nube.avanzar(0);
      }
    }

    const lado = (n) => Math.sign(n.z - nodos.zLimite);
    // Grupos de nodos unidos por los enlaces activos (uno solo: la red es conexa).
    const componentes = () => {
      const grupoDe = new Map();
      const raiz = (n) => (grupoDe.get(n) === n ? n : raiz(grupoDe.get(n)));
      for (const n of activos.flat()) grupoDe.set(n, n);
      for (const [a, b] of activos) grupoDe.set(raiz(a), raiz(b));
      return new Set([...grupoDe.keys()].map(raiz)).size;
    };
    return {
      capa: relacion.capa,
      clave: `enlaces_${relacion.id}`,
      grupo,
      nubes: [cuentas, ...extremos.values()],
      rotulos: (relacion.rotulos ?? []).map((r) => {
        const n = nodos.de(r.en);
        return { ...r, punto: [n.x, n.y + (r.lado === 'abajo' ? 0 : ALTO_ROTULO), n.z] };
      }),
      aplicar,
      datos: () => ({
        relacion: relacion.id,
        enlaces: activos.length,
        nodos: new Set(activos.flat()).size,
        mercados: new Set(activos.flat().filter((n) => n.tipo === 'mercado')).size,
        componentes: componentes(),
        cruzanLimite: activos.filter(([a, b]) => lado(a) * lado(b) < 0).length,
        segmentos: trazo.cantidad(),
      }),
    };
  });
}
