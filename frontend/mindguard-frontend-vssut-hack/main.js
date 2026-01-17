/** 1. THREE.JS SCENE **/
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#hero-canvas'), alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 5;

const geometry = new THREE.BufferGeometry();
const pCount = 3000;
const positions = new Float32Array(pCount * 3);
for(let i=0; i<pCount*3; i++) positions[i] = (Math.random() - 0.5) * 15;
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const material = new THREE.PointsMaterial({ color: 0x00E9FF, size: 0.015 });
const points = new THREE.Points(geometry, material);
scene.add(points);

/** 2. MOUSE & CURSOR LOGIC **/
const mouse = { x: 0, y: 0 };
const cursorDot = document.getElementById('cursor-dot');
const cursorGlow = document.getElementById('cursor-glow');

window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0 });
    gsap.to(cursorGlow, { x: e.clientX, y: e.clientY, duration: 0.15 });
});

function animate() {
    requestAnimationFrame(animate);
    points.rotation.y += 0.001;
    camera.position.x += (mouse.x * 2 - camera.position.x) * 0.05;
    camera.position.y += (mouse.y * 2 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}
animate();

/** 3. APP STATE & NAVIGATION **/
const state = { questions: [], responses: { text: "" } };

function transition(toId) {
    const active = document.querySelector('section:not(.hidden)');
    const next = document.getElementById(toId);
    if (!active || !next) return;

    gsap.to(active, { opacity: 0, y: -20, duration: 0.3, onComplete: () => {
        active.classList.add('hidden');
        next.classList.remove('hidden');
        gsap.fromTo(next, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 });
    }});
}

// Button Listeners
document.getElementById('start-btn').onclick = () => {
    transition('assessment-section');
    showInitialInput();
};

document.getElementById('profile-btn').onclick = () => {
    transition('profile-dashboard');
    renderHistory();
};

document.getElementById('back-to-main').onclick = () => {
    transition('step-1');
};

/** 4. ASSESSMENT STEPS **/
function showInitialInput() {
    const container = document.getElementById('dynamic-content');
    gsap.to('#progress-bar', { width: '25%', duration: 0.5 });
    container.innerHTML = `
        <h2 class="text-2xl font-bold text-[#00E9FF]">Mental Context</h2>
        <textarea id="main-input" class="w-full h-32 p-4 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-[#8A2EFF]" placeholder="Tell us how you feel..."></textarea>
        <button id="analyze-btn" class="w-full py-4 mt-4 bg-[#8A2EFF] font-bold uppercase rounded">Analyze</button>
    `;
    document.getElementById('analyze-btn').onclick = () => {
        const txt = document.getElementById('main-input').value;
        if(txt.includes('sleep') || txt.includes('tired')) state.questions.push('sleep');
        runAnalysis();
    };
}

function runAnalysis() {
    transition('step-4');
    setTimeout(() => {
        transition('results-section');
        document.getElementById('results-container').innerHTML = `
            <div class="glass-card p-10 rounded-2xl text-center border-t-4 border-[#FF00A0]">
                <h3 class="text-6xl font-black">64%</h3>
                <p class="text-cyan-400 uppercase tracking-widest mt-2">Moderate Stress</p>
                <button onclick="transition('step-1')" class="mt-6 text-xs uppercase opacity-50 underline">Return Home</button>
            </div>`;
    }, 2000);
}

/** 5. DASHBOARD & CHART **/
async function renderHistory() {
    const data = [
        { date: 'Jan 14', level: 40 }, { date: 'Jan 15', level: 65 }, 
        { date: 'Jan 16', level: 30 }, { date: 'Jan 17', level: 85 }
    ];

    const list = document.getElementById('history-list');
    list.innerHTML = data.map(d => `<div class="p-3 border-b border-white/5 flex justify-between"><span>${d.date}</span><span class="text-[#00E9FF] font-bold">${d.level}%</span></div>`).join('');

    const ctx = document.getElementById('stressChart').getContext('2d');
    if(window.myChart) window.myChart.destroy();
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date),
            datasets: [{
                label: 'Stress',
                data: data.map(d => d.level),
                borderColor: '#8A2EFF',
                backgroundColor: 'rgba(138, 46, 255, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } }
    });
}