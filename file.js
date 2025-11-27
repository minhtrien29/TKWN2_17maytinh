document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. XỬ LÝ SLIDER BEFORE/AFTER ---
    const slider = document.getElementById('comparison-slider');
    const resizer = document.getElementById('resizer');
    const handle = document.getElementById('handle');
    const imgBefore = document.getElementById('img-before');

    function updateImageWidth() {
        if(slider && imgBefore) {
            imgBefore.style.width = slider.offsetWidth + 'px';
        }
    }
    updateImageWidth();
    window.addEventListener('resize', updateImageWidth);

    let isDown = false;

    function move(e) {
        if (!isDown) return;
        let clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const rect = slider.getBoundingClientRect();
        let x = clientX - rect.left;

        if (x < 0) x = 0;
        if (x > rect.width) x = rect.width;

        const percent = (x / rect.width) * 100;
        resizer.style.width = percent + '%';
        handle.style.left = percent + '%';
    }

    if(handle) {
        handle.addEventListener('mousedown', () => isDown = true);
        window.addEventListener('mouseup', () => isDown = false);
        slider.addEventListener('mousemove', move);
        
        // Mobile support
        handle.addEventListener('touchstart', () => isDown = true);
        window.addEventListener('touchend', () => isDown = false);
        slider.addEventListener('touchmove', move);
    }

    // --- 2. XỬ LÝ ĐẾM NGƯỢC ---
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 2); // 2 ngày tới

    function updateCountdown() {
        const now = new Date();
        const diff = endTime - now;
        if (diff <= 0) return;

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);

        if(document.getElementById('days')) {
            document.getElementById('days').innerText = d < 10 ? '0'+d : d;
            document.getElementById('hours').innerText = h < 10 ? '0'+h : h;
            document.getElementById('mins').innerText = m < 10 ? '0'+m : m;
            document.getElementById('secs').innerText = s < 10 ? '0'+s : s;
        }
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();
});