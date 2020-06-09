FROM node:14

RUN npm install -g serve

WORKDIR /usr/src/app
COPY package*.json ./
COPY .env ./
RUN npm install

COPY ./public ./public
COPY ./src ./src

RUN npm run build

EXPOSE 80

CMD [ "serve",  "-s",  "build" ]