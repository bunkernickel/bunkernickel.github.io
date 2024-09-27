// Scene Setup
const scene = new THREE.Scene();
const cubes = []; // Array to hold all cube meshes

// Camera Setup
const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 1.6, 5); // Set initial camera position

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting Setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 0).normalize();
scene.add(directionalLight);

// Ground Plane
const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x33ff7d });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Make the ground horizontal
scene.add(ground);


// Pointer Lock Variables
let isPointerLocked = false;
let yaw = 0;
let pitch = 0;
const pitchLimit = Math.PI / 2 - 0.01;
const movementSpeed = 5;

// Pointer Lock Event Handlers
document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === renderer.domElement;
}, false);

renderer.domElement.addEventListener('click', () => {
    renderer.domElement.requestPointerLock();
});

// Mouse Movement Event Handler
document.addEventListener('mousemove', (event) => {
    if (!isPointerLocked) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    yaw -= movementX * 0.002;
    pitch -= movementY * 0.002;
    pitch = Math.max(-pitchLimit, Math.min(pitchLimit, pitch));

    camera.rotation.set(pitch, yaw, 0, 'YXZ');
});

// Keyboard Movement Controls
const keysPressed = {};
document.addEventListener('keydown', (event) => {
    keysPressed[event.code] = true;
});
document.addEventListener('keyup', (event) => {
    keysPressed[event.code] = false;
});

const movePlayer = (delta) => {
    const velocity = movementSpeed * delta;
    const direction = new THREE.Vector3();

    if (keysPressed['KeyW']) direction.z += 1;
    if (keysPressed['KeyS']) direction.z -= 1;
    if (keysPressed['KeyA']) direction.x += 1;
    if (keysPressed['KeyD']) direction.x -= 1;

    direction.normalize();

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(camera.up, forward).normalize();

    const moveX = right.x * direction.x + forward.x * direction.z;
    const moveZ = right.z * direction.x + forward.z * direction.z;

    camera.position.x += moveX * velocity;
    camera.position.z += moveZ * velocity;
};

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Image Upload Elements
const imageLoader1 = document.getElementById('imageLoader1');
const imageLoader2 = document.getElementById('imageLoader2');

imageLoader1.addEventListener('change', (e) => handleImage(e, 1), false);
imageLoader2.addEventListener('change', (e) => handleImage(e, 2), false);

let imageData1, imageData2;
const cubeSize = 1.1;

// Handle Image Upload and Processing
function handleImage(e, imageNumber) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            processImage(img, imageNumber);
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
}

// Process Image to Extract Brightness Data
function processImage(image, imageNumber) {
    const canvasImage = document.createElement('canvas');
    const context = canvasImage.getContext('2d');

    const imgWidth = 80;
    const imgHeight = image.height * (imgWidth / image.width);
    canvasImage.width = imgWidth;
    canvasImage.height = imgHeight;

    context.drawImage(image, 0, 0, imgWidth, imgHeight);
    const imageData = context.getImageData(0, 0, imgWidth, imgHeight).data;

    if (imageNumber === 1) {
        imageData1 = imageData;
    } else {
        imageData2 = imageData;
    }

    if (imageData1 && imageData2) {
        createCubesFromImageData(imageData1, imageData2, imgWidth, imgHeight);
    }
}

// Create Cubes Based on Image Data
function createCubesFromImageData(data1, data2, width, height) {
    // Remove Existing Cubes
    cubes.forEach(cube => scene.remove(cube));
    cubes.length = 0;


    // Simple Cube for Reference
    const cubeGeometry = new THREE.BoxGeometry(.707, .707, .707);
    const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xff3319 });
    let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 0.5, 0);
    scene.add(cube);
    cubes.push(cube);

    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const brightness1 = (data1[index] + data1[index + 1] + data1[index + 2]) / (255 * 3);
            const brightness2 = (data2[index] + data2[index + 1] + data2[index + 2]) / (255 * 3);

            const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(
                x * cubeSize - (width * cubeSize) / 2,
                -y * cubeSize + (height * cubeSize) / 2,
                -100
            );

            // Set Rotation Speeds Based on Image Brightness
            cube.rotationSpeed1 = brightness1 * 0.1;
            cube.rotationSpeed2 = brightness2 * 0.1;
            cubes.push(cube);
            scene.add(cube);
        }
    }
}

// Update Cubes Rotation Over Time
function updateCubes(time) {
    const rotationFactor = Math.sin(time * 0.001) * 0.5 + 0.5; // Value between 0 and 1
    cubes.forEach(cube => {
        const rotationSpeed = rotationFactor * cube.rotationSpeed1 + (1 - rotationFactor) * cube.rotationSpeed2;
        cube.rotation.x += rotationSpeed;
        cube.rotation.y += rotationSpeed;
    });
}

// Animation Loop
let previousTime = performance.now();
function animate() {
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const delta = (currentTime - previousTime) / 1000; // Convert to seconds
    previousTime = currentTime;

    movePlayer(delta); // Update camera movement
    updateCubes(currentTime); // Update cubes rotation

    renderer.render(scene, camera);
}

animate();
