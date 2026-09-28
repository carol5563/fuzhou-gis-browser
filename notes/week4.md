`WMS`(服务端出图，返回图片) `WMTS`(预切好的瓦片)  `WFS`(返回矢量要素数据) 
WMS 服务端返回一张图，适合需要获取最新数据，实时渲染。
WMTS WEB MAP TILE SERVICE  服务端返回切好的256*256的瓦片图片，适合做底图，要求加载速度快
WFS Web Feature Service 服务端直接返回要素和属性，适合交互要求高，点击弹窗，灵活，前端可以直接修改样式

WMS 要什么画什么，WMTS 提前画好按号取， WFS 给数据自己画


 `XYZ`·`TMS`(瓦片寻址方式)
XYZ和TMS 都是瓦片编号规则，服务本身还是返回瓦片图片，XYZ原点在左上角，TMS原点在左下角

day2:
因为瓦片切分是二维的（横向 + 纵向同时翻倍）

全球总像素数（一行）= 256 × 2^z
全球总宽度（米）固定
分辨率（米/像素）= 总宽度 / (256 × 2^z)
每升一级，横向瓦片数 ×2，纵向瓦片数 ×2 → 总数 ×4。
onst size = getWidth(projectionExtent) / 256; 算的是第 0 级一行多少个瓦片（≈ 1），然后第 z 级一行瓦片数 = size × 2^z，一级分辨率 = 总米数 / (一行瓦片数 × 256)。

---

## 今天的坑

### 坑1：fromLonLat 用了方括号 [] 而不是圆括号 ()

错误写法：`center: fromLonLat[-119.3, 26.08]`
正确写法：`center: fromLonLat([119.3, 26.08])`

后果：地图完全空白，控制台不报任何 JS 错误。

原因：`fromLonLat[-119.3, 26.08]` 里的 `[-119.3, 26.08]` 被 JS 当成逗号表达式，结果是 `26.08`，然后变成 `fromLonLat[26.08]` —— 取函数的第 26.08 个属性，得到 `undefined`。center 是 undefined，地图没有中心点，所以什么都不显示。

教训：函数调用永远用 `()`，`[]` 是属性访问。这种错不报 JS 错误，只能靠 Network 面板或肉眼发现。

### 坑2：经度写了负数

`-119.3` 是西经（跑到美国去了），福州是东经 `119.3`，没有负号。

### 坑3：瓦片加载失败不报 JS 错误

WMTS 瓦片请求失败时，控制台完全静默，不会抛异常。排查必须 F12 → Network 面板 → 过滤 Img，看瓦片请求的状态码。

day3:

### 坑4：const 声明顺序——变量要在引用之前

错误：`OGCLayer` 写在 `projection`/`projectionExtent` 声明之前，引用了还没声明的 const 变量。

后果：直接抛 `ReferenceError: Cannot access 'projection' before initialization`，整个 JS 文件崩掉，地图白屏。

教训：`const` / `let` 没有变量提升（hoisting），必须在声明之后再使用。代码组织时注意依赖关系，被依赖的变量要先声明。

### 坑5：异步加载的图层，事件监听要加空指针保护

`geoVectorLayer` 是通过 `fetch().then()` 异步创建的，但 checkbox 的事件监听在 fetch 完成之前就注册了。如果用户在 GeoJSON 加载完成前点击 checkbox，`geoVectorLayer` 还是 `undefined`，调用 `.setVisible()` 会报 `TypeError`。

修法：加 `if (geoVectorLayer)` 判断再调用方法。

```js
// ❌ fetch 未完成时点击会报错
document.getElementById('geoVector').addEventListener('change', (event) => {
  geoVectorLayer.setVisible(event.target.checked);
});

// ✅ 加空指针保护
document.getElementById('geoVector').addEventListener('change', (event) => {
  if (geoVectorLayer) geoVectorLayer.setVisible(event.target.checked);
});
```

教训：凡是异步创建的变量（fetch、setTimeout、API 回调），在外部引用时都要做 null/undefined 检查。