# Use a node base image
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Create .env file with VITE_API_URL set to empty
RUN echo "VITE_API_URL=" > .env

# Build the React app
RUN npm run build

# Use a lightweight web server to serve the static files
FROM nginx:alpine

# Copy the React app build files to the NGINX directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port that NGINX is running on
EXPOSE 80

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]