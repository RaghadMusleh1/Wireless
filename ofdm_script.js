function goTo(page) {
  window.location.href = page;
}

let numSubcarriers;
let totalBitsPerSymbol;
let totalBitsPerRB;
let transmissionRate;
let transmissionRatebps;

document.getElementById('ofdmForm').addEventListener('submit', function(e) {
  e.preventDefault();
  

  /*resource block bandwidth */
  const resourceBlockBandwidth = parseFloat(document.getElementById('rbBandwidth').value);
  if (isNaN(resourceBlockBandwidth) || resourceBlockBandwidth <= 0) {
    document.getElementById('result').textContent = "Please enter a valid, positive resource block bandwidth value.";
    return;
  }

  /*subcarrier spacing */
  const subcarrierSpacing = parseFloat(document.getElementById('subcarrierSpacing').value);
  if (isNaN(subcarrierSpacing) || subcarrierSpacing <= 0) {
    document.getElementById('result').textContent = "Please enter a valid, positive subcarrier spacing value.";
    return;
  }
  if (subcarrierSpacing > resourceBlockBandwidth) {
    document.getElementById('result').textContent = "Subcarrier spacing cannot be greater than resource block bandwidth.";
    return;
  }
  if ((resourceBlockBandwidth / subcarrierSpacing) % 1 !== 0) {
    document.getElementById('result').textContent = "Resource block bandwidth divided by subcarrier spacing must be an integer.";
    return;
  }

/* number of ofdm symbols per rb*/
  const numSymbols = parseInt(document.getElementById('numSymbols').value);
  if (isNaN(numSymbols) || numSymbols <= 0) {
    document.getElementById('result').textContent = "Please enter a valid, positive number of OFDM symbols.";
    return;
  }

  /* rb duration */
  const rbDuration = parseFloat(document.getElementById('rbDuration').value);
  


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
  if (isNaN(rbDuration) || rbDuration <= 0) {
    document.getElementById('result').textContent = "Please enter a valid, positive number of the resource blocks";
    return;
  }

  /* results */
  numSubcarriers = Math.floor(resourceBlockBandwidth / subcarrierSpacing);
  totalBitsPerSymbol = numSubcarriers * bitsPerSubcarrier;
  totalBitsPerRB = totalBitsPerSymbol * numSymbols;
  transmissionRate = (totalBitsPerRB * parallelBlocks)/ rbDuration; 
  transmissionRatebps = transmissionRate / 1000; // convert to kbps

  document.getElementById('outputs').innerHTML = 
    `Number of Subcarriers: ${numSubcarriers} subcarriers<br>
    Total Bits per Symbol: ${totalBitsPerSymbol} bits/symbol<br>
    Total Bits per Resource Block: ${totalBitsPerRB} bits<br>
    Max Transmission Rate: ${transmissionRatebps.toFixed(2)} Mbps`;

});



/* connect to API*/
    async function summarizeOFDM() {
      // Gather user inputs
      const rbBandwidth = document.getElementById('rbBandwidth').value;
      const subcarrierSpacing = document.getElementById('subcarrierSpacing').value;
      const numSymbols = document.getElementById('numSymbols').value;
      const rbDuration = document.getElementById('rbDuration').value;
      const modulationType = document.getElementById('modulationType').value;
      const parallelBlocks = document.getElementById('parallelBlocks').value;

      //calculated values
      numSubcarriers;
      totalBitsPerSymbol;
      totalBitsPerRB;
      transmissionRate;
      transmissionRatebps;

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
          transmissionRatebps
        })
      });

      const data = await response.json();
      document.getElementById('summary').innerText = data.summary;
    }