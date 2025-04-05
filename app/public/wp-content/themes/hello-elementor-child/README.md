# Hello Elementor Child Theme Documentation

> **Navigation:** For a complete list of all theme documentation files, please see [DOCS-INDEX.md](DOCS-INDEX.md)

## Quick Start Guide

This child theme extends Hello Elementor, focusing on a Gucci-inspired black and white aesthetic with Futura PT typography. It uses CSS variables and a structured approach to styling.

### Key Features
- CSS variable system for consistent styling
- Modern typography scale (perfect fourth ratio: 1.333)
- Responsive layout with container components
- Light/dark theme support
- Elementor compatibility and enhancements

### Active Files (Used in Production)
```
hello-elementor-child/
├── css/
│   ├── variables.css    # CSS custom properties
│   └── base-styles.css  # Base styles and utilities
├── custom.css           # Custom overrides (currently empty)
├── functions.php        # Theme functionality
└── style.css            # Theme metadata
```

### ⚠️ Important Note: File Structure Issue
The project has duplicate CSS files in two locations:
- `/css/` directory (actively used in production per functions.php)
- `/assets/css/` directory (mentioned in original README but not referenced in functions.php)

**RECOMMENDATION:** Use only the `/css/` directory as it's properly referenced in the theme's functions.php.

## Theme Architecture

### CSS Loading Order
Files are loaded in this priority (as defined in functions.php):
1. `css/variables.css` - CSS custom properties (priority 5)
2. `css/base-styles.css` - Global styles using variables (depends on variables.css)
3. `custom.css` - Custom overrides (priority 999, currently empty)

### Files and Their Purpose
- `functions.php`: Enqueues stylesheets and adds the "Inverted" button type to Elementor
- `style.css`: Theme metadata and WordPress child theme declaration
- `css/variables.css`: CSS variables for typography, colors, spacing
- `css/base-styles.css`: Element styling using the variables
- `custom.css`: Reserved for custom overrides (currently commented out)
- `style-guide.md`: Documentation for styling guidelines

### Deployment
The site uses GitHub Actions workflows to deploy to WP Engine environments:
- Development: `wpe-deploy-dev.yml` (triggered on push to dev branch)
- Staging: `wpe-deploy-staging.yml`
- Production: `wpe-deploy-production.yml`

## Working with the Theme

### Adding Styles
1. **Preferred approach:** Use Elementor UI with preset classes
2. **For global styles:** Modify CSS variables in `css/variables.css`
3. **For element styles:** Update `css/base-styles.css`
4. **For one-off customizations:** Use `custom.css`

### CSS Variable System
The theme uses a comprehensive set of CSS variables including:
- Color palette variables (`--color-primary`, `--color-secondary`, etc.)
- Typography variables for font family, sizes, weights
- Spacing system with consistent increments
- Container widths and responsive breakpoints

### Theme Modes
- Default light mode: `theme-light` class
- Dark mode: `theme-dark` class
- Text inversion: `text-inverted` class

### Elementor Integration
- CSS variables are enqueued in the Elementor editor for consistent styling
- Custom "Inverted" button type added to Elementor's button widget
- Base styles visible in both editor and frontend

## Advanced Information

### Project Structure and Workflow

The project follows a feature branch workflow:
- `main`: Production-ready code
- `staging`: Pre-production testing
- `dev`: Active development branch
- Feature branches: Individual features/fixes (e.g., `feature/css-variables-system`)

### Local Development Setup
The primary local environment is in `/users/mlovascio/Local Sites/mbnycfitness` using LocalWP.

### CLI and SSH Tips

#### WP Engine Environments
- Development: `mbnycd.wpengine.com`
- Command to SSH: `ssh mbnycd@mbnycd.ssh.wpengine.net`

#### WP-CLI Examples
```bash
# Export database
wp db export

# Update plugins
wp plugin update --all

# Clear cache
wp cache flush
```

#### Elementor CLI Commands
```bash
# Regenerate CSS
wp elementor flush_css

# Sync library
wp elementor library sync
```

### Reset Scripts
The project includes PHP reset scripts in the public_html root:
- `reset-elementor.php`: Resets Elementor settings to defaults
- `reset-customizer.php`: Resets WordPress Customizer settings
- `reset-styles.php`: Resets style-related settings

## Technical Details

### functions.php Breakdown
```php
// Enqueue parent and child theme stylesheets
add_action('wp_enqueue_scripts', 'hello_elementor_child_enqueue_styles');

// Enqueue CSS Variables with priority 5 (loads early)
add_action('wp_enqueue_scripts', 'enqueue_css_variables', 5);

// Make variables and base styles available in Elementor editor
add_action('elementor/editor/before_enqueue_scripts', 'enqueue_editor_styles');

// Enqueue custom.css later, with priority 999 (loads last)
add_action('wp_enqueue_scripts', 'enqueue_custom_css_last', 999);

// Add custom "Inverted" button type to Elementor
add_filter('elementor/button/types', 'add_custom_button_types');
```

### CSS Files Comparison
The duplicate CSS files have these differences:
- `/css/base-styles.css` (437 lines): Comprehensive styles for all elements
- `/assets/css/main.css` (76 lines): Simplified version with fewer styles
- `/css/variables.css` and `/assets/css/variables.css`: Identical content

## Appendix: Working with WP Engine and WordPress

### WP Engine Git Deployment
The project uses WP Engine's Git push deployment:
- `.wpe-pull-ignore` and `.wpe-push-ignore` control which files sync with WP Engine
- GitHub Actions automate the deployment process

### WordPress Development Best Practices
When developing for this project:
1. Make changes on a feature branch
2. Test thoroughly in the local environment
3. Push to GitHub to trigger dev environment deployment
4. Test on dev before promoting to staging/production

### Plugin Dependencies
The site relies on these key plugins:
- Elementor Pro
- Advanced Custom Fields Pro
- Gravity Forms
- WP Mail SMTP
- Custom Typekit Fonts (for Futura PT) 