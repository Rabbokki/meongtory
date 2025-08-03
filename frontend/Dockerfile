
# Install dependencies only when needed
FROM --platform=linux/amd64 public.ecr.aws/docker/library/node:18-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./ # Copy pnpm-lock.yaml or package-lock.json
RUN \
  if [ -f "pnpm-lock.yaml" ]; then \
    corepack enable pnpm && pnpm fetch --prod; \
  else \
    npm install; \
  fi

# Rebuild the source code only when needed
FROM --platform=linux/amd64 public.ecr.aws/docker/library/node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN \
  if [ -f "pnpm-lock.yaml" ]; then \
    corepack enable pnpm && pnpm build; \
  else \
    npm run build; \
  fi

# Production image, copy all the files and run next
FROM --platform=linux/amd64 public.ecr.aws/docker/library/node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Automatically leverage output traces to optimize image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./ 
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000

CMD ["npm", "start"]