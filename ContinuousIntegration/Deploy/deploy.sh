#!/bin/bash

CONFIGURATION=${1}
TARGET_HOST=${2}
PACKAGE_NAME="news-service"

if [ ${CONFIGURATION} = "int" ]
then
    echo "Overriding TARGET_HOST"
    TARGET_HOST='apphost-int-linux'
    PACKAGE_NAME="news-service-int"
fi

echo "*************************************"
echo "*"
echo "* Configuration : ${CONFIGURATION}"
echo "* Target Host   : ${TARGET_HOST}"
echo "*"
echo "*************************************"

echo "update the service files"
ssh -oStrictHostKeyChecking=no exakt@${TARGET_HOST} "sudo apt-get update"
ssh -oStrictHostKeyChecking=no exakt@${TARGET_HOST} "sudo apt-get install ${PACKAGE_NAME}"  

echo "Starting News Service"
ssh -oStrictHostKeyChecking=no exakt@${TARGET_HOST} "sudo /etc/init.d/news-service start"
