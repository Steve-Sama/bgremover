const fileInput = document.getElementById('fileInput');
const downloadBtn = document.getElementById('downloadBtn');
const beforeImage = document.querySelector('.before img');
const afterImage = document.querySelector('.after img');
const uploadBox = document.querySelector('.upload-box');

let uploadPreview = null;
let processedImageBlob = null;

// Client-side background removal using simple algorithm (simulated)
function removeBackgroundSim(imageDataURL, callback) {
  // Simulate a quick "AI-like" effect with canvas
  const img = new Image();
  img.src = imageDataURL;
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    // Fake background removal: make white pixels transparent
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 200 && data[i+1] > 200 && data[i+2] > 200) {
        data[i+3] = 0; // alpha channel
      }
    }
    ctx.putImageData(imgData, 0, 0);
    callback(canvas.toDataURL("image/png"));
  }
}

function handleFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const imageData = e.target.result;

    // Show in Before
    beforeImage.src = imageData;

    // Clear After + show spinner
    afterImage.src = '';
    afterImage.classList.add('processing');
    downloadBtn.disabled = true;

    // Show preview thumbnail
    if (!uploadPreview) {
      uploadPreview = document.createElement("img");
      uploadPreview.classList.add("upload-preview");
      uploadPreview.style.width = "80px";
      uploadPreview.style.height = "80px";
      uploadPreview.style.objectFit = "cover";
      uploadPreview.style.borderRadius = "8px";
      uploadPreview.style.marginTop = "10px";
      uploadBox.appendChild(uploadPreview);
    }
    uploadPreview.src = imageData;

    // Simulate processing
    setTimeout(() => {
      removeBackgroundSim(imageData, (processedDataURL) => {
        afterImage.src = processedDataURL;
        afterImage.classList.remove('processing');
        processedImageBlob = dataURLtoBlob(processedDataURL);
        downloadBtn.disabled = false;
      });
    }, 2000); // 2s simulated delay
  }
  reader.readAsDataURL(file);
}

// Convert DataURL to Blob for download
function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
  return new Blob([u8arr], { type: mime });
}

// Event listeners
fileInput.addEventListener('change', e => handleFile(e.target.files[0]));
uploadBox.addEventListener('dragover', e => { e.preventDefault(); uploadBox.style.backgroundColor = '#e3f2fd'; });
uploadBox.addEventListener('dragleave', e => { e.preventDefault(); uploadBox.style.backgroundColor = '#ffffff'; });
uploadBox.addEventListener('drop', e => { e.preventDefault(); uploadBox.style.backgroundColor = '#ffffff'; handleFile(e.dataTransfer.files[0]); });
downloadBtn.addEventListener('click', () => {
  if (!processedImageBlob) return;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(processedImageBlob);
  link.download = 'processed-image.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
