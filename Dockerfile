FROM node:20-slim
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm run install-all
COPY . .
RUN npm run build
ENV NODE_ENV=production
EXPOSE 3001
CMD ["npm", "start"]
