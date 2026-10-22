// ==========================================
// REPORTE-PDF.JS · Reporte mensual de producción (historial)
// Solo lee el historial que ya se cargó. No escribe nada en la base.
// generarReporteMensualPDF(historial, { anio, mes })  · mes de 0 a 11 (por defecto, el mes actual)
// ==========================================

const MESES_REPORTE = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// Meses con órdenes en el historial, del más reciente al más antiguo: [{ anio, mes, n }]
function mesesDelHistorial(historial) {
    const m = {};
    (historial || []).forEach((o) => {
        const f = new Date(o.fechaCompletado || o.fechaCreacion);
        if (isNaN(f)) return;
        const k = `${f.getFullYear()}-${f.getMonth()}`;
        m[k] = m[k] || { anio: f.getFullYear(), mes: f.getMonth(), n: 0 };
        m[k].n++;
    });
    return Object.values(m).sort((a, b) => b.anio - a.anio || b.mes - a.mes);
}

function cargarLogoReporte() {
    return new Promise((ok) => {
        const img = new Image();
        img.onload = () => {
            try {
                // Reducido y en JPEG sobre blanco para que el PDF pese poco
                const alto = Math.min(240, img.naturalHeight), ancho = Math.round(alto * img.naturalWidth / img.naturalHeight);
                const c = document.createElement('canvas');
                c.width = ancho; c.height = alto;
                const g = c.getContext('2d');
                g.fillStyle = '#fff'; g.fillRect(0, 0, ancho, alto);
                g.drawImage(img, 0, 0, ancho, alto);
                ok({ data: c.toDataURL('image/jpeg', 0.92), r: ancho / alto });
            } catch (e) { ok(null); }
        };
        img.onerror = () => ok(null);
        img.src = 'logo.png';
    });
}

async function generarReporteMensualPDF(historial, periodo = {}) {
    try {
        const { jsPDF } = window.jspdf;
        const hoy = new Date();
        const anio = periodo.anio ?? hoy.getFullYear();
        const mes = periodo.mes ?? hoy.getMonth();
        const nombreMes = MESES_REPORTE[mes];
        const Mes = nombreMes[0].toUpperCase() + nombreMes.slice(1);

        const unidades = (o) => parseInt(o.cantidadTotal) || Object.values(o.tallas || {}).reduce((a, v) => a + (parseInt(v) || 0), 0);
        const fechaDe = (o) => new Date(o.fechaCompletado || o.fechaCreacion);
        const diaLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        // Días de diferencia entre la entrega pactada y el día en que se terminó (positivo = tarde)
        const atraso = (o) => {
            if (!o.fechaEntrega) return null;
            const fin = new Date(diaLocal(fechaDe(o)) + 'T12:00:00');
            const ent = new Date(String(o.fechaEntrega).slice(0, 10) + 'T12:00:00');
            return Math.round((fin - ent) / 86400000);
        };
        const delMes = (a, m) => (historial || []).filter((o) => { const f = fechaDe(o); return f.getMonth() === m && f.getFullYear() === a; });

        const ordenes = delMes(anio, mes).sort((a, b) => fechaDe(a) - fechaDe(b));
        if (!ordenes.length) { REG.aviso(`No hay órdenes terminadas en ${nombreMes} de ${anio}.`, 'alerta'); return; }
        const prev = delMes(mes === 0 ? anio - 1 : anio, (mes + 11) % 12);
        const nombrePrev = MESES_REPORTE[(mes + 11) % 12];

        const totalUds = ordenes.reduce((s, o) => s + unidades(o), 0);
        const totalPrev = prev.reduce((s, o) => s + unidades(o), 0);
        const conFecha = ordenes.filter((o) => atraso(o) !== null);
        const tarde = conFecha.filter((o) => atraso(o) > 0);
        const pctTiempo = conFecha.length ? Math.round(((conFecha.length - tarde.length) / conFecha.length) * 100) : null;
        const promedio = Math.round(totalUds / ordenes.length);

        // ---------- Estilo ----------
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const W = 210, H = 297, M = 15, AN = W - 2 * M;
        const C = {
            azul: [13, 71, 161], azul2: [21, 101, 192], celeste: [79, 195, 247], azulSuave: [235, 243, 253],
            tinta: [26, 35, 50], tinta2: [55, 71, 79], gris: [96, 125, 139], gris2: [144, 164, 174],
            linea: [226, 232, 240], fondo: [247, 249, 252], blanco: [255, 255, 255],
            verde: [46, 125, 50], verdeSuave: [232, 245, 233], rojo: [198, 40, 40], rojoSuave: [255, 235, 238],
            ambar: [230, 126, 0], rosa: [173, 20, 87], rosaSuave: [252, 228, 236], turquesa: [0, 131, 143],
        };
        const t = (texto, x, y, { s = 9, c = C.tinta, b = false, al = 'left', max } = {}) => {
            doc.setFont('helvetica', b ? 'bold' : 'normal'); doc.setFontSize(s); doc.setTextColor(...c);
            let v = String(texto);
            if (max) while (v.length > 1 && doc.getTextWidth(v) > max) v = v.slice(0, -2) + '…';
            doc.text(v, x, y, { align: al });
        };
        const caja = (x, y, w, h, fill, r = 2.5, borde) => {
            if (fill) { doc.setFillColor(...fill); doc.roundedRect(x, y, w, h, r, r, 'F'); }
            if (borde) { doc.setDrawColor(...borde); doc.setLineWidth(0.3); doc.roundedRect(x, y, w, h, r, r, 'S'); }
        };
        const titulo = (texto, y, sub) => {
            doc.setFillColor(...C.azul2); doc.rect(M, y - 3.6, 1.2, 4.6, 'F');
            t(texto.toUpperCase(), M + 3.5, y, { s: 8.5, b: true, c: C.azul });
            if (sub) t(sub, W - M, y, { s: 7.5, c: C.gris, al: 'right' });
            return y + 5;
        };
        const fmt = (n) => Number(n || 0).toLocaleString('es-CO');
        const logo = await cargarLogoReporte();

        // ---------- Encabezado ----------
        doc.setFillColor(...C.azul); doc.rect(0, 0, W, 3, 'F');
        doc.setFillColor(...C.celeste); doc.rect(0, 3, W * 0.28, 0.9, 'F');
        if (logo) { const h = 17; doc.addImage(logo.data, 'JPEG', M, 10, h * logo.r, h); }
        const xT = logo ? M + 17 * logo.r + 6 : M;
        t('REPORTE MENSUAL DE PRODUCCIÓN', xT, 15.5, { s: 8, b: true, c: C.azul2 });
        t(`${Mes} ${anio}`, xT, 25, { s: 22, b: true, c: C.tinta });
        t('REG Marketing S.A.S', W - M, 14.5, { s: 9, b: true, c: C.tinta, al: 'right' });
        t(`Generado el ${hoy.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}`, W - M, 19.5, { s: 7.5, c: C.gris, al: 'right' });
        t(`${hoy.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`, W - M, 23.8, { s: 7.5, c: C.gris, al: 'right' });
        doc.setDrawColor(...C.linea); doc.setLineWidth(0.4); doc.line(M, 32, W - M, 32);

        // ---------- Indicadores ----------
        let y = 38;
        const comparar = (act, ant) => {
            if (!prev.length) return { txt: `sin datos de ${nombrePrev}`, c: C.gris2 };
            const d = act - ant;
            if (d === 0) return { txt: `igual que ${nombrePrev}`, c: C.gris };
            return { txt: `${d > 0 ? '+' : '-'}${fmt(Math.abs(d))} vs. ${nombrePrev}`, c: d > 0 ? C.verde : C.rojo };
        };
        const kpis = [
            { v: fmt(ordenes.length), l: 'Órdenes terminadas', cmp: comparar(ordenes.length, prev.length), c: C.azul2 },
            { v: fmt(totalUds), l: 'Prendas producidas', cmp: comparar(totalUds, totalPrev), c: C.azul2 },
            { v: pctTiempo === null ? '—' : `${pctTiempo}%`, l: 'Entregadas a tiempo', cmp: { txt: tarde.length ? `${tarde.length} con retraso` : 'ninguna con retraso', c: tarde.length ? C.rojo : C.verde }, c: pctTiempo === null ? C.gris : pctTiempo >= 80 ? C.verde : pctTiempo >= 60 ? C.ambar : C.rojo },
            { v: fmt(promedio), l: 'Prendas por orden', cmp: { txt: 'promedio del mes', c: C.gris }, c: C.azul2 },
        ];
        const kw = (AN - 3 * 4) / 4;
        kpis.forEach((k, i) => {
            const x = M + i * (kw + 4);
            caja(x, y, kw, 25, C.fondo, 2.5, C.linea);
            t(k.l.toUpperCase(), x + 4, y + 6.5, { s: 6.3, b: true, c: C.gris });
            t(k.v, x + 4, y + 16, { s: 17, b: true, c: k.c });
            t(k.cmp.txt, x + 4, y + 21.5, { s: 6.8, c: k.cmp.c, max: kw - 7 });
        });
        y += 33;

        // ---------- Prendas por día ----------
        y = titulo('Prendas terminadas por día', y, `${Mes} ${anio}`);
        const diasMes = new Date(anio, mes + 1, 0).getDate();
        const porDia = Array.from({ length: diasMes }, () => ({ u: 0, n: 0 }));
        ordenes.forEach((o) => { const d = fechaDe(o).getDate() - 1; porDia[d].u += unidades(o); porDia[d].n++; });
        const gH = 46, gY = y + 2, base = gY + gH - 9, alto = gH - 17;
        caja(M, gY - 2, AN, gH + 2, C.blanco, 2.5, C.linea);
        const maxU = Math.max(1, ...porDia.map((d) => d.u));
        const paso = (AN - 16) / diasMes, bw = Math.min(4.2, paso * 0.62);
        [0.5, 1].forEach((f) => {
            doc.setDrawColor(...C.linea); doc.setLineWidth(0.15); doc.setLineDashPattern([0.8, 0.8], 0);
            doc.line(M + 11, base - alto * f, W - M - 5, base - alto * f);
            doc.setLineDashPattern([], 0);
            t(fmt(Math.round(maxU * f)), M + 5, base - alto * f - 1, { s: 5.5, c: C.gris2 });
        });
        porDia.forEach((d, i) => {
            const x = M + 11 + paso * i + (paso - bw) / 2;
            const fecha = new Date(anio, mes, i + 1);
            const finde = fecha.getDay() === 0 || fecha.getDay() === 6;
            if (finde) { doc.setFillColor(...C.fondo); doc.rect(M + 11 + paso * i, base - alto - 4, paso, alto + 4, 'F'); }
            if (d.u) {
                const h = Math.max(0.8, (d.u / maxU) * alto);
                doc.setFillColor(...C.azul2); doc.roundedRect(x, base - h, bw, h, 0.7, 0.7, 'F');
                if (diasMes <= 31) t(fmt(d.u), x + bw / 2, base - h - 1.3, { s: 5, b: true, c: C.tinta2, al: 'center' });
            }
            t(String(i + 1), x + bw / 2, base + 4, { s: 5.3, c: finde ? C.gris2 : C.gris, al: 'center' });
        });
        doc.setDrawColor(...C.linea); doc.setLineWidth(0.3); doc.line(M + 11, base, W - M - 5, base);
        t('Días de fin de semana sombreados · el número sobre cada barra son las prendas del día', M + 5, gY + gH - 2.2, { s: 5.8, c: C.gris2 });
        y = gY + gH + 8;

        // ---------- Tipo de prenda y clientes ----------
        const agrupar = (campo) => {
            const m = {};
            ordenes.forEach((o) => { const k = (o[campo] || 'Sin dato').trim(); m[k] = m[k] || { u: 0, n: 0 }; m[k].u += unidades(o); m[k].n++; });
            return Object.entries(m).sort((a, b) => b[1].u - a[1].u);
        };
        const colW = (AN - 8) / 2;
        const barras = (x, yy, lista, color, filas = 7) => {
            const max = Math.max(1, ...lista.map(([, v]) => v.u));
            let otros = null;
            if (lista.length > filas) {
                const resto = lista.slice(filas - 1);
                otros = ['Otros', { u: resto.reduce((s, [, v]) => s + v.u, 0), n: resto.reduce((s, [, v]) => s + v.n, 0) }];
                lista = lista.slice(0, filas - 1).concat([otros]);
            }
            lista.forEach(([nombre, v], i) => {
                const fy = yy + i * 8.2;
                t(nombre, x, fy + 3, { s: 7.8, b: true, c: C.tinta, max: colW * 0.42 });
                t(`${v.n} ${v.n === 1 ? 'orden' : 'órdenes'}`, x, fy + 6.4, { s: 5.8, c: C.gris });
                const bx = x + colW * 0.45, bwMax = colW * 0.38;
                caja(bx, fy + 1.2, bwMax, 3.2, C.azulSuave, 1.6);
                caja(bx, fy + 1.2, Math.max(1.5, (v.u / max) * bwMax), 3.2, nombre === 'Otros' ? C.gris2 : color, 1.6);
                t(fmt(v.u), x + colW, fy + 3.3, { s: 8, b: true, c: C.tinta, al: 'right' });
                t(`${Math.round((v.u / totalUds) * 100)}%`, x + colW, fy + 6.6, { s: 5.8, c: C.gris, al: 'right' });
            });
            return yy + lista.length * 8.2;
        };
        titulo('Por tipo de prenda', y);
        doc.setFillColor(...C.azul2); doc.rect(M + colW + 8, y - 3.6, 1.2, 4.6, 'F');
        t('CLIENTES PRINCIPALES', M + colW + 11.5, y, { s: 8.5, b: true, c: C.azul });
        y += 5;
        const y1 = barras(M, y, agrupar('tipoPrenda'), C.turquesa);
        const y2 = barras(M + colW + 8, y, agrupar('cliente'), C.azul2);
        y = Math.max(y1, y2) + 6;

        // ---------- Cumplimiento ----------
        if (conFecha.length && y < H - 60) {
            y = titulo('Cumplimiento de entregas', y, 'según la fecha de entrega pactada');
            const aT = conFecha.length - tarde.length;
            const bx = M, bwT = AN;
            caja(bx, y, bwT, 6, C.rojoSuave, 3);
            caja(bx, y, Math.max(3, (aT / conFecha.length) * bwT), 6, C.verde, 3);
            t(`${aT} a tiempo`, bx + 3, y + 4.2, { s: 7, b: true, c: C.blanco });
            if (tarde.length) t(`${tarde.length} con retraso`, bx + bwT - 3, y + 4.2, { s: 7, b: true, c: C.rojo, al: 'right' });
            y += 10;
            if (tarde.length) {
                const peores = [...tarde].sort((a, b) => atraso(b) - atraso(a)).slice(0, 4);
                t('Mayores retrasos: ' + peores.map((o) => `${o.numeroOrden} ${o.cliente} (${atraso(o)} ${atraso(o) === 1 ? 'día' : 'días'})`).join('  ·  '), M, y, { s: 6.8, c: C.tinta2, max: AN });
                y += 6;
            }
        }

        // ---------- Detalle ----------
        if (y > H - 70) { doc.addPage(); y = 18; } else y += 6;
        y = titulo('Detalle de órdenes terminadas', y, `${ordenes.length} órdenes · ${fmt(totalUds)} prendas`);
        const fechaC = (d) => (d ? new Date(String(d).length <= 10 ? d + 'T12:00:00' : d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }).replace('.', '') : '—');
        const filaDe = (o) => {
            const a = atraso(o);
            return [o.numeroOrden, o.cliente || '—', o.tipoPrenda || '—', fmt(unidades(o)), fechaC(o.fechaEntrega), fechaC(o.fechaCompletado), a === null ? '—' : a > 0 ? `${a} ${a === 1 ? 'día' : 'días'} tarde` : 'A tiempo'];
        };
        // Paquetes juntos, en el orden en que se terminaron
        const filas = [];
        const vistos = new Set();
        ordenes.forEach((o) => {
            if (!o.paqueteId) { filas.push({ o }); return; }
            if (vistos.has(o.paqueteId)) return;
            vistos.add(o.paqueteId);
            const grupo = ordenes.filter((x) => x.paqueteId === o.paqueteId);
            filas.push({ paquete: o.paqueteId, grupo });
            grupo.forEach((g) => filas.push({ o: g, enPaquete: true }));
        });
        const body = filas.map((f) => {
            if (f.paquete) {
                const u = f.grupo.reduce((s, g) => s + unidades(g), 0);
                return [{ content: `Paquete ${f.paquete}  ·  ${f.grupo[0].cliente}  ·  ${f.grupo.length} prendas, ${fmt(u)} uds`, colSpan: 7, styles: { fillColor: C.rosaSuave, textColor: C.rosa, fontStyle: 'bold', fontSize: 7.5 } }];
            }
            const r = filaDe(f.o);
            if (f.enPaquete) r[0] = { content: r[0], styles: { textColor: C.rosa } };
            return r;
        });
        doc.autoTable({
            startY: y,
            margin: { left: M, right: M, top: 18, bottom: 18 },
            head: [['N.º', 'Cliente', 'Prenda', 'Prendas', 'Entrega', 'Terminada', 'Cumplimiento']],
            body,
            theme: 'plain',
            styles: { font: 'helvetica', fontSize: 7.8, textColor: C.tinta, cellPadding: { top: 2.2, bottom: 2.2, left: 2.2, right: 2.2 }, lineWidth: 0 },
            headStyles: { fillColor: C.azul, textColor: C.blanco, fontStyle: 'bold', fontSize: 7.3, lineWidth: 0 },
            alternateRowStyles: { fillColor: C.fondo },
            columnStyles: {
                0: { cellWidth: 16, fontStyle: 'bold', textColor: C.azul2 },
                1: { cellWidth: 48 }, 2: { cellWidth: 36 },
                3: { cellWidth: 17, halign: 'right', fontStyle: 'bold' },
                4: { cellWidth: 19, halign: 'center' }, 5: { cellWidth: 20, halign: 'center' },
                6: { halign: 'center' },
            },
            rowPageBreak: 'avoid',
            didParseCell: (d) => {
                if (d.section === 'body' && d.column.index === 6 && typeof d.cell.raw === 'string') {
                    if (d.cell.raw.includes('tarde')) { d.cell.styles.textColor = C.rojo; d.cell.styles.fontStyle = 'bold'; }
                    else if (d.cell.raw === 'A tiempo') d.cell.styles.textColor = C.verde;
                }
                if (d.section === 'head' && d.column.index === 3) d.cell.styles.halign = 'right';
                if (d.section === 'head' && d.column.index >= 4) d.cell.styles.halign = 'center';
            },
        });
        y = doc.lastAutoTable.finalY + 3;
        if (y > H - 30) { doc.addPage(); y = 18; }
        caja(M, y, AN, 10, C.azulSuave, 2);
        t('TOTAL DEL MES', M + 4, y + 6.4, { s: 7.5, b: true, c: C.azul });
        t(`${fmt(ordenes.length)} órdenes   ·   ${fmt(totalUds)} prendas   ·   ${pctTiempo === null ? '—' : pctTiempo + '% a tiempo'}`, W - M - 4, y + 6.4, { s: 8, b: true, c: C.tinta, al: 'right' });

        // ---------- Pie de página ----------
        const n = doc.internal.getNumberOfPages();
        for (let p = 1; p <= n; p++) {
            doc.setPage(p);
            doc.setDrawColor(...C.linea); doc.setLineWidth(0.3); doc.line(M, H - 12, W - M, H - 12);
            t(`REG Marketing S.A.S  ·  Reporte de producción  ·  ${Mes} ${anio}`, M, H - 7.5, { s: 6.8, c: C.gris });
            t(`Página ${p} de ${n}`, W - M, H - 7.5, { s: 6.8, c: C.gris, al: 'right' });
        }

        doc.save(`Reporte_Produccion_${Mes}_${anio}.pdf`);
    } catch (err) {
        console.error('Error PDF:', err);
        REG.aviso('Error al generar el PDF: ' + err.message, 'error', 6000);
    }
}
