const fs = require('fs');

const lines = fs.readFileSync('C:/Users/PC/.gemini/antigravity-ide/scratch/the-vendor/explore_hits.txt', 'utf8').split('\n');
for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const parsed = JSON.parse(line);
    if (parsed.tool_calls) {
      for (const call of parsed.tool_calls) {
        if (call.name === 'replace_file_content' && call.args && call.args.TargetFile && call.args.TargetFile.includes('explore.js')) {
          if (call.args.ReplacementContent) {
            fs.writeFileSync('C:/Users/PC/.gemini/antigravity-ide/scratch/the-vendor/js/screens/explore.js', call.args.ReplacementContent);
            console.log('Restored explore.js');
            return;
          }
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
}
