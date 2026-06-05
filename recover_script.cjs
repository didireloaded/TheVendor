const fs = require('fs');
const lines = fs.readFileSync('C:/Users/PC/.gemini/antigravity-ide/scratch/the-vendor/explore_hits.txt', 'utf8').split('\n');
let lastExploreCode = null;

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const parsed = JSON.parse(line);
    if (parsed.tool_calls) {
      for (const call of parsed.tool_calls) {
         if ((call.name === 'default_api:write_to_file' || call.name === 'default_api:replace_file_content' || call.name === 'default_api:multi_replace_file_content') && call.arguments) {
            if (call.arguments.TargetFile && call.arguments.TargetFile.endsWith('explore.js')) {
               if (call.arguments.CodeContent) lastExploreCode = call.arguments.CodeContent;
               if (call.arguments.ReplacementContent) {
                   // This is a partial replace, so we shouldn't overwrite the whole file with it.
                   // Actually we want the LAST write_to_file
               }
            }
         }
      }
    }
  } catch (e) {}
}

if (lastExploreCode) {
  fs.writeFileSync('C:/Users/PC/.gemini/antigravity-ide/scratch/the-vendor/js/screens/explore.js', lastExploreCode);
  console.log('Successfully recovered explore.js');
} else {
  // Let's just dump all the ReplacementContent to a file to reconstruct it manually
  let allReplaces = '';
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const parsed = JSON.parse(line);
      if (parsed.tool_calls) {
        for (const call of parsed.tool_calls) {
          if (call.arguments && call.arguments.ReplacementContent) {
            allReplaces += call.arguments.ReplacementContent + '\n\n=====================\n\n';
          }
          if (call.arguments && call.arguments.CodeContent) {
            allReplaces += call.arguments.CodeContent + '\n\n=====================\n\n';
          }
        }
      }
    } catch (e) {}
  }
  fs.writeFileSync('C:/Users/PC/.gemini/antigravity-ide/scratch/the-vendor/replaces.txt', allReplaces);
  console.log('Dumped to replaces.txt');
}
