# Dockerfile

# Build stage
FROM node:18.16.0-alpine3.17 as base
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY . .
RUN npm install
RUN npm run build

# Tests stage
FROM base as test
CMD ["npm", "test"]

# Server/final stage
FROM base as server
EXPOSE 8000
RUN npm test
CMD [ "npm", "start"]