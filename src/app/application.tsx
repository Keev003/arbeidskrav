import {Map, View} from "ol";
import TileLayer from "ol/layer/Tile";
import {OSM} from "ol/source";
import React, {useEffect, useRef, useState} from "react";
import {useGeographic} from "ol/proj";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {GeoJSON} from "ol/format";

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

export function Application() {
    const mapRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => map.setTarget(mapRef.current!), []);
    return <div ref={mapRef}></div>;
}