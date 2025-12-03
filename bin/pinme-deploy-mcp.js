#!/usr/bin/env node

// 启动包装脚本，确保在运行前构建
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const distFile = resolve(projectRoot, 'dist', 'index.js');

// 如果 dist/index.js 不存在，尝试构建（通常 dist 已经包含在仓库中）
if (!existsSync(distFile)) {
  // 检查是否有 TypeScript 编译器可用
  const hasTsc = existsSync(join(projectRoot, 'node_modules', '.bin', 'tsc')) || 
                 existsSync(join(projectRoot, 'node_modules', 'typescript'));
  
  if (hasTsc) {
    try {
      console.error('构建中...');
      execSync('npm run build', { 
        cwd: projectRoot,
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
      });
    } catch (error) {
      console.error('构建失败:', error.message);
      if (!existsSync(distFile)) {
        console.error('无法找到构建文件，退出');
        process.exit(1);
      }
    }
  } else {
    console.error('错误: 找不到 dist/index.js，且无法构建（缺少 TypeScript 编译器）');
    process.exit(1);
  }
}

// 直接执行 dist/index.js
// 使用动态导入并立即执行
import('file://' + distFile).catch((error) => {
  console.error('无法启动 MCP 服务器:', error);
  process.exit(1);
});

