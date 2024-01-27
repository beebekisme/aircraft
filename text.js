import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


var scene = new THREE.Scene();
    scene.background = new THREE.Color( 'gainsboro' );

var camera = new THREE.PerspectiveCamera( 30, innerWidth/innerHeight );
  camera.position.set( 10, 20, 40 );
  camera.lookAt( scene.position );

const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

const loader = new GLTFLoader();
let airplane;

loader.load('./airplane/danfe.glb', function (gltf) {
  airplane = gltf.scene;
  scene.add(airplane);

  // Set initial position and rotation
  airplane.position.set(0, 0, 0);
  airplane.rotation.set(0, 0, 0);
  
  // Add light to the scene with increased intensity
  var ambientLight = new THREE.AmbientLight( 'white', 0.5 );
  scene.add( ambientLight );

  var light = new THREE.DirectionalLight( 'white', 0.5 );
    light.position.set( 1, 1, 1 );
    scene.add( light );

  var controls = new OrbitControls( camera, renderer.domElement );
    controls.enablePan = true;
    controls.enableZoom = false; 
    controls.enableDamping = true;
    controls.minPolarAngle = 0.8;
    controls.maxPolarAngle = 2.4;
    controls.dampingFactor = 0.07;
    controls.rotateSpeed = 0.7;
  
    // resize window listner 
  window.addEventListener( "resize", (event) => {
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix( );
    renderer.setSize( innerWidth, innerHeight );
  });

  // Clips back camera to original position
  var smoothReset = false;

  controls.addEventListener( 'start', onStart );
  controls.addEventListener( 'end', onEnd );

  // starting new drag with OrbitCintrols -- recover the min.max values
  function onStart( event )
  {
      controls.minAzimuthAngle = -Infinity;
      controls.maxAzimuthAngle = Infinity;
      controls.minPolarAngle = 0;
      controls.maxPolarAngle = Math.PI;
      smoothReset =  false;
  }

  // enging drag with OrbitControls -- activate smooth reset
  function onEnd( event )
  {
      smoothReset = true;
  }

  // function to smooth reset the OrbitControl camera's angles
  function doSmoothReset( )
  {
      // get current angles
      var alpha = controls.getAzimuthalAngle( ),
          beta = controls.getPolarAngle( )-Math.PI/2;
    
      // if they are close to the reset values, just set these values
      if( Math.abs(alpha) < 0.001 ) alpha = 0;
      if( Math.abs(beta) < 0.0001 ) beta = 0;

      // smooth change using manual lerp
      controls.minAzimuthAngle = 0.95*alpha;
      controls.maxAzimuthAngle = controls.minAzimuthAngle;

      controls.minPolarAngle = Math.PI/2 + 0.95*beta;
      controls.maxPolarAngle = controls.minPolarAngle;

      // if the reset values are reached, exit smooth reset
      if( alpha == 0 && beta == 0) onStart( )
  }

  function animate() {
    if( smoothReset ) doSmoothReset( );
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
    light.position.copy( camera.position );
    
  
  }

  // Set the initial position and rotation
  let initialPosition = new THREE.Vector3(0, 0, 0);
  let initialRotation = new THREE.Euler(0, 0, 0);

  // Set the initial position and rotation
  airplane.position.copy(initialPosition);
  airplane.rotation.copy(initialRotation);

  // Parameters for animation
  let animationDuration = 5; // in seconds
  let timeElapsed = 0;
  let forward = true;

  function animate() {
    if (smoothReset) doSmoothReset();
    // to avoid clipping 
    // Update the airplane position for animation 
    if (forward) {
      timeElapsed += 1 / 60; // assuming 60 frames per second
      let t = Math.min(timeElapsed / animationDuration, 1);

      // Move the airplane along a banking and sweeping path from right to left
      // all the values are hit and trial, no formula to make these shit
      let newPosition = new THREE.Vector3(40 * t, -6 * Math.sin(-t * Math.PI), 25 * t); //Banking 
      let newRotation = new THREE.Euler(-0.4, 0.2  * Math.PI * t, -0.4 * Math.PI * -t); //Rotation

      airplane.position.lerp(newPosition, 0.005); // Adjust the interpolation factor for smooth movement
      airplane.rotation.copy(newRotation);

      if (t === 1) {
        forward = false;
        timeElapsed = 0;
      }
    } else {
      timeElapsed += 1 / 60;
      let t = Math.min(timeElapsed / animationDuration, 1);

      // Move the airplane back to the initial position
      let newPosition = initialPosition.clone();
      let newRotation = initialRotation.clone();
      // This lerp is for how smoothly it goes back to initial position
      // fuck: first time documenting code; shit's hard
      airplane.position.lerp(newPosition, 0.007);
      airplane.rotation.copy(newRotation);

      if (t === 1) {
        forward = true;
        timeElapsed = 0;
      }
    }

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
    light.position.copy(camera.position);
  }
  

  animate();

  

});

function toRadians(angle) {
  return angle * (Math.PI / 180);
}
