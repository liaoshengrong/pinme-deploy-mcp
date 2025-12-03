# Pinme Deploy MCP Server

一个 Model Context Protocol (MCP) 服务器，集成 Pinme 功能，帮助用户一键将静态网站部署到 IPFS 网络。

**GitHub**: https://github.com/liaoshengrong/pinme-deploy-mcp

## 功能特性

- 🚀 **一键上传**: 快速将静态网站、HTML 文件或前端项目上传到 Pinme (IPFS)
- 📁 **灵活支持**: 支持单个文件或整个目录上传
- 🔍 **智能检测**: 自动检测常见的构建输出目录（build、dist、out、.next 等），无需手动指定路径
- 🌐 **状态检查**: 通过 CID 或 ENS URL 检查已部署项目的状态和可访问性
- 📋 **部署列表**: 查看所有已上传的项目历史记录，包括 CID、ENS URL 等信息

## 安装

### 方式一：从 GitHub 使用 npx（推荐，最简单）

无需安装，直接在 Cursor 配置文件中使用：

```json
{
  "mcpServers": {
    "pinme-deploy": {
      "command": "npx",
      "args": ["-y", "github:liaoshengrong/pinme-deploy-mcp"]
    }
  }
}
```

**如果遇到 npx 缓存错误**，运行以下命令清理缓存后重试：

```bash
rm -rf ~/.npm/_npx
```

### 方式二：从 GitHub 全局安装

```bash
npm install -g github:liaoshengrong/pinme-deploy-mcp
```

然后在 Cursor 配置文件中添加：

```json
{
  "mcpServers": {
    "pinme-deploy": {
      "command": "pinme-deploy-mcp"
    }
  }
}
```

### 方式三：使用安装脚本

```bash
curl -fsSL https://raw.githubusercontent.com/liaoshengrong/pinme-deploy-mcp/main/install.sh | bash
```

或下载后执行：

```bash
chmod +x install.sh
./install.sh
```

### 方式四：本地开发安装

```bash
git clone https://github.com/liaoshengrong/pinme-deploy-mcp.git
cd pinme-deploy-mcp
npm install
npm run build
```

然后在 Cursor 配置中使用绝对路径：

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

## 配置

### 环境变量

可选的环境变量：

- `PINME_API_KEY`: Pinme API 密钥（如果使用 API 部署）

### Pinme CLI 安装

**必须**先安装 Pinme CLI：

```bash
npm install -g pinme
```

安装完成后，您就可以使用此 MCP 服务器来上传文件了。

## 使用方法

### 作为 MCP 服务器运行

```bash
npm start
```

### 在 Cursor 或其他 MCP 客户端中使用

1. 配置 MCP 服务器路径
2. 使用以下工具：

#### `deploy_to_pinme`

上传文件或目录到 Pinme。

**参数：**
- `path` (可选): 要上传的文件或目录路径。如果未指定，会自动检测当前目录下的常见构建输出目录（build、dist、out、.next 等）

**自动检测的目录：**
- `build` - React (Create React App)
- `dist` - Vue, Vite, Webpack
- `out` - Next.js (某些配置)
- `.next` - Next.js
- `public` - 某些静态站点
- `output` - 某些项目
- `.output` - Nuxt.js
- `site` - 某些静态站点生成器

**示例：**

自动检测（推荐，无需指定路径）：
```json
{}
```

或指定目录：
```json
{
  "path": "./build"
}
```

或上传单个文件：
```json
{
  "path": "./index.html"
}
```

**返回信息：**
- 预览地址（`https://pinme.eth.limo/#/preview/...`）
- IPFS CID
- ENS 地址（`https://xxxxx.pinit.eth.limo`）

#### `check_pinme_status`

检查已部署项目的状态。

**参数：**
- `cid` (可选): IPFS CID（内容标识符）
- `ensUrl` (可选): ENS URL（例如：`https://xxxxx.pinit.eth.limo`）

**示例：**
```json
{
  "cid": "bafkreiekm6o7tb4p53jtw7nwm42qlklqhdn37lj5jqoj4bdvjtfsgnr734"
}
```

或使用 ENS URL：
```json
{
  "ensUrl": "https://f34fc1b3.pinit.eth.limo"
}
```

#### `list_deployments`

列出所有已上传的项目历史记录。

**返回信息：**
- 文件名/项目名
- 本地路径
- IPFS CID
- ENS URL（可访问的线上地址）
- 文件大小
- 文件数量
- 类型（文件/目录）
- 上传日期

## 开发

### 开发模式

```bash
npm run dev
```

### 监听模式

```bash
npm run watch
```

## 注意事项

1. **Pinme CLI**: 必须安装 Pinme CLI（`npm install -g pinme`），否则工具无法工作
2. **文件/目录**: 支持上传单个文件（如 HTML）或整个目录（如构建后的静态网站）
3. **ENS URL**: 上传成功后，会生成一个 ENS URL（格式：`https://xxxxx.pinit.eth.limo`），这是可访问的线上地址
4. **预览地址**: 上传后会返回一个预览地址（`https://pinme.eth.limo/#/preview/...`），用于在 Pinme 平台预览

## 技术栈

- TypeScript
- Model Context Protocol SDK
- Node.js

## 许可证

MIT

## 使用示例

### 自动检测并上传构建目录（推荐）
```bash
# 在项目根目录下，无需指定路径，自动检测 build 或 dist 目录
# 在 Cursor 中调用 MCP 工具
deploy_to_pinme({})
```

### 上传指定的构建目录
```bash
# 在 Cursor 中调用 MCP 工具
deploy_to_pinme({ path: "./build" })
# 或
deploy_to_pinme({ path: "./dist" })
```

### 上传单个 HTML 文件
```bash
# 在 Cursor 中调用 MCP 工具
deploy_to_pinme({ path: "./index.html" })
```

### 查看上传历史
```bash
# 在 Cursor 中调用 MCP 工具
list_deployments()
```

### React 项目部署流程
```bash
# 1. 构建项目
npm run build

# 2. 在 Cursor 中调用（自动检测 build 目录）
deploy_to_pinme({})
```

## 相关链接

- [Pinme 官网](https://pinme.io)
- [MCP 文档](https://modelcontextprotocol.io)
- [IPFS 文档](https://docs.ipfs.io)

