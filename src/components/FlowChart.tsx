// src/components/FlowChart.tsx
import React, { useEffect, useState, useRef } from "react";
import mermaid              from "mermaid";
import { saveAs }           from "file-saver";
import type { FileNode }    from "../services/github";

/* ────────────── utilities ─────────────────────────────────────────────── */
const safeId = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "_");

/** Very loose heuristics to describe what the child does */
function verbFor(path: string): string {
  const file = path.split("/").pop()!;

  if (/^pages\/api\//.test(path))             return "calls API";
  if (/^pages\/.*\.(jsx?|tsx?)$/.test(path))  return "renders page";
  if (/^src\/components\//.test(path))        return "uses component";
  if (file === "package.json")                return "reads manifest";
  if (file.endsWith(".json"))                 return "reads JSON";
  if (file.endsWith(".css"))                  return "imports style";
  if (/\.(png|jpe?g|gif|svg)$/.test(file))    return "loads asset";
  if (file.endsWith(".pdf"))                  return "serves PDF";
  if (file.endsWith(".md"))                   return "reads markdown";
  if (file.match(/\.(jsx?|tsx?)$/))           return "imports module";
  if (file.match(/\.test\.(jsx?|tsx?)$/))     return "runs test";
  return "uses";
}

function edgeLabel(parent: string, childPath: string): string {
  /* explicit rules first */
  if (parent.startsWith("pages/api/contact")  && childPath.endsWith("contact.js"))  return "forwards email";
  if (parent.startsWith("pages/api/projects") && childPath.endsWith("projects.js")) return "returns JSON list";
  return verbFor(childPath);
}

/* ──────────────── component ───────────────────────────────────────────── */
export interface FlowChartProps { nodes: FileNode[] }

const FlowChart: React.FC<FlowChartProps> = ({ nodes }) => {
  const [dsl,  setDsl]  = useState("");
  const [dir,  setDir]  = useState<"TB"|"LR">("TB");   // LR = horizontal
  const [zoom, setZoom] = useState(1);

  const scrollRef = useRef<HTMLDivElement>(null);
  const hostRef   = useRef<HTMLDivElement>(null);

  /* ───────── build Mermaid DSL (runs on nodes | dir change) ───────────── */
  useEffect(() => {
    if (!nodes.length) { setDsl(""); return; }

    const api   = nodes.filter(n => n.path.startsWith("pages/api/"));
    const data  = nodes.filter(n => n.path.startsWith("public/") || n.path.endsWith(".json"));
    const comps = nodes.filter(n => n.path.startsWith("src/components/"));
    const pages = nodes.filter(
      n => n.path.startsWith("pages/") && !n.path.startsWith("pages/api/")
    );
    const misc  = nodes.filter(n => ![...api, ...data, ...comps, ...pages].includes(n));

    const sub = (title: string, bucket: FileNode[]): string[] =>
      bucket.length
        ? [`subgraph "${title}"`, ...bucket.map(n => safeId(n.path)), "end"]
        : [];

    /* edges: **always** label them */
    const edges = nodes.map((n: FileNode) => {
      const parts  = n.path.split("/");
      parts.pop();                                   // remove leaf
      const parent = parts.join("/") || "root";
      const lbl    = edgeLabel(parent, n.path);
      return `${safeId(parent)} -->|${lbl}| ${safeId(n.path)}`;
    });

    const init = `%%{init:{
      "theme":"dark",
      "flowchart":{"nodeSpacing":30,"rankSpacing":60,"useMaxWidth":false},
      "themeVariables":{"diagramBackground":"#000","primaryTextColor":"#EEE","lineColor":"#888"}
    }}%%`;

    setDsl([
      init,
      `graph ${dir}`,
      ...sub("API Routes (pages/api/)",        api),
      ...sub("Data & Assets (public • *.json)",data),
      ...sub("Components (src/components/)",   comps),
      ...sub("Pages (pages/)",                 pages),
      ...sub("Misc",                           misc),
      ...edges,
    ].join("\n"));
  }, [nodes, dir]);

  /* ───────── mermaid render ───────────────────────────────────────────── */
  useEffect(() => mermaid.initialize({ startOnLoad: false, securityLevel: "loose" }), []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (!dsl) { host.innerHTML = "<p class='text-gray-500'>No diagram</p>"; return; }

    host.innerHTML = dsl;
    mermaid.init(undefined, host);
    const svg = host.querySelector("svg");
    if (svg) {
      svg.setAttribute("width",  `${svg.scrollWidth}`);
      svg.setAttribute("height", `${svg.scrollHeight}`);
      svg.style.background = "#000";
    }
  }, [dsl]);

  /* ───────── drag-to-pan handlers ─────────────────────────────────────── */
  const dragging = useRef(false);
  const sx = useRef(0);  const sy = useRef(0);
  const sl = useRef(0);  const st = useRef(0);

  const onDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    dragging.current = true;
    sx.current = e.clientX; sy.current = e.clientY;
    sl.current = scrollRef.current.scrollLeft;
    st.current = scrollRef.current.scrollTop;
    scrollRef.current.style.cursor = "grabbing";
  };
  const onMove = (e: React.MouseEvent) => {
    if (!dragging.current || !scrollRef.current) return;
    scrollRef.current.scrollLeft = sl.current - (e.clientX - sx.current);
    scrollRef.current.scrollTop  = st.current - (e.clientY - sy.current);
  };
  const onUp = () => {
    dragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  };

  /* ───────── export helpers ───────────────────────────────────────────── */
  const openNewTab = () => {
    const svg = hostRef.current?.querySelector("svg");
    if (!svg) return;
    const html = `<!DOCTYPE html><html><body style="margin:0;background:#000">${svg.outerHTML}</body></html>`;
    window.open(URL.createObjectURL(new Blob([html], { type: "text/html" })), "_blank");
  };

  const downloadSvg = () => {
    const svg = hostRef.current?.querySelector("svg");
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGElement;
    clone.style.transform = "none";
    clone.setAttribute("width",  `${svg.scrollWidth}`);
    clone.setAttribute("height", `${svg.scrollHeight}`);
    const xml = new XMLSerializer().serializeToString(clone);
    saveAs(
      new Blob([`<?xml version="1.0"?>\n${xml}`], { type: "image/svg+xml" }),
      "flowchart.svg"
    );
  };

  /* ───────── JSX ──────────────────────────────────────────────────────── */
  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-2">
        <button onClick={openNewTab}  className="px-3 py-1 bg-indigo-600 text-white rounded">Open in New Tab</button>
        <button onClick={downloadSvg} className="px-3 py-1 bg-green-600  text-white rounded">Download&nbsp;SVG</button>
        <button onClick={() => setDir(d => (d === "LR" ? "TB" : "LR"))}
                className="px-3 py-1 bg-gray-700  text-white rounded">
          Layout&nbsp;{dir === "LR" ? "⇅" : "⇆"}
        </button>
      </div>

      <div className="mb-2">
        <input type="range" min={0.3} max={3} step={0.05} value={zoom}
               onChange={e => setZoom(+e.target.value)}
               className="w-full accent-red-500"/>
        <span className="text-sm text-gray-300">Zoom {(zoom * 100).toFixed(0)}%</span>
      </div>

      <div ref={scrollRef}
           className="overflow-auto h-[600px] w-full bg-gray-900 rounded-lg p-2"
           style={{ cursor: "grab" }}
           onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}>
        <div ref={hostRef}
             className="mermaid inline-block"
             style={{ transform: `scale(${zoom})`, transformOrigin: "0 0" }}/>
      </div>
    </div>
  );
};

export default FlowChart;
