#!/bin/bash
set -ev

# # install aws cli
# curl "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip" -o "awscli-bundle.zip"
# unzip awscli-bundle.zip
# ./awscli-bundle/install -b ~/bin/aws
# export PATH=~/bin:$PATH

# deploy on aws
if [ "${TRAVIS_BRANCH}" = "master" ]; then
  if [ "${TRAVIS_PULL_REQUEST}" = "false" ]; then
    # master - deploy to production
    echo deploy to production

    #aws s3 cp s3://$S3_BUCKET_NAME/template/production.env ./secrets.env

    STACK_NAME=news
    APP_ROOT=http://app.linn.co.uk
    PROXY_ROOT=http://app.linn.co.uk
  	ENV_SUFFIX=
  else
    # pull request based on master - deploy to sys
    echo deploy to sys

    #aws s3 cp s3://$S3_BUCKET_NAME/template/sys.env ./secrets.env

    STACK_NAME=news-sys
    APP_ROOT=http://app-sys.linn.co.uk
    PROXY_ROOT=http://app.linn.co.uk
    ENV_SUFFIX=-sys
  fi
else
  # not master - deploy to int
  echo deploy to int

    #aws s3 cp s3://$S3_BUCKET_NAME/template/int.env ./secrets.env

    STACK_NAME=news-int
    APP_ROOT=http://app-int.linn.co.uk
    PROXY_ROOT=http://app.linn.co.uk
    ENV_SUFFIX=-int
fi

# load the secret variables but hide the output from the travis log
#source ./secrets.env > /dev/null 2>&1

# deploy the service to amazon
aws cloudformation deploy --stack-name $STACK_NAME --template-file ./ContinuousIntegration/Cloudformation/newsAppCloudFormation.yml --parameter-overrides dockerTag=$TRAVIS_BUILD_NUMBER databaseHost=$DATABASE_HOST databaseName=$DATABASE_NAME databaseUserId=$DATABASE_USER_ID databasePassword=$DATABASE_PASSWORD rabbitServer=$RABBIT_SERVER rabbitPort=$RABBIT_PORT rabbitUsername=$RABBIT_USERNAME rabbitPassword=$RABBIT_PASSWORD appRoot=$APP_ROOT proxyRoot=$PROXY_ROOT authorityUri=$AUTHORITY_URI loggingEnvironment=$LOG_ENVIRONMENT loggingMaxInnerExceptionDepth=$LOG_MAX_INNER_EXCEPTION_DEPTH environmentSuffix=$ENV_SUFFIX --capabilities=CAPABILITY_IAM

echo "deploy complete"