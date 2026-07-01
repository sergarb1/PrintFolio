/**
 * export.js - Funciones de exportación a PDF y PNG
 * Utiliza jsPDF (cargado desde CDN) y Canvas API
 * Licencia: AGPL v3
 */

window.exporter = {
    /**
     * Exporta el papel como PDF
     * @param {Object} config - Configuración del papel
     * @param {number} numPaginas - Número de páginas a generar
     */
    async exportarPDF(config, numPaginas = 1) {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            alert('La librería jsPDF no está cargada. Verifica tu conexión a Internet.');
            return;
        }

        const dims = window.renderer.PAPER_DIMS[config.tamanioPapel] || window.renderer.PAPER_DIMS.a4;

        /* Obtener orientación */
        const orientacion = dims.w > dims.h ? 'landscape' : 'portrait';

        /* Crear documento PDF con el tamaño de papel adecuado */
        const pdf = new jsPDF({
            orientation: orientacion,
            unit: 'mm',
            format: [dims.w, dims.h]
        });

        /* Renderizar a alta resolución (200 DPI para PDF) */
        const dpi = 200;
        const pxPorMm = dpi / 25.4;

        for (let pagina = 0; pagina < numPaginas; pagina++) {
            if (pagina > 0) {
                pdf.addPage([dims.w, dims.h], orientacion);
            }

            /* Copiar configuración y añadir número de página */
            const configPagina = { ...config };
            configPagina.numeroPagina = pagina + 1;

            /* Renderizar página a alta resolución */
            const canvasHR = window.renderer.renderPaperHighRes(configPagina, dpi);

            /* Convertir canvas a imagen JPEG */
            const imgData = canvasHR.toDataURL('image/jpeg', 0.95);

            /* Añadir imagen al PDF */
            pdf.addImage(imgData, 'JPEG', 0, 0, dims.w, dims.h, undefined, 'FAST');
        }

        /* Descargar PDF */
        const nombreArchivo = `hoja-${config.tipoPapel}-${Date.now()}.pdf`;
        pdf.save(nombreArchivo);
    },

    /**
     * Exporta el papel como PNG
     * @param {Object} config - Configuración del papel
     */
    async exportarPNG(config) {
        const dims = window.renderer.PAPER_DIMS[config.tamanioPapel] || window.renderer.PAPER_DIMS.a4;

        /* Renderizar a 300 DPI para buena calidad */
        const dpi = 300;
        const configPagina = { ...config, numeroPagina: 1 };
        const canvas = window.renderer.renderPaperHighRes(configPagina, dpi);

        /* Convertir a blob y descargar */
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('No se pudo generar el PNG'));
                    return;
                }
                const url = URL.createObjectURL(blob);
                const enlace = document.createElement('a');
                enlace.href = url;
                enlace.download = `hoja-${config.tipoPapel}-${Date.now()}.png`;
                enlace.click();
                URL.revokeObjectURL(url);
                resolve();
            }, 'image/png');
        });
    },

    /**
     * Obtiene el canvas del preview como imagen
     * @returns {string} URL de datos de la imagen
     */
    capturarPreview() {
        const canvas = document.querySelector('#previewCanvas');
        if (!canvas) return null;
        return canvas.toDataURL('image/png');
    },

    /**
     * Genera un nombre de archivo descriptivo
     */
    generarNombreArchivo(tipoPapel, extension) {
        const fecha = new Date().toISOString().split('T')[0];
        const nombres = {
            'rayado': 'rayado', 'cuadriculado': 'cuadricula',
            'puntos': 'puntos', 'caligrafia': 'caligrafia',
            'kinder': 'infantil', 'doblelinea': 'doble-linea',
            'blanco': 'blanco', 'musica': 'pentagrama',
            'aritmetica': 'aritmetica', 'cornell': 'cornell',
            'isometrica': 'isometrico', 'hexagonal': 'hexagonal',
            'composicion': 'composicion', 'milimetrica': 'milimetrico'
        };
        const nombre = nombres[tipoPapel] || 'personalizado';
        return `hoja-${nombre}-${fecha}.${extension}`;
    },

    /* ===== GENERACIÓN POR LOTES ===== */

    /**
     * Lista de todos los tipos de papel para generación por lotes
     */
    TIPOS_PAPEL: [
        'rayado', 'cuadriculado', 'puntos', 'caligrafia',
        'kinder', 'doblelinea', 'blanco', 'musica',
        'aritmetica', 'cornell', 'isometrica', 'hexagonal',
        'composicion', 'milimetrica'
    ],

    /**
     * Exporta todos los tipos de papel en un solo PDF
     * @param {Object} configBase - Configuración base (sin tipo de papel)
     */
    async exportarTodosPDF(configBase) {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) return;

        const tipos = this.TIPOS_PAPEL;
        const dims = window.renderer.PAPER_DIMS[configBase.tamanioPapel] || window.renderer.PAPER_DIMS.a4;
        const orientacion = dims.w > dims.h ? 'landscape' : 'portrait';
        const dpi = 200;
        const pxPorMm = dpi / 25.4;

        const pdf = new jsPDF({ orientation: orientacion, unit: 'mm', format: [dims.w, dims.h] });

        for (let i = 0; i < tipos.length; i++) {
            if (i > 0) pdf.addPage([dims.w, dims.h], orientacion);

            const config = { ...configBase, tipoPapel: tipos[i], numeroPagina: i + 1 };
            const canvas = window.renderer.renderPaperHighRes(config, dpi);
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            pdf.addImage(imgData, 'JPEG', 0, 0, dims.w, dims.h, undefined, 'FAST');
        }

        pdf.save(`printfolio-todos-${Date.now()}.pdf`);
    }
};
