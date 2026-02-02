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

controls.target.set(0, 0, 0);

controls.minDistance = 2.0;
controls.maxDistance = 3.0;

controls.minPolarAngle = Math.PI * 0.3; // 상하 회전 제한 (polar angle)
controls.maxPolarAngle = Math.PI * 0.5;

controls.minAzimuthAngle = -Math.PI * 0.2; // 좌우 회전 제한 (azimuth angle)
controls.maxAzimuthAngle = Math.PI * 0.2;

controls.update(); // target 변경 후 반드시 호출

// ---- 6. Main Object Loader
let mainModel = null;

const mainMoldeLoader = new GLTFLoader();
mainMoldeLoader.load("./assets/marshmallko.glb", function (gltf) {
  mainModel = gltf.scene;
  scene.add(mainModel);
  console.log("마시멜꼬 모델 로드 완료");
});

// ---- 7. Background Object Loader
let barnModel = null;

const barnMoldeLoader = new GLTFLoader();
barnMoldeLoader.load("./assets/barn.glb", function (gltf) {
  barnModel = gltf.scene;
  barnModel.position.set(0, -0.5, 0);
  barnModel.rotation.set(0, 0, 0);
  barnModel.scale.set(1, 1, 1);

  scene.add(barnModel);
  console.log("헛간 모델 로드 완료");
});

// ---- 8. Marshmallow Loader
const marshmallowObjects = [];
const marshmallowCount = 15;
let marshmallowTemplate = null;

// 마시멜로우 모델 로드
const marshmallowLoader = new GLTFLoader();
marshmallowLoader.load("./assets/marshmallow.glb", function (gltf) {
  marshmallowTemplate = gltf.scene;

  // 로드된 모델을 복제하여 여러 개 배치
  for (let i = 0; i < marshmallowCount; i++) {
    const marshmallow = marshmallowTemplate.clone();

    // 메인 모델 주위에 랜덤 배치
    const radius = 1.0 + Math.random() * 0.4;
    const angle = Math.random() * Math.PI * -1.0;
    const height = 0.3 + Math.random() * 1.2;

    marshmallow.position.set(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius,
    );

    // 랜덤 회전 설정
    marshmallow.rotation.x = Math.random() * Math.PI;
    marshmallow.rotation.y = Math.random() * Math.PI;
    marshmallow.rotation.z = Math.random() * Math.PI;

    // 랜덤 스케일 설정 (약간의 크기 변화)
    const scale = 0.05 + Math.random() * 0.2;
    marshmallow.scale.set(scale, scale, scale);

    // 각 마시멜로우별 회전 속도 및 축 저장
    marshmallow.userData = {
      rotationSpeed: 0.01 + Math.random() * 0.02,
      rotationAxis: new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5,
      ).normalize(),
    };

    scene.add(marshmallow);
    marshmallowObjects.push(marshmallow);
    console.log("떠다니는 마시멜로 모델 로드 완료");
  }
});

// ---- 9. Resize 대응
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---- 10. Animate
let time = 0;

function animate() {
  requestAnimationFrame(animate);
  time += 0.01;

  // 메인 모델 부유 효과 (사인 곡선)
  if (mainModel) {
    mainModel.position.y = 0.1 + Math.sin(time * 1.5) * 0.07;
  }

  // 마시멜로우 모델 회전
  marshmallowObjects.forEach(function (marshmallow) {
    const rotationSpeed = marshmallow.userData.rotationSpeed;
    const rotationAxis = marshmallow.userData.rotationAxis;
    marshmallow.rotateOnAxis(rotationAxis, rotationSpeed);
  });

  controls.update();
  renderer.render(scene, camera);
}
animate();

// ---- 11. Intro Interaction Logic
const titleTrigger = document.getElementById("titleTrigger");
const canvas = renderer.domElement;

titleTrigger.addEventListener("click", function () {
  // Fade out title
  titleTrigger.classList.remove("is-visible");
  titleTrigger.classList.add("is-hidden");

  // Remove blur from 3D model
  canvas.classList.remove("blurred-3d");
  canvas.classList.add("clear-3d");

  // Optional: Remove overlay from DOM after animation for performance
  setTimeout(function () {
    const overlay = document.getElementById("introOverlay");
    if (overlay) {
      overlay.style.display = "none";
    }
  }, 1200); // Match CSS transition duration
});
