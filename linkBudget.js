import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const ai = new GoogleGenerativeAI("AIzaSyDLEh-QO5r7b9CGRD7oEkv-3sJb2VzkxZU"); 

async function calculateLinkBudget() {

  const Pt = parseFloat(document.getElementById('pt').value);
  const ptUnit = document.getElementById('ptUnit').value;
  const Gt = parseFloat(document.getElementById('gt').value);
  const gtUnit = document.getElementById('gtUnit').value;
  const Gr = parseFloat(document.getElementById('gr').value);
  const grUnit = document.getElementById('grUnit').value;
  let d = parseFloat(document.getElementById('d').value);
  const dUnit = document.getElementById('distanceUnit').value;
  let f = parseFloat(document.getElementById('f').value);
  const freqUnit = document.getElementById('freqUnit').value;
  const Ls = parseFloat(document.getElementById('ls').value);
  const lsUnit = document.getElementById('lsUnit').value;
  const unitType = document.getElementById('unitType').value;


  if ([Pt, Gt, Gr, d, f, Ls].some(isNaN) || d <= 0 || f <= 0) {
    showErrorBox("Please enter valid positive numbers for all fields.");
    return;
  }
  

  try {
  const response = await fetch('/link-budget', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Pt, Gt, Gr, d, f, Ls,
      lsUnit, freqUnit, dUnit,
      grUnit, gtUnit, ptUnit, unitType
    })
  });

  const data = await response.json();
  const stepsList = data.summary.map(step => `<li>${step}</li>`).join("");
  const explanation = `
    <strong>Received Power: ${data.pr.toFixed(2)} dBm</strong><br><br>
    <strong>Steps:</strong>
    <ul>${stepsList}</ul><br>
    ${
      data.pr > -70
        ? "Strong signal."
        : data.pr > -90
        ? "Acceptable signal."
        : "Weak signal."
    }
  `;


  showResultBox(explanation);
  } catch (err) {
    showErrorBox("Error: " + err.message);
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

window.calculateLinkBudget = calculateLinkBudget;
window.closeErrorBox = closeErrorBox;
window.closeResultBox = closeResultBox;
