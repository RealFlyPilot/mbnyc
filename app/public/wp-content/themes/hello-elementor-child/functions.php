<?php
function hello_elementor_child_enqueue_styles() {
    // Enqueue the parent theme stylesheet.
    wp_enqueue_style( 'hello-elementor-style', get_template_directory_uri() . '/style.css' );
    
    // Enqueue CSS Variables first, so they're available to all stylesheets
    wp_enqueue_style( 'theme-variables', get_stylesheet_directory_uri() . '/css/variables.css', array('hello-elementor-style'), '1.0.0' );
    
    // Enqueue base styles after variables
    wp_enqueue_style( 'theme-base-styles', get_stylesheet_directory_uri() . '/css/base-styles.css', array('theme-variables'), '1.0.0' );
    
    // Enqueue the child theme stylesheet
    wp_enqueue_style( 'hello-elementor-child-style', get_stylesheet_directory_uri() . '/style.css', array('theme-base-styles'), '1.0.0' );
    
    // Enqueue custom CSS last to override other styles
    if (file_exists(get_stylesheet_directory() . '/custom.css')) {
        wp_enqueue_style( 'custom-style', get_stylesheet_directory_uri() . '/custom.css', array('hello-elementor-child-style'), '1.0.0' );
    }
}
add_action( 'wp_enqueue_scripts', 'hello_elementor_child_enqueue_styles' );

// Make styles available in Elementor editor
function enqueue_editor_styles() {
    wp_enqueue_style( 'theme-variables', get_stylesheet_directory_uri() . '/css/variables.css', array(), '1.0.0' );
    wp_enqueue_style( 'theme-base-styles', get_stylesheet_directory_uri() . '/css/base-styles.css', array('theme-variables'), '1.0.0' );
    wp_enqueue_style( 'hello-elementor-child-style', get_stylesheet_directory_uri() . '/style.css', array('theme-base-styles'), '1.0.0' );
}
add_action( 'elementor/editor/before_enqueue_scripts', 'enqueue_editor_styles' );

// Add custom button type to Elementor
function add_custom_button_types( $types ) {
    $types['inverted'] = __( 'Inverted', 'text-domain' );
    return $types;
}
add_filter( 'elementor/button/types', 'add_custom_button_types' );