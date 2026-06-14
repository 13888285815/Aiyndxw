#!/bin/bash
# ============================================
# 意念AI - 本地开发启动脚本
# ============================================

set -e

echo "🚀 正在启动意念AI项目..."

# 检查是否存在 .env 文件
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 文件，正在从示例文件复制..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件，请根据需要修改配置"
fi

# 启动 Docker 服务
echo "📦 启动 Docker Compose..."
docker-compose up -d

echo ""
echo "✅ 意念AI启动完成！"
echo ""
echo "📱 访问地址："
echo "   - 前端: http://localhost:3000"
echo "   - 后端: http://localhost:18080"
echo ""
echo "🔐 默认管理员账号:"
echo "   - 用户名: admin"
echo "   - 密码: admin123"
echo ""
echo "💡 提示:"
echo "   1. 首次启动可能需要几分钟下载依赖和构建镜像"
echo "   2. 确保 Docker 已正确安装并运行"
echo "   3. 如需使用 Hermes 模型，请安装 Ollama 并执行: ollama pull hermes3"
