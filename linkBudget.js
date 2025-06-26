import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const ai = new GoogleGenerativeAI("AIzaSyDLEh-QO5r7b9CGRD7oEkv-3sJb2VzkxZU"); 

async function calculateLinkBudget() {
  const Pt = parseFloat(document.getElementById('pt').value);
  const Gt = parseFloat(document.getElementById('gt').value);
  const Gr = parseFloat(document.getElementById('gr').value);
  const d = parseFloat(document.getElementById('d').value);
  const f = parseFloat(document.getElementById('f').value);
  const Ls = parseFloat(document.getElementById('ls').value);

  if ([Pt, Gt, Gr, d, f, Ls].some(isNaN) || d <= 0 || f <= 0) {
    showErrorBox("Please enter valid positive numbers for all fields.");
    return;
  }
  

  try {
  const response = await fetch('/link-budget', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Pt, Gt, Gr, d, f, Ls })
  });

  const data = await response.json();

  const prValue = parseFloat(data.pr);
  const summary = data.summary; 

  const explanation = `
    📶 <strong>Received Power: ${prValue} dBm</strong><br><br>
    ${summary}<br><br>
    ${
      prValue > -70
        ? "✅ Strong signal."
        : prValue > -90
        ? "⚠️ Acceptable signal."
        : "❌ Weak signal."
    }
  `;

  showResultBox(explanation);
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

// attach functions to global window so HTML button can access them
window.calculateLinkBudget = calculateLinkBudget;
window.closeErrorBox = closeErrorBox;
window.closeResultBox = closeResultBox;
