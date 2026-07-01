# PrintFolio — Guía para Agentes de IA

## Proyecto

Aplicación web SPA (Single Page Application) para generar hojas de papel personalizadas.
Construida con Vue 3 + Canvas 2D + jsPDF. Funciona offline con librerías locales en `lib/`.
Licencia: **AGPL v3**.

## Estructura

```
PrintFolio/
├── index.html              ← Página única, contiene el loader de librerías con fallback + PWA manifest/sw
├── css/style.css           ← Diseño responsive, modales, toasts, animaciones, galería, descarga
├── js/
│   ├── i18n.js             ← Traducciones (es, cv, en) + función t()
│   ├── renderer.js         ← Renderizado Canvas: 14 tipos de papel + temas + colores
│   ├── export.js           ← Exportación PDF (jsPDF) y PNG
│   └── app.js              ← App Vue 3: estado reactivo, auto-guardado, atajos, toasts, galería
├── lib/                    ← Copias locales de Vue 3 y jsPDF (para offline)
├── img/                    ← logo.svg, favicon.svg
├── docs/revision.md        ← Auditoría de código
├── LICENSE                 ← AGPL v3
├── manifest.json           ← PWA manifest (instalable)
├── sw.js                   ← Service Worker para caché offline
└── descargar-librerias.*   ← Scripts para descargar librerías
```

## Convenciones de código

- **Comentarios en español** (obligatorio en todos los archivos)
- **Sin JSX** — Vue 3 con Options API y template en HTML
- **Sin TypeScript** — JavaScript plano
- **Sin bundlers** — sin webpack/vite. Carga directa de scripts en orden: i18n → renderer → export → Vue → jsPDF → app
- **ES modules no**: todo global (`window.renderer`, etc.)
- **Nombres de funciones/variables en camelCase** (excepto constantes en MAYUSCULAS)
- **Sin librerías externas** salvo Vue 3 y jsPDF (en `lib/` como CDN fallback)
- **Sin referencias a "PaperMe", "pixzens.com" ni marcas previas**
- **Logo: hoja con líneas y esquina doblada** (no marcas registradas)

## Arquitectura

### Panel de control (index.html)
- 2 pestañas en el panel lateral: **Generar** (todos los controles) y **Galería** (14 tipos pre-generados)
- El panel Generar contiene: tipo de papel, tamaño, tema, colores, línea, márgenes, fondo, opciones (num.página, borde, marca de agua, exportar/importar configuración)
- El panel Galería pre-renderiza los 14 tipos al abrirse, cada uno con botones PNG/PDF
- Banner destacado en previsualización que enlaza a la Galería
- Las descargas están debajo del canvas (tarjetas PDF, PNG, Imprimir)

### Reactividad (app.js)
- Estado en `data()` — carga inicial desde `localStorage`
- `configCompleta` — objeto plano computado que se pasa al renderer
- `watch: configCompleta` con `deep: true` → llama a `redibujar()` + `_guardarConfig()`
- Los cambios en inputs de color/check llaman a métodos específicos (`cambiarColorLinea`, etc.)
- El cambio de tema activa un watcher que actualiza `colorFondo` y `colorLinea`

### Renderizado (renderer.js)
- `renderPaper(canvas, config)` — renderiza en un canvas existente (preview)
- `renderPaperHighRes(config, dpi)` — crea un canvas nuevo a resolución de exportación
- Cada tipo de papel es una función independiente: `drawLined`, `drawGrid`, `drawDot`, etc.
- Las funciones reciben `(ctx, margins, width, height, scale, config)`
- La escala es `pxPorMm` calculada en preview o desde DPI fijo en exportación

### Exportación (export.js)
- `exportarPDF`: usa jsPDF, renderiza cada página con `renderPaperHighRes` a 200 DPI
- `exportarPNG`: renderiza a 300 DPI, descarga con `canvas.toBlob()`
- `exportarTodosPDF`: exportación por lotes de los 14 tipos (desde Galería)

### Traducciones (i18n.js)
- Objeto `TRADUCCIONES` con sub-objetos `es`, `cv`, `en`
- Función `t(clave, idioma)` — devuelve `traducciones[clave] || clave`
- Las claves en el HTML se acceden via `{{ traducciones.nombreClave }}`
- Las claves en JS se acceden via `this.$t('nombreClave')`

## Bugs conocidos (docs/revision.md)

- **drawKinder**: el comentario sugiere 3 colores pero usa el mismo `colorLinea`
- **renderPaper**: muta `config.colorFondo` y `config.colorLinea` si hay tema activo (sin efecto colateral porque `config` es un objeto nuevo por render)

## Notas importantes

- El footer `drawFooter` usa `config.numeroPagina || 1` para mostrar el número
- La imagen de fondo tiene caché (`cacheImagenFondo`) para evitar crear `new Image()` en cada render
- El loader de `index.html` detecta `file://` para saltar CDN y cargar desde `lib/`
- `localStorage` key: `creadorhojas-config` (config), `creadorhojas-idioma` (idioma)
- El color de línea personalizado se rastrea con `colorLineaPersonalizado` para no sobrescribir con temas
- La galería se re-renderiza desde cero al abrirse (`galeria = []` → poblar) para reflejar la configuración actual
- Los métodos de descarga por tipo (`galeriaDescargarPNG/PDF`) pasan `tipoPapel` + `numeroPagina: 1` a la config
