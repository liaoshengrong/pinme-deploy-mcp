#!/bin/bash

# Pinme Deploy MCP 安装脚本
# 从 GitHub 安装

set -e

echo "🚀 安装 Pinme Deploy MCP 服务器..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未找到 Node.js，请先安装 Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 版本过低，需要 18.0.0 或更高版本"
    exit 1
fi

# 检查 Pinme CLI
if ! command -v pinme &> /dev/null; then
    echo "📦 安装 Pinme CLI..."
    npm install -g pinme
fi

# 临时目录
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

echo "📥 从 GitHub 下载..."
git clone https://github.com/liaoshengrong/pinme-deploy-mcp.git
cd pinme-deploy-mcp

echo "📦 安装依赖并构建..."
npm install
npm run build

echo "🔗 创建全局链接..."
npm link

# 清理
cd /
rm -rf "$TEMP_DIR"

echo ""
echo "✅ 安装完成！"
echo ""
echo "📝 接下来请在 Cursor 配置文件中添加："
echo '{'
echo '  "mcpServers": {'
echo '    "pinme-deploy": {'
echo '      "command": "pinme-deploy-mcp"'
echo '    }'
echo '  }'
echo '}'
echo ""
echo "或者使用 npx 方式（无需全局安装）："
echo '{'
echo '  "mcpServers": {'
echo '    "pinme-deploy": {'
echo '      "command": "npx",'
echo '      "args": ["-y", "github:liaoshengrong/pinme-deploy-mcp"]'
echo '    }'
echo '  }'
echo '}'

