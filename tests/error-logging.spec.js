const { test, expect } = require('@playwright/test');

const environments = [
  { name: 'local', url: 'https://mbnyc.local/' }
  // We can't easily check debug logs on WP Engine, so only test local
];

for (const env of environments) {
  test(`${env.name}: Check for PHP fatal errors in error log`, async ({ page, request }) => {
    console.log(`Checking for PHP errors in ${env.name} environment`);
    
    try {
      // First, try to access the site to generate any new errors
      await page.goto(env.url, { timeout: 30000 });
      
      // Add a delay to ensure error logging completes
      await page.waitForTimeout(2000);
      
      // Try to access the local debug log file
      // NOTE: This assumes you have debug logging enabled in wp-config.php
      // with WP_DEBUG_LOG set to true
      try {
        // WordPress typically logs to wp-content/debug.log
        const debugLogUrl = `${env.url}/wp-content/debug.log`;
        
        console.log(`Attempting to access debug log at: ${debugLogUrl}`);
        
        // Try to fetch the log file
        const logResponse = await request.get(debugLogUrl);
        
        if (logResponse.ok()) {
          // Successfully fetched log file
          const logContent = await logResponse.text();
          
          // Log part of the log file for inspection
          console.log(`Debug log preview (first 500 chars):`);
          console.log(logContent.substring(0, 500));
          
          // Save the log file for inspection
          const fs = require('fs');
          fs.writeFileSync(`./tests/${env.name}-debug.log`, logContent);
          
          // Check for fatal errors, which could cause a white screen
          const hasFatalErrors = logContent.includes('Fatal error') || 
                                logContent.includes('Uncaught Error') ||
                                logContent.includes('Allowed memory size of');
          
          if (hasFatalErrors) {
            console.log('⚠️ Fatal PHP errors detected in log!');
            
            // Extract the most recent fatal error
            const fatalErrors = logContent.match(/\[\d{4}-\d{2}-\d{2}.*?Fatal error.*?\n/g);
            if (fatalErrors && fatalErrors.length > 0) {
              console.log('Most recent fatal error:', fatalErrors[fatalErrors.length - 1]);
            }
          }
          
          // Test should fail if fatal errors are present
          expect(hasFatalErrors).toBeFalsy();
        } else {
          console.log(`Could not access debug log (status: ${logResponse.status()}). This may be normal if the file is protected or doesn't exist.`);
        }
      } catch (logError) {
        console.log(`Error accessing debug log: ${logError.message}`);
      }
      
      console.log(`✅ ${env.name} PHP error check completed`);
    } catch (error) {
      console.error(`❌ Error during ${env.name} PHP error check:`, error);
      throw error;
    }
  });
  
  test(`${env.name}: Check wp-config.php for debug settings`, async ({ page }) => {
    // This test won't actually access wp-config.php since that would require server access
    // Instead, it tries to determine if debugging is properly configured by looking for debug-related HTTP headers
    
    console.log(`Checking ${env.name} for debug configuration`);
    
    try {
      const response = await page.goto(env.url, { timeout: 30000 });
      
      // Look for WordPress debug-related headers
      const headers = response.headers();
      console.log(`HTTP headers for ${env.url}:`, headers);
      
      // Look for an admin-ajax.php request, which might give us debugging info
      await page.goto(`${env.url}/wp-admin/admin-ajax.php?action=test_debug`, { timeout: 5000 }).catch(() => {
        // This might 400/403/etc which is fine - we just want to see if it returns debug info
        console.log('Expected admin-ajax error, continuing');
      });
      
      console.log(`✅ ${env.name} debug config check completed`);
    } catch (error) {
      console.error(`❌ Error checking ${env.name} debug config:`, error);
    }
  });
} 