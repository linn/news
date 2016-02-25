#!/bin/bash

CONFIGURATION=${1}
TARGET_HOST=${2}
PACKAGE_NAME="news-service"

echo "*************************************"
echo "*"
echo "* Configuration : ${CONFIGURATION}"
echo "* Target Host   : ${TARGET_HOST}"
echo "*"
echo "*************************************"

echo "update the service files"
ssh -oStrictHostKeyChecking=no linn-service@${TARGET_HOST} "sudo apt-get update"
ssh -oStrictHostKeyChecking=no linn-service@${TARGET_HOST} "sudo apt-get install ${PACKAGE_NAME}"

echo "Starting News Service"
ssh -oStrictHostKeyChecking=no linn-service@${TARGET_HOST} "sudo /etc/init.d/news-service start"
