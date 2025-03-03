import { Feature, Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import React, { useEffect, useRef } from "react";
import { useGeographic } from "ol/proj";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { GeoJSON } from "ol/format";
import { Fill, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import "./css/style.css";

useGeographic();

const osmLayer = new TileLayer({ source: new OSM() });
const civilDefenseLayer = new VectorLayer({
  source: new VectorSource({
    url: "/arbeidskrav/geojson/Sivilforsvarsdistrikter.geojson",
    format: new GeoJSON(),
  }),
});
const fireStationLayer = new VectorLayer({
  source: new VectorSource({
    url: "/arbeidskrav/api/brannstasjoner",
    format: new GeoJSON(),
  }),
});

const map = new Map({
  view: new View({ center: [10.8, 59.9], zoom: 8 }),
  layers: [osmLayer, civilDefenseLayer, fireStationLayer],
});

const defaultStyle = new Style({
  image: new CircleStyle({
    radius: 5,
    fill: new Fill({ color: "white" }),
    stroke: new Stroke({ color: "blue", width: 1 }),
  }),
});

const hoverStyle = new Style({
  image: new CircleStyle({
    radius: 7,
    fill: new Fill({ color: "plum" }),
    stroke: new Stroke({ color: "black", width: 2 }),
  }),
});

const vectorLayer = new VectorLayer({
  source: fireStationLayer.getSource() ?? undefined,
  style: (feature) => (feature.get("hover") ? hoverStyle : defaultStyle),
});

let lastHoveredFeature: Feature | null = null;
map.on("pointermove", (event) => {
  const feature = map.forEachFeatureAtPixel(
    event.pixel,
    (feat) => feat as Feature,
  );

  if (feature !== lastHoveredFeature) {
    if (lastHoveredFeature) {
      lastHoveredFeature.set("hover", false);
    }

    if (feature) {
      feature.set("hover", true);
    }

    lastHoveredFeature = feature || null;
    vectorLayer.getSource()?.changed();
  }
});

map.addLayer(vectorLayer);

const clickStyle = new Style({
  image: new CircleStyle({
    radius: 7,
    fill: new Fill({ color: "red" }),
    stroke: new Stroke({ color: "black", width: 2 }),
  }),
});

const popup = document.createElement("div");
popup.className = "popup"; //
document.body.appendChild(popup);

let lastClickedFeature: Feature | null = null;

map.on("singleclick", (event) => {
  const feature = map.forEachFeatureAtPixel(
    event.pixel,
    (feat) => feat as Feature | null,
  );

  if (feature) {
    if (lastClickedFeature) {
      lastClickedFeature.setStyle(defaultStyle);
    }

    feature.setStyle(clickStyle);

    const props = feature.getProperties();
    console.log("API Data on Click:", props);

    popup.innerHTML = `
        <strong>${props.brannstasjon || "Unknown Station"}</strong><br>
        Type: ${props.stasjonstype || "N/A"}<br>
        Brannvesen: ${props.brannvesen || "N/A"}
    `;
    popup.style.left = `${event.pixel[0] + 15}px`;
    popup.style.top = `${event.pixel[1] + 15}px`;
    popup.style.display = "block";

    lastClickedFeature = feature;
  } else {
    popup.style.display = "none";
  }
});

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => map.setTarget(mapRef.current!), []);
  return <div ref={mapRef}></div>;
}
