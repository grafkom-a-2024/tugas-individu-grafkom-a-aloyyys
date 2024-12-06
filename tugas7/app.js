const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 1, 1000);

// Kamera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// camera control
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Pencahayaan
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Lantai
const floorGeometry = new THREE.PlaneGeometry(20, 20);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.7;
floor.receiveShadow = true;
scene.add(floor);

const geometries = [
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.SphereGeometry(0.7, 32, 32),
    new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
    new THREE.TorusGeometry(0.5, 0.2, 16, 100)
];

const materials = [
    new THREE.MeshStandardMaterial({ color: 0xff0000, metalness: 0.5, roughness: 0.5 }),
    new THREE.MeshStandardMaterial({ color: 0x00ff00, metalness: 0.7, roughness: 0.3 }),
    new THREE.MeshStandardMaterial({ color: 0x0000ff, metalness: 0.3, roughness: 0.7 }),
    new THREE.MeshStandardMaterial({ color: 0xffff00, metalness: 0.6, roughness: 0.4 })
];

const meshes = geometries.map((geometry, index) => {
    const mesh = new THREE.Mesh(geometry, materials[index]);
    mesh.position.x = (index - 1.5) * 2;
    mesh.castShadow = true;
    scene.add(mesh);
    return mesh;
});

// Variabel untuk model GLB
let loadedModel = null;

// Load GLB Model
const loader = new THREE.GLTFLoader();
loader.load(
    'tasty_burger.glb', 
    (gltf) => {
        loadedModel = gltf.scene;
        loadedModel.scale.set(1, 1, 1);
        loadedModel.position.set(0, 0, 0);
        loadedModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(loadedModel);
        document.getElementById('loading').style.display = 'none';
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error('Error loading model', error);
    }
);

// Kontrol Pergerakan
const moveSpeed = 0.07;
const keyState = {};

function handleMovement() {
    if (!loadedModel) return;

    if (keyState['KeyW']) loadedModel.position.z -= moveSpeed;
    if (keyState['KeyS']) loadedModel.position.z += moveSpeed;
    if (keyState['KeyA']) loadedModel.position.x -= moveSpeed;
    if (keyState['KeyD']) loadedModel.position.x += moveSpeed;
}

// Event Listeners untuk Keyboard
window.addEventListener('keydown', (event) => {
    keyState[event.code] = true;
});

window.addEventListener('keyup', (event) => {
    keyState[event.code] = false;
});

// Render loop
function animate() {
    requestAnimationFrame(animate);

    meshes.forEach((mesh, index) => {
        mesh.rotation.x += 0.01 * (index + 1);
        mesh.rotation.y += 0.01 * (index + 1);
    });

    // Update kontrol orbit
    controls.update();

    // Gerakan model berdasarkan input keyboard
    handleMovement();

    renderer.render(scene, camera);

}

animate();

// Responsif
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
