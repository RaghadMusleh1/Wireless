import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const ai = new GoogleGenerativeAI("AIzaSyDLEh-QO5r7b9CGRD7oEkv-3sJb2VzkxZU");

async function calculateLinkBudget() {
  const k = 1.38e-23; 
  const T = 290; 
  let dForBody;
  let fForBody;

  function getValue(id, name) {
    const val = parseFloat(document.getElementById(id).value);
    if (isNaN(val)) {
      showErrorBox(`Invalid input for ${name}`);
      throw new Error(`Invalid input for ${name}`);
    }
    return val;
  }

  function toLinear(value, unit) {
    if (unit === 'dB') return Math.pow(10, value / 10);
    if (unit === 'dBm') return Math.pow(10, (value - 30) / 10);
    return parseFloat(value);
  }

  function toDb(value, unit) {
    if (unit === 'watt') return 10 * Math.log10(value);
    if (unit === 'dbm' ) value -= 30;
    return parseFloat(value);
  }

  function checkForWatt(value, unit, name) {
    if (value <= 0 && unit === "watt") {
      showErrorBox(`Please enter valid value for ${name}`);
      throw new Error(`Invalid ${name}`);
    }
  }

  function checkForLEZ(value, name) {
    if (value <= 0) {
      showErrorBox(`Please enter valid value for ${name}`);
      throw new Error(`Invalid ${name}`);
    }
  }

  function checkForLs(value, unit) {
    if (unit === "watt" && value < 1) {
      showErrorBox(`Please enter valid value for Ls`);
      throw new Error(`Invalid Ls`);
    }
    if ((unit === "dB" && value < 0) || (unit === "dBm" && value + 30 < 0)) {
      showErrorBox(`Please enter valid value for Ls`);
      throw new Error(`Invalid Ls`);
    }
  }



  function calculateLp(d, dUnit, f, fUnit) {
    if (dUnit === 'm') d = d / 1000;
    if (fUnit === 'GHz') f *= 1e3;   
    if (fUnit === 'kHz') f /= 1e3;
    fForBody = f;
    dForBody = d;
    console.log(fForBody , dForBody);
    return 20 * Math.log10(d) + 20 * Math.log10(f) + 92.45;
}

  const gt = getValue("gt", "Transmitter Antenna Gain");
  const gtUnit = document.getElementById("gtUnit").value;
  checkForWatt(gt, gtUnit, "Transmitter Antenna Gain");
  const Gt = toDb(gt, gtUnit);

  const gr = getValue("gr", "Receiver Antenna Gain");
  const grUnit = document.getElementById("grUnit").value;
  checkForWatt(gr, grUnit, "Receiver Antenna Gain");
  const Gr = toDb(gr, grUnit);

  const ebn0 = getValue("eb/n0", "Eb/N0");
  checkForWatt(ebn0, "watt", "Eb/N0");

  const nf = getValue("nf", "Noise Figure");
  const nfUnit = document.getElementById("nfUnit").value;
  checkForLEZ(nf, "Noise Figure");
  const Nf = toLinear(nf, nfUnit);

  const getbr = getValue("br", "Bit Rate");
  const brUnit = document.getElementById("brUnit").value;
  const br = brUnit === "Kbps" ? getbr * 1000 : getbr;
  checkForLEZ(br, "Bit Rate");

  let d = getValue("d", "Distance");
  const dUnit = document.getElementById("distanceUnit").value;
  checkForLEZ(d, "Distance");

  let f = getValue("f", "Frequency");
  const freqUnit = document.getElementById("freqUnit").value;
  checkForLEZ(f, "Frequency");

  const ls = getValue("ls", "System Losses");
  const lsUnit = document.getElementById("lsUnit").value;
  checkForLs(ls, lsUnit);


  let M = getValue("m", "System Losses");
  
  const mUnit = document.getElementById("mUnit").value;
  M = toLinear(M , mUnit);
  // console.log(M , mUnit);
  // return;

  const Ls = toLinear(ls, lsUnit);
  const LS_db = toDb(ls, lsUnit);

  const prAnswerUnit = document.getElementById("prType").value;
  const ptAnswerUnit = document.getElementById("ptType").value;

  const Lp_dB = calculateLp(d, dUnit, f, freqUnit);
  console.log(Nf , br , ebn0 , k , T , M);
  let Pr = (Nf * br * ebn0 * k * T * M);
  console.log(Pr);

  if (Pr <= 0) {
    showErrorBox("Received power is too low or invalid");
    throw new Error("Received Power <= 0");
  }
  let Pr_db = toDb(Pr, "watt");
  let Pt = Pr_db - Gt - Gr + LS_db + Lp_dB;
  try {
    f = fForBody;
    d = dForBody;
    const response = await fetch('/link-budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Gt, Gr, ebn0, Nf, br, d, f, Ls, Pr_db, Pt, Lp_dB, M , grUnit,gtUnit, lsUnit, brUnit,nfUnit
      })
    });

    if (ptAnswerUnit === "dbm") {
      Pt -= 30; 
    } 
    else if (ptAnswerUnit === "watt") {
      Pt = Math.pow(10, Pt / 10);
    }

    if (prAnswerUnit === "dbm") {
      Pr = 10.0 * Math.log10(Pr) + 30;
    } else if (prAnswerUnit === "db") {
      Pr = 10.0 * Math.log10(Pr);
    }
    
    const data = await response.json();

    const stepsList = data.summary
      ? `<li>${data.summary}</li>` // نعرض النص داخل عنصر <li>
      : "<li>No steps found</li>";

    console.log(Pr);

    const explanation = `
      <strong>Received Power: ${Pr.toFixed(2)} ${prAnswerUnit}</strong><br><br>
      <strong>Transmitted Power: ${Pt.toFixed(2)} ${ptAnswerUnit}</strong><br><br>
      <strong>Summary:</strong>
      <ul>${stepsList}</ul><br>
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
