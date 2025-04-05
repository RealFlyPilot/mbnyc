/**
 * Simple Headless Check for WordPress White Screen Issues
 * This script doesn't open any browser windows and runs entirely in the background.
 */

const { chromium } = require('@playwright/test');

// Target site to check
const STAGING_URL = 'https://mbnycd.wpenginepowered.com/';

async function checkSiteForWhiteScreen() {
  console.log(`🔍 Checking site for white screen issues: ${STAGING_URL}`);
  
  // Launch headless browser
  const browser = await chromium.launch({ headless: true });
  
  try {
    // Create a new page
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to the site
    console.log('Navigating to site...');
    const response = await page.goto(STAGING_URL, { 
      timeout: 30000,
      waitUntil: 'networkidle'
    }).catch(error => {
      console.error(`❌ Failed to load site: ${error.message}`);
      return null;
    });
    
    if (!response) {
      console.error('❌ Site could not be accessed. Check connectivity or server status.');
      return;
    }
    
    // Check status code
    const status = response.status();
    console.log(`Status code: ${status}`);
    
    if (status !== 200) {
      console.error(`❌ Site returned non-200 status code: ${status}`);
      
      if (status === 500) {
        console.error('💥 Server error detected. This is likely a PHP error or server misconfiguration.');
      } else if (status === 404) {
        console.error('💥 Page not found. The URL may be incorrect or the site structure changed.');
      } else {
        console.error(`💥 HTTP error ${status} detected.`);
      }
      
      return;
    }
    
    // Check if page has content
    const bodyContent = await page.evaluate(() => document.body ? document.body.innerText : '');
    const bodyLength = bodyContent.length;
    
    console.log(`Body content length: ${bodyLength} characters`);
    
    if (bodyLength < 50) {
      console.error('❌ White screen detected - page has minimal or no content.');
      
      // Check HTML structure
      const htmlStructure = await page.evaluate(() => {
        return {
          doctype: document.doctype ? document.doctype.name : null,
          hasHtml: document.querySelector('html') !== null,
          hasHead: document.querySelector('head') !== null,
          hasBody: document.querySelector('body') !== null,
          hasBrokenStructure: !document.doctype || !document.querySelector('html') || 
                            !document.querySelector('head') || !document.querySelector('body')
        };
      });
      
      console.log('HTML structure analysis:');
      console.log(` - DOCTYPE: ${htmlStructure.doctype || 'Missing'}`);
      console.log(` - HTML tag: ${htmlStructure.hasHtml ? 'Present' : 'Missing'}`);
      console.log(` - HEAD tag: ${htmlStructure.hasHead ? 'Present' : 'Missing'}`);
      console.log(` - BODY tag: ${htmlStructure.hasBody ? 'Present' : 'Missing'}`);
      
      if (htmlStructure.hasBrokenStructure) {
        console.error('💥 Broken HTML structure detected. Likely a PHP fatal error.');
        console.log('\nRecommended actions:');
        console.log('1. Enable WP_DEBUG in wp-config.php');
        console.log('2. Check PHP error logs');
        console.log('3. Look for syntax errors in theme or plugin files');
      }
      
      // Check for resources
      const resources = await page.evaluate(() => {
        return {
          stylesheets: document.querySelectorAll('link[rel="stylesheet"]').length,
          scripts: document.querySelectorAll('script').length
        };
      });
      
      console.log(`\nResource count:`);
      console.log(` - Stylesheets: ${resources.stylesheets}`);
      console.log(` - Scripts: ${resources.scripts}`);
      
      if (resources.stylesheets === 0) {
        console.error('💥 No stylesheets detected. Theme may not be properly loaded.');
      }
      
      console.log('\nQuick remediation steps:');
      console.log('1. Check theme activation status');
      console.log('2. Run the "npm run diagnosis" tool for more detailed analysis');
      console.log('3. Enable debug logging to capture PHP errors');
      console.log('4. Check for broken plugins or themes');
      
    } else {
      console.log('✅ Site appears to have content. No white screen detected.');
      
      // Additional checks
      const title = await page.title();
      console.log(`Page title: "${title}"`);
      
      // Check for common elements
      const hasWordPressElements = await page.evaluate(() => {
        const hasWpAdmin = document.querySelector('#wpadminbar') !== null;
        const hasContentArea = document.querySelector('#content, .content, [role="main"], main, article') !== null;
        const hasFooter = document.querySelector('footer, .footer') !== null;
        
        return {
          adminBar: hasWpAdmin,
          contentArea: hasContentArea,
          footer: hasFooter
        };
      });
      
      console.log('\nWordPress elements check:');
      console.log(` - Admin bar: ${hasWordPressElements.adminBar ? 'Present' : 'Missing'}`);
      console.log(` - Content area: ${hasWordPressElements.contentArea ? 'Present' : 'Missing'}`);
      console.log(` - Footer: ${hasWordPressElements.footer ? 'Present' : 'Missing'}`);
      
      if (!hasWordPressElements.contentArea) {
        console.warn('⚠️ No main content area detected. Page might not be rendering correctly.');
      }
    }
    
  } catch (error) {
    console.error(`Error during check: ${error.message}`);
  } finally {
    await browser.close();
  }
}

// Run the check
checkSiteForWhiteScreen().catch(console.error); 