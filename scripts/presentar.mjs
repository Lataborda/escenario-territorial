// Presentación: compila, sirve dist/ y abre la vista principal y la del presentador.
// Uso: npm run presentar (Ctrl+C para cerrar). Con --sin-abrir solo sirve e imprime las direcciones.
// Puerto fijo, para que el cronómetro guardado en el navegador sobreviva a un reinicio del servidor.
import { build, preview } from 'vite';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUERTO = 4320;
const sinAbrir = process.argv.includes('--sin-abrir');

function abrir(url) {
  const [orden, argumentos] =
    process.platform === 'darwin'
      ? ['open', [url]]
      : process.platform === 'win32'
        ? ['cmd', ['/c', 'start', '', url]]
        : ['xdg-open', [url]];
  const proceso = spawn(orden, argumentos, { stdio: 'ignore', detached: true });
  proceso.on('error', () => console.log(`No se pudo abrir el navegador. Abrir a mano: ${url}`));
  proceso.unref();
}

console.log('Compilando dist/ ...');
await build({ root: RAIZ, logLevel: 'warn' });
const servidor = await preview({ root: RAIZ, logLevel: 'warn', preview: { port: PUERTO, strictPort: false } });
const principal = servidor.resolvedUrls.local[0];
const presentador = new URL('presentador.html', principal).href;
console.log(
  [
    '',
    `Vista principal (se comparte):  ${principal}`,
    `Vista del presentador:          ${presentador}`,
    '',
    'En la videoconferencia se comparte solo la pestaña o ventana principal.',
    'Las dos vistas deben abrirse en el mismo navegador para mantenerse sincronizadas.',
    'Ctrl+C cierra el servidor.',
  ].join('\n'),
);
if (!sinAbrir) {
  abrir(principal);
  // El presentador se abre después: queda como pestaña activa y se arrastra a otra ventana.
  setTimeout(() => abrir(presentador), 1500);
}
const cerrar = async () => {
  await servidor.close();
  process.exit(0);
};
process.on('SIGINT', cerrar);
process.on('SIGTERM', cerrar);
