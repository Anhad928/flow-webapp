// ────────────────────────────────────────────────────────────
// src/components/FlowChart.tsx
//-----------------------------------------------------------------
import React, { useEffect, useRef, useState } from "react";
import mermaid           from "mermaid";
import { saveAs }        from "file-saver";
import type { FileNode } from "../services/github";

/* ── helpers ───────────────────────────────────────────────── */
const id = (s: string): string => s.replace(/[^a-zA-Z0-9]/g, "_");

function edgeLabel(parent: string, child: string): string {
  const file = child.split("/").pop() as string;

  if (child.startsWith("pages/api/contact"))   return "POST  /contact";
  if (child.startsWith("pages/api/projects"))  return "GET   /projects";
  if (file.endsWith(".json"))                  return "reads JSON";
  if (child.startsWith("public/"))             return "serves asset";
  if (/\.(png|jpe?g|gif|svg|pdf)$/.test(file)) return "downloads";
  if (/^src\/components\/icons/.test(child))   return "uses icon";
  if (/^src\/components\//.test(child))        return "imports component";
  if (/^pages\/.*\.(jsx?|tsx?)$/.test(child))  return "renders";
  if (/\.(jsx?|tsx?)$/.test(file))             return "imports";
  return "";
}

/* ── props ─────────────────────────────────────────────────── */
interface FlowChartProps {
  /** flat repo tree */
  nodes:   FileNode[];
  /** canonical GitHub URL, e.g. https://github.com/user/repo */
  repoUrl: string;
}

/* ── component ─────────────────────────────────────────────── */
const FlowChart: React.FC<FlowChartProps> = ({ nodes, repoUrl }) => {
  const [dsl,  setDsl]  = useState("");
  const [zoom, setZoom] = useState(1);

  const scrollRef = useRef<HTMLDivElement>(null);
  const hostRef   = useRef<HTMLDivElement>(null);

  /* ── build Mermaid DSL each change────────────────────────── */
  useEffect(() => {
    if (!nodes.length) { setDsl(""); return; }

    /* buckets → sub-graphs ---------------------------------- */
    const bucket = (regex: RegExp) => nodes.filter(n => regex.test(n.path));

    const icons   = bucket(/^src\/components\/icons\//);
    const comps   = bucket(/^src\/components\//).filter(n => !icons.includes(n));
    const api     = bucket(/^pages\/api\//);
    const pages   = bucket(/^pages\//).filter(n => !api.includes(n));
    const data    = bucket(/\.json$/);
    const assets  = bucket(/^public\//).concat(bucket(/\.(png|jpe?g|gif|svg|pdf)$/));
    const misc    = nodes.filter(n =>
      ![...icons, ...comps, ...api, ...pages, ...data, ...assets].includes(n)
    );

    const sub = (title: string, list: FileNode[]) =>
      list.length
        ? [`subgraph "${title}"`, ...list.map(n => id(n.path)), "end"]
        : [];

    /* edges + click directives ------------------------------ */
    const edges: string[]  = [];
    const clicks: string[] = [];

    nodes.forEach(n => {
      const parent = n.path.split("/").slice(0, -1).join("/") || "root";
      const lbl    = edgeLabel(parent, n.path);
      edges.push(
        lbl
          ? `${id(parent)} -->|${lbl}| ${id(n.path)}`
          : `${id(parent)} --> ${id(n.path)}`
      );

      const fileUrl = `${repoUrl.replace(/\/$/, "")}/blob/main/${n.path}`;
      clicks.push(`click ${id(n.path)} "${fileUrl}" _blank`);
    });

    /* Mermaid init block + custom CSS for hover ------------- */
    const init = `%%{init:{
      "theme":"dark",
      "flowchart":{ "nodeSpacing":28,"rankSpacing":60,"useMaxWidth":false },
      "themeCSS":".node:hover rect{fill:#8b5cf6;stroke-width:2px;}.node:hover{filter:drop-shadow(0 0 4px #8b5cf6)}"
    }}%%`;

    setDsl(
      [
        init,
        "graph TB",
        ...sub("API Routes (pages/api/)",   api),
        ...sub("Pages (UI routes)",         pages),
        ...sub("Components",                comps),
        ...sub("Icon Components",           icons),
        ...sub("Data (JSON)",               data),
        ...sub("Static Assets",             assets),
        ...sub("Misc / Config",             misc),
        ...edges,
        ...clicks
      ].join("\n")
    );
  }, [nodes, repoUrl]);

  /* ── Mermaid render ─────────────────────────────────────── */
  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, securityLevel: "loose" });
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    host.innerHTML =
      dsl || "<p class='text-gray-500'>No diagram – generate flow first.</p>";

    if (dsl) {
      mermaid.init(undefined, host);
      const svg = host.querySelector("svg");
      if (svg) {
        svg.setAttribute("width",  `${svg.scrollWidth}`);
        svg.setAttribute("height", `${svg.scrollHeight}`);
        svg.style.background = "#1e1e1e"; 
      }
    }
  }, [dsl]);

  /* ── drag-to-pan & zoom ─────────────────────────────────── */
  const dragging = useRef(false);
  const sx = useRef(0), sy = useRef(0), sl = useRef(0), st = useRef(0);

  const handleDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    dragging.current = true;
    sx.current = e.clientX; sy.current = e.clientY;
    sl.current = scrollRef.current.scrollLeft;
    st.current = scrollRef.current.scrollTop;
    scrollRef.current.style.cursor = "grabbing";
  };
  const handleMove = (e: React.MouseEvent) => {
    if (!dragging.current || !scrollRef.current) return;
    scrollRef.current.scrollLeft = sl.current - (e.clientX - sx.current);
    scrollRef.current.scrollTop  = st.current - (e.clientY - sy.current);
  };
  const handleUp = () => {
    dragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  };

  /* ── exports ────────────────────────────────────────────── */
  const openTab = () => {
    const svg = hostRef.current?.querySelector("svg");
    if (!svg) return;
    const html = `<!doctype html><html><body style="margin:0;background:#000">${svg.outerHTML}</body></html>`;
    window.open(URL.createObjectURL(new Blob([html], { type: "text/html" })));
  };
  const downloadSvg = () => {
    const svg = hostRef.current?.querySelector("svg");
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    saveAs(new Blob([`<?xml version="1.0"?>\n${xml}`], { type: "image/svg+xml" }), "flowchart.svg");
  };

  /* ── UI ─────────────────────────────────────────────────── */
  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-2">
        <button onClick={openTab}     className="px-3 py-1 rounded bg-indigo-600 text-white">Open&nbsp;Tab</button>
        <button onClick={downloadSvg} className="px-3 py-1 rounded bg-green-600  text-white">Download&nbsp;SVG</button>
      </div>

      <div className="mb-2">
        <input type="range" min={0.3} max={3} step={0.05}
               value={zoom} onChange={e => setZoom(+e.target.value)}
               className="w-full accent-red-500"/>
        <span className="text-sm text-gray-300">Zoom {(zoom*100).toFixed(0)}%</span>
      </div>

      <div ref={scrollRef}
           className="overflow-auto h-[600px] w-full bg-gray-900 rounded-lg p-2"
           style={{ cursor:"grab" }}
           onMouseDown={handleDown} onMouseMove={handleMove}
           onMouseUp={handleUp}    onMouseLeave={handleUp}>
        <div ref={hostRef}
             className="mermaid inline-block"
             style={{ transform:`scale(${zoom})`, transformOrigin:"0 0" }}/>
      </div>
    </div>
  );
};

export default FlowChart;
