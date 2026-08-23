# Multi-stage build for Northwind Frontend Dashboard
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency definitions
COPY apps/frontend/package*.json ./
RUN npm install

# Copy source code and build production bundle
COPY apps/frontend/ ./
RUN npm run build

# Production web server
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
