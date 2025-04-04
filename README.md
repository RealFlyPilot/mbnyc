# MBNYC WordPress Site

This repository contains the WordPress site for MBNYC. The site is hosted on WPEngine and developed locally using LocalWP.

## Project Structure

The repository is organized following LocalWP and WPEngine best practices. The main project structure is:

```
mbnyc/
├── app/
│   ├── public/          # WordPress core installation
│   │   ├── wp-admin/    # WordPress admin files
│   │   ├── wp-content/  # Themes, plugins, and uploads
│   │   ├── wp-includes/ # WordPress core files
│   │   └── ...          # Other WordPress files
│   └── sql/             # Database exports (not tracked in Git)
├── conf/                # LocalWP configuration (not tracked in Git)
└── logs/                # Local logs (not tracked in Git)
```

### Key Decisions & Best Practices

1. **Repository Root Location**: We've placed the Git repository at the root of the LocalWP site directory rather than inside the `wp-content` folder. This allows us to:
   - Track WordPress configuration files if needed
   - Track custom reset scripts and other site-specific files
   - Maintain a complete picture of the site architecture

2. **Excluded Content**: We've excluded the following from version control:
   - Uploads directory (typically large media files)
   - Local database files
   - Local configuration files with sensitive information
   - Cache and temporary files
   - LocalWP specific configuration files

3. **Included Content**: We're tracking:
   - WordPress core files (optional, can be excluded if preferred)
   - Custom themes
   - Plugins (both third-party and custom)
   - Custom scripts and configuration files

## Development Workflow

### Local Development

1. Clone this repository
2. Import the site into LocalWP
3. Make your changes locally
4. Test thoroughly
5. Commit and push your changes

### Deployment to WPEngine

WPEngine offers multiple deployment methods:

1. **Git Push Deployment**:
   - Add WPEngine as a remote: `git remote add production git@git.wpengine.com:production/sitename.git`
   - Push to deploy: `git push production main`

2. **SFTP Deployment**:
   - Use WPEngine's SFTP credentials to upload changed files

3. **WP Engine Portal Deployment**:
   - Use the WPEngine user portal to deploy from GitHub

### Branching Strategy

We recommend using the following branching strategy:

- `main`: Production-ready code
- `staging`: For testing before production
- `feature/*`: For developing new features
- `bugfix/*`: For fixing bugs

## Setup Instructions

### Initial Setup

1. Clone this repository:
   ```
   git clone git@github.com:RealFlyPilot/mbnyc.git
   ```

2. Set up LocalWP:
   - Create a new site in LocalWP
   - Point it to the cloned repository location
   - Import the database if available

### Adding WPEngine as a Remote

```bash
git remote add production git@git.wpengine.com:production/sitename.git
git remote add staging git@git.wpengine.com:staging/sitename.git
```

Replace `sitename` with your WPEngine site name.

## Maintenance Tasks

### Database Management

- Export: Use LocalWP's database export feature
- Import: Use LocalWP's database import feature

### Plugin Updates

Always test plugin updates locally before deploying to production.

## Contributing

1. Create a new branch for your changes
2. Make your changes and test thoroughly
3. Push your branch and create a pull request
4. After review, merge into the main branch
5. Deploy to staging for testing
6. Deploy to production

## WordPress and WPEngine Specific Notes

### WPEngine Environment Variables

WPEngine provides environment-specific constants you can use in your `wp-config.php`:

```php
if ( defined( 'WPE_ENVIRONMENT' ) ) {
    switch ( WPE_ENVIRONMENT ) {
        case 'production':
            // Production-specific settings
            break;
        case 'staging':
            // Staging-specific settings
            break;
        default:
            // Development settings
            break;
    }
}
```

### WordPress Core Updates

WPEngine handles WordPress core updates automatically. For local development, keep WordPress updated through LocalWP's interface.

---

This repository setup was created following best practices for WordPress development with WPEngine and LocalWP. 