const { test, expect } = require('@playwright/test');

const environments = [
  { name: 'local', url: 'https://mbnyc.local/' },
  { name: 'staging', url: 'https://mbnycd.wpenginepowered.com/' }
];

for (const env of environments) {
  test(`${env.name}: Page loads without white screen`, async ({ page }) => {
    console.log(`Testing ${env.name} environment at ${env.url}`);
    
    try {
      const response = await page.goto(env.url, { timeout: 30000 });
      
      // Check if page loaded successfully
      expect(response.status()).toBeLessThan(400); // Any successful status code
      
      // Check if page has content (not white screen)
      const bodyContent = await page.evaluate(() => document.body.innerText);
      expect(bodyContent.length).toBeGreaterThan(50);
      
      // Check for common WordPress elements
      const hasHeader = await page.$$eval('header, .header, #header', elements => elements.length > 0);
      const hasFooter = await page.$$eval('footer, .footer, #footer', elements => elements.length > 0);
      const hasContent = await page.$$eval('main, #content, .content, article', elements => elements.length > 0);
      
      expect(hasHeader || hasFooter || hasContent).toBeTruthy();
      
      // Take screenshot for visual verification
      await page.screenshot({ path: `./tests/${env.name}-screenshot.png`, fullPage: true });
      
      console.log(`✅ ${env.name} environment test passed`);
    } catch (error) {
      console.error(`❌ Error testing ${env.name} environment:`, error);
      
      // Take screenshot even if test fails
      try {
        await page.screenshot({ path: `./tests/${env.name}-error-screenshot.png`, fullPage: true });
      } catch (screenshotError) {
        console.error('Could not take error screenshot:', screenshotError);
      }
      
      throw error;
    }
  });
  
  test(`${env.name}: No PHP errors visible`, async ({ page }) => {
    console.log(`Testing ${env.name} for visible PHP errors`);
    
    try {
      await page.goto(env.url, { timeout: 30000 });
      
      // Check for visible PHP errors
      const hasPhpErrors = await page.evaluate(() => {
        const text = document.body.innerText;
        return text.includes('Fatal error') || 
               text.includes('Parse error') || 
               text.includes('Warning:') || 
               text.includes('Notice:') ||
               text.includes('Uncaught Error');
      });
      
      expect(hasPhpErrors).toBeFalsy();
      console.log(`✅ ${env.name} environment has no visible PHP errors`);
    } catch (error) {
      console.error(`❌ Error testing ${env.name} for PHP errors:`, error);
      throw error;
    }
  });
} 