// Scene setup
const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;
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

// Image loader
const imageLoader = document.getElementById('imageLoader');
imageLoader.addEventListener('change', handleImage, false);

// Function to handle image upload and processing
function handleImage(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            processImage(img);
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
}

// Function to process the image and create cubes based on brightness
function processImage(image) {
    const canvasImage = document.createElement('canvas');
    const context = canvasImage.getContext('2d');

    // Downscale the image for performance
    const imgWidth = 100; // Adjust as needed
    const imgHeight = image.height * (imgWidth / image.width);
    canvasImage.width = imgWidth;
    canvasImage.height = imgHeight;

    context.drawImage(image, 0, 0, imgWidth, imgHeight);
    const imageData = context.getImageData(0, 0, imgWidth, imgHeight);
    const data = imageData.data;

    createCubesFromImageData(data, imgWidth, imgHeight);
}

// Function to create cubes based on brightness of the image
function createCubesFromImageData(data, width, height) {
    const cubeSize = 0.5; // Cube size
    const cubes = [];

    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const brightness = (r + g + b) / (255 * 3); // Normalized [0, 1]

            // Only create a cube if brightness is less than 0.9
            if (brightness < 0.9) { 
                const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
                const cube = new THREE.Mesh(geometry, material);
                cube.position.set(
                    x - width / 2,
                    -y + height / 2,
                    0
                );

                // Randomize rotation based on brightness
                const rotationFactor = (1 - brightness) * Math.PI * 2;
                cube.rotation.set(
                    rotationFactor * Math.random(),
                    rotationFactor * Math.random(),
                    rotationFactor * Math.random()
                );

                cubes.push(cube);
                scene.add(cube);
            }
        }
    }
}

// Render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    cubes.forEach((cube) => {
        cube.rotation.x += 11
        cube.rotation.y += 11
    })

}


animate();
