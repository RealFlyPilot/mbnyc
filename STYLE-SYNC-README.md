# Style Sync Automation

This system automates the synchronization of styles between local, development, and production environments for the MBNYC WordPress site.

## Components

The style sync automation consists of several components:

1. **Reset Scripts**: PHP scripts that reset Elementor CSS, Customizer settings, and other styles
2. **GitHub Actions Workflow**: Automated deployment workflow that uploads reset scripts and runs them
3. **Must-Use Plugin**: Auto-executes reset scripts after deployment when admin logs in
4. **Monitoring Tools**: Scripts to monitor deployment status and run local reset scripts

## Getting Started

### Prerequisites

- Node.js 14+ installed
- Access to GitHub repository with appropriate permissions
- GitHub Personal Access Token with `repo` and `workflow` scopes

### Setup

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/RealFlyPilot/mbnyc.git
   cd mbnyc
   npm install
   ```

2. Set up GitHub token for API authentication:
   ```bash
   ./setup-github-token.sh
   ```
   Follow the prompts to enter your GitHub Personal Access Token.

## Usage

### Running Style Sync

To synchronize styles between environments:

```bash
node sync-dev-styles.js
```

This will:
1. Copy reset scripts to a temporary directory
2. Deploy them to the development server via GitHub Actions
3. Execute them on the server

### Monitoring Deployments

To monitor the status of a deployment:

```bash
./run-with-token.sh node monitor-workflow.js
```

To check the current status:

```bash
./run-with-token.sh node monitor-workflow.js check
```

### Local Style Reset

To run style reset scripts on your local environment:

```bash
./check-and-deploy.sh
```

## Script Documentation

### `sync-dev-styles.js`

Deploys and executes reset scripts on the development environment.

### `monitor-workflow.js`

Monitors GitHub Actions workflow status.

Options:
- Default: Continuously monitor workflow
- `check`: Show current status

### `setup-github-token.sh`

Sets up authentication for GitHub API access.

### `check-and-deploy.sh`

Checks deployment status and runs reset scripts locally.

## Reset Scripts

### `reset-elementor.php`

Resets all Elementor CSS cache and regenerates stylesheets.

### `reset-customizer.php`

Resets WordPress Customizer settings to match development environment.

### `reset-styles.php`

Resets all combined styles (Elementor + Customizer + other).

## Automated Deployment

The GitHub Actions workflow (`wpe-deploy-dev.yml`) automatically:

1. Deploys code to WP Engine
2. Uploads reset scripts to the site root
3. Creates a timestamp file to track deployments
4. Sets proper permissions on the scripts

The must-use plugin (`mbnyc-reset.php`) then:

1. Detects when a new deployment has occurred
2. Automatically runs reset scripts once when an admin logs in
3. Shows a notification with the results

## Troubleshooting

### Cannot connect to GitHub API
- Verify your GitHub token is valid and has the correct scopes
- Run `./setup-github-token.sh` to update your token

### Reset scripts not running on development server
- Check if the must-use plugin is installed correctly
- Verify the scripts were uploaded to the correct location
- Check WordPress error logs for any PHP errors

### Deployment fails
- Check GitHub Actions workflow logs
- Verify the SSH key in GitHub Secrets is valid
- Check that the paths in the workflow are correct 