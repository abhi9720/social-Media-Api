# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory
WORKDIR /app

# Clone the repository
RUN git clone https://github.com/abhi9720/social-Media-Api.git

# Switch to the cloned repository directory
WORKDIR /app/social-Media-Api

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the app's port
EXPOSE 3000

# Run the app
CMD ["npm", "start"]

# Add a MongoDB container
FROM mongo:latest

# Set the working directory
WORKDIR /data/db

# Expose the MongoDB port
EXPOSE 27017

# Run MongoDB
CMD ["mongod"]
