# Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json tsconfig.json services.ts ./
COPY src ./src
RUN npm install --production=false && npm run build

# Runner
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/index.js"]
