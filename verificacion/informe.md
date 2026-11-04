# Informe de verificación

- Fecha: 2026-11-04T17:28:21.054Z
- Navegador: Chromium 153.0.8010.12
- Resultado: correcto

## Vista compilada (servidor de vista previa)

- Dirección: `http://localhost:4317/`
- Carga: sí, 3046 ms hasta `escenario:listo`
- Errores de consola: ninguno
- Solicitudes: 9 en total; externas: ninguna
- Cuadros por segundo en la vista general: 2.6 (navegador sin pantalla; referencia, no equivale al equipo de la prueba)
- Llamadas de dibujo: 7; triángulos: 517422; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Captura: `capturas/general.png` (1600×900)
- Avisos de consola (no bloquean):
  - [.WebGL-0x1dd4001a4800]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
  - [.WebGL-0x1dd4001a4800]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
  - [.WebGL-0x1dd4001a4800]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
  - [.WebGL-0x1dd4001a4800]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (this message will no longer repeat)

## Archivo único (file://, sin servidor y sin red)

- Dirección: `file:///home/user/escenario-territorial/dist-unico/index.html`
- Carga: sí, 2994 ms hasta `escenario:listo`
- Tamaño: 866 kB
- Errores de consola: ninguno
- Solicitudes: 1 en total; externas: ninguna
- Llamadas de dibujo: 7; triángulos: 517422; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Captura: `capturas/unico.png` (1600×900)
- Avisos de consola (no bloquean): ninguno

## Terreno

- Exageración vertical: 2 (configurable con `#ex=` entre 1,5 y 3)
- Vértices de la rejilla: 120701; anclas: 32
- Huella del terreno: `fee3fa59`
- Idéntico en dos cargas: huella sí; captura de la vista general sí
- Archivo único con la misma huella: sí
- Anclas sobre la superficie (rayo vertical): 32 de 32; desvío máximo 0.0003
- Tecla A muestra los marcadores: sí
- Capturas: `capturas/general.png`, `capturas/anclas.png`, `capturas/ladera.png`, `capturas/plano.png`

## Recorrido de paradas (vista compilada)

- Dirección: `http://localhost:4317/#p=P01&captura=1`
- Carga: sí, 2774 ms hasta `escenario:listo`
- Errores de consola: ninguno
- Solicitudes: 9 en total; externas: ninguna
- Llamadas de dibujo: 7; triángulos: 517422; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Avisos de consola (no bloquean): ninguno

## Transiciones (vista compilada, sin #captura)

- Dirección: `http://localhost:4317/#p=P05`
- Carga: sí, 2272 ms hasta `escenario:listo`
- Errores de consola: ninguno
- Solicitudes: 9 en total; externas: ninguna
- Llamadas de dibujo: 7; triángulos: 517422; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Avisos de consola (no bloquean): ninguno

## Ventana de 1280×720 (vista compilada)

- Dirección: `http://localhost:4317/#p=P14&paso=2&captura=1`
- Carga: sí, 3086 ms hasta `escenario:listo`
- Errores de consola: ninguno
- Solicitudes: 9 en total; externas: ninguna
- Llamadas de dibujo: 7; triángulos: 517422; relación de píxeles: 1
- Renderizador WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Tipografías cargadas (caras): IBM Plex Sans 3/3; Fraunces 2/2
- Avisos de consola (no bloquean): ninguno

## Recorrido

- Paradas por hash (`#p=ID&captura=1`): cargan 26 de 26; ficha correcta 26; con fuente 26; cámara en su lugar 26; escala 26
- Capturas: `capturas/paradas/P01.jpg` a `P26.jpg`
- Flechas, espacio y Av Pág/Re Pág (34 estados con pasos): adelante sí; atrás sí
- Teclas: 0 a 6 sí; O sí; H sí; V sí
- Tecla C: sí, `"camara": { "ancla": "F2", "distancia": 640, "azimut": -47, "elevacion": 33, "duracion": 2.5 }`; desvío al aplicarlo 0
- Botonera: sí; clic en una finca: sí
- Transiciones: entre paradas declarada 2.5 s, medida 2.69 s; botonera declarada 2 s, medida 2.53 s; correctas sí
- Trayectorias muestreadas: 25 tramos (21 con movimiento); razón máxima entre paso mayor y paso medio 2.1 (límite 4); extremos exactos sí
- Hash directo `#p=P14&paso=2`: sí
- Fichas a 1280×720: legibles 26 de 26 (sin desborde, dentro de la ventana, sin superposición, letra ≥ 16 px); letra mínima 16 px; ficha más alta P14 (488 px de 720); captura `capturas/ficha-1280.png`

## Vista del presentador (dos pestañas del mismo navegador)

- Dirección: `http://localhost:4317/presentador.html`
- Conexión con la vista principal: sí, 77 ms
- Pruebas de sincronía y cronómetro: 19 de 19 correctas
  - sí: estado inicial P01 en las dos vistas
  - sí: botón Siguiente del presentador mueve la principal a P02
  - sí: flecha en la principal llega al presentador (P03, paso 1)
  - sí: flecha en el presentador avanza un paso (P03, paso 2)
  - sí: flecha izquierda y Re Pág en el presentador retroceden a P02
  - sí: clic en el índice lleva la principal a P14
  - sí: tecla 5 en el presentador lleva a la primera parada de M5
  - sí: modo libre desde el presentador
  - sí: tecla O en el presentador vuelve al recorrido
  - sí: tecla H en el presentador oculta la interfaz principal
  - sí: botón Interfaz la muestra de nuevo
  - sí: cambio de hash en la principal llega al presentador (P20)
  - sí: «Omitir» salta la parada saltable P12
  - sí: M0 tras 1 min: desvío −2:00 frente a 3 min
  - sí: M1 tras 7 min: desvío +1:00 frente a 6 min; total 8:00
  - sí: desvío acumulado +2:00 marca retraso y resalta las saltables
  - sí: en pausa el total no avanza (11:00)
  - sí: una recarga del presentador conserva el cronómetro y la parada
  - sí: Reiniciar deja el cronómetro en cero
- Cronómetro con reloj simulado: M0 −2:00; M1 +1:00; desvío acumulado +2:00
- Captura: `capturas/presentador.png` (1440×900)
- Errores de consola (ambas pestañas): ninguno
- Solicitudes: 25 en total; externas: ninguna
- Avisos de consola (no bloquean): ninguno

## Respaldo en imágenes (file://, sin servidor y sin red)

- Dirección: `respaldo/index.html`
- Carga: sí, 50 ms
- Imágenes: 34 de 34 cargan (1920×1080); estados del recorrido: 34
- Teclado (flechas, Fin, tecla 3, hash): sí
- Contenido igual al de la generación: sí
- Errores de consola: ninguno
- Solicitudes externas: ninguna

## Contenido

- JSON válidos: 7 de 7
- Paradas: 26; minutos: 40; saltables: P12, P15, P23
- Errores de contenido: ninguno
- Avisos de redacción: ninguno
- Fichas en borrador (26): P01, P02, P03, P04, P05, P06, P07, P08, P09, P10, P11, P12, P13, P14, P15, P16, P17, P18, P19, P20, P21, P22, P23, P24, P25, P26
- Fuentes en falta o verificar:
  - magrini (verificar)
  - padro (verificar)
  - mieryteran (falta)
  - giraldorosset (falta)
  - anderson (falta)
  - leonsicard2015 (falta)
  - sanchezprager (falta)
  - romero (falta)
  - redmac (falta)
  - ley2294 (falta)
  - al012023 (falta)
- Pendientes de fuente: 68 localizadores y 20 datos (`pendientes-de-fuente.md`)
