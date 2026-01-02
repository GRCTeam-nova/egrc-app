# build environment
FROM node:18-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

# Application version (usually provided by CI reading `package.json`)
ARG APP_VERSION

# CRA (react-scripts) injects env vars prefixed with REACT_APP_ at build time.
# We keep only the version as build-time info. Runtime endpoints are injected via `public/env.js`.
ENV REACT_APP_VERSION=$APP_VERSION

COPY package.json ./
COPY package-lock.json ./
RUN npm ci --silent
COPY . ./
RUN npm run build

# production environment
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]