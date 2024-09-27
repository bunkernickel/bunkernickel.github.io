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
const cubeSize = 0.6;
const cubes = [];

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
    } else {
        imageData2 = data;
    }

    if (imageData1 && imageData2) {
        createCubesFromImageData(imageData1, imageData2, imgWidth, imgHeight);
    }
}

// Function to create cubes with varying rotation speeds
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

            // Assign rotation speeds based on brightness of both images
            cube.rotationSpeed1 = brightness1 * 0.1;  // Speed for first image
            cube.rotationSpeed2 = brightness2 * 0.1;  // Speed for second image
            cubes.push(cube);
            scene.add(cube);
        }
    }
}

// Function to update cube rotations over time
function updateCubes(time) {
    const rotationFactor = Math.sin(time * 0.001); // Cycle factor between -1 and 1
    cubes.forEach(cube => {
        const rotationSpeed = rotationFactor * cube.rotationSpeed1 + (1 - rotationFactor) * cube.rotationSpeed2;
        cube.rotation.x += rotationSpeed;
        cube.rotation.y += rotationSpeed;
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
