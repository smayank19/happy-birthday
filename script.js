// ==================================================
// ELEMENT SELECTION
// ==================================================
const launcher = document.getElementById("openLauncher");      // Launcher button to open boxes
const mainBox = document.getElementById("mainBox");           // Container for rotating boxes
const boxes = document.querySelectorAll(".box");              // All individual boxes
const videos = document.querySelectorAll(".video-player video"); // All video elements
const videoPlayer = document.getElementById("videoPlayer");   // Fullscreen video container
const closeBtn = document.getElementById("closeBtn");         // Close video button
const fullscreenBtn = document.getElementById("fullscreenBtn"); // Fullscreen toggle button

// ==================================================
// VARIABLES
// ==================================================
let positions = ["pos1", "pos2", "pos3"]; // Track current box positions for rotation

// ==================================================
// LAUNCHER CLICK → TOGGLE BOXES
// ==================================================
launcher.addEventListener("click", () => {
  mainBox.classList.toggle("active"); // Show/hide rotating boxes
});

// ==================================================
// ORIENTATION LOCK (best effort, mostly Android)
// ==================================================
function lockOrientationLandscape() {
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock("landscape").catch(() => { /* ignore if fails */ });
  }
}

// ==================================================
// BOX CLICK → ROTATE OR PLAY VIDEO
// ==================================================
boxes.forEach((box, index) => {
  box.addEventListener("click", () => {
    if (positions[index] === "pos2") {
      // 🎥 Center box clicked → play linked video
      const videoId = box.dataset.video;

      // Hide & reset all videos
      videos.forEach(v => { 
        v.pause(); 
        v.currentTime = 0; 
        v.style.display = "none"; 
      });

      // Show selected video
      const video = document.getElementById(videoId);
      video.style.display = "block";
      videoPlayer.classList.add("active");
      video.play().then(lockOrientationLandscape).catch(err => console.log("Play error:", err));

      // Hide boxes while video plays
      mainBox.classList.remove("active");
      videoPlayer.setAttribute("aria-hidden", "false");
    } else {
      // 🔄 Rotate boxes left/right
      if (positions[index] === "pos1") positions.push(positions.shift());
      else if (positions[index] === "pos3") positions.unshift(positions.pop());

      boxes.forEach((b,i) => b.className = "box " + positions[i]);
    }
  });
});

// ==================================================
// CLOSE VIDEO BUTTON
// ==================================================
closeBtn.addEventListener("click", (e) => {
  e.stopPropagation();

  // Stop & hide all videos
  videos.forEach(v => { 
    v.pause(); 
    v.currentTime = 0; 
    v.style.display = "none"; 
  });

  // Hide video player
  videoPlayer.classList.remove("active");
  videoPlayer.setAttribute("aria-hidden", "true");

  // Exit fullscreen if active
  if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
    closeFullscreen();
  }
});

// ==================================================
// FULLSCREEN HELPERS
// ==================================================
function openFullscreen(elem) {
  if (elem.requestFullscreen) elem.requestFullscreen();
  else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen(); // Safari/iOS
  else if (elem.msRequestFullscreen) elem.msRequestFullscreen();         // IE11
}

function closeFullscreen() {
  if (document.exitFullscreen) document.exitFullscreen();
  else if (document.webkitExitFullscreen) document.webkitExitFullscreen(); // Safari/iOS
  else if (document.msExitFullscreen) document.msExitFullscreen();         // IE11
}

// ==================================================
// FULLSCREEN TOGGLE BUTTON
// ==================================================
fullscreenBtn.addEventListener("click", () => {
  const videoEl = videoPlayer.querySelector("video");

  if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
    openFullscreen(videoEl); // Enter fullscreen
  } else {
    closeFullscreen();       // Exit fullscreen
  }
});

// ==================================================
// FULLSCREEN CHANGE LISTENER → HIDE/SHOW BUTTONS
// ==================================================
document.addEventListener("fullscreenchange", toggleButtons);
document.addEventListener("webkitfullscreenchange", toggleButtons); // Safari/iOS
document.addEventListener("msfullscreenchange", toggleButtons);     // IE11

function toggleButtons() {
  if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
    // 🔒 Fullscreen active → hide all buttons
    launcher.style.display = "none";
    closeBtn.style.display = "none";
    fullscreenBtn.style.display = "none";
  } else {
    // ⬅ Exit fullscreen → show buttons only if video player is active
    if (videoPlayer.classList.contains("active")) {
      closeBtn.style.display = "flex";
      fullscreenBtn.style.display = "flex";
    }
    launcher.style.display = "flex";
  }
}
