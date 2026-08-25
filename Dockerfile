FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.5.0 --activate
WORKDIR /build
COPY . .
RUN pnpm install --frozen-lockfile && pnpm build

FROM nginx:1.27-alpine
COPY --from=builder /build/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
