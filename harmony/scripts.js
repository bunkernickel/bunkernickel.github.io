// Scene setup
const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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
const cubeSize = 0.8;
const cubes = [];
const coherenceInterval = 3 * 1000;  // Period of full image coherence (in milliseconds)
const halfCoherenceTime = coherenceInterval / 2;

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

// Function to create cubes and assign rotation targets based on the two images
function createCubesFromImageData(data1, data2, width, height) {
    // Clear previous cubes
    cubes.forEach(cube => scene.remove(cube));
    cubes.length = 0;

    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const brightness1 = (data1[index] + data1[index + 1] + data1[index + 2]) / (255 * 3);
            const brightness2 = (data2[index] + data2[index + 1] + data2[index + 2]) / (255 * 3);

            const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(
                x - width / 2,
                -y + height / 2,
                0
            );

            // Rotation targets based on image brightness
            cube.targetRotation1 = new THREE.Vector3(
                brightness1 * Math.PI,  // First image rotation
                brightness1 * Math.PI,
                brightness1 * Math.PI
            );

            cube.targetRotation2 = new THREE.Vector3(
                brightness2 * Math.PI,  // Second image rotation
                brightness2 * Math.PI,
                brightness2 * Math.PI
            );

            cube.rotationProgress = 0; // Track how far in the cycle the cube is

            cubes.push(cube);
            scene.add(cube);
        }
    }
}

// Function to update cube rotations over time
function updateCubes(time) {
    const progress = (time % coherenceInterval) / coherenceInterval;  // Between 0 and 1
    cubes.forEach(cube => {
        // Calculate the progress of the rotation
        const rotationProgress = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
        
        // Interpolate between two target rotations
        cube.rotation.x = THREE.MathUtils.lerp(cube.targetRotation1.x, cube.targetRotation2.x, rotationProgress);
        cube.rotation.y = THREE.MathUtils.lerp(cube.targetRotation1.y, cube.targetRotation2.y, rotationProgress);
        cube.rotation.z = THREE.MathUtils.lerp(cube.targetRotation1.z, cube.targetRotation2.z, rotationProgress);
    });
}

// Render loop
function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    updateCubes(time);

    renderer.render(scene, camera);
}

animate();
