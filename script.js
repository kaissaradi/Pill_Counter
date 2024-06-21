let video;
let detector;
let detections = {};
let isDetecting = false;
let canvasWidth = 480;  // Match this to the width in CSS
let canvasHeight = 360; // Match this to the height in CSS

function setup() {
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('overlay');

  video = createCapture(VIDEO);
  video.size(canvasWidth, canvasHeight);
  video.hide();

  const startButton = select('#startButton');
  const stopButton = select('#stopButton');
  
  startButton.mousePressed(startDetection);
  stopButton.mousePressed(stopDetection);
}

function startDetection() {
  if (isDetecting) return;
  
  isDetecting = true;
  select('#startButton').attribute('disabled', '');
  select('#stopButton').removeAttribute('disabled');
  
  detector = ml5.objectDetector('cocossd', modelReady);
}

function modelReady() {
  console.log('Model is ready');
  detectObjects();
}

function detectObjects() {
  if (!isDetecting) return;

  detector.detect(video, gotDetections);
}

function gotDetections(error, results) {
  if (error) {
    console.error('Detection error:', error);
    select('#camera-error').removeClass('hidden');
    return;
  }

  // Clear old detections
  detections = {};

  for (let object of results) {
    if (!detections[object.label]) {
      detections[object.label] = [];
    }
    detections[object.label].push(object);
  }

  detectObjects(); // Continue the detection loop
}

function draw() {
  if (!isDetecting) return;

  // Scale and center the video to fit the canvas
  let scale = Math.min(width / video.width, height / video.height);
  let x = (width - video.width * scale) / 2;
  let y = (height - video.height * scale) / 2;
  
  image(video, x, y, video.width * scale, video.height * scale);

  let pillCount = 0;
  let pillTypes = '';

  for (let label in detections) {
    for (let object of detections[label]) {
      // Adjust bounding box coordinates based on the scaled video
      let scaledX = object.x * scale + x;
      let scaledY = object.y * scale + y;
      let scaledW = object.width * scale;
      let scaledH = object.height * scale;

      if (label === 'pill') { // Adjust this label as needed
        pillCount++;
        pillTypes += `Pill Type ${pillCount}: ${label}<br>`;

        // Draw bounding box
        stroke(0, 255, 0);
        strokeWeight(2);
        noFill();
        rect(scaledX, scaledY, scaledW, scaledH);

        // Draw label
        noStroke();
        fill(0, 255, 0);
        textSize(12);
        text(label, scaledX + 4, scaledY + 16);
      }
    }
  }

  select('#pillCount').html(`Pill Count: ${pillCount}`);
  select('#pillTypeList').html(`Pill Types:<br>${pillTypes}`);
}

function stopDetection() {
  isDetecting = false;
  select('#startButton').removeAttribute('disabled');
  select('#stopButton').attribute('disabled', '');

  // Clear detections
  detections = {};

  // Clear the canvas
  clear();

  select('#pillCount').html('Pill Count: 0');
  select('#pillTypeList').html('Pill Types:');
}