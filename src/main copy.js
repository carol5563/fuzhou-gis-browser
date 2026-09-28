import './style.css'
import 'ol/ol.css'
import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js'
import View from 'ol/View.js'
import Point from 'ol/geom/Point.js';
import TileLayer from 'ol/layer/Tile.js'
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import Icon from 'ol/style/Icon.js';
import CircleStyle from 'ol/style/Circle.js';
import Fill from 'ol/style/Fill.js';
import Stroke from 'ol/style/Stroke.js';
import Style from 'ol/style/Style.js';
import { fromLonLat, toLonLat } from "ol/proj.js"
import XYZ from 'ol/source/XYZ.js'
import { defaults as defaultControls, MousePosition, ScaleLine } from 'ol/control.js'
import { createStringXY } from "ol/coordinate.js";
import gcoord from 'gcoord';
import GeoJSON from 'ol/format/GeoJSON.js';
import Overlay from 'ol/Overlay.js';

/**
 * Elements that make up the popup.
 */
const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

/**
 * Create an overlay to anchor the popup to the map.
 */
const overlay = new Overlay({
  element: container,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});

/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

const styles = [
  new Style({
    stroke: new Stroke({
      color: 'blue',
      width: 2
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 255, 0.2)'
    }),
  })
]

const mousePosition = new MousePosition({
  coordinateFormat: createStringXY(5),
  // coordinateFormat: toStringHDMS,
  projection: 'EPSG:4326',
})

const scaleLine = new ScaleLine({
  units: "metric",
  bar: true,
  steps: 4,
})

const iconFeature = new Feature({
  geometry: new Point(fromLonLat(gcoord.transform([119.388263, 26.027506], gcoord.WGS84, gcoord.GCJ02))),
});
// console.log(gcoord.transform([119.388263, 26.027506], gcoord.WGS84, gcoord.GCJ02), [119.393202, 26.024584]);

const iconStyle = new Style({
  image: new CircleStyle({
    radius: 8,
    fill: new Fill({ color: 'red' }),
    stroke: new Stroke({ color: 'white', width: 2 }),
  }),
});

const gdIconFeature = new Feature({
  geometry: new Point(fromLonLat(gcoord.transform([119.388263, 26.027506], gcoord.WGS84, gcoord.GCJ02))),
});

const gdIconStyle = new Style({
  image: new CircleStyle({
    radius: 8,
    fill: new Fill({ color: 'yellow' }),
    stroke: new Stroke({ color: 'white', width: 2 }),
  }),
})

gdIconFeature.setStyle(gdIconStyle);

iconFeature.setStyle(iconStyle);

const vectorSource = new VectorSource({
  features: [iconFeature, gdIconFeature],
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
});
// 高德卫星层
const gdSatelliteLayer = new TileLayer({
  source: new XYZ({
    url: 'https://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'
  }),
  visible: true
});
// 高德路网层
const gdRoadLayer = new TileLayer({
  source: new XYZ({
    url: 'https://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
  }),
  visible: false
});
// 高德注记层
const gdAnnotationLayer = new TileLayer({
  source: new XYZ({
    url: 'https://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
  }),
  visible: true
});
const tiandituLayer = new TileLayer({
  source: new XYZ({
    url:'https://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=8a48a81b544e7d2b4edec09e4fb4e339',
  }),
  visible: false
});

const tiandituAnnotationLayer = new TileLayer({
  source: new XYZ({
    url:'https://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=8a48a81b544e7d2b4edec09e4fb4e339',
  }),
  visible: false
});

let geoObject;
let geoVectorLayer;

const map = new Map({
  target: "app",
  controls: defaultControls().extend([mousePosition, scaleLine]),
  layers: [
    gdSatelliteLayer,
    gdRoadLayer,
    gdAnnotationLayer,
    // tiandituLayer,
    // tiandituAnnotationLayer,
    vectorLayer
  ],
  overlays: [overlay],
  view: new View({
    center: fromLonLat([119.3, 26.08]),
    zoom: 11,
    // minZoom: 8,
    // maxZoom: 18,
  })
});

fetch("/data/fuzhou.geojson").then(res => res.json()).then(data => {
  geoObject = data;
  geoVectorLayer = new VectorLayer({
    source: new VectorSource({
      features: new GeoJSON().readFeatures(geoObject, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' })
    }),
    style: styles
  });
  map.addLayer(geoVectorLayer);
});

map.on('click', (ev) => {
  const coord3857 = ev.coordinate;
  // const coord4326 = toLonLat(coord3857)
  // console.log(coord3857, coord4326)
  map.forEachFeatureAtPixel(ev.pixel, (feature, layer) => {
    console.log(ev.coordinate)
     content.innerHTML = feature.get('name');
     overlay.setPosition(ev.coordinate);
  });
})

// document.getElementById('gdSatelliteBtn').addEventListener('click', () => {
//   gdSatelliteLayer.setVisible(true);
//   gdRoadLayer.setVisible(false);
//   gdAnnotationLayer.setVisible(true);
//   tiandituLayer.setVisible(false);
//   tiandituAnnotationLayer.setVisible(false);
// });
// document.getElementById('gdRoadBtn').addEventListener('click', () => {
//   gdSatelliteLayer.setVisible(false);
//   gdRoadLayer.setVisible(true);
//   gdAnnotationLayer.setVisible(true);
//   tiandituLayer.setVisible(false);
//   tiandituAnnotationLayer.setVisible(false);
// });
// document.getElementById('tiandituBtn').addEventListener('click', () => {
//   gdSatelliteLayer.setVisible(false);
//   gdRoadLayer.setVisible(false);
//   gdAnnotationLayer.setVisible(false);
//   tiandituLayer.setVisible(true);
//   tiandituAnnotationLayer.setVisible(true);
// });
