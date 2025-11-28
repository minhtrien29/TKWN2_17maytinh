document.addEventListener("DOMContentLoaded", () => {
    
    // ĐỒNG HỒ
    const deadline = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const t = deadline - now;
        const days = Math.floor(t / (1000 * 60 * 60 * 24));
        const hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((t % (1000 * 60)) / 1000);

        const countdowns = document.querySelectorAll('.countdown-timer');
        countdowns.forEach(timer => {
            timer.querySelector('.days').innerHTML = (days < 10 && days >= 0) ? "0" + days : (days >=0 ? days : "00");
            timer.querySelector('.hours').innerHTML = (hours < 10 && hours >= 0) ? "0" + hours : (hours >=0 ? hours : "00");
            timer.querySelector('.mins').innerHTML = (minutes < 10 && minutes >= 0) ? "0" + minutes : (minutes >=0 ? minutes : "00");
            timer.querySelector('.secs').innerHTML = (seconds < 10 && seconds >= 0) ? "0" + seconds : (seconds >=0 ? seconds : "00");
        });
        if (t < 0) clearInterval(timeinterval);
    }
    updateCountdown();
    const timeinterval = setInterval(updateCountdown, 1000);

    // SLIDER
    const sliderContainer = document.getElementById('comparison-slider');
    const resizer = document.getElementById('resizer');
    const handle = document.getElementById('handle');

    if(sliderContainer && resizer && handle) {
        let isDown = false;
        function move(e) {
            if (!isDown) return;
            let clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const rect = sliderContainer.getBoundingClientRect();
            const x = clientX - rect.left;
            const width = Math.max(0, Math.min(x, rect.width));
            const percentage = (width / rect.width) * 100;
            resizer.style.width = percentage + "%";
            handle.style.left = percentage + "%";
        }
        handle.addEventListener('mousedown', () => isDown = true);
        window.addEventListener('mouseup', () => isDown = false);
        sliderContainer.addEventListener('mousemove', move);
        handle.addEventListener('touchstart', (e) => {
            isDown = true;
            if(e.target === handle || handle.contains(e.target)) e.preventDefault();
        }, { passive: false });
        window.addEventListener('touchend', () => isDown = false);
        sliderContainer.addEventListener('touchmove', move);
    }
    
    // MENU MOBILE
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('main-nav');
    if(menuBtn && navMenu) {
        menuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('hidden');
            navMenu.classList.toggle('flex');
            navMenu.classList.toggle('flex-col');
            navMenu.classList.toggle('absolute');
            navMenu.classList.toggle('top-full');
            navMenu.classList.toggle('left-0');
            navMenu.classList.toggle('w-full');
            navMenu.classList.toggle('bg-tech-bg');
            navMenu.classList.toggle('p-4');
            navMenu.classList.toggle('shadow-xl');
            navMenu.classList.toggle('z-50');
        });
    }
});
