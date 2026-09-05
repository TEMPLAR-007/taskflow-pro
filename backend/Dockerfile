FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN rm -rf dist tsconfig.tsbuildinfo
RUN npx tsc

EXPOSE 3001

CMD ["node", "dist/main.js"]
