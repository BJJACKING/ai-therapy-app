#!/bin/bash

# MindAI 快速设置脚本

set -e

echo "🚀 开始设置 MindAI 项目..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未找到 Node.js，请先安装 Node.js 18+"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 未找到 npm"
    exit 1
fi

echo "✅ npm 版本: $(npm --version)"

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "⚠️  未找到 Docker，建议安装 Docker 以简化部署"
else
    echo "✅ Docker 版本: $(docker --version)"
fi

# 检查 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "⚠️  未找到 Docker Compose"
else
    echo "✅ Docker Compose 版本: $(docker-compose --version)"
fi

# 创建环境变量文件
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件，请根据需要编辑配置"
else
    echo "✅ .env 文件已存在"
fi

# 安装后端依赖
echo "📦 安装后端依赖..."
cd backend
npm install
echo "✅ 后端依赖安装完成"
cd ..

# 安装前端依赖
echo "📦 安装前端依赖..."
cd frontend
npm install
echo "✅ 前端依赖安装完成"
cd ..

# 检查数据库
echo "🔍 检查数据库配置..."
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  未配置 DATABASE_URL，请在 .env 文件中设置"
    echo "   示例: postgresql://user:password@localhost:5432/mindai"
else
    echo "✅ 数据库配置已设置"
fi

# 检查 OpenAI API 密钥
echo "🔍 检查 OpenAI API 密钥..."
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  未配置 OPENAI_API_KEY，请在 .env 文件中设置"
    echo "   获取地址: https://platform.openai.com/api-keys"
else
    echo "✅ OpenAI API 密钥已设置"
fi

# 检查 JWT 密钥
echo "🔍 检查 JWT 密钥..."
if [ -z "$JWT_SECRET" ]; then
    echo "⚠️  未配置 JWT_SECRET，请在 .env 文件中设置"
    echo "   建议使用强密码: openssl rand -hex 32"
else
    echo "✅ JWT 密钥已设置"
fi

echo ""
echo "🎉 设置完成！"
echo ""
echo "下一步："
echo "1. 编辑 .env 文件，配置所有必需的环境变量"
echo "2. 启动数据库: docker-compose up -d postgres redis"
echo "3. 运行迁移: cd backend && npm run migrate"
echo "4. 启动开发服务器:"
echo "   - 后端: cd backend && npm run dev"
echo "   - 前端: cd frontend && npm start"
echo ""
echo "或者使用 Docker Compose 一键启动:"
echo "   docker-compose up -d --build"
echo ""
echo "访问 http://localhost:3000 查看应用"
