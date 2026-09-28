---
kind: frontend_style
name: 极简原生 CSS 样式方案
category: frontend_style
scope:
    - '**'
source_files:
    - src/style.css
    - index.html
    - package.json
---

本项目采用最简化的前端样式策略，未引入任何 CSS 框架、预处理器或样式模块化方案。

**使用的系统与工具**
- 纯原生 CSS（`.css` 文件），无 SCSS/Less/Sass
- 无 CSS-in-JS、Tailwind、Bootstrap 等第三方样式库
- Vite 作为构建工具，直接加载 `src/style.css`
- OpenLayers (`ol@10.9.0`) 负责地图渲染与控件样式

**核心文件与组织**
- `src/style.css`：全局样式入口，仅包含 `body` 和 `p` 的 margin 重置
- `index.html`：通过内联 `style="height: 100vh"` 为地图容器 `#app` 设置全屏高度
- `public/favicon.svg` 与 `icons.svg`：静态资源图标

**架构与约定**
- 样式采用单文件全局注入方式，无组件级样式隔离
- 地图 UI（坐标显示、比例尺等）由 OpenLayers 默认控件提供，未自定义覆盖其样式
- 页面布局极度简化：`#app` 容器占满视口，其余内容由地图图层填充

**约束与规范**
- 未发现强制的 CSS 命名约定或 lint 规则（项目中无 `.eslintrc`、`stylelint.config` 等配置文件）
- 样式职责单一：仅做基础重置，视觉表现完全依赖 OpenLayers 默认主题
- 响应式策略：通过 viewport meta 标签启用移动端适配，但无媒体查询或弹性布局代码