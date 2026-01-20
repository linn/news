# GitHub Actions Workflows

This directory contains GitHub Actions workflows that replace the Travis CI configuration.

## Workflows

### ci-cd.yml
Main CI/CD workflow that:
1. Builds the Node.js application
2. Runs tests
3. Builds Docker images
4. Pushes images to AWS ECR
5. Deploys to AWS using CloudFormation

This workflow replaces the `.travis.yml` configuration file.

## Setup Instructions

Before the workflow can run successfully, you must configure the required secrets in GitHub.

See [../.github/SECRETS.md](../SECRETS.md) for detailed instructions on configuring the required secrets.

## Migration from Travis CI

This workflow maintains compatibility with the existing Makefile and deployment scripts by:
- Mapping GitHub Actions environment variables to Travis CI equivalents
- Using the same Docker build and deployment process
- Maintaining the same deployment logic (production, sys, int environments)

## Triggering the Workflow

The workflow runs automatically on:
- Every push to any branch
- Every pull request

## Monitoring

View workflow runs in the **Actions** tab of the GitHub repository.
