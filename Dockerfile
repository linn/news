FROM node:4-slim

EXPOSE 3000

WORKDIR /usr/src/app

# Add service-user user so we aren't running as root.
RUN adduser -h /usr/src/service-user -D -H service-user && && chown -R service-user:service-user /usr/src/app

USER service-user

COPY . /usr/src/app

RUN npm install --production --quiet

CMD [ "npm", "start" ]
