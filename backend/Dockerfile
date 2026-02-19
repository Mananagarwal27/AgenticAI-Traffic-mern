FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --production

COPY backend/ ./
COPY data/ ./data/
EXPOSE 5000
CMD ["npm", "start"]
