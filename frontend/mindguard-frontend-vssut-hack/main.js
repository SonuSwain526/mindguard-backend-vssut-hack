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
const state = { 
    questions: [], 
    responses: { text: "", sleep_hours: null, screen_time: null },
    predictedLevel: ""
};

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
    document.getElementById('analyze-btn').onclick = async () => {
        const txt = document.getElementById('main-input').value;
        if(!txt) return;
        state.responses.text = txt;

        // First API Call to predict level and decide context-aware questions
        try {
            const response = await fetch('http://127.0.0.1:8000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: state.responses.text })
            });
            const result = await response.json();
            state.predictedLevel = result.stress_level;

            // Trigger follow-ups based on the result
            if(["Moderate", "High"].includes(state.predictedLevel)) state.questions.push('sleep');
            if(state.predictedLevel === "High") state.questions.push('screen');
            
            processNextStep();
        } catch(e) {
            console.error("API Error", e);
            runAnalysis(); // Fallback
        }
    };
}

function processNextStep() {
    if(state.questions.length > 0) {
        renderAdaptiveQuestion(state.questions.shift());
    } else {
        runAnalysis();
    }
}

function renderAdaptiveQuestion(type) {
    const container = document.getElementById('dynamic-content');
    if(type === 'sleep') {
        container.innerHTML = `
            <h2 class="text-2xl font-bold text-white mb-6">How was your sleep?</h2>
            <button class="w-full p-4 mb-4 border border-white/10 hover:border-[#00E9FF] rounded bg-white/5" onclick="state.responses.sleep_hours=4; processNextStep();">Less than 6h</button>
            <button class="w-full p-4 border border-white/10 hover:border-[#00E9FF] rounded bg-white/5" onclick="state.responses.sleep_hours=8; processNextStep();">Healthy (7h+)</button>
        `;
    } else if(type === 'screen') {
        container.innerHTML = `
            <h2 class="text-2xl font-bold text-white mb-6">Typical daily screen time?</h2>
            <button class="w-full p-4 mb-4 border border-white/10 hover:border-[#FF00A0] rounded bg-white/5" onclick="state.responses.screen_time=10; processNextStep();">High (> 8h)</button>
            <button class="w-full p-4 border border-white/10 hover:border-[#FF00A0] rounded bg-white/5" onclick="state.responses.screen_time=3; processNextStep();">Low (< 4h)</button>
        `;
    }
}

async function runAnalysis() {
    transition('step-4');
    
    // Final API Call with all context data
    try {
        const response = await fetch('http://127.0.0.1:8000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state.responses)
        });
        const finalResult = await response.json();
        
        setTimeout(() => {
            transition('results-section');
            showDynamicResults(finalResult);
        }, 2000);
    } catch(e) {
        console.error("Final Predict Error", e);
    }
}

function showDynamicResults(result) {
    const container = document.getElementById('results-container');
    const colors = {
        "Low": "#00E9FF",
        "Moderate": "#8A2EFF",
        "High": "#FF00A0"
    };
    
    const color = colors[result.stress_level] || "#00E9FF";
    
    container.innerHTML = `
        <div class="glass-card p-12 rounded-3xl text-center border-t-8" style="border-color: ${color}">
            <h3 class="text-xs uppercase tracking-[0.4em] opacity-60 mb-2">Analysis Complete</h3>
            <h2 class="text-7xl font-black mb-6" style="color: ${color}">${result.stress_level}</h2>
            
            <div class="max-w-md mx-auto p-6 bg-white/5 rounded-2xl border border-white/10 mb-8 italic">
                "${result.suggestion}"
            </div>
            
            <button onclick="transition('step-1')" class="px-8 py-3 border border-white/20 rounded-full hover:bg-white hover:text-black transition-all">Dismiss Report</button>
        </div>
    `;
}

/** 5. DASHBOARD & CHART **/
async function renderHistory() {
    // This would typically fetch from your real SQLite DB via a new endpoint
    const data = [
        { date: 'Jan 14', level: 'Low' }, { date: 'Jan 15', level: 'Moderate' }, 
        { date: 'Jan 16', level: 'Low' }, { date: 'Jan 17', level: 'High' }
    ];

    const numericMapping = { "Low": 25, "Moderate": 60, "High": 90 };

    const list = document.getElementById('history-list');
    list.innerHTML = data.map(d => `
        <div class="p-3 border-b border-white/5 flex justify-between">
            <span>${d.date}</span>
            <span class="font-bold" style="color: ${d.level === 'High' ? '#FF00A0' : d.level === 'Moderate' ? '#8A2EFF' : '#00E9FF'}">${d.level}</span>
        </div>
    `).join('');

    const ctx = document.getElementById('stressChart').getContext('2d');
    if(window.myChart) window.myChart.destroy();
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date),
            datasets: [{
                label: 'Stress Index',
                data: data.map(d => numericMapping[d.level]),
                borderColor: '#8A2EFF',
                backgroundColor: 'rgba(138, 46, 255, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#00E9FF'
            }]
        },
        options: { 
            plugins: { legend: { display: false } }, 
            scales: { 
                y: { 
                    min: 0, 
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            if (value === 25) return 'Low';
                            if (value === 60) return 'Moderate';
                            if (value === 90) return 'High';
                        }
                    }
                } 
            } 
        }
    });
}