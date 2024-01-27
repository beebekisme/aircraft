import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Create a scene, a camera, and a renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(9, -1, 17);
camera.lookAt(-60, 10, -20);

const renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: true, alpha: true });
renderer.sortObjects = false;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

// Append the renderer's dom element to the body
document.body.appendChild(renderer.domElement);

// Set CSS styles for the renderer's dom element
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.zIndex = '1'; // You can adjust the z-index value as needed

const loader = new GLTFLoader();
let airplane;

loader.load('./airplane/danfe.glb', function (gltf) {
  airplane = gltf.scene;
  airplane.scale.set(35, 35, 35);
  airplane.rotation.y = -Math.PI / 2;
  airplane.rotation.x = -Math.PI / 40;
  scene.add(airplane);
  
  // Set the initial position and rotation of the airplane
  airplane.position.set(0, 0, -30);

  const light = new THREE.AmbientLight(0xffffff, 3);
  light.position.set(0, 1, 0);
  scene.add(light);

  // Define the speed and direction of the airplane's movement
  let speed = 0.1; // The speed of the airplane in units per frame
  const initialSpeed = speed; // Store the initial speed
  const direction = new THREE.Vector3(0, 0, 1); // The direction of the airplane's movement in the x, y, z axes

  // Create a raycaster object and a mouse vector
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Define variables to store the initial mouse position during click
  let isDragging = false;
  let startMouseX = 0;

  // Define a variable for smooth rotation interpolation
  let smoothRotation = 0;

  // Add event listeners for mousedown and mouseup to enable dragging
  window.addEventListener('mousedown', function (event) {
    isDragging = true;
    startMouseX = event.clientX;
  });

  window.addEventListener('mouseup', function () {
    isDragging = false;

    // Move the smooth rotation logic here
    if (!isDragging && airplane.rotation.y !== -Math.PI / 2) {
      // Smoothly rotate the airplane back to its original position
      const targetRotation = -Math.PI / 2;
      smoothRotation = (targetRotation - airplane.rotation.y) * 0.08;
    }
  });

  
  window.addEventListener('mousemove', function (event) {
    // Update the mouse vector
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    if (isDragging && raycaster.intersectObject(airplane).length > 0) {
      // Drag distance and adjusts rotation based on drag distance
      const dragDistance = event.clientX - startMouseX;
      const rotationSpeed = 0.005;
      airplane.rotation.y += dragDistance * rotationSpeed;
      startMouseX = event.clientX;
    }

    raycaster.setFromCamera(mouse, camera);
  }, false);

  function handleResize() {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
  
    // Update the camera aspect ratio
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
  
    // Update the renderer size
    renderer.setSize(newWidth, newHeight);
  }
  
  // Add event listener for window resize
  window.addEventListener('resize', handleResize);

  function updateAirplane() {
    // Move the airplane along the direction vector
    airplane.position.add(direction.clone().multiplyScalar(speed));
  
    // If the airplane reaches the edge of the screen, reset the position and rotation
    if (airplane.position.z > window.innerWidth / 25 || airplane.position.z < -window.innerWidth / 25) {
      airplane.position.set(0, 0, -30);
      airplane.rotation.y = -Math.PI / 2;
      // airplane.rotation.x = -Math.PI / 40;
    }
  
    // Check if the raycaster intersects with the airplane
    if (raycaster.intersectObject(airplane).length > 0) {
      // Decelerate smoothly when hovering over the airplane
      speed *= 0.95; 
    } else {
      // Accelerate smoothly when not hovering over the airplane
      speed += (initialSpeed - speed) * 0.02; // You can adjust this factor for more or less acceleration
    }
  
    if (!isDragging && airplane.rotation.y !== -Math.PI / 2) {
      // Smoothly rotate the airplane back to its original position
      const targetRotation = -Math.PI / 2;
      // Ensure the rotation stays within the desired range
      if (Math.abs(airplane.rotation.y - targetRotation) > 0.01) {
        airplane.rotation.y = THREE.MathUtils.lerp(airplane.rotation.y, targetRotation, 0.08);
      } else {
        airplane.rotation.y = targetRotation;
      }
      smoothRotation *= 0.95;
    }
  }

  function animate() {
    requestAnimationFrame(animate);
   
    updateAirplane();
    renderer.render(scene, camera);
  }
  handleResize();

  animate();
});
