FROM node:18-alpine

# Install deps
RUN apk add --no-cache python3 make g++ tini

# Install pnpm
RUN npm install -g pnpm

# Set working dir
WORKDIR /app

# Copy and install n8n
COPY . .
RUN pnpm install && pnpm run build

# Expose port
EXPOSE 5678

# Start n8n
CMD ["npx", "n8n"]
