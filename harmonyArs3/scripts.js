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
const imageLoader3 = document.getElementById('imageLoader3');

imageLoader1.addEventListener('change', (e) => handleImage(e, 1), false);
imageLoader2.addEventListener('change', (e) => handleImage(e, 2), false);
imageLoader3.addEventListener('change', (e) => handleImage(e, 3), false);

let imageData1, imageData2, imageData3;
const cubeSize = 0.9;
const cubes = [];
let startTime = null;

// Periods for each modulation (in milliseconds)
const periodRotation = 10000; // 10 seconds
const periodScale = 15000;    // 15 seconds
const periodColor = 20000;    // 20 seconds

// Angular speeds (radians per millisecond)
const omegaRotation = (2 * Math.PI) / periodRotation;
const omegaScale = (2 * Math.PI) / periodScale;
const omegaColor = (2 * Math.PI) / periodColor;

const scaleAmplitude = 0.5; // Amplitude for scale modulation

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

            // Create material
            const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(
                x - width / 2,
                -y + height / 2,
                0
            );

            // Assign modulation parameters
            cube.rotationAngle = brightness1 * 2 * Math.PI;   // For rotation
            cube.scaleFactor = brightness2;                   // For scale
            cube.colorHue = brightness3;                      // For color

            cubes.push(cube);
            scene.add(cube);
        }
    }

    // Reset start time for synchronization
    startTime = performance.now();
}

// Function to update cube properties over time
function updateCubes(time) {
    if (!startTime) return;  // Wait until cubes are created

    const elapsedTime = time - startTime;

    cubes.forEach(cube => {
        // Rotation modulation
        const currentRotation = (omegaRotation * elapsedTime + cube.rotationAngle) % (2 * Math.PI);
        cube.rotation.y = currentRotation;

        // Scale modulation
        const scaleModulation = scaleAmplitude * Math.sin(omegaScale * elapsedTime + cube.scaleFactor * Math.PI * 2);
        const scale = 1 + scaleModulation;
        cube.scale.set(scale, scale, scale);

        // Color modulation
        const hue = (cube.colorHue + Math.sin(omegaColor * elapsedTime)) % 1;
        cube.material.color.setHSL(hue, 1, 0.5);
    });
}

// Render loop
function animate(time) {
    requestAnimationFrame(animate);

    updateCubes(time);

    renderer.render(scene, camera);
}

animate();
