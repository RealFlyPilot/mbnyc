<?php
// Activate Elementor plugins script

// Load WordPress
define('WP_USE_THEMES', false);
require_once('wp-load.php');

// Ensure the plugin functions are loaded
require_once(ABSPATH . 'wp-admin/includes/plugin.php');

// Plugins to activate
$plugins = [
    'elementor/elementor.php',
    'elementor-pro/elementor-pro.php'
];

// Activate each plugin
foreach ($plugins as $plugin) {
    if (!is_plugin_active($plugin)) {
        $result = activate_plugin($plugin);
        if (is_wp_error($result)) {
            echo "Error activating {$plugin}: " . $result->get_error_message() . "\n";
        } else {
            echo "Successfully activated {$plugin}\n";
        }
    } else {
        echo "{$plugin} is already active\n";
    }
}

echo "Activation process completed.\n"; 