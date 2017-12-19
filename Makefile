DOCKER := linn/news
DOCKER_BRANCH_TAG := $(shell echo ${TRAVIS_BRANCH} | sed s/\#/_/g)
TIMESTAMP := $(shell date --utc +%FT%TZ)
PINGJSON := ping.json

define tag_docker
	@if [ "$(TRAVIS_BRANCH)" != "master" ]; then \
		docker tag $(1):$(TRAVIS_BUILD_NUMBER) $(1):BUILD$(DOCKER_BRANCH_TAG); \
	fi
	@if [ "$(TRAVIS_BRANCH)" = "master" -a "$(TRAVIS_PULL_REQUEST)" = "false" ]; then \
		docker tag $(1):$(TRAVIS_BUILD_NUMBER) $(1):latest; \
		docker tag $(1):$(TRAVIS_BUILD_NUMBER) $(1):K$(TRAVIS_BUILD_NUMBER); \
	fi
	@if [ "$(TRAVIS_PULL_REQUEST)" != "false" ]; then \
		docker tag $(1):$(TRAVIS_BUILD_NUMBER) $(1):PR$(TRAVIS_PULL_REQUEST); \
	fi
endef

build:
	npm install

$(PINGJSON):
	@echo "{ \"timeStamp\": \"$(TIMESTAMP)\", \"branch\": \"$(TRAVIS_BRANCH)\", \"build\": \"$(TRAVIS_BUILD_NUMBER)\", \"commit\": \"$(TRAVIS_COMMIT)\" }" > $(PINGJSON)

test: build $(PINGJSON)
	NODE_ENV=test npm test

$(DOCKER): build
	docker build -t $(DOCKER):$(TRAVIS_BUILD_NUMBER) .
	
all-the-dockers: $(DOCKER)

docker-tag:
	$(call tag_docker, $(DOCKER))

docker-push:
	@if [ -n "$(CI)" ]; then \
		docker push $(DOCKER); \
	else \
		echo "Only push to Docker from Travis"; \
		exit 1; \
	fi
