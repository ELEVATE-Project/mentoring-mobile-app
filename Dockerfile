FROM node:17 AS build

WORKDIR /app

RUN npm install -g @angular/cli@13.2.3

RUN npm install -g @ionic/cli@6.0.0

RUN rm -rf node_modules

COPY package*.json ./

RUN npm install --force

COPY . .

RUN ionic build --prod

FROM node:17 AS final

WORKDIR /usr/src/app

COPY --from=build /app/www ./www

RUN npm install -g serve

EXPOSE 7601


CMD ["serve", "-s", "www", "-p", "7601"]

