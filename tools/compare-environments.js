#!/usr/bin/env node

/**
 * Environment Comparison Tool
 * This script compares the local and staging environments and generates a report
 * on the differences, focusing on helping diagnose issues like the white screen.
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

// Define our environments
const environments = [
  { name: 'local', url: 'https://mbnyc.local/' },
  { name: 'staging', url: 'https://mbnycd.wpenginepowered.com/' }
];

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../environment-reports');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get current date and time for report filenames
const dateTime = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');

async function compareEnvironments() {
  console.log('Starting environment comparison...');
  const browser = await chromium.launch();
  const results = {
    timestamp: new Date().toISOString(),
    environments: {},
    differences: {
      css: [],
      js: [],
      elements: [],
      headers: []
    }
  };

  try {
    // Collect data from each environment
    for (const env of environments) {
      console.log(`Analyzing ${env.name} environment at ${env.url}`);
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Navigate to the site and wait for it to load
      const response = await page.goto(env.url, { 
        timeout: 60000,
        waitUntil: 'networkidle'
      });
      
      // Capture headers
      const headers = response.headers();
      
      // Capture page stats
      const url = page.url();
      const status = response.status();
      
      // Get body content
      const bodyContent = await page.evaluate(() => document.body.innerText);
      const htmlContent = await page.content();
      
      // Get all scripts and stylesheets
      const scripts = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('script'))
          .map(s => ({ 
            src: s.src || 'inline', 
            type: s.type || 'text/javascript',
            content: s.innerText ? s.innerText.substring(0, 100) + '...' : ''
          }));
      });
      
      const stylesheets = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
          .map(s => ({ href: s.href, media: s.media }));
      });
      
      // Get console logs
      const consoleLogs = [];
      page.on('console', msg => {
        consoleLogs.push({
          type: msg.type(),
          text: msg.text()
        });
      });
      
      // Take screenshot
      const screenshotPath = path.join(outputDir, `${env.name}-${dateTime}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      
      // Save HTML
      const htmlPath = path.join(outputDir, `${env.name}-${dateTime}.html`);
      fs.writeFileSync(htmlPath, htmlContent);
      
      // Store collected data
      results.environments[env.name] = {
        url,
        status,
        headers,
        bodyContentLength: bodyContent.length,
        scripts: scripts.length,
        stylesheets: stylesheets.length,
        consoleLogs,
        scripts,
        stylesheets,
        screenshotPath,
        htmlPath
      };
      
      await context.close();
    }
    
    // Compare the environments
    console.log('Comparing environments...');
    
    const local = results.environments.local;
    const staging = results.environments.staging;
    
    // Compare stylesheets
    const localStylesheets = new Set(local.stylesheets.map(s => path.basename(s.href)));
    const stagingStylesheets = new Set(staging.stylesheets.map(s => path.basename(s.href)));
    
    for (const sheet of localStylesheets) {
      if (!stagingStylesheets.has(sheet)) {
        results.differences.css.push(`Stylesheet ${sheet} exists in local but not in staging`);
      }
    }
    
    for (const sheet of stagingStylesheets) {
      if (!localStylesheets.has(sheet)) {
        results.differences.css.push(`Stylesheet ${sheet} exists in staging but not in local`);
      }
    }
    
    // Compare scripts
    const localScripts = new Set(local.scripts.filter(s => s.src !== 'inline').map(s => path.basename(s.src)));
    const stagingScripts = new Set(staging.scripts.filter(s => s.src !== 'inline').map(s => path.basename(s.src)));
    
    for (const script of localScripts) {
      if (!stagingScripts.has(script)) {
        results.differences.js.push(`Script ${script} exists in local but not in staging`);
      }
    }
    
    for (const script of stagingScripts) {
      if (!localScripts.has(script)) {
        results.differences.js.push(`Script ${script} exists in staging but not in local`);
      }
    }
    
    // Compare HTTP headers
    const localHeaders = Object.keys(local.headers);
    const stagingHeaders = Object.keys(staging.headers);
    
    for (const header of localHeaders) {
      if (!staging.headers[header]) {
        results.differences.headers.push(`Header ${header} exists in local but not in staging`);
      } else if (local.headers[header] !== staging.headers[header]) {
        results.differences.headers.push(`Header ${header} differs: local="${local.headers[header]}", staging="${staging.headers[header]}"`);
      }
    }
    
    // Generate summary
    results.summary = {
      localStatus: local.status,
      stagingStatus: staging.status,
      localBodySize: local.bodyContentLength,
      stagingBodySize: staging.bodyContentLength,
      cssDifferences: results.differences.css.length,
      jsDifferences: results.differences.js.length,
      headerDifferences: results.differences.headers.length
    };
    
    // Save report
    const reportPath = path.join(outputDir, `environment-comparison-${dateTime}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    
    // Generate HTML report
    const htmlReport = generateHtmlReport(results);
    const htmlReportPath = path.join(outputDir, `environment-comparison-${dateTime}.html`);
    fs.writeFileSync(htmlReportPath, htmlReport);
    
    console.log(`✅ Comparison complete! Reports saved to ${outputDir}`);
    console.log(`📊 HTML Report: ${htmlReportPath}`);
    
    // Print summary to console
    console.log('\n--- COMPARISON SUMMARY ---');
    console.log(`Local status: ${local.status}, body size: ${local.bodyContentLength} chars`);
    console.log(`Staging status: ${staging.status}, body size: ${staging.bodyContentLength} chars`);
    console.log(`CSS differences: ${results.differences.css.length}`);
    console.log(`JS differences: ${results.differences.js.length}`);
    console.log(`Header differences: ${results.differences.headers.length}`);
    
    if (staging.bodyContentLength < 100) {
      console.log('\n⚠️ WARNING: Staging site has very little content (possible white screen)');
    }
    
  } catch (error) {
    console.error('Error during comparison:', error);
  } finally {
    await browser.close();
  }
}

function generateHtmlReport(results) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Environment Comparison Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #222;
    }
    .summary {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    .warning {
      background-color: #fff3cd;
      color: #856404;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    .environments {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }
    .environment {
      flex: 1;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .differences ul {
      padding-left: 20px;
    }
    .differences li {
      margin-bottom: 5px;
    }
    .screenshots {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
    .screenshot {
      border: 1px solid #ddd;
      padding: 10px;
      border-radius: 4px;
      text-align: center;
    }
    .screenshot img {
      max-width: 100%;
      height: auto;
      margin-top: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    table, th, td {
      border: 1px solid #ddd;
    }
    th, td {
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f8f9fa;
    }
  </style>
</head>
<body>
  <h1>Environment Comparison Report</h1>
  <p>Generated on ${new Date(results.timestamp).toLocaleString()}</p>
  
  <div class="summary">
    <h2>Summary</h2>
    <p>Local status: ${results.environments.local.status}, Content length: ${results.environments.local.bodyContentLength} chars</p>
    <p>Staging status: ${results.environments.staging.status}, Content length: ${results.environments.staging.bodyContentLength} chars</p>
    <p>CSS differences: ${results.differences.css.length}</p>
    <p>JS differences: ${results.differences.js.length}</p>
    <p>Header differences: ${results.differences.headers.length}</p>
  </div>
  
  ${results.environments.staging.bodyContentLength < 100 ? `
  <div class="warning">
    <strong>⚠️ Warning:</strong> Staging site has very little content (${results.environments.staging.bodyContentLength} chars). This may indicate a white screen issue.
  </div>
  ` : ''}
  
  <div class="environments">
    <div class="environment">
      <h3>Local Environment</h3>
      <p>URL: ${results.environments.local.url}</p>
      <p>Status: ${results.environments.local.status}</p>
      <p>Scripts: ${results.environments.local.scripts.length}</p>
      <p>Stylesheets: ${results.environments.local.stylesheets.length}</p>
    </div>
    
    <div class="environment">
      <h3>Staging Environment</h3>
      <p>URL: ${results.environments.staging.url}</p>
      <p>Status: ${results.environments.staging.status}</p>
      <p>Scripts: ${results.environments.staging.scripts.length}</p>
      <p>Stylesheets: ${results.environments.staging.stylesheets.length}</p>
    </div>
  </div>
  
  <div class="differences">
    <h2>Differences</h2>
    
    <h3>CSS Differences (${results.differences.css.length})</h3>
    ${results.differences.css.length > 0 
      ? `<ul>${results.differences.css.map(diff => `<li>${diff}</li>`).join('')}</ul>` 
      : '<p>No CSS differences found.</p>'}
    
    <h3>JavaScript Differences (${results.differences.js.length})</h3>
    ${results.differences.js.length > 0 
      ? `<ul>${results.differences.js.map(diff => `<li>${diff}</li>`).join('')}</ul>`
      : '<p>No JavaScript differences found.</p>'}
    
    <h3>HTTP Header Differences (${results.differences.headers.length})</h3>
    ${results.differences.headers.length > 0
      ? `<ul>${results.differences.headers.map(diff => `<li>${diff}</li>`).join('')}</ul>`
      : '<p>No HTTP header differences found.</p>'}
  </div>
  
  <h2>Screenshots</h2>
  <div class="screenshots">
    <div class="screenshot">
      <h3>Local Environment</h3>
      <img src="${path.basename(results.environments.local.screenshotPath)}" alt="Local screenshot">
    </div>
    
    <div class="screenshot">
      <h3>Staging Environment</h3>
      <img src="${path.basename(results.environments.staging.screenshotPath)}" alt="Staging screenshot">
    </div>
  </div>
</body>
</html>`;
}

// Run the comparison
compareEnvironments().catch(console.error); 