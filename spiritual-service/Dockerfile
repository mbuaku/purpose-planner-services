FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p uploads

EXPOSE 3005

CMD ["npm", "run", "dev"]