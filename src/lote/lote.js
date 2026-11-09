// Lote de policultivo de ladera junto a un lote de caña en monocultivo (etapa 7, parada P03). Lámina de suelo de
// cada lote sobre el relieve, plantas instanciadas con dos niveles de detalle según la distancia de la cámara al lote
// y resaltado de los niveles de organización (contenido/lote.json, niveles): las plantas fuera del nivel se apagan
// (formas.js) y la superposición dibuja el anillo del organismo y el contorno de los lotes. Reacciona a «capas».
import * as THREE from 'three';
import contenido from '../../contenido/lote.json';
import { obtener, suscribir } from '../estado.js';
import { obtenerDisposicion } from './disposicion.js';
import { ESPECIES } from '../coberturas/especies.js';
import { matasCana } from '../coberturas/mata.js';
import { crearMaterialMata } from '../coberturas/cana.js';
import { TIPOS } from '../coberturas/tipos.js';
import { conViento } from '../escena/viento.js';
import { crearTrazo } from '../escena/lineas.js';
import { crearRuidos, crearAzar } from '../util/azar.js';
import { frijol, conApagado, atributoApagado } from './formas.js';

export const SUELO = 0.3; // lámina del lote sobre el terreno
export const CERCA = 280; // distancia de la cámara al lote bajo la cual se dibuja el nivel cercano
const LEJOS = 900; // más lejos no se dibujan las plantas (en el modo liviano, más lejos que CERCA)
const PASO = 1.5; // resolución de la lámina
const RAPIDEZ = 4; // apagado: fracción del camino por segundo (transición de unos 0,6 s)
const SOMBRA = ['guamo', 'platano'];
// Alto aproximado de cada forma en escala 1 (rótulos sobre la planta).
export const ALTO = { cafeto: 1.7, platano: 3.4, guamo: 5.6, maiz: 2.3, frijol: 1.9, cana: 2.8 };
const ESTILO = {
  anillo: { color: 0xf2c14e, halo: 0x2b2a27, ancho: 3, alto: 0.25, encima: true, orden: 20 },
  contorno: { color: 0xfbf9f4, halo: 0x2b2a27, ancho: 2.5, alto: 0.4, encima: true, orden: 20 },
};
const COLOR = { suelo: 0x5a4130, mantillo: 0x7d6744, surco: 0x6c573f, camellon: 0x93805a, paja: 0xb4a06a, borde: 0x4a3626 };

// Formas y material de una especie: { cerca, lejos, material, sombra }.
function formasDe(especie) {
  if (especie === 'cana') {
    const f = matasCana();
    return { cerca: f.cerca, lejos: f.lejos, material: conApagado(crearMaterialMata(f.material)) };
  }
  if (especie === 'frijol') {
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, side: THREE.DoubleSide });
    return { cerca: frijol(true), lejos: frijol(false), material: conApagado(conViento(material, { alto: ALTO.frijol })) };
  }
  const m = ESPECIES[especie].mallas()[0];
  const material = conViento(new THREE.MeshStandardMaterial(m.material), { alto: ALTO[especie] });
  return { cerca: m.cerca, lejos: m.lejos, material: conApagado(material) };
}

// Lámina de un lote: rejilla sobre el relieve con un anillo exterior que baja bajo el terreno (sin huecos).
function lamina(r, altura, colorDe) {
  const nx = Math.round((r.x1 - r.x0) / PASO);
  const nz = Math.round((r.z1 - r.z0) / PASO);
  const pos = [];
  const col = [];
  const c = new THREE.Color();
  for (let j = -1; j <= nz + 1; j++) {
    for (let i = -1; i <= nx + 1; i++) {
      const borde = i < 0 || j < 0 || i > nx || j > nz;
      const x = r.x0 + Math.min(Math.max(i, 0), nx) * PASO;
      const z = r.z0 + Math.min(Math.max(j, 0), nz) * PASO;
      pos.push(x, altura(x, z) + (borde ? -0.5 : SUELO), z);
      if (borde) c.setHex(COLOR.borde);
      else colorDe(x, z, c);
      col.push(c.r, c.g, c.b);
    }
  }
  const ancho = nx + 3;
  const ind = [];
  for (let j = 0; j < nz + 2; j++) {
    for (let i = 0; i < nx + 2; i++) {
      const a = j * ancho + i;
      ind.push(a, a + ancho, a + 1, a + 1, a + ancho, a + ancho + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(ind);
  g.computeVertexNormals();
  return g;
}

function crearSuelo(d, altura) {
  const { grano, manchas } = crearRuidos(7121, ['grano', 'manchas']);
  const cs = new THREE.Color(COLOR.suelo);
  const cm = new THREE.Color(COLOR.mantillo);
  const surco = new THREE.Color(COLOR.surco);
  const camellon = new THREE.Color(COLOR.camellon);
  const paja = new THREE.Color(COLOR.paja);
  const [, b] = contenido.lotes.monocultivo.especies[0].separacion;
  const poli = lamina(d.policultivo, altura, (x, z, c) => {
    c.copy(cs).lerp(cm, Math.max(0, manchas(x / 5, z / 5)) * 0.8).multiplyScalar(0.93 + 0.1 * grano(x * 1.3, z * 1.3));
  });
  const mono = lamina(d.monocultivo, altura, (x, z, c) => {
    const fase = (((x - d.monocultivo.x0) / b) % 1 + 1) % 1;
    c.copy(surco).lerp(camellon, 0.5 + 0.5 * Math.cos((fase - 0.5) * Math.PI * 2));
    c.lerp(paja, Math.max(0, grano(x / 3, z / 3)) * 0.45).multiplyScalar(0.95 + 0.08 * grano(x * 2, z * 2));
  });
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 });
  const grupo = new THREE.Group();
  for (const [nombre, g] of [['lote-suelo-policultivo', poli], ['lote-suelo-monocultivo', mono]]) {
    const malla = new THREE.Mesh(g, material);
    malla.name = nombre;
    malla.receiveShadow = true;
    grupo.add(malla);
  }
  return grupo;
}

// Contorno de un rectángulo y círculo en segmentos [x1, z1, x2, z2].
const rectangulo = (r) => [[r.x0, r.z0, r.x1, r.z0], [r.x1, r.z0, r.x1, r.z1], [r.x1, r.z1, r.x0, r.z1], [r.x0, r.z1, r.x0, r.z0]];
function circulo(x, z, radio, n = 20) {
  const s = [];
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2;
    const b = ((k + 1) / n) * Math.PI * 2;
    s.push([x + radio * Math.cos(a), z + radio * Math.sin(a), x + radio * Math.cos(b), z + radio * Math.sin(b)]);
  }
  return s;
}

/** altura(x, z): terreno; camara: la de la escena; instantanea: sin transición del apagado (#captura=1). */
export function crearLote({ altura, camara, instantanea = false }) {
  const d = obtenerDisposicion();
  const grupo = new THREE.Group();
  grupo.name = 'lote';
  grupo.add(crearSuelo(d, altura));
  const centro = new THREE.Vector3((d.todo.x0 + d.todo.x1) / 2, altura(d.centro.x, d.centro.z), (d.todo.z0 + d.todo.z1) / 2);

  // Mallas instanciadas por especie y nivel de detalle, con el apagado por instancia.
  const azar = crearAzar(7177);
  const matriz = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const eje = new THREE.Vector3(0, 1, 0);
  const tinte = new THREE.Color();
  const canaColor = new THREE.Color(TIPOS.cana.edades[TIPOS.cana.edades.length - 1]);
  const especies = [...new Set(d.plantas.map((p) => p.especie))];
  const porEspecie = especies.map((especie) => {
    const plantas = d.plantas.filter((p) => p.especie === especie);
    const f = formasDe(especie);
    const niveles = [f.lejos, f.cerca].map((g, k) => {
      const malla = new THREE.InstancedMesh(g, f.material, plantas.length);
      malla.name = `lote-${especie}-${k ? 'cerca' : 'lejos'}`;
      malla.castShadow = SOMBRA.includes(especie);
      malla.receiveShadow = true;
      plantas.forEach((p, i) => {
        const s = p.escala;
        matriz.compose(new THREE.Vector3(p.x, altura(p.x, p.z) + SUELO, p.z), q.setFromAxisAngle(eje, p.giro), new THREE.Vector3(s, s, s));
        malla.setMatrixAt(i, matriz);
        const v = 0.92 + 0.14 * azar();
        malla.setColorAt(i, especie === 'cana' ? tinte.copy(canaColor).multiplyScalar(v) : tinte.setRGB(v, v, v));
      });
      // Esfera de todas las instancias: fuera de la vista no se dibujan.
      malla.computeBoundingSphere();
      return { malla, apagado: atributoApagado(g, plantas.length) };
    });
    grupo.add(...niveles.map((n) => n.malla));
    return { especie, plantas, niveles, actual: new Float32Array(plantas.length), meta: new Float32Array(plantas.length) };
  });

  // Superposición: anillo del organismo y contornos de los lotes.
  const superposicion = new THREE.Group();
  superposicion.name = 'lote-capas';
  const organismo = d.plantas.find((p) => p.organismo);
  const anillo = crearTrazo('lote-organismo', altura, ESTILO.anillo);
  anillo.fijar(circulo(organismo.x, organismo.z, 1.25));
  const contorno = crearTrazo('lote-contorno', altura, ESTILO.contorno);
  contorno.fijar([...rectangulo(d.policultivo), ...rectangulo(d.monocultivo)]);
  superposicion.add(anillo.grupo, contorno.grupo);

  let nivel = null;
  let enMarcha = false;
  function aplicar(salto) {
    enMarcha = false;
    for (const e of porEspecie) {
      for (let i = 0; i < e.actual.length; i++) {
        const dif = e.meta[i] - e.actual[i];
        if (Math.abs(dif) < 1e-3) e.actual[i] = e.meta[i];
        else {
          e.actual[i] += salto >= 1 ? dif : dif * salto;
          enMarcha = true;
        }
      }
      for (const n of e.niveles) {
        n.apagado.array.set(e.actual);
        n.apagado.needsUpdate = true;
      }
    }
  }
  function pintar({ capas }) {
    nivel = contenido.niveles.find((n) => capas.includes(n.capa)) ?? null;
    for (const e of porEspecie) {
      e.plantas.forEach((p, i) => {
        const resaltada = !nivel || (nivel.resalta.especies.includes(p.especie) && (!nivel.resalta.uno || p.organismo));
        e.meta[i] = resaltada ? 0 : 1;
      });
    }
    aplicar(instantanea ? 1 : 0);
    enMarcha = true;
    anillo.grupo.visible = nivel?.id === 'organismo';
    contorno.grupo.visible = ['comunidad', 'ecosistema'].includes(nivel?.id);
  }
  suscribir('capas', pintar);
  pintar(obtener());

  // Por cuadro: nivel de detalle según la distancia de la cámara (en el modo liviano, solo el lejano y solo cerca
  // del lote) y transición del apagado.
  let distancia = Infinity;
  let liviano = false;
  suscribir('liviano', (e) => (liviano = e.liviano));
  function cuadro(dt) {
    distancia = camara.position.distanceTo(centro);
    const k = distancia < CERCA ? (liviano ? 0 : 1) : distancia < LEJOS && !liviano ? 0 : -1;
    for (const e of porEspecie) e.niveles.forEach((n, nivelDetalle) => (n.malla.visible = nivelDetalle === k));
    if (enMarcha) aplicar(Math.min(1, (dt || 1) * RAPIDEZ));
  }

  return {
    grupo,
    superposicion,
    cuadro,
    disposicion: d,
    // Verificación: plantas por especie, resaltadas y nivel de detalle dibujado.
    datos: () => ({
      plantas: Object.fromEntries(porEspecie.map((e) => [e.especie, e.plantas.length])),
      resaltadas: Object.fromEntries(porEspecie.map((e) => [e.especie, e.meta.reduce((s, v) => s + (v === 0 ? 1 : 0), 0)])),
      nivel: nivel?.id ?? null,
      detalle: distancia < CERCA ? (liviano ? 'lejos' : 'cerca') : distancia < LEJOS && !liviano ? 'lejos' : 'oculto',
      anillo: anillo.grupo.visible,
      contorno: contorno.grupo.visible,
      organismo: [organismo.x, altura(organismo.x, organismo.z) + SUELO, organismo.z],
      policultivo: d.policultivo,
      monocultivo: d.monocultivo,
    }),
  };
}
