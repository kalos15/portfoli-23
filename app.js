// ---------------------------------------------------
// app.js — FAST, RANDOM, TIKTOK-STYLE VIDEO PLAYER (FINAL FIX)
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
let isFetching = false; 
const API_ENDPOINT = "videos-random.php"; // <--- Only reliance on the server file

const videoContainer = document.getElementById("videoContainer");
const overlay = document.getElementById("overlay");
const closeOverlay = document.getElementById("closeOverlay");

// --- CORE FUNCTION: Fetch one random link from the server ---
async function fetchRandomVideoLink() {
  if (isFetching) return; 
  isFetching = true;
  
  const currentVideo = videoContainer.querySelector("video");
  if (currentVideo) currentVideo.pause(); 

  try {
    // 💡 This now ALWAYS calls your server script, which reads videos.txt and returns one random line.
    const res = await fetch(API_ENDPOINT);
    
    if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}. Check if ${API_ENDPOINT} is accessible.`);
    }
    
    const url = (await res.text()).trim(); 

    if (url && url.length > 0) {
      loadVideo(url);
    } else {
      throw new Error("The server returned an empty or invalid video URL.");
    }

  } catch (e) {
    console.error("❌ Error fetching video link. Check PHP script and videos.txt:", e);
    // Show a user-friendly error screen instead of a broken video
    videoContainer.innerHTML = `
      <div class="ad-screen">
        <p class="mb-4">💔 Video Error 💔</p>
        <p class="mt-4 text-sm opacity-70">Cannot load videos. Please ensure your <strong>videos.txt</strong> file and <strong>videos-random.php</strong> script are uploaded and accessible.</p>
      </div>
    `;
  } finally {
    isFetching = false;
  }
}

// Play next video or ad
function playNext() {
  swipeCount++;

  // 💡 AD LOGIC: Show ad every 2 swipes
  if (swipeCount % 2 === 0) {
    showAdScreen();
  } else {
    fetchRandomVideoLink();
  }
}

// Load video takes a single URL (string)
function loadVideo(url) {
  // IMPORTANT: Added muted, playsinline, and loop for guaranteed mobile autoplay
  videoContainer.innerHTML = `
    <div class="video-slide">
      <video src="${url}" autoplay muted playsinline loop></video>
      
      <!-- The info container for the black bar effect -->
      <div class="info">
        <div class="info-content">
            <h2>@ARTISTIC_SHORTS_BOT</h2>
            <p>This beautiful short video was picked very randomly! #artistic #professional</p>
        </div>
      </div>

      <div class="actions">
        <button class="user-btn">🧑‍💻</button>
        <button class="like-btn">❤️</button>
        <button class="share-btn">🔗</button>
        <button class="noAds-btn" id="openAdsModal">💎</button>
      </div>
    </div>
  `;

  const video = videoContainer.querySelector("video");
  
  // Attempt to play and catch any Autoplay promise errors
  video.play().catch(error => {
    // This is expected if the browser blocks autoplay before user interaction
    console.log("Autoplay blocked, waiting for user interaction.", error);
  });
  
  video.addEventListener("ended", playNext);

  // Add event listeners for the new elements
  videoContainer.querySelector(".like-btn").addEventListener("click", function() {
    this.style.color = '#ec4899'; // pink-500
    alert("Liked! ❤️"); 
  });
  
  // Handler for the inline "Hide Ads" button
  document.getElementById("openAdsModal").onclick = () => {
    overlay.style.display = "flex";
  };
} 

// Ad Screen
function showAdScreen() {
  // IMPORTANT: Your ad platform integration (Adsterra, etc.) goes here
  videoContainer.innerHTML = `
    <div class="ad-screen">
      <p class="mb-4">Commercial Break! 🤩</p>
      <p class="mt-4 text-sm opacity-70">Your ad content goes here (e.g., from Adsterra)</p>
    </div>
  `;
  // After 3 seconds, fetch the next video (which is random)
  setTimeout(fetchRandomVideoLink, 3000); 
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

// --- START APP ---
// This is the core fix for the "black screen" issue: it starts the process immediately.
Telegram.WebApp.ready();
fetchRandomVideoLink();
