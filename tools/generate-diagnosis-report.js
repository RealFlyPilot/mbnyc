#!/usr/bin/env node

/**
 * WordPress Site Diagnosis Tool
 * Runs a headless browser to analyze the staging environment and identify white screen issues.
 * This tool is non-intrusive and runs entirely in the background without opening browser windows.
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

// Define environments
const environments = [
  { name: 'local', url: 'https://mbnyc.local/' },
  { name: 'staging', url: 'https://mbnycd.wpenginepowered.com/' }
];

// Create output directory
const outputDir = path.join(__dirname, '../diagnosis-reports');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get current date and time for filenames
const dateTime = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
const logFile = path.join(outputDir, `diagnosis-${dateTime}.log`);

// Helper to log to both console and file
function log(message) {
  console.log(message);
  fs.appendFileSync(logFile, message + '\n');
}

async function generateDiagnosisReport() {
  log('🔍 Starting diagnosis report generation...');
  log(`📅 ${new Date().toLocaleString()}`);
  log('');
  
  // Launch browser in headless mode
  const browser = await chromium.launch({ headless: true });
  
  try {
    // Analyze staging environment
    log('Analyzing staging environment...');
    
    const stagingReport = await analyzeEnvironment(browser, environments[1].url);
    
    // Analyze local environment for comparison
    log('Analyzing local environment for comparison...');
    
    const localReport = await analyzeEnvironment(browser, environments[0].url);
    
    // Compare environments and identify issues
    log('Comparing environments and identifying issues...');
    
    const comparisonResult = compareEnvironments(localReport, stagingReport);
    
    // Generate comprehensive report
    const fullReport = {
      timestamp: new Date().toISOString(),
      local: localReport,
      staging: stagingReport,
      comparison: comparisonResult,
      diagnosis: diagnoseProblem(stagingReport, comparisonResult)
    };
    
    // Save full report as JSON
    const reportPath = path.join(outputDir, `full-diagnosis-${dateTime}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(fullReport, null, 2));
    
    // Generate HTML report
    const htmlReport = generateHtmlReport(fullReport);
    const htmlReportPath = path.join(outputDir, `diagnosis-report-${dateTime}.html`);
    fs.writeFileSync(htmlReportPath, htmlReport);
    
    // Print summary to console
    log('\n📊 DIAGNOSIS SUMMARY');
    log('==================');
    
    if (stagingReport.error) {
      log(`❌ Staging site error: ${stagingReport.error}`);
    } else {
      log(`Status code: ${stagingReport.status}`);
      log(`Page title: ${stagingReport.title || 'None'}`);
      log(`Body content: ${stagingReport.bodyLength} characters`);
      log(`Stylesheets: ${stagingReport.resources.stylesheets.length}`);
      log(`Scripts: ${stagingReport.resources.scripts.length}`);
      log(`Errors detected: ${stagingReport.errors.length}`);
    }
    
    log('\n🔍 DIAGNOSIS RESULT');
    log('=================');
    
    for (const issue of fullReport.diagnosis.issues) {
      log(`- ${issue.severity}: ${issue.message}`);
    }
    
    log('\n💡 RECOMMENDED FIXES');
    log('==================');
    
    for (const fix of fullReport.diagnosis.recommendations) {
      log(`- ${fix}`);
    }
    
    log('\n📂 Reports saved to:');
    log(`- JSON: ${reportPath}`);
    log(`- HTML: ${htmlReportPath}`);
    
  } catch (error) {
    log(`Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

async function analyzeEnvironment(browser, url) {
  try {
    // Create a report object
    const report = {
      url,
      status: null,
      title: null,
      bodyLength: 0,
      htmlLength: 0,
      resources: {
        stylesheets: [],
        scripts: [],
        images: [],
        fonts: []
      },
      headers: {},
      errors: [],
      htmlStructure: {},
      timing: {}
    };
    
    // Start measuring time
    const startTime = Date.now();
    
    // Create a new context and page
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Listen for errors
    page.on('console', message => {
      if (message.type() === 'error') {
        report.errors.push({
          type: 'console',
          text: message.text()
        });
      }
    });
    
    page.on('pageerror', error => {
      report.errors.push({
        type: 'page',
        text: error.message
      });
    });
    
    // Listen for network requests
    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');
    
    const requests = [];
    client.on('Network.requestWillBeSent', request => {
      requests.push({
        url: request.request.url,
        type: request.type,
        time: Date.now() - startTime
      });
    });
    
    client.on('Network.responseReceived', response => {
      const url = response.response.url;
      const type = response.type;
      const status = response.response.status;
      
      // Categorize resources
      if (url.match(/\.(css|scss)($|\?)/i)) {
        report.resources.stylesheets.push({
          url,
          status,
          type
        });
      } else if (url.match(/\.(js|mjs)($|\?)/i)) {
        report.resources.scripts.push({
          url,
          status,
          type
        });
      } else if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)($|\?)/i)) {
        report.resources.images.push({
          url,
          status,
          type
        });
      } else if (url.match(/\.(woff|woff2|ttf|eot|otf)($|\?)/i)) {
        report.resources.fonts.push({
          url,
          status,
          type
        });
      }
    });
    
    // Navigate to the page
    const response = await page.goto(url, { 
      timeout: 30000,
      waitUntil: 'networkidle'
    }).catch(error => {
      report.error = error.message;
      return null;
    });
    
    if (response) {
      report.status = response.status();
      report.headers = response.headers();
      
      // Get page metrics
      report.title = await page.title();
      report.bodyLength = await page.evaluate(() => document.body ? document.body.innerText.length : 0);
      report.htmlLength = await page.evaluate(() => document.documentElement.outerHTML.length);
      
      // Analyze HTML structure
      report.htmlStructure = await page.evaluate(() => {
        return {
          doctype: document.doctype ? document.doctype.name : null,
          hasHtml: document.querySelector('html') !== null,
          hasHead: document.querySelector('head') !== null,
          hasBody: document.querySelector('body') !== null,
          headChildCount: document.head ? document.head.childElementCount : 0,
          bodyChildCount: document.body ? document.body.childElementCount : 0,
          stylesheets: document.querySelectorAll('link[rel="stylesheet"]').length,
          scripts: document.querySelectorAll('script').length,
          hasBrokenStructure: !document.doctype || !document.querySelector('html') || 
                              !document.querySelector('head') || !document.querySelector('body')
        };
      });
      
      // Capture loading timing
      report.timing = {
        navigationStart: startTime,
        domContentLoaded: await page.evaluate(() => window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart),
        load: await page.evaluate(() => window.performance.timing.loadEventEnd - window.performance.timing.navigationStart),
        totalTime: Date.now() - startTime
      };
      
      // Take a screenshot
      const screenshotPath = path.join(outputDir, `${new URL(url).hostname}-${dateTime}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      report.screenshot = screenshotPath;
      
      // Save HTML content
      const htmlPath = path.join(outputDir, `${new URL(url).hostname}-${dateTime}.html`);
      const htmlContent = await page.content();
      fs.writeFileSync(htmlPath, htmlContent);
      report.htmlFile = htmlPath;
    }
    
    await context.close();
    return report;
    
  } catch (error) {
    return { error: error.message };
  }
}

function compareEnvironments(local, staging) {
  const comparison = {
    statusMatch: local.status === staging.status,
    bodyLengthRatio: local.bodyLength > 0 ? staging.bodyLength / local.bodyLength : 0,
    htmlLengthRatio: local.htmlLength > 0 ? staging.htmlLength / local.htmlLength : 0,
    missingStylesheets: [],
    missingScripts: [],
    structuralDifferences: []
  };
  
  // Check for missing stylesheets
  const localStylesheetUrls = local.resources.stylesheets.map(s => path.basename(s.url));
  const stagingStylesheetUrls = staging.resources.stylesheets.map(s => path.basename(s.url));
  
  comparison.missingStylesheets = localStylesheetUrls.filter(url => !stagingStylesheetUrls.includes(url));
  
  // Check for missing scripts
  const localScriptUrls = local.resources.scripts.map(s => path.basename(s.url));
  const stagingScriptUrls = staging.resources.scripts.map(s => path.basename(s.url));
  
  comparison.missingScripts = localScriptUrls.filter(url => !stagingScriptUrls.includes(url));
  
  // Check structural differences
  if (local.htmlStructure && staging.htmlStructure) {
    if (local.htmlStructure.hasHtml !== staging.htmlStructure.hasHtml) {
      comparison.structuralDifferences.push("HTML tag presence differs");
    }
    
    if (local.htmlStructure.hasHead !== staging.htmlStructure.hasHead) {
      comparison.structuralDifferences.push("HEAD tag presence differs");
    }
    
    if (local.htmlStructure.hasBody !== staging.htmlStructure.hasBody) {
      comparison.structuralDifferences.push("BODY tag presence differs");
    }
    
    if (local.htmlStructure.doctype !== staging.htmlStructure.doctype) {
      comparison.structuralDifferences.push("DOCTYPE differs");
    }
  }
  
  return comparison;
}

function diagnoseProblem(stagingReport, comparison) {
  const diagnosis = {
    issues: [],
    recommendations: []
  };
  
  // Check for white screen
  if (stagingReport.bodyLength < 100) {
    diagnosis.issues.push({
      severity: 'CRITICAL',
      message: 'White screen detected (minimal content)'
    });
  }
  
  // Check for structural issues
  if (stagingReport.htmlStructure && stagingReport.htmlStructure.hasBrokenStructure) {
    diagnosis.issues.push({
      severity: 'CRITICAL',
      message: 'Broken HTML structure detected'
    });
    
    if (!stagingReport.htmlStructure.hasBody) {
      diagnosis.issues.push({
        severity: 'CRITICAL',
        message: 'Missing BODY tag'
      });
    }
    
    diagnosis.recommendations.push('Check for PHP fatal errors that might be preventing proper HTML rendering');
    diagnosis.recommendations.push('Enable WP_DEBUG and check error logs');
  }
  
  // Check for missing resources
  if (comparison.missingStylesheets.length > 0) {
    diagnosis.issues.push({
      severity: 'HIGH',
      message: `Missing ${comparison.missingStylesheets.length} stylesheets that exist in local environment`
    });
    
    diagnosis.recommendations.push('Check if theme is properly activated on staging');
    diagnosis.recommendations.push('Verify CSS file paths in functions.php');
    diagnosis.recommendations.push('Regenerate Elementor CSS files');
  }
  
  if (comparison.missingScripts.length > 0) {
    diagnosis.issues.push({
      severity: 'MEDIUM',
      message: `Missing ${comparison.missingScripts.length} scripts that exist in local environment`
    });
  }
  
  // Check for errors
  if (stagingReport.errors && stagingReport.errors.length > 0) {
    diagnosis.issues.push({
      severity: 'HIGH',
      message: `Detected ${stagingReport.errors.length} JavaScript errors`
    });
    
    diagnosis.recommendations.push('Check browser console for JavaScript errors');
    diagnosis.recommendations.push('Temporarily disable JavaScript-heavy plugins');
  }
  
  // If no specific issues found
  if (diagnosis.issues.length === 0) {
    diagnosis.issues.push({
      severity: 'UNKNOWN',
      message: 'No obvious issues detected, may require manual investigation'
    });
  }
  
  // Add standard recommendations
  if (diagnosis.recommendations.length === 0) {
    diagnosis.recommendations.push('Enable WP_DEBUG in wp-config.php to identify PHP errors');
    diagnosis.recommendations.push('Try accessing WP Admin directly to see if the dashboard loads');
    diagnosis.recommendations.push('Clear WordPress transients and object cache');
    diagnosis.recommendations.push('Check WP Engine environment variables and caching settings');
  }
  
  return diagnosis;
}

function generateHtmlReport(report) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>WordPress Site Diagnosis Report</title>
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
    .error {
      background-color: #f8d7da;
      color: #721c24;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    .success {
      background-color: #d4edda;
      color: #155724;
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
    .issues ul {
      padding-left: 20px;
    }
    .issues li {
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
    .CRITICAL {
      color: #721c24;
      font-weight: bold;
    }
    .HIGH {
      color: #e65100;
      font-weight: bold;
    }
    .MEDIUM {
      color: #856404;
    }
    .LOW {
      color: #0c5460;
    }
  </style>
</head>
<body>
  <h1>WordPress Site Diagnosis Report</h1>
  <p>Generated on ${new Date(report.timestamp).toLocaleString()}</p>
  
  <div class="summary">
    <h2>Summary</h2>
    <p>Local status: ${report.local.status}, Content length: ${report.local.bodyLength} chars</p>
    <p>Staging status: ${report.staging.status}, Content length: ${report.staging.bodyLength} chars</p>
    <p>Content ratio: ${Math.round(report.comparison.bodyLengthRatio * 100)}% (staging compared to local)</p>
    <p>Missing stylesheets: ${report.comparison.missingStylesheets.length}</p>
    <p>Missing scripts: ${report.comparison.missingScripts.length}</p>
    <p>JavaScript errors: ${report.staging.errors ? report.staging.errors.length : 0}</p>
  </div>
  
  ${report.staging.bodyLength < 100 ? `
  <div class="error">
    <strong>⚠️ Critical Issue:</strong> Staging site has very little content (${report.staging.bodyLength} chars). This indicates a white screen issue.
  </div>
  ` : ''}
  
  <h2>Diagnosis</h2>
  
  <div class="issues">
    <h3>Identified Issues</h3>
    <ul>
      ${report.diagnosis.issues.map(issue => `
        <li class="${issue.severity}">${issue.severity}: ${issue.message}</li>
      `).join('')}
    </ul>
    
    <h3>Recommended Fixes</h3>
    <ol>
      ${report.diagnosis.recommendations.map(rec => `
        <li>${rec}</li>
      `).join('')}
    </ol>
  </div>
  
  <div class="environments">
    <div class="environment">
      <h3>Local Environment</h3>
      <p>URL: ${report.local.url}</p>
      <p>Status: ${report.local.status}</p>
      <p>Page title: ${report.local.title || 'None'}</p>
      <p>Body content: ${report.local.bodyLength} chars</p>
      <p>Stylesheets: ${report.local.resources.stylesheets.length}</p>
      <p>Scripts: ${report.local.resources.scripts.length}</p>
      <p>HTML structure issues: ${report.local.htmlStructure && report.local.htmlStructure.hasBrokenStructure ? 'Yes' : 'No'}</p>
    </div>
    
    <div class="environment">
      <h3>Staging Environment</h3>
      <p>URL: ${report.staging.url}</p>
      <p>Status: ${report.staging.status}</p>
      <p>Page title: ${report.staging.title || 'None'}</p>
      <p>Body content: ${report.staging.bodyLength} chars</p>
      <p>Stylesheets: ${report.staging.resources.stylesheets.length}</p>
      <p>Scripts: ${report.staging.resources.scripts.length}</p>
      <p>HTML structure issues: ${report.staging.htmlStructure && report.staging.htmlStructure.hasBrokenStructure ? 'Yes' : 'No'}</p>
      <p>JavaScript errors: ${report.staging.errors ? report.staging.errors.length : 'Unknown'}</p>
    </div>
  </div>
  
  <h2>Missing Resources</h2>
  
  ${report.comparison.missingStylesheets.length > 0 ? `
  <div class="warning">
    <h3>Missing Stylesheets</h3>
    <ul>
      ${report.comparison.missingStylesheets.map(sheet => `<li>${sheet}</li>`).join('')}
    </ul>
  </div>
  ` : ''}
  
  ${report.comparison.missingScripts.length > 0 ? `
  <div class="warning">
    <h3>Missing Scripts</h3>
    <ul>
      ${report.comparison.missingScripts.map(script => `<li>${script}</li>`).join('')}
    </ul>
  </div>
  ` : ''}
  
  ${report.comparison.structuralDifferences.length > 0 ? `
  <div class="error">
    <h3>HTML Structure Differences</h3>
    <ul>
      ${report.comparison.structuralDifferences.map(diff => `<li>${diff}</li>`).join('')}
    </ul>
  </div>
  ` : ''}
  
  ${report.staging.errors && report.staging.errors.length > 0 ? `
  <div class="error">
    <h3>JavaScript Errors</h3>
    <ul>
      ${report.staging.errors.map(error => `<li>${error.type}: ${error.text}</li>`).join('')}
    </ul>
  </div>
  ` : ''}
  
  <h2>Screenshots</h2>
  <div class="screenshots">
    <div class="screenshot">
      <h3>Local Environment</h3>
      <img src="${path.basename(report.local.screenshot)}" alt="Local screenshot">
    </div>
    
    <div class="screenshot">
      <h3>Staging Environment</h3>
      <img src="${path.basename(report.staging.screenshot)}" alt="Staging screenshot">
    </div>
  </div>
  
  <div class="summary">
    <h2>Next Steps</h2>
    <ol>
      <li>Address the identified issues in order of severity (CRITICAL → HIGH → MEDIUM)</li>
      <li>After each fix, re-run this diagnosis tool to verify improvements</li>
      <li>If issues persist, consider WP Engine support or a staging environment reset</li>
    </ol>
  </div>
</body>
</html>`;
}

// Run the diagnosis
generateDiagnosisReport().catch(error => {
  console.error('Fatal error:', error);
}); 