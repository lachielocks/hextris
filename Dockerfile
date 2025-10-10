# Latest stable nginx version
FROM nginx:1.24.0-alpine

# Copy the game folder "ignore unnecessary files with .dockerignore"
COPY . /usr/share/nginx/html

EXPOSE 80
# CMD to run on container start not needed
# when using the official nginx image
# CMD ["nginx", "-g", "daemon off;"]

