#!/usr/bin/env node

// 启动包装脚本，确保在运行前构建
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const distFile = resolve(projectRoot, 'dist', 'index.js');

// 如果 dist/index.js 不存在，先构建
if (!existsSync(distFile)) {
  try {
    console.error('构建中...');
    execSync('npm run build', { 
      cwd: projectRoot,
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('构建失败，尝试安装依赖...');
    try {
      execSync('npm install', { 
        cwd: projectRoot,
        stdio: 'inherit'
      });
      execSync('npm run build', { 
        cwd: projectRoot,
        stdio: 'inherit'
      });
    } catch (installError) {
      console.error('无法构建项目:', installError);
      process.exit(1);
    }
  }
}

// 导入并运行主文件
import(distFile).catch((error) => {
  console.error('无法启动 MCP 服务器:', error);
  process.exit(1);
});

