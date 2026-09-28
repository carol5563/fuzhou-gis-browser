---
kind: logging_system
name: 日志系统：无结构化日志，仅使用浏览器 console
category: logging_system
scope:
    - '**'
source_files:
    - src/main.js
---

该仓库是一个基于 Vite + OpenLayers 的入门级福州地图浏览器项目，未引入任何第三方日志框架或自定义日志模块。项目中唯一的日志输出方式是直接使用浏览器原生 `console.log`，且仅在 `src/main.js` 中点击事件回调里打印坐标信息（第53行）。没有发现以下日志系统常见要素：
- 无 `log/`、`logging/` 等专用目录
- 无日志级别管理（debug/info/warn/error）
- 无结构化日志字段或统一格式
- 无日志输出目标配置（文件、网络、控制台分离）
- 无日志初始化或配置文件

因此，该项目不具备可识别的日志系统架构，属于开发调试阶段的原始输出方式。