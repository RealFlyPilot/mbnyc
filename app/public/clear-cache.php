<?php
// Clear WP Engine cache script

// Load WordPress
define('WP_USE_THEMES', false);
require_once('wp-load.php');

echo "Clearing WP Engine cache...\n";

// Clear all WordPress cache
if (function_exists('wp_cache_flush')) {
    wp_cache_flush();
    echo "WordPress object cache flushed.\n";
} else {
    echo "wp_cache_flush function not available.\n";
}

// Clear WP Engine cache if available
if (class_exists('WpeCommon')) {
    if (method_exists('WpeCommon', 'purge_memcached')) {
        WpeCommon::purge_memcached();
        echo "WP Engine memcached purged.\n";
    } else {
        echo "WpeCommon::purge_memcached method not available.\n";
    }
    
    if (method_exists('WpeCommon', 'purge_varnish_cache')) {
        WpeCommon::purge_varnish_cache();
        echo "WP Engine Varnish cache purged.\n";
    } else {
        echo "WpeCommon::purge_varnish_cache method not available.\n";
    }
} else {
    echo "WpeCommon class not available.\n";
}

// Clear Elementor cache
if (class_exists('\Elementor\Plugin')) {
    echo "Clearing Elementor cache...\n";
    
    // Clear Elementor CSS files
    if (method_exists('\Elementor\Plugin', 'instance')) {
        $elementor = \Elementor\Plugin::instance();
        if (isset($elementor->files_manager) && method_exists($elementor->files_manager, 'clear_cache')) {
            $elementor->files_manager->clear_cache();
            echo "Elementor files cache cleared.\n";
        } else {
            echo "Elementor files_manager or clear_cache method not available.\n";
        }
    } else {
        echo "Elementor Plugin::instance method not available.\n";
    }
    
    // Regenerate CSS for specific post (home page)
    $front_page_id = get_option('page_on_front');
    if ($front_page_id) {
        if (class_exists('\Elementor\Core\Files\CSS\Post')) {
            echo "Regenerating CSS for homepage (ID: $front_page_id)...\n";
            $post_css = new \Elementor\Core\Files\CSS\Post($front_page_id);
            $post_css->delete();
            $post_css->enqueue();
            echo "Homepage CSS regenerated.\n";
        } else {
            echo "Elementor\Core\Files\CSS\Post class not available.\n";
        }
    }
} else {
    echo "Elementor Plugin class not available. Elementor may not be active.\n";
}

echo "Cache clearing completed.\n"; 