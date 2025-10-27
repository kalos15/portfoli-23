
// ---------------------------------------------------
// app.js — FAST, RANDOM, TIKTOK-STYLE VIDEO PLAYER (FINAL API FIX)
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

// *** CRITICAL STEP: REPLACE THIS PLACEHOLDER URL ***
// This MUST point to the public web address where you host your videos-random.php
// Example: "https://my-free-php-host.com/videos-random.php"
const API_ENDPOINT = "https://YOUR-EXTERNAL-SERVER-HOST/videos-random.php"; 

const videoContainer = document.getElementById("videoContainer");
const overlay = document.getElementById("overlay");
const closeOverlay = document.getElementById("closeOverlay");
const noAdsBtn = document.getElementById("noAdsBtn");

// --- UTILITY: Show Loading Screen ---
function showLoadingScreen(message = "Fetching random link from server...") {
    videoContainer.innerHTML = `
      <div class="ad-screen">
        <p class="mb-4 text-pink-400 font-bold">Loading short... ⏳</p>
        <p class="mt-4 text-sm text-gray-400">${message}</p>
      </div>
    `;
}

// --- CORE FUNCTION: Fetch one random link from the server ---
async function fetchRandomVideoLink() {
  if (isFetching) return; // Ignore if a fetch is already in progress
  isFetching = true;
  
  // Stop the currently playing video before fetching the next one
  const currentVideo = videoContainer.querySelector("video");
  if (currentVideo) currentVideo.pause(); 
  
  // Display the loading screen immediately
  showLoadingScreen();

  try {
    const res = await fetch(API_ENDPOINT);

    if (!res.ok) {
        // This means the API endpoint is down or returning an error status (404, 500, etc.)
        throw new Error(`Server API Error: Status ${res.status}. Check if your PHP file is hosted and working.`);
    }

    const url = await res.text();
    const videoUrl = url.trim();

    if (!videoUrl || !videoUrl.startsWith("http")) {
        // This means the PHP script executed but returned junk or a blank line
        throw new Error(`Invalid URL returned from API: "${videoUrl.substring(0, 50)}..."`);
    }

    console.log("✅ Successfully received URL from API:", videoUrl);
    loadVideo(videoUrl);

  } catch (e) {
    console.error("❌ Critical Fetch Error:", e);
    
    // Show a user-friendly error screen instead of a broken video
    videoContainer.innerHTML = `
      <div class="ad-screen p-6">
        <p class="mb-4 text-xl font-bold text-red-500">💔 Connection Error 💔</p>
        <p class="mt-4 text-sm text-gray-400 opacity-90">
            Cannot connect to the video server (PHP file). Please ensure you have 
            replaced the placeholder <strong>API_ENDPOINT</strong> in app.js with the 
            correct, working URL of your hosted <strong>videos-random.php</strong>.
        </p>
        <p class="mt-4 text-xs text-gray-500 opacity-50">Retrying fetch in 5 seconds...</p>
      </div>
    `;
    // Attempt to retry after a delay
    setTimeout(fetchRandomVideoLink, 5000); 

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
      
      <div class="info">
        <h2>@ARTISTIC_SHORTS_BOT</h2>
        <p>This beautiful short video was picked very randomly! #artistic #professional</p>
      </div>

      <div class="actions">
        <button class="like-btn">❤️</button>
      </div>
    </div>
  `;

  const video = videoContainer.querySelector("video");
  
  // Attempt to play. Since muted is set, this usually works.
  video.play().catch(error => {
    console.log("Autoplay blocked, waiting for user interaction.", error);
  });
  
  video.addEventListener("ended", playNext);

  // Add event listeners for the new elements
  videoContainer.querySelector(".like-btn").addEventListener("click", function() {
    this.style.color = '#ec4899'; // pink-500
  });
} 

// Ad Screen
function showAdScreen() {
  // IMPORTANT: Your ad platform integration (Adsterra, etc.) goes here
  videoContainer.innerHTML = `
    <div class="ad-screen">
      <p class="mb-4 text-pink-400 font-bold">Commercial Break! 🤩</p>
      <p class="mt-4 text-sm text-white opacity-70">Your ad content goes here (e.g., from Adsterra)</p>
    </div>
  `;
  // After 3 seconds, fetch the next video (which is random)
  setTimeout(fetchRandomVideoLink, 3000); 
}


// Swipe detection
document.addEventListener("touchstart", e => { 
    // Only detect swipe if a video is currently loaded
    if (videoContainer.querySelector("video")) {
        startY = e.touches[0].clientY; 
    }
});
document.addEventListener("touchend", e => {
  if (videoContainer.querySelector("video")) {
    const endY = e.changedTouches[0].clientY;
    if (startY - endY > 50) playNext(); // swipe up
  }
});
document.addEventListener("wheel", e => { 
    if (videoContainer.querySelector("video") && e.deltaY > 0) {
        playNext(); 
    }
});

// Overlay / No Ads
noAdsBtn.onclick = () => overlay.style.display = "flex"; 
closeOverlay.onclick = () => overlay.style.display = "none";
document.getElementById("buyProBtn").onclick = () => {
    console.log("PRO purchase initiated.");
    // In a real app, this would initiate a payment flow.
    overlay.style.display = "none";
};


// --- START APP ---
// Start fetching the first video
Telegram.WebApp.ready();
fetchRandomVideoLink();
