FROM node:4-slim

EXPOSE 3000

ARG USER=service-user

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN npm install --production --quiet

RUN useradd -ms /bin/bash -d /usr/src/app $USER
RUN chown $USER:$USER /usr/src/app
USER $USER


CMD [ "npm", "start" ]
