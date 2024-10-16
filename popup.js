document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('toggle');
  const statusText = document.getElementById('status');
  const resultsDiv = document.getElementById('results');

  // Add event listener for the toggle switch
  toggle.addEventListener('change', function() {
      if (toggle.checked) {
          statusText.textContent = 'Detector is on';
          // Notify background.js to start detection
          chrome.runtime.sendMessage({ type: 'TOGGLE_DETECTION', enabled: true });
      } else {
          statusText.textContent = 'Detector is off';
          // Notify background.js to stop detection
          chrome.runtime.sendMessage({ type: 'TOGGLE_DETECTION', enabled: false });
      }
  });

  // Initialize the toggle state based on stored settings
  chrome.storage.sync.get('detectionEnabled', function(data) {
      toggle.checked = data.detectionEnabled || false;
      statusText.textContent = toggle.checked ? 'Detector is on' : 'Detector is off';
  });

  // Save the state to chrome.storage
  toggle.addEventListener('change', function() {
      chrome.storage.sync.set({ detectionEnabled: toggle.checked });
  });

  // Listen for deepfake results from background.js
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'DEEPFAKE_RESULT') {
          const videoUrl = message.data.url;
          const probability = message.data.probability.toFixed(2);
    
          // Create a result entry
          const resultEntry = document.createElement('div');
          resultEntry.className = 'result-entry';
    
          const urlLink = document.createElement('a');
          urlLink.href = videoUrl;
          urlLink.textContent = 'Video Link';
          urlLink.target = '_blank';
    
          const probText = document.createElement('p');
          probText.textContent = `Deepfake Probability: ${probability}%`;
    
          resultEntry.appendChild(urlLink);
          resultEntry.appendChild(probText);
          resultsDiv.appendChild(resultEntry);
      }
  });
});
