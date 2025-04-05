# MBNYC Fitness Project Documentation

## Project Overview
The MBNYC Fitness website is built on WordPress using:
- Hello Elementor parent theme (v3.3.0)
- Custom Hello Elementor child theme
- Elementor page builder + Elementor Pro
- Custom styling system using CSS variables

## Project Structure

### Theme Structure
```
hello-elementor-child/
├── css/
│   ├── base.css             # Global base styles
│   ├── elementor-reset.css  # Elementor style normalization
│   ├── variables.css        # CSS variables/tokens
│   └── elementor-styling-guide.md  # Guide for styling Elementor elements
├── custom.css               # Custom site-specific styles
├── functions.php            # Theme functions
├── style.css                # Theme declaration
└── docs/                    # Project documentation
```

### Key Files and Their Purposes

- **variables.css**: Contains all design tokens as CSS variables, serving as the single source of truth for the design system.
- **base.css**: Contains global baseline styles that apply to all pages.
- **elementor-reset.css**: Normalizes Elementor styling by applying our CSS variables to Elementor elements.
- **custom.css**: Contains site-specific custom styles, loaded after all other stylesheets for highest specificity.
- **functions.php**: Controls theme setup, style enqueuing, and Elementor customizations.

## Style Enqueuing

The child theme correctly enqueues styles in this order:
1. Parent theme styles (hello-elementor)
2. CSS Variables (defines design tokens)
3. Base styles (global styles)
4. Elementor reset styles (normalizes Elementor elements)
5. Custom styles (site-specific overrides)

This structure ensures proper style cascade and specificity.

## Resolved Issues

### Elementor Style Corruption Issue

#### Problem
The site experienced Elementor style corruption after running a cleanup script that removed styling data from Elementor elements, resulting in:
- Lost typography settings
- Missing color settings
- Broken layouts
- Editor displaying abnormally

#### Solution
We implemented a multi-step recovery approach:

1. **Updated Hello Elementor Parent Theme**
   - Replaced existing Hello Elementor theme files with the official v3.3.0 release
   - Command used: `unzip 'path/to/hello-elementor.3.3.0.zip' -d app/public/wp-content/themes/`

2. **Fixed Style Enqueuing in Child Theme**
   - Modified `functions.php` to conditionally load styles
   - Prevented Elementor reset styles from affecting the editor
   - Ensured proper loading order of stylesheets

3. **Created Style Normalization System**
   - Implemented CSS variables in `variables.css`
   - Created `base.css` for global styling
   - Developed `elementor-reset.css` to standardize Elementor elements
   - Added `custom.css` for site-specific overrides

This approach successfully restored the site's styling while maintaining a clean, maintainable CSS architecture.

## Development Workflow

### Local Development
- **Local by Flywheel** for local WordPress development
- Site available at https://mbnyc.local/

### Version Control
- Git for version control
- `dev` branch for development work
- Commit changes with descriptive messages

### Deployment
- WP Engine for hosting
- Production environment accessible via WP Engine admin

## Best Practices

### CSS Organization
1. **Use the CSS Variable System**: All design tokens (colors, typography, spacing) should be defined in `variables.css`.
2. **Follow the Cascade**: Make use of the stylesheet loading order for proper overrides.
3. **Mobile-First**: Develop for mobile first, then enhance for larger screens.

### Elementor Usage
1. **Follow the Styling Guide**: Reference `elementor-styling-guide.md` when building Elementor pages.
2. **Minimal Direct Styling**: Focus on layout in Elementor; rely on the theme's CSS for styling.
3. **Use Custom Classes**: Add custom classes to Elementor elements when specific styling is needed.

### Backup Procedures
1. **Regular Backups**: Create regular backup points in WP Engine.
2. **Before Major Changes**: Always create a backup before running scripts or making significant changes.
3. **Database Exports**: Regularly export the database, especially the `wp_postmeta` table that contains Elementor data.

## Troubleshooting

### Common Issues

#### Elementor Editor Styling Issues
- Check that reset styles are not loading in the editor (controlled in `functions.php`).
- Regenerate Elementor CSS via Elementor → Tools → Regenerate CSS.

#### Frontend Styling Inconsistencies
- Check the CSS loading order in browser developer tools.
- Verify that CSS variables are properly defined and being applied.
- Check for inline styles that might be overriding theme styles.

#### After Theme Updates
- After updating the parent theme, check for any changes that might affect the child theme.
- Review and update child theme functions if necessary.

## Future Improvements

1. **Style Guide Development**: Expand the design system with more comprehensive documentation.
2. **Performance Optimization**: Implement critical CSS and optimize asset loading.
3. **Accessibility Enhancements**: Conduct accessibility audit and implement improvements.
4. **Template System**: Develop reusable Elementor templates for common components.

## Contact & Support

- **Developer**: [Developer Name]
- **Support Email**: [Support Email]
- **Documentation Last Updated**: [Current Date] 