# 故障排除指南

## 问题：npx ENOTEMPTY 错误

如果遇到 `ENOTEMPTY: directory not empty` 错误，这是 npx 缓存问题。

### 解决方案 1：清理 npx 缓存

```bash
# 清理 npx 缓存
rm -rf ~/.npm/_npx
```

然后重新在 Cursor 中添加 MCP 服务器。

### 解决方案 2：使用全局安装（推荐）

如果 npx 方式一直有问题，建议使用全局安装：

```bash
# 全局安装
npm install -g github:liaoshengrong/pinme-deploy-mcp
```

然后在 Cursor 配置中使用：

```json
{
  "mcpServers": {
    "pinme-deploy": {
      "command": "pinme-deploy-mcp"
    }
  }
}
```

### 解决方案 3：使用本地路径

如果上述方法都不行，可以克隆到本地：

```bash
# 克隆仓库
git clone https://github.com/liaoshengrong/pinme-deploy-mcp.git
cd pinme-deploy-mcp

# 安装依赖并构建
npm install
npm run build

# 在 Cursor 中使用绝对路径
```

然后在 Cursor 配置中：

```json
{
  "mcpServers": {
    "pinme-deploy": {
      "command": "node",
      "args": ["/absolute/path/to/pinme-deploy-mcp/dist/index.js"]
    }
  }
}
```

## 其他常见问题

### 问题：找不到 pinme 命令

**解决方案：**
```bash
npm install -g pinme
```

### 问题：Node.js 版本过低

**解决方案：**
确保 Node.js 版本 >= 18.0.0
```bash
node --version  # 检查版本
```

### 问题：构建失败

**解决方案：**
确保已安装所有依赖：
```bash
npm install
npm run build
```

