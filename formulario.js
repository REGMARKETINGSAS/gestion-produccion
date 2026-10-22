// ==========================================
// FORMULARIO.JS - Formulario de una prenda (tipo, especificaciones, tallas, diseño y logos)
// Lo usan "Crear orden" y cada prenda de "Nuevo paquete", para que ambos guarden igual.
// ==========================================

(function () {
    const { esc, PRENDAS, MENU_PRENDAS, NOMBRE_PRENDA, OPCIONES, GRUPOS_TALLAS, TIPOS_TALLAS, TODAS_LAS_TALLAS, REQUERIMIENTOS, NOMBRE_REQ, AREAS } = REG;
    let contador = 0;

    const opciones = (lista, valor) => lista.map(([v, t]) => `<option value="${esc(v)}" ${v === valor ? 'selected' : ''}>${esc(t)}</option>`).join('');
    const menuPrendas = (valor) =>
        `<option value="">Seleccionar…</option>` +
        MENU_PRENDAS.map(([grupo, lista]) => `<optgroup label="${esc(grupo)}">${lista.map((p) => `<option value="${esc(p)}" ${p === valor ? 'selected' : ''}>${esc(NOMBRE_PRENDA[p] || p)}</option>`).join('')}</optgroup>`).join('');

    // Listas con opción "Otra…": si el valor guardado no está en la lista, se muestra en el campo de texto.
    function selectConOtra(id, campo, etiqueta, valor) {
        const lista = OPCIONES[campo];
        const otraClave = lista.find(([v]) => v === 'Otra' || v === 'Otro')[0];
        const conocido = !valor || lista.some(([v]) => v === valor);
        return `<div class="campo" data-campo="${campo}">
            <label for="${id}">${etiqueta}</label>
            <select id="${id}" data-otra="${otraClave}">${opciones(lista, conocido ? valor : otraClave)}</select>
            <input type="text" id="${id}Otra" placeholder="Escribe cuál…" value="${conocido ? '' : esc(valor)}" class="${conocido && valor !== otraClave ? 'oculto' : ''}">
        </div>`;
    }

    function subir(id, titulo, icono, chico = false) {
        return `<label class="subir" id="${id}" style="${chico ? 'min-height:104px' : ''}">
            <i class="fas fa-${icono}"></i><b>${esc(titulo)}</b><small>Toca para subir</small>
            <input type="file" accept="image/*">
        </label>`;
    }

    /**
     * Crea el formulario dentro de `cont`.
     * opciones: { general: true }  → incluye impresora y requerimientos dentro (para paquetes)
     */
    REG.formularioPrenda = function (cont, { general = false, alCambiar = () => {}, carpeta = 'disenos' } = {}) {
        const n = ++contador;
        const id = (s) => `f${n}_${s}`;
        const imagenes = { diseno: null, mangaDerecha: null, mangaIzquierda: null, frente: null, espalda: null, adicionales: [] };
        let subiendo = 0;

        cont.innerHTML = `
            <div class="rejilla rejilla--3">
                <div class="campo">
                    <label for="${id('tipo')}">Tipo de prenda <span class="obl">*</span></label>
                    <select id="${id('tipo')}" required>${menuPrendas('')}</select>
                </div>
                ${general ? `<div class="campo"><label for="${id('impresora')}">Impresora</label><select id="${id('impresora')}">${opciones(OPCIONES.impresora, '')}</select></div>` : ''}
            </div>

            <div class="rejilla rejilla--4" id="${id('specs')}" style="margin-top:16px"></div>

            ${general ? `
                <p class="seccion-titulo">Áreas que necesita</p>
                <div class="reqs" id="${id('reqs')}">
                    ${REQUERIMIENTOS.map((r) => `
                        <label class="req ${r === 'despacho' ? 'req--fijo' : ''}">
                            <input type="checkbox" data-req="${r}" ${r === 'despacho' ? 'checked disabled' : ''}>
                            <span class="req__ico"><i class="fas fa-${r === 'bordado' ? 'ring' : AREAS[r].icono}"></i></span>${esc(NOMBRE_REQ[r])}
                        </label>`).join('')}
                </div>` : ''}

            <div id="${id('cantidades')}"></div>

            <p class="seccion-titulo">Diseño y logos <span style="text-transform:none;letter-spacing:0;font-weight:500">(opcional)</span></p>
            <div class="rejilla" style="grid-template-columns:minmax(0,1.3fr) minmax(0,2fr);align-items:start">
                ${subir(id('diseno'), 'Diseño del producto', 'image')}
                <div class="rejilla rejilla--4">
                    ${subir(id('mangaDerecha'), 'Manga derecha', 'hand-point-right', true)}
                    ${subir(id('mangaIzquierda'), 'Manga izquierda', 'hand-point-left', true)}
                    ${subir(id('frente'), 'Frente', 'shirt', true)}
                    ${subir(id('espalda'), 'Espalda', 'arrow-turn-down', true)}
                </div>
            </div>
            <div class="rejilla rejilla--4" id="${id('adicionales')}" style="margin-top:12px"></div>
            <button type="button" class="btn btn--borde btn--chico" id="${id('masLogo')}" style="margin-top:10px"><i class="fas fa-plus"></i> Logo adicional</button>

            <div class="campo" style="margin-top:18px">
                <label for="${id('obs')}">Observaciones</label>
                <textarea id="${id('obs')}" rows="3" placeholder="Indicaciones especiales para producción…"></textarea>
            </div>`;

        const $ = (s) => cont.querySelector(`#${id(s)}`);

        // ---- Especificaciones según el tipo ----
        function pintarSpecs(valores = {}) {
            const conf = PRENDAS[$('tipo').value];
            const campos = conf ? conf.campos : [];
            const html = [];
            if (campos.includes('tela')) html.push(selectConOtra(id('tela'), 'tela', 'Tela', valores.tela));
            if (campos.includes('cuello')) html.push(`<div class="campo"><label for="${id('cuello')}">Cuello</label><select id="${id('cuello')}">${opciones(OPCIONES.cuello, valores.cuello || '')}</select></div>`);
            if (campos.includes('colorCuello')) html.push(`<div class="campo"><label for="${id('colorCuello')}">Color de cuello</label><input id="${id('colorCuello')}" placeholder="Ej: Blanco" value="${esc(valores.colorCuello)}"></div>`);
            if (campos.includes('molde')) html.push(selectConOtra(id('molde'), 'molde', 'Molde', valores.molde));
            if (campos.includes('ancho')) html.push(`<div class="campo"><label for="${id('ancho')}">Ancho</label><input id="${id('ancho')}" placeholder="Ej: 1.50 m" value="${esc(valores.ancho)}"></div>`);
            if (campos.includes('anchoBies')) html.push(`<div class="campo"><label for="${id('anchoBies')}">Ancho bies</label><input id="${id('anchoBies')}" placeholder="Ej: 3 cm" value="${esc(valores.anchoBies)}"></div>`);
            if (campos.includes('dobladillo')) html.push(`<div class="campo"><label for="${id('dobladillo')}">Dobladillo</label><select id="${id('dobladillo')}">${opciones(OPCIONES.dobladillo, valores.dobladillo || '')}</select></div>`);
            if (campos.includes('marquilla')) html.push(selectConOtra(id('marquilla'), 'marquilla', 'Marquilla', valores.marquilla));
            $('specs').innerHTML = html.join('');
            $('specs').style.marginTop = html.length ? '16px' : '0';
        }

        // ---- Tallas o cantidad ----
        function pintarCantidades(valores = {}) {
            const conf = PRENDAS[$('tipo').value];
            const caja = $('cantidades');
            if (!conf) { caja.innerHTML = ''; return; }
            if (conf.tallas === 'cantidad') {
                caja.innerHTML = `<p class="seccion-titulo">Cantidad</p>
                    <div class="campo" style="max-width:220px"><label for="${id('cantidad')}">Unidades <span class="obl">*</span></label>
                    <input type="number" inputmode="numeric" min="1" id="${id('cantidad')}" placeholder="Ej: 50" value="${valores.cantidadTotal || ''}"></div>`;
                return;
            }
            const grupos = TIPOS_TALLAS[conf.tallas].map((g) => GRUPOS_TALLAS[g]);
            caja.innerHTML = `<p class="seccion-titulo">Tallas <span id="${id('totalTallas')}" class="chip chip--azul" style="margin-left:6px;text-transform:none;letter-spacing:0">0 prendas</span></p>` +
                grupos.map((g) => `
                    <div class="tallas-grupo" data-grupo="${g.id}">
                        <div class="tallas-grupo__cab" style="background:${g.color}"><span>${esc(g.titulo)}</span><span class="total num" data-total-grupo>0</span></div>
                        <div class="tallas-grupo__fila">
                            ${g.tallas.map((t) => {
                                const v = parseInt(valores.tallas?.[t.clave]) || 0;
                                return `<label class="talla ${v ? 'con-valor' : ''}"><span>${esc(t.etiqueta)}</span><input type="number" inputmode="numeric" min="0" data-talla="${esc(t.clave)}" value="${v || ''}" placeholder="0"></label>`;
                            }).join('')}
                        </div>
                    </div>`).join('');
            sumar();
        }

        function sumar() {
            let total = 0;
            cont.querySelectorAll('.tallas-grupo').forEach((g) => {
                let t = 0;
                g.querySelectorAll('[data-talla]').forEach((inp) => {
                    const v = Math.max(0, parseInt(inp.value) || 0);
                    t += v;
                    inp.closest('.talla').classList.toggle('con-valor', v > 0);
                });
                g.querySelector('[data-total-grupo]').textContent = t;
                total += t;
            });
            const chip = $('totalTallas');
            if (chip) chip.textContent = `${total} ${total === 1 ? 'prenda' : 'prendas'}`;
            return total;
        }

        // ---- Imágenes ----
        function mostrarImagen(caja, url, alQuitar) {
            caja.classList.add('con-imagen');
            caja.querySelectorAll('img,.subir__quitar').forEach((e) => e.remove());
            caja.querySelectorAll('i,b,small').forEach((e) => e.classList.add('oculto'));
            const img = document.createElement('img');
            img.src = url;
            img.alt = '';
            const quitar = document.createElement('button');
            quitar.type = 'button';
            quitar.className = 'subir__quitar';
            quitar.setAttribute('aria-label', 'Quitar imagen');
            quitar.innerHTML = '<i class="fas fa-xmark"></i>';
            quitar.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                caja.classList.remove('con-imagen');
                img.remove();
                quitar.remove();
                caja.querySelectorAll('i,b,small').forEach((el) => el.classList.remove('oculto'));
                caja.querySelector('input').value = '';
                alQuitar();
                alCambiar();
            });
            caja.prepend(img);
            caja.append(quitar);
        }

        function enlazarSubida(caja, clave, carpetaImg, max) {
            caja.querySelector('input').addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 50 * 1024 * 1024) return REG.aviso('La imagen pesa más de 50 MB.', 'alerta');
                caja.classList.add('subiendo');
                subiendo++;
                const r = await REG.prepararImagen(file, carpetaImg, max);
                subiendo--;
                caja.classList.remove('subiendo');
                if (!r) return REG.aviso('No se pudo leer esa imagen.', 'error');
                if (!r.subida) REG.aviso('No se pudo subir al servidor; la imagen quedará dentro de la orden.', 'alerta', 5000);
                if (typeof clave === 'number') imagenes.adicionales[clave] = r.url;
                else imagenes[clave] = r.url;
                mostrarImagen(caja, r.url, () => {
                    if (typeof clave === 'number') imagenes.adicionales[clave] = null;
                    else imagenes[clave] = null;
                });
                alCambiar();
            });
        }

        enlazarSubida($('diseno'), 'diseno', carpeta === 'disenos' ? 'disenos' : carpeta, 1200);
        ['mangaDerecha', 'mangaIzquierda', 'frente', 'espalda'].forEach((k) => enlazarSubida($(k), k, 'logos', 800));

        function agregarAdicional(url = null) {
            const i = imagenes.adicionales.length;
            if (i >= 4) return;
            imagenes.adicionales.push(url);
            const caja = document.createElement('label');
            caja.className = 'subir';
            caja.style.minHeight = '104px';
            caja.innerHTML = `<i class="fas fa-plus"></i><b>Logo ${i + 1}</b><small>Toca para subir</small><input type="file" accept="image/*">`;
            $('adicionales').appendChild(caja);
            enlazarSubida(caja, i, 'logos', 800);
            if (url) mostrarImagen(caja, url, () => (imagenes.adicionales[i] = null));
            $('masLogo').classList.toggle('oculto', imagenes.adicionales.length >= 4);
        }
        $('masLogo').addEventListener('click', () => agregarAdicional());

        // ---- Eventos ----
        $('tipo').addEventListener('change', () => {
            const anteriores = leerSpecs();
            pintarSpecs(anteriores);
            pintarCantidades({});
            alCambiar();
        });
        cont.addEventListener('input', (e) => {
            if (e.target.matches('[data-talla]')) sumar();
            alCambiar();
        });
        const marcarReqs = () => cont.querySelectorAll('[data-req]').forEach((cb) => cb.closest('.req').classList.toggle('activo', cb.checked));
        cont.addEventListener('change', (e) => {
            if (e.target.matches('[data-req]')) marcarReqs();
            const sel = e.target.closest('select[data-otra]');
            if (sel) {
                const otra = cont.querySelector(`#${sel.id}Otra`);
                const es = sel.value === sel.dataset.otra;
                otra.classList.toggle('oculto', !es);
                if (es) otra.focus(); else otra.value = '';
            }
            alCambiar();
        });

        // ---- Lectura ----
        function valorConOtra(campo) {
            const sel = $(campo);
            if (!sel) return '';
            if (sel.value === sel.dataset.otra) return cont.querySelector(`#${sel.id}Otra`).value.trim() || sel.dataset.otra;
            return sel.value;
        }
        const valor = (campo) => ($(campo) ? $(campo).value.trim() : '');
        function leerSpecs() {
            return {
                tela: valorConOtra('tela'), cuello: valor('cuello'), colorCuello: valor('colorCuello'), molde: valorConOtra('molde'),
                ancho: valor('ancho'), anchoBies: valor('anchoBies'), dobladillo: valor('dobladillo'), marquilla: valorConOtra('marquilla'),
            };
        }

        function leer() {
            const tipoPrenda = $('tipo').value;
            const conf = PRENDAS[tipoPrenda];
            const datos = {
                tipoPrenda,
                tipoPrendaValor: tipoPrenda,
                ...leerSpecs(),
                observaciones: $('obs').value,
                imagenDiseno: imagenes.diseno,
                imagenMangaDerecha: imagenes.mangaDerecha,
                imagenMangaIzquierda: imagenes.mangaIzquierda,
                imagenFrente: imagenes.frente,
                imagenEspalda: imagenes.espalda,
                imagenesAdicionales: imagenes.adicionales.filter(Boolean),
            };
            if (conf && conf.tallas === 'cantidad') {
                datos.cantidadTotal = parseInt(valor('cantidad')) || 0;
                datos.tallas = {};
            } else {
                // Todas las claves en 0 y luego las visibles: así una talla de otro tipo nunca queda guardada por error.
                const tallas = Object.fromEntries(TODAS_LAS_TALLAS.map((t) => [t, 0]));
                cont.querySelectorAll('[data-talla]').forEach((inp) => (tallas[inp.dataset.talla] = Math.max(0, parseInt(inp.value) || 0)));
                datos.tallas = tallas;
                datos.cantidadTotal = 0;
            }
            if (general) {
                datos.impresora = valor('impresora');
                datos.requerimientos = Object.fromEntries([...cont.querySelectorAll('[data-req]')].map((cb) => [cb.dataset.req, cb.checked]));
            }
            return datos;
        }

        function total() {
            const conf = PRENDAS[$('tipo').value];
            if (!conf) return 0;
            return conf.tallas === 'cantidad' ? parseInt(valor('cantidad')) || 0 : sumar();
        }

        function validar() {
            if (subiendo > 0) return 'Espera a que terminen de subir las imágenes.';
            if (!$('tipo').value) return 'Elige el tipo de prenda.';
            if (total() <= 0) return PRENDAS[$('tipo').value].tallas === 'cantidad' ? 'Escribe la cantidad de unidades.' : 'Escribe al menos una cantidad en las tallas.';
            return null;
        }

        // ---- Carga para editar ----
        function cargar(orden) {
            $('tipo').value = PRENDAS[orden.tipoPrenda] ? orden.tipoPrenda : '';
            if (orden.tipoPrenda && !PRENDAS[orden.tipoPrenda]) {
                // Tipo que ya no está en la lista: se conserva tal cual
                const op = document.createElement('option');
                op.value = op.textContent = orden.tipoPrenda;
                $('tipo').append(op);
                $('tipo').value = orden.tipoPrenda;
            }
            pintarSpecs(orden);
            pintarCantidades(orden);
            $('obs').value = orden.observaciones || '';
            if (general) {
                if ($('impresora')) $('impresora').value = orden.impresora || '';
                cont.querySelectorAll('[data-req]').forEach((cb) => { if (cb.dataset.req !== 'despacho') cb.checked = !!orden.requerimientos?.[cb.dataset.req]; });
                marcarReqs();
            }
            const pares = [['diseno', 'imagenDiseno'], ['mangaDerecha', 'imagenMangaDerecha'], ['mangaIzquierda', 'imagenMangaIzquierda'], ['frente', 'imagenFrente'], ['espalda', 'imagenEspalda']];
            pares.forEach(([k, campo]) => {
                if (orden[campo]) {
                    imagenes[k] = orden[campo];
                    mostrarImagen($(k), orden[campo], () => (imagenes[k] = null));
                }
            });
            (orden.imagenesAdicionales || []).filter(Boolean).forEach((url) => agregarAdicional(url));
        }

        marcarReqs();
        return { leer, validar, total, cargar, tipo: () => $('tipo').value, raiz: cont };
    };
})();
