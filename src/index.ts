#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { stat, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

const execAsync = promisify(exec);

interface DeployOptions {
  path?: string; // 文件或目录路径
}

// 常见的构建输出目录
const COMMON_BUILD_DIRS = [
  "build",      // React (Create React App)
  "dist",       // Vue, Vite, Webpack
  "out",        // Next.js (某些配置)
  ".next",      // Next.js
  "public",     // 某些静态站点
  "output",     // 某些项目
  ".output",    // Nuxt.js
  "site",       // 某些静态站点生成器
];

class PinmeDeployServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "pinme-deploy",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupHandlers() {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "deploy_to_pinme",
            description:
              "将静态网站、HTML 文件或前端项目上传到 Pinme (IPFS)。支持单个文件或整个目录。如果未指定路径，会自动检测常见的构建输出目录（build、dist、out、.next 等）。",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description:
                    "要上传的文件或目录路径。如果未指定，会自动检测当前目录下的常见构建输出目录（build、dist、out、.next 等）。",
                },
              },
            },
          },
          {
            name: "check_pinme_status",
            description: "检查 Pinme 部署状态。可以通过 CID 或 ENS URL 检查。",
            inputSchema: {
              type: "object",
              properties: {
                cid: {
                  type: "string",
                  description: "要检查的 IPFS CID（内容标识符）。",
                },
                ensUrl: {
                  type: "string",
                  description: "要检查的 ENS URL（例如：https://xxxxx.pinit.eth.limo）。",
                },
              },
            },
          },
          {
            name: "list_deployments",
            description: "列出所有已部署的项目。",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
        ],
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "deploy_to_pinme":
            return await this.handleDeploy(args as DeployOptions);
          case "check_pinme_status":
            return await this.handleCheckStatus(args as { cid?: string });
          case "list_deployments":
            return await this.handleListDeployments();
          default:
            throw new Error(`未知的工具: ${name}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `错误: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * 自动检测常见的构建输出目录
   */
  private async detectBuildDirectory(cwd: string): Promise<string | null> {
    const foundDirs: string[] = [];
    
    for (const dir of COMMON_BUILD_DIRS) {
      const dirPath = resolve(cwd, dir);
      if (existsSync(dirPath)) {
        try {
          const stats = await stat(dirPath);
          if (stats.isDirectory()) {
            const files = await readdir(dirPath);
            if (files.length > 0) {
              foundDirs.push(dir);
            }
          }
        } catch (e) {
          // 忽略错误，继续检测
        }
      }
    }
    
    if (foundDirs.length === 0) {
      return null;
    }
    
    // 优先返回 build，然后是 dist
    if (foundDirs.includes("build")) {
      return resolve(cwd, "build");
    }
    if (foundDirs.includes("dist")) {
      return resolve(cwd, "dist");
    }
    
    // 返回第一个找到的目录
    return resolve(cwd, foundDirs[0]);
  }

  private async handleDeploy(options: DeployOptions) {
    let deployPath: string;
    let autoDetected = false;
    
    if (options.path) {
      // 用户指定了路径
      deployPath = resolve(options.path);
    } else {
      // 未指定路径，尝试自动检测构建目录
      const cwd = process.cwd();
      const detectedDir = await this.detectBuildDirectory(cwd);
      
      if (detectedDir) {
        deployPath = detectedDir;
        autoDetected = true;
      } else {
        // 没有找到构建目录，使用当前目录
        deployPath = cwd;
      }
    }

    // 验证路径是否存在
    if (!existsSync(deployPath)) {
      throw new Error(`路径不存在: ${deployPath}`);
    }

    // 检查是文件还是目录
    const stats = await stat(deployPath);
    const isFile = stats.isFile();
    const isDir = stats.isDirectory();

    if (!isFile && !isDir) {
      throw new Error(`路径既不是文件也不是目录: ${deployPath}`);
    }

    if (isDir) {
      const files = await readdir(deployPath);
      if (files.length === 0) {
        throw new Error(`目录为空: ${deployPath}`);
      }
    }

    // 构建上传命令：pinme upload <path>
    const command = `pinme upload "${deployPath}"`;

    try {
      // 执行上传命令
      const { stdout, stderr } = await execAsync(command, {
        cwd: isDir ? deployPath : process.cwd(),
      });

      // 解析输出
      const output = stdout || stderr;
      
      // 提取 URL（格式：https://pinme.eth.limo/#/preview/...）
      const previewUrlMatch = output.match(/https:\/\/pinme\.eth\.limo\/#\/preview\/[^\s]+/);
      
      // 提取 IPFS CID（格式：bafkreiekm6o7tb4p53jtw7nwm42qlklqhdn37lj5jqoj4bdvjtfsgnr734）
      const cidMatch = output.match(/baf[a-zA-Z0-9]{56}/) || output.match(/Qm[a-zA-Z0-9]{44}/);

      let resultText = `✅ 上传成功！\n\n`;
      if (autoDetected) {
        resultText += `🔍 自动检测到构建目录\n`;
      }
      resultText += `📁 ${isFile ? "文件" : "目录"}: ${deployPath}\n`;

      if (previewUrlMatch) {
        resultText += `🔗 预览地址: ${previewUrlMatch[0]}\n`;
      }

      if (cidMatch) {
        resultText += `🆔 IPFS CID: ${cidMatch[0]}\n`;
        // 从 pinme list 获取 ENS URL
        try {
          const listResult = await execAsync("pinme list");
          const listOutput = listResult.stdout;
          // 查找匹配的 CID 对应的 ENS URL
          const cidIndex = listOutput.indexOf(cidMatch[0]);
          if (cidIndex !== -1) {
            const ensUrlMatch = listOutput.substring(cidIndex).match(/https:\/\/[a-f0-9]+\.pinit\.eth\.limo/);
            if (ensUrlMatch) {
              resultText += `🌐 ENS 地址: ${ensUrlMatch[0]}\n`;
            }
          }
        } catch (e) {
          // 如果获取列表失败，忽略
        }
      }

      resultText += `\n📋 完整输出:\n${output}`;

      return {
        content: [
          {
            type: "text",
            text: resultText,
          },
        ],
      };
    } catch (error: any) {
      // 如果命令执行失败，提供替代方案
      if (error.code === "ENOENT" || error.message.includes("pinme")) {
        return {
          content: [
            {
              type: "text",
              text: `⚠️ 未找到 Pinme CLI 工具。\n\n` +
                `请先安装 Pinme CLI:\n` +
                `  npm install -g pinme\n\n` +
                `安装完成后，您可以:\n` +
                `1. 使用此工具上传文件或目录\n` +
                `2. 或直接使用命令行: pinme upload <路径>\n\n` +
                `上传路径: ${deployPath}\n`,
            },
          ],
        };
      }
      throw error;
    }
  }

  private async handleCheckStatus(args: { cid?: string; ensUrl?: string }) {
    const { cid, ensUrl } = args;

    if (!cid && !ensUrl) {
      return {
        content: [
          {
            type: "text",
            text: "请提供 CID 或 ENS URL 以检查部署状态。",
          },
        ],
      };
    }

    try {
      let checkUrl = "";
      let statusText = "";

      if (ensUrl) {
        checkUrl = ensUrl;
        statusText = `🌐 ENS URL: ${ensUrl}\n`;
      } else if (cid) {
        checkUrl = `https://ipfs.io/ipfs/${cid}`;
        statusText = `🆔 IPFS CID: ${cid}\n`;
      }

      // 检查 URL 是否可访问
      const response = await fetch(checkUrl, { method: "HEAD" });
      const status = response.ok ? "✅ 可访问" : "❌ 不可访问";
      
      let resultText = `部署状态检查\n\n${statusText}`;
      resultText += `📊 状态: ${status}\n`;
      
      if (cid) {
        resultText += `🔗 IPFS 网关: https://ipfs.io/ipfs/${cid}\n`;
      }
      
      if (ensUrl) {
        resultText += `🔗 ENS 地址: ${ensUrl}\n`;
      }

      return {
        content: [
          {
            type: "text",
            text: resultText,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `检查状态时出错: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async handleListDeployments() {
    try {
      // 使用 pinme list 命令获取部署列表
      const { stdout, stderr } = await execAsync("pinme list");
      const output = stdout || stderr;

      // 解析输出，提取部署信息
      const deployments: Array<{
        name: string;
        path: string;
        cid: string;
        ensUrl: string;
        size: string;
        files: string;
        type: string;
        date: string;
      }> = [];

      // 解析格式：
      // 1. b.html
      //    Path: /Users/hua-cloud/test/b.html
      //    IPFS CID: bafkreiekm6o7tb4p53jtw7nwm42qlklqhdn37lj5jqoj4bdvjtfsgnr734
      //    ENS URL: https://f34fc1b3.pinit.eth.limo
      //    Size: 227 bytes
      //    Files: 1
      //    Type: File
      //    Date: 2025/12/3 15:45:31

      const sections = output.split(/-{70,}/);
      for (const section of sections) {
        if (!section.trim()) continue;

        const nameMatch = section.match(/^\s*\d+\.\s*(.+?)\s*$/m);
        const pathMatch = section.match(/Path:\s*(.+)/);
        const cidMatch = section.match(/IPFS CID:\s*(.+)/);
        const ensUrlMatch = section.match(/ENS URL:\s*(.+)/);
        const sizeMatch = section.match(/Size:\s*(.+)/);
        const filesMatch = section.match(/Files:\s*(.+)/);
        const typeMatch = section.match(/Type:\s*(.+)/);
        const dateMatch = section.match(/Date:\s*(.+)/);

        if (nameMatch || cidMatch) {
          deployments.push({
            name: nameMatch?.[1]?.trim() || "未知",
            path: pathMatch?.[1]?.trim() || "",
            cid: cidMatch?.[1]?.trim() || "",
            ensUrl: ensUrlMatch?.[1]?.trim() || "",
            size: sizeMatch?.[1]?.trim() || "",
            files: filesMatch?.[1]?.trim() || "",
            type: typeMatch?.[1]?.trim() || "",
            date: dateMatch?.[1]?.trim() || "",
          });
        }
      }

      // 提取总计信息
      const totalUploadsMatch = output.match(/Total Uploads:\s*(\d+)/);
      const totalFilesMatch = output.match(/Total Files:\s*(\d+)/);
      const totalSizeMatch = output.match(/Total Size:\s*(.+)/);

      let resultText = `📋 部署列表\n\n`;

      if (deployments.length > 0) {
        deployments.forEach((deployment, index) => {
          resultText += `${index + 1}. ${deployment.name}\n`;
          if (deployment.path) resultText += `   路径: ${deployment.path}\n`;
          if (deployment.cid) resultText += `   CID: ${deployment.cid}\n`;
          if (deployment.ensUrl) resultText += `   ENS: ${deployment.ensUrl}\n`;
          if (deployment.size) resultText += `   大小: ${deployment.size}\n`;
          if (deployment.files) resultText += `   文件数: ${deployment.files}\n`;
          if (deployment.type) resultText += `   类型: ${deployment.type}\n`;
          if (deployment.date) resultText += `   日期: ${deployment.date}\n`;
          resultText += `\n`;
        });
      }

      if (totalUploadsMatch) {
        resultText += `总计:\n`;
        resultText += `  上传数: ${totalUploadsMatch[1]}\n`;
        if (totalFilesMatch) resultText += `  文件数: ${totalFilesMatch[1]}\n`;
        if (totalSizeMatch) resultText += `  总大小: ${totalSizeMatch[1]}\n`;
      }

      if (deployments.length === 0) {
        resultText += `暂无部署记录。\n`;
      }

      return {
        content: [
          {
            type: "text",
            text: resultText,
          },
        ],
      };
    } catch (error: any) {
      if (error.code === "ENOENT" || error.message.includes("pinme")) {
        return {
          content: [
            {
              type: "text",
              text: `⚠️ 未找到 Pinme CLI 工具。\n\n` +
                `请先安装 Pinme CLI:\n` +
                `  npm install -g pinme\n\n` +
                `然后使用命令: pinme list\n`,
            },
          ],
        };
      }
      return {
        content: [
          {
            type: "text",
            text: `获取部署列表时出错: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  private setupErrorHandling() {
    this.server.onerror = (error: Error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Pinme Deploy MCP 服务器已启动");
  }
}

// 启动服务器
const server = new PinmeDeployServer();
server.run().catch(console.error);

