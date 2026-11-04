// Copia el archivo único compilado en vista-previa/escenario.html (versionado en el repositorio).
// Uso: npm run vista-previa (compila antes con build:unico).
import { copyFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGEN = path.join(RAIZ, 'dist-unico', 'index.html');
const DESTINO = path.join(RAIZ, 'vista-previa', 'escenario.html');

try {
  await stat(ORIGEN);
} catch {
  console.error('Falta dist-unico/index.html. Ejecutar antes: npm run build:unico');
  process.exit(1);
}
await mkdir(path.dirname(DESTINO), { recursive: true });
await copyFile(ORIGEN, DESTINO);
const { size } = await stat(DESTINO);
console.log(`vista-previa/escenario.html actualizado (${(size / 1024).toFixed(0)} kB).`);
