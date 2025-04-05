<?php
// Elementor diagnostic script

// Load WordPress
define('WP_USE_THEMES', false);
require_once('wp-load.php');

// Ensure the plugin functions are loaded
require_once(ABSPATH . 'wp-admin/includes/plugin.php');

echo "=== Elementor Diagnostic Report ===\n\n";

// Check if plugins are installed and active
$elementor_path = WP_PLUGIN_DIR . '/elementor/elementor.php';
$elementor_pro_path = WP_PLUGIN_DIR . '/elementor-pro/elementor-pro.php';

echo "Elementor Plugin: " . (file_exists($elementor_path) ? "Installed" : "Not Installed") . "\n";
echo "Elementor Pro Plugin: " . (file_exists($elementor_pro_path) ? "Installed" : "Not Installed") . "\n";

echo "Elementor Plugin: " . (is_plugin_active('elementor/elementor.php') ? "Active" : "Inactive") . "\n";
echo "Elementor Pro Plugin: " . (is_plugin_active('elementor-pro/elementor-pro.php') ? "Active" : "Inactive") . "\n\n";

// Check Elementor settings
echo "=== Elementor Settings ===\n";
$elementor_settings = get_option('elementor_general_settings');
if ($elementor_settings) {
    echo "Elementor Settings: Found\n";
    print_r($elementor_settings);
} else {
    echo "Elementor Settings: Not Found\n";
}

// Check recent posts with Elementor data
echo "\n=== Recent Posts with Elementor Data ===\n";
$args = array(
    'post_type' => array('post', 'page'),
    'posts_per_page' => 5,
    'meta_key' => '_elementor_edit_mode',
    'meta_value' => 'builder'
);

$query = new WP_Query($args);
if ($query->have_posts()) {
    while ($query->have_posts()) {
        $query->the_post();
        echo "ID: " . get_the_ID() . " | Title: " . get_the_title() . " | Type: " . get_post_type() . "\n";
    }
} else {
    echo "No posts found with Elementor data\n";
}
wp_reset_postdata();

// Check for home page and its Elementor status
$front_page_id = get_option('page_on_front');
if ($front_page_id) {
    echo "\n=== Home Page Information ===\n";
    echo "Front Page ID: " . $front_page_id . "\n";
    echo "Title: " . get_the_title($front_page_id) . "\n";
    $is_elementor = get_post_meta($front_page_id, '_elementor_edit_mode', true);
    echo "Elementor Enabled: " . ($is_elementor == 'builder' ? "Yes" : "No") . "\n";
    
    // Check if the content has Elementor shortcode
    $content = get_post_field('post_content', $front_page_id);
    $has_shortcode = has_shortcode($content, 'elementor');
    echo "Has Elementor Shortcode: " . ($has_shortcode ? "Yes" : "No") . "\n";
    
    // Show post meta related to Elementor
    echo "\nElementor Meta Data:\n";
    $elementor_data = get_post_meta($front_page_id, '_elementor_data', true);
    echo "Has Elementor Data: " . (empty($elementor_data) ? "No" : "Yes") . "\n";
    
    if (!empty($elementor_data)) {
        echo "Data Size: " . strlen($elementor_data) . " bytes\n";
    }
} else {
    echo "\nNo static front page set\n";
}

// Check Elementor CSS files
echo "\n=== Elementor CSS Files ===\n";
$upload_dir = wp_upload_dir();
$elementor_css_dir = $upload_dir['basedir'] . '/elementor/css';

if (file_exists($elementor_css_dir)) {
    echo "Elementor CSS Directory: Exists\n";
    $files = glob($elementor_css_dir . '/*');
    echo "Number of CSS files: " . count($files) . "\n";
    
    if (count($files) > 0) {
        echo "Recent CSS files:\n";
        $recent_files = array_slice($files, -5);
        foreach ($recent_files as $file) {
            echo basename($file) . " - " . date("Y-m-d H:i:s", filemtime($file)) . "\n";
        }
    }
} else {
    echo "Elementor CSS Directory: Does not exist\n";
}

// Check for errors in error log
echo "\n=== Error Log Check ===\n";
$error_log = ABSPATH . 'wp-content/debug.log';
if (file_exists($error_log)) {
    echo "Debug log exists. Recent errors:\n";
    exec("tail -n 20 " . $error_log, $errors);
    foreach ($errors as $error) {
        if (stripos($error, 'elementor') !== false) {
            echo $error . "\n";
        }
    }
} else {
    echo "No debug log found\n";
}

echo "\n=== End of Diagnostic Report ===\n"; 