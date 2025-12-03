# 快速开始

## 安装步骤

1. **安装依赖**
   ```bash
   npm install
   ```

2. **构建项目**
   ```bash
   npm run build
   ```

3. **安装 Pinme CLI（必需）**
   ```bash
   npm install -g pinme
   ```

## 在 Cursor 中配置 MCP 服务器

1. 打开 Cursor 设置
2. 找到 MCP 服务器配置（通常在设置文件中）
3. 添加以下配置：

```json
{
  "mcpServers": {
    "pinme-deploy": {
      "command": "node",
      "args": ["/Users/hua-cloud/Desktop/lianx/pinme-deploy/dist/index.js"]
    }
  }
}
```

**注意**: 请将路径替换为您的实际项目路径。

## 使用方法

配置完成后，您可以在 Cursor 中使用以下命令：

- **上传文件/目录**: "帮我把这个文件上传到 Pinme" 或 "帮我把这个目录上传到 Pinme"
- **检查状态**: "检查这个 CID 的状态" 或 "检查这个 ENS URL 的状态"
- **列出上传历史**: "列出所有已上传的项目"

## 测试

运行服务器进行测试：

```bash
npm start
```

如果看到 "Pinme Deploy MCP 服务器已启动"，说明服务器运行正常。

