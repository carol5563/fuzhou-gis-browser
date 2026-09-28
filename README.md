
zoom是 15 

# 福州地图浏览器 v0.1
## 这是什么
这是一张福州地图，高德卫星底图+透明标注图层，鼠标移动显示坐标值 左下角展示比例尺
## 怎么跑            ← pnpm install / pnpm dev
```bash
pnpm install
pnpm dev
```
浏览器打开 `http://localhost:5173`
## 4326 vs 3857、fromLonLat、为什么瓦片用墨卡托
4326是经纬度（球面上的坐标） 3857墨卡托（压平后的假米） 是把一个球平铺成一个平面 纬度越大 横向拉伸得越大
fromLonLat是坐标转换函数 可以实现将4326坐标系转成3857坐标系 因为墨卡托是正方形的，方便切割 不变形 保角度
## 踩过的坑
1. target 不用带# 也可以传DOM
2. webrd 只能接 style=8 且必须带 lang/size/scale 参数
  webst 影像店，因为webrd上没有道路信息 oSM在国内网络不稳定