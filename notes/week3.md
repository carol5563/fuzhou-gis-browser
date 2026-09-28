```

---

### Day 1 踩坑（手写 GeoJSON）

**坑 1：coordinates 写成字符串**

- `"coordinates": ["119.3, 26.08"]` → 这是**一个字符串**，不是两个数字
- 正确写法：`"coordinates": [119.3, 26.08]` — 数字数组，经度在前纬度在后
- GeoJSON 解析器接到字符串直接报错，不会报"坐标格式不对"这种友好提示

**坑 2：键名没加引号（严格 JSON 习惯）**

- `geometry: {`、`properties : {`、`name:` — JS 对象字面量能跑，但 GeoJSON 是**数据交换格式**，必须严格 JSON。面试时默写不带引号，考官一眼看出来
- 启示：前端日常写 JS 对象习惯了不带引号，换到 GeoJSON 这种严格格式就容易忘——**换一个语言/格式，就要换一套语法规矩**

**坑 3：只改一处、漏了另一处（第 N 次复现）**

- 第二次修改时，第二个 Feature 的 `"geometry"` 加了引号，但**第一个 Feature 的 `geometry:` 还是没加**
- 同一个文件里两个 Feature 风格不一致，运行时不报错但很丑，也会让下游工具解析异常
- 以后改完一处 → 从头到尾 Ctrl+F 扫一遍同类项 → 再提交

**坑 4：第二个要素不该写 Polygon**

- 任务要求 2 个 Point，写成了 Polygon，而且坐标填了 `[100,100]`（甘肃/内蒙古经纬度，不是福州）
- 还嵌套层级写错了（Polygon 的 coordinates 是三层数组，写了二层）
- 教训：**任务要求什么就写什么，不要抢跑练还没学的类型**
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [119.3, 26.08]
      },
      "properties" : {
        "name": "三坊七巷"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [119.38, 26.03]
      },
      "properties" : {
        "name": "东方名城尚郡"
      }
    }
  ]
}
```

day2:
1. dataProjection: 'EPSG:4326' 和 featureProjection: 'EPSG:3857' 分别代表什么？为什么 GeoJSON 加载必须设这两个参数？
dataProjection: 'EPSG:4326'是数据坐标系 和 featureProjection: 'EPSG:3857'是要素坐标系 因为加载的fuzhou.geojson 数据是'EPSG:4326'这个坐标系 'EPSG:3857'画到ol上是这个坐标系, 不设不知道要转换，数据跑到非洲或直接不显示。

2. 点击弹窗的四步链路是什么？
弹窗4步：overlay dom->new Overlay->map.click->forEachFeatureAtPixel（feature, layer）-> feature.get('属性名') 显示属性

---

### Day 3-4 踩坑（POI 整合）

**坑 5：`readFeature` vs `readFeatures`（单复数）**

- 给 `FeatureCollection` 用了单数 `readFeature` → 报错 `Unsupported GeoJSON type: FeatureCollection`
- 规则：**单个 Feature 用单数，FeatureCollection 用复数**。看到方法名带复数就要想到"数组/集合"
- 排查经验：报错信息里 `Unsupported ... type` 就是在告诉你"类型不匹配"，先检查喂进去的数据是什么类型

**坑 6：图层创建了但没挂到地图（`map.addLayer` 被删）**

- fetch 里 new 了 VectorLayer，但漏了 `map.addLayer(geoVectorLayer)` → 图层永远不显示，且**不报错**
- 排查经验：图层没显示时先问三个问题——①数据加载了吗（Network 面板）②图层加进 map 了吗（addLayer/layers 数组）③样式能画出来吗
- 这跟 Day 2 的"瓦片加载失败不报 JS 错误"是同一类坑：**地图渲染是静默的，全靠自己查**

**坑 7：`new Feature({ properties: {...} })` 包装错了**

- OL 的 Feature 构造函数：**`geometry` 之外的所有顶层键直接就是属性**
- `new Feature({ geometry, name: "POS1" })` ✅ → `feature.get('name')` 能读到
- `new Feature({ geometry, properties: { name: "POS1" } })` ❌ → `feature.get('name')` 是 undefined，`feature.get('properties')` 才是那个对象
- 记忆点：**GeoJSON 里数据包在 `properties` 键下，但 JS 构造 Feature 不需要这层包装**——两种语境的语法不一样

**坑 8：fill/stroke 样式对 Point 无效**

- 给点图层挂了 `styles`（蓝色 fill + stroke）→ 点不可见，**不报错**
- 原因：fill/stroke 是面的样式，Point 几何必须有 `image`（CircleStyle/Icon）才画得出来
- 对照记忆：面用 fill/stroke，点用 image——**样式跟几何类型强绑定**