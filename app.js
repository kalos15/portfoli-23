// -------------------------------
// app.js — TikTok-style Video Player
// -------------------------------

// Telegram WebApp integration (mock for browser)
if (!window.Telegram) {
  window.Telegram = {
    WebApp: {
      initData: "mock",
      initDataUnsafe: {},
      ready: () => console.log("Telegram WebApp ready (mock)"),
      openLink: (url) => console.log("Open link:", url),
      close: () => console.log("WebApp close called"),
      MainButton: {
        show: () => console.log("MainButton show"),
        hide: () => console.log("MainButton hide"),
        text: "",
        onClick: (fn) => console.log("MainButton click (mock)")
      }
    }
  };
}

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
  
  // *** UPDATED: New artistic TikTok/Shorts design structure ***
  videoContainer.innerHTML = `
    <div class="video-slide">
      <video src="${url}" autoplay muted playsinline loop></video>
      
      <div class="info">
        <h2>@ARTISTIC_SHORTS_BOT</h2>
        <p>This is a description of the beautiful short video! It's an aesthetic template for a Telegram Mini App. #artistic #shorts #design</p>
      </div>

      <div class="actions">
        <button class="user-btn">🧑‍💻</button>
        <button class="like-btn">❤️</button>
        <button class="share-btn">🔗</button>
      </div>
    </div>
  `;

  const video = videoContainer.querySelector("video");
  video.play().catch(err => console.log("Autoplay error:", err));
  video.addEventListener("ended", playNext);

  // Add event listener to the new like button
  videoContainer.querySelector(".like-btn").addEventListener("click", function() {
    this.style.color = 'pink'; // Turn the heart pink when liked
    alert("Liked! ❤️"); 
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

// Telegram WebApp ready
window.Telegram.WebApp.ready();
