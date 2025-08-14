FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/media uploads/curriculum

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Expose port (Railway uses PORT env variable)
EXPOSE $PORT

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]