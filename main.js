import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ---- 1. Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa09090);

// ---- 2. Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0.0, 0.5, 3.0);

// ---- 3. Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.domElement.classList.add("blurred-3d"); // Initial blur state
document.body.appendChild(renderer.domElement);

// ---- 4. Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// ---- 5. Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

controls.target.set(0, 0, 0); //

controls.minDistance = 2.0;
controls.maxDistance = 3.0;

controls.minPolarAngle = Math.PI * 0.3; // 상하 회전 제한 (polar angle)
controls.maxPolarAngle = Math.PI * 0.6;

controls.minAzimuthAngle = -Math.PI * 0.1; // 좌우 회전 제한 (azimuth angle)
controls.maxAzimuthAngle = Math.PI * 0.1;

controls.update(); // target 변경 후 반드시 호출

// ---- 6. GLB Loader
const loader = new GLTFLoader();
loader.load(
  "./assets/marshmallko.glb", // 🔹 GLB 파일 경로
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);
  },
  (progress) => {
    console.log(
      `로딩중: ${((progress.loaded / progress.total) * 100).toFixed(2)}%`,
    );
  },
  (error) => {
    console.error("GLB 로드 실패:", error);
  },
);

// ---- 7. Resize 대응
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---- 8. Animate
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// ---- 9. Intro Interaction Logic
const titleTrigger = document.getElementById("titleTrigger");
const canvas = renderer.domElement;

titleTrigger.addEventListener("click", () => {
  // Fade out title
  titleTrigger.classList.remove("is-visible");
  titleTrigger.classList.add("is-hidden");

  // Remove blur from 3D model
  canvas.classList.remove("blurred-3d");
  canvas.classList.add("clear-3d");

  // Optional: Remove overlay from DOM after animation for performance
  setTimeout(() => {
    const overlay = document.getElementById("introOverlay");
    if (overlay) {
      overlay.style.display = "none";
    }
  }, 1200); // Match CSS transition duration
});
