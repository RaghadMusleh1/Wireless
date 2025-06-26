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
      const text = await response.text(); // Need to await this call

      res.json({ summary: text });
    } catch (err) {
      console.error('Gemini Error:', err);
      res.status(500).json({ summary: 'Error generating summary with Gemini.' });
    }
});

app.post('/link-budget', async (req, res) => {
  const { Pt, Gt, Gr, d, f, Ls } = req.body;

  const prompt = `
Calculate the received power (Pr) using the following values:

Pt = ${Pt}
Gt = ${Gt}
Gr = ${Gr}
d = ${d} km
f = ${f} MHz
Ls = ${Ls}

Use the formulas:
Lp = 20 * log10(d) + 20 * log10(f) + 32.44
Pr = Pt + Gt + Gr - Lp - Ls

Return ONLY a raw JSON object like this:
{"summary": "Short explanation of the calculation", "value": Pr value as number}
Do NOT include \`\`\` or any formatting.
`;



  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    const jsonOutput = JSON.parse(text);

    res.json({
      pr: jsonOutput.value,
      summary: jsonOutput.summary
    });
  } catch (err) {
    console.error('Gemini Error:', err);
    res.status(500).json({ error: 'Failed to calculate Pr using Gemini.' });
  }
});



app.post('/cellular-system', async (req, res) => {
  const { totalBW, channelBW, numberOfCells, reuseFactor, cellRadius } = req.body;

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
    {
      "channelsPerCell": number,
      "systemCapacity": number,
      "reuseDistance": number,
      "summary": "Short explanation of the steps taken in the calculation"
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
