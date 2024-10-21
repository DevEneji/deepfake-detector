let detectionEnabled = false;

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TOGGLE_DETECTION') {
        detectionEnabled = message.enabled;
        console.log(`Deepfake detection is ${detectionEnabled ? 'enabled' : 'disabled'}`);
    }

    if (message.type === 'VIDEO_BLOBS') {
        const videoBlobs = message.data;
    
        videoBlobs.forEach(async (video) => {
            const reader = new FileReader();
            reader.onloadend = function() {
                const base64data = reader.result.split(',')[1];
                // Send to backend server for processing
                fetch('https://localhost:8000/api/detect', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ video_base64: base64data })
                })
                .then(response => response.json())
                .then(data => {
                    // Send the result to the popup or content script
                    chrome.runtime.sendMessage({
                        type: 'DEEPFAKE_RESULT',
                        data: {
                            url: video.url,
                            probability: data.probability
                        }
                    });
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            };
            reader.readAsDataURL(video.blob);
        });
    }
});

// Monitor video playback and start detection if enabled
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && detectionEnabled) {
        chrome.tabs.sendMessage(tabId, { type: 'START_DETECTION' });
    }
});

// Optional: Stop detection when the toggle is off
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'STOP_DETECTION' && !detectionEnabled) {
        // Clear any ongoing detection tasks here
        console.log('Detection stopped.');
    }
});
