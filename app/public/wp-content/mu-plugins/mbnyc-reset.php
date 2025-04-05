<?php
/**
 * Plugin Name: MBNYC Reset Scripts
 * Description: Automatically executes reset scripts for Elementor, Customizer, and styles
 * Version: 1.0.0
 * Author: MBNYC
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class to handle automatic execution of reset scripts
 */
class MBNYC_Reset_Scripts {
    /**
     * Constructor
     */
    public function __construct() {
        // Run the scripts on init, but only once per deployment
        add_action('init', array($this, 'maybe_run_reset_scripts'));
        
        // Add admin notice for script execution status
        add_action('admin_notices', array($this, 'show_execution_notice'));
    }
    
    /**
     * Check if scripts should be run and execute them
     */
    public function maybe_run_reset_scripts() {
        // Only run if we're in the admin area
        if (!is_admin()) {
            return;
        }
        
        // Get the current deployment timestamp
        $deployment_time = $this->get_deployment_time();
        
        // Get the last execution time
        $last_execution = get_option('mbnyc_reset_scripts_last_run', 0);
        
        // If the scripts have run since deployment, don't run them again
        if ($last_execution >= $deployment_time) {
            return;
        }
        
        // If we have a user session, run the scripts
        if (is_user_logged_in() && current_user_can('manage_options')) {
            $results = $this->execute_reset_scripts();
            
            // Store the execution time and results
            update_option('mbnyc_reset_scripts_last_run', time());
            update_option('mbnyc_reset_scripts_results', $results);
        }
    }
    
    /**
     * Get the deployment timestamp
     * This reads the timestamp file created by the GitHub Action
     */
    private function get_deployment_time() {
        $timestamp_file = ABSPATH . '.deployment-timestamp';
        
        if (file_exists($timestamp_file)) {
            $timestamp = file_get_contents($timestamp_file);
            return (int) $timestamp;
        }
        
        // If no timestamp file exists, return current time
        // This will ensure the scripts run at least once
        return time();
    }
    
    /**
     * Execute all reset scripts
     */
    private function execute_reset_scripts() {
        $results = array();
        
        // Define the scripts to run
        $scripts = array(
            'reset-elementor.php' => 'Elementor styles',
            'reset-customizer.php' => 'Customizer settings',
            'reset-styles.php' => 'All styles'
        );
        
        // Execute each script
        foreach ($scripts as $script => $description) {
            $reset_file = ABSPATH . $script;
            
            if (file_exists($reset_file)) {
                ob_start();
                include_once($reset_file);
                $output = ob_get_clean();
                
                $results[$script] = array(
                    'success' => true,
                    'message' => "{$description} reset successfully.",
                    'output' => $output
                );
            } else {
                $results[$script] = array(
                    'success' => false,
                    'message' => "Reset script not found: {$reset_file}",
                    'output' => ''
                );
            }
        }
        
        return $results;
    }
    
    /**
     * Show admin notice for script execution status
     */
    public function show_execution_notice() {
        // Only show to admin users
        if (!current_user_can('manage_options')) {
            return;
        }
        
        // Get the results of the last execution
        $results = get_option('mbnyc_reset_scripts_results', array());
        
        // If no results yet, do nothing
        if (empty($results)) {
            return;
        }
        
        // Check if this notice has been dismissed
        $dismissed = get_option('mbnyc_reset_scripts_notice_dismissed', false);
        if ($dismissed) {
            return;
        }
        
        // Build the notice
        $success = true;
        $messages = array();
        
        foreach ($results as $script => $result) {
            if (!$result['success']) {
                $success = false;
            }
            
            $messages[] = $result['message'];
        }
        
        // Show the notice
        $class = $success ? 'notice-success' : 'notice-error';
        $message = implode('<br>', $messages);
        
        echo '<div class="notice ' . $class . ' is-dismissible mbnyc-reset-notice">';
        echo '<p><strong>MBNYC Style Reset:</strong></p>';
        echo '<p>' . $message . '</p>';
        echo '</div>';
        
        // Add script to dismiss the notice
        echo '<script>
            jQuery(document).ready(function($) {
                $(document).on("click", ".mbnyc-reset-notice .notice-dismiss", function() {
                    $.ajax({
                        url: ajaxurl,
                        data: {
                            action: "mbnyc_dismiss_reset_notice"
                        }
                    });
                });
            });
        </script>';
        
        // Add AJAX handler to dismiss the notice
        add_action('wp_ajax_mbnyc_dismiss_reset_notice', function() {
            update_option('mbnyc_reset_scripts_notice_dismissed', true);
            wp_die();
        });
    }
}

// Initialize the plugin
new MBNYC_Reset_Scripts(); 