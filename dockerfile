# Use an official Node.js runtime as a parent image
FROM node:latest

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle your app source
COPY . .

# Expose the port your app runs on
EXPOSE 3001

# Command to run your application
CMD ["node", "index.js"]
