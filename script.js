// ==================================================
// ELEMENT SELECTION
// ==================================================
const launcher = document.getElementById("openLauncher");
const mainBox = document.getElementById("mainBox");
const boxes = document.querySelectorAll(".box");
const videos = document.querySelectorAll(".video-player video");
const videoPlayer = document.getElementById("videoPlayer");
const closeBtn = document.getElementById("closeBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");

// Front background videos
const frontVideoLandscape = document.getElementById("frontVideoLandscape");
const frontVideoPortrait = document.getElementById("frontVideoPortrait");

// ==================================================
// VARIABLES
// ==================================================
let positions = ["pos1", "pos2", "pos3"];
let dragStartX = null;
let dragging = false;
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// ==================================================
// ORIENTATION HANDLER FOR FRONT VIDEO
// ==================================================
function handleOrientation() {
  if (!frontVideoLandscape || !frontVideoPortrait) return;

  if (!isMobile) {
    // Desktop → always landscape
    frontVideoPortrait.pause();
    frontVideoPortrait.style.display = "none";

    frontVideoLandscape.style.display = "block";
    frontVideoLandscape.currentTime = 0; // restart
    frontVideoLandscape.play().catch(() => {});
    return;
  }

  // Mobile → switch by orientation
  if (window.matchMedia("(orientation: portrait)").matches) {
    // Portrait → restart portrait video
    frontVideoLandscape.pause();
    frontVideoLandscape.style.display = "none";

    frontVideoPortrait.style.display = "block";
    frontVideoPortrait.currentTime = 0; // restart
    frontVideoPortrait.play().catch(() => {});
  } else {
    // Landscape → restart landscape video
    frontVideoPortrait.pause();
    frontVideoPortrait.style.display = "none";

    frontVideoLandscape.style.display = "block";
    frontVideoLandscape.currentTime = 0; // restart
    frontVideoLandscape.play().catch(() => {});
  }
}

// Run on load + whenever orientation changes
window.addEventListener("load", handleOrientation);
window.addEventListener("resize", handleOrientation);
window.addEventListener("orientationchange", handleOrientation);

// ==================================================
// LAUNCHER CLICK → TOGGLE BOXES
// ==================================================
if (launcher && mainBox) {
  launcher.addEventListener("click", () => {
    mainBox.classList.toggle("active");
  });
}

// ==================================================
// ROTATE BOXES FUNCTION
// ==================================================
function rotateBoxes(direction) {
  if (direction === "left") positions.push(positions.shift());
  if (direction === "right") positions.unshift(positions.pop());
  boxes.forEach((b, i) => (b.className = "box " + positions[i]));
}

// ==================================================
// DRAG / SWIPE HANDLER
// ==================================================
if (mainBox) {
  mainBox.addEventListener("mousedown", e => {
    dragStartX = e.clientX;
    dragging = true;
  });
  mainBox.addEventListener("touchstart", e => {
    dragStartX = e.touches[0].clientX;
    dragging = true;
  });
  mainBox.addEventListener("mouseup", e => {
    if (!dragging) return;
    const diff = e.clientX - dragStartX;
    if (diff > 30) rotateBoxes("left");
    else if (diff < -30) rotateBoxes("right");
    dragging = false;
  });
  mainBox.addEventListener("touchend", e => {
    if (!dragging) return;
    const diff = e.changedTouches[0].clientX - dragStartX;
    if (diff > 30) rotateBoxes("left");
    else if (diff < -30) rotateBoxes("right");
    dragging = false;
  });
}

// ==================================================
// BOX CLICK → PLAY VIDEO
// ==================================================
boxes.forEach((box, index) => {
  box.addEventListener("click", () => {
    if (positions[index] !== "pos2") return;

    const videoId = box.dataset.video;
    const video = document.getElementById(videoId);
    if (!video) return;

    // Hide & reset all videos
    videos.forEach(v => {
      v.pause();
      v.currentTime = 0;
      v.style.display = "none";
      v.removeAttribute("controls");
    });

    // Show selected video
    video.style.display = "block";
    videoPlayer.classList.add("active");
    videoPlayer.setAttribute("aria-hidden", "false");
    mainBox.classList.remove("active");

    // Play video
    video.play().catch(err => console.log("Play error:", err));

    // Show fullscreen + close button when video active
    if (fullscreenBtn) fullscreenBtn.style.display = "flex";
    if (closeBtn) closeBtn.style.display = "flex";
  });
});

// ==================================================
// CLOSE VIDEO BUTTON
// ==================================================
if (closeBtn) {
  closeBtn.addEventListener("click", e => {
    e.stopPropagation();
    videos.forEach(v => {
      v.pause();
      v.currentTime = 0;
      v.style.display = "none";
      v.removeAttribute("controls"); // remove controls when closing
    });
    videoPlayer.classList.remove("active");
    videoPlayer.setAttribute("aria-hidden", "true");
    fullscreenBtn.style.display = "none";
    closeFullscreen();
  });
}

// ==================================================
// FULLSCREEN HELPERS
// ==================================================
function openFullscreen(elem) {
  if (!elem) return;
  if (elem.requestFullscreen) elem.requestFullscreen();
  else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
  else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
}

function closeFullscreen() {
  if (document.exitFullscreen) document.exitFullscreen();
  else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  else if (document.msExitFullscreen) document.msExitFullscreen();
}

// ==================================================
// FULLSCREEN BUTTON (Desktop + Mobile)
// ==================================================
if (fullscreenBtn) {
  fullscreenBtn.style.display = "none"; // hidden until video plays

  fullscreenBtn.addEventListener("click", () => {
    const activeVideo = [...videos].find(v => v.style.display === "block");
    if (!activeVideo) return;

    // Add controls so mobile native player works
    activeVideo.setAttribute("controls", "true");

    if (!document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        !document.msFullscreenElement) {
      // Request fullscreen on video element
      if (activeVideo.requestFullscreen) activeVideo.requestFullscreen();
      else if (activeVideo.webkitEnterFullscreen) activeVideo.webkitEnterFullscreen(); // iPhone Safari
      else if (activeVideo.webkitRequestFullscreen) activeVideo.webkitRequestFullscreen();
      else if (activeVideo.msRequestFullscreen) activeVideo.msRequestFullscreen();
    } else {
      closeFullscreen();
    }
  });
}

// ==================================================
// FULLSCREEN CHANGE LISTENER → HIDE/SHOW BUTTONS
// ==================================================
function toggleButtons() {
  const isFullscreen =
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement;

  if (isFullscreen) {
    if (launcher) launcher.style.display = "none";
    if (closeBtn) closeBtn.style.display = "none";
    if (fullscreenBtn) fullscreenBtn.style.display = "none";
  } else {
    if (videoPlayer.classList.contains("active")) {
      if (closeBtn) closeBtn.style.display = "flex";
      if (fullscreenBtn) fullscreenBtn.style.display = "flex";
    }
    if (launcher) launcher.style.display = "flex";
  }
}

document.addEventListener("fullscreenchange", toggleButtons);
document.addEventListener("webkitfullscreenchange", toggleButtons);
document.addEventListener("msfullscreenchange", toggleButtons);

// ==================================================
// AUTO CLOSE VIDEO AFTER EXITING FULLSCREEN (Desktop + Android)
// ==================================================
function handleFullscreenExit() {
  const isFullscreen =
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement;

  if (!isFullscreen) {
    // Fullscreen exited → stop & close video
    videos.forEach(v => {
      v.pause();
      v.currentTime = 0;
      v.style.display = "none";
      v.removeAttribute("controls");
    });
    videoPlayer.classList.remove("active");
    videoPlayer.setAttribute("aria-hidden", "true");

    if (fullscreenBtn) fullscreenBtn.style.display = "none";
    if (closeBtn) closeBtn.style.display = "none";
  }
}

document.addEventListener("fullscreenchange", handleFullscreenExit);
document.addEventListener("msfullscreenchange", handleFullscreenExit);

// ==================================================
// iOS SAFARI: exit native fullscreen → auto close video
// ==================================================
videos.forEach(v => {
  v.addEventListener("webkitendfullscreen", () => {
    v.pause();
    v.currentTime = 0;
    v.style.display = "none";
    v.removeAttribute("controls");

    videoPlayer.classList.remove("active");
    videoPlayer.setAttribute("aria-hidden", "true");

    if (fullscreenBtn) fullscreenBtn.style.display = "none";
    if (closeBtn) closeBtn.style.display = "none";
  });
});
