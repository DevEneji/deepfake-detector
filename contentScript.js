// Function to extract video URLs
function extractVideoUrls() {
  const videos = document.querySelectorAll('video');
  const videoUrls = [];
  videos.forEach(video => {
    if (video.src) {
      videoUrls.push(video.src);
    } else if (video.currentSrc) {
      videoUrls.push(video.currentSrc);
    }
  });
  return videoUrls;
}

// Function to download video as blob
async function downloadVideo(url) {
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error downloading video:', error);
    return null;
  }
}

// Function to handle deepfake detection
async function handleDetection() {
  const videoUrls = extractVideoUrls();
  const videoBlobs = [];

  for (const url of videoUrls) {
    const blob = await downloadVideo(url);
    if (blob) {
      videoBlobs.push({
        url,
        blob
      });
    }
  }

  if (videoBlobs.length > 0) {
    chrome.runtime.sendMessage({ type: 'VIDEO_BLOBS', data: videoBlobs });
  }
}

// Listen for messages from the background script to start detection
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_DETECTION') {
    handleDetection();
  }
});
