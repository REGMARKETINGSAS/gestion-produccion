/* Gráficas del panel del jefe: "¿Cómo vamos?"
 * Todo se calcula en el navegador con las órdenes activas y el historial que ya se leen.
 * No escribe nada en la base. Gráficas en SVG propio (no requiere librerías). */
(function () {
    const { esc, AREAS, ORDEN_AREAS, totalOrden, areasDe, estadoArea, resumenOrden, diasPara } = REG;
    const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    const C = { pendiente: '#B0BEC5', proceso: '#F59E0B', lista: '#43A047', vencida: '#D32F2F', azul: '#1565C0', celeste: '#4FC3F7', suave: '#E3F0FD' };
    const fmt = (n) => Number(n || 0).toLocaleString('es-CO');

    const colProgreso = (a) => (a === 'corteLaser' ? 'progreso_corte_laser' : `progreso_${a}`);
    // Fracción terminada de una orden en un área (0 a 1)
    function avanceArea(o, a) {
        if (estadoArea(o, a) === 'completado') return 1;
        const total = totalOrden(o);
        if (!total) return 0;
        const hecho = Object.values(o[colProgreso(a)] || {}).reduce((s, v) => s + (parseInt(v) || 0), 0);
        return Math.min(1, hecho / total);
    }
    const fechaLocal = (iso) => {
        const d = new Date(iso);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    const lunesDe = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };

    // ---------- Piezas SVG ----------
    function dona(pct, color, etiqueta) {
        const r = 52, c = 2 * Math.PI * r, v = Math.max(0, Math.min(100, pct));
        return `<svg viewBox="0 0 130 130" class="g-dona" role="img" aria-label="${esc(etiqueta)}: ${v}%">
            <circle cx="65" cy="65" r="${r}" fill="none" stroke="#EDF2F7" stroke-width="14"/>
            <circle cx="65" cy="65" r="${r}" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round"
                stroke-dasharray="${(c * v) / 100} ${c}" transform="rotate(-90 65 65)"/>
            <text x="65" y="63" text-anchor="middle" class="g-dona__num">${v}%</text>
            <text x="65" y="84" text-anchor="middle" class="g-dona__txt">${esc(etiqueta)}</text>
        </svg>`;
    }

    // Columnas verticales. datos: [{ etiqueta, sub, valor, color, titulo, destacar }]
    function columnas(datos, { alto = 170, unidad = '', ancho = 600 } = {}) {
        const max = Math.max(1, ...datos.map((d) => d.valor));
        const n = datos.length, izq = 8, der = 8, arriba = 22, abajo = 34;
        const paso = (ancho - izq - der) / n, barra = Math.min(38, paso * 0.62);
        const h = alto - arriba - abajo;
        const lineas = [0.5, 1].map((f) => `<line x1="${izq}" x2="${ancho - der}" y1="${arriba + h - h * f}" y2="${arriba + h - h * f}" class="g-guia"/>`).join('');
        const barras = datos.map((d, i) => {
            const x = izq + paso * i + (paso - barra) / 2;
            const bh = d.valor ? Math.max(3, (d.valor / max) * h) : 0;
            const y = arriba + h - bh;
            return `<g><title>${esc(d.titulo || `${d.etiqueta}: ${fmt(d.valor)} ${unidad}`)}</title>
                ${d.destacar ? `<rect x="${izq + paso * i + 2}" y="${arriba - 16}" width="${paso - 4}" height="${h + 16 + abajo - 4}" rx="8" class="g-destacar"/>` : ''}
                <rect x="${x}" y="${arriba + h - 0.5}" width="${barra}" height="1" fill="#E2E8F0"/>
                ${bh ? `<rect x="${x}" y="${y}" width="${barra}" height="${bh}" rx="5" fill="${d.color || C.azul}"/>` : ''}
                ${d.valor ? `<text x="${x + barra / 2}" y="${y - 6}" text-anchor="middle" class="g-valor">${fmt(d.valor)}</text>` : ''}
                <text x="${x + barra / 2}" y="${alto - 18}" text-anchor="middle" class="g-eje">${esc(d.etiqueta)}</text>
                ${d.sub ? `<text x="${x + barra / 2}" y="${alto - 5}" text-anchor="middle" class="g-eje g-eje--sub">${esc(d.sub)}</text>` : ''}
            </g>`;
        }).join('');
        return `<svg viewBox="0 0 ${ancho} ${alto}" class="g-col" role="img">${lineas}${barras}</svg>`;
    }

    // Barras horizontales apiladas (HTML): filas [{ nombre, icono, color, partes:[{valor,color,titulo}], dato }]
    function barrasH(filas, { max } = {}) {
        const m = max || Math.max(1, ...filas.map((f) => f.partes.reduce((s, p) => s + p.valor, 0)));
        return `<div class="g-barras">${filas.map((f) => {
            const tot = f.partes.reduce((s, p) => s + p.valor, 0);
            return `<div class="g-barra">
                <span class="g-barra__nom">${f.icono ? `<i class="fas fa-${f.icono}" style="color:${f.color}"></i>` : ''}${esc(f.nombre)}</span>
                <span class="g-barra__pista" title="${esc(f.titulo || '')}">${f.partes.filter((p) => p.valor).map((p) => `<span style="width:${(p.valor / m) * 100}%;background:${p.color}" title="${esc(p.titulo || '')}"></span>`).join('')}</span>
                <span class="g-barra__dato">${f.dato != null ? f.dato : fmt(tot)}</span>
            </div>`;
        }).join('')}</div>`;
    }

    const leyenda = (items) => `<div class="g-leyenda">${items.map(([c, t]) => `<span><i style="background:${c}"></i>${esc(t)}</span>`).join('')}</div>`;
    const tarjeta = (titulo, icono, cuerpo, extra = '', clase = '') => `<article class="tarjeta g-tarjeta ${clase}">
        <header class="g-cab"><h3><i class="fas fa-${icono}"></i> ${titulo}</h3>${extra}</header>${cuerpo}</article>`;
    const vacio = (txt) => `<p class="g-vacio">${esc(txt)}</p>`;

    // ---------- Cálculos ----------
    function calcular(ordenes, historial) {
        const res = ordenes.map((o) => ({ o, r: resumenOrden(o), d: diasPara(o.fechaEntrega), u: totalOrden(o) }));
        const unidades = res.reduce((s, x) => s + x.u, 0);

        // Avance general ponderado por prendas y áreas
        let peso = 0, hecho = 0;
        res.forEach(({ o, u }) => areasDe(o).forEach((a) => { peso += u; hecho += u * avanceArea(o, a); }));
        const avance = peso ? Math.round((hecho / peso) * 100) : 0;
        const despachadas = res.reduce((s, { o, u }) => s + (o.requerimientos?.despacho ? Math.round(u * avanceArea(o, 'despacho')) : 0), 0);

        const estados = { pendiente: 0, proceso: 0, lista: 0, vencida: 0 };
        res.forEach((x) => {
            if (x.r.estado === 'lista') estados.lista++;
            else if (x.d !== null && x.d < 0) estados.vencida++;
            else estados[x.r.estado]++;
        });

        // Por área: órdenes pendientes / en proceso y prendas que faltan
        const porArea = ORDEN_AREAS.map((a) => {
            const lista = res.filter(({ o }) => o.requerimientos?.[a] && estadoArea(o, a) !== 'completado');
            return {
                a,
                pendiente: lista.filter(({ o }) => estadoArea(o, a) !== 'en-proceso').length,
                proceso: lista.filter(({ o }) => estadoArea(o, a) === 'en-proceso').length,
                faltan: lista.reduce((s, { o, u }) => s + Math.round(u * (1 - avanceArea(o, a))), 0),
            };
        });

        // Entregas: vencidas + próximos 14 días (prendas por día, sin contar las listas)
        const pendientesEntrega = res.filter((x) => x.r.estado !== 'lista' && x.d !== null);
        const vencidasU = pendientesEntrega.filter((x) => x.d < 0).reduce((s, x) => s + x.u, 0);
        const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
        const dias = Array.from({ length: 14 }, (_, i) => {
            const f = new Date(hoy); f.setDate(f.getDate() + i);
            const lista = pendientesEntrega.filter((x) => x.d === i);
            return { f, i, u: lista.reduce((s, x) => s + x.u, 0), n: lista.length };
        });

        // Historial: este mes, a tiempo, por semana
        const ahora = new Date();
        const claveMes = (d) => `${d.getFullYear()}-${d.getMonth()}`;
        const mesActual = claveMes(ahora);
        const mesPasado = claveMes(new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1));
        const hist = (historial || []).filter((h) => h.fecha_completado).map((h) => {
            const dc = h.datos_completos || {};
            const fc = new Date(h.fecha_completado);
            return { fc, mes: claveMes(fc), u: totalOrden(dc), aTiempo: dc.fechaEntrega ? fechaLocal(h.fecha_completado) <= dc.fechaEntrega : null, cliente: dc.cliente, tipo: dc.tipoPrenda };
        });
        const delMes = hist.filter((h) => h.mes === mesActual);
        const delPasado = hist.filter((h) => h.mes === mesPasado);
        const conFecha = delMes.filter((h) => h.aTiempo !== null);
        const aTiempo = conFecha.length ? Math.round((conFecha.filter((h) => h.aTiempo).length / conFecha.length) * 100) : null;

        const lunes = lunesDe(ahora);
        const semanas = Array.from({ length: 8 }, (_, i) => {
            const ini = new Date(lunes); ini.setDate(ini.getDate() - 7 * (7 - i));
            const fin = new Date(ini); fin.setDate(fin.getDate() + 7);
            const l = hist.filter((h) => h.fc >= ini && h.fc < fin);
            return { ini, n: l.length, u: l.reduce((s, h) => s + h.u, 0), actual: i === 7 };
        });

        const agrupar = (lista, campo) => {
            const m = {};
            lista.forEach((x) => { const k = (x[campo] || 'Sin dato').trim(); m[k] = (m[k] || 0) + x.u; });
            return Object.entries(m).sort((a, b) => b[1] - a[1]);
        };
        const clientes = agrupar(res.map((x) => ({ cliente: x.o.cliente, u: x.u })), 'cliente').slice(0, 6);
        const tipos = agrupar(res.map((x) => ({ tipo: x.o.tipoPrenda, u: x.u })), 'tipo').slice(0, 6);

        return { res, unidades, avance, despachadas, estados, porArea, vencidasU, dias, delMes, delPasado, aTiempo, semanas, clientes, tipos, ahora, historialCargado: historial !== null };
    }

    // ---------- Pintar ----------
    function pintar(cont, ordenes, historial) {
        const k = calcular(ordenes, historial);
        const e = k.estados, totalOrdenes = k.res.length;

        // 1. Avance general
        const t1 = tarjeta('Avance de la planta', 'gauge-high', `
            <div class="g-avance">
                ${dona(k.avance, C.azul, 'terminado')}
                <ul class="g-datos">
                    <li><b class="num">${fmt(k.unidades)}</b><span>prendas en producción</span></li>
                    <li><b class="num">${fmt(totalOrdenes)}</b><span>órdenes activas</span></li>
                    <li><b class="num">${fmt(k.despachadas)}</b><span>prendas ya despachadas</span></li>
                </ul>
            </div>
            <p class="g-nota">Se calcula con lo que cada área va marcando en las tablets, prenda por prenda.</p>`);

        // 2. Estado de las órdenes
        const partes = [['lista', 'Listas', C.lista], ['proceso', 'En proceso', C.proceso], ['pendiente', 'Sin empezar', C.pendiente], ['vencida', 'Vencidas', C.vencida]];
        const t2 = tarjeta('Estado de las órdenes', 'chart-simple', totalOrdenes ? `
            <div class="g-apilada">${partes.filter(([id]) => e[id]).map(([id, t, c]) => `<span style="flex:${e[id]};background:${c}" title="${t}: ${e[id]}"></span>`).join('')}</div>
            <div class="g-estados">${partes.map(([id, t, c]) => `<div><i style="background:${c}"></i><b class="num">${e[id]}</b><span>${t}</span></div>`).join('')}</div>
            ${e.vencida ? `<p class="g-alerta"><i class="fas fa-triangle-exclamation"></i> ${e.vencida === 1 ? 'Hay 1 orden vencida' : `Hay ${e.vencida} órdenes vencidas`} con ${fmt(k.vencidasU)} prendas.</p>` : '<p class="g-ok"><i class="fas fa-circle-check"></i> No hay órdenes vencidas.</p>'}`
            : vacio('No hay órdenes activas.'));

        // 3. Cumplimiento del mes
        const nMes = k.delMes.length, nPas = k.delPasado.length;
        const dif = nMes - nPas;
        const t3 = tarjeta(`Terminadas en ${MESES[k.ahora.getMonth()]}`, 'flag-checkered', !k.historialCargado ? vacio('No se pudo leer el historial.') : `
            <div class="g-avance">
                ${k.aTiempo === null ? dona(0, C.lista, 'sin datos') : dona(k.aTiempo, k.aTiempo >= 80 ? C.lista : k.aTiempo >= 60 ? C.proceso : C.vencida, 'a tiempo')}
                <ul class="g-datos">
                    <li><b class="num">${fmt(nMes)}</b><span>órdenes terminadas</span></li>
                    <li><b class="num">${fmt(k.delMes.reduce((s, h) => s + h.u, 0))}</b><span>prendas entregadas</span></li>
                    <li><span class="g-dif ${dif > 0 ? 'sube' : dif < 0 ? 'baja' : ''}"><i class="fas fa-${dif > 0 ? 'arrow-trend-up' : dif < 0 ? 'arrow-trend-down' : 'equals'}"></i> ${dif === 0 ? 'Igual que' : `${fmt(Math.abs(dif))} ${dif > 0 ? 'más' : 'menos'} que`} ${MESES[(k.ahora.getMonth() + 11) % 12]}</span></li>
                </ul>
            </div>
            <p class="g-nota">"A tiempo" = se pasó al historial el día de entrega o antes.</p>`);

        // 4. Carga por área
        const conCarga = k.porArea.filter((x) => x.pendiente + x.proceso);
        const t4 = tarjeta('Carga por área', 'industry', conCarga.length ? barrasH(conCarga.map((x) => ({
            nombre: AREAS[x.a].nombre, icono: AREAS[x.a].icono, color: AREAS[x.a].color,
            partes: [{ valor: x.proceso, color: C.proceso, titulo: `${x.proceso} en proceso` }, { valor: x.pendiente, color: '#90CAF9', titulo: `${x.pendiente} sin empezar` }],
            dato: `<b class="num">${x.pendiente + x.proceso}</b> <small>${fmt(x.faltan)} prendas</small>`,
        }))) + leyenda([[C.proceso, 'En proceso'], ['#90CAF9', 'Sin empezar en el área']]) : vacio('Ninguna área tiene trabajo pendiente.'),
        '<span class="g-cab__sub">órdenes · prendas que faltan</span>');

        // 5. Entregas próximas
        const datosEnt = [{ etiqueta: 'Vencidas', sub: '', valor: k.vencidasU, color: C.vencida, titulo: `Vencidas: ${fmt(k.vencidasU)} prendas` }]
            .concat(k.dias.map((d) => ({
                etiqueta: d.i === 0 ? 'Hoy' : d.i === 1 ? 'Mañ.' : String(d.f.getDate()),
                sub: d.i > 1 ? DIAS[d.f.getDay()] : '',
                valor: d.u, destacar: d.i === 0,
                color: d.i <= 3 ? C.proceso : C.azul,
                titulo: `${d.f.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' })}: ${fmt(d.u)} prendas en ${d.n} ${d.n === 1 ? 'orden' : 'órdenes'}`,
            })));
        const prox7 = k.dias.slice(0, 7).reduce((s, d) => s + d.u, 0);
        const t5 = tarjeta('Entregas de las próximas 2 semanas', 'truck-fast', columnas(datosEnt, { unidad: 'prendas' }) +
            leyenda([[C.vencida, 'Vencidas'], [C.proceso, 'Próximos 3 días'], [C.azul, 'Más adelante']]),
            `<span class="g-cab__sub"><b class="num">${fmt(prox7)}</b> prendas esta semana</span>`, 'g-ancha');

        // 6. Terminadas por semana
        const t6 = tarjeta('Órdenes terminadas por semana', 'chart-column', !k.historialCargado ? vacio('No se pudo leer el historial.') : columnas(k.semanas.map((s) => ({
            etiqueta: `${s.ini.getDate()} ${MESES[s.ini.getMonth()].slice(0, 3)}`, sub: s.actual ? 'esta sem.' : '',
            valor: s.n, color: s.actual ? C.celeste : C.azul, destacar: s.actual,
            titulo: `Semana del ${s.ini.getDate()} de ${MESES[s.ini.getMonth()]}: ${s.n} órdenes, ${fmt(s.u)} prendas`,
        })), { unidad: 'órdenes', ancho: 340, alto: 190 }), '<span class="g-cab__sub">últimas 8 semanas</span>');

        // 7 y 8. Clientes y prendas
        const lista = (pares, color) => pares.length ? barrasH(pares.map(([n, v]) => ({ nombre: n, partes: [{ valor: v, color }], dato: `<b class="num">${fmt(v)}</b>` }))) : vacio('Sin órdenes activas.');
        const t7 = tarjeta('Clientes con más prendas', 'users', lista(k.clientes, C.azul), '<span class="g-cab__sub">en producción</span>');
        const t8 = tarjeta('Prendas en producción', 'shirt', lista(k.tipos, '#26A69A'), '<span class="g-cab__sub">por tipo</span>');

        cont.innerHTML = `<div class="g-rejilla">${t1}${t2}${t3}${t5}${t4}${t6}${t7}${t8}</div>`;
    }

    REG.graficas = { pintar, calcular };
})();
