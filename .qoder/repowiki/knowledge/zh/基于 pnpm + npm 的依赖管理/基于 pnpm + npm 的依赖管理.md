---
kind: dependency_management
name: 基于 pnpm + npm 的依赖管理
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - pnpm-lock.yaml
---

本项目采用 Node.js 生态的标准依赖管理体系，使用 **pnpm** 作为包管理器，配合 **npm** 风格的 `package.json` 声明依赖，并通过 `pnpm-lock.yaml` 锁定精确版本以确保可重复构建。

**使用的系统与工具**
- 包管理器：pnpm（lockfileVersion 9.0）
- 依赖声明：npm 风格的 `package.json`
- 版本锁定：`pnpm-lock.yaml`（包含每个包的完整解析树与 integrity 校验）
- 构建工具链：Vite（开发/构建/预览脚本）

**关键文件与包**
- `package.json`：声明项目元信息、scripts 以及两类依赖
  - `dependencies`：运行时依赖 `ol`（OpenLayers，^10.9.0），用于地图渲染
  - `devDependencies`：开发时依赖 `vite`（^8.1.1），提供 dev server、build、preview 能力
- `pnpm-lock.yaml`：锁定所有直接和间接依赖的确切版本、平台信息及完整性哈希，确保团队一致的安装结果
- `.gitignore`：未将 `node_modules` 纳入版本控制，遵循标准实践

**架构与约定**
- 依赖分类清晰：生产依赖放入 `dependencies`，仅开发期使用的工具放入 `devDependencies`，避免产物膨胀
- 版本策略：使用 `^` 前缀允许小版本/补丁升级，兼顾稳定性与安全性更新；锁文件固定实际安装版本
- 无 vendoring：不将第三方包内联到仓库，通过 pnpm 的符号链接机制在本地 `node_modules` 中管理
- 无私有源配置：未发现 `.npmrc`、`.pnpmrc` 或 `registry` 相关配置，默认使用官方 npm registry
- 无 peerDependencies 强制约束：当前依赖简单，未出现需要额外声明的 peer 依赖

**约束与规范**
- 所有依赖必须通过 `pnpm add` / `pnpm add -D` 安装，以保证 lockfile 同步更新
- 提交代码时需同时提交 `package.json` 与 `pnpm-lock.yaml`，确保他人可复现环境
- 项目标记为 `private: true`，表明该包不发布到公共 registry
- scripts 统一通过 Vite 命令暴露 `dev`、`build`、`preview` 三个入口，保持开发体验一致