// Panel de ficha: título, pasos, texto de pantalla y fuente abreviada de la parada actual.
import { obtener, suscribir } from '../estado.js';
import { buscarParada } from '../navegacion/recorrido.js';
import { abreviarFuentes } from './fuentes.js';

function elemento(etiqueta, clase, texto) {
  const e = document.createElement(etiqueta);
  if (clase) e.className = clase;
  if (texto != null) e.textContent = texto;
  return e;
}

export function crearFicha(contenedor) {
  const cabecera = elemento('div', 'ficha-cabecera');
  const titulo = elemento('h2', 'ficha-titulo');
  const borrador = elemento('span', 'ficha-borrador', 'borrador');
  borrador.title = 'Texto en estado borrador: pendiente de revisión';
  cabecera.append(titulo, borrador);
  const pasos = elemento('ol', 'ficha-pasos');
  const texto = elemento('p', 'ficha-texto');
  const fuentes = elemento('p', 'ficha-fuentes');
  contenedor.append(cabecera, pasos, texto, fuentes);

  let actual = null;

  function pintarParada(p) {
    titulo.textContent = p.titulo;
    borrador.hidden = p.estado_texto !== 'borrador';
    texto.textContent = p.ficha;
    fuentes.replaceChildren();
    abreviarFuentes(p.fuentes).forEach((f, i) => {
      if (i) fuentes.append(document.createTextNode(' · '));
      const s = elemento('span', f.pendiente ? 'fuente pendiente' : 'fuente', f.texto);
      if (f.pendiente) s.title = 'Fuente o localizador por verificar';
      fuentes.append(s);
    });
    pasos.replaceChildren(...(p.pasos ?? []).map((x) => elemento('li', 'ficha-paso', x.rotulo)));
    pasos.hidden = !p.pasos?.length;
    contenedor.dataset.parada = p.id;
  }

  function pintar(e) {
    const p = buscarParada(e.parada);
    contenedor.hidden = !p;
    if (!p) return;
    if (p !== actual) pintarParada(p);
    actual = p;
    [...pasos.children].forEach((li, i) => li.classList.toggle('actual', i === e.paso));
  }

  suscribir(['parada', 'paso'], pintar);
  pintar(obtener());
}
