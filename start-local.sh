#!/bin/bash

# WorkBuddy AI 一键启动脚本 (本地开发版)
# 适合中小学生与初学者使用

echo "🚀 正在检查环境..."

# 1. 检查 .env
if [ ! -f .env ]; then
    echo "📝 正在根据模板生成 .env 配置文件..."
    cp .env.example .env
    # 自动替换为本地开发配置
    sed -i '' 's/APP_PROFILE=docker/APP_PROFILE=local/g' .env
    sed -i '' 's/DB_HOST=mysql/DB_HOST=127.0.0.1/g' .env
    sed -i '' 's/MILVUS_HOST=milvus-standalone/MILVUS_HOST=127.0.0.1/g' .env
    sed -i '' 's/SERVER_PORT=8080/SERVER_PORT=18080/g' .env
    echo "✅ .env 已生成。请确认本地 MySQL 已启动，并已创建数据库 workbuddy_ai。"
fi

# 2. 启动后端 (新窗口)
echo "📡 正在尝试启动后端服务 (端口 18080)..."
cd backend && go run main.go &
BACKEND_PID=$!

# 3. 启动前端
echo "🌐 正在尝试启动前端服务 (端口 3000)..."
cd ../frontend && npm run dev

# 退出时杀掉后端进程
trap "kill $BACKEND_PID" EXIT
