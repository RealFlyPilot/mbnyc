<?php
/**
 * Hello Elementor Child Theme functions and definitions
 */

// Load parent and child theme styles
function hello_elementor_child_enqueue_styles() {
    // Enqueue parent theme stylesheet
    wp_enqueue_style(
        'hello-elementor-style',
        get_template_directory_uri() . '/style.css',
        array(),
        '1.0.0'
    );

    // Enqueue CSS variables
    wp_enqueue_style(
        'css-variables',
        get_stylesheet_directory_uri() . '/css/variables.css',
        array('hello-elementor-style'),
        '1.0.0'
    );
    
    // Enqueue base styles
    wp_enqueue_style(
        'base-styles', 
        get_stylesheet_directory_uri() . '/css/base.css',
        array('css-variables'),
        '1.0.0'
    );
    
    // Enqueue child theme stylesheet
    wp_enqueue_style(
        'hello-elementor-child-style',
        get_stylesheet_directory_uri() . '/style.css',
        array('base-styles'),
        '1.0.0'
    );
    
    // Only load reset styles on frontend (not in Elementor editor)
    if (!is_admin() && !isset($_GET['elementor-preview'])) {
        wp_enqueue_style(
            'elementor-reset-styles',
            get_stylesheet_directory_uri() . '/css/elementor-reset.css',
            array('hello-elementor-child-style'),
            '1.0.0'
        );
        
        // Custom styles - load after reset styles
        wp_enqueue_style(
            'custom-style',
            get_stylesheet_directory_uri() . '/custom.css',
            array('elementor-reset-styles'),
            '1.0.0'
        );
    } else {
        // Just load custom styles without reset in editor
        wp_enqueue_style(
            'custom-style',
            get_stylesheet_directory_uri() . '/custom.css',
            array('hello-elementor-child-style'),
            '1.0.0'
        );
    }
}
add_action('wp_enqueue_scripts', 'hello_elementor_child_enqueue_styles');

// Make styles available in the Elementor editor
function enqueue_editor_styles() {
    // Add custom styles to Elementor editor
    wp_enqueue_style(
        'editor-custom-styles',
        get_stylesheet_directory_uri() . '/custom.css',
        array(),
        '1.0.0'
    );
}
add_action('elementor/editor/before_enqueue_scripts', 'enqueue_editor_styles');

// Add custom button type to Elementor
function add_elementor_button_type($buttons) {
    $buttons['inverted'] = esc_html__('Inverted', 'hello-elementor-child');
    return $buttons;
}
add_filter('elementor/button_type/types', 'add_elementor_button_type');

/**
 * Custom functions that act independently of the theme templates.
 */
 
// Add your custom functions below this line 