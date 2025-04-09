FROM node:18-slim

# Install dependencies
RUN apt-get update && apt-get install -y python3 python3-pip

# Working directory 
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Build TypeScript
RUN npm run build

# Install ChromaDB
RUN pip3 install chromadb

# Expose ports
EXPOSE 3000 8000

# Create volume for persistent data
VOLUME ["/app/chroma-db", "/app/code-to-analyze"]

# Start application
CMD ["npm", "start"]