# Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build -- --configuration production

# Run stage (nginx)
FROM nginx:1.27-alpine


RUN rm -rf /usr/share/nginx/html/*

# Angular 17 pode gerar /dist/<app>/browser
# Se não existir, cai no /dist/<app>
COPY --from=build /app/dist /tmp/dist

RUN set -eux; \
    APP_DIR="$(ls /tmp/dist | head -n 1)"; \
    if [ -d "/tmp/dist/$APP_DIR/browser" ]; then \
      cp -r "/tmp/dist/$APP_DIR/browser/"* /usr/share/nginx/html/; \
    else \
      cp -r "/tmp/dist/$APP_DIR/"* /usr/share/nginx/html/; \
    fi

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
