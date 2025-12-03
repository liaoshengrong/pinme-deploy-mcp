# 发布指南

## 发布前准备

### 1. 确保代码已构建

```bash
npm run build
```

### 2. 检查 package.json

确保以下字段已正确填写：
- `name`: 包名（必须是唯一的）
- `version`: 版本号
- `description`: 描述
- `author`: 作者信息（可选）
- `repository`: 仓库地址（可选）

### 3. 登录 npm

```bash
npm login
```

输入你的 npm 用户名、密码和邮箱。

### 4. 检查包名是否可用

```bash
npm view pinme-deploy-mcp
```

如果返回 404，说明包名可用。如果已存在，需要修改 `package.json` 中的 `name` 字段。

## 发布步骤

### 方式一：手动发布

```bash
# 1. 更新版本号（可选，也可以手动修改 package.json）
npm version patch  # patch: 1.0.0 -> 1.0.1
# 或
npm version minor  # minor: 1.0.0 -> 1.1.0
# 或
npm version major  # major: 1.0.0 -> 2.0.0

# 2. 构建项目（prepublishOnly 会自动执行）
npm publish

# 3. 推送到 Git（如果使用 Git）
git push && git push --tags
```

### 方式二：使用 npm publish

```bash
# 直接发布（会自动运行 prepublishOnly 脚本）
npm publish
```

## 发布后验证

### 1. 检查包是否已发布

```bash
npm view pinme-deploy-mcp
```

### 2. 测试安装

```bash
npm install -g pinme-deploy-mcp
pinme-deploy-mcp --help  # 如果配置了 help 命令
```

### 3. 检查文件是否正确包含

```bash
npm pack --dry-run
```

这会显示将要发布的文件列表。

## 更新版本

发布新版本时：

```bash
# 更新版本号
npm version patch  # 或 minor, major

# 发布
npm publish
```

## 撤销发布（24小时内）

如果发布有问题，可以在 24 小时内撤销：

```bash
npm unpublish pinme-deploy-mcp@1.0.0
```

**注意**：撤销后 24 小时内不能发布相同版本号。

## 发布到其他注册表

### 发布到 GitHub Packages

在 `package.json` 中添加：

```json
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

### 发布到私有注册表

```bash
npm publish --registry=https://your-registry.com
```

## 常见问题

### 发布失败：包名已存在

修改 `package.json` 中的 `name` 字段，使用更独特的名称，例如：
- `@your-username/pinme-deploy-mcp`
- `pinme-deploy-mcp-yourname`

### 发布失败：需要认证

确保已登录：
```bash
npm login
```

### 发布失败：权限不足

确保你是包的拥有者，或者使用组织作用域的包名：
```json
{
  "name": "@your-org/pinme-deploy-mcp"
}
```

