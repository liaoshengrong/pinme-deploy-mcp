# 安装指南

## 前置要求

1. **Node.js 18+** - [下载 Node.js](https://nodejs.org/)
2. **Pinme CLI** - 必须安装

```bash
npm install -g pinme
```

## 安装 MCP 服务器

### 方法一：npm 全局安装（推荐）

```bash
npm install -g pinme-deploy-mcp
```

### 方法二：使用 npx（无需安装）

无需安装，直接使用 npx 运行。

## 配置 Cursor

### 如果使用全局安装

在 Cursor 的 MCP 配置文件中添加：

```json
{
  "mcpServers": {
    "pinme-deploy": {
      "command": "pinme-deploy-mcp"
    }
  }
}
```

### 如果使用 npx

```json
{
  "mcpServers": {
    "pinme-deploy": {
      "command": "npx",
      "args": ["-y", "pinme-deploy-mcp"]
    }
  }
}
```

### 如果使用本地开发版本

```json
{
  "mcpServers": {
    "pinme-deploy": {
      "command": "node",
      "args": ["/absolute/path/to/pinme-deploy/dist/index.js"]
    }
  }
}
```

## 验证安装

1. 重启 Cursor
2. 在 Cursor 中尝试使用：
   - "帮我部署这个项目到 Pinme"
   - "列出所有已部署的项目"

如果看到工具可用，说明安装成功！

## 故障排除

### 找不到 pinme-deploy-mcp 命令

确保已全局安装：
```bash
npm install -g pinme-deploy-mcp
```

检查安装位置：
```bash
npm list -g pinme-deploy-mcp
```

### 找不到 pinme 命令

确保已安装 Pinme CLI：
```bash
npm install -g pinme
```

### MCP 服务器无法启动

检查 Node.js 版本：
```bash
node --version  # 应该是 18.0.0 或更高
```

检查构建文件是否存在：
```bash
ls dist/index.js
```

如果不存在，需要先构建：
```bash
npm run build
```

