# Linn News Service - Copilot Agent Instructions

## Project Overview

**Purpose**: A Node.js/Express web service providing company news and announcements with REST API and HTML rendering capabilities.

**Technology Stack**:
- **Runtime**: Node.js 4.1+ (Travis CI uses 4.1, modern versions work)
- **Framework**: Express.js 4.11
- **View Engine**: Jade (now Pug) 1.9
- **Storage**: AWS DynamoDB (via repository-dynamodb)
- **File Storage**: AWS S3 for attachments
- **Testing**: Mocha + Chai + Sinon
- **Package Manager**: npm (with Bower for frontend dependencies)
- **CI/CD**: Travis CI with Docker deployment to AWS ECS
- **Containerization**: Docker (deployed to AWS ECR)

**Repository Size**: Small (~46 source files excluding dependencies)

## Build & Test Commands

### Prerequisites
- Node.js and npm installed (v4.1+ specified in Travis, but modern versions work)
- AWS credentials configured for DynamoDB and S3 access (for production use)
- For development, tests use mocked AWS services

### Installation (ALWAYS run first)
```bash
npm install
```
**What it does**: 
- Installs npm dependencies
- Automatically runs `bower install` via postinstall hook
- Installs frontend dependencies (Bootstrap, jQuery, markdown editor)

**Time**: ~10-20 seconds

**Important**: `npm install` MUST be run before any build, test, or run commands. The postinstall hook automatically installs Bower components, so you don't need to run `bower install` separately.

### Testing
```bash
NODE_ENV=test npm test
```
**What it does**: Runs Mocha test suite (41 tests) with recursive discovery
**Time**: ~1 second
**Expected output**: "41 passing"
**Location**: Tests in `test/unit/` and `test/integration/`

**Note**: Tests use mockery to stub AWS services, so no AWS credentials needed for testing.

### Build (via Makefile)
```bash
make build
```
**What it does**: Runs `npm install` (which includes bower install)

```bash
make test
```
**What it does**: 
1. Runs `make build`
2. Generates `ping.json` with build metadata
3. Runs `NODE_ENV=test npm test`

**Docker Build** (requires Travis CI environment variables):
```bash
make all-the-dockers
```
Builds Docker image (requires TRAVIS_BUILD_NUMBER and Docker installed)

### Running the Service
```bash
npm start
```
**What it does**: Starts server on port 3000 (or PORT environment variable)
**Entry point**: `bin/www`

**Required Environment Variables** (use .env file for local dev):
- `AWS_REGION` (e.g., "eu-west-1")
- `PORT` (default: 3000)
- `NEWS_TABLE_NAME` (DynamoDB table name)
- `NEWS_ATTACHMENTS_BUCKET` (S3 bucket name)
- `NODE_ENV` (test, debug, int, or release)

## Project Structure

### Root Directory Files
- `app.js` - Main Express application setup and routing
- `package.json` - npm dependencies and scripts
- `bower.json` - Frontend dependencies (Bootstrap, markdown editor)
- `Makefile` - Build automation for CI/CD
- `.travis.yml` - Travis CI configuration
- `.jshintrc` - JSHint linting configuration (strict mode, ES6 features)
- `Dockerfile` - Multi-stage Docker build configuration
- `ping.json` - Runtime metadata (generated during build)

### Directory Structure
```
/bin/www                    - Server startup script
/app.js                     - Express app configuration
/config/index.js            - Configuration via 12factor-config
/logger/index.js            - Winston logger setup
/routes/                    - Express route handlers
  news.js                   - News CRUD operations
  notifications.js          - Notifications endpoint
  s3.js                     - Image upload to S3
  pingApi.js                - Health check endpoint
  factories/index.js        - Data transformation utilities
/repositories/
  newsRepository.js         - DynamoDB data access layer
/views/                     - Jade templates
  create.jade               - News article creation/edit form
  news.jade                 - News article display
  error.jade                - Error pages
  layout.jade               - Base layout template
/public/                    - Static assets
  javascripts/              - Frontend JS
  stylesheets/              - CSS files
/test/
  unit/                     - Unit tests (factories)
  integration/              - Integration tests (routes/API)
  data/                     - Test data
  .jshintrc                 - Test-specific JSHint config
/ContinuousIntegration/
  CloudFormation/           - AWS CloudFormation templates
/scripts/
  deploy.sh                 - Deployment automation script
```

### Key Source Files

**app.js**: Main Express application
- Sets up middleware (body-parser, cookie-parser, morgan logger)
- Configures Jade view engine
- Mounts routes for /news, /notifications, /healthcheck endpoints
- Serves static files and bower_components
- Error handling middleware

**routes/news.js**: Core business logic
- Handles news article CRUD operations
- Content negotiation (HTML vs JSON)
- Media types: `application/vnd.linn.news+json; version=1`

**repositories/newsRepository.js**: Data access
- Uses repository-dynamodb package
- Custom methods: `listCurrentArticles()`, `listLabels()`
- Filters by date/expiration using DynamoDB FilterExpression

**config/index.js**: Configuration management
- Uses 12factor-config for environment variables
- Loads .env file via dotenv (for local development)

## API Endpoints

**HTML endpoints** (Accept: text/html):
- `GET /news/create` - Create article form
- `GET /news/:articleId/edit` - Edit article form
- `GET /news/:articleId` - Display article

**JSON API** (Accept: application/json):
- `GET /news/labels` - List all labels
- `POST /news/upload` - Upload image (multipart form)
- `GET /news/:articleId` - Get article JSON
- `PUT /news/:articleId` - Create/update article
- `DELETE /news/:articleId` - Delete article
- `GET /news?count=N` - List recent articles (default: all current)
- `GET /notifications` - List as notification objects

**Health check**:
- `GET /healthcheck` - Returns ping.json with build metadata

## CI/CD Pipeline

### Travis CI Workflow (.travis.yml)
1. **before_install**:
   - Make scripts executable
   - Install AWS CLI
   
2. **before_script**:
   - Login to AWS ECR

3. **script** (all commands MUST succeed):
   - `make all-the-dockers` - Build Docker image
   - `make docker-tag` - Tag image based on branch/PR
   - `make docker-push` - Push to ECR

4. **after_success**:
   - `./scripts/deploy.sh` - Deploy via CloudFormation
   - Deploys to different environments based on branch:
     - master branch → production (news)
     - master PR → sys environment (news-sys)
     - other branches → int environment (news-int)

### Docker Tagging Strategy
- All builds: `BUILD_{TRAVIS_BUILD_NUMBER}`
- Master branch: `latest`, `K_{TRAVIS_BUILD_NUMBER}`
- Feature branches: `BUILD_{BRANCH_NAME}`
- Pull requests: `PR_{PR_NUMBER}`

### Environment Variables (CI)
Travis CI provides:
- `TRAVIS_BRANCH`
- `TRAVIS_BUILD_NUMBER`
- `TRAVIS_COMMIT`
- `TRAVIS_PULL_REQUEST`
- AWS credentials for ECR and CloudFormation

## Development Guidelines

### Code Style
- JSHint enforced (see .jshintrc):
  - Strict mode required ("use strict")
  - ES6 features enabled (esnext: true)
  - No undefined variables
  - Curly braces required
  - Triple equals (===) required
- Use Winston for logging (not console.log)
- Follow existing error handling patterns (status codes, next(err))

### Testing Patterns
- **Integration tests**: Use mockery to stub dependencies
- **Setup/teardown**: Always enable/disable mockery properly
- **Assertions**: Use Chai expect syntax with sinon-chai
- **Test structure**: Follow existing patterns in test/integration/newsSpecs.js
- Tests run with `NODE_ENV=test`

### Common Pitfalls
1. **Bower Warning**: "name" in bower.json should be lowercase - This is expected, ignore it
2. **npm audit vulnerabilities**: 32 known vulnerabilities in old dependencies - This is a legacy project, don't fix unless explicitly asked
3. **Node version**: Travis uses Node 4.1, but modern versions (v20+) work fine for development
4. **AWS Credentials**: Not needed for tests (mocked), but required for running the service
5. **ping.json**: Generated by Makefile during build, initially empty `{}`

### Making Changes
1. **Always install dependencies first**: `npm install`
2. **Run tests after changes**: `NODE_ENV=test npm test`
3. **For route changes**: Update both the route handler and app.js if adding new routes
4. **For data model changes**: Update factories, repository, and tests
5. **For AWS resource changes**: Update CloudFormation templates
6. **Configuration changes**: Use 12factor-config pattern in config/index.js

### File Changes to Avoid
- Don't modify `.travis.yml` without understanding CI implications
- Don't change Dockerfile base image (node:4-slim is intentional)
- Don't update major dependencies without testing extensively
- Don't modify CloudFormation templates unless explicitly needed
- Don't commit node_modules/ or bower_components/ (.gitignore excludes them)

## AWS Resources

### DynamoDB Table
- Table name format: `linn.cloud.news[.{env}]` (e.g., linn.cloud.news.int)
- Primary key: articleId (string)
- No secondary indices
- Attributes: articleId, title, summary, content, labels, date, expiration

### S3 Bucket
- Bucket name format: `linn.cloud.news.attachments[.{env}]`
- Public read access for attachments
- Used for article images via POST /news/upload

### Permissions Required (Development)
- DynamoDB full access on news table
- S3 full access on attachments bucket
- See storageSetup.md for IAM policy examples

## Validation Checklist

Before completing any task, verify:
1. ✅ `npm install` runs successfully
2. ✅ `NODE_ENV=test npm test` passes (41 passing)
3. ✅ No unintended changes to configuration files
4. ✅ Code follows JSHint rules (check .jshintrc)
5. ✅ New routes added to app.js if applicable
6. ✅ Tests updated for changed functionality
7. ✅ No secrets or credentials committed
8. ✅ AWS resource names follow environment conventions

## Quick Reference

**To make a code change**:
```bash
# 1. Install dependencies
npm install

# 2. Make your changes

# 3. Test
NODE_ENV=test npm test

# 4. If adding routes/significant changes, test locally
npm start
# Then test endpoints
```

**To debug CI failures**:
- Check Travis CI logs for the specific failing step
- Common issues: Docker build failures (missing dependencies), test failures, CloudFormation errors
- Makefile commands require TRAVIS_* environment variables for Docker operations

**Dependencies to know**:
- express: Web framework
- jade: Template engine (renamed to Pug, but this project uses old version)
- aws-sdk: AWS service clients
- repository-dynamodb: DynamoDB abstraction layer
- morgan: HTTP request logger
- winston: Application logger
- mocha/chai/sinon: Testing framework

## Trust These Instructions

These instructions are validated by running actual builds and tests. If you encounter issues:
1. First, verify you followed the exact commands above
2. Check that environment variables are set correctly
3. Ensure AWS credentials are configured if needed
4. If instructions seem incorrect, investigate and update them

Only search for additional information if these instructions are incomplete or proven incorrect.
