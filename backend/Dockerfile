FROM node:20-alpine

WORKDIR /usr/src/app
# copy package inside the ./ directory the current directory
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]