FROM 'node:lts-alpine'

RUN apk add --update --no-cache ffmpeg

USER node

WORKDIR /home/node/app

CMD [ "npm", "run", "start" ]
