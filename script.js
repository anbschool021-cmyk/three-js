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
  "https://threejs.org/examples/models/gltf/Horse.glb",
  function (gltf) {
    animatedModel = gltf.scene;
    animatedModel.scale.set(0.012, 0.012, 0.012); // Make character 5 times smaller than previous (from 0.06)
    animatedModel.position.set(0, 0, 0); // Center character in the scene
    scene.add(animatedModel);

    mixer = new THREE.AnimationMixer(animatedModel);
    gltf.animations.forEach((clip) => {
      mixer.clipAction(clip).play();
    });
    loadedGltf = gltf; // Store the gltf object

    // Apply a custom color to the horse
    animatedModel.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({ color: 0x8b4513 }); // Brown color
        child.material.needsUpdate = true;
      }
    });
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
    title: "Exercise 1: Make Horse Run",
    code: `// Goal: Make the horse perform a running animation.
// Hint: Use mixer.stopAllAction() and then play the 'run' animation clip.
// Example:
if (mixer && loadedGltf) {
    mixer.stopAllAction();
    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'run');
    if (clip) {
        mixer.clipAction(clip).play();
    } else {
        console.warn("'run' animation clip not found for horse.");
    }
}`,
  },
  {
    title: "Exercise 2: Make Horse Jump",
    code: `// Goal: Make the horse perform a jumping animation and then return to a default pose.
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
            else console.warn("'idle' animation clip not found for horse after jump.");
        });
    } else {
        console.warn("'jump' animation clip not found for horse.");
    }
}`,
  },
  {
    title: "Exercise 3: Make Horse Fall",
    code: `// Goal: Make the horse perform a falling/fail animation or pose.
// Hint: Look for a 'fall' or 'death' animation, or manually set the horse's rotation/position.
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
        console.warn("'fall' animation clip not found for horse. Applying a generic prone pose.");
        animatedModel.rotation.x = Math.PI / 2; // Lie face down
        animatedModel.position.y = -0.5; // Adjust position to be on the ground
        animatedModel.position.z = 0; // Ensure it's still centered in Z
    }
}`,
  },
  {
    title: "Exercise 4: Make Horse Run Faster",
    code: `// Goal: Make the horse's 'run' animation play at a faster speed.
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
        console.warn("'run' animation clip not found for horse.");
    }
}`,
  },
  {
    title: "Exercise 5: Make Horse Walk Back",
    code: `// Goal: Make the horse perform a 'walk' animation and move backward in the scene.
// Hint: Play the 'walk' animation. In the animate loop, decrease the horse's Z-position.
// Example:
if (mixer && loadedGltf) {
    mixer.stopAllAction();
    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'walk');
    if (clip) {
        const action = mixer.clipAction(clip);
        action.setEffectiveTimeScale(1);
        action.play();
        
        // Animate movement backward
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

    } else {
        console.warn("'walk' animation clip not found for horse.");
    }
}`,
  },
  {
    title: "Exercise 6: Make Horse Walk Ahead",
    code: `// Goal: Make the horse perform a 'walk' animation and move forward in the scene.
// Hint: Play the 'walk' animation. In the animate loop, increase the horse's Z-position (or decrease if camera is behind).
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
        console.warn("'walk' animation clip not found for horse.");
    }
}`,
  },
  {
    title: "Exercise 9: Move Camera Around Horse",
    code: `// Goal: Animate the camera to orbit around the horse.
// Hint: Modify camera.position.x and camera.position.z using Math.sin/cos and then camera.lookAt().
// This code needs to be integrated into the main animation loop to be continuous.
// Example (Paste this into the editor and click 'Execute Code'):

let cameraOrbitTime = 0; // Initialize a time variable

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
        if (controls) controls.update();
    })
    .start();

// Note: TWEEN.js is not imported by default. This example assumes it's available or imported separately.
// For this exercise, we will just set the camera to a new position:
camera.position.set(5, 5, 5); // New camera position
camera.lookAt(animatedModel.position); // Look at the horse
if (controls) controls.update();`,
  },
  {
    title: "Exercise 10: Add a Simple Ground Plane for Horse",
    code: `// Goal: Add a flat ground plane to the scene below the horse.
// Hint: Use PlaneGeometry and MeshStandardMaterial. Remember to rotate it flat and position it correctly.
// Example:
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
ground.position.y = -0.5; // Position below horse
scene.add(ground);

// Add lights if not already present (main scene already has them)
// const ambientLight = new THREE.AmbientLight(0x404040, 2);
// scene.add(ambientLight);
// const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
// directionalLight.position.set(5, 10, 7.5);
// scene.add(directionalLight);`,
  },
  {
    title: "Exercise 11: Animate Horse Scale",
    code: `// Goal: Make the horse grow and shrink over time.
// Hint: Modify animatedModel.scale in the animation loop using Math.sin().
// This code needs to be integrated into the main animation loop to be continuous.
// Example (Paste this into the editor and click 'Execute Code'):

let scaleTime = 0; // Initialize a time variable

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
    animatedModel.scale.set(0.012, 0.012, 0.012); // Ensure consistent even smaller scale
    // Reset animations if a mixer exists
    if (mixer && loadedGltf) {
      mixer.stopAllAction();
      mixer = new THREE.AnimationMixer(animatedModel);
      loadedGltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
      });
    }
    // After loading, ensure the camera is positioned to view the model
    camera.position.set(3, 0.1, 0); // Adjust camera position to view from the side
    camera.lookAt(animatedModel.position);
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

// Chatbot functionality
const chatButton = document.getElementById("chatButton");
const chatWindow = document.getElementById("chatWindow");
const closeChat = document.getElementById("closeChat");
const chatMessages = document.getElementById("chatMessages");
const userInput = document.getElementById("userInput");
const sendMessage = document.getElementById("sendMessage");

chatButton.addEventListener("click", () => {
  chatWindow.style.display =
    chatWindow.style.display === "flex" ? "none" : "flex";
});

closeChat.addEventListener("click", () => {
  chatWindow.style.display = "none";
});

sendMessage.addEventListener("click", () => {
  const message = userInput.value.trim();
  if (message) {
    appendMessage(message, "user-message");
    userInput.value = "";
    // Placeholder for AI response
    sendToGeminiAPI(message);
  }
});

userInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendMessage.click();
  }
});

function appendMessage(message, type) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat-message", type);
  const p = document.createElement("p");
  p.textContent = message;
  messageElement.appendChild(p);
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to bottom
}

// Placeholder for Gemini API integration
async function sendToGeminiAPI(userMessage) {
  appendMessage("Typing...", "ai-message"); // Show typing indicator

  // !!! IMPORTANT: This is a placeholder. You need to implement the actual API call.
  // This would typically involve a server-side proxy to keep your API key secure.

  // Example of how you *might* call an API (DO NOT USE THIS DIRECTLY IN CLIENT-SIDE CODE WITH REAL API KEY)
  /*
  try {
    const response = await fetch('YOUR_BACKEND_ENDPOINT_FOR_GEMINI', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage }),
    });
    const data = await response.json();
    chatMessages.lastChild.remove(); // Remove typing indicator
    appendMessage(data.aiResponse, "ai-message");
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    chatMessages.lastChild.remove();
    appendMessage("AI: I'm sorry, I couldn't connect to the AI service.", "ai-message");
  }
  */

  // --- Mock AI Response for demonstration ---
  setTimeout(() => {
    chatMessages.lastChild.remove(); // Remove typing indicator
    const aiResponses = [
      "Hello! How can I help you with Three.js today?",
      "That's an interesting challenge! What Three.js concepts are you trying to use?",
      "I can help you with creating geometries, materials, lighting, and animations.",
      "What specific problem are you encountering?",
      "Remember to check the Three.js documentation for detailed API references.",
    ];
    const randomResponse =
      aiResponses[Math.floor(Math.random() * aiResponses.length)];
    appendMessage(`AI: ${randomResponse}`, "ai-message");
  }, 1000 + Math.random() * 1500); // Simulate network delay
}
