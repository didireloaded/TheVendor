const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\PC\\.gemini\\antigravity\\brain';

function findExploreJs() {
  const dirs = fs.readdirSync(brainDir);
  for (const dir of dirs) {
    const transcriptPath = path.join(brainDir, dir, '.system_generated', 'logs', 'transcript.jsonl');
    if (fs.existsSync(transcriptPath)) {
      const content = fs.readFileSync(transcriptPath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.includes('explore.js') && line.includes('CodeContent')) {
           try {
             const parsed = JSON.parse(line);
             if (parsed.tool_calls) {
                for (const call of parsed.tool_calls) {
                   if (call.name === 'default_api:write_to_file' && call.arguments && call.arguments.TargetFile && call.arguments.TargetFile.endsWith('explore.js')) {
                      fs.writeFileSync('recovered_explore_from_agent.js', call.arguments.CodeContent);
                      console.log('Recovered explore.js from agent tool call in conversation: ' + dir);
                      return;
                   }
                }
             }
           } catch (e) {}
        }
      }
    }
  }
  console.log('Not found in write_to_file. Checking replace_file_content...');
  // check for replace_file_content if write_to_file fails
}

findExploreJs();
