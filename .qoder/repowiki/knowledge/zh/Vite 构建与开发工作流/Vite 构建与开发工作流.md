---
kind: build_system
name: Vite 构建与开发工作流
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - index.html
    - src/main.js
    - pnpm-lock.yaml
---

本项目采用 Vite 作为前端构建工具，配合 OpenLayers 进行地图应用开发。构建系统相对简单直接，主要依赖 npm/pnpm 包管理器。

**构建系统与工具链：**
- 使用 Vite 8.1.1 作为构建工具，提供开发服务器、热重载和构建功能
- 通过 pnpm 管理依赖（存在 pnpm-lock.yaml 锁定文件）
- 项目类型为 ES Module（`"type": "module"`）

**核心构建脚本：**
- `dev`: 启动 Vite 开发服务器
- `build`: 执行生产环境构建（`vite build`）
- `preview`: 预览构建产物

**入口文件结构：**
- HTML 入口：`index.html`，通过 `<script type="module">` 引入 `/src/main.js`
- 主应用入口：`src/main.js` 作为 Vite 应用的唯一入口点
- 样式文件：`src/style.css` 全局样式

**构建约定：**
- 静态资源放在 `public/` 目录，可直接通过根路径访问
- 图标资源包括 `favicon.svg` 和 `icons.svg`
- 截图文件存放在 `.screenshots/` 目录用于文档展示
- 学习记录保存在 `notes/` 目录

**约束与限制：**
- 项目标记为私有（`"private": true`），不发布到 npm
- 版本号为 `0.0.0`，表示开发阶段
- 无 Dockerfile、CI/CD 配置或 Makefile 等高级构建自动化
- 无 TypeScript 配置，纯 JavaScript 开发