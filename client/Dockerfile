FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 35179

CMD ["npm", "run", "dev", "--", "--host"]