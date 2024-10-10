// Get elements
const video = document.createElement('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('captureButton');
const uploadedImage = document.getElementById('uploaded-image');
const cameraError = document.getElementById('camera-error');
const outputElement = document.getElementById('output');

// Set up webcam
let streaming = false;

// Request access to webcam
captureButton.addEventListener('click', () => {
  if (!streaming) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        console.log('Access to camera granted!');
        video.srcObject = stream;
        video.play();
        streaming = true;
        drawCanvas();
      })
      .catch(error => {
        console.error('Error accessing webcam:', error);
        cameraError.classList.remove('hidden');
      });
  } else {
    try {
      // Capture image from webcam
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg');
      uploadedImage.src = imageData;
      uploadedImage.style.display = 'block';

      // Send image to Replicate API
      sendImageToReplicateAPI(imageData);
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  }
});

// Draw webcam feed on canvas
function drawCanvas() {
  try {
    if (streaming) {
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      requestAnimationFrame(drawCanvas);
    }
  } catch (error) {
    console.error('Error drawing canvas:', error);
  }
}

// Handle image upload
document.getElementById('image-upload').addEventListener('change', event => {
  try {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      uploadedImage.src = reader.result;
      uploadedImage.style.display = 'block';

      // Send image to Replicate API
      sendImageToReplicateAPI(reader.result);
    };
    reader.readAsDataURL(file);
  } catch (error) {
    console.error('Error uploading image:', error);
  }
});

// Send image to Replicate API
function sendImageToReplicateAPI(imageData) {
  const replicateApiToken = 'apikey';
  const url = 'https://api.replicate.com/v1/predictions';
  const headers = {
    'Authorization': `Bearer ${replicateApiToken}`,
    'Content-Type': 'application/json',
    'Prefer': 'wait'
  };
  const data = {
    'version': '76ebd700864218a4ca97ac1ccff068be7222272859f9ea2ae1dd4ac073fa8de8',
    'input': {
      'text': 'How many pills are in the image. Please give you response as a JSON object where you answer is stored in the variable numPills.This is very important to reply in structured JSON in the form of numPills and how maany pills you counted',
      'image': imageData
    }
  };

  fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data),
    mode: "no-cors"
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
    const outputJson = document.getElementById('output-json');
    outputJson.innerHTML = JSON.stringify(data, null, 2);
    
    const numPillsOutput = document.getElementById('num-pills-output');
    numPillsOutput.innerHTML = `Number of pills: ${data.output.numPills}`;
  })
  .catch(error => {
    console.error('Error sending image to Replicate API:', error);
  });
}

