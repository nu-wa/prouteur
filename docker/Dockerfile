FROM 'node:lts-alpine'

RUN apk add --update --no-cache ffmpeg

COPY "./entrypoint.sh" "/home/node"

USER node

WORKDIR /home/node/app

ENTRYPOINT [ "/home/node/entrypoint.sh" ]
