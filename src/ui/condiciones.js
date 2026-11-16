// Panel de condiciones de la teoría de cambio (etapa 10.a; capa «teoria_cambio»: P19 y tecla T), a la izquierda, en
// el lugar de la botonera. Preajustes, un interruptor por condición, el escenario derivado con los efectos de las
// reglas cumplidas y, para cada condición activa sin efecto territorial, la condición que falta. Los textos, las
// reglas y los preajustes salen de contenido/condiciones.json; la derivación, de src/reglas/. El panel solo propone
// condiciones al almacén.
import './condiciones.css';
import datos from '../../contenido/condiciones.json';
import escenarios from '../../contenido/escenarios.json';
import { obtener, suscribir } from '../estado.js';
import { motor, panelAbierto, alternarCondicion, aplicarPreajuste } from '../reglas/reglas.js';

const AVISOS_MAXIMOS = 3;
const TEXTOS = datos.panel;
const ESCENARIOS = new Map(escenarios.escenarios.map((e) => [e.id, e]));

function elemento(etiqueta, clase, texto) {
  const e = document.createElement(etiqueta);
  if (clase) e.className = clase;
  if (texto != null) e.textContent = texto;
  return e;
}

// Botón sin foco tras el clic: la barra espaciadora sigue avanzando el recorrido.
function boton(clase, alPulsar) {
  const b = elemento('button', clase);
  b.type = 'button';
  b.addEventListener('click', () => {
    b.blur();
    alPulsar();
  });
  return b;
}

// «Falta C5», «Faltan C5 y C7», «Faltan C7 y (C4 o C6)».
function textoFaltantes({ todas, alguna }) {
  const grupo = alguna.join(` ${TEXTOS.alguna} `);
  const partes = [...todas, ...(alguna.length ? [todas.length && alguna.length > 1 ? `(${grupo})` : grupo] : [])];
  const verbo = partes.length === 1 && alguna.length < 2 ? TEXTOS.falta : TEXTOS.faltan;
  return `${verbo} ${partes.join(` ${TEXTOS.todas} `)}`;
}

export function crearCondiciones(panel) {
  panel.setAttribute('aria-label', TEXTOS.titulo);
  panel.hidden = true;
  const cabeza = elemento('div', 'leyenda-cabeza');
  cabeza.append(elemento('span', 'leyenda-titulo', TEXTOS.titulo), elemento('span', 'leyenda-nota', TEXTOS.nota));
  cabeza.title = datos.advertencia;
  panel.append(cabeza);

  const filaPreajustes = elemento('div', 'cond-preajustes');
  filaPreajustes.append(elemento('span', 'cond-preajustes-rotulo', TEXTOS.preajustes));
  const preajustes = motor.preajustes.map((id) => {
    const b = boton('cond-preajuste', () => aplicarPreajuste(id));
    b.dataset.preajuste = id;
    b.textContent = id;
    b.title = ESCENARIOS.get(id)?.nombre ?? id;
    filaPreajustes.append(b);
    return { id, b };
  });

  let ultima = null; // última condición activada desde el panel: su mensaje va completo
  const lista = elemento('ul', 'cond-lista');
  const filas = datos.condiciones.map((c) => {
    const b = boton('cond-interruptor', () => {
      if (!obtener().condiciones.includes(c.id)) ultima = c.id;
      alternarCondicion(c.id);
    });
    b.dataset.condicion = c.id;
    b.title = c.nombre;
    const marca = elemento('span', 'cond-marca', '▲');
    marca.title = TEXTOS.sin_efecto;
    marca.setAttribute('aria-label', TEXTOS.sin_efecto);
    b.append(elemento('span', 'cond-palanca'), elemento('span', 'cond-clave', c.id), elemento('span', 'cond-rotulo', c.rotulo ?? c.nombre), marca);
    const li = elemento('li');
    li.append(b);
    lista.append(li);
    return { id: c.id, b, marca };
  });

  const estado = elemento('div', 'cond-estado');
  const escenario = elemento('div', 'cond-escenario');
  const efectos = elemento('p', 'cond-efectos');
  estado.append(escenario, efectos);
  const avisos = elemento('div', 'cond-avisos');
  avisos.setAttribute('aria-live', 'polite');
  panel.append(filaPreajustes, lista, estado, avisos);

  function pintarAvisos(sinEfecto) {
    avisos.hidden = !sinEfecto.length;
    if (!sinEfecto.length) return avisos.replaceChildren();
    const principal = sinEfecto.find((c) => c.id === ultima) ?? sinEfecto[0];
    const visibles = sinEfecto.slice(0, AVISOS_MAXIMOS);
    const hijos = visibles.map((c) => {
      const linea = elemento('div', 'cond-aviso');
      linea.dataset.condicion = c.id;
      linea.append(elemento('span', 'cond-marca', '▲'), elemento('strong', null, c.id), ` · ${textoFaltantes(c.faltan)}`);
      return linea;
    });
    const resto = sinEfecto.slice(AVISOS_MAXIMOS);
    if (resto.length) hijos.push(elemento('div', 'cond-aviso-resto', `${TEXTOS.otras}: ${resto.map((c) => c.id).join(', ')}`));
    if (principal.mensaje) {
      const mensaje = elemento('p', 'cond-mensaje', `${principal.id} · ${principal.mensaje}`);
      mensaje.dataset.condicion = principal.id;
      hijos.push(mensaje);
    }
    avisos.replaceChildren(...hijos);
  }

  function pintar(e) {
    const abierto = panelAbierto(e);
    panel.hidden = !abierto;
    if (!abierto) return;
    const r = motor.evaluar(e.condiciones);
    const vigente = motor.preajusteVigente(e.condiciones);
    for (const p of preajustes) p.b.setAttribute('aria-pressed', String(p.id === vigente));
    const porId = new Map(r.estado.map((c) => [c.id, c]));
    for (const f of filas) {
      const c = porId.get(f.id);
      f.b.setAttribute('aria-pressed', String(c.activa));
      f.b.classList.toggle('sin-efecto', c.activa && !c.territorial);
      f.marca.hidden = !(c.activa && !c.territorial);
    }
    const s = ESCENARIOS.get(r.escenario);
    panel.dataset.escenario = r.escenario ?? '';
    // Clave y rótulo corto del escenario (S3 se rotula «Escenario de referencia»); el nombre completo, al pasar el puntero.
    escenario.textContent = s ? `${s.id} · ${s.rotulo ?? s.nombre}` : '';
    escenario.title = s?.nombre ?? '';
    efectos.textContent = r.efectosDeReglas.map((id) => datos.efectos[id]).join(' · ');
    efectos.hidden = !r.efectosDeReglas.length;
    pintarAvisos(r.estado.filter((c) => c.activa && !c.territorial));
  }
  suscribir(['condiciones', 'capas'], pintar);
  pintar(obtener());
}
