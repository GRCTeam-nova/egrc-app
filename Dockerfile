# build environment
FROM node:18-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

# Only 2 build-time variables (come from `.env` / CI secrets)
ARG EGRC_API_URL_URL
ARG EGRC_COLLABORA_URL

# Application version (usually provided by CI reading `package.json`)
ARG APP_VERSION

# CRA (react-scripts) only injects env vars prefixed with REACT_APP_ at build time.
ENV REACT_APP_API_URL=$EGRC_API_URL_URL
ENV REACT_APP_EGRC_COLLABORA_URL=$EGRC_COLLABORA_URL
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
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]