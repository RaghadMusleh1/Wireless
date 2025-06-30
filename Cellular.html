  function goTo(page) {
    window.location.href = page;
  }
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const ai = new GoogleGenerativeAI("AIzaSyDLEh-QO5r7b9CGRD7oEkv-3sJb2VzkxZU"); 

async function calculate() {
  const totalBW = parseFloat(document.getElementById("totBw").value);
  const totalBwUnit = document.getElementById("totBwUnit").value;
  const channelBW = parseFloat(document.getElementById("ch").value);
  const chUnit = document.getElementById("chUnit").value;
  const numberOfCells = parseFloat(document.getElementById("cells").value);
  const reuseFactor = parseFloat(document.getElementById("f").value);
  const cellRadius = parseFloat(document.getElementById("r").value);
  const rUnit = document.getElementById("rUnit").value;

  const inputs = [
    { name: "Total Bandwidth", value: totalBW },
    { name: "Channel Bandwidth", value: channelBW },
    { name: "Number of Cells", value: numberOfCells },
    { name: "Reuse Factor", value: reuseFactor },
    { name: "Cell Radius", value: cellRadius }
  ];

  for (const input of inputs) {
    if (isNaN(input.value)) {
      showErrorBox(`❌ Please enter a valid number for "${input.name}".`);
      return;
    }
    if (input.value <= 0) {
      showErrorBox(`❌ "${input.name}" must be greater than 0.`);
      return;
    }
  }


  try {
  const response = await fetch('/cellular-system', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    totalBW,
    totalBwUnit,
    channelBW,
    chUnit,
    numberOfCells,
    reuseFactor,
    cellRadius,
    rUnit
  })
});

const data = await response.json();
console.log("📦 Server Response:", data);

if (
  data.channelsPerCell !== undefined &&
  data.systemCapacity !== undefined &&
  data.reuseDistance !== undefined
) {
  let stepsList = "";

  if (Array.isArray(data.steps)) {
    stepsList = data.steps.map(step => `<li>${step}</li>`).join("");
  } else if (typeof data.summary === "string") {
    stepsList = `<li>${data.summary}</li>`;
  } else {
    stepsList = `<li>No explanation available.</li>`;
  }

  const explanation = `
    📡 <strong>Channels per Cell:</strong> ${data.channelsPerCell}<br>
    📶 <strong>Total System Capacity:</strong> ${data.systemCapacity}<br>
    📏 <strong>Frequency Reuse Distance:</strong> ${data.reuseDistance.toFixed(2)} meters<br><br>
    🧠 <strong>Calculation Steps:</strong>
    <ul>${stepsList}</ul>
  `;



  showResultBox(explanation);
  } else {
    console.error("❌ Debug: One or more fields are missing from the response.", data);
    showErrorBox("❌ Missing result fields from server.");
  }

} catch (err) {
  console.error("❌ Fetch error:", err);
  showErrorBox("❌ Error: " + err.message);
}


}


function showErrorBox(message) {
  const box = document.getElementById('errorBox');
  box.querySelector('.box-body').innerHTML = message;
  box.style.display = 'block';
}

function closeErrorBox() {
  document.getElementById('errorBox').style.display = 'none';
}

function showResultBox(htmlMessage) {
  const box = document.getElementById('resultBox');
  document.getElementById('resultContent').innerHTML = htmlMessage;
  box.style.display = 'block';
}

function closeResultBox() {
  document.getElementById('resultBox').style.display = 'none';
}

function makeDraggable(boxId, headerId) {
  const box = document.getElementById(boxId);
  const header = document.getElementById(headerId);
  let offsetX = 0, offsetY = 0, isDragging = false;

  header.onmousedown = function (e) {
    isDragging = true;
    offsetX = e.clientX - box.offsetLeft;
    offsetY = e.clientY - box.offsetTop;
  };

  document.onmouseup = () => isDragging = false;

  document.onmousemove = function (e) {
    if (isDragging) {
      box.style.left = (e.clientX - offsetX) + "px";
      box.style.top = (e.clientY - offsetY) + "px";
    }
  };
}

makeDraggable("errorBox", "errorHeader");
makeDraggable("resultBox", "resultHeader");

window.calculate = calculate;
window.closeErrorBox = closeErrorBox;
window.closeResultBox = closeResultBox;
