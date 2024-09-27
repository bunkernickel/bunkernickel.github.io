// Scene setup
const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.z = 60;
renderer.setSize(window.innerWidth, window.innerHeight);

// Lighting
const ambientLight = new THREE.HemisphereLight(0xffffff, 0x33ff7d, 0.8);
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
const imageLoader3 = document.getElementById('imageLoader3');

imageLoader1.addEventListener('change', (e) => handleImage(e, 1), false);
imageLoader2.addEventListener('change', (e) => handleImage(e, 2), false);
imageLoader3.addEventListener('change', (e) => handleImage(e, 3), false);

let imageData1, imageData2, imageData3;
const cubeSize = 0.6;
const cubes = [];
let startTime = null;

// Modulation periods (milliseconds)
const period = 15000; // 15 seconds

// Modulation amplitudes
const rotationAmplitude = Math.PI / 2; // Adjust as needed
const scaleAmplitude = 0.5; // Scale varies from 1 to 1 + scaleAmplitude
const opacityAmplitude = 0.5; // Opacity varies from 1 to 1 - opacityAmplitude

// Angular frequency
const omega = (2 * Math.PI) / period;

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

    const imgWidth = 50; // Adjust size for performance
    const imgHeight = image.height * (imgWidth / image.width);
    canvasImage.width = imgWidth;
    canvasImage.height = imgHeight;

    context.drawImage(image, 0, 0, imgWidth, imgHeight);
    const data = context.getImageData(0, 0, imgWidth, imgHeight).data;

    if (imageNumber === 1) {
        imageData1 = data;
    } else if (imageNumber === 2) {
        imageData2 = data;
    } else if (imageNumber === 3) {
        imageData3 = data;
    }

    if (imageData1 && imageData2 && imageData3) {
        createCubesFromImageData(imageData1, imageData2, imageData3, imgWidth, imgHeight);
    }
}

// Function to create cubes and assign modulation parameters
function createCubesFromImageData(data1, data2, data3, width, height) {
    // Clear previous cubes
    cubes.forEach(cube => scene.remove(cube));
    cubes.length = 0;

    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;

            // Get brightness values for each image
            const brightness1 = (data1[index] + data1[index + 1] + data1[index + 2]) / (255 * 3);
            const brightness2 = (data2[index] + data2[index + 1] + data2[index + 2]) / (255 * 3);
            const brightness3 = (data3[index] + data3[index + 1] + data3[index + 2]) / (255 * 3);

            // Create material with transparency
            const material = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(
                x - width / 2,
                -y + height / 2,
                0
            );

            // Assign modulation parameters
            cube.rotationAngleBase = brightness1 * Math.PI * 2; // Base rotation angle from Image 1
            cube.scaleFactorBase = brightness2; // Scale factor base from Image 2
            cube.opacityFactorBase = brightness3; // Opacity factor base from Image 3

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
        // Calculate modulation phases
        const phaseRotation = omega * elapsedTime;
        const phaseScale = omega * elapsedTime - (2 * Math.PI / 3); // Shifted by 120 degrees
        const phaseOpacity = omega * elapsedTime - (4 * Math.PI / 3); // Shifted by 240 degrees

        // Modulation functions ranging from 0 to 1
        const rotationModulation = (Math.cos(phaseRotation) + 1) / 2;
        const scaleModulation = (Math.cos(phaseScale) + 1) / 2;
        const opacityModulation = (Math.cos(phaseOpacity) + 1) / 2;

        // Rotation modulation
        const currentRotationAngle = cube.rotationAngleBase + rotationAmplitude * rotationModulation;
        cube.rotation.y = currentRotationAngle;

        // Scale modulation
        const currentScaleFactor = 1 + scaleAmplitude * scaleModulation * cube.scaleFactorBase;
        cube.scale.set(currentScaleFactor, currentScaleFactor, currentScaleFactor);

        // Opacity modulation
        const currentOpacity = 1 - opacityAmplitude * opacityModulation * cube.opacityFactorBase;
        cube.material.opacity = currentOpacity;
    });
}

// Render loop
function animate(time) {
    requestAnimationFrame(animate);

    updateCubes(time);

    renderer.render(scene, camera);
}

animate();
