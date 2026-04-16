# Multi-stage build — Angular 21 + Node 22 + pnpm
# Stage 1: Buduje statyczne pliki przez pnpm
# Stage 2: Serwuje przez nginx

FROM node:22-alpine AS build
WORKDIR /app

# Zainstaluj pnpm globalnie
RUN npm install -g pnpm@10.9.0

# Kopiuj najpierw package.json — Docker cache nie rebuilda node_modules jeśli kod się zmienił
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM nginx:alpine
COPY --from=build /app/dist/thera-ui/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80