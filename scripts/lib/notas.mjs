// respaldo/notas.md: notas del presentador por momento y parada, con inicio previsto, pasos,
// diapositiva del respaldo, ficha en pantalla y fuentes. Sirve cuando la vista del presentador no está.
import { abreviar } from '../../src/util/fuentes.js';

const minutos = (x) => `${String(x).replace('.', ',')} min`;
const reloj = (min) => {
  const s = Math.round(min * 60);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** contenido: paradas.json; fuentes: objeto de fuentes.json; diapositivas: lista del respaldo. */
export function notasPresentador({ contenido, fuentes, diapositivas, huella, fecha }) {
  const { paradas, momentos } = contenido;
  const numero = (id, paso = 0) => diapositivas.findIndex((d) => d.parada === id && d.paso === paso) + 1;
  const saltables = paradas.filter((p) => p.saltable).map((p) => p.id);
  const l = [
    '# Notas del presentador',
    '',
    'Archivo generado por `npm run respaldo` a partir de `contenido/paradas.json`; no se edita a mano. Acompaña a `respaldo/index.html` cuando la vista del presentador no está disponible.',
    '',
    `- Guion: ${minutos(contenido.duracion_total)}; ensayo objetivo: ${minutos(contenido.ensayo_objetivo)}; tolerancia: ${minutos(contenido.tolerancia_minutos)}.`,
    `- Paradas saltables (decisión D6): ${saltables.join(', ') || 'ninguna'}.`,
    `- Respaldo: ${diapositivas.length} imágenes (una por parada y por paso). Teclas: flechas, espacio, Av Pág y Re Pág; 0 a 6 para los momentos; Inicio y Fin; F para pantalla completa. El hash \`#p=P14&paso=1\` abre una diapositiva.`,
    `- Generado: ${fecha}; huella del contenido: \`${huella}\`.`,
    '',
  ];
  let inicio = 0;
  let inicioMomento = 0;
  for (const m of momentos) {
    l.push(`## ${m.id} · ${m.nombre} (${minutos(m.meta)}, ${reloj(inicioMomento)} a ${reloj(inicioMomento + m.meta)})`, '');
    inicioMomento += m.meta;
    for (const p of paradas.filter((x) => x.momento === m.id)) {
      const n = Math.max(1, p.pasos?.length ?? 0);
      const datos = [
        `inicio previsto ${reloj(inicio)}`,
        minutos(p.minutos),
        `escala ${p.escala}`,
        n > 1 ? `diapositivas ${numero(p.id)} a ${numero(p.id, n - 1)}` : `diapositiva ${numero(p.id)}`,
      ];
      if (p.saltable) datos.push('**saltable**');
      if (p.estado_texto !== 'revisado') datos.push(`texto en ${p.estado_texto}`);
      l.push(`### ${p.id} · ${p.titulo}`, '', `- ${datos.join(' · ')}`);
      if (n > 1) l.push(`- Pasos: ${p.pasos.map((x) => x.rotulo).join(' · ')}`);
      l.push('', `**Notas.** ${p.notas}`, '', `**Ficha en pantalla.** ${p.ficha}`, '');
      const f = abreviar(p.fuentes, fuentes).map((x) => (x.pendiente ? `${x.texto} (por verificar)` : x.texto));
      l.push(`**Fuentes.** ${f.join(' · ')}`, '');
      inicio += p.minutos;
    }
  }
  return l.join('\n');
}
