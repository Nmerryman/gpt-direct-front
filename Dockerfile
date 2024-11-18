FROM node:18 AS build

WORKDIR /app

ENV NEXT_PUBLIC_API_URL=${API_URL}

COPY package.json package.json

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD npm run start
