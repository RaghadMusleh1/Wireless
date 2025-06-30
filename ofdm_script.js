let numSubcarriers;
let totalBitsPerSymbol;
let totalBitsPerRB;
let transmissionRate;
let transmissionRatebps;
let spectralEfficiency;


function calculateOFDM() {
  /*resource block bandwidth */
  const resourceBlockBandwidth = parseFloat(document.getElementById('rbBandwidth').value);
  if (isNaN(resourceBlockBandwidth) || resourceBlockBandwidth <= 0) {
    showErrorBox("Please enter a valid, positive resource block bandwidth value.");
    return;
  }

  /*subcarrier spacing */
  const subcarrierSpacing = parseFloat(document.getElementById('subcarrierSpacing').value);
  if (isNaN(subcarrierSpacing) || subcarrierSpacing <= 0) {
    showErrorBox("Please enter a valid, positive subcarrier spacing value.");
    return;
  }
  if (subcarrierSpacing > resourceBlockBandwidth) {
    showErrorBox("Subcarrier spacing cannot be greater than resource block bandwidth.");
    return;
  }
  if ((resourceBlockBandwidth / subcarrierSpacing) % 1 !== 0) {
    showErrorBox("Resource block bandwidth divided by subcarrier spacing must be an integer.");
    return;
  }

/* number of ofdm symbols per rb*/
  const numSymbols = parseInt(document.getElementById('numSymbols').value);
  if (isNaN(numSymbols) || numSymbols <= 0) {
    showErrorBox("Please enter a valid, positive number of OFDM symbols.");
    return;
  }

  /* rb duration */
  const rbDuration = parseFloat(document.getElementById('rbDuration').value);
  if (isNaN(rbDuration) || rbDuration <= 0) {
    showErrorBox("Please enter a valid, positive number of OFDM RB duration.");
    return;
  }

   /*modulation*/
  const modulationType = document.getElementById('modulationType').value;
  let bitsPerSubcarrier;
  switch (modulationType) {
    case 'QPSK':
      bitsPerSubcarrier = 2;
      break;
    case '16-QAM':
      bitsPerSubcarrier = 4;
      break;
    case '64-QAM':
      bitsPerSubcarrier = 6;
      break;
    case '1024-QAM':
      bitsPerSubcarrier = 10;
      break;
    default:
      bitsPerSubcarrier = null;
  }
  if (!bitsPerSubcarrier) {
    alert('Please select a modulation type.');
    return;
  }


  /* parallel rb  */
  const parallelBlocks = parseInt(document.getElementById('parallelBlocks').value);
  if (isNaN(parallelBlocks) || parallelBlocks <= 0) {
    showErrorBox("Please enter a valid, positive number of the resource blocks");
    return;
  }

  /* results */
  numSubcarriers = Math.floor(resourceBlockBandwidth / subcarrierSpacing);
  totalBitsPerSymbol = numSubcarriers * bitsPerSubcarrier;
  totalBitsPerRB = totalBitsPerSymbol * numSymbols;
  transmissionRate = (totalBitsPerRB * parallelBlocks)/ rbDuration; 
  transmissionRatebps = transmissionRate / 1000; // convert to Mbps
  spectralEfficiency = (transmissionRatebps*1000) / resourceBlockBandwidth ; // bps/Hz

}


/* connect to API*/
async function summarizeOFDM() {

  // Gather user inputs
  const rbBandwidth = document.getElementById('rbBandwidth').value;
  const subcarrierSpacing = document.getElementById('subcarrierSpacing').value;
  const numSymbols = document.getElementById('numSymbols').value;
  const rbDuration = document.getElementById('rbDuration').value;
  const modulationType = document.getElementById('modulationType').value;
  const parallelBlocks = document.getElementById('parallelBlocks').value;

  /*
  if ([rbBandwidth, subcarrierSpacing, numSymbols, rbDuration, modulationType,parallelBlocks].some(isNaN)) {
    showErrorBox("Please fill in all fields with valid numbers.");
    return;
  }*/
    

  calculateOFDM();
 
/*
  if ([numSubcarriers, totalBitsPerSymbol, totalBitsPerRB, transmissionRate, transmissionRatebps,spectralEfficiency].some(isNaN)) {
    showErrorBox("Please calculate the OFDM parameters first.");
    return;
  }*/

  // Send all data to the backend
  const response = await fetch('/summarizeofdm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        rbBandwidth,
        subcarrierSpacing,
        numSymbols,
        rbDuration,
        modulationType,
        parallelBlocks,
        numSubcarriers,
        totalBitsPerSymbol,
        totalBitsPerRB,
        transmissionRatebps,
        spectralEfficiency
    })
  });

  const data = await response.json();
  const summary = data.summary; 
  const explanation  = 
    `Number of Subcarriers: ${numSubcarriers} subcarriers<br>
    Total Bits per Symbol: ${totalBitsPerSymbol} bits/symbol<br>
    Total Bits per Resource Block: ${totalBitsPerRB} bits/RB<br>
    Max Transmission Rate: ${transmissionRatebps.toFixed(2)} Mbps<br>
    Spectral Efficiency: ${spectralEfficiency.toFixed(2)} bps/Hz<br>
    ${summary}<br><br>`;
  showResultBox(explanation);
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
window.summarizeOFDM = summarizeOFDM;
window.closeErrorBox = closeErrorBox;
window.closeResultBox = closeResultBox;
