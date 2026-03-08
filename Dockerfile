FROM node:20-alpine

WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .
USER appuser

CMD ["npm", "test"]
