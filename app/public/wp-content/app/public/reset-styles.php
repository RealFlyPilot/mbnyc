<?php
/**
 * Reset All Styles Script
 * 
 * This script resets all styling to default for both Elementor and WordPress Customizer
 * Run it by visiting http://mbnyc.local/reset-styles.php in your browser
 * (Replace mbnyc.local with your actual Local site URL)
 */

// Load WordPress
require_once 'wp-load.php';

// Verify admin access for security
if (!current_user_can('administrator')) {
    die('You need to be an administrator to run this script.');
}

// Include the individual reset scripts
require_once 'reset-elementor.php';
require_once 'reset-customizer.php';

// Execute both resets
$elementor_results = reset_elementor_settings();
$customizer_results = reset_customizer_settings();

// Display combined results
echo '<html><head><title>Reset All Styles</title>';
echo '<style>
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; color: #333; }
h1, h2 { color: #000; }
h1 { margin-bottom: 20px; }
h2 { margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
.message { background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; }
.success { background-color: #d4edda; color: #155724; }
.warning { background-color: #fff3cd; color: #856404; }
ul { background-color: #f8f9fa; padding: 15px 15px 15px 40px; border-radius: 5px; }
.return-link { margin-top: 30px; }
.return-link a { display: inline-block; background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px; }
.return-link a:hover { background-color: #333; }
</style>';
echo '</head><body>';
echo '<h1>Reset All Styles</h1>';

echo '<div class="message success">All style settings have been reset to factory defaults.</div>';

// Elementor results
echo '<h2>Elementor Reset Results</h2>';
echo '<div class="message ' . $elementor_results['status'] . '">' . $elementor_results['message'] . '</div>';
echo '<ul>';
foreach ($elementor_results['details'] as $detail) {
    echo '<li>' . $detail . '</li>';
}
echo '</ul>';

// Customizer results
echo '<h2>Customizer Reset Results</h2>';
echo '<div class="message ' . $customizer_results['status'] . '">' . $customizer_results['message'] . '</div>';
echo '<ul>';
foreach ($customizer_results['details'] as $detail) {
    echo '<li>' . $detail . '</li>';
}
echo '</ul>';

// Important note
echo '<div class="message warning">Important: You may need to clear your browser cache and refresh the page to see all changes.</div>';

echo '<div class="return-link">
    <a href="' . home_url() . '">Return to Site</a>
    <a href="' . admin_url('customize.php') . '">Go to Customizer</a>
    <a href="' . admin_url('edit.php?post_type=elementor_library') . '">Go to Elementor Templates</a>
</div>';
echo '</body></html>'; 