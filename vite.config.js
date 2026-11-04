// Configuración de Vite: compilación normal (dist/) y archivo único de respaldo (dist-unico/).
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

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
    },
    server: { open: false },
    preview: { open: false },
  };
});
