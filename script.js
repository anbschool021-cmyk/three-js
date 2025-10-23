import * as THREE from "https://unpkg.com/three@0.126.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.126.0/examples/jsm/loaders/GLTFLoader.js";

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
document.body.appendChild(renderer.domElement);

let animatedModel;
let mixer;
let loadedGltf; // Store the loaded GLTF object globally
const clock = new THREE.Clock(); // Add a clock to manage animation timing

const loader = new GLTFLoader();
loader.load(
  "https://threejs.org/examples/models/gltf/Soldier.glb",
  function (gltf) {
    animatedModel = gltf.scene;
    animatedModel.scale.set(0.5, 0.5, 0.5); // Increase scale by 5 times
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

  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
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

    // Execute user's code. Pass 'scene' and 'THREE' as context.
    new Function("scene", "THREE", userCode)(scene, THREE);
  } catch (error) {
    console.error("Error executing user code:", error);
    alert("Error in your code: " + error.message);
  }
});

const exercises = [
  {
    title: "Exercise 1: Make Character Run",
    code: `if (mixer && loadedGltf) {
    mixer.stopAllAction();
    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'run'); // Assuming 'run' is an animation clip name
    if (clip) {
        mixer.clipAction(clip).play();
    } else {
        console.warn("'run' animation clip not found.");
    }
}`,
  },
  {
    title: "Exercise 2: Make Character Jump",
    code: `if (mixer && loadedGltf) {
    mixer.stopAllAction();
    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'jump'); // Assuming 'jump' is an animation clip name
    if (clip) {
        mixer.clipAction(clip).play();
        mixer.addEventListener('finished', function(e) {
            // After jump animation finishes, revert to a default animation (e.g., idle or walk)
            mixer.stopAllAction();
            const defaultClip = THREE.AnimationClip.findByName(loadedGltf.animations, 'idle'); // Assuming 'idle' exists
            if (defaultClip) mixer.clipAction(defaultClip).play();
        });
    } else {
        console.warn("'jump' animation clip not found.");
    }
}`,
  },
  {
    title: "Exercise 3: Make Character Fall",
    code: `if (mixer && loadedGltf) {
    mixer.stopAllAction();
    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'fall'); // Assuming 'fall' or similar exists
    if (clip) {
        mixer.clipAction(clip).play();
    } else {
        console.warn("'fall' animation clip not found. Using a generic pose.");
        // Fallback: Manually adjust pose for a 'fail' effect if no animation exists
        animatedModel.rotation.x = Math.PI / 2; // Lie down
        animatedModel.position.y = -0.5; // Adjust position
    }
}`,
  },
  {
    title: "Exercise 4: Make Character Run Faster",
    code: `if (mixer && loadedGltf) {
    mixer.stopAllAction();
    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'run');
    if (clip) {
        const action = mixer.clipAction(clip);
        action.setEffectiveTimeScale(2); // Play animation twice as fast
        action.play();
    } else {
        console.warn("'run' animation clip not found.");
    }
}`,
  },
  {
    title: "Exercise 5: Make Character Walk Back",
    code: `if (mixer && loadedGltf) {
    mixer.stopAllAction();
    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'walk'); // Assuming 'walk' exists
    if (clip) {
        const action = mixer.clipAction(clip);
        action.setEffectiveTimeScale(1);
        action.play();
        // Animate movement backward
        let walkBackTime = 0;
        const walkBackAnimate = () => {
            requestAnimationFrame(walkBackAnimate);
            if (mixer) mixer.update(clock.getDelta());
            animatedModel.position.z += 0.05; // Move backward
            renderer.render(scene, camera);
            walkBackTime += 1;
            if (walkBackTime > 200) cancelAnimationFrame(walkBackAnimate); // Stop after a duration
        };
        walkBackAnimate();
    } else {
        console.warn("'walk' animation clip not found.");
    }
}`,
  },
  {
    title: "Exercise 6: Make Character Walk Ahead",
    code: `if (mixer && loadedGltf) {
    mixer.stopAllAction();
    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'walk'); // Assuming 'walk' exists
    if (clip) {
        const action = mixer.clipAction(clip);
        action.setEffectiveTimeScale(1);
        action.play();
        // Animate movement forward
        let walkAheadTime = 0;
        const walkAheadAnimate = () => {
            requestAnimationFrame(walkAheadAnimate);
            if (mixer) mixer.update(clock.getDelta());
            animatedModel.position.z -= 0.05; // Move forward
            renderer.render(scene, camera);
            walkAheadTime += 1;
            if (walkAheadTime > 200) cancelAnimationFrame(walkAheadAnimate); // Stop after a duration
        };
        walkAheadAnimate();
    } else {
        console.warn("'walk' animation clip not found.");
    }
}`,
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
    animatedModel.position.set(0, 0, 0);
    animatedModel.rotation.set(0, 0, 0);
    animatedModel.scale.set(0.5, 0.5, 0.5); // Ensure consistent 5x larger scale
    // Reset animations if a mixer exists
    if (mixer && loadedGltf) {
      mixer.stopAllAction();
      mixer = new THREE.AnimationMixer(animatedModel);
      loadedGltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
      });
    }
    // After loading, ensure the camera is positioned to view the model
    camera.position.set(0, 5, 15); // Adjust camera position for better view of larger human model
    camera.lookAt(animatedModel.position);
  }
}

// Populate the dropdown
exercises.forEach((exercise, index) => {
  const option = document.createElement("option");
  option.value = index;
  option.textContent = exercise.title;
  exerciseSelect.appendChild(option);
});

// Load the first exercise by default
loadExercise(0);

exerciseSelect.addEventListener("change", (event) => {
  loadExercise(event.target.value);
});
