// ==========================================
// COMUN.JS - Piezas compartidas por todas las pantallas
// REG Marketing S.A.S - Sistema de Producción
// Las claves de tallas y áreas son EXACTAMENTE las mismas que usa database.js y la base de datos.
// ==========================================

(function () {
    // ---------- Áreas de producción ----------
    const AREAS = {
        corte:       { nombre: 'Corte',        largo: 'Área de Corte',        icono: 'cut',           sub: 'Tela y patrones',       color: '#1565C0', campos: ['tela', 'ancho', 'molde', 'tipoPrenda'] },
        confeccion:  { nombre: 'Confección',   largo: 'Área de Confección',   icono: 'tshirt',        sub: 'Ensamble de prendas',   color: '#2E7D32', campos: ['cuello', 'colorCuello', 'dobladillo', 'anchoBies', 'tipoPrenda'] },
        impresion:   { nombre: 'Impresión',    largo: 'Área de Impresión',    icono: 'print',         sub: 'Para sublimado',        color: '#6A1B9A', campos: ['impresora', 'arte', 'tipoPrenda'] },
        sublimacion: { nombre: 'Sublimación',  largo: 'Área de Sublimación',  icono: 'fill-drip',     sub: 'Transferencia térmica', color: '#E65100', campos: ['impresora', 'tela', 'arte', 'tipoPrenda'] },
        dtf:         { nombre: 'DTF',          largo: 'Área DTF',             icono: 'layer-group',   sub: 'Transfer directo',      color: '#00838F', campos: ['arte', 'tipoPrenda'] },
        estampado:   { nombre: 'Estampado',    largo: 'Área de Estampado',    icono: 'stamp',         sub: 'Serigrafía',            color: '#AD1457', campos: ['arte', 'tipoPrenda'] },
        corteLaser:  { nombre: 'Corte Láser',  largo: 'Área Corte Láser',     icono: 'crosshairs',    sub: 'Corte de precisión',    color: '#4527A0', campos: ['tipoPrenda', 'molde', 'ancho'] },
        despacho:    { nombre: 'Despacho',     largo: 'Área de Despacho',     icono: 'shipping-fast', sub: 'Empaque y envío',       color: '#37474F', campos: ['cliente', 'fechaEntrega', 'marquilla', 'tipoPrenda'] },
    };
    // Orden en que la prenda pasa por la planta. Bordado se pide pero no se sigue por área (como siempre).
    const ORDEN_AREAS = ['corte', 'impresion', 'sublimacion', 'dtf', 'estampado', 'corteLaser', 'confeccion', 'despacho'];
    const REQUERIMIENTOS = [...ORDEN_AREAS, 'bordado'];
    const NOMBRE_REQ = { ...Object.fromEntries(Object.entries(AREAS).map(([k, v]) => [k, v.nombre])), bordado: 'Bordado' };

    // ---------- Tallas ----------
    const NINO = ['4', '6', '8', '10', '12', '14', '16'];
    const grupo = (id, titulo, color, pares) => ({ id, titulo, color, tallas: pares.map((p) => (Array.isArray(p) ? { clave: p[0], etiqueta: p[1] } : { clave: p, etiqueta: p })) });
    const conPrefijo = (pre, lista) => lista.map((t) => [`${pre}-${t}`, t]);
    const GRUPOS_TALLAS = {
        infantil:       grupo('infantil', 'Infantil', '#2E7D32', ['2T', '3T', '4T', '5T', '2', '4', '6', '8', '10', '12', '14', '16']),
        adulto:         grupo('adulto', 'Adulto / Caballero', '#1565C0', ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']),
        dama:           grupo('dama', 'Dama', '#AD1457', conPrefijo('DA', ['XS', 'S', 'M', 'L', 'XL', '2XL'])),
        pantalonMujer:  grupo('pantalonMujer', 'Pantalón mujer', '#C2185B', conPrefijo('PM', ['4', '6', '8', '10', '12', '14', '16', '18', '20', '22'])),
        pantalonHombre: grupo('pantalonHombre', 'Pantalón hombre', '#1565C0', conPrefijo('PH', ['26', '28', '30', '32', '34', '36', '38', '40', '42', '44'])),
        pantalonetas:   grupo('pantalonetas', 'Pantalonetas', '#E65100', conPrefijo('PT', ['S', 'M', 'L', 'XL'])),
        pijamas:        grupo('pijamas', 'Pijamas', '#6A1B9A', conPrefijo('PJ', ['S', 'M', 'L', 'XL'])),
        sudaderas:      grupo('sudaderas', 'Sudaderas / Joggers', '#455A64', conPrefijo('SD', ['S', 'M', 'L', 'XL'])),
        chaquetas:      grupo('chaquetas', 'Chaquetas', '#5D4037', conPrefijo('CH', ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'])),
        PTN: grupo('PTN', 'Pantalonetas niño', '#E65100', conPrefijo('PTN', NINO)),
        PJN: grupo('PJN', 'Pijamas niño', '#6A1B9A', conPrefijo('PJN', NINO)),
        SDN: grupo('SDN', 'Sudaderas / Joggers niño', '#455A64', conPrefijo('SDN', NINO)),
        CHN: grupo('CHN', 'Chaquetas niño', '#5D4037', conPrefijo('CHN', NINO)),
        PN:  grupo('PN', 'Pantalón niño', '#2E7D32', conPrefijo('PN', NINO)),
        TPN: grupo('TPN', 'Top niña', '#AD1457', conPrefijo('TPN', NINO)),
    };
    // Qué tablas de tallas lleva cada tipo (mismo criterio que la versión anterior, ahora en un solo lugar).
    const TIPOS_TALLAS = {
        'infantil-caballero-dama': ['infantil', 'adulto', 'dama'],
        'infantil-adulto':         ['infantil', 'adulto'],
        'pantalon-mujer-hombre':   ['pantalonMujer', 'pantalonHombre', 'PN'],
        'pantalonetas':            ['pantalonetas', 'PTN'],
        'pijamas':                 ['pijamas', 'PJN'],
        'sudaderas':               ['sudaderas', 'SDN'],
        'chaquetas':               ['chaquetas', 'CHN'],
        'solo-dama':               ['dama', 'TPN'],
    };
    const TODAS_LAS_TALLAS = Object.values(GRUPOS_TALLAS).flatMap((g) => g.tallas.map((t) => t.clave));

    // ---------- Tipos de prenda ----------
    // campos: qué especificaciones técnicas se piden. tallas: tipo de tallas, o 'cantidad' para unidades sueltas.
    const P = (tallas, campos) => ({ tallas, campos });
    const TODO = ['tela', 'cuello', 'colorCuello', 'molde', 'ancho', 'dobladillo', 'anchoBies', 'marquilla'];
    const PRENDAS = {
        'Camiseta':           P('infantil-caballero-dama', TODO),
        'Camiseta Polo':      P('infantil-caballero-dama', TODO),
        'Blusa':              P('infantil-adulto', TODO),
        'Camisa Manga Corta': P('infantil-adulto', TODO),
        'Camisa Manga Larga': P('infantil-adulto', TODO),
        'Camisa':             P('infantil-adulto', TODO), // órdenes antiguas
        'Pijama':             P('pijamas', ['tela', 'molde', 'ancho', 'marquilla']),
        'Chaqueta':           P('chaquetas', ['tela', 'molde', 'marquilla']),
        'Buzo':               P('infantil-adulto', TODO),
        'Top':                P('solo-dama', TODO),
        'Pantaloneta':        P('pantalonetas', ['tela', 'molde', 'marquilla']),
        'Jeans':              P('pantalon-mujer-hombre', ['tela', 'molde', 'marquilla']),
        'Pantalón':           P('pantalon-mujer-hombre', ['tela', 'molde', 'marquilla']),
        'Sudadera':           P('sudaderas', ['tela', 'molde', 'marquilla']),
        'Jogger':             P('sudaderas', ['tela', 'molde', 'marquilla']),
        'Totebag':            P('cantidad', ['tela']),
        'Tula':               P('cantidad', ['tela']),
        'Mochila':            P('cantidad', ['tela']),
        'Gorra':              P('cantidad', []),
        'Toalla':             P('cantidad', ['tela', 'ancho']),
        'Manga':              P('cantidad', ['tela', 'ancho']),
        'Delantal':           P('cantidad', ['tela']),
        'Capa de Barberia':   P('cantidad', ['tela']),
        'Visera':             P('cantidad', []),
        'Bandera':            P('cantidad', ['tela', 'ancho']),
        'Gorro de Cocina':    P('cantidad', ['tela']),
        'Mug':                P('cantidad', []),
    };
    const MENU_PRENDAS = [
        ['Prendas con tallas', ['Camiseta', 'Camiseta Polo', 'Blusa', 'Camisa Manga Corta', 'Camisa Manga Larga', 'Pijama', 'Chaqueta', 'Buzo', 'Top']],
        ['Pantalones', ['Pantaloneta', 'Jeans', 'Sudadera', 'Jogger']],
        ['Accesorios (cantidad)', ['Totebag', 'Tula', 'Mochila', 'Gorra', 'Toalla', 'Manga', 'Delantal', 'Capa de Barberia', 'Visera', 'Bandera', 'Gorro de Cocina', 'Mug']],
    ];
    const NOMBRE_PRENDA = { 'Camiseta Polo': 'Camiseta tipo polo', 'Capa de Barberia': 'Capa de barbería' };

    // Opciones de las listas (los valores guardados son los de siempre).
    const OPCIONES = {
        impresora: [['', 'Seleccionar…'], ['EPSON', 'EPSON'], ['KAROLG', 'KAROLG'], ['GRAFTECK', 'GRAFTECK'], ['OTRA', 'OTRA']],
        tela: [['', 'Seleccionar…'], ['PIEL-DURAZNO', 'Piel durazno'], ['SUDAFRICA', 'Sudáfrica'], ['Otra', 'Otra…']],
        molde: [['', 'Seleccionar…'], ['Normal', 'Normal'], ['Encogimiento', 'Encogimiento'], ['Talla Arriba', 'Talla arriba'], ['Otro', 'Otro…']],
        cuello: [['', 'Seleccionar…'], ['Redondo', 'Redondo'], ['V', 'En V'], ['Sublimado', 'Sublimado'], ['Polo', 'Polo']],
        dobladillo: [['', 'Seleccionar…'], ['En Manga', 'En manga'], ['En Bies', 'En bies'], ['Ambos', 'Ambos (manga y bies)']],
        marquilla: [['', 'Seleccionar…'], ['REG', 'SCHUSTER'], ['Sin marquilla', 'Sin marquilla'], ['Otra', 'Otra (personalizada)…']],
    };
    const ETIQUETA_CAMPO = {
        cliente: 'Cliente', fechaEntrega: 'Entrega', tipoPrenda: 'Prenda', cuello: 'Cuello', colorCuello: 'Color de cuello',
        tela: 'Tela', ancho: 'Ancho', molde: 'Molde', dobladillo: 'Dobladillo', anchoBies: 'Ancho bies', impresora: 'Impresora',
        arte: 'Arte / diseño', marquilla: 'Marquilla',
    };
    // Muestra el valor guardado con su nombre bonito ("REG" → "SCHUSTER", "PIEL-DURAZNO" → "Piel durazno").
    function valorCampo(campo, valor) {
        if (!valor) return '';
        if (campo === 'fechaEntrega') return fechaLarga(valor);
        const op = (OPCIONES[campo] || []).find(([v]) => v === valor);
        return op ? op[1].replace('…', '') : valor;
    }

    // ---------- Utilidades ----------
    const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const hoyISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
    function diasPara(fecha) {
        if (!fecha) return null;
        const f = new Date(`${fecha}T12:00:00`); f.setHours(0, 0, 0, 0);
        const h = new Date(); h.setHours(0, 0, 0, 0);
        return Math.round((f - h) / 86400000);
    }
    // Urgencia de entrega: misma regla que el dashboard anterior (vencida, hoy, ≤3 días, en tiempo).
    function urgencia(fecha) {
        const d = diasPara(fecha);
        if (d === null) return { clase: 'tiempo', texto: 'Sin fecha', dias: 9999 };
        if (d < 0) return { clase: 'vencida', texto: d === -1 ? 'Venció ayer' : `Vencida hace ${-d} días`, corto: `${-d}d vencida`, dias: d };
        if (d === 0) return { clase: 'hoy', texto: 'Se entrega hoy', corto: 'Hoy', dias: d };
        if (d <= 3) return { clase: 'pronto', texto: d === 1 ? 'Se entrega mañana' : `Faltan ${d} días`, corto: d === 1 ? 'Mañana' : `${d} días`, dias: d };
        return { clase: 'tiempo', texto: `Faltan ${d} días`, corto: `${d} días`, dias: d };
    }
    const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const MESES_L = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    function fechaCorta(fecha) {
        if (!fecha) return '—';
        const [y, m, d] = String(fecha).slice(0, 10).split('-').map(Number);
        return `${d} ${MESES[m - 1]}${y !== new Date().getFullYear() ? ` ${y}` : ''}`;
    }
    function fechaLarga(fecha) {
        if (!fecha) return '—';
        const [y, m, d] = String(fecha).slice(0, 10).split('-').map(Number);
        return `${d} de ${MESES_L[m - 1]} de ${y}`;
    }
    function totalOrden(orden) {
        if (orden.cantidadTotal) return parseInt(orden.cantidadTotal) || 0;
        return Object.values(orden.tallas || {}).reduce((s, v) => s + (parseInt(v) || 0), 0);
    }
    // Áreas que la orden debe pasar (sin bordado, que no se sigue por área).
    const areasDe = (orden) => ORDEN_AREAS.filter((a) => orden.requerimientos && orden.requerimientos[a]);
    const estadoArea = (orden, a) => (orden.estado && orden.estado[a]) || 'pendiente';
    function resumenOrden(orden) {
        const areas = areasDe(orden);
        const hechas = areas.filter((a) => estadoArea(orden, a) === 'completado').length;
        const enCurso = areas.some((a) => estadoArea(orden, a) === 'en-proceso');
        const estado = areas.length && hechas === areas.length ? 'lista' : enCurso || hechas > 0 ? 'proceso' : 'pendiente';
        return { areas, hechas, total: areas.length, estado, pct: areas.length ? Math.round((hechas / areas.length) * 100) : 0 };
    }
    // Grupos de tallas con cantidad (para ver la orden y el progreso).
    function gruposConCantidad(orden) {
        return Object.values(GRUPOS_TALLAS)
            .map((g) => ({ ...g, tallas: g.tallas.map((t) => ({ ...t, cantidad: parseInt(orden.tallas?.[t.clave]) || 0 })).filter((t) => t.cantidad > 0) }))
            .filter((g) => g.tallas.length);
    }

    // ---------- Sesión ----------
    function exigirSesion(tipo) {
        const jefe = sessionStorage.getItem('jefeAutenticado') === 'true';
        const trabajador = sessionStorage.getItem('trabajadorAutenticado') === 'true';
        const ok = tipo === 'jefe' ? jefe : jefe || trabajador;
        if (!ok) {
            location.replace('index.html');
            throw new Error('Sin sesión');
        }
        return { jefe, trabajador };
    }
    function cerrarSesion() {
        sessionStorage.removeItem('jefeAutenticado');
        sessionStorage.removeItem('trabajadorAutenticado');
        sessionStorage.removeItem('trabajadorActivo');
        localStorage.removeItem('areaTrabajoActual');
        location.href = 'index.html';
    }
    // Volver con el botón "atrás" del navegador muestra datos frescos.
    window.addEventListener('pageshow', (e) => { if (e.persisted) location.reload(); });

    // ---------- Avisos ----------
    function aviso(mensaje, tipo = 'ok', ms = 3200) {
        let pila = document.getElementById('pilaAvisos');
        if (!pila) {
            pila = document.createElement('div');
            pila.id = 'pilaAvisos';
            pila.className = 'avisos';
            pila.setAttribute('aria-live', 'polite');
            document.body.appendChild(pila);
        }
        const iconos = { ok: 'check-circle', error: 'circle-exclamation', info: 'circle-info', alerta: 'triangle-exclamation' };
        const el = document.createElement('div');
        el.className = `aviso aviso--${tipo}`;
        el.innerHTML = `<i class="fas fa-${iconos[tipo] || 'circle-info'}"></i><span>${esc(mensaje)}</span>`;
        pila.appendChild(el);
        while (pila.children.length > 3) pila.firstChild.remove();
        setTimeout(() => { el.classList.add('saliendo'); setTimeout(() => el.remove(), 250); }, ms);
    }

    // Ventana de confirmación. Devuelve una promesa con true/false.
    function confirmar({ titulo, texto = '', si = 'Aceptar', no = 'Cancelar', peligro = false, icono = 'circle-question' }) {
        return new Promise((resolve) => {
            const fondo = document.createElement('div');
            fondo.className = 'modal-fondo';
            fondo.innerHTML = `
                <div class="modal modal--chico" role="dialog" aria-modal="true" aria-labelledby="mTitulo">
                    <div class="modal__icono ${peligro ? 'modal__icono--peligro' : ''}"><i class="fas fa-${icono}"></i></div>
                    <h2 id="mTitulo">${esc(titulo)}</h2>
                    ${texto ? `<p class="modal__texto">${texto}</p>` : ''}
                    <div class="modal__acciones">
                        <button type="button" class="btn btn--suave" data-r="0">${esc(no)}</button>
                        <button type="button" class="btn ${peligro ? 'btn--peligro' : 'btn--primario'}" data-r="1">${esc(si)}</button>
                    </div>
                </div>`;
            const cerrar = (r) => { fondo.remove(); document.removeEventListener('keydown', tecla); resolve(r); };
            const tecla = (e) => { if (e.key === 'Escape') cerrar(false); };
            fondo.addEventListener('click', (e) => {
                if (e.target === fondo) cerrar(false);
                const b = e.target.closest('[data-r]');
                if (b) cerrar(b.dataset.r === '1');
            });
            document.addEventListener('keydown', tecla);
            document.body.appendChild(fondo);
            fondo.querySelector('[data-r="1"]').focus();
        });
    }

    // Visor de imágenes a pantalla completa.
    function verImagen(src, titulo = '') {
        const fondo = document.createElement('div');
        fondo.className = 'visor';
        fondo.innerHTML = `
            <figure class="visor__fig">
                <img src="${esc(src)}" alt="${esc(titulo || 'Imagen')}">
                ${titulo ? `<figcaption>${esc(titulo)}</figcaption>` : ''}
            </figure>
            <button type="button" class="visor__cerrar" aria-label="Cerrar"><i class="fas fa-xmark"></i></button>`;
        const cerrar = () => { fondo.remove(); document.removeEventListener('keydown', tecla); };
        const tecla = (e) => { if (e.key === 'Escape') cerrar(); };
        fondo.addEventListener('click', (e) => { if (e.target === fondo || e.target.closest('.visor__cerrar')) cerrar(); });
        document.addEventListener('keydown', tecla);
        document.body.appendChild(fondo);
    }
    // Cualquier elemento con data-ver-imagen abre el visor (evita meter URLs dentro de onclick).
    document.addEventListener('click', (e) => {
        const el = e.target.closest('[data-ver-imagen]');
        if (el) { e.preventDefault(); verImagen(el.dataset.verImagen, el.dataset.titulo || ''); }
    });

    // Comprime una imagen y la sube al Storage. Si el Storage falla, la deja en base64 como antes.
    function prepararImagen(file, carpeta, max = 1200) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    let w = img.width, h = img.height;
                    if (w > max || h > max) {
                        if (w > h) { h = Math.round((h * max) / w); w = max; } else { w = Math.round((w * max) / h); h = max; }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = w; canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); // los PNG transparentes no quedan negros en JPG
                    ctx.drawImage(img, 0, 0, w, h);
                    canvas.toBlob(async (blob) => {
                        const archivo = new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
                        const r = await window.DB.subirImagen(archivo, carpeta);
                        resolve({ url: r.success ? r.url : canvas.toDataURL('image/jpeg', 0.82), subida: r.success, kb: Math.round(blob.size / 1024) });
                    }, 'image/jpeg', 0.82);
                };
                img.onerror = () => resolve(null);
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Encabezado con logo, para las páginas del jefe.
    function encabezado({ titulo, subtitulo = '', activo = '', acciones = '' }) {
        const nav = [
            ['inicio.html', 'house', 'Inicio', 'inicio'],
            ['dashboard-jefe.html', 'table-columns', 'Producción', 'dashboard'],
            ['crear-orden.html', 'plus', 'Nueva orden', 'crear'],
            ['tablet-areas.html', 'tablet-screen-button', 'Áreas', 'areas'],
        ];
        return `
            <header class="barra">
                <div class="barra__fila">
                    <a class="marca" href="inicio.html" aria-label="Inicio">
                        <span class="marca__logo"><img src="logo.png" alt=""></span>
                        <span class="marca__texto"><b>REG Marketing</b><small>Producción</small></span>
                    </a>
                    <nav class="barra__nav" aria-label="Principal">
                        ${nav.map(([href, ic, txt, id]) => `<a href="${href}" class="${activo === id ? 'activo' : ''}"><i class="fas fa-${ic}"></i><span>${txt}</span></a>`).join('')}
                    </nav>
                    <button type="button" class="barra__salir" data-cerrar-sesion title="Cerrar sesión"><i class="fas fa-right-from-bracket"></i><span>Salir</span></button>
                </div>
                <div class="barra__titulo">
                    <div><h1>${esc(titulo)}</h1>${subtitulo ? `<p>${subtitulo}</p>` : ''}</div>
                    ${acciones ? `<div class="barra__acciones">${acciones}</div>` : ''}
                </div>
            </header>`;
    }
    document.addEventListener('click', (e) => { if (e.target.closest('[data-cerrar-sesion]')) cerrarSesion(); });

    // Burbujas suaves en las zonas azules: franja de arriba, inicio de sesión y selector de áreas
    const BURBUJAS = [[80, 7, 20, 0], [30, 20, 14, 3], [55, 63, 18, 6], [120, 80, 25, 1], [22, 45, 12, 8], [65, 33, 21, 4]];
    function burbujas() {
        document.querySelectorAll('.barra, .lado, .selector').forEach((zona) => {
            if (zona.querySelector(':scope > .burbujas')) return;
            if (getComputedStyle(zona).position === 'static') zona.style.position = 'relative';
            zona.style.overflow = 'hidden';
            const capa = document.createElement('div');
            capa.className = 'burbujas';
            capa.setAttribute('aria-hidden', 'true');
            capa.innerHTML = BURBUJAS.map(([t, x, d, r]) => `<span style="width:${t}px;height:${t}px;left:${x}%;animation-duration:${d}s;animation-delay:-${r}s"></span>`).join('');
            zona.prepend(capa);
            const medir = () => capa.style.setProperty('--alto', zona.offsetHeight + 'px');
            medir();
            if (window.ResizeObserver) new ResizeObserver(medir).observe(zona);
        });
    }
    document.addEventListener('DOMContentLoaded', burbujas);
    window.addEventListener('load', burbujas);
    setTimeout(burbujas, 300);

    window.REG = {
        AREAS, ORDEN_AREAS, REQUERIMIENTOS, NOMBRE_REQ, GRUPOS_TALLAS, TIPOS_TALLAS, TODAS_LAS_TALLAS, NINO,
        PRENDAS, MENU_PRENDAS, NOMBRE_PRENDA, OPCIONES, ETIQUETA_CAMPO,
        esc, hoyISO, diasPara, urgencia, fechaCorta, fechaLarga, totalOrden, areasDe, estadoArea, resumenOrden, gruposConCantidad, valorCampo,
        exigirSesion, cerrarSesion, aviso, confirmar, verImagen, prepararImagen, encabezado,
    };
})();
