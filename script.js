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

// ==================================================
// VARIABLES
// ==================================================
let positions = ["pos1", "pos2", "pos3"]; 
let dragStartX = null;
let dragging = false;

// ==================================================
// LAUNCHER CLICK → TOGGLE BOXES
// ==================================================
launcher.addEventListener("click", () => {
  mainBox.classList.toggle("active"); 
});

// ==================================================
// ORIENTATION LOCK (best effort, mostly Android)
// ==================================================
function lockOrientationLandscape() {
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock("landscape").catch(() => {}); 
  }
}

// ==================================================
// ROTATE BOXES FUNCTION
// ==================================================
function rotateBoxes(direction) {
  if(direction === 'left') positions.push(positions.shift());
  if(direction === 'right') positions.unshift(positions.pop());
  boxes.forEach((b,i) => b.className = "box " + positions[i]);
}

// ==================================================
// DRAG / SWIPE HANDLER
// ==================================================
mainBox.addEventListener('mousedown', e => {
  dragStartX = e.clientX;
  dragging = true;
});
mainBox.addEventListener('touchstart', e => {
  dragStartX = e.touches[0].clientX;
  dragging = true;
});

mainBox.addEventListener('mousemove', e => {
  if (!dragging) return;
});
mainBox.addEventListener('touchmove', e => {
  if (!dragging) return;
});

mainBox.addEventListener('mouseup', e => {
  if(!dragging) return;
  let diff = e.clientX - dragStartX;
  if(diff > 30) rotateBoxes('left');
  else if(diff < -30) rotateBoxes('right');
  dragging = false;
});
mainBox.addEventListener('touchend', e => {
  if(!dragging) return;
  let diff = e.changedTouches[0].clientX - dragStartX;
  if(diff > 30) rotateBoxes('left');
  else if(diff < -30) rotateBoxes('right');
  dragging = false;
});

// ==================================================
// BOX CLICK → PLAY VIDEO (FIXED FOR iPHONE INLINE)
// ==================================================
boxes.forEach((box, index) => {
  box.addEventListener("click", () => {
    if (positions[index] === "pos2") {
      const videoId = box.dataset.video;

      // Hide & reset all videos
      videos.forEach(v => { 
        v.pause(); 
        v.currentTime = 0; 
        v.style.display = "none"; 
      });

      const video = document.getElementById(videoId);
      video.style.display = "block";
      videoPlayer.classList.add("active");
      videoPlayer.setAttribute("aria-hidden", "false");
      mainBox.classList.remove("active");

      // Play video
      video.play().then(() => {
        const isMobile = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        
        // ✅ On iPhone/iPad → stay inline (no forced fullscreen)
        if (!isMobile) {
          // On Android/desktop, try to lock orientation
          lockOrientationLandscape();
        }
      }).catch(err => console.log("Play error:", err));
    }
  });
});


// ==================================================
// CLOSE VIDEO BUTTON
// ==================================================
closeBtn.addEventListener("click", (e) => {
  e.stopPropagation();

  videos.forEach(v => { 
    v.pause(); 
    v.currentTime = 0; 
    v.style.display = "none"; 
  });

  videoPlayer.classList.remove("active");
  videoPlayer.setAttribute("aria-hidden", "true");

  if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
    closeFullscreen();
  }
});

// ==================================================
// FULLSCREEN HELPERS
// ==================================================
function openFullscreen(elem) {
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
// FULLSCREEN TOGGLE BUTTON
// ==================================================
fullscreenBtn.addEventListener("click", () => {
  const videoEl = videoPlayer.querySelector("video");
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    if (videoEl.webkitDisplayingFullscreen || document.fullscreenElement) {
      if (videoEl.webkitExitFullscreen) videoEl.webkitExitFullscreen();
      else closeFullscreen();
    } else {
      if (videoEl.webkitEnterFullscreen) videoEl.webkitEnterFullscreen();
      else if (videoEl.requestFullscreen) videoEl.requestFullscreen();
    }
  } else {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
      openFullscreen(videoEl);
    } else {
      closeFullscreen();
    }
  }
});

// ==================================================
// FULLSCREEN CHANGE LISTENER → HIDE/SHOW BUTTONS
// ==================================================
document.addEventListener("fullscreenchange", toggleButtons);
document.addEventListener("webkitfullscreenchange", toggleButtons); 
document.addEventListener("msfullscreenchange", toggleButtons);     

function toggleButtons() {
  if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
    launcher.style.display = "none";
    closeBtn.style.display = "none";
    fullscreenBtn.style.display = "none";
  } else {
    if (videoPlayer.classList.contains("active")) {
      closeBtn.style.display = "flex";
      fullscreenBtn.style.display = "flex";
    }
    launcher.style.display = "flex";
  }
}
