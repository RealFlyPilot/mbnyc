# MBNYC Project Overview

This document serves as a central guide to all documentation in this repository, making it easier to find the information you need.

## Documentation Structure

This repository utilizes a multi-layered documentation approach:

1. **Project-level documentation** (this document) - High-level overview and navigation
2. **System-specific documentation** - Deployment, WordPress configuration, etc.
3. **Component-specific documentation** - Child theme, plugins, custom code

All documentation is maintained in Markdown format for consistency and readability.

## Theme & Design System

**The active WordPress theme is a child theme of Hello Elementor.** This is where most of your development work will occur:

- [Child Theme Documentation](app/public/wp-content/themes/hello-elementor-child/README.md) - Start here for theme customization
- [Theme Style Guide](app/public/wp-content/themes/hello-elementor-child/style-guide.md) - CSS variable system and design guidelines
- [CSS Structure Issue](app/public/wp-content/themes/hello-elementor-child/css-structure-issue.md) - Important note about CSS file organization

The Hello Elementor Child Theme features:
- CSS variable system for consistent styling
- Modern typography scale (perfect fourth ratio: 1.333)
- Responsive layout with container components
- Light/dark theme support
- Elementor compatibility and enhancements

## Deployment System

- [Deployment Overview](README-deployment.md) - General deployment system documentation
- [Deployment Summary](DEPLOYMENT-SUMMARY-FINAL.md) - Details of deployment system improvements
- [GitHub Workflows](.github/workflows) - CI/CD pipeline configuration

## WordPress Installation

The WordPress installation follows standard structure under `app/public/`:

- WordPress Core: `app/public/wp-includes/`, `app/public/wp-admin/`
- Themes: `app/public/wp-content/themes/`
- Plugins: `app/public/wp-content/plugins/`
- Uploads: `app/public/wp-content/uploads/`

## Development Workflow

1. Local development should be done using [LocalWP](https://localwp.com/)
2. Create feature branches from the appropriate environment branch (dev/staging/production)
3. Follow the guidelines in the [Child Theme Documentation](app/public/wp-content/themes/hello-elementor-child/README.md)
4. Use the deployment script to safely deploy: `./deploy.sh feature/your-branch-name target-environment`

## Environment Information

- Development: https://mbnycd.wpengine.com
- Staging: https://mbnycs.wpengine.com
- Production: https://mbnyc.com

## Repository Structure

- `app/` - WordPress installation
- `scripts/` - Deployment and utility scripts
- `.github/` - GitHub Actions workflows
- `conf/` - Configuration files

## Known Issues & Solutions

- **CSS File Structure Issue**: The project has duplicate CSS files in `/css/` and `/assets/css/` directories. Always use the files in the `/css/` directory as they are referenced in `functions.php`. See [CSS Structure Issue](app/public/wp-content/themes/hello-elementor-child/css-structure-issue.md) for details.

## Quick Links

- [Original Repository README](README.md) - Original project documentation
- [WP Engine Documentation](https://wpengine.com/support/git-push-deploy-add-on/) - WP Engine deployment reference 