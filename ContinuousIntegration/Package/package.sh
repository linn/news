#!/bin/bash

SYSROOT=deb-src/sysroot
TARGET_DIR=${SYSROOT}/opt/linn/news-service
DEBIAN=deb-src/DEBIAN

CONFIGURATION=${1}
BRANCH=${2}
BUILD_NUMBER=${3}
PRODUCTION_RELEASE=${4}

GIT_COMMIT=`git show-ref origin/${BRANCH} | grep remotes | cut -d ' ' -f 1`
TIMESTAMP=`date --utc +%FT%TZ`
PACKAGE_NAME="news-service"
PACKAGE_VERSION="0.${BUILD_NUMBER}"

if [ ${PRODUCTION_RELEASE} = true ]
then
	PACKAGE_VERSION="1.${BUILD_NUMBER}"
fi

echo "*************************************"
echo "*"
echo "* Configuration : ${CONFIGURATION}"
echo "* Branch        : ${BRANCH}"
echo "* Build Number  : ${BUILD_NUMBER}"
echo "* Git Commit    : ${GIT_COMMIT}"
echo "* Package Name  : ${PACKAGE_NAME}"
echo "* Package Ver   : ${PACKAGE_VERSION}"
echo "*"
echo "*************************************"

echo "Setup directories"
mkdir -p ${DEBIAN}
mkdir -p ${SYSROOT}
mkdir -p ${TARGET_DIR}
mkdir -p ${SYSROOT}/etc/init.d

# Get files for Deb file
echo "Packaging Template"
git archive --format=tar origin/${BRANCH} | tar --directory=${TARGET_DIR} -xf -

# Copy Environment
echo "Copying Environment"
mkdir -p ${TARGET_DIR}/config
git archive --format=tar origin/${BRANCH}:config ${CONFIGURATION}.js | tar --directory=${TARGET_DIR}/config -xf -

# Only copy ddl.js if deploying to int
if [ ${CONFIGURATION} = "int" ]
then
	echo "Copying DDL library"
	mkdir -p ${TARGET_DIR}/config/libs
	git archive --format=tar origin/${BRANCH}:routes/libs ddl.js | tar --directory=${TARGET_DIR}/config/libs -xf -
    PACKAGE_NAME="news-service-int"
fi

# Create ping resources
echo "Creating ping resources"
echo "{ \"timeStamp\": \"${TIMESTAMP}\", \"config\": \"${CONFIGURATION}\", \"branch\": \"${BRANCH}\", \"build\": \"${BUILD_NUMBER}\", \"commit\": \"${GIT_COMMIT}\" }" > ${TARGET_DIR}/ping.json

echo "Copying Init Script"
git archive --format=tar origin/${BRANCH}:ContinuousIntegration/Deploy/startup-scripts news-service.${CONFIGURATION} | tar --directory=${SYSROOT}/etc/init.d/ -xf -
mv ${SYSROOT}/etc/init.d/news-service.${CONFIGURATION} ${SYSROOT}/etc/init.d/news-service
chmod +x ${SYSROOT}/etc/init.d/news-service

echo "Create preinst file"
echo "if [ -e /etc/init.d/news-service ]" > ${DEBIAN}/preinst
echo "then" >> ${DEBIAN}/preinst
echo "/etc/init.d/news-service stop" >> ${DEBIAN}/preinst
echo "fi" >> ${DEBIAN}/preinst

echo "Create postinst file"
echo "adduser --system --group news-service" > ${DEBIAN}/postinst

echo "Copy preinst file to prerm to stop service when uninstalling"
cp ${DEBIAN}/preinst ${DEBIAN}/prerm

echo "Make control file"
echo "Package: ${PACKAGE_NAME}" > ${DEBIAN}/control
echo "Version: ${PACKAGE_VERSION}" >> ${DEBIAN}/control
echo "Section: base" >> ${DEBIAN}/control
echo "Priority: optional" >> ${DEBIAN}/control
echo "Architecture: amd64" >> ${DEBIAN}/control
INSTALLED_SIZE=`du -s ${SYSROOT}`
echo "Installed-Size: ${INSTALLED_SIZE}" >> ${DEBIAN}/control
echo "Depends: nodejs (>= 4.0)" >> ${DEBIAN}/control
echo "Maintainer: IT  <it.developers@linn.co.uk>" >> ${DEBIAN}/control
echo "Description: Linn internal news service" >> ${DEBIAN}/control

echo "Creating deb package"
pushd deb-src/

pushd sysroot/
fakeroot -- tar czf ../data.tar.gz *
popd

pushd DEBIAN/
fakeroot -- tar czf ../control.tar.gz *
popd

echo 2.0 > debian-binary
fakeroot -- ar r ../news-service-${PACKAGE_VERSION}-${CONFIGURATION}.deb debian-binary control.tar.gz data.tar.gz
popd
