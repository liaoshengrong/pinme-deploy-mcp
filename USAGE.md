# 使用指南

## 快速开始

### 最简单的安装方式（推荐）

在 Cursor 的 MCP 配置文件中添加：

```json
{
  "mcpServers": {
    "pinme-deploy": {
      "command": "npx",
      "args": ["-y", "git+https://github.com/liaoshengrong/pinme-deploy-mcp.git"]
    }
  }
}
```

**优点：**
- ✅ 无需安装任何东西
- ✅ 自动获取最新版本
- ✅ 配置简单

**如果遇到 npx 缓存错误（ENOTEMPTY）**，快速解决：

```bash
rm -rf ~/.npm/_npx
```

然后重新添加 MCP 服务器即可。

### 全局安装方式

```bash
npm install -g github:liaoshengrong/pinme-deploy-mcp
```

然后在 Cursor 配置中：

```json
{
  "mcpServers": {
    "pinme-deploy": {
      "command": "pinme-deploy-mcp"
    }
  }
}
```

## 前置要求

在使用之前，请确保已安装：

1. **Pinme CLI**
   ```bash
   npm install -g pinme
   ```

2. **Node.js 18+**
   ```bash
   node --version  # 应该 >= 18.0.0
   ```

## 使用示例

### 1. 部署 React 项目

```bash
# 1. 构建项目
npm run build

# 2. 在 Cursor 中调用
"帮我部署这个项目到 Pinme"
# 或
"deploy_to_pinme({})"
```

工具会自动检测 `build` 目录并上传。

### 2. 部署 Vue/Vite 项目

```bash
# 1. 构建项目
npm run build

# 2. 在 Cursor 中调用
"帮我部署这个项目到 Pinme"
```

工具会自动检测 `dist` 目录并上传。

### 3. 部署单个 HTML 文件

在 Cursor 中调用：
```
"帮我把 index.html 上传到 Pinme"
# 或
deploy_to_pinme({ path: "./index.html" })
```

### 4. 查看部署历史

在 Cursor 中调用：
```
"列出所有已部署的项目"
# 或
list_deployments()
```

### 5. 检查部署状态

在 Cursor 中调用：
```
"检查这个 CID 的状态"
# 或
check_pinme_status({ cid: "bafkreiekm6o7..." })
```

## 常见问题

### Q: 如何指定特定的构建目录？

A: 在调用时指定路径：
```json
deploy_to_pinme({ path: "./custom-build" })
```

### Q: 如何获取部署后的访问地址？

A: 上传成功后会返回：
- 预览地址：`https://pinme.eth.limo/#/preview/...`
- ENS 地址：`https://xxxxx.pinit.eth.limo`（可访问的线上地址）
- IPFS CID：用于 IPFS 网关访问

### Q: 支持哪些构建工具？

A: 自动检测以下目录：
- `build` - React (Create React App)
- `dist` - Vue, Vite, Webpack
- `out` - Next.js (某些配置)
- `.next` - Next.js
- `public` - 某些静态站点
- `output` - 某些项目
- `.output` - Nuxt.js
- `site` - 某些静态站点生成器

### Q: 如何更新到最新版本？

如果使用 npx 方式，每次使用都会自动获取最新版本。

如果使用全局安装，需要重新安装：
```bash
npm install -g github:liaoshengrong/pinme-deploy-mcp
```

## 获取帮助

- GitHub Issues: https://github.com/liaoshengrong/pinme-deploy-mcp/issues
- 仓库地址: https://github.com/liaoshengrong/pinme-deploy-mcp

