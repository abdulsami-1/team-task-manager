# Dockerfile for Express backend
# Works on Render, Cloud Run, and Hugging Face Spaces (port 7860)
FROM node:20-slim

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install --production

# Copy source
COPY . .

# Hugging Face Spaces requires port 7860
# Other platforms use PORT env var, falling back to 4000
ENV PORT=7860
EXPOSE 7860

CMD ["node", "index.js"]
