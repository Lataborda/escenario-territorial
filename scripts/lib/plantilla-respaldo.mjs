// Página del respaldo: una captura por parada y paso, navegable con las teclas de la vista principal.
// Abre sin servidor (file://) y sin red: estilos y código en línea, imágenes en capturas/.

const escapar = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Código de la página (se inserta tal cual en <script>).
function codigo() {
  const D = window.RESPALDO.diapositivas;
  const img = document.getElementById('diapositiva');
  const ayuda = document.getElementById('ayuda');
  let i = 0;

  function desdeHash() {
    const p = new URLSearchParams(location.hash.replace(/^#/, ''));
    const id = p.get('p');
    const k = parseInt(p.get('paso'), 10) || 0;
    const j = D.findIndex((d) => d.parada === id && d.paso === k);
    return j >= 0 ? j : Math.max(0, D.findIndex((d) => d.parada === id));
  }

  function mostrar(j) {
    i = Math.min(Math.max(j, 0), D.length - 1);
    const d = D[i];
    img.src = d.src;
    img.alt = `${d.parada} · ${d.titulo}`;
    document.title = `${d.parada} · Respaldo del escenario territorial`;
    try {
      history.replaceState(null, '', `#p=${d.parada}${d.paso ? `&paso=${d.paso}` : ''}`);
    } catch {
      // En algunos navegadores file:// no admite replaceState; la navegación sigue.
    }
    if (D[i + 1]) new Image().src = D[i + 1].src;
  }

  const momento = (n) => {
    const j = D.findIndex((d) => d.momento === `M${n}`);
    if (j >= 0) mostrar(j);
  };
  const acciones = {
    ArrowRight: () => mostrar(i + 1),
    ' ': () => mostrar(i + 1),
    PageDown: () => mostrar(i + 1),
    ArrowLeft: () => mostrar(i - 1),
    PageUp: () => mostrar(i - 1),
    Home: () => mostrar(0),
    End: () => mostrar(D.length - 1),
    f: () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.())?.catch?.(() => {}),
  };
  for (let n = 0; n <= 6; n++) acciones[String(n)] = () => momento(n);

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const accion = acciones[e.key.length === 1 ? e.key.toLowerCase() : e.key];
    if (!accion) return;
    e.preventDefault();
    ayuda.hidden = true;
    accion();
  });
  window.addEventListener('hashchange', () => {
    const j = desdeHash();
    if (j !== i) mostrar(j);
  });
  window.respaldo = {
    info: () => ({ total: D.length, actual: i, parada: D[i].parada, paso: D[i].paso, huella: window.RESPALDO.huella }),
    fuentes: () => D.map((d) => d.src),
  };
  mostrar(desdeHash());
  document.documentElement.dataset.listo = '1';
}

/** diapositivas: [{ src, parada, paso, momento, titulo }]; huella y fecha del contenido usado. */
export function paginaRespaldo({ diapositivas, huella, fecha, fondo = '#e8e4dc' }) {
  const datos = JSON.stringify({ diapositivas, huella, fecha }).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="generator" content="npm run respaldo · ${escapar(fecha)} · contenido ${escapar(huella)}" />
    <title>Respaldo del escenario territorial</title>
    <link rel="icon" href="data:," />
    <style>
      html, body { margin: 0; height: 100%; overflow: hidden; background: ${fondo}; }
      #diapositiva { position: fixed; inset: 0; width: 100%; height: 100%; object-fit: contain; display: block; }
      #ayuda { position: fixed; left: 50%; bottom: 1.5rem; transform: translateX(-50%); padding: 0.5rem 1rem;
        border-radius: 0.4rem; background: rgba(43, 42, 39, 0.85); color: #fff; font: 16px/1.4 system-ui, sans-serif; }
      #ayuda[hidden] { display: none; }
    </style>
  </head>
  <body>
    <img id="diapositiva" alt="" />
    <div id="ayuda">Respaldo en imágenes · flechas, espacio, Av Pág y Re Pág · 0 a 6 momentos · F pantalla completa</div>
    <script>window.RESPALDO = ${datos};</script>
    <script>(${codigo.toString()})();</script>
  </body>
</html>
`;
}
