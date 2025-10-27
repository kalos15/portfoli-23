// ---------------------------------------------------
// app.js — FAST, RANDOM, TIKTOK-STYLE VIDEO PLAYER (FIXED)
// ---------------------------------------------------

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

let swipeCount = 0;
let startY = 0;
let isFetching = false; // Flag to prevent multiple fetches from fast swipes

const videoContainer = document.getElementById("videoContainer");
const overlay = document.getElementById("overlay");
const closeOverlay = document.getElementById("closeOverlay");
// const noAdsBtn = document.getElementById("noAdsBtn"); // Removed the constant for the floating button

// --- CORE FIX: Fetch one random link from the server ---
async function fetchRandomVideoLink() {
  if (isFetching) return; 
  isFetching = true;
  
  const currentVideo = videoContainer.querySelector("video");
  if (currentVideo) currentVideo.pause(); 

  try {
    // 💡 This calls your server script: videos-random.php
    const API_ENDPOINT = "videos-random.php"; 
    
    // --- Mock Fallback for local testing (remove after deploying PHP) ---
    const mockVideos = [
      "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    ];
    let url;
    
    if (typeof window !== 'undefined' && (window.location.protocol === 'file:' || window.location.hostname === '127.0.0.1')) {
       url = mockVideos[Math.floor(Math.random() * mockVideos.length)];
    } else {
       const res = await fetch(API_ENDPOINT);
       if (!res.ok) {
           throw new Error(`Server responded with status: ${res.status}`);
       }
       url = (await res.text()).trim(); 
    }
    // --- End Mock Fallback ---

    if (url && url.length > 0) {
      loadVideo(url);
    } else {
      console.error("❌ The server returned an empty or invalid video URL.");
      loadVideo(mockVideos[0]); 
    }

  } catch (e) {
    console.error("❌ Error fetching random video link:", e);
    videoContainer.innerHTML = '<div class="ad-screen"><p>Connection error. Please try again. 🌐</p></div>';
  } finally {
    isFetching = false;
  }
}

// Play next video or ad
function playNext() {
  swipeCount++;

  // 💡 NEW AD LOGIC: Show ad every 2 swipes
  if (swipeCount % 2 === 0) {
    showAdScreen();
  } else {
    fetchRandomVideoLink();
  }
}

// Load video takes a single URL (string)
function loadVideo(url) {
  // *** INJECTING NEW ACTIONS COLUMN ***
  videoContainer.innerHTML = `
    <div class="video-slide">
      <video src="${url}" autoplay muted playsinline loop></video>
      
      <div class="info">
        <h2>@ARTISTIC_SHORTS_BOT</h2>
        <p>This beautiful short video was picked very randomly! #artistic #professional</p>
      </div>

      <div class="actions">
        <button class="user-btn">🧑‍💻</button>
        <button class="like-btn">❤️</button>
        <button class="share-btn">🔗</button>
        <button class="noAds-btn" id="openAdsModal">💎</button> </div>
    </div>
  `;

  const video = videoContainer.querySelector("video");
  video.play().catch(err => console.log("Autoplay error:", err));
  video.addEventListener("ended", playNext);

  // Add event listeners
  videoContainer.querySelector(".like-btn").addEventListener("click", function() {
    this.style.color = 'pink'; 
    // You can send a request to your bot here to record the like.
    alert("Liked! ❤️"); 
  });
  
  // 💡 NEW: Handler for the inline "Hide Ads" button
  document.getElementById("openAdsModal").onclick = () => {
    overlay.style.display = "flex";
  };
} 

// Ad Screen
function showAdScreen() {
  videoContainer.innerHTML = `
    <div class="ad-screen">
      <p class="mb-4">Commercial Break! 🤩</p>
      <p class="mt-4 text-sm opacity-70">Resuming in 3 seconds... (Ad content goes here)</p>
    </div>
  `;
  setTimeout(fetchRandomVideoLink, 3000); // resume after ad by fetching a new random link
}


// Swipe detection
document.addEventListener("touchstart", e => { startY = e.touches[0].clientY; });
document.addEventListener("touchend", e => {
  const endY = e.changedTouches[0].clientY;
  if (startY - endY > 50) playNext(); // swipe up
});
document.addEventListener("wheel", e => { if (e.deltaY > 0) playNext(); });

// Overlay / Close Modal
closeOverlay.onclick = () => overlay.style.display = "none";

// Start app (Fixes the black screen issue)
Telegram.WebApp.ready();
fetchRandomVideoLink();
