# Use a Node.js base image
FROM node:20

# Install Ionic CLI globally
RUN npm install -g @ionic/cli

# Install Capacitor globally
RUN npm install -g @capacitor/cli

# Set the working directory in the container
WORKDIR /app

# Install Capacitor core (assuming it's part of your project dependencies)
RUN npm install @capacitor/core

# Install development dependencies (assuming Capacitor CLI is a dev dependency)
RUN npm install @capacitor/cli --save-dev

# Copy package.json
COPY package.json .

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Create an empty environment.ts file
RUN touch src/environments/environment.ts

# Expose the port
EXPOSE 8100

# Command to run the Ionic serve
CMD ["ionic", "serve", "--host", "0.0.0.0"]

