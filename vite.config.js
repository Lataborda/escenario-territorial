// Configuración de Vite: compilación normal (dist/, vista principal y vista del presentador)
// y archivo único de respaldo (dist-unico/, solo la vista principal).
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const unico = mode === 'unico';
  return {
    // Rutas relativas: la compilación abre desde cualquier carpeta.
    base: './',
    plugins: unico ? [viteSingleFile()] : [],
    build: {
      outDir: unico ? 'dist-unico' : 'dist',
      emptyOutDir: true,
      // Three.js pesa más de 500 kB; el aviso por defecto no aplica.
      chunkSizeWarningLimit: 1500,
      rolldownOptions: {
        input: unico
          ? path.join(RAIZ, 'index.html')
          : { principal: path.join(RAIZ, 'index.html'), presentador: path.join(RAIZ, 'presentador.html') },
      },
    },
    server: { open: false },
    preview: { open: false },
  };
});
