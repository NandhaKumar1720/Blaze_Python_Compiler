# Use the official Node.js image as the base
FROM node:16

# Install Python and necessary build tools
RUN apt-get update && apt-get install -y python3 python3-pip build-essential

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package.json package-lock.json ./

# Install dependencies using npm
RUN npm install

# Install WebSocket and Terminal Dependencies
RUN npm install express ws xterm xterm-addon-attach xterm-addon-fit

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
