<?php
/**
 * Reset Customizer Settings Script
 * 
 * This script resets WordPress Customizer settings to their default values
 * Run it by visiting http://mbnyc.local/reset-customizer.php in your browser
 * (Replace mbnyc.local with your actual Local site URL)
 */

// Load WordPress
require_once 'wp-load.php';

// Verify admin access for security
if (!current_user_can('administrator')) {
    die('You need to be an administrator to run this script.');
}

// Function to reset Customizer settings
function reset_customizer_settings() {
    $results = array(
        'status' => 'success',
        'message' => 'Customizer settings reset successfully:',
        'details' => array()
    );
    
    // 1. Get the theme mods
    $theme = get_option('stylesheet');
    $theme_mods = get_option("theme_mods_$theme");
    
    if ($theme_mods) {
        $results['details'][] = "Found theme mods for theme: $theme";
        
        // Track which keys we're keeping
        $preserved_keys = array('nav_menu_locations');
        $preserved_data = array();
        
        // Preserve menu locations
        foreach ($preserved_keys as $key) {
            if (isset($theme_mods[$key])) {
                $preserved_data[$key] = $theme_mods[$key];
                $results['details'][] = "Preserved $key setting";
            }
        }
        
        // Delete theme mods
        delete_option("theme_mods_$theme");
        $results['details'][] = "Deleted all theme mods";
        
        // Restore preserved settings
        if (!empty($preserved_data)) {
            update_option("theme_mods_$theme", $preserved_data);
            $results['details'][] = "Restored preserved settings";
        }
    } else {
        $results['details'][] = "No theme mods found for theme: $theme";
    }
    
    // 2. Reset any Hello Elementor theme-specific options
    $hello_elementor_options = array(
        'hello_elementor_settings',
        'hello-elementor-settings',
        'hello_elementor_header_footer',
        'hello_elementor_header_logo',
        'hello_elementor_header_menu',
        'hello_elementor_footer_logo',
        'hello_elementor_footer_copyright',
    );
    
    foreach ($hello_elementor_options as $option) {
        if (get_option($option) !== false) {
            delete_option($option);
            $results['details'][] = "Reset option: $option";
        }
    }
    
    // 3. Delete customizer CSS cache
    $css_option = 'hello-elementor-custom-css';
    if (get_option($css_option) !== false) {
        delete_option($css_option);
        $results['details'][] = "Reset custom CSS option: $css_option";
    }
    
    // 4. Clear any transients related to customizer
    global $wpdb;
    $transients = $wpdb->get_col("SELECT option_name FROM $wpdb->options WHERE option_name LIKE '%_transient_customiz%'");
    
    if (!empty($transients)) {
        foreach ($transients as $transient) {
            $name = str_replace('_transient_', '', $transient);
            delete_transient($name);
            $results['details'][] = "Deleted transient: $name";
        }
    } else {
        $results['details'][] = "No customizer transients found";
    }
    
    return $results;
}

// Execute the reset
$reset_results = reset_customizer_settings();

// Display results
echo '<html><head><title>Reset Customizer Settings</title>';
echo '<style>
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; color: #333; }
h1 { color: #000; margin-bottom: 20px; }
.message { background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; }
.success { background-color: #d4edda; color: #155724; }
ul { background-color: #f8f9fa; padding: 15px 15px 15px 40px; border-radius: 5px; }
.return-link { margin-top: 30px; }
.return-link a { display: inline-block; background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
.return-link a:hover { background-color: #333; }
</style>';
echo '</head><body>';
echo '<h1>Reset Customizer Settings</h1>';

echo '<div class="message ' . $reset_results['status'] . '">' . $reset_results['message'] . '</div>';

echo '<ul>';
foreach ($reset_results['details'] as $detail) {
    echo '<li>' . $detail . '</li>';
}
echo '</ul>';

echo '<div class="return-link"><a href="' . home_url() . '">Return to Site</a> | <a href="' . admin_url('customize.php') . '">Go to Customizer</a></div>';
echo '</body></html>'; 