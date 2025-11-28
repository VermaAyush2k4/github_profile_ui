# Build stage
FROM node:18-bullseye-slim AS build
WORKDIR /app
COPY package.json package-lock.json* ./
 # Ensure we have ca-certificates available and use an idempotent install step
RUN apt-get update -y && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/* || true
RUN npm ci --prefer-offline --no-audit --progress=false --silent || npm install --no-audit --silent
COPY . .
# Accept build-time env var for username (token support removed)
ARG REACT_APP_GITHUB_USERNAME
ENV REACT_APP_GITHUB_USERNAME=$REACT_APP_GITHUB_USERNAME
RUN npm run build

# Serve stage
FROM nginx:alpine
# Replace default nginx conf with a simple SPA-friendly configuration
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
# Copy built assets
COPY --from=build /app/build /usr/share/nginx/html
# Expose port 80 (nginx default) and run Nginx in foreground
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
