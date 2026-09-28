1. 按 import 路径搜（ol/layer/Tile）
2. https://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}
{x} {y} {z}：占位符，OpenLayers 会自动替换——z 是缩放级别，x/y 是该级别下的瓦片行列号。这是 Web 地图通用的"瓦片金字塔"编号规则，也是 XYZ 这个名字的由来。
{1-4}：子域名轮询（webrd01~04），浏览器对同一域名有并发限制，分散到 4 个域名可以并行下载更快。
style=8：高德的样式参数，8 = 道路图，6 = 影像图，7 = 路网注记。
3. zoom: 缩放级别：0=全球，11≈城市，18≈街道
4. 默认用Web 墨卡托投影（EPSG:3857，单位是米）
5. 但 Web 地图默认用Web 墨卡托投影（EPSG:3857，单位是米）
6. https://tile.openstreetmap.org/11/1702/870.png 意思是"给我 11 级、第 1702 列、第 870 行那张瓦片"——那正是福州所在的位置。你写的 URL 模板里的 {z}/{x}/{y} 占位符，就是让 OpenLayers 根据当前视野自动算出需要哪些瓦片，逐个替换数字去请求。你拖动地图时看到一块块图片刷出来，就是在加载新的瓦片。
7. source：更准确的说是“内容从哪里来”，是数据来源（URL、格式、坐标系），Source 管数据，Layer 管显示，View 管视角，Map 管组装。
8. 矢量图层：（你画的点/线/面（比如标记你去过的地方）、注记图层：只有地名文字的透明瓦片 影像图层：卫星照片

---

# 第 1 周踩坑记录（月底公开文章素材）

> 主题候选：《地图一片空白但控制台没报错？记我学 OpenLayers 第一周踩的 4 个坑》

## 坑1：target 写成了 CSS 选择器

- 现象：地图不渲染，控制台无任何报错
- 原因：写了 `target: "#app"`。OL 的 target 要的是元素 id（`"app"`）或 DOM 元素，不是 CSS 选择器；找不到元素时**静默失败**
- 排查：看页面 DOM 里有没有生成 `.ol-viewport`，没有 = Map 根本没挂上

## 坑2：OSM 官方瓦片国内连不上

- 现象：缩放按钮、版权信息都在，但地图区域一片黑/白，控制台依然无报错
- 原因：`tile.openstreetmap.org` 全部 `ERR_CONNECTION_TIMED_OUT`。**瓦片图片加载失败不抛 JS 异常**
- 解决：换国内可直连的 XYZ 源（高德）；注意高德是 GCJ-02 坐标系，有偏移（第 2 周展开）

## 坑3：高德瓦片域名与 style 没配对 → 404

- 现象：把 URL 的 style=8 改成 style=6 想看影像图，地图又空白了
- 原因：影像图不在 webrd 域名下，webrd+style=6 返回 404
- 速查表：
  | 内容 | 域名 | style |
  |---|---|---|
  | 道路图（带地名） | webrd0{1-4} | 8 |
  | 卫星影像 | webst0{1-4} | 6 |
  | 路网注记（透明，叠影像用） | webst0{1-4} | 8 |

## 坑4：opacity 写进了 Source 里

- 现象：设了 `opacity: 0.5` 完全不生效，无报错
- 原因：写在了 `new XYZ({...})` 里，OL 对不认识的参数静默忽略。opacity 是“怎么显示”，属于 Layer
- 口诀：**Source 管数据，Layer 管显示，View 管视角，Map 管组装**

## 总结：地图空白排查三板斧

1. DOM 里有没有 `.ol-viewport`？没有 → 查 target
2. F12 → Network → Img，瓦片请求什么状态？超时 → 换源；404 → 查 URL
3. 图层参数不生效？查参数是不是放错了层级（Layer vs Source）

> OL 的设计哲学：配置错了大多**静默失败**而不是报错。所以地图开发的第一反应不是看 Console，是看 Network 和 DOM。

---

# Day 2：坐标系与投影

## 1. 为什么 center 要用 fromLonLat 包一层（思考题结题）

- OpenLayers 本身不绑定坐标系，是 **View 决定坐标系**；View 不写 `projection` 时默认 `EPSG:3857`（单位：米）
- `fromLonLat`：`[经度, 纬度]`（4326，度）→ View 所用投影的坐标（默认 3857，米）
- 记法：记“View 决定坐标系”，别记“OL 用墨卡托”（第 2 周天地图有 4326 版瓦片，到时 View 会改成 4326，fromLonLat 就不需要了）

## 2. 名词卡片

- **投影**：把球面位置换算到平面的数学规则（有很多种，各有取舍）
- **默认投影**：View 不写 projection 参数时 OL 自动填的值（EPSG:3857），就是函数默认参数
- **EPSG**：给全世界坐标系编身份证号的机构；全世界软件都认这套编号（OL / PostGIS 的 SRID / QGIS 通用）
  - **EPSG:4326** = WGS84 经纬度（GPS 那套，单位：度）
  - **EPSG:3857** = Web 墨卡托（网页地图切瓦片那套，单位：米）
- **3857 的原点 (0,0)**：赤道 × 本初子午线交点，在非洲西边几内亚湾海面上

## 3. 实验：去掉 fromLonLat 会怎样

- `[119.3, 26.08]` 被当成“原点往东 119 米、往北 26 米”→ 地图定位到几内亚湾
- 量级对比：不转 = 119 米；转后 = `[13,280,000, 3,003,000]` 米（福州离原点 1.3 万公里）
- **现象坑**：预期看到海，实际一片空白——因为高德对国外高缩放级别只返回纯色瓦片（实测 200、仅 179 字节），不是加载失败。zoom 改 3 可看到世界图中心停在非洲西海岸外
- 至此“地图空白”见过四种：target 错（DOM 没挂上）/ 瓦片超时 / 瓦片 404 / 瓦片成功但是纯色——Network 面板里长相各不相同

## 4. 点击打印两种坐标（实操）

```js
map.on('click', (ev) => {
  const coord3857 = ev.coordinate;        // [x米, y米] EPSG:3857
  const coord4326 = toLonLat(coord3857);  // [经度, 纬度] EPSG:4326
  console.log(coord3857, coord4326);
});
```

- `toLonLat` 是 `fromLonLat` 的逆运算：米 → 度
- 教训：变量名把 3857/4326 写串位了（3587/4386），这两个编号要精确背

## 5. 待回答（看完理论视频后自己写）

- [ ] 矢量 vs 栅格数据是什么？（提示：GeoJSON vs 瓦片图片）
- [ ] 为什么切瓦片用墨卡托？（提示：正方形、角度不变形）
矢量存坐标+属性，程序能查询能点击（像DOM）GeoJSon数据，栅格存像素颜色，程序读不出内容（像截图）
墨卡托把世界投影成正方形，好切割，1， 4， 16， 4的n次方，牺牲面积保角度保形状
冰岛在北纬 65°，那条纬线圈实际只有赤道的 42% 长；
墨卡托规定：每条纬线都画成和赤道一样宽 → 冰岛所在的那整条纬度带被横向拉了 2.4 倍；
为了保角，纵向必须跟着拉 2.4 倍；
广场恰好站在这条被拉的土地上，于是跟着连坐：横 ×2.4、纵 ×2.4——两个方向拉得一样多，所以它还是正方形，只是大了。

day3:
https://jsapi-data2.amap.com/tile/26_07_14_00/v2/building_region_road_transit/pbf/2/214_72_8?auth_key=1785113902-216658-0-1a79f34c983831b65bfe1c28aca28c08

Map是容器 是所有东西的承载体 View 看哪里，中心+级别+投影 layers 是图层 可以有很多层 可以有卫星图 标注图层  矢量图层 source是数据来源 管从哪里取数据取哪些瓦片图片
minZoom 锁定辖区，不跑出“辖区”，主要为业务圈地；性能收益对栅格瓦片很小，对矢量图层很大。
maxZoom 数据源有天花板，放大到太大页面会空白，因为拿不到数据。

抓包解读，要记的就三条
认瓦片的方法：在 URL 里找 z/x/y 三个数字。 不管是 /11/1702/870.png 还是 214_72_8，只要有"级别+行列号"三件套，它就是瓦片服务——这是通用技能，对任何地图网站有效；

影像+半透明道路图
```
layers: [
    new TileLayer({
    source: new XYZ({
      url: 'https://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'
    })
  }),
    new TileLayer({
      source: new XYZ({
        url: 'https://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
      }),
      opacity: 0.5
    })
],
```
影像 + 透明注记层
```
layers: [
    new TileLayer({
    source: new XYZ({
      url: 'https://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'
    })
  }),
    new TileLayer({
      // 透明路网注记层：webst 域名 + style=8（webrd 域名只有道路图，请影像会 404）
      source: new XYZ({
        url: 'https://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
      })
    })
],
```

为什么注记层要做成透明底：影像和文字都清晰

---

# Day 4：控件——MousePosition + ScaleLine

## 1. 控件怎么挂到地图上

- `controls: defaultControls().extend([mousePosition, scaleLine])`
- `defaultControls()` = 默认三件套（缩放按钮/旋转复位/版权），`.extend()` 在它基础上加新控件
- 控件不依赖瓦片：地图全黑时控件也会显示（可用来判断“空白”是瓦片问题还是初始化问题）

## 2. MousePosition 要点

- `projection`：思考题答案——文档原文 "Default is the view projection"，不写就显示 View 的 3857（千万级的米数），写 'EPSG:4326' 才显示经纬度
- `coordinateFormat` 两种写法，本质区别是 JS 概念：
  - `createStringXY(5)` → **工厂函数**，调用它返回格式化函数，要带括号
  - `toStringHDMS` → **本身就是格式化函数**，传引用，不带括号（带了括号 = 传的是执行结果，控件拿到字符串不是函数，坐标不显示）
- `className` 自定义后，默认的右上角定位 CSS（.ol-mouse-position）就不生效了，必须自己写样式——先用默认跑通，再美化

## 3. ScaleLine 要点

- 位置：地图容器**左下角**，一小段线 + 文字（如 "2 km"）= 图上这段长对应实地多远
- `units`：'metric'（米/公里，默认）/ 'degrees'（度）等
- `bar: true` + `steps: 4`：从一条线变分段条，更醒目
- ⚠️ 参数名是 **units（复数）**，写成 unit 被静默忽略（恰好默认值也是 metric，所以看不出异常——这种“错了但碰巧没事”最危险）

## 4. 度分秒格式

- 1度 = 60分（′），1分 = 60秒（″），和时/分/秒同构：119.3° = 119° 18′ 00″
- HDMS 的 H = Hemisphere（半球），后缀 N/S/E/W：26° 04′ 48″ N
- GPS 设备/测绘文书用度分秒，写代码永远用小数

## 5. 文档使用五步法（长期有效）

1. 顺序：先 Examples 抄能跑的骨架，再回 API 文档搞懂参数
2. Options 表只扫两类：没默认值的 + 和当下需求相关的（有默认值 = 不改也能跑，不是永远不用看）
3. 页面解剖：类描述必读 → Options 扫 → Fires 需要监听才看 → Methods 里标 inherited 的直接跳过
4. 文档高频词收集：defaults to（默认为）/ inherited（继承的）/ fires（触发）/ deprecated（废弃别用）
5. 记模式不记参数：OL 所有类都是 `new 类名({options})` + get/set + on 事件，学会一个 = 预习全部

## 6. 今日新增的坑

- 域名手滑：webrd 敲成 webrb → 域名不存在 → Network 里 ERR_NAME_NOT_RESOLVED（地图空白第五种病因）
- webrd + style=6 的 404 组合又踩了一次（第 2 次）：webrd 只有 8，要 6 必须 webst
- toStringHDMS 多写括号 → 传了执行结果不是函数引用（同 onClick={fn} vs onClick={fn()}）
- **webrd 域名必须带 `lang=zh_cn&size=1&scale=1`，缺了直接 404**（webst 不带反而没事，实测验证）

## 7. 高德瓦片速查表（终极版）

| 想要什么 | 域名 | style | 必带参数 |
|---|---|---|---|
| 道路图 | webrd0{1-4} | 8 | lang=zh_cn&size=1&scale=1（缺了 404） |
| 卫星影像 | webst0{1-4} | 6 | 无 |
| 透明路网注记 | webst0{1-4} | 8 | 无 |

> 野路子接口拿不准就拿单张瓦片 URL 直接请求验证状态码，别盲猜

## 8. 看示例源码的姿势

- 只抄核心：`new XXX({...})` + 挂到 map 的那几行
- 示例页的 checkbox/下拉框和 `onXXXChange` 事件处理函数是**演示道具（UI 胶水代码）**，不是 API，文档里查不到是正常的
- 顺带学到：每个控件对象有 `.element` 属性指向自己的 DOM，想用 JS 改控件外观时的入口

```
control = new ScaleLine({
      units: unitsSelect.value,
    });
control.element.classList.toggle(
    'ol-scale-bar-inverted',
    invertColorsCheckbox.checked,
  );
```

## 9. 比例尺到底是什么

- 回答的问题：**屏幕上这一段 = 实地多远**（地图是缩小的世界，比例尺就是缩小倍数的可视化）
- 放大 → 同样屏幕长度代表的实地变短 → 数字变小（500 m）；缩小 → 数字变大（10 km）——和瓦片金字塔 z 级别是同一件事的两种表达
- `units: 'metric'` 才是人看的（米/公里）；'degrees' 显示经度跨度，全球小比例尺地图才用，日常项目一律 metric