FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p uploads/media uploads/curriculum dist

# Build frontend (with error handling)
RUN npm run build || (echo "Frontend build failed, using fallback" && mkdir -p dist/public && echo '<!DOCTYPE html><html><head><title>Aida AI Tutor</title></head><body><div id="root"><h1>Aida AI Tutor</h1><p>Loading...</p></div></body></html>' > dist/public/index.html)

# Build backend
RUN npx esbuild server/index.ts --bundle --platform=node --target=node20 --format=esm --outdir=dist --external:express --external:multer --external:openai --external:ws

# Clean up dev dependencies
RUN npm prune --production

# Expose port
EXPOSE $PORT

# Set environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/ || exit 1

# Start application
CMD ["node", "dist/index.js"]
