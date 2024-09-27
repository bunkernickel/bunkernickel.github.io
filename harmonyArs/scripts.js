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
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

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
const cubeSize = 0.707;
const cubes = [];
const rotationPeriod = 3 * 1000;  // Total period in milliseconds
let startTime = null;

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
    } else {
        imageData2 = data;
    }

    if (imageData1 && imageData2) {
        createCubesFromImageData(imageData1, imageData2, imgWidth, imgHeight);
    }
}

  // Time for a full rotation in milliseconds
const scaleAmplitude = 0.5;        // Amplitude of scale modulation

const omega = (2 * Math.PI) / rotationPeriod;  // Angular speed (radians per millisecond)

// Function to create cubes and assign rotation and scale parameters
function createCubesFromImageData(data1, data2, width, height) {
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

            const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(
                x - width / 2,
                -y + height / 2,
                0
            );

            // Define rotation axis
            cube.rotationAxis = new THREE.Vector3(0, 1, 0);  // Y-axis rotation

            // Map brightness1 to initial rotation angle
            cube.angleImage = brightness1 * 2 * Math.PI;  // Map to 0 to 2π

            // Store scale factor based on brightness2
            cube.scaleFactor = brightness2;  // Scale between 0 and 1

            cubes.push(cube);
            scene.add(cube);
        }
    }

    // Reset start time
    startTime = performance.now();
}

// Function to update cube rotations and scales over time
function updateCubes(time) {
    if (!startTime) return;

    const elapsedTime = time - startTime;

    cubes.forEach(cube => {
        // Continuous rotation with constant angular speed
        const currentAngle = (omega * elapsedTime + cube.angleImage) % (2 * Math.PI);
        cube.setRotationFromAxisAngle(cube.rotationAxis, currentAngle);

        // Scale modulation using a sine function
        const scaleModulation = scaleAmplitude * Math.sin(omega * elapsedTime + cube.scaleFactor * Math.PI * 2);
        const scale = 1 + scaleModulation;
        cube.scale.set(scale, scale, scale);
    });
}

// Render loop
function animate(time) {
    requestAnimationFrame(animate);

    updateCubes(time);

    renderer.render(scene, camera);
}

animate();