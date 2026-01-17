// scene.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#hero-canvas'), alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 3;

// Create Starfield/Particles
const geometry = new THREE.BufferGeometry();
const vertices = [];
for (let i = 0; i < 5000; i++) {
    vertices.push(THREE.MathUtils.randFloatSpread(10)); // x
    vertices.push(THREE.MathUtils.randFloatSpread(10)); // y
    vertices.push(THREE.MathUtils.randFloatSpread(10)); // z
}
geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
const material = new THREE.PointsMaterial({ color: 0x8A2EFF, size: 0.01 });
const points = new THREE.Points(geometry, material);
scene.add(points);

// Mouse Movement Effect
let mouseX = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) / 100;
    // Cursor following
    gsap.to('#cursor', { x: e.clientX, y: e.clientY, duration: 0.1 });
});

function animate() {
    requestAnimationFrame(animate);
    points.rotation.y += 0.001;
    points.rotation.x += mouseX * 0.01;
    renderer.render(scene, camera);
}
animate();