const scene = new THREE.Scene();
let cubes = []
// Camera Setup
const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 1.6, 5); // Set initial position (eye level)

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Simple Ground Plane
const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x33ff7d });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate to make it horizontal
scene.add(ground);

// Simple Cube for Reference
const cubeGeometry = new THREE.BoxGeometry(.707, .707, .707);
const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xc4bf33 });
let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, 0.5, 0);
scene.add(cube);
cubes.push(cube);

//Create a Wall of Cubes
for (let i = -50; i <= 50; i++) {
    for (let j = 0; j <= 50; j++) {
        cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(i, j, 100);
        scene.add(cube);
        cubes.push(cube);
    }
}

// Light Setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 0).normalize();
scene.add(directionalLight);

// Variables for Camera Control
let isPointerLocked = false;
let yaw = 0;   // Horizontal rotation (azimuth)
let pitch = 0; // Vertical rotation (elevation)
const pitchLimit = Math.PI / 2 - 0.01; // Limit the pitch to prevent flipping
const movementSpeed = 5; // Units per second

// Pointer Lock API
const pointerLockChange = () => {
    isPointerLocked = document.pointerLockElement === renderer.domElement;
};
document.addEventListener('pointerlockchange', pointerLockChange, false);

// Request Pointer Lock on Click
renderer.domElement.addEventListener('click', () => {
    renderer.domElement.requestPointerLock();
});

// Mouse Movement
document.addEventListener('mousemove', (event) => {
    if (!isPointerLocked) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    // Update yaw and pitch
    yaw -= movementX * 0.002;   // Adjust sensitivity as needed
    pitch -= movementY * 0.002; // Adjust sensitivity as needed

    // Limit pitch to prevent camera flip
    pitch = Math.max(-pitchLimit, Math.min(pitchLimit, pitch));

    // Update camera rotation
    camera.rotation.set(pitch, yaw, 0, 'YXZ');
});

// Movement Controls
const keysPressed = {};
document.addEventListener('keydown', (event) => {
    keysPressed[event.code] = true;
});
document.addEventListener('keyup', (event) => {
    keysPressed[event.code] = false;
});

// Movement Function
const movePlayer = (delta) => {
    const velocity = movementSpeed * delta;
    const direction = new THREE.Vector3();

    if (keysPressed['KeyW']) {
        direction.z += 1;
    }
    if (keysPressed['KeyS']) {
        direction.z -= 1;
    }
    if (keysPressed['KeyA']) {
        direction.x += 1;
    }
    if (keysPressed['KeyD']) {
        direction.x -= 1;
    }

    direction.normalize();

    // Compute forward and right vectors relative to the camera's orientation
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);  // Get camera's forward direction
    forward.y = 0;  // Flatten forward vector to XZ plane
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(camera.up, forward).normalize();  // Right vector is perpendicular to forward and up

    // Move the camera based on the relative forward and right vectors
    const moveX = right.x * direction.x + forward.x * direction.z;
    const moveZ = right.z * direction.x + forward.z * direction.z;

    camera.position.x += moveX * velocity;
    camera.position.z += moveZ * velocity;
};

// Animation Loop
let previousTime = performance.now();
function animate() {
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const delta = (currentTime - previousTime) / 1000; // Convert to seconds
    previousTime = currentTime;

    movePlayer(delta);
    cubes.forEach((cube) => {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    })

    renderer.render(scene, camera);
}

animate();

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});