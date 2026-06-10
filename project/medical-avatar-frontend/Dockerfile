# ── 构建阶段 ──
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── 运行阶段 ──
FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 模型文件卷挂载点
RUN mkdir -p /usr/share/nginx/html/models

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
