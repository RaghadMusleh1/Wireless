//wireless system script  

function calculate(){

     /*sampler*/
    const bandwidth = parseFloat(document.getElementById('bandwidth').value);
    if (isNaN(bandwidth) || bandwidth <= 0) {
      showErrorBox("Please enter a valid, positive bandwidth value.");
      return false;
    }
    const nyquistRate = bandwidth * 2;
    document.getElementById('result').textContent = 
      `Minimum Sampling Rate (Nyquist Rate): ${nyquistRate} kHz`;

       /*quantizer*/
    const quantizerBits = parseInt(document.getElementById('quantizer').value);
    if (isNaN(quantizerBits) || quantizerBits < 1) {
      showErrorBox("Please enter a valid number of quantizer bits."); 
      return false;
    }
    const quantizerOutput = quantizerBits * nyquistRate
    document.getElementById('quantizer_res').textContent = 
      ` Quantizer Output Rate: ${quantizerOutput} kbps`;

    /*source encoder*/
    const Rs_input = document.getElementById('Rs').value.trim();
    let Rs;
    if (Rs_input.includes('/')) {
      const parts = Rs_input.split('/');
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parseFloat(parts[1]) !== 0) {
        Rs = parseFloat(parts[0]) / parseFloat(parts[1]);
      } else {
        showErrorBox("Please enter a valid Rs value (e.g., 0.5 or 1/2).");
        return false;
      }
    } else {
      Rs = parseFloat(Rs_input);
      if (isNaN(Rs) || Rs < 0) {
        showErrorBox("Please enter a valid Rs value (e.g., 0.5 or 1/2).");
        return false;
      }
    }
    const src_encoder_out = quantizerOutput * Rs;
    document.getElementById('src_encoder_res').textContent = 
      ` Source Encoder Output Rate: ${src_encoder_out} kbps`;


      /*channel encoder*/
    const Rc_input = document.getElementById('Rc').value.trim();
    let Rc;
    if (Rc_input.includes('/')) {
      const parts = Rc_input.split('/');
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parseFloat(parts[1]) !== 0) {
        Rc = parseFloat(parts[1]) / parseFloat(parts[0]);
      } else {
        showErrorBox("Please enter a valid Rc value (e.g. 1/2).");
        return false;
      }
    } else {
      Rc = parseFloat(Rc_input);
      if (isNaN(Rc) || Rc < 0) {
        showErrorBox("Please enter a valid Rc value (e.g. 1/2).");
        return false;
      }
    }
    const channel_encoder_out = src_encoder_out * Rc;
    document.getElementById('channel_encoder_out').textContent = 
      ` Channel Encoder Output Rate: ${channel_encoder_out} kbps`;
    
      /*interleaver*/
    const interleaver_out = channel_encoder_out; // interleaver does not change the rate
    document.getElementById('interleaver_out').textContent = 
      ` Interleaver Output Rate: ${interleaver_out} kbps`;


     /*burst formatting - GSM */

    // GSM burst formatting: each time slot = 114 data bits, data rate per time slot = 270.833 kbps
    // Calculate how many time slots are needed to carry the interleaver output rate
    const timeslotsNeeded = interleaver_out / 114;
    // Total burst formatting output rate is timeslotsNeeded * 270.833 kbps (same as interleaver_out)
    const burst_formatting_out = timeslotsNeeded * 270.833;
    //const burst_formatting_out = ;
    document.getElementById('burst_formatting_out').textContent =
      ` Burst Formatting Output Rate: ${burst_formatting_out.toFixed(2)} kbps`;


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
      showErrorBox('Please select a modulation type.');
      return false;
    }

    // Data rate after modulation (remains in kbps)
    const dataRateAfterModulation = burst_formatting_out ; // kbps
    return true;

    /*
    document.getElementById('modulation_out').textContent =
      ` Data Rate After Modulation: ${dataRateAfterModulation.toFixed(2)} kbps (${bitsPerSymbol} bits/symbol)`;
*/
  }

   /* connect to API*/
  async function summarizeProcess() {

    const success = calculate(); // returns true or false
    if (!success) {
      return; // Stop if calculation failed
    }
    
    // Gather user inputs
    const bandwidth = document.getElementById('bandwidth').value;
    const quantizer = document.getElementById('quantizer').value;
    const Rs = document.getElementById('Rs').value;
    const Rc = document.getElementById('Rc').value;
    const modulationType = document.getElementById('modulationType').value;

    /*
    if ([bandwidth, quantizer, Rs, Rc, modulationType].some(isNaN)) {
      showErrorBox("Please fill in all fields with valid numbers.");
      return;
    }*/

    // Gather calculated results
    const nyquistRate = document.getElementById('result').textContent;
    const quantizerRes = document.getElementById('quantizer_res').textContent;
    const srcEncoderRes = document.getElementById('src_encoder_res').textContent;
    const channelEncoderOut = document.getElementById('channel_encoder_out').textContent;
    const interleaverOut = document.getElementById('interleaver_out').textContent;
    const burstFormattingOut = document.getElementById('burst_formatting_out').textContent;
    const modulationOut = document.getElementById('modulation_out') ? document.getElementById('modulation_out').textContent : '';

    /*
    if ([nyquistRate, quantizerRes, srcEncoderRes, channelEncoderOut, interleaverOut,burstFormattingOut].some(isNaN)) {
      showErrorBox("Please calculate the system parameters first.");
      return;
    }*/


      // Send all data to the backend
    const response = await fetch('/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bandwidth,
          quantizer,
          Rs,
          Rc,
          modulationType,
          nyquistRate,
          quantizerRes,
          srcEncoderRes,
          channelEncoderOut,
          interleaverOut,
          burstFormattingOut,
          modulationOut
      })
    });

    const data = await response.json();
    const summary = data.summary; 
    showResultBox(summary);
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
window.summarizeProcess = summarizeProcess;
window.closeErrorBox = closeErrorBox;
window.closeResultBox = closeResultBox;
