let video;
let detector;
let detections = [];

function setup() {
  const canvas = createCanvas(640, 480);
  canvas.parent('overlay'); // Attach canvas to overlay div

  // Create the video element and show it by default
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide(); // Hide the default video element
  video.elt.setAttribute('playsinline', ''); // Ensures video plays inline on mobile devices

  // Initialize the detector
  videoReady();
}

function videoReady() {
  detector = ml5.objectDetector('cocossd', modelReady);
}

function modelReady() {
  console.log('Model is ready!');
  detector.detect(video, gotDetections);
}

function gotDetections(error, results) {
  if (error) {
    console.error(error);
    select('#camera-error').html(`Error: ${error}`).removeClass('hidden');
  } else {
    detections = results;
    detector.detect(video, gotDetections); // Continue detecting
  }
}

function draw() {
  if (video && video.loadedmetadata) {
    image(video, 0, 0);

    let pillCount = 0;
    let pillTypes = '';

    for (let i = 0; i < detections.length; i += 1) {
      const object = detections[i];
      // Update this label with the class name your trained model predicts (e.g., "pill")
      if (object.label === 'your_pill_class_name') {
        pillCount++;
        pillTypes += `Pill Type ${i + 1}: ${object.label}<br>`;

        stroke(0, 255, 0);
        strokeWeight(4);
        noFill();
        rect(object.x, object.y, object.width, object.height);
        noStroke();
        fill(255);
        textSize(24);
        text(object.label, object.x + 10, object.y + 24);
      }
    }

    // Update pill count and pill type list
    select('#pillCount').html(`Pill Count: ${pillCount}`);
    select('#pillTypeList').html(`Pill Types:<br>${pillTypes}`);
  }
}

// Start detection (triggered by "Start" button click)
function startDetection() {
  if (!video) {
    setup();
  }

  // Request camera access when the button is clicked
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.elt.srcObject = stream; // Directly setting the srcObject for the video element
      videoReady();
    })
    .catch(error => {
      console.error('Error accessing camera:', error);
      select('#camera-error').html(`Error: ${error}`).removeClass('hidden');
    });

  document.getElementById('startButton').disabled = true;
  document.getElementById('stopButton').disabled = false;
}

// Stop detection (triggered by "Stop" button click)
function stopDetection() {
  if (video) {
    let stream = video.elt.srcObject;
    let tracks = stream.getTracks();

    tracks.forEach(function(track) {
      track.stop();
    });

    video.elt.srcObject = null;
    video.hide();
    detections = [];
  }
  document.getElementById('startButton').disabled = false;
  document.getElementById('stopButton').disabled = true;
}
