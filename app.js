// ---------------------------------------------------
// app.js — FAST, RANDOM, TIKTOK-STYLE VIDEO PLAYER (UPDATED)
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

// ❌ Removed: let videos = [];
// ❌ Removed: let currentIndex = 0;
let swipeCount = 0;
let startY = 0;
let isFetching = false; // Flag to prevent multiple fetches from fast swipes

const videoContainer = document.getElementById("videoContainer");
const overlay = document.getElementById("overlay");
const closeOverlay = document.getElementById("closeOverlay");
const noAdsBtn = document.getElementById("noAdsBtn");

// --- CORE CHANGE: Fetch one random link from the server ---
async function fetchRandomVideoLink() {
  if (isFetching) return; // Ignore if a fetch is already in progress
  isFetching = true;
  
  // Stop the currently playing video before fetching the next one
  const currentVideo = videoContainer.querySelector("video");
  if (currentVideo) currentVideo.pause(); 

  try {
    // 💡 This is the URL to your server script (e.g., PHP, Python, etc.)
    // which MUST read videos.txt and return ONE random URL as plain text.
    const API_ENDPOINT = "videos-random.php"; 
    
    // --- Mock Fallback for local testing without a server ---
    const mockVideos = [
      "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    ];
    let url;
    
    if (typeof window !== 'undefined' && (window.location.protocol === 'file:' || window.location.hostname === '127.0.0.1')) {
       // If running locally, use a mock random video
       url = mockVideos[Math.floor(Math.random() * mockVideos.length)];
       console.log("Using Mock Video (Local/No Server):", url);
    } else {
       // Real fetch request to your server endpoint
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
      // Load a placeholder on error
      loadVideo(mockVideos[0]); 
    }

  } catch (e) {
    console.error("❌ Error fetching random video link:", e);
    videoContainer.innerHTML = '<div class="ad-screen"><p>Connection error. Please try again. 🌐</p></div>';
  } finally {
    isFetching = false;
  }
}

// ❌ Removed: async function loadVideos() {}

// Play next video or ad
function playNext() {
  // 💡 Now, playNext triggers a new fetch/ad logic, NOT an index increment
  swipeCount++;

  // Show ad every 4 swipes
  if (swipeCount % 4 === 0) {
    showAdScreen();
  } else {
    // Request a new, random video link on every successful swipe
    fetchRandomVideoLink();
  }
}

// Load video takes a single URL (string), not an index (number)
function loadVideo(url) {
  // *** UPDATED: New artistic TikTok/Shorts design structure ***
  videoContainer.innerHTML = `
    <div class="video-slide">
      <video src="${url}" autoplay muted playsinline loop></video>
      
      <div class="info">
        <h2>@ARTISTIC_SHORTS_BOT</h2>
        <p>This beautiful short video was picked randomly from 90,000+ videos! #artistic #random</p>
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
  });
} // ⚠️ Fixed missing closing parenthesis here: }); was missing

// Ad Screen
function showAdScreen() {
  videoContainer.innerHTML = `
    <div class="ad-screen">
      <p class="mb-4">Commercial Break! 🤩</p>
      <p class="mt-4 text-sm opacity-70">Resuming in 3 seconds...</p>
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

// ❌ Removed: function shuffleArray(arr) {} (No array to shuffle anymore)


// Overlay / No Ads
noAdsBtn.onclick = () => overlay.style.display = "flex"; // Changed classList to style.display for simplicity
closeOverlay.onclick = () => overlay.style.display = "none"; // Changed classList to style.display for simplicity

// Start app
// ❌ Removed: loadVideos();
// 💡 Correct way to start: Fetch the first random link
fetchRandomVideoLink(); 

// Telegram WebApp ready
window.Telegram.WebApp.ready();
