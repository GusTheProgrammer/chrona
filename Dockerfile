FROM ghaithchaal/node-local-dev:latest as base
WORKDIR /app
COPY package*.json ./
EXPOSE 3000

FROM base as builder
WORKDIR /app
COPY . .
RUN npm run build


FROM base as production
WORKDIR /app

ENV NODE_ENV=production
RUN npm ci

RUN addgroup --gid 1002 nodejs
# Create a user 'nextjs' with UID 1001 and add to 'nodejs' group
RUN adduser --disabled-password --gecos "" --uid 1002 --gid 1002 nextjs
USER nextjs


COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

COPY --chown=nextjs:nodejs prisma_migrate.sh /app/prisma_migrate.sh
RUN chmod +x /app/prisma_migrate.sh

# Set the entrypoint script
ENTRYPOINT ["/app/prisma_migrate.sh"]

# Command to run after the entrypoint script
CMD ["npm", "start"]

# FROM base as dev
# ENV NODE_ENV=development
# RUN npm install 
# COPY . .
# CMD npm run dev