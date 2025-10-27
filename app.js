// ---------------------------------------------------
// app.js — TikTok-style Video Player (API Fetch Logic)
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

// State variables
let swipeCount = 0;
let startY = 0;
let isFetching = false; // Flag to prevent multiple fetches from fast swipes

// *** CRITICAL STEP: The single source of video links ***
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

  // Stop the currently playing video before fetching the next one
  const currentVideo = videoContainer.querySelector("video");
  if (currentVideo) currentVideo.pause();

  // Display the loading screen immediately
  showLoadingScreen();

  try {
    const res = await fetch(API_ENDPOINT);

    if (!res.ok) {
        throw new Error(`Server API Error: Status ${res.status}.`);
    }

    // Read the single URL line from the response
    const url = await res.text();
    const videoUrl = url.trim();

    if (!videoUrl || !videoUrl.startsWith("http")) {
        throw new Error(`Invalid URL returned from API: "${videoUrl.substring(0, 50)}..."`);
    }

    console.log("✅ Successfully received URL from API:", videoUrl);
    
    // Pass the valid URL directly to the rendering function
    loadVideo(videoUrl);

  } catch (e) {
    console.error("❌ Critical Fetch Error:", e);

    // Show a user-friendly error screen
    videoContainer.innerHTML = `
      <div class="ad-screen p-6">
        <p class="mb-4 text-xl font-bold text-red-500">💔 Connection/Link Error 💔</p>
        <p class="mt-4 text-sm text-gray-400 opacity-90">
            Could not fetch a valid video link. Check your API endpoint.
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

  // 💡 AD LOGIC: Show ad every 4 swipes (as per your old structure)
  if (swipeCount % 4 === 0) {
    showAdScreen();
  } else {
    // FIX: Instead of loading from an array index, fetch a new random one
    fetchRandomVideoLink();
  }
}

// Load video takes a single URL (string)
function loadVideo(url) {
  // Clear the container (removes the loading screen)
  videoContainer.innerHTML = `
    <div class="video-slide">
      <!-- Added muted, playsinline, and loop for robust mobile autoplay -->
      <video src="${url}" autoplay muted playsinline loop></video>
      
      <div class="info">
        <h2>@2VIDEOS_SHORTS</h2>
        <p>A random artistic short just for you!</p>
      </div>

      <div class="actions">
        <button class="like-btn">❤️</button>
      </div>
    </div>
  `;

  const video = videoContainer.querySelector("video");
  
  // Listen for video metadata load before trying to play
  video.addEventListener('loadeddata', () => {
      // Attempt to play. Since muted is set, this usually works.
      video.play().catch(error => {
          console.log("Autoplay blocked, user interaction required.", error);
      });
  });
  
  // Handle video errors (e.g., a broken link)
  video.addEventListener('error', (e) => {
      console.error("Video element playback error:", e.target.error);
      showLoadingScreen(`💔 Video failed to load. Skipping in 3s...`);
      setTimeout(playNext, 3000);
  });
  
  // Event to move to the next video when the current one ends
  video.addEventListener("ended", playNext);

  // Add event listeners for the like button
  videoContainer.querySelector(".like-btn").addEventListener("click", function() {
    this.style.color = '#ec4899'; // pink-500
  });
}

// Ad Screen
function showAdScreen() {
  videoContainer.innerHTML = `
    <div class="ad-screen">
      <p class="mb-4 text-pink-400 font-bold">Commercial Break! 🤩</p>
      <p class="mt-4 text-sm text-white opacity-70">Your ad content goes here (e.g., from Adsterra)</p>
    </div>
  `;
  // After 3 seconds, fetch the next video
  setTimeout(fetchRandomVideoLink, 3000);
}


// Swipe detection
document.addEventListener("touchstart", e => {
    // Only detect swipe if a video is currently loaded
    if (videoContainer.querySelector(".video-slide")) {
        startY = e.touches[0].clientY;
    }
});
document.addEventListener("touchend", e => {
  if (videoContainer.querySelector(".video-slide")) {
    const endY = e.changedTouches[0].clientY;
    if (startY - endY > 50) playNext(); // swipe up
  }
});
document.addEventListener("wheel", e => {
    if (e.deltaY > 0) playNext();
});

// Overlay / No Ads
noAdsBtn.onclick = () => overlay.style.display = "flex";
closeOverlay.onclick = () => overlay.style.display = "none";
document.getElementById("buyProBtn").onclick = () => {
    console.log("PRO purchase initiated.");
    overlay.style.display = "none";
};

// --- START APP ---
// Start fetching the first video
Telegram.WebApp.ready();
fetchRandomVideoLink();
