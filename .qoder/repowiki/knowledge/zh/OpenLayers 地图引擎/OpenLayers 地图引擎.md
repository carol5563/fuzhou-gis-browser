---
kind: external_dependency
name: OpenLayers 地图引擎
slug: openlayers
category: external_dependency
category_hints:
    - vendor_identity
    - framework_behavior
scope:
    - '**'
source_files:
    - src/main.js
    - package.json
---

### OpenLayers（ol）
- 角色：本项目的核心地图渲染引擎，通过 `ol` npm 包引入（v10.9.0），用于在浏览器中加载瓦片、叠加图层、处理坐标投影。
- 集成点：`src/main.js` 中通过 ES Module 方式 import `Map`、`View`、`TileLayer`、`XYZ`、`MousePosition`、`ScaleLine` 等模块；样式通过 `import 'ol/ol.css'` 引入。
- 使用模式：采用经典的 Map → View → Layer → Source 四层架构，瓦片数据源使用 XYZ 格式（天地图 WMTS），坐标转换使用 `fromLonLat` / `toLonLat` 在 EPSG:4326 与 Web 墨卡托（EPSG:3857）之间互转。
- 注意事项：`target` 参数接受 DOM 元素 id 字符串（不带 `#`），不是 CSS 选择器；瓦片加载失败不会抛 JS 错误，需通过浏览器 Network 面板排查。