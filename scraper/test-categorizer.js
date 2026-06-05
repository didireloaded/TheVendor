import { categorizeVendor } from './categorizer.js';

async function runTest() {
    console.log('Testing categorization...');
    const result = await categorizeVendor('CreativeLAB', 'Photographers Windhoek Namibia');
    console.log(result);
}

runTest();
