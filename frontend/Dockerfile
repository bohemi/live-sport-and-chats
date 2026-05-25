# building the React app
FROM node:20-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve the app with Nginx
FROM nginx:alpine
# Copy the 'dist' folder from the build stage to Nginx's serving folder
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]