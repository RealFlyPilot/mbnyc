# Elementor Troubleshooting Guide

This guide provides solutions to common issues encountered when working with Elementor and the Hello Elementor theme.

## Table of Contents
- [Style Corruption Issues](#style-corruption-issues)
- [Editor Display Problems](#editor-display-problems)
- [CSS Loading Issues](#css-loading-issues)
- [Performance Issues](#performance-issues)
- [Database Issues](#database-issues)

## Style Corruption Issues

### Problem: Elementor Styles Missing or Corrupted

**Symptoms:**
- Elements appear unstyled on the frontend
- Typography settings lost
- Color settings missing
- Layout appears broken
- Default WordPress styling showing instead of Elementor styling

**Solutions:**

1. **Regenerate Elementor CSS**
   - Go to Elementor → Tools → Regenerate CSS
   - This rebuilds all Elementor CSS files

2. **Check for CSS Conflicts**
   - Use browser inspector to identify conflicting styles
   - Ensure Elementor reset styles don't affect the editor (use conditional loading)

3. **Restore Default Elementor Settings**
   - Create a database backup first
   - Reset Elementor settings via Elementor → Tools → Regenerate Data
   - For more severe cases, consider updating the parent theme:
     ```bash
     # Download and extract Hello Elementor theme
     cd /path/to/project
     wget https://downloads.wordpress.org/theme/hello-elementor.latest-stable.zip
     unzip hello-elementor.latest-stable.zip -d app/public/wp-content/themes/
     ```

4. **Fix Corrupted Elementor Data**
   If a database cleanup script or other operation has corrupted Elementor data:

   - Restore from backup if available
   - Recreate the affected pages
   - If many pages are affected, consider the [Database Recovery Script](#recovering-corrupted-elementor-data)

## Editor Display Problems

### Problem: Elementor Editor Shows Abnormal Styling

**Symptoms:**
- Editor interface looks different than expected
- Controls are misplaced or hard to use
- Custom styles affecting the editor UI

**Solutions:**

1. **Separate Frontend and Editor Styles**
   - Conditionally load styles in `functions.php`:
   ```php
   // Only load reset styles on the frontend, not in the editor
   $is_editor = (isset($_GET['elementor-preview']) || is_admin());
   
   if (!$is_editor) {
       wp_enqueue_style(
           'elementor-reset-styles', 
           get_stylesheet_directory_uri() . '/css/elementor-reset.css',
           ['base-styles'],
           '1.0.0'
       );
   }
   ```

2. **Create Editor-Specific Styles**
   - Add a separate CSS file for editor-only styles:
   ```php
   function enqueue_editor_styles() {
       wp_enqueue_style(
           'editor-styles',
           get_stylesheet_directory_uri() . '/css/editor.css',
           [],
           '1.0.0'
       );
   }
   add_action('elementor/editor/before_enqueue_scripts', 'enqueue_editor_styles');
   ```

3. **Clear Browser Cache**
   - Try opening the editor in incognito/private browsing mode
   - Clear browser cache and cookies

4. **Deactivate Plugins**
   - Temporarily deactivate other plugins to check for conflicts

## CSS Loading Issues

### Problem: Custom Styles Not Applying

**Symptoms:**
- Custom styles not showing up on the frontend
- Elementor default styles override your custom styles
- Inconsistent styling between pages

**Solutions:**

1. **Check Style Loading Order**
   - Ensure styles are loaded in the correct order in `functions.php`
   - The recommended order is:
     1. Parent theme styles
     2. CSS Variables
     3. Base styles
     4. Elementor reset styles
     5. Custom styles

2. **Inspect CSS Specificity**
   - Use browser inspector to check which styles are winning in the cascade
   - Add more specific selectors if needed
   - As a last resort, use `!important` (sparingly)

3. **Check for Inline Styles**
   - Elementor adds inline styles that may override stylesheet styles
   - Use the Elementor DOM Output setting to reduce inline CSS
   - Use stronger selectors in your custom CSS

4. **Verify File Paths**
   - Ensure all CSS files are being properly enqueued
   - Check for 404 errors in the browser console

## Performance Issues

### Problem: Slow Page Loading with Elementor

**Symptoms:**
- Pages take a long time to load
- High server resource usage
- Poor PageSpeed Insights scores

**Solutions:**

1. **Optimize Elementor Settings**
   - Go to Elementor → Settings → Advanced
   - Enable "Improved Asset Loading"
   - Disable unused widgets

2. **Minify and Combine CSS/JS**
   - Use a caching plugin like WP Rocket or Autoptimize
   - Enable CSS and JS minification
   - Consider using Critical CSS

3. **Optimize Images**
   - Use WebP format for images
   - Enable lazy loading
   - Resize images to actual display dimensions

4. **Reduce Server Requests**
   - Combine multiple CSS files
   - Use icon fonts instead of multiple SVG/PNG files
   - Consider using asset bundling

## Database Issues

### Problem: Corrupted Elementor Data in Database

**Symptoms:**
- Pages don't load in Elementor editor
- JSON parsing errors
- Missing elements or content

**Solutions:**

1. **Restore from Backup**
   - Always the safest option
   - Restore the `wp_postmeta` table which contains Elementor data

2. **Repair Individual Pages**
   - Edit the page in a text editor
   - Look for the `_elementor_data` entry in the database
   - Fix any corrupted JSON

### Recovering Corrupted Elementor Data

For severe cases where many pages are affected, consider creating a recovery script:

```php
<?php
// Elementor Data Recovery Script
// WARNING: Always back up your database before running this script

// Load WordPress
$wp_load_paths = [
    './wp-load.php',
    '../wp-load.php',
    '../../wp-load.php',
    '../../../wp-load.php',
    '../../../../wp-load.php',
    '/var/www/html/wp-load.php',
    '/var/www/wp-load.php',
    '/home/user/public_html/wp-load.php'
];

foreach ($wp_load_paths as $path) {
    if (file_exists($path)) {
        require_once($path);
        break;
    }
}

// Security check
if (!function_exists('wp_get_current_user') || !current_user_can('manage_options')) {
    die('Access denied. Administrator privileges required.');
}

// Function to restore Elementor data
function restore_elementor_elements($elements, $restore_typography = true, $restore_colors = true) {
    foreach ($elements as &$element) {
        // Restore typography settings
        if ($restore_typography && isset($element['settings'])) {
            // Add default typography settings here
        }
        
        // Restore color settings
        if ($restore_colors && isset($element['settings'])) {
            // Add default color settings here
        }
        
        // Process child elements recursively
        if (!empty($element['elements'])) {
            $element['elements'] = restore_elementor_elements(
                $element['elements'], 
                $restore_typography, 
                $restore_colors
            );
        }
    }
    
    return $elements;
}

// Display form for user input
if (!isset($_POST['submit'])) {
    ?>
    <form method="post" action="">
        <h2>Elementor Style Recovery Tool</h2>
        <p><strong>Warning:</strong> This will modify your database. Create a backup before proceeding.</p>
        
        <h3>What to restore:</h3>
        <label><input type="checkbox" name="restore_typography" checked> Typography</label><br>
        <label><input type="checkbox" name="restore_colors" checked> Colors</label><br>
        <label><input type="checkbox" name="restore_buttons" checked> Buttons</label><br>
        <label><input type="checkbox" name="restore_headings" checked> Headings</label><br>
        
        <h3>Scope:</h3>
        <label><input type="radio" name="scope" value="all"> Restore all pages</label><br>
        <label><input type="radio" name="scope" value="specific" checked> Restore specific page</label><br>
        <label>Page ID: <input type="number" name="page_id"></label><br>
        
        <p><input type="submit" name="submit" value="Start Recovery"></p>
    </form>
    <?php
} else {
    // Process form submission
    $restore_typography = isset($_POST['restore_typography']);
    $restore_colors = isset($_POST['restore_colors']);
    $restore_buttons = isset($_POST['restore_buttons']);
    $restore_headings = isset($_POST['restore_headings']);
    $scope = $_POST['scope'];
    $page_id = isset($_POST['page_id']) ? intval($_POST['page_id']) : 0;
    
    // Perform recovery based on user selections
    if ($scope === 'specific' && $page_id > 0) {
        // Process specific page
    } else {
        // Process all pages
    }
}
```

## Best Practices to Avoid Issues

1. **Regular Backups**
   - Always create backups before making changes
   - Automate database backups

2. **Use Version Control**
   - Keep theme files in Git
   - Track changes to custom CSS files

3. **Follow the CSS Architecture**
   - Use CSS variables for consistent styling
   - Follow the proper loading order
   - Use the Elementor styling guide

4. **Test Major Changes**
   - Use a staging environment for testing
   - Check both frontend and editor functionality 