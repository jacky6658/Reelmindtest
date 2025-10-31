# 使用 Node.js 22 作為基礎映像
FROM node:22-alpine AS base

# 安裝 pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 複製 patches 目錄 (wouter 補丁)
COPY patches ./patches

# 安裝依賴
RUN pnpm install --frozen-lockfile

# 複製所有原始碼
COPY . .

# 建置應用
RUN pnpm build

# 暴露端口
EXPOSE 3000

# 設定環境變數
ENV NODE_ENV=production

# 啟動應用
CMD ["pnpm", "start"]
