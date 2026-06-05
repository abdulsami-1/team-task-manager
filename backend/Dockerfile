# Simple Dockerfile for the Express backend (used for Cloud Run)
FROM node:20-slim

WORKDIR /app

# Install dependencies first for better build caching
COPY package*.json ./
RUN npm install --production

# Copy the rest of the code
COPY . .

ENV PORT=4000
EXPOSE 4000

CMD ["node", "index.js"]