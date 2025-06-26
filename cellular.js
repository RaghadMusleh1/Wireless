  function goTo(page) {
    window.location.href = page;
  }
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const ai = new GoogleGenerativeAI("AIzaSyDLEh-QO5r7b9CGRD7oEkv-3sJb2VzkxZU"); 

async function calculate() {
  const totalBW = parseFloat(document.getElementById("pt").value);
  const channelBW = parseFloat(document.getElementById("gt").value);
  const numberOfCells = parseFloat(document.getElementById("gr").value);
  const reuseFactor = parseFloat(document.getElementById("f").value);
  const cellRadius = parseFloat(document.getElementById("ls").value);

  if ([totalBW, channelBW, numberOfCells, reuseFactor, cellRadius].some(isNaN)) {
    showErrorBox("❌ Please enter valid numeric values in all fields.");
    return;
  }

  try {
  const response = await fetch('/cellular-system', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      totalBW,
      channelBW,
      numberOfCells,
      reuseFactor,
      cellRadius
    })
  });

  const data = await response.json();

  if (data.channelsPerCell !== undefined && data.systemCapacity !== undefined && data.reuseDistance !== undefined) {
    const explanation = `
      📡 <strong>Channels per Cell:</strong> ${data.channelsPerCell}<br>
      📶 <strong>Total System Capacity:</strong> ${data.systemCapacity}<br>
      📏 <strong>Frequency Reuse Distance:</strong> ${data.reuseDistance.toFixed(2)} meters<br><br>
      🧠 <strong>Summary:</strong> ${data.summary}
    `;
    showResultBox(explanation);
  } else {
    showErrorBox("❌ Missing result fields from server.");
  }
} catch (err) {
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
