FROM node:20 AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# Serwowanie statyczne przez nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY public /usr/share/nginx/html
EXPOSE 80