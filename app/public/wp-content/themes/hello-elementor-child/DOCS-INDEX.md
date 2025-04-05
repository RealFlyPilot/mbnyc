# Hello Elementor Child Theme Documentation Index

This file provides a guide to all documentation related to the Hello Elementor Child Theme.

## Core Documentation

- [README.md](README.md) - Main child theme documentation with architecture, features, and usage guidelines
- [style-guide.md](style-guide.md) - Comprehensive style guide with CSS variables, typography, and design system details
- [css-structure-issue.md](css-structure-issue.md) - Details about the CSS file duplication issue and solution

## CSS Files (Production)

- [css/variables.css](css/variables.css) - CSS custom properties for colors, typography, spacing, etc.
- [css/base-styles.css](css/base-styles.css) - Base element styling using the variables
- [custom.css](custom.css) - For custom overrides (currently empty/commented out)

## PHP Files

- [functions.php](functions.php) - Theme functionality, enqueues stylesheets and adds custom button types
- [style.css](style.css) - Theme metadata and WordPress child theme declaration

## Known Issues

- **CSS File Duplication**: There are duplicate CSS files in both `/css/` and `/assets/css/` directories. 
  - **Solution**: Always use files in the `/css/` directory as referenced in `functions.php`
  - **Details**: See [css-structure-issue.md](css-structure-issue.md)

## Related Project Documentation

- [PROJECT-OVERVIEW.md](/PROJECT-OVERVIEW.md) - Repository-wide documentation
- [README-deployment.md](/README-deployment.md) - Deployment system documentation

## Working With This Theme

1. Clone the repository
2. Set up local environment with [LocalWP](https://localwp.com/)
3. Make changes to the CSS variables in `css/variables.css` for global styling
4. Update element styles in `css/base-styles.css`
5. Test thoroughly in local environment
6. Deploy using the deployment script: `./deploy.sh feature/your-branch-name target-environment`

## Support

For questions about this theme, please contact the project maintainers. 