// Scene setup
const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.z = 80;
renderer.setSize(window.innerWidth, window.innerHeight);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

// Handle window resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Image loaders
const imageLoader1 = document.getElementById('imageLoader1');
const imageLoader2 = document.getElementById('imageLoader2');

imageLoader1.addEventListener('change', (e) => handleImage(e, 1), false);
imageLoader2.addEventListener('change', (e) => handleImage(e, 2), false);

let imageData1, imageData2;
const cubeSize = 0.777;
const cubes = [];
let startTime = null;

// Base rotation period (milliseconds)
const basePeriod = 30000; // 10 seconds
const baseOmega = (2 * Math.PI) / basePeriod; // Base angular frequency

// Function to handle image upload and processing
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

// Function to process the image and store brightness values
function processImage(image, imageNumber) {
    const canvasImage = document.createElement('canvas');
    const context = canvasImage.getContext('2d');

    const imgWidth = 80; // Adjust size for performance
    const imgHeight = image.height * (imgWidth / image.width);
    canvasImage.width = imgWidth;
    canvasImage.height = imgHeight;

    context.drawImage(image, 0, 0, imgWidth, imgHeight);
    const data = context.getImageData(0, 0, imgWidth, imgHeight).data;

    if (imageNumber === 1) {
        imageData1 = data;
    } else if (imageNumber === 2) {
        imageData2 = data;
    }

    if (imageData1 && imageData2) {
        createCubesFromImageData(imageData1, imageData2, imgWidth, imgHeight);
    }
}

// Function to create cubes and assign rotation parameters
function createCubesFromImageData(data1, data2, width, height) {
    // Clear previous cubes
    cubes.forEach(cube => scene.remove(cube));
    cubes.length = 0;

    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;

            // Get brightness values for each image (0 to 1)
            const brightness1 = (data1[index] + data1[index + 1] + data1[index + 2]) / (255 * 3);
            const brightness2 = (data2[index] + data2[index + 1] + data2[index + 2]) / (255 * 3);

            const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(
                x - width / 2,
                -y + height / 2,
                0
            );

            // Assign harmonic factors based on brightness values
            const harmonicFactor1 = Math.pow(2, Math.round(brightness1 * 4)); // Exponents from 0 to 4
            const harmonicFactor2 = Math.pow(2, Math.round(brightness2 * 4)); // Exponents from 0 to 4

            // Calculate rotation frequencies
            cube.omega = baseOmega * harmonicFactor1; // Frequency for rotation
            cube.modulationOmega = baseOmega * harmonicFactor2; // Frequency for modulation

            // Random initial phase
            cube.phase = Math.random() * 2 * Math.PI;

            // Rotation axis
            cube.rotationAxis = new THREE.Vector3(0, 1, 0); // Y-axis rotation

            // Store base rotation angle
            cube.baseAngle = brightness1 * Math.PI * 2;

            cubes.push(cube);
            scene.add(cube);
        }
    }

    // Reset start time for synchronization
    startTime = performance.now();
}

// Function to update cube properties over time
function updateCubes(time) {
    if (!startTime) return; // Wait until cubes are created

    const elapsedTime = time - startTime;

    cubes.forEach(cube => {
        // Rotation angle with harmonic frequency
        const rotationAngle = (cube.omega * elapsedTime + cube.phase) % (2 * Math.PI);

        // Modulation angle with harmonic frequency
        const modulation = Math.sin(cube.modulationOmega * elapsedTime + cube.phase);

        // Total rotation angle
        const totalAngle = cube.baseAngle + modulation * rotationAngle;

        // Apply rotation
        cube.setRotationFromAxisAngle(cube.rotationAxis, totalAngle);
    });
}

// Render loop
function animate(time) {
    requestAnimationFrame(animate);

    updateCubes(time);

    renderer.render(scene, camera);
}

animate();
