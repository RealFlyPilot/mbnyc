const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const puppeteer = require('puppeteer');
const util = require('util');
const execPromise = util.promisify(exec);
const { execSync } = require('child_process');
const FormData = require('form-data');
const https = require('https');

// Configuration
const CONFIG = {
  localUrl: 'http://mbnyc.local',
  devUrl: 'https://mbnycd.wpenginepowered.com',
  wpEngineSftp: 'mbnycd@mbnycd.sftp.wpengine.com',
  sshIdentityFile: '~/.ssh/wpengine_ed25519',
  deployKey: 'your-secret-deploy-key-here',
  resetScripts: [
    'reset-elementor.php',
    'reset-customizer.php',
    'reset-styles.php'
  ],
  scriptsDir: path.join(process.cwd(), '/app/public/'),
  tempDir: path.join(process.cwd(), 'temp-scripts')
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Helper to log with colors
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Deploy reset scripts to the development server
async function deployResetScripts() {
  log(`🚀 Deploying reset scripts to development server...`, colors.cyan);
  
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(CONFIG.tempDir)) {
    fs.mkdirSync(CONFIG.tempDir, { recursive: true });
  }
  
  // Copy reset scripts to temp directory
  for (const script of CONFIG.resetScripts) {
    const sourceFile = path.join(CONFIG.scriptsDir, script);
    const targetFile = path.join(CONFIG.tempDir, script);
    
    try {
      fs.copyFileSync(sourceFile, targetFile);
      log(`✅ Copied ${script} to temp directory`, colors.green);
    } catch (error) {
      log(`❌ Failed to copy ${script}: ${error.message}`, colors.red);
      return false;
    }
  }
  
  // Try SFTP deployment first
  const sftpSuccess = await deploySftpScripts();
  
  // If SFTP fails, try HTTP deployment
  if (!sftpSuccess) {
    log(`⚠️ SFTP deployment failed, trying HTTP method...`, colors.yellow);
    const httpSuccess = await deployScriptsViaHttp();
    
    if (!httpSuccess) {
      log(`❌ All deployment methods failed. Aborting.`, colors.red);
      return false;
    }
  }
  
  return true;
}

// Create a new function for the SFTP deployment
async function deploySftpScripts() {
  // Create SFTP batch commands
  const batchFile = path.join(CONFIG.tempDir, 'sftp-commands.txt');
  const sftpCommands = CONFIG.resetScripts.map(script => {
    const localFile = path.join(CONFIG.tempDir, script).replace(/ /g, '\\ ');
    return `put "${localFile}" /sites/mbnycd/public_html/${script}`;
  }).join('\n');
  
  log(`📤 Uploading scripts to WP Engine...`, colors.cyan);
  log(`📋 SFTP Commands:\n${sftpCommands}`, colors.yellow);
  fs.writeFileSync(batchFile, sftpCommands);
  
  try {
    log(`🔄 Connecting to SFTP server with timeout...`, colors.cyan);
    const { stdout, stderr } = await execPromise(
      `sftp -o ConnectTimeout=10 -i ${CONFIG.sshIdentityFile} -b "${batchFile}" ${CONFIG.wpEngineSftp}`
    );
    
    if (stdout) log(`📥 SFTP output: ${stdout}`, colors.green);
    if (stderr && stderr.length > 0) {
      log(`⚠️ SFTP warnings: ${stderr}`, colors.yellow);
    }
    
    log(`✅ Scripts deployed successfully`, colors.green);
    return true;
  } catch (error) {
    log(`❌ Failed to deploy reset scripts: ${error.message}`, colors.red);
    console.error(`⚠️ Error details: ${error.stderr || 'No additional error details'}`);
    log(`⚠️ Checking SFTP connection...`, colors.yellow);
    
    try {
      const { stdout: testOutput, stderr: testError } = await execPromise(
        `echo "ls" | sftp -o ConnectTimeout=5 -i ${CONFIG.sshIdentityFile} ${CONFIG.wpEngineSftp}`
      );
      log(`🔍 Connection test output: ${testOutput || 'No output'}`, colors.cyan);
      if (testError) log(`🔍 Connection test error: ${testError}`, colors.yellow);
    } catch (connError) {
      log(`❌ SFTP connection test failed: ${connError.message}`, colors.red);
      log(`💡 Possible reasons for connection failure:`, colors.yellow);
      log(`   1. Network connectivity issues`, colors.yellow);
      log(`   2. Incorrect SFTP credentials`, colors.yellow);
      log(`   3. Firewall blocking port 22`, colors.yellow);
      log(`   4. VPN requirements for connection`, colors.yellow);
      log(`   5. Server may be down or rejecting connections`, colors.yellow);
    }
    
    return false;
  }
}

// Execute reset scripts on the dev server using Puppeteer
async function executeResetScripts() {
  log('\n🔄 Executing reset scripts on development server...', colors.cyan);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  page.on('console', msg => log(`Browser console: ${msg.text()}`));
  
  try {
    // Execute each script in order
    for (const script of CONFIG.resetScripts) {
      log(`🔄 Executing ${script}...`, colors.yellow);
      
      // Navigate to the script
      await page.goto(`${CONFIG.devUrl}/${script}`, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      
      // Take screenshot of the result
      const screenshotPath = path.join(process.cwd(), `${script.replace('.php', '')}-result.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      log(`📸 Screenshot saved: ${screenshotPath}`, colors.green);
      
      // Check if script executed successfully
      const pageContent = await page.content();
      const success = pageContent.includes('success') || 
                      pageContent.includes('settings reset successfully');
      
      if (success) {
        log(`✅ ${script} executed successfully`, colors.green);
      } else {
        log(`⚠️ ${script} may not have executed correctly. Check the screenshot.`, colors.yellow);
      }
    }
    
    log('\n✅ All reset scripts executed on development server', colors.green);
    return true;
  } catch (error) {
    log(`❌ Failed to execute reset scripts: ${error.message}`, colors.red);
    return false;
  } finally {
    await browser.close();
  }
}

// Clear server-side cache on WP Engine
async function clearWpEngineCache() {
  log('\n🧹 Clearing WP Engine cache...', colors.cyan);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Go to the WP Engine cache clear URL
    await page.goto(`${CONFIG.devUrl}/_wpeprivate/flush-cache.php`, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    const pageContent = await page.content();
    const success = pageContent.includes('Cache Flush Succeeded') || 
                    pageContent.includes('succeeded');
    
    if (success) {
      log('✅ WP Engine cache cleared successfully', colors.green);
    } else {
      log('⚠️ WP Engine cache may not have been cleared. Manual action may be required.', colors.yellow);
    }
    
    return true;
  } catch (error) {
    log(`❌ Failed to clear WP Engine cache: ${error.message}`, colors.red);
    return false;
  } finally {
    await browser.close();
  }
}

// Clear Elementor cache via WP CLI command on WP Engine
async function clearElementorCache() {
  log('\n🧹 Clearing Elementor cache via WP CLI...', colors.cyan);
  
  try {
    // Use WP CLI to regenerate Elementor CSS
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Go to a special endpoint to trigger WP CLI commands (you may need to create this)
    // This is a placeholder - you'll need to implement a PHP endpoint for this on WP Engine
    await page.goto(`${CONFIG.devUrl}/wp-admin/admin-ajax.php?action=regenerate_elementor_css`, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    log('✅ Elementor cache cleared request completed', colors.green);
    await browser.close();
    
    return true;
  } catch (error) {
    log(`❌ Failed to clear Elementor cache: ${error.message}`, colors.red);
    return false;
  }
}

// Run a local comparison to verify the changes
async function runComparison() {
  log('\n📊 Running environment comparison to verify changes...', colors.cyan);
  
  try {
    // Install required packages if not already installed
    await execPromise('npm list pixelmatch || npm install pixelmatch');
    await execPromise('npm list pngjs || npm install pngjs');
    
    // Run the comparison script
    await execPromise('node compare-environments.js');
    
    log('✅ Comparison completed. Check the report for details.', colors.green);
    return true;
  } catch (error) {
    log(`❌ Failed to run comparison: ${error.message}`, colors.red);
    return false;
  }
}

// Cleanup deployed scripts after execution
async function cleanupRemoteScripts() {
  log('\n🧹 Cleaning up remote scripts...', colors.cyan);
  
  try {
    const tempDir = path.join(process.cwd(), 'temp-cleanup');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    // Create batch file for SFTP commands to remove scripts
    const sftpCommands = CONFIG.resetScripts.map(script => 
      `rm /sites/mbnycd/public_html/${script}`
    ).join('\n');
    
    const batchFile = path.join(tempDir, 'sftp-cleanup.txt');
    fs.writeFileSync(batchFile, sftpCommands);
    
    // Execute SFTP batch delete
    const { stdout, stderr } = await execPromise(
      `sftp -b ${batchFile} ${CONFIG.wpEngineSftp}`
    );
    
    log('✅ Remote scripts cleaned up', colors.green);
    
    // Clean up temp directory
    fs.unlinkSync(batchFile);
    fs.rmdirSync(tempDir);
    
    return true;
  } catch (error) {
    log(`⚠️ Failed to clean up remote scripts: ${error.message}. Manual cleanup may be required.`, colors.yellow);
    return false;
  }
}

// Update the deploy function to try HTTP method if SFTP fails
async function deployScriptsViaHttp() {
  log(`🔄 Attempting HTTP deployment as fallback...`, colors.cyan);
  
  // If the WP Engine site has a basic deployment endpoint set up, 
  // we could use that as a fallback mechanism
  
  try {
    const deployEndpoint = 'https://mbnycd.wpenginepowered.com/deploy-scripts.php';
    log(`📡 Checking if HTTP deployment endpoint exists...`, colors.yellow);
    
    // Check if deployment endpoint exists
    const response = await fetch(deployEndpoint, {
      method: 'HEAD',
      agent: new https.Agent({
        rejectUnauthorized: false // For testing only - remove in production
      })
    });
    
    if (response.ok) {
      log(`✅ HTTP deployment endpoint found. Uploading scripts...`, colors.green);
      
      // Loop through scripts and upload them one by one
      for (const script of CONFIG.resetScripts) {
        const scriptPath = path.join(CONFIG.tempDir, script);
        const scriptContent = fs.readFileSync(scriptPath, 'utf8');
        
        const formData = new FormData();
        formData.append('script_name', script);
        formData.append('script_content', scriptContent);
        formData.append('deploy_key', CONFIG.deployKey);
        
        const uploadResponse = await fetch(deployEndpoint, {
          method: 'POST',
          body: formData,
          agent: new https.Agent({
            rejectUnauthorized: false // For testing only - remove in production
          })
        });
        
        if (uploadResponse.ok) {
          const result = await uploadResponse.text();
          log(`✅ Uploaded ${script} via HTTP: ${result}`, colors.green);
        } else {
          throw new Error(`HTTP upload failed for ${script}: ${uploadResponse.statusText}`);
        }
      }
      
      return true;
    } else {
      log(`❌ HTTP deployment endpoint not found. Status: ${response.status}`, colors.red);
      return false;
    }
  } catch (error) {
    log(`❌ HTTP deployment failed: ${error.message}`, colors.red);
    return false;
  }
}

// Main function
async function syncDevStyles() {
  log('\n🚀 Starting development environment style synchronization', colors.bright + colors.cyan);
  
  // 1. Deploy reset scripts
  const deploySuccess = await deployResetScripts();
  if (!deploySuccess) {
    log('❌ Failed to deploy scripts. Aborting.', colors.red);
    return;
  }
  
  // 2. Execute reset scripts
  const executeSuccess = await executeResetScripts();
  if (!executeSuccess) {
    log('❌ Failed to execute scripts. Continuing with cache clearing...', colors.yellow);
  }
  
  // 3. Clear WP Engine cache
  await clearWpEngineCache();
  
  // 4. Clear Elementor cache
  await clearElementorCache();
  
  // 5. Cleanup remote scripts
  await cleanupRemoteScripts();
  
  // 6. Run comparison
  await runComparison();
  
  log('\n✅ Style synchronization process completed!', colors.bright + colors.green);
  log('📊 Check the comparison report to verify the changes.', colors.bright);
}

// Run the script
syncDevStyles().catch(error => {
  log(`❌ Unhandled error: ${error.message}`, colors.red);
  process.exit(1);
}); 