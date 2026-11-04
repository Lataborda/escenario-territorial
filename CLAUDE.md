# Escenario territorial de agroecología

Escenario virtual 3D (maqueta navegable) para la prueba oral del Concurso Profesoral FCA 2026, perfil TC7, Universidad Nacional de Colombia, Sede Palmira. Tema de la clase: «Transición hacia sistemas alimentarios agroecológicos: del agroecosistema al territorio» (Resolución 356 de 2026, art. 11). Autor del contenido: Alejandro Taborda.

Documentos del proyecto:

- `PLAN.md`: arquitectura técnica y etapas de construcción.
- `GUION.md`: contenido conceptual, escenarios, teoría de cambio y paradas. Lo edita Alejandro.
- `BITACORA.md`: estado actual y registro de sesiones.

## Protocolo de sesión

Cada sesión ejecuta una sola etapa.

1. Leer la sección «Estado actual» y la última entrada de `BITACORA.md`.
2. Leer en `PLAN.md` solo la sección de la etapa en curso (buscar `## Etapa N.`). Leer «Principios técnicos» solo si la etapa crea módulos nuevos.
3. Validar lo construido con `npm run verificar` (existe desde la etapa 0). Si falla, la sesión se dedica a corregir y se registra así.
4. Revisar como máximo cuatro capturas de `verificacion/capturas/`.
5. Proponer el trabajo en modo plan y esperar la aprobación de Alejandro.
6. Ejecutar la etapa dentro de su alcance. Lo que exceda el alcance se anota como pendiente.
7. Comprobar los criterios de aceptación de la etapa y correr `npm run verificar`.
8. Hacer commit con el mensaje `Etapa N: <resumen breve>`.
9. Actualizar `BITACORA.md`: sección «Estado actual» y una entrada nueva con la plantilla.
10. Detenerse. La etapa siguiente empieza en otra sesión, salvo indicación expresa.

Cuando Alejandro escriba «modo continuo», se omite la espera de aprobación del paso 5: la propuesta se anota en la respuesta y la ejecución sigue sin pausa.

Si una etapa resulta grande, dividirla en N.a y N.b, registrar la división en la bitácora y cerrar la sesión al terminar N.a.

## Economía de tokens

- No abrir completos los textos de la literatura. Buscar con `rg` el término exacto en `../Transition/`, `../Agroecologia_Grafo/raw/` o `../Normative/` y leer solo el pasaje con su contexto inmediato.
- Los PDF se consultan con `pdftotext` y búsqueda, nunca leyendo el documento entero.
- No releer archivos recién editados. Preferir ediciones puntuales a reescrituras completas.
- Mantener los módulos por debajo de 300 líneas, para que cada edición sea barata.
- El contenido en pantalla vive en `contenido/*.json`. Un cambio de texto se hace allí, sin tocar el código 3D.
- Si el contexto crece dentro de una etapa, usar `/compact`. Entre etapas, `/clear`.

## Acceso a las fuentes

Las fuentes están fuera de esta carpeta. En las etapas que las requieren, ejecutar al inicio `/add-dir ../..` para dar lectura a la carpeta `TC`. Rutas relativas desde este proyecto:

- `../RESUMEN-prueba-oral.md` y `../RESUMEN-ESTRATEGIA-PRUEBA-ORAL.md`: síntesis previas de la estrategia de la prueba oral.
- `../Transition/`: artículos en markdown (ojo: un archivo empieza con espacio, ` Territorialising Local Food Systems .md`).
- `../Normative/`: Resolución 000331 de 2024, Ley 2046 de 2020, Decreto 1406 de 2023.
- `../Agroecologia_Grafo/raw/`: Gliessman et al. (2023), un archivo por capítulo.
- `../../Libros completos/`: León-Sicard (2021) completo y el libro de Montagnini (2022) con el capítulo de El Hatico.
- `../Prototipo_Hyperframes/`: prototipo previo de diapositivas animadas. No se modifica. Su `CLAUDE.md` es de otro proyecto y no aplica aquí.

## Reglas de contenido

- Ningún texto conceptual se escribe directamente en el código. Todo sale de `contenido/`.
- Toda cifra, cita, norma o caso en pantalla lleva una clave de `contenido/fuentes.json` con localizador (página o sección).
- No inventar cifras, citas ni artículos de normas. Si falta la fuente, marcar el dato con estado `verificar` y anotarlo en la bitácora.
- Las fichas que redacta Claude quedan en estado `borrador` hasta que Alejandro las marque `revisado`.
- Los valores de índices (EAP, MESMIS, TAPE) se muestran con fuente o con el rótulo «valores ilustrativos».
- Respetar las precauciones de contenido de `GUION.md`, sección 10.

## Reglas de redacción para textos en pantalla y notas

- Registro académico formal e impersonal, frases cortas, término establecido de la disciplina, la misma palabra para el mismo concepto.
- Títulos en sintagma nominal, sin dos puntos.
- Sin rayas (—) como puntuación incidental. Usar comas o paréntesis.
- Sin construcciones de contraste del tipo «no es X, es Y», «no solo… sino», «más que», «antes que».
- Vocabulario fijo del glosario de `GUION.md`, sección 9. Nunca «cadena de valor» ni «stakeholders».
- Fichas de pantalla de 60 palabras como máximo.

## Reglas de código

- JavaScript con módulos ES, Three.js y GSAP, servidos con Vite. Sin frameworks de interfaz.
- Dependencias con versión exacta en `package.json` y `package-lock.json` versionado. No actualizar dependencias sin pedirlo.
- Cero solicitudes de red en ejecución: tipografías, bibliotecas y datos locales.
- Generación procedimental con semilla fija. La escena es idéntica en cada carga.
- Nombres de archivos y variables en español sin tildes. Comentarios breves en español.
- Cada módulo visual se suscribe al almacén de estado (`src/estado.js`) y reacciona a él. Ningún módulo modifica a otro directamente.
- Si el entorno ya trae Chromium y Playwright (por ejemplo, la sesión en la nube), usarlos y no instalar otro navegador (`npx playwright install` no se ejecuta).

## Comandos

- `npm run dev`: servidor de desarrollo.
- `npm run validar`: valida `contenido/` (desde la etapa 1).
- `npm run verificar`: compila, recorre las paradas con Playwright, guarda capturas e informe en `verificacion/`.
- `npm run presentar`: versión compilada con vista principal y vista del presentador (desde la etapa 4).
- `npm run respaldo`: capturas de cada parada y paso en `respaldo/index.html` (abre sin servidor) y notas en `respaldo/notas.md` (desde la etapa 4).
- `npm run build:unico`: archivo HTML único de respaldo, abre sin servidor.
