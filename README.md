# Linn News Service

A service which provides company news and announcements

## Installation

This service uses AWS, you will need to acquire credentials and install them on the target server first. 

### Packaging

A .deb file can be created when running `ContinuousIntegration/Package/package.sh` which takes in the following parameters:

```
CONFIGURATION=${1}
BRANCH=${2}
BUILD_NUMBER=${3}
PRODUCTION_RELEASE=${4}
```

This will create a `news-service-${PACKAGE_VERSION}-${CONFIGURATION}.deb` file

### Deployment

Can install manually, or via the `ContinuousIntegration/Deploy/deploy.sh` script which takes in the following parameters:

```
CONFIGURATION=${1}
TARGET_HOST=${2}
```

## Usage

`accept text/html`

`GET /news/create` - Will return an HTML page in which you can create a news article
`GET /news/:articleId/edit` - Will return an HTML page in which you can edit an existing news article
`GET /news/:articleId` - Will return an HTML rendering of the news article

### API

`accept application/json`

`GET /news/labels` - Return JSON array of labels in use
`POST /news/upload` - Multi Part FORM Post capability to upload an image for use in an article
`GET /news/:articleId` - Return JSON news article
`PUT /news/:articleId` - Replace a news article with this
`DELETE /news/:articleId` - Remove a news article (referenced images will not be removed)
`GET /news` - List most recent news articles with summaries; use `count` attribute to request a different number than the default
`GET /notifications` - List most recent news articles in the shape of notifications

```


```
