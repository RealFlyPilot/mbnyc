# Deployment System for MBNYC

This repository includes a comprehensive deployment system with built-in checks to prevent common deployment issues. The system ensures code quality, performs pre-deployment validation, and verifies successful deployments to WP Engine environments.

## Key Components

1. **Pre-deployment Checks** (`scripts/pre-deploy-check.sh`): Validates your code before deployment
2. **Deployment Verification** (`scripts/verify-deployment.sh`): Confirms successful deployment
3. **Safe Deployment Script** (`deploy.sh`): All-in-one deployment process with safeguards
4. **CI/CD Pipeline** (GitHub Actions): Automated testing and deployment

## Deployment Script Usage

The safest way to deploy is using the main deployment script:

```bash
./deploy.sh feature/your-branch-name target-environment
```

Where `target-environment` is one of: `dev`, `staging`, or `production`.

Example:
```bash
./deploy.sh feature/css-variables-system dev
```

This script will:
1. Run pre-deployment checks on your feature branch
2. Switch to the target branch and pull latest changes
3. Merge your feature branch into the target branch
4. Run checks again on the merged result
5. Push changes to trigger deployment
6. Verify deployment success

## Manual Pre-deployment Checks

You can also run pre-deployment checks manually:

```bash
./scripts/pre-deploy-check.sh dev
```

This validates:
- Branch naming conventions
- Git status cleanliness
- PHP syntax
- CSS syntax
- WordPress debug settings
- Required CSS files
- WordPress database connection

## Manual Deployment Verification

After deployment, verify success with:

```bash
./scripts/verify-deployment.sh dev
```

This checks:
- GitHub Actions workflow status
- Site accessibility
- PHP fatal errors
- CSS variable file availability
- WP Engine deployment status

### WP Engine API Integration

The deployment verification script integrates with the WP Engine API for enhanced verification and management:

1. It can check the installation status directly via API
2. Automatically purge caches after deployment
3. Get detailed installation information

To use the WP Engine API, you'll need to set up API credentials:

1. Go to https://my.wpengine.com/api_access
2. Click on "Generate New API Key"
3. Give your key a descriptive name (e.g., "GitHub Actions Deployment Verification")
4. Select "User access" (account owners)
5. Click "Generate Key"
6. Save both the **API Key** and **API Secret**

Then set these as environment variables when running the script:

```bash
WPE_API_KEY=your_key WPE_API_SECRET=your_secret ./scripts/verify-deployment.sh dev
```

For GitHub Actions, add these as repository secrets:
- `WPE_API_KEY`
- `WPE_API_SECRET`

## GitHub Actions Workflow

The repository includes GitHub Actions workflows for continuous integration and deployment:

- `.github/workflows/wpe-deploy-dev.yml`: Deploys to development
- `.github/workflows/wpe-deploy-staging.yml`: Deploys to staging
- `.github/workflows/wpe-deploy-production.yml`: Deploys to production

Each workflow runs the same set of checks before deploying.

## Environment URLs

- Development: https://mbnycd.wpengine.com
- Staging: https://mbnycs.wpengine.com
- Production: https://mbnyc.com

## Troubleshooting

If deployment fails:

1. Check GitHub Actions logs for detailed error information
2. Run pre-deployment checks manually to identify issues
3. Fix any reported issues and try again

## Best Practices

- Always work in feature branches
- Run pre-deployment checks before merging
- Test in development before promoting to staging
- Test in staging before promoting to production
- Check Slack for deployment notifications

For more detailed information on the WP Engine deployment process, refer to the [WP Engine documentation](https://wpengine.com/support/git-push-deploy-add-on/). 