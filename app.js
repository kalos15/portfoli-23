let videos = [];
let currentIndex = 0;
let swipeCount = 0;

const videoPlayer = document.getElementById("videoPlayer");
const nextBtn = document.getElementById("nextBtn");
const adTag = document.getElementById("adTag");

async function loadVideos() {
  try {
    const res = await fetch("videos.txt");
    const text = await res.text();
    videos = shuffleArray(
      text
        .split("\n")
        .map(v => v.trim())
        .filter(v => v.length > 0 && v.startsWith("http"))
    );
    playNext();
  } catch (e) {
    console.error("❌ Error loading videos:", e);
  }
}

function playNext() {
  if (!videos.length) return;

  swipeCount++;

  // Every 4 swipes, show ad
  if (swipeCount % 4 === 0) {
    adTag.classList.remove("hidden");
    videoPlayer.src = "https://cdn.jsdelivr.net/gh/yourusername/repo/ad.mp4"; // replace with ad URL
  } else {
    adTag.classList.add("hidden");
    currentIndex = (currentIndex + 1) % videos.length;
    videoPlayer.src = videos[currentIndex];
  }

  videoPlayer.play().catch(err => console.log("Autoplay error:", err));
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Swipe detection
let startY = 0;
videoPlayer.addEventListener("touchstart", e => {
  startY = e.touches[0].clientY;
});
videoPlayer.addEventListener("touchend", e => {
  const endY = e.changedTouches[0].clientY;
  if (startY - endY > 50) playNext(); // swipe up
});

nextBtn.addEventListener("click", playNext);
videoPlayer.addEventListener("ended", playNext);

loadVideos();
