/**
 * app.js - Aplicación Vue 3 para el generador de hojas
 * Características: auto-guardado, atajos teclado, toasts, multi-idioma
 * Licencia: AGPL v3
 */

const STORAGE_KEY = 'creadorhojas-config';
const IDIOMA_KEY = 'creadorhojas-idioma';

const app = Vue.createApp({
    data() {
        /* Cargar configuración guardada */
        const guardado = this._cargarConfig();
        return {
            /* ===== CONFIGURACIÓN DEL PAPEL ===== */
            tipoPapel: guardado.tipoPapel || 'rayado',
            tamanioPapel: guardado.tamanioPapel || 'a4',
            tema: guardado.tema || 'personalizado',
            colorLinea: (guardado.colorLinea && guardado.colorLinea !== '#808080') ? guardado.colorLinea : '#000000',
            colorLineaPersonalizado: guardado.colorLineaPersonalizado || false,
            estiloLinea: guardado.estiloLinea || 'solido',
            espaciadoLinea: guardado.espaciadoLinea || 8,
            grosorLinea: guardado.grosorLinea || 0.5,
            tamanoCelda: guardado.tamanoCelda || 10,

            /* Márgenes */
            margenSuperior: guardado.margenSuperior || 20,
            margenDerecho: guardado.margenDerecho || 15,
            margenInferior: guardado.margenInferior || 20,
            margenIzquierdo: guardado.margenIzquierdo || 15,

            /* Fondo */
            colorFondo: guardado.colorFondo || '#ffffff',
            patronFondo: guardado.patronFondo || 'ninguno',
            imagenFondoData: guardado.imagenFondoData || null,
            nombreImagenFondo: guardado.nombreImagenFondo || '',

            /* Marca de agua */
            mostrarMarcaAgua: guardado.mostrarMarcaAgua || false,
            marcaAguaTexto: guardado.marcaAguaTexto || 'BORRADOR',

            /* Página */
            mostrarNumPagina: guardado.mostrarNumPagina || false,
            mostrarBorde: guardado.mostrarBorde || false,
            numPaginas: guardado.numPaginas || 1,

            /* UI */
            idioma: localStorage.getItem(IDIOMA_KEY) || 'es',
            panelActivo: 'generar',
            menuMovilAbierto: false,
            exportando: false,
            toasts: [],
            mostrarAyuda: false,
            mostrarAcerca: false,
            galeria: [],
            galeriaTipos: [
                'rayado','cuadriculado','puntos','caligrafia',
                'kinder','doblelinea','blanco','musica',
                'aritmetica','cornell','isometrica','hexagonal',
                'composicion','milimetrica'
            ]
        };
    },

    computed: {
        $t() {
            const self = this;
            return (clave) => window.i18n.t(clave, self.idioma);
        },
        traducciones() {
            return window.i18n.obtenerTraducciones(this.idioma);
        },
        idiomasDisponibles() {
            return window.i18n.idiomasDisponibles;
        },
        dimensionesPapel() {
            const dims = window.renderer.PAPER_DIMS[this.tamanioPapel];
            return dims || window.renderer.PAPER_DIMS.a4;
        },
        configCompleta() {
            return {
                tipoPapel: this.tipoPapel,
                tamanioPapel: this.tamanioPapel,
                colorLinea: this.colorLinea,
                colorLineaPersonalizado: this.colorLineaPersonalizado,
                estiloLinea: this.estiloLinea,
                espaciadoLinea: Number(this.espaciadoLinea),
                grosorLinea: Number(this.grosorLinea),
                tamanoCelda: Number(this.tamanoCelda),
                margenSuperior: Number(this.margenSuperior),
                margenDerecho: Number(this.margenDerecho),
                margenInferior: Number(this.margenInferior),
                margenIzquierdo: Number(this.margenIzquierdo),
                colorFondo: this.colorFondo,
                patronFondo: this.patronFondo,
                imagenFondoData: this.imagenFondoData,
                tema: this.tema,
                mostrarMarcaAgua: this.mostrarMarcaAgua,
                marcaAguaTexto: this.marcaAguaTexto,
                mostrarNumPagina: this.mostrarNumPagina,
                mostrarBorde: this.mostrarBorde,
                numPaginas: Number(this.numPaginas)
            };
        },
        nombreTipoPapel() {
            return this.$t(this.tipoPapel);
        },
        papelesDisponibles() { return window.renderer.PAPER_DIMS; },
        temasDisponibles() { return window.renderer.TEMAS; },
        coloresDisponibles() { return window.renderer.COLORES_RAPIDOS; }
    },

    watch: {
        configCompleta: {
            handler() {
                this.$nextTick(() => this.redibujar());
                this._guardarConfig();
            },
            deep: true,
            immediate: true
        },
        tema(nuevoTema) {
            if (nuevoTema !== 'personalizado') {
                const t = window.renderer.TEMAS[nuevoTema];
                if (t) {
                    this.colorFondo = t.fondo;
                    if (!this.colorLineaPersonalizado) this.colorLinea = t.linea;
                }
            }
        },
        idioma() {
            localStorage.setItem(IDIOMA_KEY, this.idioma);
        }
    },

    methods: {
        /* ===== RENDER ===== */
        redibujar() {
            const canvas = this.$refs.previewCanvas;
            if (canvas) window.renderer.renderPaper(canvas, this.configCompleta);
        },

        /* ===== TOAST NOTIFICATIONS ===== */
        toast(mensaje, tipo) {
            tipo = tipo || 'info';
            const id = Date.now() + Math.random();
            this.toasts.push({ id, mensaje, tipo });
            setTimeout(() => {
                this.toasts = this.toasts.filter(t => t.id !== id);
            }, 3000);
        },

        /* ===== COLORES ===== */
        aplicarColorRapido(color) { this.colorFondo = color; },
        aplicarTema(temaId) { this.tema = temaId; },
        cambiarColorLinea(color) {
            this.colorLinea = color;
            this.colorLineaPersonalizado = true;
            if (this.tema !== 'personalizado') this.tema = 'personalizado';
        },

        /* ===== IMAGEN ===== */
        cargarImagenFondo(event) {
            const archivo = event.target.files[0];
            if (!archivo) return;
            const lector = new FileReader();
            lector.onload = (e) => {
                this.imagenFondoData = e.target.result;
                this.nombreImagenFondo = archivo.name;
                this.toast(this.$t('imagenCargada') + ' ' + archivo.name, 'success');
            };
            lector.onerror = () => this.toast(this.$t('errorImagen'), 'error');
            lector.readAsDataURL(archivo);
        },
        quitarImagenFondo() {
            this.imagenFondoData = null;
            this.nombreImagenFondo = '';
        },

        /* ===== EXPORTACIÓN ===== */
        async exportarPDF() {
            this.exportando = true;
            try {
                await window.exporter.exportarPDF(this.configCompleta, Number(this.numPaginas));
                this.toast(this.$t('pdfGenerado'), 'success');
            } catch (e) {
                this.toast(this.$t('errorPDF'), 'error');
            }
            this.exportando = false;
        },
        async exportarPNG() {
            this.exportando = true;
            try {
                await window.exporter.exportarPNG(this.configCompleta);
                this.toast(this.$t('pngGenerado'), 'success');
            } catch (e) {
                this.toast(this.$t('errorPNG'), 'error');
            }
            this.exportando = false;
        },

        /* ===== GALERÍA ===== */
        renderizarGaleria() {
            this.galeria = [];
            const baseConfig = this.configCompleta;
            this.galeriaTipos.forEach(tipo => {
                this.galeria.push({ tipo, listo: false });
            });
            this.$nextTick(() => {
                this.galeriaTipos.forEach((tipo, i) => {
                    const config = { ...baseConfig, tipoPapel: tipo, colorLinea: '#000000', colorFondo: '#ffffff' };
                    const canvas = this.$refs['galeria-' + tipo];
                    if (canvas) {
                        if (Array.isArray(canvas)) {
                            canvas[0] ? window.renderer.renderPaper(canvas[0], config) : null;
                        } else {
                            window.renderer.renderPaper(canvas, config);
                        }
                        this.galeria[i].listo = true;
                    }
                });
            });
        },

        galeriaDescargarPNG(tipo) {
            const config = { ...this.configCompleta, tipoPapel: tipo, numeroPagina: 1 };
            window.exporter.exportarPNG(config);
        },
        async galeriaDescargarPDF(tipo) {
            const config = { ...this.configCompleta, tipoPapel: tipo, numeroPagina: 1 };
            try {
                await window.exporter.exportarPDF(config, 1);
                this.toast(this.$t('pdfGenerado'), 'success');
            } catch (e) {
                this.toast(this.$t('errorPDF'), 'error');
            }
        },
        async galeriaExportarPDF() {
            this.exportando = true;
            this.toast(this.$t('batchGenerando'), 'info');
            try {
                await window.exporter.exportarTodosPDF(this.configCompleta);
                this.toast(this.$t('batchListo'), 'success');
            } catch (e) {
                console.error(e);
                this.toast(this.$t('batchError'), 'error');
            }
            this.exportando = false;
        },
        imprimir() { window.print(); },

        /* ===== CONFIGURACIÓN ===== */
        exportarConfiguracion() {
            const { tipoPapel, tamanioPapel, colorLinea, estiloLinea,
                    espaciadoLinea, grosorLinea, tamanoCelda,
                    margenSuperior, margenDerecho, margenInferior, margenIzquierdo,
                    colorFondo, patronFondo, tema,
                    mostrarMarcaAgua, marcaAguaTexto,
                    mostrarNumPagina, mostrarBorde } = this;
            const config = { tipoPapel, tamanioPapel, colorLinea, estiloLinea,
                espaciadoLinea, grosorLinea, tamanoCelda,
                margenSuperior, margenDerecho, margenInferior, margenIzquierdo,
                colorFondo, patronFondo, tema,
                mostrarMarcaAgua, marcaAguaTexto,
                mostrarNumPagina, mostrarBorde };
            const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'configuracion-hoja.json'; a.click();
            URL.revokeObjectURL(url);
        },
        importarConfiguracion(event) {
            const archivo = event.target.files[0];
            if (!archivo) return;
            const lector = new FileReader();
            lector.onload = (e) => {
                try {
                    Object.assign(this, JSON.parse(e.target.result));
                    this.toast(this.$t('configImportada'), 'success');
                } catch (err) {
                    this.toast(this.$t('errorConfig'), 'error');
                }
            };
            lector.readAsText(archivo);
            event.target.value = '';
        },
        restaurarValores() {
            const defaults = {
                tipoPapel: 'rayado', tamanioPapel: 'a4', tema: 'personalizado',
                colorLinea: '#000000', colorLineaPersonalizado: false,
                estiloLinea: 'solido', espaciadoLinea: 8, grosorLinea: 0.5, tamanoCelda: 10,
                margenSuperior: 20, margenDerecho: 15, margenInferior: 20, margenIzquierdo: 15,
                colorFondo: '#ffffff', patronFondo: 'ninguno',
                imagenFondoData: null, nombreImagenFondo: '',
                mostrarMarcaAgua: false, marcaAguaTexto: 'BORRADOR',
                mostrarNumPagina: false, mostrarBorde: false, numPaginas: 1
            };
            Object.assign(this, defaults);
            localStorage.removeItem(STORAGE_KEY);
            this.toast(this.$t('configImportada'), 'success');
        },

        /* ===== IDIOMA Y UI ===== */
        cambiarIdioma(codigo) { this.idioma = codigo; },
        toggleMenuMovil() { this.menuMovilAbierto = !this.menuMovilAbierto; },
        cambiarPanel(panel) {
            this.panelActivo = panel;
            if (window.innerWidth < 768) this.menuMovilAbierto = false;
        },

        /* ===== AUTO-GUARDADO ===== */
        _cargarConfig() {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                return data ? JSON.parse(data) : {};
            } catch(e) { return {}; }
        },
        _guardarConfig() {
            try {
                const keys = ['tipoPapel','tamanioPapel','colorLinea','colorLineaPersonalizado',
                    'estiloLinea','espaciadoLinea','grosorLinea','tamanoCelda',
                    'margenSuperior','margenDerecho','margenInferior','margenIzquierdo',
                    'colorFondo','patronFondo','tema',
                    'mostrarMarcaAgua','marcaAguaTexto',
                    'mostrarNumPagina','mostrarBorde','numPaginas'];
                const obj = {};
                keys.forEach(k => obj[k] = this[k]);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
            } catch(e) { /* Sin espacio en localStorage */ }
        }
    },

    mounted() {
        this.$nextTick(() => this.redibujar());
        window.addEventListener('resize', () => this.redibujar());

        /* Atajos de teclado */
        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'p') { e.preventDefault(); this.imprimir(); }
            if (e.ctrlKey && e.key === 'e') { e.preventDefault(); this.exportarPNG(); }
        });
    }
});

app.mount('#app');
