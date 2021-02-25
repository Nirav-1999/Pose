// Our input frames will come from here.
const videoElement = document.getElementsByClassName('input_video')[0];
// console.log(videoElement)
const canvasElement = document.getElementsByClassName('output_canvas')[0];
// console.log(canvasElement)
const controlsElement = document.getElementsByClassName('control-panel')[0];
// console.log(controlsElement)
const canvasCtx = canvasElement.getContext('2d');
// console.log(canvasCtx)

// We'll add this to our control panel later, but we'll save it here so we can
// call tick() each time the graph runs.
// const fpsControl = new FPS();

// Optimization: Turn off animated spinner after its hiding animation is done.
const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
  spinner.style.display = 'none';
};

function find_angle(A,B,C) {
    var AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));    
    var BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2)); 
    var AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
    return Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
}

var count = 0;
var f = 1;

function onResults(results) {

  // Hide the spinner.
  document.body.classList.add('loaded');
//   console.log(results.poseLandmarks)

  // Update the frame rate.
//   fpsControl.tick();

  // Draw the overlays.
  // console.log(results)
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);

  var angleRight  = find_angle(results.poseLandmarks[23],results.poseLandmarks[25],results.poseLandmarks[27])*180/Math.PI
  var angleLeft = find_angle(results.poseLandmarks[24],results.poseLandmarks[26],results.poseLandmarks[28])*180/Math.PI
  
  if ( (angleRight >= 170  && angleLeft >= 170 ) && f == 1 ){
    count += 1;  
    f = 0;
    console.log("Flgged")
  }



  if ( (angleRight >= 70 && angleRight <=110) && (angleLeft >= 70 && angleLeft <= 110) ){
    drawConnectors(
        canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
        {color: '#2fff00'});
        // console.log(angleRight)
        // console.log(angleLeft)
    f = 1;
    

  }
  else{
    drawConnectors(
        canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
        {color: '#ffffff'});
    

  }
  canvasCtx.fillStyle = "blue";
  canvasCtx.font = "bold 16px Arial";
  canvasCtx.fillText("AngleRight = " + angleRight, 20, 60);
  canvasCtx.fillText("AngleLeft = " + angleLeft, 20, 80);
  
  console.log(count)
  canvasCtx.fillText("Count = " + (count - 1), 20, 100);


  
  drawLandmarks(
      canvasCtx, results.poseLandmarks,
      {color: '#00FF00', fillColor: '#FF0000', lineWidth: 4, radius: 4});
  canvasCtx.restore();





}

const pose = new Pose({locateFile: (file) => {
    // console.log(file);
  return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.1/${file}`;
}});
pose.onResults(onResults);

/**
 * Instantiate a camera. We'll feed each frame we receive into the solution.
 */
const camera = new Camera(videoElement, {
  
  onFrame: async () => {
    // console.log("Await start");

    await pose.send({image: videoElement});
    // console.log("Await end");
  },
  width: 1280,
  height: 720
});
// console.log("Camera start");

camera.start();

// Present a control panel through which the user can manipulate the solution
// options.
new ControlPanel(controlsElement, {
      selfieMode: true,
      upperBodyOnly: false,
      smoothLandmarks: true,
      minDetectionConfidence: 0.3,
      minTrackingConfidence: 0.3
    })
    .add([
      new StaticText({title: 'MediaPipe'}),

    ])
    .on(options => {
      videoElement.classList.toggle('selfie', options.selfieMode);
      pose.setOptions(options);
    });