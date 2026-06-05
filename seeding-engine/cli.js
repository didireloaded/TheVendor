import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import { scrapeVendors } from './scraper.js';
import { enrichVendor } from './llm-tagger.js';
import { isDuplicate } from './deduplication.js';

const argv = yargs(hideBin(process.argv))
  .option('category', {
    alias: 'c',
    type: 'string',
    description: 'The category to scrape for (e.g. "Photography")',
    demandOption: true
  })
  .option('location', {
    alias: 'l',
    type: 'string',
    description: 'Location to scrape (default: Windhoek)',
    default: 'Windhoek'
  })
  .option('limit', {
    alias: 'n',
    type: 'number',
    description: 'Number of vendors to process',
    default: 5
  })
  .parse();

async function run() {
  console.log(chalk.blue.bold('\n🚀 The Vendor - Seeding Engine Started'));
  console.log(chalk.gray(`Target: ${argv.category} in ${argv.location}\n`));

  const spinner = ora('Scraping web directories...').start();
  
  try {
    // Step 1: Scrape
    const rawVendors = await scrapeVendors(argv.category, argv.location, argv.limit);
    spinner.succeed(`Found ${rawVendors.length} potential vendors.`);

    const newVendors = [];

    // Step 2 & 3: Deduplicate & Enrich
    for (const raw of rawVendors) {
      const stepSpinner = ora(`Processing: ${raw.name}`).start();
      
      const duplicate = await isDuplicate(raw);
      if (duplicate) {
        stepSpinner.warn(chalk.yellow(`Skipped (Duplicate): ${raw.name}`));
        continue;
      }

      stepSpinner.text = `Enriching via LLM: ${raw.name}...`;
      const enriched = await enrichVendor(raw, argv.category);
      
      if (enriched) {
        newVendors.push(enriched);
        stepSpinner.succeed(chalk.green(`Drafted: ${enriched.name} (${enriched.category})`));
      } else {
        stepSpinner.fail(chalk.red(`Failed to enrich: ${raw.name}`));
      }
    }

    // Step 4: Output
    if (newVendors.length > 0) {
      const queueDir = path.join(process.cwd(), 'queue');
      await fs.mkdir(queueDir, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outfile = path.join(queueDir, `drafts-${argv.category.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${timestamp}.json`);
      
      await fs.writeFile(outfile, JSON.stringify(newVendors, null, 2));
      console.log(chalk.blue.bold(`\n✅ Saved ${newVendors.length} draft vendors to ${outfile}`));
      console.log(chalk.gray(`Admins can now review these drafts in the Moderation Queue UI.`));
    } else {
      console.log(chalk.yellow('\n⚠️ No new vendors were drafted.'));
    }

  } catch (err) {
    spinner.fail(chalk.red('An error occurred during the seeding process.'));
    console.error(err);
  }
}

run();
