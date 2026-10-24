/**
 * QuantumPulse Studios - Master Portal Logic
 * 1. Background Pulse Canvas
 * 2. 3D VSEPR Molecular Sandbox (Elements 1-83, No Tc/Pm) with real-time 3D auto-relaxation
 * 3. UGE 3D Viewport & Shader Pipeline Inspector
 */

document.addEventListener('DOMContentLoaded', () => {
    initPulseField();
    initVseprSandbox();
    initUgeShaderInspector();
});

/* ===================================================================
   1. Background Pulse Canvas (Atmospheric Stars & Field)
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
    const numDots = Math.min(Math.floor((width * height) / 22000), 55);

    for (let i = 0; i < numDots; i++) {
        dots.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            baseRadius: Math.random() * 1.4 + 0.8,
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
            const dist = Math.hypot(dx, dy);

            let currentRadius = d.baseRadius;
            if (dist < mouse.radius) {
                const force = (mouse.radius - dist) / mouse.radius;
                d.x -= Math.cos(Math.atan2(dy, dx)) * force * 1.5;
                d.y -= Math.sin(Math.atan2(dy, dx)) * force * 1.5;
                currentRadius += force * 1.8;
            }

            ctx.beginPath();
            ctx.arc(d.x, d.y, currentRadius, 0, Math.PI * 2);
            ctx.fillStyle = d.color + ' 0.8)';
            ctx.fill();

            for (let j = i + 1; j < dots.length; j++) {
                const d2 = dots[j];
                const distance = Math.hypot(d.x - d2.x, d.y - d2.y);
                if (distance < 120) {
                    ctx.beginPath();
                    ctx.moveTo(d.x, d.y);
                    ctx.lineTo(d2.x, d2.y);
                    ctx.strokeStyle = `rgba(0, 240, 255, ${(1 - distance / 120) * 0.16})`;
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
   2. 3D VSEPR Molecular Sandbox (Elements 1-83, No #43 Tc / #61 Pm)
   =================================================================== */
function initVseprSandbox() {
    const canvas = document.getElementById('vsepr-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 81 Stable Elements: 1 to 83, excluding Technetium (#43) & Promethium (#61)
    const ELEMENTS = [
        { s: 'H',  n: 'Hydrogen',   z: 1,  c: '#ffffff', val: 1 },
        { s: 'He', n: 'Helium',     z: 2,  c: '#d9ffff', val: 0 },
        { s: 'Li', n: 'Lithium',    z: 3,  c: '#cc80ff', val: 1 },
        { s: 'Be', n: 'Beryllium',  z: 4,  c: '#c2ff00', val: 2 },
        { s: 'B',  n: 'Boron',      z: 5,  c: '#ffb5b5', val: 3 },
        { s: 'C',  n: 'Carbon',     z: 6,  c: '#909090', val: 4 },
        { s: 'N',  n: 'Nitrogen',   z: 7,  c: '#3050f8', val: 3 },
        { s: 'O',  n: 'Oxygen',     z: 8,  c: '#ff0d0d', val: 2 },
        { s: 'F',  n: 'Fluorine',   z: 9,  c: '#90e050', val: 1 },
        { s: 'Ne', n: 'Neon',       z: 10, c: '#b3e3f5', val: 0 },
        { s: 'Na', n: 'Sodium',     z: 11, c: '#ab5cf2', val: 1 },
        { s: 'Mg', n: 'Magnesium',  z: 12, c: '#8aff00', val: 2 },
        { s: 'Al', n: 'Aluminium',  z: 13, c: '#bfa6a6', val: 3 },
        { s: 'Si', n: 'Silicon',    z: 14, c: '#f0c8a0', val: 4 },
        { s: 'P',  n: 'Phosphorus', z: 15, c: '#ff8000', val: 5 },
        { s: 'S',  n: 'Sulfur',     z: 16, c: '#ffff30', val: 6 },
        { s: 'Cl', n: 'Chlorine',   z: 17, c: '#1ff01f', val: 1 },
        { s: 'Ar', n: 'Argon',      z: 18, c: '#80d1e3', val: 0 },
        { s: 'K',  n: 'Potassium',  z: 19, c: '#8f40d4', val: 1 },
        { s: 'Ca', n: 'Calcium',    z: 20, c: '#3dff00', val: 2 },
        { s: 'Sc', n: 'Scandium',   z: 21, c: '#e6e6e6', val: 3 },
        { s: 'Ti', n: 'Titanium',   z: 22, c: '#bfc2c7', val: 4 },
        { s: 'V',  n: 'Vanadium',   z: 23, c: '#a6a6ab', val: 5 },
        { s: 'Cr', n: 'Chromium',   z: 24, c: '#8a99c7', val: 6 },
        { s: 'Mn', n: 'Manganese',  z: 25, c: '#9c7ac7', val: 4 },
        { s: 'Fe', n: 'Iron',       z: 26, c: '#e06633', val: 3 },
        { s: 'Co', n: 'Cobalt',     z: 27, c: '#f090a0', val: 2 },
        { s: 'Ni', n: 'Nickel',     z: 28, c: '#50d050', val: 2 },
        { s: 'Cu', n: 'Copper',     z: 29, c: '#c88033', val: 2 },
        { s: 'Zn', n: 'Zinc',       z: 30, c: '#7d80b0', val: 2 },
        { s: 'Ga', n: 'Gallium',    z: 31, c: '#c28f8f', val: 3 },
        { s: 'Ge', n: 'Germanium',  z: 32, c: '#668f8f', val: 4 },
        { s: 'As', n: 'Arsenic',    z: 33, c: '#bd80e3', val: 3 },
        { s: 'Se', n: 'Selenium',   z: 34, c: '#ffa100', val: 2 },
        { s: 'Br', n: 'Bromine',    z: 35, c: '#a62929', val: 1 },
        { s: 'Kr', n: 'Krypton',    z: 36, c: '#5cb8d1', val: 0 },
        { s: 'Rb', n: 'Rubidium',   z: 37, c: '#702eb8', val: 1 },
        { s: 'Sr', n: 'Strontium',  z: 38, c: '#00ff00', val: 2 },
        { s: 'Y',  n: 'Yttrium',    z: 39, c: '#94ffff', val: 3 },
        { s: 'Zr', n: 'Zirconium',  z: 40, c: '#94e0e0', val: 4 },
        { s: 'Nb', n: 'Niobium',    z: 41, c: '#73c2c9', val: 5 },
        { s: 'Mo', n: 'Molybdenum', z: 42, c: '#54b5b5', val: 6 },
        { s: 'Ru', n: 'Ruthenium',  z: 44, c: '#248f8f', val: 3 },
        { s: 'Rh', n: 'Rhodium',    z: 45, c: '#0a7d8c', val: 3 },
        { s: 'Pd', n: 'Palladium',  z: 46, c: '#006985', val: 2 },
        { s: 'Ag', n: 'Silver',     z: 47, c: '#c0c0c0', val: 1 },
        { s: 'Cd', n: 'Cadmium',    z: 48, c: '#ffd98f', val: 2 },
        { s: 'In', n: 'Indium',     z: 49, c: '#a67573', val: 3 },
        { s: 'Sn', n: 'Tin',        z: 50, c: '#668080', val: 4 },
        { s: 'Sb', n: 'Antimony',   z: 51, c: '#9e63b5', val: 3 },
        { s: 'Te', n: 'Tellurium',  z: 52, c: '#d47a00', val: 2 },
        { s: 'I',  n: 'Iodine',     z: 53, c: '#940094', val: 1 },
        { s: 'Xe', n: 'Xenon',      z: 54, c: '#429eb0', val: 0 },
        { s: 'Cs', n: 'Caesium',    z: 55, c: '#57178f', val: 1 },
        { s: 'Ba', n: 'Barium',     z: 56, c: '#00c900', val: 2 },
        { s: 'La', n: 'Lanthanum',  z: 57, c: '#70d4ff', val: 3 },
        { s: 'Ce', n: 'Cerium',     z: 58, c: '#ffffc7', val: 3 },
        { s: 'Pr', n: 'Praseodymium',z: 59, c: '#d9ffc7', val: 3 },
        { s: 'Nd', n: 'Neodymium',  z: 60, c: '#c7ffc7', val: 3 },
        { s: 'Sm', n: 'Samarium',   z: 62, c: '#8fffc7', val: 3 },
        { s: 'Eu', n: 'Europium',   z: 63, c: '#61ffc7', val: 3 },
        { s: 'Gd', n: 'Gadolinium', z: 64, c: '#45ffc7', val: 3 },
        { s: 'Tb', n: 'Terbium',    z: 65, c: '#30ffc7', val: 3 },
        { s: 'Dy', n: 'Dysprosium', z: 66, c: '#1fffc7', val: 3 },
        { s: 'Ho', n: 'Holmium',    z: 67, c: '#00ff9c', val: 3 },
        { s: 'Er', n: 'Erbium',     z: 68, c: '#00e675', val: 3 },
        { s: 'Tm', n: 'Thulium',    z: 69, c: '#00d452', val: 3 },
        { s: 'Yb', n: 'Ytterbium',  z: 70, c: '#00bf38', val: 3 },
        { s: 'Lu', n: 'Lutetium',   z: 71, c: '#00ab24', val: 3 },
        { s: 'Hf', n: 'Hafnium',    z: 72, c: '#4dc2ff', val: 4 },
        { s: 'Ta', n: 'Tantalum',   z: 73, c: '#4da6ff', val: 5 },
        { s: 'W',  n: 'Tungsten',   z: 74, c: '#2194d6', val: 6 },
        { s: 'Re', n: 'Rhenium',    z: 75, c: '#267dab', val: 4 },
        { s: 'Os', n: 'Osmium',     z: 76, c: '#266696', val: 4 },
        { s: 'Ir', n: 'Iridium',    z: 77, c: '#175487', val: 3 },
        { s: 'Pt', n: 'Platinum',   z: 78, c: '#d0d0e0', val: 2 },
        { s: 'Au', n: 'Gold',       z: 79, c: '#ffd123', val: 1 },
        { s: 'Hg', n: 'Mercury',    z: 80, c: '#b8b8d0', val: 2 },
        { s: 'Tl', n: 'Thallium',   z: 81, c: '#a6544d', val: 3 },
        { s: 'Pb', n: 'Lead',       z: 82, c: '#575961', val: 4 },
        { s: 'Bi', n: 'Bismuth',    z: 83, c: '#9e4fb5', val: 3 }
    ];

    // Current State
    let centralElem = ELEMENTS.find(e => e.s === 'C') || ELEMENTS[5]; // Default Carbon
    let ligandCount = 4; // Default Methane CH4
    let rotX = 0.3;
    let rotY = 0.5;
    let zoom = 1.0;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    // Generate VSEPR ideal ligand unit vectors
    function getVseprGeometry(count) {
        switch (count) {
            case 1:
                return { name: 'Diatomic / Terminal', hybrid: 's/p', angle: '180.0°', vecs: [[0, 1, 0]] };
            case 2:
                return { name: 'Linear (180.0°)', hybrid: 'sp', angle: '180.0°', vecs: [[0, 1, 0], [0, -1, 0]] };
            case 3:
                return {
                    name: 'Trigonal Planar (120.0°)', hybrid: 'sp²', angle: '120.0°',
                    vecs: [[0, 1, 0], [Math.sin(2*Math.PI/3), Math.cos(2*Math.PI/3), 0], [-Math.sin(2*Math.PI/3), Math.cos(2*Math.PI/3), 0]]
                };
            case 4:
                return {
                    name: 'Tetrahedral (109.5°)', hybrid: 'sp³', angle: '109.5°',
                    vecs: [[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]].map(v => normalize(v))
                };
            case 5:
                return {
                    name: 'Trigonal Bipyramidal', hybrid: 'sp³d', angle: '90° / 120°',
                    vecs: [
                        [0, 1, 0], [0, -1, 0], // Axial
                        [1, 0, 0], [Math.cos(2*Math.PI/3), 0, Math.sin(2*Math.PI/3)], [Math.cos(4*Math.PI/3), 0, Math.sin(4*Math.PI/3)] // Equatorial
                    ]
                };
            case 6:
                return {
                    name: 'Octahedral (90.0°)', hybrid: 'sp³d²', angle: '90.0°',
                    vecs: [[1,0,0], [-1,0,0], [0,1,0], [0,-1,0], [0,0,1], [0,0,-1]]
                };
            default:
                return { name: 'Single Atom', hybrid: 'atomic', angle: '—', vecs: [] };
        }
    }

    function normalize(v) {
        const len = Math.hypot(v[0], v[1], v[2]) || 1;
        return [v[0]/len, v[1]/len, v[2]/len];
    }

    // Populate Element Palette
    const paletteContainer = document.getElementById('element-palette');
    const searchInput = document.getElementById('elem-search-input');

    function renderPalette(filter = '') {
        paletteContainer.innerHTML = '';
        const f = filter.toLowerCase().trim();
        ELEMENTS.filter(e => e.s.toLowerCase().includes(f) || e.n.toLowerCase().includes(f) || e.z.toString() === f).forEach(e => {
            const btn = document.createElement('div');
            btn.className = `elem-btn ${e.z === centralElem.z ? 'active' : ''}`;
            btn.innerHTML = `<span class="elem-sym" style="color: ${e.c}">${e.s}</span><span class="elem-z">${e.z}</span>`;
            btn.title = `${e.n} (Z=${e.z})`;
            btn.addEventListener('click', () => {
                centralElem = e;
                document.querySelectorAll('.elem-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateUI();
            });
            paletteContainer.appendChild(btn);
        });
    }

    renderPalette();

    if (searchInput) {
        searchInput.addEventListener('input', (e) => renderPalette(e.target.value));
    }

    // UI Buttons
    const addBtn = document.getElementById('add-ligand-btn');
    const removeBtn = document.getElementById('remove-ligand-btn');
    const resetBtn = document.getElementById('reset-molecule-btn');

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            if (ligandCount < 6) {
                ligandCount++;
                updateUI();
            }
        });
    }

    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            if (ligandCount > 1) {
                ligandCount--;
                updateUI();
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            centralElem = ELEMENTS.find(e => e.s === 'C');
            ligandCount = 4;
            rotX = 0.3;
            rotY = 0.5;
            zoom = 1.0;
            renderPalette();
            updateUI();
        });
    }

    function updateUI() {
        const geom = getVseprGeometry(ligandCount);
        document.getElementById('vsepr-geometry-name').textContent = `Geometry: ${geom.name}`;
        document.getElementById('ligand-count-badge').textContent = `${ligandCount} / 6 Ligands`;

        const ligandSym = centralElem.s === 'H' ? 'O' : 'H';
        document.getElementById('mol-formula-val').textContent = `${centralElem.s}${ligandSym}${ligandCount > 1 ? ligandCount : ''}`;
        document.getElementById('mol-hybrid-val').textContent = geom.hybrid;
        document.getElementById('mol-angle-val').textContent = geom.angle;
    }

    updateUI();

    // Resize Canvas
    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse Interaction
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        rotY += dx * 0.008;
        rotX += dy * 0.008;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => (isDragging = false));

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        zoom = Math.max(0.6, Math.min(zoom - e.deltaY * 0.001, 1.8));
    });

    // 3D Matrix Projection & Shaded Sphere Rendering
    let dynamicTime = 0;

    function render3DMolecule() {
        const w = canvas.width;
        const h = canvas.height;
        ctx.fillStyle = '#030407';
        ctx.fillRect(0, 0, w, h);

        const centerX = w / 2;
        const centerY = h / 2;
        const bondLength = 110 * zoom;

        // Auto slow idle spin if not dragging
        if (!isDragging) {
            rotY += 0.005;
        }

        const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
        const cosY = Math.cos(rotY), sinY = Math.sin(rotY);

        function project3D(x, y, z) {
            // Rotate Y
            let x1 = x * cosY + z * sinY;
            let y1 = y;
            let z1 = -x * sinY + z * cosY;

            // Rotate X
            let x2 = x1;
            let y2 = y1 * cosX - z1 * sinX;
            let z2 = y1 * sinX + z1 * cosX;

            const scale = 360 / (360 + z2);
            return {
                x: centerX + x2 * scale,
                y: centerY + y2 * scale,
                z: z2,
                scale: scale
            };
        }

        const geom = getVseprGeometry(ligandCount);
        const atoms = [];

        // Central Atom
        atoms.push({
            x: 0, y: 0, z: 0,
            radius: 26 * zoom,
            color: centralElem.c,
            label: centralElem.s,
            isCentral: true
        });

        // Bonded Ligands
        geom.vecs.forEach((vec, idx) => {
            // Add subtle physical relaxation vibration
            const jitter = Math.sin(dynamicTime * 3 + idx) * 0.02;
            const vx = vec[0] + jitter;
            const vy = vec[1] + jitter;
            const vz = vec[2] + jitter;
            const norm = normalize([vx, vy, vz]);

            atoms.push({
                x: norm[0] * bondLength,
                y: norm[1] * bondLength,
                z: norm[2] * bondLength,
                radius: 16 * zoom,
                color: centralElem.s === 'H' ? '#ff0d0d' : '#ffffff',
                label: centralElem.s === 'H' ? 'O' : 'H',
                isCentral: false
            });
        });

        // Project and sort by depth (Painter's Algorithm)
        const projectedAtoms = atoms.map(a => {
            const p = project3D(a.x, a.y, a.z);
            return { ...a, px: p.x, py: p.y, pz: p.z, scale: p.scale };
        });

        const centerP = projectedAtoms[0];

        // Draw Bonds first
        for (let i = 1; i < projectedAtoms.length; i++) {
            const ligP = projectedAtoms[i];
            ctx.beginPath();
            ctx.moveTo(centerP.px, centerP.py);
            ctx.lineTo(ligP.px, ligP.py);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 6 * zoom * ((centerP.scale + ligP.scale) / 2);
            ctx.stroke();

            // Inner bond glow line
            ctx.beginPath();
            ctx.moveTo(centerP.px, centerP.py);
            ctx.lineTo(ligP.px, ligP.py);
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
            ctx.lineWidth = 2 * zoom;
            ctx.stroke();
        }

        // Sort atoms back-to-front
        projectedAtoms.sort((a, b) => a.pz - b.pz);

        // Draw Shaded Spheres
        projectedAtoms.forEach(a => {
            const r = a.radius * a.scale;
            ctx.beginPath();
            ctx.arc(a.px, a.py, r, 0, Math.PI * 2);

            // Realistic 3D radial specular gradient
            const grad = ctx.createRadialGradient(
                a.px - r * 0.35, a.py - r * 0.35, r * 0.05,
                a.px, a.py, r
            );
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.2, a.color);
            grad.addColorStop(1, '#000000');

            ctx.fillStyle = grad;
            ctx.fill();

            // Element Symbol Label
            ctx.fillStyle = a.color === '#ffffff' ? '#0a0a0a' : '#ffffff';
            ctx.font = `bold ${Math.round(11 * a.scale * zoom)}px "Space Grotesk", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(a.label, a.px, a.py);
        });

        dynamicTime += 0.03;
        requestAnimationFrame(render3DMolecule);
    }

    render3DMolecule();
}

/* ===================================================================
   3. UGE Real-Time 3D Viewport & Shader Inspector
   =================================================================== */
function initUgeShaderInspector() {
    const canvas = document.getElementById('uge-viewport-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let currentPass = 'lit';
    let currentMesh = 'crystal';
    let lightAngle = 45;
    let roughness = 0.30;

    const passButtons = document.querySelectorAll('.btn-pass');
    const meshButtons = document.querySelectorAll('.btn-mesh');
    const lightSlider = document.getElementById('light-x-slider');
    const lightVal = document.getElementById('light-x-val');
    const roughSlider = document.getElementById('rough-slider');
    const roughVal = document.getElementById('rough-val');

    const hudPass = document.getElementById('uge-hud-pass');
    const hudMesh = document.getElementById('uge-hud-mesh');

    passButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            passButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPass = btn.dataset.pass;
            hudPass.textContent = `Pass: ${btn.textContent}`;
        });
    });

    meshButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            meshButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMesh = btn.dataset.mesh;
            hudMesh.textContent = `Mesh: ${btn.textContent}`;
        });
    });

    if (lightSlider) {
        lightSlider.addEventListener('input', (e) => {
            lightAngle = parseInt(e.target.value);
            lightVal.textContent = `${lightAngle}°`;
        });
    }

    if (roughSlider) {
        roughSlider.addEventListener('input', (e) => {
            roughness = parseFloat(e.target.value);
            roughVal.textContent = roughness.toFixed(2);
        });
    }

    function resizeUge() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    resizeUge();
    window.addEventListener('resize', resizeUge);

    // 3D Crystal / Polyhedron Geometry Generator
    function getMeshGeometry(type) {
        if (type === 'crystal') {
            // Octahedral double pyramid
            const vertices = [
                [0, 1.4, 0], [0, -1.4, 0],
                [1, 0, 0], [0, 0, 1], [-1, 0, 0], [0, 0, -1]
            ];
            const faces = [
                [0, 2, 3], [0, 3, 4], [0, 4, 5], [0, 5, 2],
                [1, 3, 2], [1, 4, 3], [1, 5, 4], [1, 2, 5]
            ];
            return { vertices, faces };
        } else if (type === 'torus') {
            // Hexagonal Ring
            const vertices = [];
            const faces = [];
            const n = 8;
            for (let i = 0; i < n; i++) {
                const a = (i / n) * Math.PI * 2;
                vertices.push([Math.cos(a) * 1.3, Math.sin(a) * 1.3, 0.3]);
                vertices.push([Math.cos(a) * 1.3, Math.sin(a) * 1.3, -0.3]);
                vertices.push([Math.cos(a) * 0.7, Math.sin(a) * 0.7, 0]);
            }
            for (let i = 0; i < n; i++) {
                const i0 = i * 3, i1 = ((i + 1) % n) * 3;
                faces.push([i0, i1, i0 + 2]);
                faces.push([i0 + 1, i1 + 1, i0 + 2]);
            }
            return { vertices, faces };
        } else {
            // Geodesic Icosahedron
            const t = (1.0 + Math.sqrt(5.0)) / 2.0;
            const vertices = [
                [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
                [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
                [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
            ].map(v => {
                const len = Math.hypot(v[0], v[1], v[2]);
                return [v[0] / len * 1.1, v[1] / len * 1.1, v[2] / len * 1.1];
            });
            const faces = [
                [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
                [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
                [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
                [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
            ];
            return { vertices, faces };
        }
    }

    let angleY = 0;
    let angleX = 0.4;

    function renderUgeViewport() {
        const w = canvas.width;
        const h = canvas.height;
        ctx.fillStyle = '#020305';
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        const scale = Math.min(w, h) * 0.28;

        angleY += 0.012;

        const radL = (lightAngle * Math.PI) / 180;
        const lightDir = [Math.cos(radL), 0.8, Math.sin(radL)];
        const lLen = Math.hypot(...lightDir);
        lightDir[0] /= lLen; lightDir[1] /= lLen; lightDir[2] /= lLen;

        const mesh = getMeshGeometry(currentMesh);

        const cosY = Math.cos(angleY), sinY = Math.sin(angleY);
        const cosX = Math.cos(angleX), sinX = Math.sin(angleX);

        function transform(v) {
            // Y rotation
            let x1 = v[0] * cosY + v[2] * sinY;
            let y1 = v[1];
            let z1 = -v[0] * sinY + v[2] * cosY;

            // X rotation
            let x2 = x1;
            let y2 = y1 * cosX - z1 * sinX;
            let z2 = y1 * sinX + z1 * cosX;

            return [x2, y2, z2];
        }

        const tVertices = mesh.vertices.map(transform);

        // Compute face normals & center depth
        const faceData = mesh.faces.map(f => {
            const v0 = tVertices[f[0]];
            const v1 = tVertices[f[1]];
            const v2 = tVertices[f[2]];

            // Normal = (v1 - v0) x (v2 - v0)
            const ax = v1[0] - v0[0], ay = v1[1] - v0[1], az = v1[2] - v0[2];
            const bx = v2[0] - v0[0], by = v2[1] - v0[1], bz = v2[2] - v0[2];

            let nx = ay * bz - az * by;
            let ny = az * bx - ax * bz;
            let nz = ax * by - ay * bx;
            const nlen = Math.hypot(nx, ny, nz) || 1;
            nx /= nlen; ny /= nlen; nz /= nlen;

            const depth = (v0[2] + v1[2] + v2[2]) / 3;
            return { f, normal: [nx, ny, nz], depth, v0, v1, v2 };
        });

        // Depth sort faces
        faceData.sort((a, b) => a.depth - b.depth);

        // Render faces
        faceData.forEach(({ f, normal, depth, v0, v1, v2 }) => {
            // Backface culling
            if (normal[2] < -0.15 && currentPass !== 'wireframe') return;

            const p0 = [cx + v0[0] * scale, cy - v0[1] * scale];
            const p1 = [cx + v1[0] * scale, cy - v1[1] * scale];
            const p2 = [cx + v2[0] * scale, cy - v2[1] * scale];

            ctx.beginPath();
            ctx.moveTo(p0[0], p0[1]);
            ctx.lineTo(p1[0], p1[1]);
            ctx.lineTo(p2[0], p2[1]);
            ctx.closePath();

            if (currentPass === 'lit') {
                // Lambertian Diffuse + Blinn-Phong Specular
                const dotL = Math.max(0, normal[0] * lightDir[0] + normal[1] * lightDir[1] + normal[2] * lightDir[2]);
                const viewDir = [0, 0, 1];
                const halfX = lightDir[0] + viewDir[0];
                const halfY = lightDir[1] + viewDir[1];
                const halfZ = lightDir[2] + viewDir[2];
                const hlen = Math.hypot(halfX, halfY, halfZ) || 1;
                const specDot = Math.max(0, normal[0] * (halfX/hlen) + normal[1] * (halfY/hlen) + normal[2] * (halfZ/hlen));
                const spec = Math.pow(specDot, (1.0 - roughness) * 64) * (1.0 - roughness);

                const intensity = 0.15 + dotL * 0.65 + spec * 0.8;
                const r = Math.min(255, Math.floor(intensity * 120 + spec * 135));
                const g = Math.min(255, Math.floor(intensity * 180 + spec * 75));
                const b = Math.min(255, Math.floor(intensity * 255));

                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fill();
                ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
                ctx.lineWidth = 1;
                ctx.stroke();

            } else if (currentPass === 'normals') {
                // Map normal [-1, 1] to RGB [0, 255]
                const nr = Math.floor(((normal[0] + 1) / 2) * 255);
                const ng = Math.floor(((normal[1] + 1) / 2) * 255);
                const nb = Math.floor(((normal[2] + 1) / 2) * 255);
                ctx.fillStyle = `rgb(${nr}, ${ng}, ${nb})`;
                ctx.fill();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 1;
                ctx.stroke();

            } else if (currentPass === 'wireframe') {
                ctx.fillStyle = 'rgba(10, 14, 25, 0.4)';
                ctx.fill();
                ctx.strokeStyle = '#00f0ff';
                ctx.lineWidth = 1.5;
                ctx.stroke();

            } else if (currentPass === 'depth') {
                // Linear Depth Gradient
                const normDepth = Math.max(0, Math.min(1, (depth + 1.5) / 3.0));
                const val = Math.floor(normDepth * 255);
                ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
                ctx.fill();
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });

        requestAnimationFrame(renderUgeViewport);
    }

    renderUgeViewport();
}
