#!/bin/bash

# Install dependencies for Python and Node.js
echo "Installing dependencies..."

# Install Python 3 and pip
apt-get update
apt-get install -y python3 python3-pip build-essential

# Install Node.js dependencies
npm install
npm install express ws xterm xterm-addon-attach xterm-addon-fit

echo "Dependencies installed successfully."

# Run the server
echo "Starting the server..."
npm start
