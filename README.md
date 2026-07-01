# PrintFolio

**Genera tus propios estilos de folios**

PrintFolio es una herramienta web **libre y gratuita** para que docentes y educadores generen hojas de papel personalizadas listas para imprimir. No requiere instalación, funciona sin conexión y respeta tu privacidad.

🌐 **Demo en vivo:** [sergarb1.github.io/PrintFolio](https://sergarb1.github.io/PrintFolio)

---

## Características

- **14 tipos de papel**: rayado, cuadriculado, puntos, caligrafía, infantil (kinder), doble línea, blanco, pentagrama musical, aritmética, Cornell, isométrico, hexagonal, composición, milimétrico
- **Exportación por tipo**: PDF (200 DPI), PNG (300 DPI)
- **Galería completa**: todos los tipos pre-generados con descarga individual desde la pestaña Galería
- **8 temas visuales**: por defecto, sepia, pastel, nocturno, clásico, bosque, océano, atardecer
- **16 colores rápidos** para fondo
- **Personalización completa**: márgenes, color/grosor/estilo de línea, tamaño de celda, marca de agua, numeración de página, borde
- **Imagen de fondo**: carga tu propia imagen como fondo del papel
- **Multilingüe**: castellano, valencià, english
- **Auto-guardado**: la configuración persiste al recargar la página
- **Restaurar valores por defecto**: vuelve a los ajustes iniciales con un solo clic
- **Instalable**: añade PrintFolio a tu dispositivo como una app gracias al PWA
- **Atajos de teclado**: `Ctrl+P` para imprimir, `Ctrl+E` para exportar PNG
- **Offline-ready**: funciona sin conexión con librerías locales
- **Responsive**: diseño adaptativo para escritorio, tablet y móvil

## Cómo usar

1. Abre [PrintFolio](https://sergarb1.github.io/PrintFolio/)
2. En la pestaña **Generar** (panel izquierdo) ajusta tipo de papel, tamaño, colores, márgenes y opciones
3. La previsualización se actualiza al instante
4. Descarga desde las tarjetas debajo del canvas: **PDF**, **PNG** o **Imprimir**
5. Para ver todos los tipos de una vez, abre la pestaña **Galería** o pulsa el banner destacado
6. Tu configuración se guarda automáticamente en el navegador

## Tecnologías

- [Vue 3](https://vuejs.org/) — framework reactivo (Options API, sin JSX)
- [jsPDF](https://github.com/parallax/jsPDF) — generación de PDF
- Canvas 2D API — renderizado de todos los tipos de papel
- CSS moderno (grid, flexbox, animaciones)
- PWA (manifest + service worker) — instalable y offline-ready

## Licencia

**AGPL v3** — Software Libre. Puedes usar, modificar y distribuir este programa siempre que mantengas la misma licencia y publiques los cambios.

Creado por [sergarb1](https://github.com/sergarb1) — [mejoratudocencia.es](https://mejoratudocencia.es)
