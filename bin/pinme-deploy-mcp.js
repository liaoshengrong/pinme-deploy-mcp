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

// 如果 dist/index.js 不存在，先构建
if (!existsSync(distFile)) {
  try {
    // 先检查是否有 node_modules，如果没有先安装依赖
    if (!existsSync(join(projectRoot, 'node_modules'))) {
      console.error('安装依赖中...');
      execSync('npm install', { 
        cwd: projectRoot,
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
      });
    }
    console.error('构建中...');
    execSync('npm run build', { 
      cwd: projectRoot,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
  } catch (error) {
    console.error('构建失败:', error.message);
    // 即使构建失败，也尝试运行（可能已经构建好了）
    if (!existsSync(distFile)) {
      console.error('无法找到构建文件，退出');
      process.exit(1);
    }
  }
}

// 直接执行 dist/index.js
// 使用动态导入并立即执行
import('file://' + distFile).catch((error) => {
  console.error('无法启动 MCP 服务器:', error);
  process.exit(1);
});

