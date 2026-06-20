FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

COPY . .

RUN mkdir -p /app/data /app/uploads
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "mkdir -p /app/data /app/uploads && npx prisma migrate deploy && npm run start"]
