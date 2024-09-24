const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const cubeGeometry = new THREE.BoxGeometry();
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cubes = [];

for (let i = -50; i <= 50; i++) {
    for (let j = 0; j <= 50; j++) {
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(i, j, 0);
        scene.add(cube);
        cubes.push(cube);
    }
}

camera.position.z = 100;

function animate() {
    requestAnimationFrame(animate);
    cubes.forEach(cube => {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    });
    renderer.render(scene, camera);
}

animate();
