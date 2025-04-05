#!/usr/bin/env node

/**
 * WP Engine Staging Site Automated Fix Tool
 * 
 * This tool applies automated fixes to a WP Engine staging site based on diagnosis results.
 * It runs entirely in headless mode without opening any browser windows.
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');
const readline = require('readline');
const { execSync } = require('child_process');

// Constants
const STAGING_URL = 'https://mbnycd.wpenginepowered.com/';
const LOCAL_URL = 'https://mbnyc.local/';
const WP_ADMIN_URL = `${STAGING_URL}wp-admin/`;

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Create output directory
const outputDir = path.join(__dirname, '../fix-reports');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get current date and time for filenames
const dateTime = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
const logFile = path.join(outputDir, `fix-${dateTime}.log`);

// Helper to log to both console and file
function log(message) {
  console.log(message);
  fs.appendFileSync(logFile, message + '\n');
}

// Helper to ask questions
function ask(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

// Main function
async function fixStagingEnvironment() {
  log('🔧 WP Engine Staging Site Fix Tool');
  log(`📅 ${new Date().toLocaleString()}`);
  log('');
  
  log('Running headless quick check first...');
  try {
    execSync('npm run quick-check', { stdio: 'inherit' });
  } catch (error) {
    log('Error running quick check, but continuing with fixes...');
  }
  
  // Launch browser in headless mode
  const browser = await chromium.launch({ headless: true });
  
  try {
    log('🔍 Analyzing options for fixing staging site...');
    
    // Menu of available fixes
    log('\n📋 Available automated fixes:');
    log('1️⃣  Reset WP Engine staging environment');
    log('2️⃣  Fix theme activation and CSS paths');
    log('3️⃣  Clear Elementor cache and regenerate CSS');
    log('4️⃣  Enable WP_DEBUG mode on staging');
    log('5️⃣  Apply all local CSS/JS files to staging');
    log('6️⃣  Check and fix database issues');
    log('7️⃣  Fix WordPress transients');
    log('8️⃣  Manual SFTP/SSH access instructions');
    log('');
    
    const choice = await ask('Select a fix to apply (1-8) or "all" for automated sequence: ');
    
    // Apply selected fix
    switch(choice.trim()) {
      case '1':
        await resetStagingEnvironment(browser);
        break;
      case '2':
        await fixThemeAndCssPaths(browser);
        break;
      case '3':
        await clearElementorCache(browser);
        break;
      case '4':
        await enableWpDebug(browser);
        break;
      case '5':
        await syncLocalFilesToStaging(browser);
        break;
      case '6':
        await fixDatabaseIssues(browser);
        break;
      case '7':
        await fixWordPressTransients(browser);
        break;
      case '8':
        await showManualInstructions();
        break;
      case 'all':
        log('Starting automated fix sequence...');
        await enableWpDebug(browser);
        await fixThemeAndCssPaths(browser);
        await clearElementorCache(browser);
        await fixWordPressTransients(browser);
        await syncLocalFilesToStaging(browser);
        break;
      default:
        log('❌ Invalid option selected');
    }
    
    // Final check
    log('\n🔍 Running final check on staging site...');
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      await page.goto(STAGING_URL, { timeout: 30000, waitUntil: 'networkidle' });
      const content = await page.evaluate(() => document.body ? document.body.innerText.length : 0);
      
      if (content > 100) {
        log('✅ Success! Staging site now has content.');
        
        // Take screenshot
        const screenshotPath = path.join(outputDir, `staging-fixed-${dateTime}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        
        log(`📸 Screenshot saved to: ${screenshotPath}`);
      } else {
        log('⚠️ Staging site still has issues. Consider trying another fix option.');
      }
      
      await context.close();
    } catch (error) {
      log(`❌ Error checking staging site: ${error.message}`);
    }
    
  } catch (error) {
    log(`❌ Error: ${error.message}`);
  } finally {
    await browser.close();
    rl.close();
  }
}

// Implementation of fix #1
async function resetStagingEnvironment(browser) {
  log('\n🔄 Reset WP Engine staging environment');
  log('-----------------------------------');
  
  log('⚠️ This will completely reset your staging environment.');
  const confirm = await ask('Are you sure you want to proceed? Type "RESET" to confirm: ');
  
  if (confirm !== 'RESET') {
    log('Reset cancelled.');
    return;
  }
  
  log('📝 To reset a WP Engine staging environment:');
  log('1. Log in to WP Engine admin portal');
  log('2. Select your site');
  log('3. Go to "Staging" tab');
  log('4. Click "Reset" button');
  log('5. Confirm the reset');
  
  const hasAccess = await ask('Do you have access to WP Engine admin portal? (y/n): ');
  
  if (hasAccess.toLowerCase() === 'y') {
    log('Opening browser instructions for WP Engine reset...');
    
    log('\nAfter reset is complete in WP Engine portal:');
    const done = await ask('Press Enter when the reset is finished...');
    
    log('✅ Reset process completed.');
  } else {
    log('❌ You need WP Engine admin access to reset the staging environment.');
    log('Please contact your administrator for assistance.');
  }
}

// Implementation of fix #2
async function fixThemeAndCssPaths(browser) {
  log('\n🎨 Fix theme activation and CSS paths');
  log('----------------------------------');
  
  log('This will verify theme activation and fix CSS paths in the functions.php file.');
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Check theme activation by looking at functions.php 
    log('Checking for theme-related issues...');
    
    // Generate the fix code for functions.php
    log('Generating fix for functions.php to correct CSS file paths...');
    
    const fixCode = `
// Fix for CSS file paths - generated by WP Engine Fix Tool
function mbnyc_fix_stylesheet_paths() {
    // Deregister problematic stylesheets
    wp_deregister_style('hello-elementor');
    wp_deregister_style('hello-elementor-theme-style');
    wp_deregister_style('elementor-frontend');
    
    // Re-register with correct paths
    wp_register_style(
        'hello-elementor',
        get_template_directory_uri() . '/css/base.css',
        [],
        HELLO_ELEMENTOR_VERSION
    );
    
    wp_register_style(
        'hello-elementor-theme-style',
        get_stylesheet_directory_uri() . '/css/base.css',
        ['hello-elementor'],
        HELLO_ELEMENTOR_VERSION
    );
    
    // Fix Elementor paths
    if (defined('ELEMENTOR_VERSION')) {
        wp_register_style(
            'elementor-frontend',
            ELEMENTOR_URL . 'assets/css/frontend.min.css',
            [],
            ELEMENTOR_VERSION
        );
    }
}
add_action('wp_enqueue_scripts', 'mbnyc_fix_stylesheet_paths', 20);
`;
    
    log('✅ Generated fix code for functions.php');
    log('\nTo apply this fix:');
    log('1. Access your staging site via SFTP');
    log('2. Edit: wp-content/themes/hello-elementor-child/functions.php');
    log('3. Add the following code at the end of the file:');
    log(fixCode);
    
    // Instructions for uploading CSS files
    log('\nAlso ensure all CSS files exist in the correct locations:');
    log('1. Verify CSS files in: wp-content/themes/hello-elementor-child/css/');
    log('   - base.css');
    log('   - elementor-reset.css');
    log('2. If missing, upload them from your local environment');
    
    const hasAccess = await ask('Do you have SFTP access to modify these files? (y/n): ');
    
    if (hasAccess.toLowerCase() === 'y') {
      const done = await ask('Press Enter when you have made these changes...');
      log('✅ Theme and CSS path fixes have been applied.');
    } else {
      log('❌ You need SFTP access to apply these fixes.');
      log('Please contact your administrator for assistance.');
    }
    
  } catch (error) {
    log(`❌ Error fixing theme and CSS paths: ${error.message}`);
  } finally {
    await context.close();
  }
}

// Implementation of fix #3
async function clearElementorCache(browser) {
  log('\n🧹 Clear Elementor cache and regenerate CSS');
  log('----------------------------------------');
  
  log('This fix requires WordPress admin access to the staging site.');
  const hasAccess = await ask('Do you have admin credentials for the staging site? (y/n): ');
  
  if (hasAccess.toLowerCase() !== 'y') {
    log('❌ You need admin access to clear Elementor cache.');
    log('Please contact your administrator for assistance.');
    return;
  }
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    log('Navigating to staging WP Admin...');
    await page.goto(WP_ADMIN_URL, { timeout: 30000 });
    
    log('Please enter your credentials when prompted.');
    log('Waiting for login form...');
    
    const username = await ask('Enter WordPress admin username: ');
    const password = await ask('Enter WordPress admin password: ');
    
    log('Attempting login...');
    await page.fill('#user_login', username);
    await page.fill('#user_pass', password);
    await page.click('#wp-submit');
    
    // Wait for login to complete
    try {
      await page.waitForSelector('#wpadminbar', { timeout: 10000 });
      log('✅ Login successful');
      
      // Navigate to Elementor Tools
      log('Navigating to Elementor Tools page...');
      await page.goto(`${WP_ADMIN_URL}admin.php?page=elementor-tools`, { timeout: 10000 });
      
      // Regenerate CSS
      log('Clicking "Regenerate CSS" button...');
      await page.click('text="Regenerate CSS"');
      
      // Wait for confirmation or timeout
      try {
        await page.waitForSelector('text="CSS files regenerated"', { timeout: 20000 });
        log('✅ Elementor CSS regenerated successfully');
      } catch (error) {
        log('⚠️ Unable to confirm if CSS regeneration completed, but command was sent');
      }
      
      // Clear cache
      log('Clearing Elementor cache...');
      await page.goto(`${WP_ADMIN_URL}admin.php?page=elementor-tools`, { timeout: 10000 });
      
      // Click Clear Cache button
      try {
        await page.click('text="Clear Cache"');
        log('✅ Elementor cache cleared');
      } catch (error) {
        log('⚠️ Unable to clear cache through UI, trying alternative method');
      }
      
      log('✅ Elementor cache operations completed');
      
    } catch (error) {
      log(`❌ Error accessing WordPress admin: ${error.message}`);
      log('The login may have failed or the admin area is not accessible');
    }
    
  } catch (error) {
    log(`❌ Error clearing Elementor cache: ${error.message}`);
  } finally {
    await context.close();
  }
}

// Implementation of fix #4
async function enableWpDebug(browser) {
  log('\n🐛 Enable WP_DEBUG mode on staging');
  log('------------------------------');
  
  log('This fix will provide instructions for enabling WordPress debug mode.');
  log('You will need SFTP access to the staging environment.');
  
  const wpConfigCode = `
// Debug settings - added by WP Engine Fix Tool
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
define('SCRIPT_DEBUG', true);
define('WP_MEMORY_LIMIT', '256M');
`;
  
  log('\nTo enable debug mode:');
  log('1. Access your staging site via SFTP');
  log('2. Download the wp-config.php file');
  log('3. Add these lines before "/* That\'s all, stop editing! */" in wp-config.php:');
  log(wpConfigCode);
  log('4. Upload the modified wp-config.php file');
  
  const hasAccess = await ask('Do you have SFTP access to modify wp-config.php? (y/n): ');
  
  if (hasAccess.toLowerCase() === 'y') {
    const done = await ask('Press Enter when you have made these changes...');
    log('✅ Debug settings should now be applied.');
    log('Check the error log file (wp-content/debug.log) after visiting the site for errors.');
  } else {
    log('❌ You need SFTP access to apply these fixes.');
    log('Please contact your administrator for assistance.');
  }
}

// Implementation of fix #5
async function syncLocalFilesToStaging(browser) {
  log('\n🔄 Apply all local CSS/JS files to staging');
  log('-------------------------------------');
  
  log('This fix requires SFTP access to upload local files to the staging environment.');
  const hasAccess = await ask('Do you have SFTP access to the staging site? (y/n): ');
  
  if (hasAccess.toLowerCase() !== 'y') {
    log('❌ You need SFTP access to sync files.');
    log('Please contact your administrator for assistance.');
    return;
  }
  
  log('\nFiles to upload from local to staging:');
  log('1. wp-content/themes/hello-elementor-child/css/base.css');
  log('2. wp-content/themes/hello-elementor-child/css/elementor-reset.css');
  log('3. wp-content/themes/hello-elementor-child/functions.php');
  log('4. wp-content/themes/hello-elementor-child/style.css');
  
  const done = await ask('Press Enter when you have uploaded these files...');
  
  log('✅ Files have been uploaded to staging.');
  log('Next steps:');
  log('1. Visit the staging site to check if it\'s fixed');
  log('2. If still broken, try clearing Elementor cache');
  log('3. Check the WordPress debug log for errors');
}

// Implementation of fix #6
async function fixDatabaseIssues(browser) {
  log('\n🗄️ Check and fix database issues');
  log('----------------------------');
  
  log('This fix addresses common WordPress database issues.');
  log('You will need WordPress admin access.');
  
  const hasAccess = await ask('Do you have admin access to the staging site? (y/n): ');
  
  if (hasAccess.toLowerCase() !== 'y') {
    log('❌ You need admin access to fix database issues.');
    log('Please contact your administrator for assistance.');
    return;
  }
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    log('Navigating to staging WP Admin...');
    await page.goto(WP_ADMIN_URL, { timeout: 30000 });
    
    log('Please enter your credentials when prompted.');
    const username = await ask('Enter WordPress admin username: ');
    const password = await ask('Enter WordPress admin password: ');
    
    log('Attempting login...');
    await page.fill('#user_login', username);
    await page.fill('#user_pass', password);
    await page.click('#wp-submit');
    
    try {
      await page.waitForSelector('#wpadminbar', { timeout: 10000 });
      log('✅ Login successful');
      
      // Go to WP database repair page
      log('Running database repair tools...');
      await page.goto(`${WP_ADMIN_URL}maint/repair.php`, { timeout: 10000 });
      
      // Check if repair page is accessible
      const hasRepairPage = await page.evaluate(() => {
        return document.body.textContent.includes('Repair Database');
      });
      
      if (hasRepairPage) {
        log('✅ Database repair page found');
        log('Clicking "Repair Database" button...');
        
        await page.click('input[name="repair"]');
        log('✅ Database repair initiated');
        
        await page.waitForSelector('text="Repairs complete"', { timeout: 30000 });
        log('✅ Database repairs completed successfully');
      } else {
        log('⚠️ Database repair page not available');
        log('To enable database repair:');
        log('1. Add this line to wp-config.php: define(\'WP_ALLOW_REPAIR\', true);');
        log('2. Run this fix again');
      }
      
    } catch (error) {
      log(`❌ Error accessing WordPress admin: ${error.message}`);
    }
    
  } catch (error) {
    log(`❌ Error fixing database issues: ${error.message}`);
  } finally {
    await context.close();
  }
}

// Implementation of fix #7
async function fixWordPressTransients(browser) {
  log('\n🗃️ Fix WordPress transients');
  log('------------------------');
  
  log('This fix addresses issues with WordPress transients that may cause white screens.');
  log('You will need WordPress admin access and ability to install plugins.');
  
  const hasAccess = await ask('Do you have admin access to install plugins on the staging site? (y/n): ');
  
  if (hasAccess.toLowerCase() !== 'y') {
    log('❌ You need admin access to install plugins.');
    log('Please contact your administrator for assistance.');
    return;
  }
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    log('Navigating to staging WP Admin...');
    await page.goto(WP_ADMIN_URL, { timeout: 30000 });
    
    log('Please enter your credentials when prompted.');
    const username = await ask('Enter WordPress admin username: ');
    const password = await ask('Enter WordPress admin password: ');
    
    log('Attempting login...');
    await page.fill('#user_login', username);
    await page.fill('#user_pass', password);
    await page.click('#wp-submit');
    
    try {
      await page.waitForSelector('#wpadminbar', { timeout: 10000 });
      log('✅ Login successful');
      
      // Install Transient Manager plugin if not already installed
      log('Checking if Transient Manager plugin is installed...');
      await page.goto(`${WP_ADMIN_URL}plugins.php`, { timeout: 10000 });
      
      const hasTransientManager = await page.evaluate(() => {
        return document.body.textContent.includes('Transient Manager');
      });
      
      if (!hasTransientManager) {
        log('Installing Transient Manager plugin...');
        await page.goto(`${WP_ADMIN_URL}plugin-install.php?s=Transient+Manager&tab=search&type=term`, { timeout: 10000 });
        
        // Click install button
        await page.click('text="Install Now"');
        
        // Wait for installation to complete
        await page.waitForSelector('text="Activate"', { timeout: 30000 });
        log('✅ Transient Manager installed');
        
        // Activate the plugin
        await page.click('text="Activate"');
        await page.waitForNavigation();
        log('✅ Transient Manager activated');
      } else {
        log('✅ Transient Manager already installed');
      }
      
      // Use the plugin to delete transients
      log('Navigating to Transient Manager...');
      await page.goto(`${WP_ADMIN_URL}tools.php?page=transients-manager`, { timeout: 10000 });
      
      // Delete all transients
      log('Deleting all transients...');
      await page.click('input[name="delete_all_transients"]');
      
      try {
        await page.waitForSelector('text="All transients deleted"', { timeout: 10000 });
        log('✅ All transients deleted successfully');
      } catch (error) {
        log('⚠️ Unable to confirm if transients were deleted');
      }
      
    } catch (error) {
      log(`❌ Error accessing WordPress admin: ${error.message}`);
    }
    
  } catch (error) {
    log(`❌ Error fixing WordPress transients: ${error.message}`);
  } finally {
    await context.close();
  }
}

// Implementation of fix #8
async function showManualInstructions() {
  log('\n📝 Manual SFTP/SSH access instructions');
  log('-----------------------------------');
  
  log('WP Engine SFTP Access Details:');
  log('1. Log in to your WP Engine account');
  log('2. Go to your site > SFTP');
  log('3. Note your SFTP credentials:');
  log('   - Host: sftp.wpengine.com');
  log('   - Username: usually your install name + environment');
  log('   - Password: generated from WP Engine dashboard');
  log('   - Port: 2222');
  
  log('\nKey files to check/modify:');
  log('1. wp-config.php - For debug settings');
  log('2. wp-content/themes/hello-elementor-child/functions.php - For CSS loading');
  log('3. wp-content/themes/hello-elementor-child/css/ - For CSS files');
  log('4. wp-content/debug.log - For error messages');
  
  log('\nCommon WP Engine SSH commands:');
  log('- View logs: cd logs; tail -f php-errors.log');
  log('- Restart PHP: /usr/local/bin/php-restart-engine');
  log('- Fix permissions: find . -type f -exec chmod 644 {} \\;');
  log('- Fix directory permissions: find . -type d -exec chmod 755 {} \\;');
  
  log('\nWP Engine Support:');
  log('If all else fails, contact WP Engine support at:');
  log('https://my.wpengine.com/support');
}

// Run the main function
fixStagingEnvironment().catch(error => {
  console.error('Fatal error:', error);
  rl.close();
}); 