<?php
/**
 * Reset Elementor Settings Script
 * 
 * This script resets Elementor default styles to their factory defaults
 * Run it by visiting http://mbnyc.local/reset-elementor.php in your browser
 * (Replace mbnyc.local with your actual Local site URL)
 */

// Load WordPress
require_once 'wp-load.php';

// Verify admin access for security
if (!current_user_can('administrator')) {
    die('You need to be an administrator to run this script.');
}

// Function to reset Elementor settings
function reset_elementor_settings() {
    $results = array(
        'status' => 'success',
        'message' => 'Elementor settings reset successfully:',
        'details' => array()
    );
    
    // 1. Reset the active kit settings
    $active_kit_id = get_option('elementor_active_kit');
    if ($active_kit_id) {
        $results['details'][] = "Found active kit ID: $active_kit_id";
        
        // Reset the kit's meta data
        $meta_key = '_elementor_page_settings';
        $current_meta = get_post_meta($active_kit_id, $meta_key, true);
        
        if ($current_meta) {
            $results['details'][] = "Found kit meta data: " . count($current_meta) . " settings";
            delete_post_meta($active_kit_id, $meta_key);
            $results['details'][] = "Deleted kit meta data";
        } else {
            $results['details'][] = "No custom kit meta data found";
        }
    } else {
        $results['details'][] = "No active kit found";
    }
    
    // 2. Reset global Elementor settings
    $elementor_settings = array(
        'elementor_scheme_color',
        'elementor_scheme_typography',
        'elementor_scheme_color-picker',
        'elementor_cpt_support',
        'elementor_container_width',
        'elementor_space_between_widgets',
        'elementor_page_title_selector',
        'elementor_viewport_lg',
        'elementor_viewport_md',
        'elementor_css_print_method',
        'elementor_default_generic_fonts',
        'elementor_disable_color_schemes',
        'elementor_disable_typography_schemes',
        'elementor_editor_break_lines',
        'elementor_global_image_lightbox',
    );
    
    foreach ($elementor_settings as $setting) {
        $value = get_option($setting);
        if ($value !== false) {
            delete_option($setting);
            $results['details'][] = "Reset option: $setting";
        }
    }
    
    // 3. Clear Elementor's CSS cache
    if (class_exists('\Elementor\Plugin')) {
        $results['details'][] = "Found Elementor Plugin Class";
        
        // Delete files cache
        \Elementor\Plugin::$instance->files_manager->clear_cache();
        $results['details'][] = "Cleared Elementor CSS files cache";
        
        // Regenerate CSS
        if (method_exists(\Elementor\Plugin::$instance->posts_css_manager, 'clear_cache')) {
            \Elementor\Plugin::$instance->posts_css_manager->clear_cache();
            $results['details'][] = "Cleared Elementor post CSS cache";
        }
    } else {
        $results['details'][] = "Elementor Plugin Class not found";
    }
    
    return $results;
}

// Execute the reset
$reset_results = reset_elementor_settings();

// Display results
echo '<html><head><title>Reset Elementor Settings</title>';
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
echo '<h1>Reset Elementor Settings</h1>';

echo '<div class="message ' . $reset_results['status'] . '">' . $reset_results['message'] . '</div>';

echo '<ul>';
foreach ($reset_results['details'] as $detail) {
    echo '<li>' . $detail . '</li>';
}
echo '</ul>';

echo '<div class="return-link"><a href="' . home_url() . '">Return to Site</a></div>';
echo '</body></html>'; 