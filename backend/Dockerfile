# --- Stage 1: Build Stage ---
# Use a Node.js image to install dependencies
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install all dependencies, including development ones for potential build steps
RUN npm install

# Copy the rest of the application source code
COPY . .


# --- Stage 2: Production Stage ---
# Use a slim, secure Node.js image for the final container
FROM node:18-alpine

WORKDIR /app

# Copy package.json to install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the application code from the builder stage
COPY --from=builder /app .

# Expose the port the application will run on
EXPOSE 3001

# The command to start the application
CMD ["node", "server.js"]