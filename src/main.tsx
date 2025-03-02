import React, { useEffect, useRef } from "react";
import { useGeographic } from "ol/proj";
import { createRoot } from "react-dom/client";
import "ol/ol.css";
import {Application} from "./app/application";

useGeographic();

createRoot(document.getElementById("root")).render(<Application />);

