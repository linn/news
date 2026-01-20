# Travis CI to GitHub Actions Migration Guide

This document provides a comprehensive guide for migrating from Travis CI to GitHub Actions for the Linn News service.

## Overview

The migration maintains full compatibility with existing build and deployment processes while leveraging GitHub Actions' native integration with the repository.

## What Changed

### Files Added
- `.github/workflows/ci-cd.yml` - Main CI/CD workflow
- `.github/workflows/README.md` - Workflow documentation
- `.github/SECRETS.md` - Detailed secrets configuration guide
- `.github/MIGRATION.md` - This file

### Files Modified
- `README.md` - Updated build status badge from Travis CI to GitHub Actions

### Files Unchanged
- `.travis.yml` - Kept for reference (can be removed after successful migration)
- `Makefile` - No changes required
- `scripts/deploy.sh` - No changes required
- All application code - No changes required

## Migration Process

### Step 1: Configure Secrets

**IMPORTANT:** Before enabling the workflow, you must configure all required secrets in GitHub.

Navigate to: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

Configure the following 13 secrets (see `.github/SECRETS.md` for detailed descriptions):

#### AWS Credentials (2 secrets)
1. `AWS_ACCESS_KEY_ID`
2. `AWS_SECRET_ACCESS_KEY`

#### Database Configuration (4 secrets)
3. `DATABASE_HOST`
4. `DATABASE_NAME`
5. `DATABASE_USER_ID`
6. `DATABASE_PASSWORD`

#### RabbitMQ Configuration (4 secrets)
7. `RABBIT_SERVER`
8. `RABBIT_PORT`
9. `RABBIT_USERNAME`
10. `RABBIT_PASSWORD`

#### Application Configuration (3 secrets)
11. `AUTHORITY_URI`
12. `LOG_ENVIRONMENT`
13. `LOG_MAX_INNER_EXCEPTION_DEPTH`

### Step 2: Verify Workflow

1. Merge this PR to enable GitHub Actions
2. The workflow will automatically run on the next push
3. Monitor the workflow in the **Actions** tab
4. Verify that all steps complete successfully

### Step 3: Disable Travis CI (Optional)

Once you've verified that GitHub Actions is working correctly:
1. Go to Travis CI settings for this repository
2. Disable the repository or remove the integration
3. Optionally remove `.travis.yml` from the repository

## Key Differences

| Aspect | Travis CI | GitHub Actions |
|--------|-----------|----------------|
| Configuration File | `.travis.yml` | `.github/workflows/ci-cd.yml` |
| AWS CLI | Manually installed | Official AWS actions |
| Docker | Explicitly enabled | Pre-installed on runners |
| Secrets | Travis CI environment variables | GitHub repository secrets |
| Build Numbers | `TRAVIS_BUILD_NUMBER` | `github.run_number` |
| Branch Name | `TRAVIS_BRANCH` | `github.ref_name` |
| Commit SHA | `TRAVIS_COMMIT` | `github.sha` |

## Workflow Behavior

### Triggers
- **Push to any branch**: Runs full CI/CD pipeline
- **Pull request**: Runs full CI/CD pipeline

### Steps
1. **Checkout code**: Clone the repository
2. **Set up Node.js**: Install Node.js 4.1 (matching Travis)
3. **Make scripts executable**: Ensure deployment scripts can run
4. **Configure AWS credentials**: Authenticate with AWS
5. **Login to Amazon ECR**: Authenticate with Docker registry
6. **Set environment variables**: Map GitHub Actions variables to Travis equivalents
7. **Build Docker images**: Run `make all-the-dockers`
8. **Tag Docker images**: Run `make docker-tag`
9. **Push Docker images**: Run `make docker-push`
10. **Deploy to AWS**: Run `./scripts/deploy.sh`

### Deployment Logic

The workflow maintains the same deployment logic as Travis CI:

| Condition | Stack | Environment |
|-----------|-------|-------------|
| Master branch (not PR) | `news` | Production |
| Master branch (PR) | `news-sys` | Sys |
| Other branches | `news-int` | Int |

## Compatibility

The GitHub Actions workflow is designed to be 100% compatible with the existing infrastructure:

- ✅ Uses the same Makefile targets
- ✅ Uses the same deployment script
- ✅ Uses the same Docker registry
- ✅ Uses the same CloudFormation templates
- ✅ Maintains the same environment variable names
- ✅ Preserves the same deployment logic

## Troubleshooting

### Workflow fails at "Login to Amazon ECR"
- Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are correctly set
- Ensure the AWS credentials have ECR permissions

### Workflow fails at "Deploy to AWS"
- Verify all database and RabbitMQ secrets are configured
- Check CloudFormation logs in AWS Console
- Ensure AWS credentials have CloudFormation permissions

### Build fails at "Build Docker images"
- Check if npm install is successful
- Verify tests are passing
- Review Docker build logs

### Environment variables not set correctly
- Verify the branch name mapping logic
- Check if pull request detection is working
- Review the "Set environment variables" step output

## Monitoring

### View Workflow Runs
1. Go to the **Actions** tab in GitHub
2. Select the **CI/CD** workflow
3. View run history and logs

### Workflow Status Badge
The README now includes a GitHub Actions badge that shows the current build status:

```markdown
[![CI/CD](https://github.com/linn/news/workflows/CI/CD/badge.svg)](https://github.com/linn/news/actions)
```

## Support

For issues with:
- **GitHub Actions**: Check GitHub Actions documentation or GitHub support
- **AWS deployment**: Review CloudFormation logs and AWS credentials
- **Application issues**: Check application logs in AWS

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS Actions on GitHub Marketplace](https://github.com/marketplace?type=actions&query=aws)
- [Workflow syntax reference](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
