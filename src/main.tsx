import React, { useEffect, useRef } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { useGeographic } from "ol/proj";
import {createRoot} from "react-dom/client";
import "ol/ol.css";

useGeographic();

const map = new Map({
    view: new View({ center: [10.8, 59.9], zoom: 13 }),
    layers: [new TileLayer({ source: new OSM() })],
});

// A functional React component
export function Application() {
    const mapRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        map.setTarget(mapRef.current!);
    }, []);
    return <div ref={mapRef}></div>;
}

createRoot(document.getElementById("root")).render(<Application/>)
