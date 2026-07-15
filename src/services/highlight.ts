"use client";
import "highlight.js/styles/night-owl.min.css";

import highlight from "highlight.js/lib/core";
import glsl from "highlight.js/lib/languages/glsl";
import typescript from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import xml from "highlight.js/lib/languages/xml";

highlight.registerLanguage("glsl", glsl);
highlight.registerLanguage("typescript", typescript);
highlight.registerLanguage("json", json);
highlight.registerLanguage("xml", xml);

export default highlight;
