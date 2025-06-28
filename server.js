const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;

const apiKey = 'AIzaSyDLEh-QO5r7b9CGRD7oEkv-3sJb2VzkxZU';
const genAI = new GoogleGenerativeAI(apiKey);

app.use(cors());
app.use(bodyParser.json());


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(express.static(__dirname));


//wireless system API
app.post('/summarize', async (req, res) => {
  const {bandwidth,
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
          modulationOut } = req.body;

  const prompt = `
  Given the following wireless system parameters:
  - Bandwidth: ${bandwidth} kHz
  - Quantizer bits: ${quantizer}
  - Source rate (Rs): ${Rs} kbps
  - Channel coding rate (Rc): ${Rc}
  - Modulation type: ${modulationType}
  - Nyquist rate: ${nyquistRate} kHz
  - Quantizer output rate: ${quantizerRes} kbps
  - Source encoder output: ${srcEncoderRes} kbps
  - Channel encoder output: ${channelEncoderOut} kbps
  - Interleaver output: ${interleaverOut} kbps
  - Burst formatting output: ${burstFormattingOut} kbps
  - Modulation output (symbol rate): ${modulationOut} ksym/s

  Write a short, 5-step summary of how data flows through this system. For each stage, briefly mention what happens and show the data rate before and after.
  Use simple language for a student to understand.
  Number the steps and keep it short.
  `;


  try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); 
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text(); // Need to await this call

      res.json({ summary: text });
    } catch (err) {
      console.error('Gemini Error:', err);
      res.status(500).json({ summary: 'Error generating summary with Gemini.' });
    }
});



//OFDM system
app.post('/summarizeofdm', async (req, res) => {
  const { rbBandwidth,
          subcarrierSpacing,
          numSymbols,
          rbDuration,
          modulationType,
          parallelBlocks,
          numSubcarriers,
          totalBitsPerSymbol,
          totalBitsPerRB,
          transmissionRatebps } = req.body;

  const prompt = `
  Given the following OFDM system parameters:
  inputs:
  - resource block Bandwidth: ${rbBandwidth} kHz
  - Subcarrier spacing: ${subcarrierSpacing} khz
  - number of ofdm symbols per resource block: ${numSymbols} 
  - resource block duration: ${rbDuration}
  - Modulation type: ${modulationType}
  - number of parallel  resource blocks that are used for transmission: ${parallelBlocks}

  outputs:
  - number of subcarriers: ${numSubcarriers}
  - total bits per ofdm symbol: ${totalBitsPerSymbol} 
  - total bits per resource block: ${totalBitsPerRB} 
  - Max transmission rate based on the parallel resource blocks: ${transmissionRatebps} Mbps

  Write a short, 5-step summary of how data flows through this system and the numbers after each step. 
  Use simple language for a student to understand.
  Number the steps and keep it short.
  `;


  try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); 
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();

      res.json({ summary: text });
    } catch (err) {
      console.error('Gemini Error:', err);
      res.status(500).json({ summary: 'Error generating summary with Gemini.' });
    }
});


app.post('/link-budget', async (req, res) => {
  let { Pt, Gt, Gr, d, f, Ls, lsUnit, freqUnit, dUnit, grUnit, gtUnit, ptUnit, unitType} = req.body;

  if (dUnit === 'm') d = d / 1000;

  if (freqUnit === 'GHz') f = f * 1000;
  if (freqUnit === 'KHz') f = f / 1000;

  const toDbm = (value, unit) => {
    if (unit === 'watt') return 10 * Math.log10(value * 1000);
    if (unit === 'dbm') return v - 30; 
    return parseFloat(value); 
  };

  Pt = toDbm(Pt, ptUnit);
  Gt = toDbm(Gt, gtUnit);
  Gr = toDbm(Gr, grUnit);
  Ls = toDbm(Ls, lsUnit);

  const Lp = 20 * Math.log10(d) + 20 * Math.log10(f) + 32.44;
  const Pr = Pt + Gt + Gr - Lp - Ls;

  if (unitType === 'dbm') Pr = Pr + 30;
  if (unitType === 'watt') Pr = Math.pow(10, (Pr + 30) / 10) / 1000;

  const prompt = `
  Inputs for received power (Pr) calculation:

  Pt = ${Pt}
  Gt = ${Gt}
  Gr = ${Gr}
  d = ${d} km
  f = ${f} MHz
  Ls = ${Ls}

  The formulas used are:
  Lp = 20 * log10(d) + 20 * log10(f) + 32.44
  Pr = Pt + Gt + Gr - Lp - Ls

  Write a short, 2-step summary of how data flows through this system and the numbers after each step.
  Use simple language for a student to understand.
  Number the steps clearly and return ONLY a raw JSON object with the following fields and no extra text or formatting:
  {
    "summary": [
      "Step 1: description with value",
      "Step 2: description with value",
    ],
    "pr" : ${Pr}
  }`;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = (await response.text()).trim();

      const cleanedText = text
        .replace(/```json\s*/g, '')
        .replace(/```/g, '');

      let data;
      try {
        data = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("JSON Parse Error:", cleanedText);
        return res.status(500).json({ error: "Failed to parse Gemini response." });
      }

      res.json(data);
    } catch (err) {
      console.error("Gemini API Error:", err);
      res.status(500).json({ error: "Gemini API failed" });
    }
});





app.post('/cellular-system', async (req, res) => {
  let {
    totalBW, totalBwUnit,
    channelBW, chUnit,
    numberOfCells,
    reuseFactor,
    cellRadius, rUnit
  } = req.body;

  const unitToHz = {
    Hz: 1,
    KHz: 1e3,
    MHz: 1e6
  };

  const unitToMeters = {
    m: 1,
    km: 1000
  };

  totalBW = parseFloat(totalBW) * (unitToHz[totalBwUnit] || 1);
  channelBW = parseFloat(channelBW) * (unitToHz[chUnit] || 1);
  cellRadius = parseFloat(cellRadius) * (unitToMeters[rUnit] || 1);
  numberOfCells = parseFloat(numberOfCells);
  reuseFactor = parseFloat(reuseFactor);

  if ([totalBW, channelBW, numberOfCells, reuseFactor, cellRadius].some(v => isNaN(v))) {
    return res.status(400).json({ error: "Invalid input values" });
  }

  const prompt = `
    Please perform the following cellular system calculations using the values below:

    Total System Bandwidth = ${totalBW} Hz  
    Channel Bandwidth = ${channelBW} Hz  
    Number of Cells = ${numberOfCells}  
    Reuse Factor (N) = ${reuseFactor}  
    Cell Radius = ${cellRadius} meters  

    Formulas to use:
    1. Number of Channels per Cell = Total Bandwidth / Channel Bandwidth  
    2. Total System Capacity = Number of Channels per Cell × Number of Cells  
    3. Frequency Reuse Distance (D) = Cell Radius × sqrt(3 × N)  

    Return ONLY a raw JSON object with the following fields (no markdown or code formatting):
    Write a short, 3-step summary of how data flows through this system and add the formula for each step. 
    Use simple language for a student to understand.
    Number the steps and keep it short.
    
    {
      "channelsPerCell": number,
      "systemCapacity": number,
      "reuseDistance": number,
      "steps": [
        "Step 1: Explain how you got channels per cell...",
        "Step 2: Explain how you got total system capacity...",
        "Step 3: Explain how you got reuse distance..."
      ]
    }
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = (await response.text()).trim();

    const cleanedText = text
      .replace(/```json\s*/g, '')
      .replace(/```/g, '');

    const data = JSON.parse(cleanedText);

    res.json(data);
  } catch (err) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: "Gemini API failed" });
  }
});






app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
