/**
 * renderer.js - Motor de renderizado de tipos de papel
 * Renderiza los diferentes tipos de papel sobre Canvas 2D
 * Todos los comentarios en español para facilitar el mantenimiento
 */

/* ====== CONSTANTES ====== */

/* Dimensiones de papel en milímetros */
const PAPER_DIMS = {
    a4:      { w: 210,   h: 297,   label: 'A4 (210 × 297 mm)' },
    a5:      { w: 148,   h: 210,   label: 'A5 (148 × 210 mm)' },
    a3:      { w: 297,   h: 420,   label: 'A3 (297 × 420 mm)' },
    b4:      { w: 250,   h: 353,   label: 'B4 (250 × 353 mm)' },
    b5:      { w: 176,   h: 250,   label: 'B5 (176 × 250 mm)' },
    letter:  { w: 215.9, h: 279.4, label: 'Carta (8.5 × 11 in)' },
    legal:   { w: 215.9, h: 355.6, label: 'Oficio (8.5 × 14 in)' },
    tabloide:{ w: 279.4, h: 431.8, label: 'Tabloid (11 × 17 in)' }
};

/* Definiciones de temas predefinidos */
const TEMAS = {
    default:  { fondo: '#ffffff', linea: '#808080', nombre: 'Por defecto' },
    sepia:    { fondo: '#f4ecd8', linea: '#8b7355', nombre: 'Sepia' },
    pastel:   { fondo: '#f0f0ff', linea: '#b39ddb', nombre: 'Pastel' },
    noche:    { fondo: '#2d2d2d', linea: '#888888', nombre: 'Nocturno' },
    clasico:  { fondo: '#f5f0e8', linea: '#6d6d6d', nombre: 'Clásico' },
    bosque:   { fondo: '#e8f5e9', linea: '#388e3c', nombre: 'Bosque' },
    ocean:    { fondo: '#e3f2fd', linea: '#1565c0', nombre: 'Océano' },
    atardecer:{ fondo: '#fff3e0', linea: '#e65100', nombre: 'Atardecer' }
};

/* Colores rápidos predefinidos para fondo */
const COLORES_RAPIDOS = [
    '#ffffff', '#fff8e1', '#f8f9fa', '#f0f9ff',
    '#f0fdf4', '#fdf2f8', '#fffbeb', '#f3e5f5',
    '#e8f5e9', '#e3f2fd', '#fff3e0', '#fce4ec',
    '#f5f5f5', '#e0f7fa', '#fff8e7', '#f1f8e9'
];

/* ====== FUNCIÓN PRINCIPAL DE RENDERIZADO ====== */

/**
 * Renderiza el papel completo en un canvas
 * @param {HTMLCanvasElement} canvas - Elemento canvas donde dibujar
 * @param {Object} config - Configuración completa del papel
 */
function renderPaper(canvas, config) {
    if (!canvas || !config) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    /* Obtener dimensiones del papel */
    const dims = PAPER_DIMS[config.tamanioPapel] || PAPER_DIMS.a4;

    /* Calcular escala para que quepa en el contenedor */
    const contenedor = canvas.parentElement;
    const maxW = contenedor ? contenedor.clientWidth - 32 : 600;
    const maxH = window.innerHeight * 0.65;
    
    /* Relación de aspecto del papel */
    const proporcionPapel = dims.w / dims.h;
    let anchoDisponible = maxW;
    let altoDisponible = anchoDisponible / proporcionPapel;
    
    if (altoDisponible > maxH) {
        altoDisponible = maxH;
        anchoDisponible = altoDisponible * proporcionPapel;
    }
    
    const escala = Math.min(anchoDisponible / dims.w, 3);

    /* Establecer tamaño del canvas */
    const anchoCanvas = Math.round(dims.w * escala);
    const altoCanvas = Math.round(dims.h * escala);
    
    /* Solo redimensionar si cambió el tamaño para evitar parpadeo */
    if (canvas.width !== anchoCanvas || canvas.height !== altoCanvas) {
        canvas.width = anchoCanvas;
        canvas.height = altoCanvas;
    }

    /* Aplicar tema si está seleccionado */
    if (config.tema && config.tema !== 'personalizado') {
        const tema = TEMAS[config.tema];
        if (tema) {
            config.colorFondo = tema.fondo;
            if (!config.colorLineaPersonalizado) {
                config.colorLinea = tema.linea;
            }
        }
    }

    /* ---- PASO 1: Fondo ---- */
    ctx.fillStyle = config.colorFondo || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* ---- PASO 2: Imagen de fondo personalizada ---- */
    if (config.imagenFondoData) {
        drawCustomBgImage(ctx, canvas, config);
    }

    /* ---- PASO 3: Patrón de fondo ---- */
    if (config.patronFondo && config.patronFondo !== 'ninguno') {
        drawBgPattern(ctx, canvas.width, canvas.height, escala, config);
    }

    /* ---- PASO 4: Márgenes en píxeles ---- */
    const m = {
        t: (config.margenSuperior || 20) * escala,
        r: (config.margenDerecho || 15) * escala,
        b: (config.margenInferior || 20) * escala,
        l: (config.margenIzquierdo || 15) * escala
    };

    /* ---- PASO 5: Borde de la hoja ---- */
    if (config.mostrarBorde) {
        ctx.strokeStyle = config.colorLinea;
        ctx.lineWidth = Math.max(0.5, config.grosorLinea) * escala * 0.3;
        ctx.strokeRect(
            m.l, m.t,
            canvas.width - m.l - m.r,
            canvas.height - m.t - m.b
        );
    }

    /* ---- PASO 6: Renderizar tipo de papel específico ---- */
    const renderers = {
        'rayado':       drawLined,
        'cuadriculado': drawGrid,
        'puntos':       drawDot,
        'caligrafia':   drawCalligraphy,
        'kinder':       drawKinder,
        'doblelinea':   drawDoubleLine,
        'blanco':       drawBlank,
        'musica':       drawMusicStaff,
        'aritmetica':   drawArithmetic,
        'cornell':      drawCornell,
        'isometrica':   drawIsometric,
        'hexagonal':    drawHexagonal,
        'composicion':  drawComposition,
        'milimetrica':  drawMillimeter
    };

    const renderFn = renderers[config.tipoPapel] || drawBlank;
    renderFn(ctx, m, canvas.width, canvas.height, escala, config);

    /* ---- PASO 7: Marca de agua ---- */
    if (config.mostrarMarcaAgua && config.marcaAguaTexto) {
        drawWatermark(ctx, canvas.width, canvas.height, config, escala);
    }

    /* ---- PASO 9: Pie de página con número ---- */
    if (config.mostrarNumPagina) {
        drawFooter(ctx, canvas.width, canvas.height, escala, config);
    }
}

/* ====== DIBUJO DE FONDO ====== */

/**
 * Dibuja una imagen personalizada como fondo del papel
 */
function drawCustomBgImage(ctx, canvas, config) {
    try {
        const src = config.imagenFondoData;
        if (!src) return;

        /* Usar imagen cacheada o crear nueva */
        if (cacheImagenFondo.src === src && cacheImagenFondo.img) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.drawImage(cacheImagenFondo.img, 0, 0, canvas.width, canvas.height);
            ctx.restore();
            return;
        }

        const img = new Image();
        img.onload = function () {
            cacheImagenFondo = { src, img };
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            ctx.restore();
        };
        img.src = src;
    } catch (e) {
        console.warn('No se pudo cargar la imagen de fondo:', e);
    }
}

/**
 * Dibuja patrones de fondo decorativos
 */
function drawBgPattern(ctx, w, h, escala, config) {
    switch (config.patronFondo) {
        case 'cuadricula':
            drawBgGrid(ctx, w, h, escala, config);
            break;
        case 'puntos':
            drawBgDots(ctx, w, h, escala, config);
            break;
        case 'lineas':
            drawBgLines(ctx, w, h, escala, config);
            break;
        case 'cuadros':
            drawBgCrosshatch(ctx, w, h, escala, config);
            break;
    }
}

function drawBgGrid(ctx, w, h, escala, config) {
    const paso = 20 * escala;
    ctx.strokeStyle = 'rgba(0,0,0,0.04)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= w; x += paso) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += paso) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
}

function drawBgDots(ctx, w, h, escala, config) {
    const paso = 20 * escala;
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (let x = paso / 2; x <= w; x += paso) {
        for (let y = paso / 2; y <= h; y += paso) {
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawBgLines(ctx, w, h, escala, config) {
    const paso = 20 * escala;
    ctx.strokeStyle = 'rgba(0,0,0,0.04)';
    ctx.lineWidth = 0.5;
    for (let y = paso; y <= h; y += paso) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
}

function drawBgCrosshatch(ctx, w, h, escala, config) {
    const paso = 30 * escala;
    ctx.strokeStyle = 'rgba(0,0,0,0.03)';
    ctx.lineWidth = 0.5;
    for (let x = -h; x <= w + h; x += paso) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + h, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + h, 0); ctx.lineTo(x, h); ctx.stroke();
    }
}

/* ====== RENDERIZADORES POR TIPO DE PAPEL ====== */

/**
 * PAPEL RAYADO - Líneas horizontales paralelas
 * Ideal para escritura, dictados, caligrafía general
 */
function drawLined(ctx, m, w, h, escala, config) {
    const espaciado = (config.espaciadoLinea || 8) * escala;
    const color = config.colorLinea;
    const grosor = Math.max(0.3, (config.grosorLinea || 0.5)) * escala * 0.6;
    const estilo = config.estiloLinea || 'solido';
    const gap = 3 * escala;

    ctx.strokeStyle = color;

    if (estilo === 'doble') {
        ctx.lineWidth = grosor * 0.7;
        ctx.setLineDash([]);
        const inicioY = m.t + espaciado;
        const finY = h - m.b;
        for (let y = inicioY; y <= finY; y += espaciado) {
            ctx.beginPath();
            ctx.moveTo(m.l, y);
            ctx.lineTo(w - m.r, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(m.l, y + gap);
            ctx.lineTo(w - m.r, y + gap);
            ctx.stroke();
        }
    } else if (estilo === 'triple') {
        ctx.lineWidth = grosor * 0.6;
        ctx.setLineDash([]);
        const inicioY = m.t + espaciado;
        const finY = h - m.b;
        for (let y = inicioY; y <= finY; y += espaciado) {
            ctx.beginPath();
            ctx.moveTo(m.l, y);
            ctx.lineTo(w - m.r, y);
            ctx.stroke();
            ctx.setLineDash([2 * escala, 2 * escala]);
            ctx.beginPath();
            ctx.moveTo(m.l, y + gap);
            ctx.lineTo(w - m.r, y + gap);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(m.l, y + gap * 2);
            ctx.lineTo(w - m.r, y + gap * 2);
            ctx.stroke();
        }
    } else {
        ctx.lineWidth = grosor;
        ctx.setLineDash(getDashPattern(estilo, escala));
        const inicioY = m.t + espaciado;
        const finY = h - m.b;
        for (let y = inicioY; y <= finY; y += espaciado) {
            ctx.beginPath();
            ctx.moveTo(m.l, y);
            ctx.lineTo(w - m.r, y);
            ctx.stroke();
        }
    }

    ctx.setLineDash([]);
}

/**
 * PAPEL CUADRICULADO - Cuadrícula para matemáticas, gráficos
 */
function drawGrid(ctx, m, w, h, escala, config) {
    const tamCelda = (config.tamanoCelda || 10) * escala;
    const color = config.colorLinea;
    const grosor = Math.max(0.3, (config.grosorLinea || 0.5)) * escala * 0.5;
    const estilo = config.estiloLinea || 'solido';

    ctx.strokeStyle = color;
    ctx.lineWidth = grosor;
    ctx.setLineDash(getDashPattern(estilo, escala));

    const anchoUtil = w - m.l - m.r;
    const altoUtil = h - m.t - m.b;

    /* Líneas verticales */
    for (let x = m.l; x <= m.l + anchoUtil; x += tamCelda) {
        ctx.beginPath();
        ctx.moveTo(Math.round(x) + 0.5, m.t);
        ctx.lineTo(Math.round(x) + 0.5, h - m.b);
        ctx.stroke();
    }

    /* Líneas horizontales */
    for (let y = m.t; y <= m.t + altoUtil; y += tamCelda) {
        ctx.beginPath();
        ctx.moveTo(m.l, Math.round(y) + 0.5);
        ctx.lineTo(w - m.r, Math.round(y) + 0.5);
        ctx.stroke();
    }

    ctx.setLineDash([]);

    /* Líneas de borde más gruesas */
    ctx.lineWidth = grosor * 2;
    ctx.strokeRect(m.l, m.t, anchoUtil, altoUtil);
}

/**
 * PAPEL DE PUNTOS - Puntos en intersecciones de cuadrícula
 * Ideal para bullet journal, dibujo técnico
 */
function drawDot(ctx, m, w, h, escala, config) {
    const tamCelda = (config.tamanoCelda || 10) * escala;
    const color = config.colorLinea;
    const radio = Math.max(1, (config.grosorLinea || 0.5)) * escala * 0.8;

    ctx.fillStyle = color;

    const anchoUtil = w - m.l - m.r;
    const altoUtil = h - m.t - m.b;

    for (let x = m.l; x <= m.l + anchoUtil; x += tamCelda) {
        for (let y = m.t; y <= m.t + altoUtil; y += tamCelda) {
            ctx.beginPath();
            ctx.arc(Math.round(x) + 0.5, Math.round(y) + 0.5, radio, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

/**
 * PAPEL DE CALIGRAFÍA - Línea doble con guía central punteada
 * Para práctica de caligrafía infantil, letra ligada
 */
function drawCalligraphy(ctx, m, w, h, escala, config) {
    const espaciadoBase = (config.espaciadoLinea || 8) * escala;
    const color = config.colorLinea;
    const grosor = Math.max(0.3, (config.grosorLinea || 0.5)) * escala * 0.6;

    /* Altura total de un grupo de caligrafía: 3 líneas */
    const alturaGrupo = espaciadoBase * 3;

    ctx.strokeStyle = color;

    const inicioY = m.t + alturaGrupo;
    const finY = h - m.b;

    for (let y = inicioY; y <= finY; y += alturaGrupo) {
        /* Línea superior (sólida) */
        ctx.lineWidth = grosor;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(m.l, y);
        ctx.lineTo(w - m.r, y);
        ctx.stroke();

        /* Línea media (punteada - guía) */
        ctx.lineWidth = grosor * 0.7;
        ctx.setLineDash([2 * escala, 3 * escala]);
        ctx.beginPath();
        ctx.moveTo(m.l, y + espaciadoBase);
        ctx.lineTo(w - m.r, y + espaciadoBase);
        ctx.stroke();

        /* Línea inferior (sólida) */
        ctx.lineWidth = grosor;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(m.l, y + espaciadoBase * 2);
        ctx.lineTo(w - m.r, y + espaciadoBase * 2);
        ctx.stroke();
    }

    ctx.setLineDash([]);
}

/**
 * PAPEL KINDER - Sistema de 3 líneas (sólido, punteado, sólido)
 * Estilo americano para niños pequeños aprendiendo a escribir
 */
function drawKinder(ctx, m, w, h, escala, config) {
    const espaciado = (config.espaciadoLinea || 8) * escala;
    const color = config.colorLinea;
    const grosor = Math.max(0.3, (config.grosorLinea || 0.5)) * escala * 0.6;

    const alturaGrupo = espaciado * 3;

    ctx.strokeStyle = color;

    const inicioY = m.t + alturaGrupo;
    const finY = h - m.b;

    for (let y = inicioY; y <= finY; y += alturaGrupo) {
        /* Línea superior (sólida, más gruesa) */
        ctx.lineWidth = grosor * 1.3;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(m.l, y);
        ctx.lineTo(w - m.r, y);
        ctx.stroke();

        /* Línea media (punteada) */
        ctx.lineWidth = grosor * 0.8;
        ctx.setLineDash([3 * escala, 4 * escala]);
        ctx.beginPath();
        ctx.moveTo(m.l, y + espaciado);
        ctx.lineTo(w - m.r, y + espaciado);
        ctx.stroke();

        /* Línea base (sólida, más gruesa - para el descanso de letras) */
        ctx.lineWidth = grosor * 1.3;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(m.l, y + espaciado * 2);
        ctx.lineTo(w - m.r, y + espaciado * 2);
        ctx.stroke();
    }

    ctx.setLineDash([]);
}

/**
 * PAPEL DOBLE LÍNEA - Dos líneas paralelas
 * Para primeros trazos, pre-escritura
 */
function drawDoubleLine(ctx, m, w, h, escala, config) {
    const espaciado = (config.espaciadoLinea || 10) * escala;
    const color = config.colorLinea;
    const grosor = Math.max(0.3, (config.grosorLinea || 0.5)) * escala * 0.7;

    ctx.strokeStyle = color;
    ctx.lineWidth = grosor;
    ctx.setLineDash([]);

    const inicioY = m.t + espaciado;
    const finY = h - m.b;

    for (let y = inicioY; y <= finY; y += espaciado * 2) {
        ctx.beginPath();
        ctx.moveTo(m.l, y);
        ctx.lineTo(w - m.r, y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(m.l, y + espaciado);
        ctx.lineTo(w - m.r, y + espaciado);
        ctx.stroke();
    }
}

/**
 * PAPEL EN BLANCO - Sin líneas internas, solo márgenes
 */
function drawBlank(ctx, m, w, h, escala, config) {
    /* En blanco - no se dibuja nada adicional */
}

/**
 * PAPEL DE MÚSICA - Pentagramas de 5 líneas
 * Para clases de música, composición
 */
function drawMusicStaff(ctx, m, w, h, escala, config) {
    const espaciadoLinea = (config.espaciadoLinea || 3) * escala;
    const color = config.colorLinea;
    const grosor = Math.max(0.3, (config.grosorLinea || 0.5)) * escala * 0.5;

    /* Un pentagrama tiene 5 líneas separadas por espaciadoLinea */
    const alturaPentagrama = espaciadoLinea * 4;

    /* Calcular cuántos pentagramas caben con separación estándar */
    const altoUtil = h - m.t - m.b;
    const gap = alturaPentagrama;
    const slot = alturaPentagrama + gap;
    const numPentagramas = Math.max(2, Math.floor(altoUtil / slot));
    const margenExtra = (altoUtil - (numPentagramas * slot - gap)) / 2;
    const inicioY = m.t + margenExtra;

    ctx.strokeStyle = color;
    ctx.lineWidth = grosor;
    ctx.setLineDash([]);

    for (let n = 0; n < numPentagramas; n++) {
        const y = inicioY + n * slot;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(m.l, y + i * espaciadoLinea);
            ctx.lineTo(w - m.r, y + i * espaciadoLinea);
            ctx.stroke();
        }

        /* Línea vertical izquierda del pentagrama (barra inicial) */
        ctx.lineWidth = grosor * 2;
        ctx.beginPath();
        ctx.moveTo(m.l, y);
        ctx.lineTo(m.l, y + alturaPentagrama);
        ctx.stroke();

        /* Línea vertical derecha (barra final) */
        ctx.beginPath();
        ctx.moveTo(w - m.r, y);
        ctx.lineTo(w - m.r, y + alturaPentagrama);
        ctx.stroke();

        ctx.lineWidth = grosor;
    }
}

/**
 * PAPEL DE ARITMÉTICA - Cuadrícula para operaciones matemáticas
 * Con espacio para el número de problema y la operación
 */
function drawArithmetic(ctx, m, w, h, escala, config) {
    const tamCelda = (config.tamanoCelda || 10) * escala;
    const color = config.colorLinea;
    const grosor = Math.max(0.3, (config.grosorLinea || 0.5)) * escala * 0.5;

    ctx.strokeStyle = color;
    ctx.lineWidth = grosor;
    ctx.setLineDash([]);

    const anchoUtil = w - m.l - m.r;
    const altoUtil = h - m.t - m.b;

    /* Columna izquierda para número de problema */
    const anchoNumero = Math.min(30 * escala, anchoUtil * 0.1);

    /* Dibujar cuadrícula principal */
    for (let x = m.l + anchoNumero; x <= m.l + anchoUtil; x += tamCelda * 3) {
        ctx.beginPath();
        ctx.moveTo(Math.round(x) + 0.5, m.t);
        ctx.lineTo(Math.round(x) + 0.5, h - m.b);
        ctx.stroke();
    }

    for (let y = m.t; y <= m.t + altoUtil; y += tamCelda * 2) {
        ctx.beginPath();
        ctx.moveTo(m.l + anchoNumero, Math.round(y) + 0.5);
        ctx.lineTo(w - m.r, Math.round(y) + 0.5);
        ctx.stroke();
    }

    /* Separador de número de problema */
    ctx.lineWidth = grosor * 2;
    ctx.beginPath();
    ctx.moveTo(m.l + anchoNumero, m.t);
    ctx.lineTo(m.l + anchoNumero, h - m.b);
    ctx.stroke();

    /* Línea del borde exterior */
    ctx.lineWidth = grosor * 1.5;
    ctx.strokeRect(m.l, m.t, anchoUtil, altoUtil);
}

/**
 * PAPEL CORNELL - Sistema de toma de notas
 * Columna izquierda (señales/apuntes), área central (notas), área inferior (resumen)
 */
function drawCornell(ctx, m, w, h, escala, config) {
    const color = config.colorLinea;
    const grosor = Math.max(0.3, (config.grosorLinea || 0.5)) * escala * 0.6;
    const espaciado = (config.espaciadoLinea || 8) * escala;

    const anchoUtil = w - m.l - m.r;
    const altoUtil = h - m.t - m.b;

    ctx.strokeStyle = color;
    ctx.lineWidth = grosor;
    ctx.setLineDash([]);

    /* Columna izquierda (señales) - 30% del ancho */
    const anchoSenales = anchoUtil * 0.3;

    /* Línea vertical separadora */
    ctx.lineWidth = grosor * 1.2;
    ctx.beginPath();
    ctx.moveTo(m.l + anchoSenales, m.t);
    ctx.lineTo(m.l + anchoSenales, h - m.b - altoUtil * 0.2);
    ctx.stroke();

    /* Líneas horizontales en sección de notas */
    ctx.lineWidth = grosor * 0.5;
    const hastaY = h - m.b - altoUtil * 0.2;
    for (let y = m.t + espaciado; y <= hastaY; y += espaciado) {
        ctx.beginPath();
        ctx.moveTo(m.l, y);
        ctx.lineTo(w - m.r, y);
        ctx.stroke();
    }

    /* Sección inferior de resumen - 20% del alto */
    const inicioResumen = hastaY;
    ctx.lineWidth = grosor * 1.2;
    ctx.beginPath();
    ctx.moveTo(m.l, inicioResumen);
    ctx.lineTo(w - m.r, inicioResumen);
    ctx.stroke();

    /* Borde exterior */
    ctx.lineWidth = grosor * 1.5;
    ctx.strokeRect(m.l, m.t, anchoUtil, altoUtil);
}

/**
 * PAPEL ISOMÉTRICO - Cuadrícula isométrica para dibujo técnico
 */
function drawIsometric(ctx, m, w, h, escala, config) {
    const tamCelda = (config.tamanoCelda || 10) * escala;
    const color = config.colorLinea;
    const grosor = Math.max(0.3, (config.grosorLinea || 0.5)) * escala * 0.4;
    const angulo = Math.PI / 6; /* 30 grados */

    ctx.strokeStyle = color;
    ctx.lineWidth = grosor;
    ctx.setLineDash([]);

    const anchoUtil = w - m.l - m.r;
    const altoUtil = h - m.t - m.b;
    const centroX = m.l + anchoUtil / 2;
    const centroY = m.t + altoUtil / 2;

    /* Líneas inclinadas hacia la derecha (30°) */
    const paso = tamCelda * Math.cos(angulo);
    const rango = Math.max(anchoUtil, altoUtil) * 1.5;

    for (let i = -Math.ceil(rango / paso); i <= Math.ceil(rango / paso); i++) {
        const x0 = centroX + i * paso;
        const yInicio = centroY - rango;
        const yFin = centroY + rango;
        ctx.beginPath();
        ctx.moveTo(x0 + (yInicio - centroY) * Math.tan(angulo), yInicio);
        ctx.lineTo(x0 + (yFin - centroY) * Math.tan(angulo), yFin);
        ctx.stroke();
    }

    /* Líneas inclinadas hacia la izquierda (-30°) */
    for (let i = -Math.ceil(rango / paso); i <= Math.ceil(rango / paso); i++) {
        const x0 = centroX + i * paso;
        const yInicio = centroY - rango;
        const yFin = centroY + rango;
        ctx.beginPath();
        ctx.moveTo(x0 - (yInicio - centroY) * Math.tan(angulo), yInicio);
        ctx.lineTo(x0 - (yFin - centroY) * Math.tan(angulo), yFin);
        ctx.stroke();
    }

    /* Líneas verticales */
    for (let i = -Math.ceil(rango / (tamCelda * 2)); i <= Math.ceil(rango / (tamCelda * 2)); i++) {
        const x = centroX + i * tamCelda * 2;
        ctx.beginPath();
        ctx.moveTo(x, centroY - rango);
        ctx.lineTo(x, centroY + rango);
        ctx.stroke();
    }
}

/**
 * PAPEL HEXAGONAL - Cuadrícula de hexágonos
 * Para química, geometría, juegos
 */
function drawHexagonal(ctx, m, w, h, escala, config) {
    const radio = (config.tamanoCelda || 10) * escala;
    const color = config.colorLinea;
    const grosor = Math.max(0.3, (config.grosorLinea || 0.5)) * escala * 0.4;

    ctx.strokeStyle = color;
    ctx.lineWidth = grosor;
    ctx.setLineDash([]);

    /* Punto arriba → espaciado horizontal = sqrt(3)*r, vertical = 1.5*r */
    const pasoX = radio * Math.sqrt(3);
    const pasoY = radio * 1.5;

    const anchoUtil = w - m.l - m.r;
    const altoUtil = h - m.t - m.b;

    const inicioX = m.l - radio;
    const inicioY = m.t - radio;

    /* Generar hexágonos */
    for (let fila = 0; fila <= Math.ceil(altoUtil / pasoY) + 1; fila++) {
        const offsetX = (fila % 2 === 0) ? 0 : pasoX * 0.5;
        for (let columna = 0; columna <= Math.ceil(anchoUtil / pasoX) + 1; columna++) {
            const cx = inicioX + columna * pasoX + offsetX;
            const cy = inicioY + fila * pasoY;

            if (cx < m.l - radio || cx > w - m.r + radio ||
                cy < m.t - radio || cy > h - m.b + radio) continue;

            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const ang = Math.PI / 6 + i * Math.PI / 3;
                const x = cx + radio * Math.cos(ang);
                const y = cy + radio * Math.sin(ang);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }
    }
}

/**
 * PAPEL DE COMPOSICIÓN - Mitad dibujo, mitad escritura
 * Para niños: dibujan arriba y escriben abajo
 */
function drawComposition(ctx, m, w, h, escala, config) {
    const color = config.colorLinea;
    const grosor = Math.max(0.3, (config.grosorLinea || 0.5)) * escala * 0.6;
    const espaciado = (config.espaciadoLinea || 8) * escala;

    const anchoUtil = w - m.l - m.r;
    const altoUtil = h - m.t - m.b;

    /* División 40% dibujo / 60% escritura */
    const altoDibujo = altoUtil * 0.4;
    const inicioEscritura = m.t + altoDibujo;

    /* Línea de separación */
    ctx.strokeStyle = color;
    ctx.lineWidth = grosor * 1.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(m.l, inicioEscritura);
    ctx.lineTo(w - m.r, inicioEscritura);
    ctx.stroke();

    /* Área de escritura - líneas horizontales */
    ctx.lineWidth = grosor * 0.6;
    for (let y = inicioEscritura + espaciado; y <= h - m.b; y += espaciado) {
        ctx.beginPath();
        ctx.moveTo(m.l, y);
        ctx.lineTo(w - m.r, y);
        ctx.stroke();
    }

    /* Borde exterior */
    ctx.lineWidth = grosor * 1.2;
    ctx.strokeRect(m.l, m.t, anchoUtil, altoUtil);
}

/**
 * PAPEL MILIMÉTRICO - Cuadrícula fina (1mm)
 * Para dibujo técnico, gráficos detallados
 */
function drawMillimeter(ctx, m, w, h, escala, config) {
    const color = config.colorLinea;
    const grosor = Math.max(0.2, (config.grosorLinea || 0.3)) * escala * 0.3;

    const anchoUtil = w - m.l - m.r;
    const altoUtil = h - m.t - m.b;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.setLineDash([]);

    /* Líneas finas cada 1mm */
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = grosor * 0.5;
    const paso = 1 * escala;

    for (let x = m.l; x <= m.l + anchoUtil; x += paso) {
        ctx.beginPath();
        ctx.moveTo(Math.round(x) + 0.5, m.t);
        ctx.lineTo(Math.round(x) + 0.5, h - m.b);
        ctx.stroke();
    }

    for (let y = m.t; y <= m.t + altoUtil; y += paso) {
        ctx.beginPath();
        ctx.moveTo(m.l, Math.round(y) + 0.5);
        ctx.lineTo(w - m.r, Math.round(y) + 0.5);
        ctx.stroke();
    }

    /* Líneas gruesas cada 10mm */
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = grosor * 2;
    const pasoGrueso = 10 * escala;

    for (let x = m.l; x <= m.l + anchoUtil; x += pasoGrueso) {
        ctx.beginPath();
        ctx.moveTo(Math.round(x) + 0.5, m.t);
        ctx.lineTo(Math.round(x) + 0.5, h - m.b);
        ctx.stroke();
    }

    for (let y = m.t; y <= m.t + altoUtil; y += pasoGrueso) {
        ctx.beginPath();
        ctx.moveTo(m.l, Math.round(y) + 0.5);
        ctx.lineTo(w - m.r, Math.round(y) + 0.5);
        ctx.stroke();
    }

    /* Borde exterior */
    ctx.lineWidth = grosor * 3;
    ctx.strokeRect(m.l, m.t, anchoUtil, altoUtil);

    ctx.restore();
}

/* ====== MARCA DE AGUA ====== */

/**
 * Dibuja una marca de agua en el centro del papel
 */
function drawWatermark(ctx, w, h, config, escala) {
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = config.colorLinea;
    ctx.font = `bold ${Math.min(60, 40 * escala)}px "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    /* Rotar 45 grados */
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.fillText(config.marcaAguaTexto, 0, 0);

    ctx.restore();
}

/* ====== PIE DE PÁGINA ====== */

/**
 * Dibuja el pie de página con número de página
 */
function drawFooter(ctx, w, h, escala, config) {
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = config.colorLinea;
    const fontSize = Math.max(8, 9 * escala);
    ctx.font = `${fontSize}px "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    const numPagina = config.numeroPagina || 1;
    ctx.fillText(String(numPagina), w / 2, h - 5 * escala);
    ctx.restore();
}

/* ====== CACHÉ DE IMAGEN DE FONDO ====== */
let cacheImagenFondo = { src: null, img: null };

/* ====== FUNCIONES AUXILIARES ====== */

/**
 * Obtiene el patrón de guiones para el estilo de línea
 */
function getDashPattern(estilo, escala) {
    switch (estilo) {
        case 'guiones': return [4 * escala, 3 * escala];
        case 'puntos':  return [1 * escala, 3 * escala];
        default:        return [];
    }
}

/**
 * Convierte mm a píxeles a una escala dada
 */
function mmToPx(mm, escala) {
    return mm * escala;
}

/**
 * Calcula la escala óptima para que el papel quepa en un contenedor
 */
function calcularEscalaPreview(contenedorAncho, contenedorAlto, papelW, papelH) {
    const escalaX = contenedorAncho / papelW;
    const escalaY = contenedorAlto / papelH;
    return Math.min(escalaX, escalaY, 2.5);
}

/**
 * Renderiza el papel a alta resolución para exportación
 * @param {Object} config - Configuración del papel  
 * @param {number} dpi - Resolución en puntos por pulgada
 * @returns {HTMLCanvasElement} Canvas con el papel renderizado
 */
function renderPaperHighRes(config, dpi = 300) {
    const dims = PAPER_DIMS[config.tamanioPapel] || PAPER_DIMS.a4;
    const pxPorMm = dpi / 25.4;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(dims.w * pxPorMm);
    canvas.height = Math.round(dims.h * pxPorMm);

    const ctx = canvas.getContext('2d');
    const escala = pxPorMm;
    const w = canvas.width;
    const h = canvas.height;
    const m = {
        t: (config.margenSuperior || 20) * escala,
        r: (config.margenDerecho || 15) * escala,
        b: (config.margenInferior || 20) * escala,
        l: (config.margenIzquierdo || 15) * escala
    };

    /* Fondo */
    ctx.fillStyle = config.colorFondo || '#ffffff';
    ctx.fillRect(0, 0, w, h);

    /* Imagen de fondo personalizada */
    if (config.imagenFondoData) {
        drawCustomBgImage(ctx, canvas, config);
    }

    /* Patrón */
    if (config.patronFondo && config.patronFondo !== 'ninguno') {
        drawBgPattern(ctx, w, h, escala, config);
    }

    /* Renderizar tipo de papel */
    const renderers = {
        'rayado':       drawLined,
        'cuadriculado': drawGrid,
        'puntos':       drawDot,
        'caligrafia':   drawCalligraphy,
        'kinder':       drawKinder,
        'doblelinea':   drawDoubleLine,
        'blanco':       drawBlank,
        'musica':       drawMusicStaff,
        'aritmetica':   drawArithmetic,
        'cornell':      drawCornell,
        'isometrica':   drawIsometric,
        'hexagonal':    drawHexagonal,
        'composicion':  drawComposition,
        'milimetrica':  drawMillimeter
    };

    const renderFn = renderers[config.tipoPapel] || drawBlank;
    renderFn(ctx, m, w, h, escala, config);

    /* Marca de agua */
    if (config.mostrarMarcaAgua && config.marcaAguaTexto) {
        drawWatermark(ctx, w, h, config, escala);
    }

    /* Número */
    if (config.mostrarNumPagina) {
        drawFooter(ctx, w, h, escala, config);
    }

    return canvas;
}

/* Exportar funciones para uso global */
window.renderer = {
    renderPaper,
    renderPaperHighRes,
    PAPER_DIMS,
    TEMAS,
    COLORES_RAPIDOS
};
