// Load the embedding data from the JSON file
fetch('embedding_data.json')
    .then(response => response.json())
    .then(data => {
        const words = data.words;
        const vectors = data.vectors;
        init(words, vectors);
        animate();
    });

let camera, scene, renderer;
let raycaster, mouse;
let INTERSECTED;
const spheres = [];

let isPointerLocked = false;
let yaw = 0;
let pitch = 0;
const pitchLimit = Math.PI / 2 - 0.01;
const movementSpeed = 20; // Adjust movement speed as needed

// Keyboard movement controls
const keysPressed = {};

function init(words, vectors) {
    // Set up the scene
    scene = new THREE.Scene();

    // Set up the camera
    camera = new THREE.PerspectiveCamera(
        75, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    camera.position.set(0, 10, 50); // Start the camera at a position

    // Set up the renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Set up lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    // Set up ground plane
    const groundGeometry = new THREE.PlaneGeometry(400, 400);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Set up pointer lock controls
    document.addEventListener('pointerlockchange', pointerLockChange, false);
    renderer.domElement.addEventListener('click', () => {
        renderer.domElement.requestPointerLock();
    });

    // Mouse movement
    document.addEventListener('mousemove', onDocumentMouseMove, false);

    // Keyboard controls
    document.addEventListener('keydown', (event) => {
        keysPressed[event.code] = true;
    });
    document.addEventListener('keyup', (event) => {
        keysPressed[event.code] = false;
    });

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Set up raycaster for mouse interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Create spheres for each word
    const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);

    for (let i = 0; i < vectors.length; i++) {
        const vector = vectors[i];
        const word = words[i];

        const color = new THREE.Color(0x0077ff);
        // Optionally, you can set colors based on word categories

        const material = new THREE.MeshPhongMaterial({ color: color });
        const sphere = new THREE.Mesh(sphereGeometry, material);
        sphere.position.set(vector[0] * 20, vector[1] * 20, vector[2] * 20); // Scale positions
        sphere.userData = { word: word };
        scene.add(sphere);
        spheres.push(sphere);
    }
}

function pointerLockChange() {
    isPointerLocked = document.pointerLockElement === renderer.domElement;
}

function onDocumentMouseMove(event) {
    if (!isPointerLocked) {
        // Update mouse position for raycasting
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
        return;
    }

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    yaw -= movementX * 0.002;
    pitch -= movementY * 0.002;
    pitch = Math.max(-pitchLimit, Math.min(pitchLimit, pitch));

    camera.rotation.set(pitch, yaw, 0, 'YXZ');
}

function movePlayer(delta) {
    const velocity = movementSpeed * delta;
    const direction = new THREE.Vector3();

    if (keysPressed['KeyW'] || keysPressed['ArrowUp']) direction.z += 1;
    if (keysPressed['KeyS'] || keysPressed['ArrowDown']) direction.z -= 1;
    if (keysPressed['KeyA'] || keysPressed['ArrowLeft']) direction.x += 1;
    if (keysPressed['KeyD'] || keysPressed['ArrowRight']) direction.x -= 1;

    direction.normalize();

    // Get camera's forward and right vectors
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(camera.up, forward).normalize();

    // Calculate movement
    const moveX = right.x * direction.x + forward.x * direction.z;
    const moveZ = right.z * direction.x + forward.z * direction.z;

    camera.position.x += moveX * velocity;
    camera.position.z += moveZ * velocity;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

let previousTime = performance.now();

function animate() {
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const delta = (currentTime - previousTime) / 1000;
    previousTime = currentTime;

    if (isPointerLocked) {
        movePlayer(delta);
    }

    // Update raycaster
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(spheres);

    if (intersects.length > 0) {
        if (INTERSECTED != intersects[0].object) {
            if (INTERSECTED) INTERSECTED.material.color.set(0x0077ff);
            INTERSECTED = intersects[0].object;
            INTERSECTED.material.color.set(0xff0000);

            // Display the word
            document.getElementById('info').innerHTML = `
                <p><strong>Word:</strong> ${INTERSECTED.userData.word}</p>
                <p>Click on the canvas to lock the pointer and enable movement controls.</p>
                <p>Use <strong>W, A, S, D</strong> keys to move.</p>
                <p>Hover over a sphere to see the word.</p>
            `;
        }
    } else {
        if (INTERSECTED) INTERSECTED.material.color.set(0x0077ff);
        INTERSECTED = null;
        document.getElementById('info').innerHTML = `
            <p>Click on the canvas to lock the pointer and enable movement controls.</p>
            <p>Use <strong>W, A, S, D</strong> keys to move.</p>
            <p>Hover over a sphere to see the word.</p>
        `;
    }

    renderer.render(scene, camera);
}
