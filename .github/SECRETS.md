# GitHub Actions Secrets Configuration

This document lists all the secrets that need to be configured in GitHub for the CI/CD workflow to function properly.

## How to Configure Secrets

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret listed below

## Required Secrets

### AWS Credentials
These credentials are required for authenticating with AWS services (ECR and CloudFormation).

- **AWS_ACCESS_KEY_ID**
  - Description: AWS access key ID for authentication
  - Used for: ECR login, CloudFormation deployments
  - Example: `AKIAIOSFODNN7EXAMPLE`

- **AWS_SECRET_ACCESS_KEY**
  - Description: AWS secret access key for authentication
  - Used for: ECR login, CloudFormation deployments
  - Example: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

### Database Configuration
These secrets are used to configure the database connection for the deployed application.

- **DATABASE_HOST**
  - Description: Database server hostname or IP address
  - Used for: CloudFormation deployment parameters
  - Example: `my-database.example.com` or `10.0.1.100`

- **DATABASE_NAME**
  - Description: Name of the database to connect to
  - Used for: CloudFormation deployment parameters
  - Example: `news_production`

- **DATABASE_USER_ID**
  - Description: Database username for authentication
  - Used for: CloudFormation deployment parameters
  - Example: `news_app_user`

- **DATABASE_PASSWORD**
  - Description: Database password for authentication
  - Used for: CloudFormation deployment parameters
  - Example: `SecurePassword123!`

### RabbitMQ Configuration
These secrets are used to configure the RabbitMQ message queue connection.

- **RABBIT_SERVER**
  - Description: RabbitMQ server hostname or IP address
  - Used for: CloudFormation deployment parameters
  - Example: `rabbitmq.example.com`

- **RABBIT_PORT**
  - Description: RabbitMQ server port
  - Used for: CloudFormation deployment parameters
  - Example: `5672`

- **RABBIT_USERNAME**
  - Description: RabbitMQ username for authentication
  - Used for: CloudFormation deployment parameters
  - Example: `news_app`

- **RABBIT_PASSWORD**
  - Description: RabbitMQ password for authentication
  - Used for: CloudFormation deployment parameters
  - Example: `SecureRabbitPassword123!`

### Application Configuration

- **AUTHORITY_URI**
  - Description: URI for the authentication/authorization service
  - Used for: CloudFormation deployment parameters
  - Example: `https://auth.example.com`

### Logging Configuration

- **LOG_ENVIRONMENT**
  - Description: Environment identifier for logging (e.g., production, staging)
  - Used for: CloudFormation deployment parameters
  - Example: `production`

- **LOG_MAX_INNER_EXCEPTION_DEPTH**
  - Description: Maximum depth for logging inner exceptions
  - Used for: CloudFormation deployment parameters
  - Example: `5`

## Secrets Summary

Total secrets required: **13**

### Quick Checklist
- [ ] AWS_ACCESS_KEY_ID
- [ ] AWS_SECRET_ACCESS_KEY
- [ ] DATABASE_HOST
- [ ] DATABASE_NAME
- [ ] DATABASE_USER_ID
- [ ] DATABASE_PASSWORD
- [ ] RABBIT_SERVER
- [ ] RABBIT_PORT
- [ ] RABBIT_USERNAME
- [ ] RABBIT_PASSWORD
- [ ] AUTHORITY_URI
- [ ] LOG_ENVIRONMENT
- [ ] LOG_MAX_INNER_EXCEPTION_DEPTH

## Migration Notes

### Differences from Travis CI

1. **AWS CLI Installation**: GitHub Actions uses official AWS actions instead of manually installing AWS CLI
2. **Environment Variables**: Travis CI environment variables (TRAVIS_BRANCH, TRAVIS_BUILD_NUMBER, etc.) are mapped to GitHub Actions equivalents
3. **Docker Service**: GitHub Actions runners have Docker pre-installed
4. **Node.js Version**: Configured to use Node.js 4.1 to match Travis CI setup

### Workflow Triggers

The workflow is triggered on:
- Push to any branch
- Pull requests to any branch

### Deployment Behavior

The deployment logic matches the Travis CI setup:
- **Master branch (not a PR)**: Deploys to production stack (`news`)
- **Master branch (PR)**: Deploys to sys stack (`news-sys`)
- **Other branches**: Deploys to int stack (`news-int`)

## Verification

After configuring all secrets, you can verify the workflow by:

1. Pushing a commit to a test branch
2. Checking the **Actions** tab in your GitHub repository
3. Monitoring the workflow run to ensure all steps complete successfully

## Security Best Practices

1. **Rotate credentials regularly**: Update secrets periodically for security
2. **Use least privilege**: Ensure AWS credentials have only the minimum required permissions
3. **Audit access**: Regularly review who has access to repository secrets
4. **Never commit secrets**: Secrets should only be stored in GitHub Secrets, never in code
