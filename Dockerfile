# build environment
FROM node:18-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

# API URLs
ARG REACT_APP_API_COMMAND="http://10.0.72.13:5030"
ARG REACT_APP_API_QUERY="http://10.0.72.13:5020"

ENV REACT_APP_API_COMMAND=$REACT_APP_API_COMMAND
ENV REACT_APP_API_QUERY=$REACT_APP_API_QUERY

# Other environment variables
ENV REACT_APP_VERSION=v3.0.0
ENV GENERATE_SOURCEMAP=false
ENV HTTPS=false
ENV REACT_APP_API_URL="https://mock-data-api-nextjs.vercel.app/"
ENV REACT_APP_BASE_NAME=""
# --- SECRETS - Provide these at build time ---
ENV REACT_APP_GOOGLE_MAPS_API_KEY=""
ENV REACT_APP_MAPBOX_ACCESS_TOKEN=""
ENV REACT_APP_FIREBASE_API_KEY=""
ENV REACT_APP_FIREBASE_AUTH_DOMAIN=""
ENV REACT_APP_FIREBASE_PROJECT_ID=""
ENV REACT_APP_FIREBASE_STORAGE_BUCKET=""
ENV REACT_APP_FIREBASE_MESSAGING_SENDER_ID=""
ENV REACT_APP_FIREBASE_APP_ID=""
ENV REACT_APP_FIREBASE_MEASUREMENT_ID=""
ENV REACT_APP_AWS_POOL_ID=""
ENV REACT_APP_AWS_APP_CLIENT_ID=""
ENV REACT_APP_AUTH0_CLIENT_ID=""
ENV REACT_APP_AUTH0_DOMAIN=""

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