const fs = require('fs');

const content = fs.readFileSync('all_user_inputs.txt', 'utf8');

const regex = /export async function renderExploreScreen[\s\S]*?(?="})/g;
const matches = content.match(regex);

if (matches && matches.length > 0) {
  // get the longest one, which is likely the full file
  let longest = matches[0];
  for (let i = 1; i < matches.length; i++) {
    if (matches[i].length > longest.length) longest = matches[i];
  }
  
  // Also we need imports. Let's just find the first import in the same json block
  const blockRegex = /\{"step_index".*?renderExploreScreen.*?\}/g;
  const blocks = content.match(blockRegex);
  if (blocks) {
     const parsed = JSON.parse(blocks[blocks.length-1]);
     fs.writeFileSync('recovered_explore_full.js', parsed.content);
     console.log('Saved to recovered_explore_full.js');
  } else {
     fs.writeFileSync('recovered_explore_full.js', longest);
  }
} else {
  console.log('No matches found for renderExploreScreen in all_user_inputs.txt');
}
