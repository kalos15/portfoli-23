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
let isFetching = false; // Flag to prevent multiple fetches from fast swipes

// *** CRITICAL STEP: HARDCODED YOUR WORKING ENDPOINT ***
const API_ENDPOINT = "https://2vds.gt.tc/videos-random.php";

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
  if (isFetching) return;
  isFetching = true;

  // Stop and clear the currently playing video
  const currentVideo = videoContainer.querySelector("video");
  if (currentVideo) currentVideo.pause();
  
  // Display the loading screen immediately
  showLoadingScreen();

  try {
    const res = await fetch(API_ENDPOINT);

    if (!res.ok) {
        throw new Error(`Server API Error: Status ${res.status}.`);
    }

    const url = await res.text();
    const videoUrl = url.trim();

    if (!videoUrl || !videoUrl.startsWith("http")) {
        throw new Error(`Invalid URL returned from API: "${videoUrl.substring(0, 50)}..."`);
    }

    console.log("✅ Successfully received URL from API:", videoUrl);
    
    // Pass the valid URL to the rendering function
    loadVideo(videoUrl);

  } catch (e) {
    console.error("❌ Critical Fetch Error:", e);

    // Show a user-friendly error screen
    videoContainer.innerHTML = `
      <div class="ad-screen p-6">
        <p class="mb-4 text-xl font-bold text-red-500">💔 Video Load Error 💔</p>
        <p class="mt-4 text-sm text-gray-400 opacity-90">
            Could not fetch a valid video link. Please check your hosting provider for errors.
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

// --- FIX: Load video with robust autoplay/error handling ---
function loadVideo(url) {
  // Use a temporary container for the new content
  const newContent = document.createElement('div');
  newContent.className = 'video-slide';
  
  // IMPORTANT: Added muted, playsinline, and loop for guaranteed mobile autoplay
  newContent.innerHTML = `
      <video src="${url}" autoplay muted playsinline loop></video>
      
      <!-- The info container for the black bar effect -->
      <div class="info">
        <h2>@ARTISTIC_SHORTS_BOT</h2>
        <p>This beautiful short video was picked very randomly! #artistic #professional</p>
      </div>

      <div class="actions">
        <button class="like-btn">❤️</button>
      </div>
  `;

  // Clear the container (removes the loading screen) and append the new content
  videoContainer.innerHTML = '';
  videoContainer.appendChild(newContent);
  
  const video = videoContainer.querySelector("video");

  // 1. Listen for when the video metadata is loaded
  video.addEventListener('loadeddata', () => {
      // 2. Attempt to play the video (it must be muted for browsers to allow it)
      video.play().catch(error => {
          console.log("Autoplay blocked, user interaction required:", error.message);
          // Show a play button overlay if autoplay fails
          // For simplicity, we just log and rely on the user tapping the screen
      });
  });
  
  // 3. Handle video playback error (e.g., link is broken or video file is corrupt)
  video.addEventListener('error', (e) => {
      console.error("Video element playback error:", e.target.error);
      showLoadingScreen(`💔 Error playing video from URL. Skipping in 3s...`);
      setTimeout(playNext, 3000);
  });
  
  // 4. Set up the loop/next video logic
  video.addEventListener("ended", playNext);

  // 5. Add event listener for the like button
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
    // Swipe up: difference is positive (startY > endY)
    if (startY - endY > 50) playNext(); 
  }
});
document.addEventListener("wheel", e => { 
    // Scroll down: deltaY is positive
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
