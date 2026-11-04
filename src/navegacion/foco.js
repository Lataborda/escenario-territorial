// Punto de interés y escala: botonera de escalas y clic sobre fincas y mercados.
// Cambian escala y cámara sin cambiar de parada.
import contenido from '../../contenido/escalas.json';
import { obtener, cambiar } from '../estado.js';
import { ENTIDADES } from '../terreno/plano.js';

export const ESCALAS = contenido.escalas;
const REGLAS = contenido.seleccion?.reglas ?? [];
const DURACION = contenido.seleccion?.duracion ?? 2;

const entidad = (id) => ENTIDADES.find((e) => e.id === id);
const escala = (id) => ESCALAS.find((s) => s.id === id);

// Si el punto de interés es la vista general, la escala usa su ancla por defecto.
function anclaPara(s, foco) {
  const e = entidad(foco);
  if (!e || e.tipo === 'vista') return s.vista.ancla ?? 'general';
  return foco;
}

// Botonera: vista tipo de la escala desde el punto de interés actual; conserva el azimut.
export function irAEscala(id) {
  const s = escala(id);
  if (!s) return false;
  const foco = anclaPara(s, obtener().foco);
  cambiar({
    escala: s.id,
    foco,
    camara: { ancla: foco, distancia: s.vista.distancia, elevacion: s.vista.elevacion, duracion: DURACION },
  });
  return true;
}

// Entidades que responden al clic en el escenario actual.
export function seleccionables(escenario) {
  return ENTIDADES.filter(
    (e) => REGLAS.some((r) => r.tipo === e.tipo) && (!e.escenarios || e.escenarios.includes(escenario)),
  );
}

// Clic en una finca o un mercado: acerca la cámara y lo fija como punto de interés.
export function enfocar(id) {
  const e = entidad(id);
  const s = escala(REGLAS.find((r) => r.tipo === e?.tipo)?.escala);
  if (!s) return false;
  cambiar({
    escala: s.id,
    foco: id,
    camara: { ancla: id, distancia: s.vista.distancia, elevacion: s.vista.elevacion, duracion: DURACION },
  });
  return true;
}
