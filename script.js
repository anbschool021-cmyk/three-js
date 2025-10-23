import * as THREE from "https://unpkg.com/three@0.126.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.126.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://unpkg.com/three@0.126.0/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // Set background to white
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("characterPanel").appendChild(renderer.domElement);

// Add basic lighting to the scene
const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // Brighter white light
directionalLight.position.set(5, 10, 7.5); // Position the light
scene.add(directionalLight);

let animatedModel;
let mixer;
let loadedGltf; // Store the loaded GLTF object globally
const clock = new THREE.Clock(); // Add a clock to manage animation timing
let controls; // Declare controls globally

const loader = new GLTFLoader();
loader.load(
  "https://threejs.org/examples/models/gltf/Soldier.glb",
  function (gltf) {
    animatedModel = gltf.scene;
    animatedModel.scale.set(0.5, 0.5, 0.5); // Make character 2 times bigger than previous (from 0.25)
    animatedModel.position.set(0, 0, 0); // Center character in the scene
    scene.add(animatedModel);

    mixer = new THREE.AnimationMixer(animatedModel);
    gltf.animations.forEach((clip) => {
      mixer.clipAction(clip).play();
    });
    loadedGltf = gltf; // Store the gltf object
  },
  undefined,
  function (error) {
    console.error("Error loading GLTF model:", error);
  }
);

camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);

  if (mixer) {
    mixer.update(clock.getDelta()); // Use clock to get actual delta time
  }

  if (controls) {
    controls.update(); // Only needed if controls.enableDamping is true
  }

  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  const characterPanel = document.getElementById("characterPanel");
  renderer.setSize(window.innerWidth, window.innerHeight); // Renderer size to full window
});

// Ace Editor setup
const editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");
editor.setValue(
  "// Your Three.js code here\n// Example: animatedModel.position.y = 1;", // Changed to reference animatedModel
  -1
);

document.getElementById("executeButton").addEventListener("click", () => {
  const userCode = editor.getValue();
  try {
    // Clear previous user-added objects (if any)
    scene.children = scene.children.filter(
      (obj) => obj === animatedModel || obj === camera
    );

    // Execute user's code. Pass 'scene', 'THREE', 'animatedModel', and 'mixer' as context.
    new Function("scene", "THREE", "animatedModel", "mixer", userCode)(
      scene,
      THREE,
      animatedModel,
      mixer
    );
  } catch (error) {
    console.error("Error executing user code:", error);
    alert("Error in your code: " + error.message);
  }
});

const exercises = [
  {
    title: "Exercise 1: Make Character Run",
    code: `// Goal: Make the character perform a running animation.
// Hint: Use mixer.stopAllAction() and then play the 'run' animation clip.
// Example:
if (mixer && loadedGltf) {
    mixer.stopAllAction();
    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'run');
    if (clip) {
        mixer.clipAction(clip).play();
    } else {
        console.warn("'run' animation clip not found.");
    }
}`,
  },
  {
    title: "Exercise 2: Make Character Jump",
    code: `// Goal: Make the character perform a jumping animation and then return to a default pose.
// Hint: Look for a 'jump' animation clip. You might need to listen for the 'finished' event to transition back.
// Example:
if (mixer && loadedGltf) {
    mixer.stopAllAction();
    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'jump');
    if (clip) {
        const action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopOnce); // Play once
        action.reset(); // Ensure it starts from the beginning
        action.play();
        mixer.addEventListener('finished', function onFinished() {
            mixer.removeEventListener('finished', onFinished);
            // Revert to a default animation (e.g., 'idle' or 'walk') after jumping
            mixer.stopAllAction();
            const defaultClip = THREE.AnimationClip.findByName(loadedGltf.animations, 'idle');
            if (defaultClip) mixer.clipAction(defaultClip).play();
            else console.warn("'idle' animation clip not found after jump.");
        });
    } else {
        console.warn("'jump' animation clip not found.");
    }
}`,
  },
  {
    title: "Exercise 3: Make Character Fall",
    code: `// Goal: Make the character perform a falling/fail animation or pose.
// Hint: Look for a 'fall' or 'death' animation, or manually set the character's rotation/position.
// Example:
if (mixer && loadedGltf) {
    mixer.stopAllAction();
    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'fall'); // Or 'death', 'fail'
    if (clip) {
        const action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopOnce); // Play once
        action.reset();
        action.play();
    } else {
        console.warn("'fall' animation clip not found. Applying a generic prone pose.");
        animatedModel.rotation.x = Math.PI / 2; // Lie face down
        animatedModel.position.y = -0.5; // Adjust position to be on the ground
        animatedModel.position.z = 0; // Ensure it's still centered in Z
    }
}`,
  },
  {
    title: "Exercise 4: Make Character Run Faster",
    code: `// Goal: Make the character's 'run' animation play at a faster speed.
// Hint: Get the 'run' animation action and use setEffectiveTimeScale().
// Example:
if (mixer && loadedGltf) {
    mixer.stopAllAction();
    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'run');
    if (clip) {
        const action = mixer.clipAction(clip);
        action.setEffectiveTimeScale(2.5); // Play animation 2.5 times faster
        action.play();
    } else {
        console.warn("'run' animation clip not found.");
    }
}`,
  },
  {
    title: "Exercise 5: Make Character Walk Back",
    code: `// Goal: Make the character perform a 'walk' animation and move backward in the scene.
// Hint: Play the 'walk' animation. In the animate loop, decrease the character's Z-position.
// Example:
if (mixer && loadedGltf) {
    mixer.stopAllAction();
    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'walk');
    if (clip) {
        const action = mixer.clipAction(clip);
        action.setEffectiveTimeScale(1);
        action.play();
        
        // Animate movement backward (this part goes in the main animate() loop if continuous)
        // For a one-shot movement in exercise context, we can simulate:
        let walkBackDistance = 0;
        const maxWalkBackDistance = 3; // units
        const walkSpeed = 0.02; // units per frame

        const moveBackwardInterval = setInterval(() => {
            if (walkBackDistance < maxWalkBackDistance) {
                animatedModel.position.z += walkSpeed;
                walkBackDistance += walkSpeed;
            } else {
                clearInterval(moveBackwardInterval);
            }
        }, 1000 / 60); // Roughly 60 frames per second

        // IMPORTANT: In a real app, you'd integrate this movement into the main animate loop
        // and manage animation state. For an exercise, this gives a quick demonstration.

    } else {
        console.warn("'walk' animation clip not found.");
    }
}`,
  },
  {
    title: "Exercise 6: Make Character Walk Ahead",
    code: `// Goal: Make the character perform a 'walk' animation and move forward in the scene.
// Hint: Play the 'walk' animation. In the animate loop, increase the character's Z-position (or decrease if camera is behind).
// Example:
if (mixer && loadedGltf) {
    mixer.stopAllAction();
    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'walk');
    if (clip) {
        const action = mixer.clipAction(clip);
        action.setEffectiveTimeScale(1);
        action.play();
        
        // Animate movement forward
        let walkAheadDistance = 0;
        const maxWalkAheadDistance = 3; // units
        const walkSpeed = 0.02; // units per frame

        const moveForwardInterval = setInterval(() => {
            if (walkAheadDistance < maxWalkAheadDistance) {
                animatedModel.position.z -= walkSpeed; // Move forward
                walkAheadDistance += walkSpeed;
            } else {
                clearInterval(moveForwardInterval);
            }
        }, 1000 / 60); // Roughly 60 frames per second

    } else {
        console.warn("'walk' animation clip not found.");
    }
}`,
  },
  {
    title: "Exercise 9: Move Camera Around Character",
    code: `// Goal: Animate the camera to orbit around the character.
// Hint: Modify camera.position.x and camera.position.z using Math.sin/cos and then camera.lookAt().
// This code needs to be integrated into the main animation loop to be continuous.
// Example (Paste this into the editor and click 'Execute Code'):

let cameraOrbitTime = 0; // Initialize a time variable

// We need to modify the main animate loop for continuous camera movement.
// For an exercise, you might just demonstrate one full orbit or a fixed movement.

// To make this a continuous exercise, you would typically inject this into the main animate function
// or manage it with a separate AnimationMixer for the camera.

// For a direct exercise demonstration, you can see the effect by repeatedly clicking 'Execute Code'
// or modifying the main animate loop directly (which is beyond this exercise's scope).

// For a single orbit demonstration (click execute once):
const orbitDuration = 2000; // milliseconds
const startPosition = camera.position.clone();
const target = animatedModel.position;

new TWEEN.Tween({ t: 0 })
    .to({ t: 1 }, orbitDuration)
    .onUpdate(function({ t }) {
        const angle = t * Math.PI * 2; // Full circle
        const radius = startPosition.distanceTo(target);

        camera.position.x = target.x + Math.sin(angle) * radius;
        camera.position.z = target.z + Math.cos(angle) * radius;
        camera.lookAt(target);
        if (controls) controls.update(); // Update controls if damping is enabled
    })
    .start();

// Note: TWEEN.js is not imported by default. This example assumes it's available or imported separately.
// For simpler exercises, stick to direct manipulation or basic timers.

// Simpler example that modifies main animate loop (requires user to modify script.js directly):
/*
function animate() {
    requestAnimationFrame(animate);
    // ... other updates ...

    camera.position.x = Math.sin(cameraOrbitTime * 0.01) * 7;
    camera.position.z = Math.cos(cameraOrbitTime * 0.01) * 7;
    camera.lookAt(animatedModel.position);
    cameraOrbitTime += 1;

    // ... render scene ...
}
*/

// For this exercise, we will just set the camera to a new position:
camera.position.set(5, 5, 5); // New camera position
camera.lookAt(animatedModel.position); // Look at the character
if (controls) controls.update();`,
  },
  {
    title: "Exercise 10: Add a Simple Ground Plane",
    code: `// Goal: Add a flat ground plane to the scene below the character.
// Hint: Use PlaneGeometry and MeshStandardMaterial. Remember to rotate it flat and position it correctly.
// Example:
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
ground.position.y = -0.5; // Position below character
scene.add(ground);

// Add lights if not already present (main scene already has them)
// const ambientLight = new THREE.AmbientLight(0x404040, 2);
// scene.add(ambientLight);
// const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
// directionalLight.position.set(5, 10, 7.5);
// scene.add(directionalLight);`,
  },
  {
    title: "Exercise 11: Animate Character Scale",
    code: `// Goal: Make the character grow and shrink over time.
// Hint: Modify animatedModel.scale in the animation loop using Math.sin().
// This code needs to be integrated into the main animation loop to be continuous.
// Example (Paste this into the editor and click 'Execute Code'):

let scaleTime = 0; // Initialize a time variable

// For an exercise demonstration, we can simulate a one-shot scaling effect
const initialScale = animatedModel.scale.x;
const scaleDuration = 1500; // milliseconds

new TWEEN.Tween({ t: 0 })
    .to({ t: 1 }, scaleDuration)
    .easing(TWEEN.Easing.Sinusoidal.InOut)
    .onUpdate(function({ t }) {
        const scaleFactor = initialScale * (1 + Math.sin(t * Math.PI * 2) * 0.5); // Pulse effect
        animatedModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
        if (controls) controls.update();
    })
    .start();

// Note: TWEEN.js is not imported by default. This example assumes it's available or imported separately.
// For simpler exercises, stick to direct manipulation or basic timers.

// Simpler example that modifies main animate loop (requires user to modify script.js directly):
/*
function animate() {
    requestAnimationFrame(animate);
    // ... other updates ...

    const scaleFactor = 0.5 + (Math.sin(scaleTime * 0.05) * 0.2);
    animatedModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
    scaleTime += 0.5;

    // ... render scene ...
}
*/

// For this exercise, we will just set the character to a new scale:
animatedModel.scale.set(1, 1, 1); // Make it temporarily much larger
if (controls) controls.update();`,
  },
];

const exerciseSelect = document.getElementById("exerciseSelect");

function loadExercise(exerciseIndex) {
  const exercise = exercises[exerciseIndex];
  editor.setValue(exercise.code, -1);
  // Clear all objects except the animated model and camera, then reset model properties
  const objectsToRemove = scene.children.filter(
    (obj) => obj !== animatedModel && obj !== camera
  );
  objectsToRemove.forEach((obj) => scene.remove(obj));

  if (animatedModel) {
    animatedModel.position.set(0, 0, 0); // Reset character position to center
    animatedModel.rotation.set(0, 0, 0);
    animatedModel.scale.set(0.5, 0.5, 0.5); // Ensure consistent 2x bigger scale
    // Reset animations if a mixer exists
    if (mixer && loadedGltf) {
      mixer.stopAllAction();
      mixer = new THREE.AnimationMixer(animatedModel);
      loadedGltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
      });
    }
    // After loading, ensure the camera is positioned to view the model
    if (controls) {
      controls.target.copy(animatedModel.position);
      controls.update();
    } else {
      // Fallback if controls aren't initialized yet (e.g., initial load before model is ready)
      camera.position.set(0, 5, 20); // Adjust camera position for the even larger character
      camera.lookAt(animatedModel.position);
    }
  }
  // Show the entire controls panel when an exercise is loaded
  document.getElementById("controlsPanel").style.display = "flex";

  // Update active button styling
  const currentActiveButton = document.querySelector(".active-exercise-button");
  if (currentActiveButton) {
    currentActiveButton.classList.remove("active-exercise-button");
  }
  const newActiveButton = document.querySelector(
    `.exercise-button:nth-child(${exerciseIndex + 1})`
  );
  if (newActiveButton) {
    newActiveButton.classList.add("active-exercise-button");
  }
}

// Populate the dropdown
const exerciseButtonsContainer = document.getElementById("exerciseButtons");

// Populate with buttons
exercises.forEach((exercise, index) => {
  const button = document.createElement("button");
  button.classList.add("exercise-button");
  button.textContent = exercise.title;
  button.addEventListener("click", () => loadExercise(index));
  exerciseButtonsContainer.appendChild(button);
});

// Load the first exercise by default
loadExercise(0);
