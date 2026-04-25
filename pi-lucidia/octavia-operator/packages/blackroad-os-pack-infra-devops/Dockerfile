FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile || npm install

COPY . .

# Build
RUN pnpm build || npm run build || echo "No build step"

ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

EXPOSE 8080

CMD ["sh", "-c", "pnpm start || npm start || node dist/server.js || node index.js"]
