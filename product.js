(function () {
    function $(s, root = document) { return root.querySelector(s); }
    function $all(s, root = document) { return Array.from(root.querySelectorAll(s)); }

    document.addEventListener('DOMContentLoaded', function () {
        // Quantity controls
        const qtyInput = $('input[type="number"]');
        if (qtyInput) {
            const [prevBtn, nextBtn] = [qtyInput.previousElementSibling, qtyInput.nextElementSibling];
            if (prevBtn) prevBtn.addEventListener('click', () => { const v = parseInt(qtyInput.value) || 1; const min = parseInt(qtyInput.min) || 1; if (v > min) qtyInput.value = v - 1; });
            if (nextBtn) nextBtn.addEventListener('click', () => { const v = parseInt(qtyInput.value) || 1; qtyInput.value = v + 1; });
        }

        // Elements
        const thumbs = $all('[data-thumb]');
        const main = $('#main-image');
        const cartIcon = document.getElementById('cart-icon');
        const cartBadge = cartIcon ? cartIcon.querySelector('span') : null;
        const addBtn = document.querySelector('button.flex-grow');

        // Restore cart count
        let cartCount = parseInt(localStorage.getItem('cartCount') || '0');
        if (cartBadge) cartBadge.textContent = String(cartCount);

        // Thumbnail click -> update main image & highlight (do NOT auto-open modal)
        let current = 0;
        function highlight() { thumbs.forEach(t => { if (parseInt(t.dataset.thumb) === current) t.classList.add('thumb-active'); else t.classList.remove('thumb-active'); }); }
        function updateMain() {
            if (main) {
                const src = thumbs[current].dataset.src || (thumbs[current].querySelector('img') ? thumbs[current].querySelector('img').src : '');
                // fade effect
                const imgEl = main;
                try { imgEl.style.opacity = '0'; } catch (e) { }
                // wait a tick then change src so transition runs
                setTimeout(() => {
                    imgEl.src = src;
                    imgEl.onload = () => { imgEl.style.opacity = '1'; };
                }, 80);
            }
        }
        thumbs.forEach(t => { t.style.cursor = 'pointer'; t.addEventListener('click', () => { current = parseInt(t.dataset.thumb); updateMain(); highlight(); }); });
        updateMain(); highlight();

        // Lightbox modal
        const modal = document.createElement('div'); modal.id = 'lightbox';
        modal.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);z-index:9999;opacity:0;pointer-events:none;transition:opacity 200ms';
        const box = document.createElement('div'); box.style.cssText = 'max-width:90%;max-height:90%;background:#fff;border-radius:8px;overflow:hidden;position:relative;padding:20px;display:flex;align-items:center;justify-content:center;flex-direction:column;transform:scale(0.96);transition:transform 200ms ease';
        const content = document.createElement('div'); content.style.cssText = 'font-size:28px;color:#111;padding:0;display:flex;align-items:center;justify-content:center';
        const contentImg = document.createElement('img'); contentImg.style.cssText = 'max-width:100%;max-height:80vh;object-fit:contain;display:block;';
        content.appendChild(contentImg);
        const closeBtn = document.createElement('button'); closeBtn.textContent = '✕'; closeBtn.style.cssText = 'position:absolute;top:8px;right:8px;background:#111;color:#fff;border-radius:6px;padding:6px 8px';
        const prev = document.createElement('button'); prev.textContent = '‹'; prev.style.cssText = 'position:absolute;left:8px;top:50%;transform:translateY(-50%);background:transparent;border:none;font-size:28px;color:#111';
        const next = document.createElement('button'); next.textContent = '›'; next.style.cssText = 'position:absolute;right:8px;top:50%;transform:translateY(-50%);background:transparent;border:none;font-size:28px;color:#111';
        box.appendChild(content); box.appendChild(closeBtn); box.appendChild(prev); box.appendChild(next); modal.appendChild(box); document.body.appendChild(modal);

        function updateModal() { const src = thumbs[current].dataset.src || (thumbs[current].querySelector('img') ? thumbs[current].querySelector('img').src : ''); contentImg.src = src; }
        function openModal() { modal.style.opacity = '1'; modal.style.pointerEvents = 'auto'; updateModal(); box.style.transform = 'scale(1)'; }
        function closeModal() { modal.style.opacity = '0'; modal.style.pointerEvents = 'none'; isZoomed = false; contentImg.style.transform = ''; contentImg.style.cursor = ''; contentImg.style.transformOrigin = ''; box.style.transform = 'scale(0.96)'; }

        closeBtn.addEventListener('click', closeModal);
        // close when clicking outside the box
        modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
        // open modal when clicking main image
        if (main) main.addEventListener('click', openModal);

        // keyboard navigation (Esc to close, arrows to navigate)
        document.addEventListener('keydown', function (e) { if (modal.style.pointerEvents === 'auto') { if (e.key === 'Escape') closeModal(); if (e.key === 'ArrowLeft') prev.click(); if (e.key === 'ArrowRight') next.click(); } });
        prev.addEventListener('click', () => { current = (current - 1 + thumbs.length) % thumbs.length; updateModal(); updateMain(); highlight(); });
        next.addEventListener('click', () => { current = (current + 1) % thumbs.length; updateModal(); updateMain(); highlight(); });

        // swipe support
        let startX = 0;
        content.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; });
        content.addEventListener('touchend', (e) => { const dx = (e.changedTouches[0].clientX - startX); if (Math.abs(dx) > 30) { if (dx < 0) next.click(); else prev.click(); } });

        // double-click to zoom / pan inside modal
        let isZoomed = false;
        content.addEventListener('dblclick', function (e) { isZoomed = !isZoomed; if (isZoomed) { contentImg.style.transform = 'scale(2)'; contentImg.style.cursor = 'grab'; } else { contentImg.style.transform = ''; contentImg.style.cursor = ''; contentImg.style.transformOrigin = ''; } });
        content.addEventListener('mousemove', function (e) { if (!isZoomed) return; const rect = content.getBoundingClientRect(); const x = (e.clientX - rect.left) / rect.width * 100; const y = (e.clientY - rect.top) / rect.height * 100; contentImg.style.transformOrigin = x + '% ' + y + '%'; });

        // show toast
        function showToast(text) { const t = document.createElement('div'); t.textContent = text; t.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:24px;background:#111;color:#fff;padding:10px 14px;border-radius:8px;z-index:10000;'; document.body.appendChild(t); setTimeout(() => { t.style.transition = 'opacity 300ms'; t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 1500); }

        // Fly-to-cart animation (accept optional source image element)
        function flyToCart(sourceImage) {
            const srcEl = sourceImage || main;
            if (!srcEl || !cartIcon) return;
            const imgRect = srcEl.getBoundingClientRect();
            const cartRect = cartIcon.getBoundingClientRect();
            const clone = srcEl.cloneNode(true);
            clone.style.position = 'fixed';
            clone.style.left = imgRect.left + 'px';
            clone.style.top = imgRect.top + 'px';
            clone.style.width = imgRect.width + 'px';
            clone.style.height = imgRect.height + 'px';
            clone.style.zIndex = 20000;
            clone.style.transition = 'transform 700ms cubic-bezier(.2,.8,.2,1),opacity 700ms';
            document.body.appendChild(clone);
            const dx = (cartRect.left + cartRect.width / 2) - (imgRect.left + imgRect.width / 2);
            const dy = (cartRect.top + cartRect.height / 2) - (imgRect.top + imgRect.height / 2);
            requestAnimationFrame(() => {
                clone.style.transform = `translate(${dx}px, ${dy}px) scale(0.12)`;
                clone.style.opacity = '0.6';
            });
            setTimeout(() => { clone.remove(); }, 800);
        }

        // Add to cart handler (main product)
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const q = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
                cartCount += q; localStorage.setItem('cartCount', String(cartCount)); if (cartBadge) cartBadge.textContent = String(cartCount);
                flyToCart(); showToast('Added ' + q + ' item(s) to cart');
            });
        }

        // Quick Comparison: wire Add-to-cart buttons to existing flow
        (function wireQuickComparisonAdd() {
            const qcHeader = Array.from(document.querySelectorAll('h2')).find(h => h.textContent && h.textContent.trim().toUpperCase().includes('QUICK COMPARISON'));
            if (!qcHeader) return;
            const qcWrap = qcHeader.nextElementSibling;
            if (!qcWrap) return;

            const qcAddButtons = qcWrap.querySelectorAll('.comparison-row button');
            qcAddButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const q = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
                    cartCount += q; localStorage.setItem('cartCount', String(cartCount)); if (cartBadge) cartBadge.textContent = String(cartCount);

                    // Try to find an image within the same column/cell to animate from
                    let imgEl = null;
                    // the grid is arranged as columns; find the parent cell then search upward for an img sibling in the same column
                    let parentCell = btn.closest('.comparison-row');
                    if (parentCell) {
                        // get index of this cell among its siblings
                        const cells = Array.from(parentCell.parentElement.children);
                        const idx = cells.indexOf(parentCell);
                        if (idx >= 0) {
                            // the grid earlier contains the images in the first set of children; try to locate the image by walking up the qcWrap grid
                            const grid = qcWrap.querySelector('div');
                            if (grid) {
                                // try: find the first row of the grid and use the cell at similar column index
                                const columns = Array.from(grid.children);
                                if (columns && columns.length > idx) {
                                    const col = columns[idx];
                                    if (col) imgEl = col.querySelector('img');
                                }
                            }
                        }
                    }

                    // fallback to main image
                    flyToCart(imgEl || main);
                    showToast('Added ' + q + ' item(s) to cart');
                });
            });

            // add a floating circular QC button with white arrow SVG (if not present)
            if (!qcWrap.querySelector('.qc-float-btn')) {
                const floatBtnQC = document.createElement('button'); floatBtnQC.className = 'qc-float-btn';
                floatBtnQC.innerHTML = '<svg class="qc-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5l8 7-8 7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                qcWrap.appendChild(floatBtnQC);
                floatBtnQC.addEventListener('click', () => { qcWrap.scrollBy({ left: Math.max(qcWrap.clientWidth * 0.7, 300), behavior: 'smooth' }); });

                function updateQCFloat() {
                    const overflow = qcWrap.scrollWidth > qcWrap.clientWidth + 5;
                    if (!overflow) { floatBtnQC.classList.add('hidden'); } else {
                        // hide when at right-most
                        if (qcWrap.scrollLeft + qcWrap.clientWidth >= qcWrap.scrollWidth - 10) floatBtnQC.classList.add('hidden'); else floatBtnQC.classList.remove('hidden');
                    }
                }
                qcWrap.addEventListener('scroll', updateQCFloat); window.addEventListener('resize', updateQCFloat); setTimeout(updateQCFloat, 60);
            }
        })();

        // Search action (simple)
        const searchInput = document.querySelector('input[placeholder="Search Products..."]');
        if (searchInput) { const searchBtn = searchInput.parentElement.querySelector('button'); if (searchBtn) searchBtn.addEventListener('click', () => { const q = searchInput.value.trim(); if (!q) showToast('Please enter a search term'); else { showToast('Searching: ' + q); console.log('Search query:', q); } }); }

        // Floating button scroll-to-top
        const floatBtn = document.querySelector('button.fixed'); if (floatBtn) floatBtn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });

        // Heart / favorite buttons: toggle black background and swap to filled-heart SVG when clicked
        const heartBtns = $all('button.btn-heart');
        heartBtns.forEach(btn => {
            const svg = btn.querySelector('svg');
            if (svg) {
                // store original (outline) SVG inner markup so we can restore it
                svg.dataset.outline = svg.innerHTML;
                // simple filled-heart path (uses currentColor)
                svg.dataset.filled = '<path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5C2 6.01 4.01 4 6.5 4c1.74 0 3.41 0.99 4.5 2.09C12.09 4.99 13.76 4 15.5 4C17.99 4 20 6.01 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>';
            }

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                btn.classList.toggle('heart-active');
                if (btn.classList.contains('heart-active')) {
                    btn.style.background = '#000';
                    btn.style.color = '#fff';
                    if (svg) { svg.setAttribute('fill', 'currentColor'); svg.innerHTML = svg.dataset.filled; }
                } else {
                    btn.style.background = '';
                    btn.style.color = '';
                    if (svg) { svg.removeAttribute('fill'); svg.innerHTML = svg.dataset.outline; }
                }
            });
        });

        // For the first RELATED PRODUCTS card: when clicking the eye or compare buttons,
        // convert those buttons into filled black hearts and also activate the main heart.
        (function () {
            const relHeader = Array.from(document.querySelectorAll('h2')).find(h => h.textContent && h.textContent.trim().toUpperCase().includes('RELATED PRODUCTS'));
            if (!relHeader) return;
            const section = relHeader.closest('section'); if (!section) return;
            const grid = section.querySelector('.grid') || section.querySelector('div'); if (!grid) return;
            const groups = Array.from(grid.querySelectorAll('.group')); if (groups.length === 0) return;
            const first = groups[0];
            const actions = first.querySelector('div.absolute.top-4.right-4'); if (!actions) return;
            const actionBtns = Array.from(actions.querySelectorAll('button'));
            // We expect order [heart, view, compare]
            [1, 2].forEach(i => {
                const btn = actionBtns[i]; if (!btn) return;
                btn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    // mark this button as a heart and filled
                    btn.classList.add('btn-heart', 'heart-active');
                    const svg = btn.querySelector('svg');
                    if (svg) {
                        if (!svg.dataset.outline) svg.dataset.outline = svg.innerHTML;
                        svg.dataset.filled = '<path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5C2 6.01 4.01 4 6.5 4c1.74 0 3.41 0.99 4.5 2.09C12.09 4.99 13.76 4 15.5 4C17.99 4 20 6.01 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>';
                        svg.setAttribute('fill', 'currentColor');
                        svg.innerHTML = svg.dataset.filled;
                    }
                    // ensure main heart button is active too
                    const mainHeart = actions.querySelector('button.btn-heart');
                    if (mainHeart && !mainHeart.classList.contains('heart-active')) {
                        mainHeart.classList.add('heart-active');
                        mainHeart.style.background = '#000'; mainHeart.style.color = '#fff';
                        const hsvg = mainHeart.querySelector('svg');
                        if (hsvg && hsvg.dataset && hsvg.dataset.filled) { hsvg.setAttribute('fill', 'currentColor'); hsvg.innerHTML = hsvg.dataset.filled; }
                    }
                });
            });
        })();

        // Horizontal scroll controls for RELATED PRODUCTS and Quick Comparison
        (function () {
            function makeHorizontalScroll(wrapperSelector) {
                document.querySelectorAll(wrapperSelector).forEach(wrapper => {
                    // Avoid double-initialization
                    if (wrapper.dataset.scrollInit) return; wrapper.dataset.scrollInit = '1';
                    const step = Math.max(wrapper.clientWidth * 0.7, 300);
                    const left = document.createElement('button'); left.className = 'scroll-btn scroll-btn-left'; left.innerHTML = '‹';
                    const right = document.createElement('button'); right.className = 'scroll-btn scroll-btn-right'; right.innerHTML = '›';
                    wrapper.appendChild(left); wrapper.appendChild(right);
                    left.addEventListener('click', () => wrapper.scrollBy({ left: -step, behavior: 'smooth' }));
                    right.addEventListener('click', () => wrapper.scrollBy({ left: step, behavior: 'smooth' }));

                    // Drag to scroll (mouse)
                    let isDown = false, startX, scrollLeft;
                    wrapper.addEventListener('mousedown', (e) => { isDown = true; wrapper.classList.add('dragging'); startX = e.pageX - wrapper.offsetLeft; scrollLeft = wrapper.scrollLeft; wrapper.style.cursor = 'grabbing'; });
                    wrapper.addEventListener('mouseleave', () => { isDown = false; wrapper.classList.remove('dragging'); wrapper.style.cursor = ''; });
                    wrapper.addEventListener('mouseup', () => { isDown = false; wrapper.classList.remove('dragging'); wrapper.style.cursor = ''; });
                    wrapper.addEventListener('mousemove', (e) => { if (!isDown) return; e.preventDefault(); const x = e.pageX - wrapper.offsetLeft; const walk = (x - startX) * 1.5; wrapper.scrollLeft = scrollLeft - walk; });

                    // Touch drag
                    wrapper.addEventListener('touchstart', (e) => { startX = e.touches[0].pageX - wrapper.offsetLeft; scrollLeft = wrapper.scrollLeft; });
                    wrapper.addEventListener('touchmove', (e) => { const x = e.touches[0].pageX - wrapper.offsetLeft; const walk = (x - startX) * 1.2; wrapper.scrollLeft = scrollLeft - walk; });

                    // Toggle enabled state of buttons (always visible so user sees controls)
                    function updateBtns() {
                        // always show the buttons so user knows controls exist
                        left.style.display = 'flex'; right.style.display = 'flex';
                        const overflow = wrapper.scrollWidth > wrapper.clientWidth + 5;
                        // left disabled when already at left-most
                        left.disabled = wrapper.scrollLeft <= 10;
                        // right disabled when no overflow or at right-most
                        right.disabled = !(overflow && (wrapper.scrollWidth - wrapper.clientWidth - wrapper.scrollLeft) > 10);
                    }
                    wrapper.addEventListener('scroll', updateBtns);
                    window.addEventListener('resize', updateBtns);
                    // initial
                    updateBtns();
                });
            }

            // Ensure Quick Comparison wrapper also gets the helper class
            const qcHeader = Array.from(document.querySelectorAll('h2')).find(h => h.textContent && h.textContent.trim().toUpperCase().includes('QUICK COMPARISON'));
            if (qcHeader) { const qcWrap = qcHeader.nextElementSibling; if (qcWrap && qcWrap.classList && qcWrap.classList.contains('overflow-x-auto')) qcWrap.classList.add('rel-scroll-wrapper'); }

            // Initialize on related/quickcomparison wrappers
            makeHorizontalScroll('.rel-scroll-wrapper');
        })();

        // Custom visual scrollbar (track + thumb) for rel-scroll-wrapper
        (function () {
            function attachCustomScrollbar(wrapper) {
                if (wrapper.dataset.hcAttached) return; wrapper.dataset.hcAttached = '1';
                // create scrollbar DOM
                const bar = document.createElement('div'); bar.className = 'hc-scrollbar';
                const track = document.createElement('div'); track.className = 'hc-track';
                const thumb = document.createElement('div'); thumb.className = 'hc-thumb';
                track.appendChild(thumb);
                // add inner arrow to the thumb
                const thumbInner = document.createElement('div'); thumbInner.className = 'hc-thumb-inner';
                thumbInner.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5l8 7-8 7" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                thumb.appendChild(thumbInner);
                bar.appendChild(track); wrapper.appendChild(bar);

                function updateThumb() {
                    const sw = wrapper.scrollWidth, cw = wrapper.clientWidth;
                    const tw = track.clientWidth;
                    if (!sw || sw <= cw) { thumb.style.display = 'none'; return; }
                    thumb.style.display = 'flex';
                    // fixed knob width for circular style
                    const thumbWidth = 32;
                    const maxLeft = Math.max(0, tw - thumbWidth);
                    const ratio = wrapper.scrollLeft / (sw - cw || 1);
                    const left = Math.round(ratio * maxLeft);
                    thumb.style.width = thumbWidth + 'px';
                    thumb.style.left = left + 'px';
                }

                // handle dragging the thumb
                let dragging = false, dragStartX = 0, startLeft = 0;
                thumb.addEventListener('mousedown', (e) => { dragging = true; dragStartX = e.clientX; startLeft = parseFloat(thumb.style.left) || 0; document.body.style.userSelect = 'none'; });
                document.addEventListener('mousemove', (e) => {
                    if (!dragging) return; const dx = e.clientX - dragStartX; const tw = track.clientWidth; const thumbW = thumb.clientWidth; const maxLeft = tw - thumbW; let newLeft = Math.min(Math.max(0, startLeft + dx), maxLeft); thumb.style.left = newLeft + 'px'; const ratio = newLeft / (maxLeft || 1); wrapper.scrollLeft = Math.round(ratio * (wrapper.scrollWidth - wrapper.clientWidth));
                });
                document.addEventListener('mouseup', () => { if (dragging) { dragging = false; document.body.style.userSelect = ''; } });

                // touch support for thumb
                thumb.addEventListener('touchstart', (e) => { dragging = true; dragStartX = e.touches[0].clientX; startLeft = parseFloat(thumb.style.left) || 0; });
                document.addEventListener('touchmove', (e) => { if (!dragging) return; const dx = e.touches[0].clientX - dragStartX; const tw = track.clientWidth; const thumbW = thumb.clientWidth; const maxLeft = tw - thumbW; let newLeft = Math.min(Math.max(0, startLeft + dx), maxLeft); thumb.style.left = newLeft + 'px'; const ratio = newLeft / (maxLeft || 1); wrapper.scrollLeft = Math.round(ratio * (wrapper.scrollWidth - wrapper.clientWidth)); });
                document.addEventListener('touchend', () => { dragging = false; });

                // click on track to move thumb
                track.addEventListener('click', (e) => { if (e.target === thumb) return; const rect = track.getBoundingClientRect(); const clickX = e.clientX - rect.left; const tw = track.clientWidth; const thumbW = thumb.clientWidth; const maxLeft = tw - thumbW; let newLeft = Math.min(Math.max(0, clickX - thumbW / 2), maxLeft); const ratio = newLeft / (maxLeft || 1); wrapper.scrollLeft = Math.round(ratio * (wrapper.scrollWidth - wrapper.clientWidth)); updateThumb(); });

                // sync on scroll/resize
                wrapper.addEventListener('scroll', updateThumb);
                window.addEventListener('resize', updateThumb);
                // initial
                setTimeout(updateThumb, 50);
            }

            // Only attach custom scrollbar to Quick Comparison wrapper (qc-scroll-wrapper)
            document.querySelectorAll('.rel-scroll-wrapper.qc-scroll-wrapper').forEach(w => attachCustomScrollbar(w));
            // observe future additions
            const obs = new MutationObserver(() => { document.querySelectorAll('.rel-scroll-wrapper').forEach(w => attachCustomScrollbar(w)); });
            obs.observe(document.body, { childList: true, subtree: true });
        })();
    });
})();