// Cronómetro total y por momento frente a la meta de cada momento (paradas.json).
// El registro se guarda en localStorage: una recarga del presentador no pierde el tiempo.
// El intervalo solo repinta el cronómetro; nunca cambia parada, escala ni cámara.

const CLAVE = 'escenario-territorial:cronometro';
const MINUTO = 60000;

const vacio = () => ({ enMarcha: false, iniciado: false, desde: null, momento: null, acumulado: {} });

function almacenLocal() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

// «−2:00», «+1:05», «18:32». Con signo: desvío; sin signo: tiempo transcurrido.
export function formatearTiempo(ms, { signo = false } = {}) {
  const s = Math.round(Math.abs(ms) / 1000);
  const texto = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  if (!signo) return texto;
  return s === 0 ? '0:00' : `${ms < 0 ? '−' : '+'}${texto}`;
}

/** Modelo del cronómetro. ahora: reloj en ms; almacen: interfaz de localStorage o null. */
export function crearCronometro({ momentos, tolerancia = 1, ahora = () => Date.now(), almacen = almacenLocal() }) {
  let r = vacio();
  try {
    r = { ...vacio(), ...JSON.parse(almacen?.getItem(CLAVE) ?? 'null') };
  } catch {
    r = vacio();
  }
  const guardar = () => {
    try {
      almacen?.setItem(CLAVE, JSON.stringify(r));
    } catch {
      // Sin almacenamiento local el cronómetro sigue en memoria.
    }
  };
  // Suma al momento actual el tramo en marcha y abre un tramo nuevo.
  const cerrarTramo = (t) => {
    if (r.enMarcha && r.momento) r.acumulado[r.momento] = (r.acumulado[r.momento] ?? 0) + (t - r.desde);
    r.desde = t;
  };

  function leer() {
    const t = ahora();
    const real = (id) => (r.acumulado[id] ?? 0) + (r.enMarcha && r.momento === id ? t - r.desde : 0);
    const filas = momentos.map((m) => {
      const ms = real(m.id);
      const meta = m.meta * MINUTO;
      return { id: m.id, nombre: m.nombre, meta, real: ms, desvio: ms - meta, visitado: ms > 0 || m.id === r.momento };
    });
    // Desvío acumulado: momentos visitados, y el actual solo cuando ya excede su meta.
    const acumulado = filas.reduce((suma, f) => {
      if (!f.visitado) return suma;
      return suma + (f.id === r.momento ? Math.max(0, f.desvio) : f.desvio);
    }, 0);
    return {
      enMarcha: r.enMarcha,
      iniciado: r.iniciado,
      momento: r.momento,
      total: filas.reduce((suma, f) => suma + f.real, 0),
      filas,
      acumulado,
      retraso: acumulado > tolerancia * MINUTO,
    };
  }

  return {
    leer,
    iniciar() {
      if (r.enMarcha) return;
      Object.assign(r, { enMarcha: true, iniciado: true, desde: ahora() });
      guardar();
    },
    pausar() {
      if (!r.enMarcha) return;
      cerrarTramo(ahora());
      r.enMarcha = false;
      guardar();
    },
    reiniciar() {
      if (r.enMarcha) return;
      r = { ...vacio(), momento: r.momento };
      guardar();
    },
    cambiarMomento(id) {
      if (!id || id === r.momento) return;
      cerrarTramo(ahora());
      r.momento = id;
      guardar();
    },
  };
}

const elemento = (etiqueta, clase, texto) => {
  const e = document.createElement(etiqueta);
  if (clase) e.className = clase;
  if (texto != null) e.textContent = texto;
  return e;
};

/** Vista: total, botones, tabla de momentos con meta, real y desvío. alPintar recibe la lectura. */
export function crearVistaCronometro(contenedor, cronometro, { duracionTotal, ensayoObjetivo, tolerancia, alPintar }) {
  const total = elemento('div', 'crono-total');
  const estado = elemento('div', 'crono-estado');
  const marcha = elemento('button', 'boton crono-marcha');
  marcha.id = 'crono-marcha';
  const reinicio = elemento('button', 'boton crono-reinicio', 'Reiniciar');
  reinicio.id = 'crono-reinicio';
  const botones = elemento('div', 'crono-botones');
  botones.append(marcha, reinicio);
  const metas = elemento('div', 'crono-metas', `Guion ${duracionTotal} min · ensayo ${ensayoObjetivo} min · tolerancia ${tolerancia} min`);

  const tabla = elemento('table', 'crono-tabla');
  const cabeza = tabla.createTHead().insertRow();
  ['Momento', 'Meta', 'Real', 'Desvío'].forEach((t) => cabeza.append(elemento('th', null, t)));
  const cuerpo = tabla.createTBody();
  const pie = tabla.createTFoot().insertRow();
  pie.append(elemento('th', null, 'Desvío acumulado'));
  const celdaAcumulado = pie.insertCell();
  celdaAcumulado.colSpan = 3;
  celdaAcumulado.className = 'crono-acumulado';
  contenedor.append(total, estado, botones, metas, tabla);

  const filas = new Map();
  function pintar() {
    const l = cronometro.leer();
    total.textContent = formatearTiempo(l.total);
    estado.textContent = l.enMarcha ? 'En marcha' : l.iniciado ? 'En pausa' : 'Sin iniciar';
    contenedor.dataset.marcha = l.enMarcha ? 'si' : 'no';
    marcha.textContent = l.enMarcha ? 'Pausar' : l.iniciado ? 'Continuar' : 'Iniciar';
    reinicio.disabled = l.enMarcha || !l.iniciado;
    for (const f of l.filas) {
      if (!filas.has(f.id)) {
        const fila = cuerpo.insertRow();
        fila.dataset.momento = f.id;
        fila.append(elemento('th', null, f.id));
        fila.title = f.nombre;
        for (let i = 0; i < 3; i++) fila.insertCell();
        filas.set(f.id, fila);
      }
      const fila = filas.get(f.id);
      const [, meta, real, desvio] = fila.children;
      meta.textContent = formatearTiempo(f.meta);
      real.textContent = f.visitado ? formatearTiempo(f.real) : '';
      desvio.textContent = f.visitado ? formatearTiempo(f.desvio, { signo: true }) : '';
      fila.classList.toggle('actual', f.id === l.momento);
      const exceso = f.visitado ? f.desvio : -1;
      fila.dataset.desvio = exceso > tolerancia * MINUTO ? 'excedido' : exceso > 0 ? 'atrasado' : 'en-tiempo';
    }
    celdaAcumulado.textContent = formatearTiempo(l.acumulado, { signo: true });
    celdaAcumulado.dataset.desvio = l.retraso ? 'excedido' : l.acumulado > 0 ? 'atrasado' : 'en-tiempo';
    alPintar?.(l);
  }

  marcha.addEventListener('click', () => {
    if (cronometro.leer().enMarcha) cronometro.pausar();
    else cronometro.iniciar();
    pintar();
  });
  reinicio.addEventListener('click', () => {
    cronometro.reiniciar();
    pintar();
  });
  setInterval(pintar, 1000);
  pintar();
  return { pintar };
}
