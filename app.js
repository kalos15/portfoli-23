// -------------------------------
// app.js — TikTok-style Video Player
// -------------------------------

let videos = [];
let currentIndex = 0;
let swipeCount = 0;
let startY = 0;

const videoContainer = document.getElementById("videoContainer");
const overlay = document.getElementById("overlay");
const closeOverlay = document.getElementById("closeOverlay");
const noAdsBtn = document.getElementById("noAdsBtn");

// Load video URLs from videos.txt
async function loadVideos() {
  try {
    const res = await fetch("videos.txt");
    const text = await res.text();
    videos = text.split("\n")
      .map(v => v.trim())
      .filter(v => v.length > 0 && v.startsWith("http"));

    shuffleArray(videos);
    playNext();
  } catch (e) {
    console.error("❌ Error loading videos:", e);
  }
}

// Play next video or ad
function playNext() {
  if (!videos.length) return;
  swipeCount++;

  // Show ad every 4 swipes
  if (swipeCount % 4 === 0) {
    videoContainer.innerHTML = `
      <div class="ad-screen">
        <h2>Ad Coming Soon 🎬</h2>
        <p>Your video will resume shortly...</p>
      </div>
    `;
    setTimeout(() => loadVideo(currentIndex), 3000); // resume after ad
  } else {
    loadVideo(currentIndex);
    currentIndex = (currentIndex + 1) % videos.length;
  }
}

// Load video at index
function loadVideo(index) {
  const url = videos[index];
  videoContainer.innerHTML = `
    <div class="video-slide">
      <video src="${url}" autoplay muted playsinline></video>
      <div class="info">
        <h2>2 VIDEOS SHORTS</h2>
        <p>xxx</p>
      </div>
      <div class="actions">
        <button class="like-btn">❤️</button>
      </div>
    </div>
  `;

  const video = videoContainer.querySelector("video");
  video.play().catch(err => console.log("Autoplay error:", err));
  video.addEventListener("ended", playNext);
}

// Swipe detection
document.addEventListener("touchstart", e => { startY = e.touches[0].clientY; });
document.addEventListener("touchend", e => {
  const endY = e.changedTouches[0].clientY;
  if (startY - endY > 50) playNext(); // swipe up
});
document.addEventListener("wheel", e => { if (e.deltaY > 0) playNext(); });

// Shuffle videos
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Overlay / No Ads
noAdsBtn.onclick = () => overlay.classList.remove("hidden");
closeOverlay.onclick = () => overlay.classList.add("hidden");

// Start app
loadVideos();
