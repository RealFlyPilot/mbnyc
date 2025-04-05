# WordPress Project for WPEngine

> **IMPORTANT: For a more organized documentation experience, please see [PROJECT-OVERVIEW.md](PROJECT-OVERVIEW.md) which provides clear navigation to all documentation, including the [child theme documentation](app/public/wp-content/themes/hello-elementor-child/README.md).**

## Project Structure

This repository contains a WordPress site with the following structure:

- `/app/public/` - WordPress core installation
- `/app/sql/` - Database exports
- `/app/logs/` - Local development logs
- `/app/conf/` - Local configuration files

## Key Decisions & Best Practices

- Repository root is `/` (not in `/app/public/`)
- **Excluded from version control**:
  - WordPress core files
  - Uploads directory
  - Sensitive configuration files (wp-config.php, .env files except .env.example)
  - Local development files
  - Node modules and vendor directories
  
- **Included in version control**:
  - Custom themes
  - Custom plugins
  - Custom mu-plugins
  - Configuration files (.gitignore, README, etc.)
  - GitHub Actions workflows for deployment

## Development Workflow

### Local Development
1. Clone the repository
2. Set up LocalWP environment
3. Make changes locally
4. Commit changes to feature branch
5. Push to GitHub
6. Create a pull request to the dev branch
7. Merge to dev to trigger deployment to development environment
8. Test on dev environment
9. Create a pull request to staging
10. Merge to staging to trigger deployment to staging environment
11. Test on staging
12. Create a pull request to main
13. Merge to main to trigger deployment to production

### Deployment to WP Engine
- **GitHub Actions**: Automatic deployment to WP Engine when changes are merged to dev, staging, or main branches
  - Merging to `dev` branch deploys to WP Engine development environment
  - Merging to `staging` branch deploys to WP Engine staging environment
  - Merging to `main` branch deploys to WP Engine production environment

#### How the GitHub Actions Deployment Works
1. When code is pushed to one of the tracked branches (dev, staging, main), the corresponding GitHub Action workflow is triggered
2. The workflow uses the official WP Engine GitHub Action (`wpengine/github-action-wpe-site-deploy`)
3. The action connects to the appropriate WP Engine environment using SSH
4. Only the `wp-content` directory is deployed, excluding any files listed in `.wpe-push-ignore`
5. PHP linting is performed before deployment to catch syntax errors

## Branching Strategy

- `main` - Production code
- `staging` - Staging environment for testing
- `dev` - Development environment for initial testing
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

## Setup Instructions

### Initial Setup
1. Clone the repository: `git clone [repository-url]`
2. Set up LocalWP site with the cloned repository
3. Configure local environment

### GitHub Actions Configuration
1. Add the following secret to your GitHub repository:
   - `WPENGINE_SSH_PRIVATE_KEY`: Your SSH private key for WP Engine
   
   You can add this secret using the GitHub CLI:
   ```bash
   # Generate a new SSH key if needed
   ssh-keygen -t rsa -b 4096 -C "your_email@example.com" -f ~/.ssh/wpengine_key
   
   # Add the public key to WP Engine (via WP Engine dashboard)
   cat ~/.ssh/wpengine_key.pub
   
   # Add the private key as a GitHub secret
   gh secret set WPENGINE_SSH_PRIVATE_KEY < ~/.ssh/wpengine_key
   ```

2. Make sure you have a `.wpe-push-ignore` file in your repository root to control which files are excluded from deployment.

## Maintenance Tasks

### Database Management
- Export database from production when needed for significant updates
- Use WP Migrate DB Pro or similar tools for syncing databases

### Plugin Updates
- Always test plugin updates on dev first, then staging
- Document any issues and required changes
- Consider using Composer for plugin management

## Contributing

1. Create a feature branch from `dev`
2. Make changes locally
3. Commit and push to GitHub
4. Open a pull request to `dev`
5. After review and testing, merge to `dev`
6. Create a pull request from `dev` to `staging`
7. After review and testing, merge to `staging`
8. Create a pull request from `staging` to `main` for production deployment

## WordPress and WP Engine Specific Notes

- WP Engine automatically sets environment variables
- WordPress core updates are managed by WP Engine
- Performance optimization should utilize WP Engine's caching systems
- The deployment only pushes the `wp-content` directory to WP Engine, not the entire WordPress installation

---

This repository setup was created following best practices for WordPress development with WPEngine and LocalWP. # Deployment test
Testing new deployment key Fri Apr  4 00:57:13 PDT 2025
# Updated repository to RealFlyPilot organization
# Testing WP Engine deployment with new SSH key
# Testing WP Engine deployment with newly formatted SSH key
