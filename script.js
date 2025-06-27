//wireless system script  
  
  function goTo(page) {
      window.location.href = page;
  }

  document.getElementById('wirelessForm').addEventListener('submit', function(e) {
    e.preventDefault();
     /*sampler*/
    const bandwidth = parseFloat(document.getElementById('bandwidth').value);
    if (isNaN(bandwidth) || bandwidth <= 0) {
      document.getElementById('result').textContent = "Please enter a valid, positive bandwidth value.";
      return;
    }
    const nyquistRate = bandwidth * 2;
    document.getElementById('result').textContent = 
      `Minimum Sampling Rate (Nyquist Rate): ${nyquistRate} kHz`;

       /*quantizer*/
    const quantizerBits = parseInt(document.getElementById('quantizer').value);
    if (isNaN(quantizerBits) || quantizerBits < 1) {
      document.getElementById('result').textContent = 
        " | Please enter a valid number of quantizer bits.";
      return;
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
        document.getElementById('src_encoder_res').textContent = "Please enter a valid Rs value (e.g., 0.5 or 1/2).";
        return;
      }
    } else {
      Rs = parseFloat(Rs_input);
      if (isNaN(Rs) || Rs < 0) {
        document.getElementById('src_encoder_res').textContent = "Please enter a valid Rs value (e.g., 0.5 or 1/2).";
        return;
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
        document.getElementById('channel_encoder_out').textContent = "Please enter a valid Rc value (e.g. 1/2).";
        return;
      }
    } else {
      Rc = parseFloat(Rc_input);
      if (isNaN(Rc) || Rc < 0) {
        document.getElementById('channel_encoder_out').textContent = "Please enter a valid Rc value (e.g. 1/2).";
        return;
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
    let bitsPerSymbol;
    switch (modulationType) {
      case 'QPSK':
      bitsPerSymbol = 2;
      break;
      case '16-QAM':
      bitsPerSymbol = 4;
      break;
      case '64-QAM':
      bitsPerSymbol = 6;
      break;
      default:
      bitsPerSymbol = null;
    }

    if (!bitsPerSymbol) {
      alert('Please select a modulation type.');
      return;
    }

    // Data rate after modulation (remains in kbps)
    const dataRateAfterModulation = burst_formatting_out ; // kbps

    if (!document.getElementById('modulation_out')) {
      const modDiv = document.createElement('div');
      modDiv.id = 'modulation_out';
      modDiv.className = 'output';
      document.querySelector('.mb-4').appendChild(modDiv);
    }
    document.getElementById('modulation_out').textContent =
      ` Data Rate After Modulation: ${dataRateAfterModulation.toFixed(2)} kbps (${bitsPerSymbol} bits/symbol)`;

  });

   /* connect to API*/
    async function summarizeProcess() {
      // Gather user inputs
      const bandwidth = document.getElementById('bandwidth').value;
      const quantizer = document.getElementById('quantizer').value;
      const Rs = document.getElementById('Rs').value;
      const Rc = document.getElementById('Rc').value;
      const modulationType = document.getElementById('modulationType').value;

      // Gather calculated results
      const nyquistRate = document.getElementById('result').textContent;
      const quantizerRes = document.getElementById('quantizer_res').textContent;
      const srcEncoderRes = document.getElementById('src_encoder_res').textContent;
      const channelEncoderOut = document.getElementById('channel_encoder_out').textContent;
      const interleaverOut = document.getElementById('interleaver_out').textContent;
      const burstFormattingOut = document.getElementById('burst_formatting_out').textContent;
      const modulationOut = document.getElementById('modulation_out') ? document.getElementById('modulation_out').textContent : '';

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
      document.getElementById('summary').innerText = data.summary;
    }