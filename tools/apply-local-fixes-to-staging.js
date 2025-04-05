#!/usr/bin/env node

/**
 * Staging Environment Fix Tool
 * 
 * This script analyzes the differences between local and staging environments,
 * then attempts to apply fixes to the staging environment to resolve issues
 * like the white screen of death.
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');
const readline = require('readline');

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Define environments
const environments = [
  { name: 'local', url: 'https://mbnyc.local/' },
  { name: 'staging', url: 'https://mbnycd.wpenginepowered.com/' }
];

// Create output directory for logs
const outputDir = path.join(__dirname, '../fix-logs');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get current date and time for log filenames
const dateTime = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
const logFile = path.join(outputDir, `staging-fix-${dateTime}.log`);

// Helper to log to both console and file
function log(message) {
  console.log(message);
  fs.appendFileSync(logFile, message + '\n');
}

// Main function to analyze and fix staging environment
async function fixStagingEnvironment() {
  log('🔍 Starting analysis of staging environment...');
  log(`📅 ${new Date().toLocaleString()}`);
  log('');
  
  // First, confirm that the staging site has issues
  log('Verifying staging site issues...');
  const browser = await chromium.launch({ headless: true });
  
  try {
    // Step 1: Check if staging site is actually broken
    const stagingContext = await browser.newContext();
    const stagingPage = await stagingContext.newPage();
    
    log(`Accessing staging environment at ${environments[1].url}`);
    const response = await stagingPage.goto(environments[1].url, { 
      timeout: 60000,
      waitUntil: 'networkidle'
    }).catch(e => {
      log(`Error accessing staging site: ${e.message}`);
      return null;
    });
    
    if (!response) {
      log('❌ Could not access staging site. Please check connectivity and try again.');
      await browser.close();
      rl.close();
      return;
    }
    
    // Check if we have a white screen
    const bodyContent = await stagingPage.evaluate(() => document.body.innerText);
    const hasContent = bodyContent.length > 100;
    
    // Take a screenshot
    const screenshotPath = path.join(outputDir, `staging-before-${dateTime}.png`);
    await stagingPage.screenshot({ path: screenshotPath, fullPage: true });
    
    if (hasContent) {
      log(`⚠️ Staging site seems to have content (${bodyContent.length} chars). Are you sure it has issues?`);
      
      const shouldContinue = await askQuestion('Continue with fixes anyway? (y/n): ');
      if (shouldContinue.toLowerCase() !== 'y') {
        log('Operation cancelled by user.');
        await browser.close();
        rl.close();
        return;
      }
    } else {
      log('✅ Confirmed staging site has minimal content. Proceeding with fixes.');
    }
    
    await stagingContext.close();
    
    // Step 2: Analyze the local site to understand what should be working
    log('\nAnalyzing local environment...');
    const localContext = await browser.newContext();
    const localPage = await localContext.newPage();
    
    await localPage.goto(environments[0].url, { 
      timeout: 60000,
      waitUntil: 'networkidle'
    });
    
    // Take screenshot of working local site
    const localScreenshot = path.join(outputDir, `local-reference-${dateTime}.png`);
    await localPage.screenshot({ path: localScreenshot, fullPage: true });
    
    // Collect stylesheets and scripts from local
    const localStylesheets = await localPage.evaluate(() => {
      return Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map(s => ({ href: s.href, media: s.media }));
    });
    
    const localScripts = await localPage.evaluate(() => {
      return Array.from(document.querySelectorAll('script'))
        .map(s => ({ src: s.src || 'inline' }));
    });
    
    log(`Found ${localStylesheets.length} stylesheets and ${localScripts.length} scripts in local environment.`);
    
    await localContext.close();
    
    // Step 3: Present potential fixes
    log('\n🔧 Available fixes for staging environment:');
    log('1. Reset WordPress transients (often fixes white screens)');
    log('2. Clear Elementor cache (if white screen appeared after Elementor changes)');
    log('3. Reset wp-config.php debug settings (detect PHP errors)');
    log('4. Fix CSS loading issues (common when stylesheets don\'t load)');
    log('5. Check for JavaScript errors (sometimes causing blank screens)');
    log('6. Try accessing WP Admin directly (bypass frontend issues)');
    log('7. Generate detailed diagnostic report');
    log('8. Reset all settings (caution: this is a nuclear option)');
    log('');
    
    const selectedFix = await askQuestion('Select a fix to apply (1-8): ');
    
    // Apply selected fix
    log(`\nApplying fix #${selectedFix}...`);
    
    const fixContext = await browser.newContext();
    const fixPage = await fixContext.newPage();
    
    switch(selectedFix) {
      case '1':
        // Reset WordPress transients
        log('Attempting to access WP Admin to reset transients...');
        
        try {
          await fixPage.goto(`${environments[1].url}/wp-admin`, { timeout: 30000 });
          
          // Check if login page is accessible
          const hasLoginForm = await fixPage.locator('#loginform').count() > 0;
          
          if (hasLoginForm) {
            log('✅ WP Admin login page is accessible. Please login manually to reset transients.');
            log('Instructions:');
            log('1. Login to WP Admin');
            log('2. Install a plugin like "Transients Manager"');
            log('3. Use it to delete all transients');
            log('4. Check if the site is working');
            
            // Wait for manual intervention
            const shouldContinue = await askQuestion('Press Enter once you\'ve completed these steps, or type "exit" to quit: ');
            if (shouldContinue.toLowerCase() === 'exit') {
              break;
            }
            
            // Take another screenshot to see if it helped
            const afterScreenshot = path.join(outputDir, `staging-after-transients-${dateTime}.png`);
            await fixPage.goto(environments[1].url, { timeout: 30000 });
            await fixPage.screenshot({ path: afterScreenshot, fullPage: true });
            
            log(`✅ Screenshot saved to ${afterScreenshot}`);
          } else {
            log('❌ Could not access WP Admin login page. This may indicate deeper issues.');
          }
        } catch(error) {
          log(`❌ Error accessing WP Admin: ${error.message}`);
        }
        break;
        
      case '2':
        // Clear Elementor cache
        log('Attempting to clear Elementor cache...');
        
        try {
          await fixPage.goto(`${environments[1].url}/wp-admin`, { timeout: 30000 });
          
          // Check if login page is accessible
          const hasLoginForm = await fixPage.locator('#loginform').count() > 0;
          
          if (hasLoginForm) {
            log('✅ WP Admin login page is accessible. Please login manually to clear Elementor cache.');
            log('Instructions:');
            log('1. Login to WP Admin');
            log('2. Navigate to Elementor > Tools > Regenerate CSS');
            log('3. Click "Regenerate Files"');
            log('4. Check if the site is working');
            
            // Wait for manual intervention
            const shouldContinue = await askQuestion('Press Enter once you\'ve completed these steps, or type "exit" to quit: ');
            if (shouldContinue.toLowerCase() === 'exit') {
              break;
            }
            
            // Take another screenshot to see if it helped
            const afterScreenshot = path.join(outputDir, `staging-after-elementor-${dateTime}.png`);
            await fixPage.goto(environments[1].url, { timeout: 30000 });
            await fixPage.screenshot({ path: afterScreenshot, fullPage: true });
            
            log(`✅ Screenshot saved to ${afterScreenshot}`);
          } else {
            log('❌ Could not access WP Admin login page. This may indicate deeper issues.');
          }
        } catch(error) {
          log(`❌ Error accessing WP Admin: ${error.message}`);
        }
        break;
        
      case '3':
        // Reset wp-config debug settings
        log('To reset wp-config.php debug settings, you need to access the server directly.');
        log('Instructions for WP Engine:');
        log('1. Log in to your WP Engine account');
        log('2. Go to the site, then Development > SFTP');
        log('3. Connect via SFTP and edit wp-config.php');
        log('4. Set these values:');
        log('   define( \'WP_DEBUG\', true );');
        log('   define( \'WP_DEBUG_LOG\', true );');
        log('   define( \'WP_DEBUG_DISPLAY\', false );');
        log('   define( \'WP_MEMORY_LIMIT\', \'256M\' );');
        
        const shouldContinue = await askQuestion('Press Enter once you\'ve completed these steps, or type "exit" to quit: ');
        if (shouldContinue.toLowerCase() === 'exit') {
          break;
        }
        
        // Take another screenshot to see if it helped
        const afterScreenshot = path.join(outputDir, `staging-after-debug-${dateTime}.png`);
        await fixPage.goto(environments[1].url, { timeout: 30000 });
        await fixPage.screenshot({ path: afterScreenshot, fullPage: true });
        
        log(`✅ Screenshot saved to ${afterScreenshot}`);
        break;
        
      case '4':
        // Fix CSS loading issues
        log('Analyzing CSS loading issues...');
        
        await fixPage.goto(environments[1].url, { timeout: 30000 });
        
        // Check which stylesheets are missing
        const stagingStylesheets = await fixPage.evaluate(() => {
          return Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
            .map(s => ({ href: s.href, media: s.media }));
        });
        
        // Compare with local stylesheets
        const localStylesheetPaths = localStylesheets.map(s => {
          try {
            const url = new URL(s.href);
            return url.pathname;
          } catch (e) {
            return s.href;
          }
        });
        
        const stagingStylesheetPaths = stagingStylesheets.map(s => {
          try {
            const url = new URL(s.href);
            return url.pathname;
          } catch (e) {
            return s.href;
          }
        });
        
        const missingStylesheets = localStylesheetPaths.filter(path => !stagingStylesheetPaths.includes(path));
        
        if (missingStylesheets.length > 0) {
          log(`❌ Found ${missingStylesheets.length} missing stylesheets on staging:`);
          missingStylesheets.forEach(path => log(`   - ${path}`));
          
          log('\nPossible solutions:');
          log('1. Check if these files exist on the staging server');
          log('2. Check if the theme is correctly activated');
          log('3. Check if functions.php is correctly enqueueing these stylesheets');
          log('4. Try regenerating Elementor CSS');
          
        } else {
          log('✅ All local stylesheets appear to be present on staging. The issue may be:');
          log('1. CSS files exist but have errors');
          log('2. CSS files are blocked from loading (check browser console)');
          log('3. The issue may not be CSS-related');
        }
        
        // Take another screenshot
        const cssScreenshot = path.join(outputDir, `staging-css-check-${dateTime}.png`);
        await fixPage.screenshot({ path: cssScreenshot, fullPage: true });
        break;
        
      case '5':
        // Check for JavaScript errors
        log('Checking for JavaScript errors...');
        
        // Collect JS errors
        const jsErrors = [];
        fixPage.on('console', msg => {
          if (msg.type() === 'error') {
            jsErrors.push(msg.text());
            log(`Browser console error: ${msg.text()}`);
          }
        });
        
        fixPage.on('pageerror', error => {
          jsErrors.push(error.message);
          log(`Page error: ${error.message}`);
        });
        
        // Navigate to staging
        await fixPage.goto(environments[1].url, { timeout: 30000 });
        
        // Give time for errors to appear
        await fixPage.waitForTimeout(5000);
        
        if (jsErrors.length > 0) {
          log(`❌ Found ${jsErrors.length} JavaScript errors on staging.`);
          log('These errors might be causing the white screen issue.');
          log('Common solutions:');
          log('1. Check for JavaScript conflicts between plugins');
          log('2. Temporarily disable plugins to identify the problematic one');
          log('3. Check if all required JS files are properly loading');
        } else {
          log('✅ No JavaScript errors detected in the console.');
          log('If the page is still blank, the issue might be:');
          log('1. Server-side errors (PHP)');
          log('2. Markup structure issues');
          log('3. CSS hiding content');
        }
        break;
        
      case '6':
        // Try accessing WP Admin directly
        log('Attempting to access WP Admin directly...');
        
        try {
          await fixPage.goto(`${environments[1].url}/wp-admin`, { timeout: 30000 });
          const adminScreenshot = path.join(outputDir, `staging-admin-${dateTime}.png`);
          await fixPage.screenshot({ path: adminScreenshot, fullPage: true });
          
          // Check if login page is accessible
          const hasLoginForm = await fixPage.locator('#loginform').count() > 0;
          
          if (hasLoginForm) {
            log('✅ WP Admin login page is accessible. This suggests:');
            log('1. The core WordPress installation is working');
            log('2. The issue is likely theme or plugin related, not core WordPress');
            log('3. Try logging in and:');
            log('   - Switch to a default theme temporarily');
            log('   - Disable plugins one by one to identify the issue');
          } else {
            log('❌ Could not access WP Admin login page. This suggests:');
            log('1. There might be core WordPress issues');
            log('2. .htaccess rules might be blocking access');
            log('3. Server configuration issues might be present');
          }
        } catch(error) {
          log(`❌ Error accessing WP Admin: ${error.message}`);
        }
        break;
        
      case '7':
        // Generate detailed diagnostic report
        log('Generating detailed diagnostic report...');
        
        try {
          // Create a detailed report for the staging site
          const stagingReport = {
            timestamp: new Date().toISOString(),
            url: environments[1].url,
            htmlStructure: {},
            resources: [],
            serverInfo: {},
            errors: []
          };
          
          // Collect console errors
          fixPage.on('console', msg => {
            if (msg.type() === 'error') {
              stagingReport.errors.push({
                type: 'console',
                message: msg.text()
              });
            }
          });
          
          fixPage.on('pageerror', error => {
            stagingReport.errors.push({
              type: 'page',
              message: error.message
            });
          });
          
          // Collect network information
          const client = await fixPage.context().newCDPSession(fixPage);
          await client.send('Network.enable');
          
          client.on('Network.responseReceived', event => {
            stagingReport.resources.push({
              url: event.response.url,
              status: event.response.status,
              type: event.type,
              headers: event.response.headers
            });
          });
          
          // Navigate to staging
          const response = await fixPage.goto(environments[1].url, { timeout: 60000 });
          stagingReport.serverInfo.status = response.status();
          stagingReport.serverInfo.headers = response.headers();
          
          // Get HTML structure
          stagingReport.htmlStructure = await fixPage.evaluate(() => {
            const doctype = document.doctype ? 
              `<!DOCTYPE ${document.doctype.name}${document.doctype.publicId ? ' PUBLIC "' + document.doctype.publicId + '"' : ''}${document.doctype.systemId ? ' "' + document.doctype.systemId + '"' : ''}>` : 
              'No DOCTYPE';
            
            const hasHtml = document.querySelector('html') !== null;
            const hasHead = document.querySelector('head') !== null;
            const hasBody = document.querySelector('body') !== null;
            
            // Check for critical elements
            const hasCriticalElements = {
              stylesheets: document.querySelectorAll('link[rel="stylesheet"]').length,
              scripts: document.querySelectorAll('script').length,
              divs: document.querySelectorAll('div').length,
              text: document.body ? document.body.innerText.length : 0
            };
            
            return {
              doctype,
              hasHtml,
              hasHead,
              hasBody,
              hasCriticalElements
            };
          });
          
          // Take screenshots
          const reportScreenshot = path.join(outputDir, `staging-diagnostic-${dateTime}.png`);
          await fixPage.screenshot({ path: reportScreenshot, fullPage: true });
          
          // Save report
          const reportPath = path.join(outputDir, `staging-diagnostic-${dateTime}.json`);
          fs.writeFileSync(reportPath, JSON.stringify(stagingReport, null, 2));
          
          log(`✅ Diagnostic report saved to ${reportPath}`);
          log('Diagnostic summary:');
          log(`- Status code: ${stagingReport.serverInfo.status}`);
          log(`- HTML structure: ${stagingReport.htmlStructure.hasHtml ? 'OK' : 'MISSING'} (html), ${stagingReport.htmlStructure.hasHead ? 'OK' : 'MISSING'} (head), ${stagingReport.htmlStructure.hasBody ? 'OK' : 'MISSING'} (body)`);
          log(`- Critical elements: ${stagingReport.htmlStructure.hasCriticalElements.stylesheets} stylesheets, ${stagingReport.htmlStructure.hasCriticalElements.scripts} scripts`);
          log(`- Content length: ${stagingReport.htmlStructure.hasCriticalElements.text} characters`);
          log(`- Errors logged: ${stagingReport.errors.length}`);
          
          if (stagingReport.htmlStructure.hasCriticalElements.text < 100) {
            log('\n⚠️ The page has very little text content, confirming a likely white screen issue.');
            
            if (!stagingReport.htmlStructure.hasBody) {
              log('❌ The page is missing a <body> tag! This is a critical HTML structure issue.');
            }
            
            if (stagingReport.htmlStructure.hasCriticalElements.stylesheets === 0) {
              log('❌ No stylesheets are loading! This could indicate a theme or plugin issue.');
            }
            
            log('\nRecommended fixes based on diagnostic:');
            
            if (stagingReport.errors.length > 0) {
              log('1. Fix JavaScript errors (see detailed report)');
            }
            
            if (stagingReport.htmlStructure.hasCriticalElements.stylesheets === 0) {
              log('2. Check theme activation and CSS loading');
            }
            
            if (!stagingReport.htmlStructure.hasBody) {
              log('3. Check for PHP fatal errors that are preventing page rendering');
            }
            
            log('4. Try restoring from a backup if available');
          }
          
        } catch(error) {
          log(`❌ Error generating diagnostic report: ${error.message}`);
        }
        break;
        
      case '8':
        // Reset all settings
        log('⚠️ WARNING: This will attempt to reset all settings to defaults. This is a last resort option.');
        const confirmReset = await askQuestion('Are you sure you want to proceed? This may cause data loss. (yes/no): ');
        
        if (confirmReset.toLowerCase() !== 'yes') {
          log('Operation cancelled by user.');
          break;
        }
        
        log('To perform a complete reset on WP Engine:');
        log('1. Log in to your WP Engine account');
        log('2. Create a backup of your current site');
        log('3. Go to the staging site settings');
        log('4. Choose "Reset staging site"');
        log('5. After reset, republish from production to staging');
        log('6. Alternatively, ask WP Engine support to help reset the staging environment');
        
        const resetComplete = await askQuestion('Press Enter once reset is complete, or type "exit" to quit: ');
        if (resetComplete.toLowerCase() === 'exit') {
          break;
        }
        
        // Check if site is working after reset
        const resetScreenshot = path.join(outputDir, `staging-after-reset-${dateTime}.png`);
        await fixPage.goto(environments[1].url, { timeout: 30000 });
        await fixPage.screenshot({ path: resetScreenshot, fullPage: true });
        
        log(`✅ Screenshot saved to ${resetScreenshot}`);
        break;
        
      default:
        log('❌ Invalid option selected.');
    }
    
    await fixContext.close();
    
    // Final summary
    log('\n📋 Fix operation summary:');
    log(`- Fix attempt: ${selectedFix}`);
    log(`- Timestamp: ${new Date().toLocaleString()}`);
    log(`- Log file: ${logFile}`);
    log(`- Screenshots saved to: ${outputDir}`);
    
    log('\nNext steps:');
    log('1. Check if the staging site is now working correctly');
    log('2. If issues persist, try another fix option');
    log('3. If all else fails, contact WP Engine support');
    
  } catch(error) {
    log(`❌ Error: ${error.message}`);
  } finally {
    await browser.close();
    rl.close();
  }
}

// Helper function to ask questions
function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

// Run the fix tool
fixStagingEnvironment().catch(error => {
  console.error('Fatal error:', error);
  rl.close();
}); 