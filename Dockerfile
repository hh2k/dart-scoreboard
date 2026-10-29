# Use a node base image
FROM node:24.22.2-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application files
COPY . .

# Create .env file with VITE_API_URL set to empty
RUN echo "VITE_API_URL=" > .env

# Build the React app
RUN npm run build

# Use a lightweight, unprivileged web server to serve the static files
FROM nginxinc/nginx-unprivileged:1.31.7-alpine

# Install the latest Alpine security fixes (image runs as non-root user 101)
USER root
RUN apk upgrade --no-cache
USER 101

# Copy the React app build files to the NGINX directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port that NGINX is running on
EXPOSE 8080

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]