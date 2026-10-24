/**
 * QuantumPulse Studios - Master Portal Logic
 * Dynamic Canvas Physics & Interactive Wave Resonance Lab
 */

document.addEventListener('DOMContentLoaded', () => {
    initPulseField();
    initHarmonicResonanceLab();
});

/* ===================================================================
   1. Atmospheric Quantum Pulse Starfield & Grid
   =================================================================== */
function initPulseField() {
    const canvas = document.getElementById('pulse-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = { x: width / 2, y: height / 2, radius: 150 };

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    const dots = [];
    const numDots = Math.min(Math.floor((width * height) / 18000), 75);

    for (let i = 0; i < numDots; i++) {
        dots.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            baseRadius: Math.random() * 1.5 + 0.8,
            color: i % 2 === 0 ? 'rgba(0, 240, 255,' : 'rgba(168, 85, 247,'
        });
    }

    function render() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < dots.length; i++) {
            const d = dots[i];
            d.x += d.vx;
            d.y += d.vy;

            if (d.x < 0 || d.x > width) d.vx *= -1;
            if (d.y < 0 || d.y > height) d.vy *= -1;

            const dx = mouse.x - d.x;
            const dy = mouse.y - d.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let currentRadius = d.baseRadius;
            if (dist < mouse.radius) {
                const force = (mouse.radius - dist) / mouse.radius;
                d.x -= Math.cos(Math.atan2(dy, dx)) * force * 1.5;
                d.y -= Math.sin(Math.atan2(dy, dx)) * force * 1.5;
                currentRadius += force * 2;
            }

            ctx.beginPath();
            ctx.arc(d.x, d.y, currentRadius, 0, Math.PI * 2);
            ctx.fillStyle = d.color + ' 0.85)';
            ctx.fill();

            for (let j = i + 1; j < dots.length; j++) {
                const d2 = dots[j];
                const distance = Math.hypot(d.x - d2.x, d.y - d2.y);
                if (distance < 125) {
                    ctx.beginPath();
                    ctx.moveTo(d.x, d.y);
                    ctx.lineTo(d2.x, d2.y);
                    ctx.strokeStyle = `rgba(0, 240, 255, ${(1 - distance / 125) * 0.18})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(render);
    }

    render();
}

/* ===================================================================
   2. Interactive Harmonic Resonance Lab Canvas
   =================================================================== */
function initHarmonicResonanceLab() {
    const canvas = document.getElementById('harmonic-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const freqSlider = document.getElementById('freq-slider');
    const harmSlider = document.getElementById('harm-slider');
    const dampSlider = document.getElementById('damping-slider');
    const burstBtn = document.getElementById('burst-pulse-btn');

    const freqVal = document.getElementById('freq-val');
    const harmVal = document.getElementById('harm-val');
    const dampVal = document.getElementById('damping-val');

    function resizeLab() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    resizeLab();
    window.addEventListener('resize', resizeLab);

    let frequency = parseFloat(freqSlider.value);
    let harmonics = parseInt(harmSlider.value);
    let damping = parseFloat(dampSlider.value);
    let burstEnergy = 0;

    freqSlider.addEventListener('input', (e) => {
        frequency = parseFloat(e.target.value);
        freqVal.textContent = frequency.toFixed(1) + ' Hz';
    });

    harmSlider.addEventListener('input', (e) => {
        harmonics = parseInt(e.target.value);
        harmVal.textContent = harmonics;
    });

    dampSlider.addEventListener('input', (e) => {
        damping = parseFloat(e.target.value);
        dampVal.textContent = damping.toFixed(2);
    });

    if (burstBtn) {
        burstBtn.addEventListener('click', () => {
            burstEnergy = 2.5;
        });
    }

    let time = 0;

    function renderHarmonics() {
        const w = canvas.width;
        const h = canvas.height;
        ctx.fillStyle = 'rgba(4, 5, 8, 0.25)';
        ctx.fillRect(0, 0, w, h);

        const centerY = h / 2;
        const amplitude = (h / 4) * (1 + burstEnergy);

        // Draw multiple interfering standing harmonic waves
        for (let wave = 1; wave <= harmonics; wave++) {
            ctx.beginPath();
            const waveHue = (wave * 55 + time * 30) % 360;
            ctx.strokeStyle = `hsla(${waveHue}, 85%, 60%, ${0.7 / harmonics + 0.2})`;
            ctx.lineWidth = wave === 1 ? 2.5 : 1.5;

            for (let x = 0; x < w; x += 3) {
                const normX = x / w;
                // Standing wave interference formula
                const y = centerY + 
                    Math.sin(normX * Math.PI * wave * frequency + time * wave) * 
                    Math.cos(normX * Math.PI * 2 + time * 0.8) * 
                    (amplitude / wave);

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // Draw central quantum resonance ring
        ctx.beginPath();
        const ringRadius = 35 + Math.sin(time * 3) * 8 + burstEnergy * 25;
        ctx.arc(w / 2, centerY, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.4 + burstEnergy * 0.3})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Damping energy decay
        if (burstEnergy > 0) {
            burstEnergy -= damping * 0.35;
            if (burstEnergy < 0) burstEnergy = 0;
        }

        time += 0.028;
        requestAnimationFrame(renderHarmonics);
    }

    renderHarmonics();
}
