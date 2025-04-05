# WordPress + Elementor Project Setup Guide

This guide outlines the recommended setup process for creating a new WordPress site with Elementor, based on the MBNYC Fitness project structure.

## Initial Setup

### 1. Local Development Environment

1. Install [Local by Flywheel](https://localwp.com/)
2. Create a new WordPress site with:
   - PHP 8.0+
   - MySQL 8.0+
   - Latest WordPress version

### 2. Theme Setup

#### Install Parent Theme
```bash
# Download and extract Hello Elementor theme
cd /path/to/project
wget https://downloads.wordpress.org/theme/hello-elementor.latest-stable.zip
unzip hello-elementor.latest-stable.zip -d app/public/wp-content/themes/
```

#### Create Child Theme
1. Create child theme directory:
```bash
mkdir -p app/public/wp-content/themes/hello-elementor-child/css
```

2. Create `style.css`:
```css
/*
Theme Name: Hello Elementor Child
Theme URI: https://github.com/elementor/hello-elementor/
Description: Hello Elementor Child is a child theme of Hello Elementor, built with a robust CSS organization system
Author: Your Name
Author URI: https://yourwebsite.com/
Template: hello-elementor
Version: 1.0.0
Text Domain: hello-elementor-child
License: GNU General Public License v3 or later
License URI: https://www.gnu.org/licenses/gpl-3.0.html
*/
```

3. Create the CSS Architecture:

```bash
# Create required CSS files
touch app/public/wp-content/themes/hello-elementor-child/css/variables.css
touch app/public/wp-content/themes/hello-elementor-child/css/base.css
touch app/public/wp-content/themes/hello-elementor-child/css/elementor-reset.css
touch app/public/wp-content/themes/hello-elementor-child/custom.css
```

4. Create `functions.php`:
```php
<?php
/**
 * Theme functions
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Enqueue styles
 */
function hello_elementor_child_enqueue_styles() {
    // Only load reset styles on the frontend, not in the editor
    $is_editor = (isset($_GET['elementor-preview']) || is_admin());
    
    // Parent theme style
    wp_enqueue_style(
        'hello-elementor', 
        get_template_directory_uri() . '/style.css',
        [],
        '1.0.0'
    );
    
    // CSS Variables
    wp_enqueue_style(
        'css-variables', 
        get_stylesheet_directory_uri() . '/css/variables.css',
        ['hello-elementor'],
        '1.0.0'
    );
    
    // Base styles
    wp_enqueue_style(
        'base-styles', 
        get_stylesheet_directory_uri() . '/css/base.css',
        ['css-variables'],
        '1.0.0'
    );
    
    // Elementor reset styles (only on frontend)
    if (!$is_editor) {
        wp_enqueue_style(
            'elementor-reset-styles', 
            get_stylesheet_directory_uri() . '/css/elementor-reset.css',
            ['base-styles'],
            '1.0.0'
        );
        
        // Custom styles
        wp_enqueue_style(
            'custom-style', 
            get_stylesheet_directory_uri() . '/custom.css',
            ['elementor-reset-styles'],
            '1.0.0'
        );
    } else {
        // Custom styles for editor (without reset dependency)
        wp_enqueue_style(
            'custom-style', 
            get_stylesheet_directory_uri() . '/custom.css',
            ['base-styles'],
            '1.0.0'
        );
    }
}
add_action('wp_enqueue_scripts', 'hello_elementor_child_enqueue_styles');

/**
 * Add editor styles
 */
function enqueue_editor_styles() {
    // Add editor-specific styles here if needed
    wp_enqueue_style(
        'editor-styles',
        get_stylesheet_directory_uri() . '/css/editor.css',
        [],
        '1.0.0'
    );
}
add_action('elementor/editor/before_enqueue_scripts', 'enqueue_editor_styles');
```

### 3. Install Plugins

#### Required Plugins:
- Elementor
- Elementor Pro

```bash
# Create plugins directory if it doesn't exist
mkdir -p app/public/wp-content/plugins
```

Upload and activate plugins through WordPress admin or use WP-CLI.

### 4. Set Up CSS Files

#### variables.css
```css
:root {
    /* Typography */
    --font-primary: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    --font-secondary: Georgia, 'Times New Roman', serif;
    --font-monospace: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    
    --font-size-xs: 0.75rem;    /* 12px */
    --font-size-sm: 0.875rem;   /* 14px */
    --font-size-base: 1rem;     /* 16px */
    --font-size-md: 1.125rem;   /* 18px */
    --font-size-lg: 1.25rem;    /* 20px */
    --font-size-xl: 1.5rem;     /* 24px */
    --font-size-2xl: 1.875rem;  /* 30px */
    --font-size-3xl: 2.25rem;   /* 36px */
    --font-size-4xl: 3rem;      /* 48px */
    
    --font-weight-light: 300;
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    
    --line-height-tight: 1.2;
    --line-height-normal: 1.5;
    --line-height-relaxed: 1.8;
    
    /* Colors */
    --color-primary: #007bff;
    --color-primary-light: #4da3ff;
    --color-primary-dark: #0056b3;
    
    --color-secondary: #6c757d;
    --color-secondary-light: #a1a9af;
    --color-secondary-dark: #494f54;
    
    --color-success: #28a745;
    --color-info: #17a2b8;
    --color-warning: #ffc107;
    --color-danger: #dc3545;
    
    --color-light: #f8f9fa;
    --color-dark: #343a40;
    --color-white: #ffffff;
    --color-black: #000000;
    
    --color-gray-100: #f8f9fa;
    --color-gray-200: #e9ecef;
    --color-gray-300: #dee2e6;
    --color-gray-400: #ced4da;
    --color-gray-500: #adb5bd;
    --color-gray-600: #6c757d;
    --color-gray-700: #495057;
    --color-gray-800: #343a40;
    --color-gray-900: #212529;
    
    /* Spacing */
    --spacing-1: 0.25rem;   /* 4px */
    --spacing-2: 0.5rem;    /* 8px */
    --spacing-3: 0.75rem;   /* 12px */
    --spacing-4: 1rem;      /* 16px */
    --spacing-5: 1.5rem;    /* 24px */
    --spacing-6: 2rem;      /* 32px */
    --spacing-8: 3rem;      /* 48px */
    --spacing-10: 4rem;     /* 64px */
    --spacing-12: 5rem;     /* 80px */
    --spacing-16: 8rem;     /* 128px */
    
    /* Borders */
    --border-radius-sm: 0.25rem;
    --border-radius: 0.375rem;
    --border-radius-lg: 0.5rem;
    --border-radius-xl: 1rem;
    --border-radius-full: 9999px;
    
    --border-width-thin: 1px;
    --border-width-medium: 2px;
    --border-width-thick: 4px;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    
    /* Transitions */
    --transition-fast: 0.15s ease;
    --transition-normal: 0.3s ease;
    --transition-slow: 0.5s ease;
    
    /* Z-index */
    --z-index-dropdown: 1000;
    --z-index-sticky: 1020;
    --z-index-fixed: 1030;
    --z-index-modal-backdrop: 1040;
    --z-index-modal: 1050;
    --z-index-popover: 1060;
    --z-index-tooltip: 1070;
    
    /* Container */
    --container-max-width: 1200px;
    --container-padding: 1rem;
}
```

#### base.css
```css
/* Base styles for the entire site */

/* Box sizing */
*,
*::before,
*::after {
    box-sizing: border-box;
}

/* Document */
html {
    font-size: 16px;
    scroll-behavior: smooth;
}

body {
    font-family: var(--font-primary);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-normal);
    line-height: var(--line-height-normal);
    color: var(--color-gray-900);
    background-color: var(--color-white);
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
    margin-top: 0;
    margin-bottom: var(--spacing-4);
    font-weight: var(--font-weight-bold);
    line-height: var(--line-height-tight);
}

h1 {
    font-size: var(--font-size-3xl);
}

h2 {
    font-size: var(--font-size-2xl);
}

h3 {
    font-size: var(--font-size-xl);
}

h4 {
    font-size: var(--font-size-lg);
}

h5 {
    font-size: var(--font-size-md);
}

h6 {
    font-size: var(--font-size-base);
}

p {
    margin-top: 0;
    margin-bottom: var(--spacing-4);
}

a {
    color: var(--color-primary);
    text-decoration: none;
    transition: color var(--transition-fast);
}

a:hover {
    color: var(--color-primary-dark);
    text-decoration: underline;
}

/* Lists */
ul, ol {
    margin-top: 0;
    margin-bottom: var(--spacing-4);
    padding-left: var(--spacing-6);
}

/* Add basic responsive adjustments */
@media (max-width: 767px) {
    html {
        font-size: 14px;
    }
    
    h1 {
        font-size: var(--font-size-2xl);
    }
    
    h2 {
        font-size: var(--font-size-xl);
    }
    
    h3 {
        font-size: var(--font-size-lg);
    }
}
```

#### elementor-reset.css
```css
/* 
 * Elementor Reset Styles
 * Applies our design system tokens to Elementor elements
 */

/* Typography */
.elementor-widget-heading h1.elementor-heading-title {
    font-family: var(--font-primary);
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-bold);
    line-height: var(--line-height-tight);
}

.elementor-widget-heading h2.elementor-heading-title {
    font-family: var(--font-primary);
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    line-height: var(--line-height-tight);
}

.elementor-widget-heading h3.elementor-heading-title {
    font-family: var(--font-primary);
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    line-height: var(--line-height-tight);
}

.elementor-widget-heading h4.elementor-heading-title {
    font-family: var(--font-primary);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    line-height: var(--line-height-tight);
}

.elementor-widget-heading h5.elementor-heading-title {
    font-family: var(--font-primary);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    line-height: var(--line-height-tight);
}

.elementor-widget-heading h6.elementor-heading-title {
    font-family: var(--font-primary);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    line-height: var(--line-height-tight);
}

/* Text Editor */
.elementor-widget-text-editor {
    font-family: var(--font-primary);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-normal);
    line-height: var(--line-height-normal);
    color: var(--color-gray-800);
}

/* Buttons */
.elementor-button {
    font-family: var(--font-primary);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    line-height: var(--line-height-tight);
    border-radius: var(--border-radius);
    padding: var(--spacing-2) var(--spacing-5);
    transition: all var(--transition-normal);
}

.elementor-button.elementor-size-xs {
    font-size: var(--font-size-sm);
    padding: var(--spacing-1) var(--spacing-3);
}

.elementor-button.elementor-size-sm {
    font-size: var(--font-size-sm);
    padding: var(--spacing-2) var(--spacing-4);
}

.elementor-button.elementor-size-md {
    font-size: var(--font-size-base);
    padding: var(--spacing-2) var(--spacing-5);
}

.elementor-button.elementor-size-lg {
    font-size: var(--font-size-md);
    padding: var(--spacing-3) var(--spacing-6);
}

.elementor-button.elementor-size-xl {
    font-size: var(--font-size-lg);
    padding: var(--spacing-4) var(--spacing-8);
}

/* Primary Button */
.elementor-button.elementor-button-primary {
    background-color: var(--color-primary);
    color: var(--color-white);
}

.elementor-button.elementor-button-primary:hover {
    background-color: var(--color-primary-dark);
}

/* Form Elements */
.elementor-field-textual {
    font-family: var(--font-primary);
    font-size: var(--font-size-base);
    line-height: var(--line-height-normal);
    padding: var(--spacing-2) var(--spacing-3);
    border-radius: var(--border-radius);
    border-width: var(--border-width-thin);
    border-color: var(--color-gray-300);
}

/* Responsive adjustments */
@media (max-width: 767px) {
    .elementor-widget-heading h1.elementor-heading-title {
        font-size: var(--font-size-3xl);
    }
    
    .elementor-widget-heading h2.elementor-heading-title {
        font-size: var(--font-size-2xl);
    }
    
    .elementor-widget-heading h3.elementor-heading-title {
        font-size: var(--font-size-xl);
    }
}
```

### 5. Create Documentation

1. Create documentation directory:
```bash
mkdir -p app/public/wp-content/themes/hello-elementor-child/docs
```

2. Create an Elementor styling guide:
```bash
touch app/public/wp-content/themes/hello-elementor-child/docs/elementor-styling-guide.md
```

3. Create project documentation:
```bash
touch app/public/wp-content/themes/hello-elementor-child/docs/project-documentation.md
```

## Version Control Setup

1. Initialize Git repository:
```bash
git init
```

2. Create .gitignore file:
```
# WordPress core
wp-admin/
wp-includes/
wp-content/languages/
wp-content/plugins/
wp-content/upgrade/
wp-content/uploads/

# Exceptions - track these specific plugins if they're custom
!wp-content/plugins/custom-plugin-name/

# Configuration files
wp-config.php
.htaccess

# Log files
*.log
error_log

# Cache and temporary files
wp-content/advanced-cache.php
wp-content/backup-db/
wp-content/backups/
wp-content/blogs.dir/
wp-content/cache/
wp-content/upgrade/
wp-content/wp-cache-config.php

# Local development files
node_modules/
.DS_Store
Thumbs.db

# IDE files
.idea/
.vscode/
*.sublime-project
*.sublime-workspace
```

3. Make initial commit:
```bash
git add .
git commit -m "Initial project setup"
```

4. Create development branch:
```bash
git checkout -b dev
```

## Best Practices Checklist

1. **Theme Structure**
   - [ ] Properly set up parent theme
   - [ ] Properly set up child theme
   - [ ] Set up organized CSS architecture
   - [ ] Implemented style enqueuing in the correct order

2. **Responsive Design**
   - [ ] Base mobile-first styles
   - [ ] Responsive breakpoints defined
   - [ ] Testing on multiple devices

3. **Performance**
   - [ ] Optimized images
   - [ ] Minified CSS/JS
   - [ ] Caching enabled

4. **Security**
   - [ ] WordPress and plugins updated
   - [ ] Secure login credentials
   - [ ] Security plugin installed

5. **Backup**
   - [ ] Backup solution in place
   - [ ] Tested restore process

## Deployment Checklist

Before deploying to production:

1. **Pre-Deployment**
   - [ ] All pages tested
   - [ ] Forms working correctly
   - [ ] Cross-browser testing
   - [ ] Mobile testing
   - [ ] Performance optimization
   - [ ] SEO checklist completed

2. **Deployment**
   - [ ] Database backed up
   - [ ] Files backed up
   - [ ] Staging environment tested

3. **Post-Deployment**
   - [ ] Verify all pages working
   - [ ] Check forms and functionality
   - [ ] Test on different devices
   - [ ] SSL certificate working

## Maintenance Procedures

1. **Regular Updates**
   - WordPress core updates
   - Theme updates
   - Plugin updates
   - PHP/MySQL updates

2. **Regular Backups**
   - Database backups
   - Files backups
   - Off-site storage

3. **Monitoring**
   - Uptime monitoring
   - Security monitoring
   - Performance monitoring 