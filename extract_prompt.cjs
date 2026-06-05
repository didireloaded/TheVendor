const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('C:\\\\Users\\\\PC\\\\.gemini\\\\antigravity\\\\brain\\\\2bb5d9c6-1a6e-47cd-8fb5-eb8cb4626f20\\\\.system_generated\\\\logs\\\\transcript.jsonl');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.type === 'USER_INPUT' && parsed.content && parsed.content.includes('explore.js')) {
        console.log("FOUND USER INPUT WITH explore.js:");
        console.log("Length:", parsed.content.length);
        fs.writeFileSync('C:\\Users\\PC\\.gemini\\antigravity-ide\\scratch\\the-vendor\\recovered_explore.txt', parsed.content);
        return;
      }
    } catch (e) {}
  }
  console.log("Not found in current transcript. Checking older ones...");
}

processLineByLine();
