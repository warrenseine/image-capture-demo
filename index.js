const cameraSelect = document.getElementById("cameraSelect");
const video = document.querySelector("video");
const startCameraButton = document.getElementById("startCameraBtn")
const takePhotoButton = document.getElementById("takePhotoBtn")
const photoTaken = document.getElementById("photoTaken")
const photoInfoDiv = document.getElementById("photoInfo")
const photoCapabilitiesDiv = document.getElementById("photoCapabilities")
const photoSettingsDiv = document.getElementById("photoSettings")

startCameraButton.addEventListener('click', async () => {
  const videoConstraints = { width: 640, height: 480 };

  if (cameraSelect.selectedIndex != -1) {
    videoConstraints.deviceId = cameraSelect.selectedOptions[0].value;
  }

  if (video.srcObject) {
    video.srcObject.getTracks().map(track => track.stop());
  }

  try {
    video.style.display = "block";
    video.srcObject = await navigator.mediaDevices.getUserMedia({ video: videoConstraints })
    const imageCapture = getImageCapture();
    const photoCapabilities = await imageCapture.getPhotoCapabilities()
    photoCapabilitiesDiv.innerText = `photoCapabilities: ${JSON.stringify(photoCapabilities, null, 2)}`;
    const photoSettings = await imageCapture.getPhotoSettings();
    photoSettingsDiv.innerText = `photoSettings: ${JSON.stringify(photoSettings, null, 2)}`;

  } catch (e) {
    console.error(e);
    photoInfoDiv.innerText = 'Error: ' + e;
  }
});

takePhotoButton.addEventListener('click', async () => {
  const imageCapture = getImageCapture();
  const blob = await imageCapture.takePhoto();
  photoTaken.src = URL.createObjectURL(blob);
});

photoTaken.addEventListener('load', () => {
  photoInfoDiv.innerText = `photoSize: ${JSON.stringify({
    width: photoTaken.naturalWidth,
    height: photoTaken.naturalHeight
  }, null, 2)}`;
})

async function loadCameraDevices() {
  const constraints = { video: true };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  const devices = await navigator.mediaDevices.enumerateDevices();
  stream.getTracks().map(track => track.stop());
  devices.filter(device => device.kind === 'videoinput').map(({ label, deviceId }) => cameraSelect.appendChild(new Option(label, deviceId)))
}

async function requestCameraPermission() {
  const constraints = { video: true };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  stream.getTracks().map(track => track.stop());
}

function getImageCapture() {
  if (!window.ImageCapture) throw new Error("ImageCapture not supported");
  const imageCapture = new ImageCapture(video.srcObject.getVideoTracks()[0]);
  return imageCapture;
}

async function run() {
  await requestCameraPermission();
  await loadCameraDevices();
}

run();

