import {Feature, Map, View} from "ol";
import TileLayer from "ol/layer/Tile";
import {OSM} from "ol/source";
import React, {useEffect, useRef, useState} from "react";
import {useGeographic} from "ol/proj";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {GeoJSON} from "ol/format";
import {pointerMove} from "ol/events/condition";
import Select from 'ol/interaction/Select';
import {Fill, Stroke, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";
import "./css/style.css";

useGeographic();

const userSource = new VectorSource();
const view = new View({ center: [10.8, 59.9], zoom: 10 });

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

// 🟢 Standard stil (blå prikker)
const defaultStyle = new Style({
    image: new CircleStyle({
        radius: 5,
        fill: new Fill({ color: 'white' }),
        stroke: new Stroke({ color: 'blue', width: 1 }),
    }),
});

// 🟡 Hover-stil (gule prikker)
const hoverStyle = new Style({
    image: new CircleStyle({
        radius: 7,
        fill: new Fill({ color: 'plum' }),
        stroke: new Stroke({ color: 'black', width: 2 }),
    }),
});

// VectorLayer med standard stil
const vectorLayer = new VectorLayer({
    source: fireStationLayer.getSource() ?? undefined,
    style: (feature) => feature.get('hover') ? hoverStyle : defaultStyle,
});

let lastHoveredFeature: Feature | null = null;
// 🖱️ Håndter hover-effekt
map.on('pointermove', (event) => {
    const feature = map.forEachFeatureAtPixel(event.pixel, (feat) => feat as Feature);

    if (feature !== lastHoveredFeature) {
        // Tilbakestill forrige feature
        if (lastHoveredFeature) {
            lastHoveredFeature.set('hover', false);
        }

        // Sett ny feature til hover-stil
        if (feature) {
            feature.set('hover', true);
        }

        lastHoveredFeature = feature || null;
        vectorLayer.getSource()?.changed(); // Oppdater kartet
    }
});

map.addLayer(vectorLayer);

// 🔴 Clicked Style (Red Dots)
const clickStyle = new Style({
    image: new CircleStyle({
        radius: 7,
        fill: new Fill({ color: 'red' }),
        stroke: new Stroke({ color: 'black', width: 2 }),
    }),
});

// 🏷️ Create Popup Element (Dynamically in HTML)
const popup = document.createElement('div');
popup.className = 'popup'; // ✅ Use CSS class
document.body.appendChild(popup);

let lastClickedFeature: Feature | null = null;

// 🖱️ Click Event to Show Info
map.on('singleclick', (event) => {
    const feature = map.forEachFeatureAtPixel(event.pixel, (feat) => feat as Feature | null);

    if (feature) {
        // Reset previous click effect
        if (lastClickedFeature) {
            lastClickedFeature.setStyle(defaultStyle);
        }

        // Apply clicked style
        feature.setStyle(clickStyle);

        // 🔍 Extract API Info
        const props = feature.getProperties();
        console.log("API Data on Click:", props); // Debugging

        popup.innerHTML = `
        <strong>${props.brannstasjon || 'Unknown Station'}</strong><br>
        Type: ${props.stasjonstype || 'N/A'}<br>
        Brannvesen: ${props.brannvesen || 'N/A'}
    `;
        popup.style.left = `${event.pixel[0] + 15}px`;
        popup.style.top = `${event.pixel[1] + 15}px`;
        popup.style.display = 'block';

        lastClickedFeature = feature;
    } else {
        // Hide popup if clicking outside a feature
        popup.style.display = 'none';
    }
});


export function Application() {
    const mapRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => map.setTarget(mapRef.current!), []);
    return <div ref={mapRef}></div>;
}
