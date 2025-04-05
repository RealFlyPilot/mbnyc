const { test, expect } = require('@playwright/test');

const environments = [
  { name: 'local', url: 'https://mbnyc.local/' },
  { name: 'staging', url: 'https://mbnycd.wpenginepowered.com/' }
];

for (const env of environments) {
  test(`${env.name}: HTML structure check for white screen diagnosis`, async ({ page }) => {
    console.log(`Testing HTML structure for ${env.name} at ${env.url}`);
    
    try {
      // Use a longer timeout since we're testing a potentially problematic site
      await page.goto(env.url, { timeout: 60000, waitUntil: 'networkidle' });
      
      // Get raw HTML - useful to diagnose white screens
      const html = await page.content();
      
      // Log first 500 chars of HTML for diagnosis if needed
      console.log(`First 500 chars of HTML for ${env.name}:`, html.substring(0, 500));
      
      // Check if HTML structure is valid
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('<body');
      
      // Check for empty body, which would indicate a white screen
      const bodyContent = await page.evaluate(() => {
        // Remove all whitespace to check if body is truly empty
        return document.body.innerText.trim();
      });
      
      // Save the HTML to a file for inspection
      const fs = require('fs');
      fs.writeFileSync(`./tests/${env.name}-page.html`, html);
      
      console.log(`Body content length for ${env.name}: ${bodyContent.length} characters`);
      
      if (bodyContent.length < 10) {
        // Log additional diagnostics for near-empty pages
        const scripts = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('script')).map(s => s.src || 'inline script');
        });
        
        console.log(`Scripts on ${env.name}:`, scripts);
        
        // Check for HTML comments that might contain error messages
        const comments = await page.evaluate(() => {
          const comments = [];
          const iterator = document.createNodeIterator(
            document.documentElement,
            NodeFilter.SHOW_COMMENT
          );
          let comment;
          while (comment = iterator.nextNode()) {
            comments.push(comment.textContent);
          }
          return comments;
        });
        
        console.log(`HTML comments on ${env.name}:`, comments);
      }
      
      // This test will fail if the body content is essentially empty
      expect(bodyContent.length).toBeGreaterThan(10);
      
      console.log(`✅ ${env.name} HTML structure test passed`);
    } catch (error) {
      console.error(`❌ Error testing ${env.name} HTML structure:`, error);
      
      // Attempt to still get diagnostics even if the test fails
      try {
        const html = await page.content();
        const fs = require('fs');
        fs.writeFileSync(`./tests/${env.name}-error-page.html`, html);
      } catch (saveError) {
        console.error('Could not save error HTML:', saveError);
      }
      
      throw error;
    }
  });
} 