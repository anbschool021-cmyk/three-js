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

// Get references to DOM elements
const editorElement = document.getElementById("editor");
const executeButton = document.getElementById("executeButton");
const actionButtonsContainer = document.getElementById("action-buttons-container"); // New reference
const exerciseButtonsContainer = document.getElementById("exerciseButtons");
const chatToggle = document.getElementById("chatToggle");
const chatWindow = document.getElementById("chatWindow");
const chatButton = document.getElementById("chatButton");
const closeChat = document.getElementById("closeChat");
const chatMessages = document.getElementById("chatMessages");
const userInput = document.getElementById("userInput");
const sendMessage = document.getElementById("sendMessage");

// Ace Editor setup
const editor = ace.edit(editorElement);
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");
editor.setValue(
  "// Your Three.js code here\n// Example: animatedModel.position.y = 1;",
  -1
);

let selectedExerciseIndex = 0; // Initialize selectedExerciseIndex

// Helper function to clear objects from the scene (if necessary for exercises)
function clearSceneObjects() {
  scene.children.forEach((object) => {
    if (object !== animatedModel && object !== camera && object !== directionalLight && object !== ambientLight) {
      scene.remove(object);
    }
  });
}

const exercises = [
  {
    title: "Exercise 1: Make Horse Run",
    code: `// Goal: Make the horse perform a running animation.\n// Hint: Use mixer.stopAllAction() and then play the 'run' animation clip.\n// Example:\nif (mixer && loadedGltf) {\n    mixer.stopAllAction();\n    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'run');\n    if (clip) {\n        mixer.clipAction(clip).play();\n    } else {\n        console.warn("'run' animation clip not found for horse.");\n    }\n}`,
    solution: `// Solution for Exercise 1: Make Horse Run\nif (mixer && loadedGltf) {\n    mixer.stopAllAction();\n    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'run');\n    if (clip) {\n        mixer.clipAction(clip).play();\n    } else {\n        console.warn("'run' animation clip not found for horse. Please check animation names.");\n    }\n}`
  },
  {
    title: "Exercise 2: Make Horse Jump",
    code: `// Goal: Make the horse perform a jumping animation and then return to a default pose.\n// Hint: Look for a 'jump' animation clip. You might need to listen for the 'finished' event to transition back.\n// Example:\nif (mixer && loadedGltf) {\n    mixer.stopAllAction();\n    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'jump');\n    if (clip) {\n        const action = mixer.clipAction(clip);\n        action.setLoop(THREE.LoopOnce); // Play once\n        action.reset(); // Ensure it starts from the beginning\n        action.play();\n        mixer.addEventListener('finished', function onFinished() {\n            mixer.removeEventListener('finished', onFinished);\n            // Revert to a default animation (e.g., 'idle' or 'walk') after jumping\n            mixer.stopAllAction();\n            const defaultClip = THREE.AnimationClip.findByName(loadedGltf.animations, 'idle');\n            if (defaultClip) mixer.clipAction(defaultClip).play();\n            else console.warn("'idle' animation clip not found for horse after jump.");\n        });\n    } else {\n        console.warn("'jump' animation clip not found for horse.");\n    }\n}`,
    solution: `// Solution for Exercise 2: Make Horse Jump\nif (mixer && loadedGltf) {\n    mixer.stopAllAction();\n    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'jump');\n    if (clip) {\n        const action = mixer.clipAction(clip);\n        action.setLoop(THREE.LoopOnce);
        action.reset();
        action.play();
        mixer.addEventListener('finished', function onFinished() {
            mixer.removeEventListener('finished', onFinished);
            mixer.stopAllAction();
            const defaultClip = THREE.AnimationClip.findByName(loadedGltf.animations, 'idle');
            if (defaultClip) mixer.clipAction(defaultClip).play();
        });
    } else {
        console.warn("'jump' animation clip not found for horse. Please check animation names.");\n    }\n}`
  },
  {
    title: "Exercise 3: Make Horse Fall",
    code: `// Goal: Make the horse perform a falling/fail animation or pose.\n// Hint: Look for a 'fall' or 'death' animation, or manually set the horse's rotation/position.\n// Example:\nif (mixer && loadedGltf) {\n    mixer.stopAllAction();\n    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'fall'); // Or 'death', 'fail'\n    if (clip) {\n        const action = mixer.clipAction(clip);\n        action.setLoop(THREE.LoopOnce); // Play once\n        action.reset();\n        action.play();\n    } else {\n        console.warn("'fall' animation clip not found for horse. Applying a generic prone pose.");\n        animatedModel.rotation.x = Math.PI / 2; // Lie face down\n        animatedModel.position.y = -0.5; // Adjust position to be on the ground\n        animatedModel.position.z = 0; // Ensure it's still centered in Z\n    }\n}`,
    solution: `// Solution for Exercise 3: Make Horse Fall\nif (mixer && loadedGltf) {\n    mixer.stopAllAction();\n    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'fall');\n    if (clip) {\n        const action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopOnce);
        action.reset();
        action.play();
    } else {
        animatedModel.rotation.x = Math.PI / 2; \n        animatedModel.position.y = -0.5; \n        animatedModel.position.z = 0; \n    }\n}`
  },
  {
    title: "Exercise 4: Make Horse Run Faster",
    code: `// Goal: Make the horse's 'run' animation play at a faster speed.\n// Hint: Get the 'run' animation action and use setEffectiveTimeScale().\n// Example:\nif (mixer && loadedGltf) {\n    mixer.stopAllAction();\n    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'run');\n    if (clip) {\n        const action = mixer.clipAction(clip);\n        action.setEffectiveTimeScale(2.5); // Play animation 2.5 times faster\n        action.play();\n    } else {\n        console.warn("'run' animation clip not found for horse.");\n    }\n}`,
    solution: `// Solution for Exercise 4: Make Horse Run Faster\nif (mixer && loadedGltf) {\n    mixer.stopAllAction();\n    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'run');\n    if (clip) {\n        const action = mixer.clipAction(clip);
        action.setEffectiveTimeScale(2.5); \n        action.play();\n    } else {
        console.warn("'run' animation clip not found for horse. Please check animation names.");\n    }\n}`
  },
  {
    title: "Exercise 5: Make Horse Walk Back",
    code: `// Goal: Make the horse perform a 'walk' animation and move backward in the scene.\n// Hint: Play the 'walk' animation. In the animate loop, decrease the horse's Z-position.\n// Example:\nif (mixer && loadedGltf) {\n    mixer.stopAllAction();\n    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'walk');\n    if (clip) {\n        const action = mixer.clipAction(clip);\n        action.setEffectiveTimeScale(1);\n        action.play();\n        \n        // Animate movement backward\n        let walkBackDistance = 0;\n        const maxWalkBackDistance = 3; // units\n        const walkSpeed = 0.02; // units per frame\n\n        const moveBackwardInterval = setInterval(() => {\n            if (walkBackDistance < maxWalkBackDistance) {\n                animatedModel.position.z += walkSpeed;\n                walkBackDistance += walkSpeed;\n            } else {\n                clearInterval(moveBackwardInterval);\n            }\n        }, 1000 / 60); // Roughly 60 frames per second\n\n    } else {\n        console.warn("'walk' animation clip not found for horse.");\n    }\n}`,
    solution: `// Solution for Exercise 5: Make Horse Walk Back\nif (mixer && loadedGltf) {\n    mixer.stopAllAction();\n    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'walk');\n    if (clip) {\n        const action = mixer.clipAction(clip);
        action.setEffectiveTimeScale(1);
        action.play();\n        \n        let walkBackDistance = 0;\n        const maxWalkBackDistance = 3;\n        const walkSpeed = 0.02;\n\n        const moveBackwardInterval = setInterval(() => {\n            if (walkBackDistance < maxWalkBackDistance) {\n                animatedModel.position.z += walkSpeed;\n                walkBackDistance += walkSpeed;\n            } else {\n                clearInterval(moveBackwardInterval);\n            }\n        }, 1000 / 60);\n\n    } else {\n        console.warn("'walk' animation clip not found for horse. Please check animation names.");\n    }\n}`
  },
  {
    title: "Exercise 6: Make Horse Walk Ahead",
    code: `// Goal: Make the horse perform a 'walk' animation and move forward in the scene.\n// Hint: Play the 'walk' animation. In the animate loop, increase the horse's Z-position (or decrease if camera is behind).\n// Example:\nif (mixer && loadedGltf) {\n    mixer.stopAllAction();\n    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'walk');\n    if (clip) {\n        const action = mixer.clipAction(clip);\n        action.setEffectiveTimeScale(1);\n        action.play();\n        \n        // Animate movement forward\n        let walkAheadDistance = 0;\n        const maxWalkAheadDistance = 3; // units\n        const walkSpeed = 0.02; // units per frame\n\n        const moveForwardInterval = setInterval(() => {\n            if (walkAheadDistance < maxWalkAheadDistance) {\n                animatedModel.position.z -= walkSpeed; // Move forward\n                walkAheadDistance += walkSpeed;\n            } else {\n                clearInterval(moveForwardInterval);\n            }\n        }, 1000 / 60); // Roughly 60 frames per second\n\n    } else {\n        console.warn("'walk' animation clip not found for horse.");\n    }\n}`,
    solution: `// Solution for Exercise 6: Make Horse Walk Ahead\nif (mixer && loadedGltf) {\n    mixer.stopAllAction();\n    const clip = THREE.AnimationClip.findByName(loadedGltf.animations, 'walk');\n    if (clip) {\n        const action = mixer.clipAction(clip);
        action.setEffectiveTimeScale(1);
        action.play();\n        \n        let walkAheadDistance = 0;\n        const maxWalkAheadDistance = 3; \n        const walkSpeed = 0.02; \n\n        const moveForwardInterval = setInterval(() => {\n            if (walkAheadDistance < maxWalkAheadDistance) {\n                animatedModel.position.z -= walkSpeed; \n                walkAheadDistance += walkSpeed;\n            } else {\n                clearInterval(moveForwardInterval);\n            }\n        }, 1000 / 60); \n\n    } else {\n        console.warn("'walk' animation clip not found for horse. Please check animation names.");\n    }\n}`
  },
  {
    title: "Exercise 9: Move Camera Around Horse",
    code: `// Goal: Animate the camera to orbit around the horse.\n// Hint: Modify camera.position.x and camera.position.z using Math.sin/cos and then camera.lookAt().\n// This code needs to be integrated into the main animation loop to be continuous.\n// Example (Paste this into the editor and click 'Execute Code'):\n\nlet cameraOrbitTime = 0; // Initialize a time variable\n\nconst orbitDuration = 2000; // milliseconds\nconst startPosition = camera.position.clone();\nconst target = animatedModel.position;\n\nnew TWEEN.Tween({ t: 0 })\n    .to({ t: 1 }, orbitDuration)\n    .easing(TWEEN.Easing.Sinusoidal.InOut)\n    .onUpdate(function({ t }) {\n        const angle = t * Math.PI * 2; // Full circle\n        const radius = startPosition.distanceTo(target);\n\n        camera.position.x = target.x + Math.sin(angle) * radius;\n        camera.position.z = target.z + Math.cos(angle) * radius;\n        camera.lookAt(target);\n        if (controls) controls.update();\n    })\n    .start();\n\n// Note: TWEEN.js is not imported by default. This example assumes it's available or imported separately.\n// For this exercise, we will just set the camera to a new position:\ncamera.position.set(5, 5, 5); // New camera position\ncamera.lookAt(animatedModel.position); // Look at the horse\nif (controls) controls.update();`,
    solution: `// Solution for Exercise 9: Move Camera Around Horse\n// To make this exercise a continuous animation, you would typically integrate it into the main animate function.\n// For a one-shot demonstration:\nconst orbitDuration = 2000; \nconst startPosition = camera.position.clone();\nconst target = animatedModel.position;\n\nnew TWEEN.Tween({ t: 0 })\n    .to({ t: 1 }, orbitDuration)\n    .easing(TWEEN.Easing.Sinusoidal.InOut)\n    .onUpdate(function({ t }) {\n        const angle = t * Math.PI * 2; \n        const radius = startPosition.distanceTo(target);\n\n        camera.position.x = target.x + Math.sin(angle) * radius;\n        camera.position.z = target.z + Math.cos(angle) * radius;\n        camera.lookAt(target);\n        if (controls) controls.update();\n    })\n    .start();\n\n// If TWEEN.js is not imported, a simpler approach is to directly set camera position for a fixed view:\ncamera.position.set(5, 5, 5); // Example new camera position\ncamera.lookAt(animatedModel.position);`
  },
  {
    title: "Exercise 10: Add a Simple Ground Plane for Horse",
    code: `// Goal: Add a flat ground plane to the scene below the horse.\n// Hint: Use PlaneGeometry and MeshStandardMaterial. Remember to rotate it flat and position it correctly.\n// Example:\nconst groundGeometry = new THREE.PlaneGeometry(20, 20);\nconst groundMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });\nconst ground = new THREE.Mesh(groundGeometry, groundMaterial);\nground.rotation.x = -Math.PI / 2; // Rotate to be horizontal\nground.position.y = -0.5; // Position below horse\nscene.add(ground);\n\n// Add lights if not already present (main scene already has them)\n// const ambientLight = new THREE.AmbientLight(0x404040, 2);\n// scene.add(ambientLight);\n// const directionalLight = new THREE.DirectionalLight(0xffffff, 2);\n// directionalLight.position.set(5, 10, 7.5);\n// scene.add(directionalLight);`,
    solution: `// Solution for Exercise 10: Add a Simple Ground Plane for Horse\nconst groundGeometry = new THREE.PlaneGeometry(20, 20);\nconst groundMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });\nconst ground = new THREE.Mesh(groundGeometry, groundMaterial);\nground.rotation.x = -Math.PI / 2; \nground.position.y = -0.5; \nscene.add(ground);`
  },
  {
    title: "Exercise 11: Animate Horse Scale",
    code: `// Goal: Make the horse grow and shrink over time.\n// Hint: Modify animatedModel.scale in the animation loop using Math.sin().\n// This code needs to be integrated into the main animation loop to be continuous.\n// Example (Paste this into the editor and click 'Execute Code'):\n\nlet scaleTime = 0; // Initialize a time variable\n\nconst initialScale = animatedModel.scale.x;\nconst scaleDuration = 1500; // milliseconds\n\nnew TWEEN.Tween({ t: 0 })\n    .to({ t: 1 }, scaleDuration)\n    .easing(TWEEN.Easing.Sinusoidal.InOut)\n    .onUpdate(function({ t }) {\n        const scaleFactor = initialScale * (1 + Math.sin(t * Math.PI * 2) * 0.5); // Pulse effect\n        animatedModel.scale.set(scaleFactor, scaleFactor, scaleFactor);\n        if (controls) controls.update();\n    })\n    .start();\n\n// Note: TWEEN.js is not imported by default. This example assumes it's available or imported separately.\n// For this exercise, we will just set the character to a new scale:\nanimatedModel.scale.set(1, 1, 1); // Make it temporarily much larger\nif (controls) controls.update();`,
    solution: `// Solution for Exercise 11: Animate Horse Scale\n// For a one-shot demonstration of scaling:\nconst initialScale = animatedModel.scale.x;\nconst targetScale = initialScale * 1.5; // Example: 50% larger\nconst scaleDuration = 1000; // 1 second\n\nnew TWEEN.Tween({ scale: initialScale })\n    .to({ scale: targetScale }, scaleDuration)\n    .easing(TWEEN.Easing.Quadratic.Out)\n    .onUpdate(function({ scale }) {\n        animatedModel.scale.set(scale, scale, scale);
        if (controls) controls.update();
    })
    .start();\n\n// Note: TWEEN.js is not imported by default. This example assumes it's available.\n// If TWEEN.js is not available, you would manually animate this over time or simply set a new scale directly:\n// animatedModel.scale.set(0.2, 0.2, 0.2); // Example: setting a fixed larger scale`
  },
];

// Function to load an exercise
function loadExercise(exerciseIndex) {
  const exercise = exercises[exerciseIndex];
  editor.setValue(exercise.code, -1); // -1 moves cursor to the start
  selectedExerciseIndex = exerciseIndex; // Update the selected exercise index

  // Clear previous answer button if it exists
  const oldSolutionButton = actionButtonsContainer.querySelector('.solution-button');
  if (oldSolutionButton) {
      actionButtonsContainer.removeChild(oldSolutionButton);
  }

  // Remove all objects added by previous exercises, except the animated model, camera, and lights
  scene.children = scene.children.filter(
    (obj) => obj === animatedModel || obj === camera || obj === ambientLight || obj === directionalLight
  );

  // Reset model position, rotation, and scale for new exercise
  animatedModel.position.set(0, 0, 0);
  animatedModel.rotation.set(0, 0, 0);
  animatedModel.scale.set(0.012, 0.012, 0.012); // Ensure consistent scale

  // Reset camera position to side view after loading a new exercise
  camera.position.set(3, 0.1, 0); 
  camera.lookAt(animatedModel.position);
  if (controls) {
      controls.target.copy(animatedModel.position);
      controls.update();
  }

  // Show the controls panel (editor, execute button, and solution button)
  document.getElementById("controlsPanel").style.display = "flex";

  // Create and append the new "Show Answer" button
  const newSolutionButton = document.createElement("button");
  newSolutionButton.classList.add("solution-button");
  newSolutionButton.textContent = "Show Answer";
  newSolutionButton.addEventListener("click", () => {
      editor.setValue(exercise.solution, -1); // Load solution into editor
      newSolutionButton.style.display = "none"; // Hide solution button after showing
  });
  actionButtonsContainer.appendChild(newSolutionButton);

  // Update active button styling
  document.querySelectorAll('.exercise-button').forEach(button => {
    button.classList.remove("active-exercise-button");
  });
  const newActiveButton = document.querySelector(
    `.exercise-button:nth-child(${exerciseIndex + 1})`
  );
  if (newActiveButton) {
    newActiveButton.classList.add("active-exercise-button");
  }
}

// Populate the exercise buttons
exercises.forEach((exercise, index) => {
  const button = document.createElement("button");
  button.classList.add("exercise-button");
  button.textContent = exercise.title;
  button.addEventListener("click", () => loadExercise(index));
  exerciseButtonsContainer.appendChild(button);
});

// Load the first exercise by default
loadExercise(0);

// Initially hide the controls panel
document.getElementById("controlsPanel").style.display = "none";

// Event listener for the Execute Code button
executeButton.addEventListener("click", () => {
  const userCode = editor.getValue();
  clearSceneObjects(); // Clear any objects added by previous executions

  try {
    // Execute user's code. Pass 'scene', 'THREE', 'animatedModel', 'mixer', 'loadedGltf' as context.
    new Function("scene", "THREE", "animatedModel", "mixer", "loadedGltf", userCode)(
      scene,
      THREE,
      animatedModel,
      mixer,
      loadedGltf
    );
  } catch (error) {
    console.error("Error executing user code:", error);
    appendMessage("AI", `Error: ${error.message}. Please check your code.`);
  }
});

// Chatbot functionality
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
