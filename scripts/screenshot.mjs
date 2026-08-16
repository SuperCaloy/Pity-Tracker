import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function capture() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  
  console.log('Navigating to localhost:3000...');
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Give motion/react animations a moment to settle
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const outPath = join(__dirname, '..', 'screenshot.png');
    await page.screenshot({ path: outPath, fullPage: true });
    
    console.log(`Screenshot saved to ${outPath}`);
  } catch (err) {
    console.error('Failed to capture:', err);
  } finally {
    await browser.close();
  }
}

capture();
