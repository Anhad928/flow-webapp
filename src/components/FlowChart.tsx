import React, { useEffect, useState, useRef } from "react";
import mermaid from "mermaid";
import { saveAs } from "file-saver";
import { FileNode } from "../services/github";

export interface FlowChartProps {
  nodes: FileNode[];
}

const FlowChart: React.FC<FlowChartProps> = ({ nodes }) => {
  const [diagram, setDiagram] = useState<string>("");
  const [zoom, setZoom] = useState<number>(1);

  const scrollRef = useRef<HTMLDivElement>(null);
  const chartRef  = useRef<HTMLDivElement>(null);

  // Drag state
  const isDragging     = useRef(false);
  const startX         = useRef(0);
  const startY         = useRef(0);
  const startScrollX   = useRef(0);
  const startScrollY   = useRef(0);

  // 1) Build the Mermaid DSL when `nodes` changes
  useEffect(() => {
    if (!nodes.length) {
      setDiagram("");
      return;
    }

    // In your FlowChart.tsx, update the init block in the first useEffect:
    const init = `%%{init:{
      "theme": "dark",
      "flowchart": {
        "nodeSpacing": 30,
        "rankSpacing": 60,
        "useMaxWidth": false
      },
      "themeVariables": {
        "background": "#000000",
        "primaryTextColor": "#EEE",
        "lineColor": "#888",
        "strokeWidth": "1px"
      }
    }}%%`;

    // Left→Right layout
    
    const header = "graph ";

    const lines = nodes.map(n => {
      const parts = n.path.split("/");
      const file  = parts.pop()!;
      const parent= parts.join("/") || "root";
      const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "_");
      return `${sanitize(parent)}-->${sanitize(file)}`;
    });

    setDiagram([init, header, ...lines].join("\n"));
  }, [nodes]);

  // 2) Initialize Mermaid once
  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, securityLevel: "loose" });
  }, []);

  // 3) Render the diagram whenever the DSL changes
// 3) Render the diagram whenever the DSL changes
  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    const renderDiagram = async () => {
      if (!diagram) {
        el.innerHTML = `<p class="text-gray-500">No diagram to display yet.</p>`;
        return;
      }

      try {
        // Clear previous content
        el.innerHTML = diagram;
        
        // Wait for Mermaid rendering to complete
        await mermaid.init(undefined, el);
        
        // Add critical SVG attributes for exports
        const svg = el.querySelector('svg');
        if (svg) {
          svg.setAttribute('width', `${svg.scrollWidth}`);
          svg.setAttribute('height', `${svg.scrollHeight}`);
          svg.style.backgroundColor = '#1a1a1a'; // Match dark theme
        }
      } catch (error) {
        console.error('Mermaid rendering error:', error);
      }
    };

    renderDiagram();
  }, [diagram]);

  // Mouse handlers for click-and-drag panning
  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current   = true;
    startX.current       = e.clientX;
    startY.current       = e.clientY;
    startScrollX.current = scrollRef.current.scrollLeft;
    startScrollY.current = scrollRef.current.scrollTop;
    scrollRef.current.style.cursor = "grabbing";
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    scrollRef.current.scrollLeft = startScrollX.current - dx;
    scrollRef.current.scrollTop  = startScrollY.current - dy;
  };
  const endDrag = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  };

  // → Export handlers
  const handleOpenNewTab = () => {
    const svg = chartRef.current?.querySelector("svg");
    if (!svg) return;
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Flowchart</title></head>
<body style="margin:0;background:#000">
  ${svg.outerHTML}
</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };
  
  // Update SVG export handler
  const handleDownloadSVG = () => {
    const svgEl = chartRef.current?.querySelector("svg");
    if (!svgEl) return;
  
    // Create a clean copy of the SVG
    const clone = svgEl.cloneNode(true) as SVGElement;
    clone.style.transform = 'none';
    
    // Set explicit dimensions
    clone.setAttribute('width', `${svgEl.scrollWidth}`);
    clone.setAttribute('height', `${svgEl.scrollHeight}`);
    clone.setAttribute('viewBox', `0 0 ${svgEl.scrollWidth} ${svgEl.scrollHeight}`);
  
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clone);
    
    // Add XML header
    const fullSVG = `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;
    
    const blob = new Blob([fullSVG], { type: "image/svg+xml;charset=utf-8" });
    saveAs(blob, "flowchart.svg");
  };

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-2">
        <button onClick={handleOpenNewTab}
                className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          Open in New Tab
        </button>
        <button onClick={handleDownloadSVG}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
          Download SVG
        </button>
      </div>
      {/* Zoom Slider */}
      <div className="mb-2">
        <input
          type="range"
          min={0.3}
          max={3}
          step={0.05}
          value={zoom}
          onChange={e => setZoom(Number(e.target.value))}
          className="w-full accent-red-500"
        />
        <div className="text-sm text-gray-300">
          Zoom: {(zoom * 100).toFixed(0)}%
        </div>
      </div>

      {/* Scrollable container (both axes) */}
      <div
        ref={scrollRef}
        className="overflow-auto h-[600px] w-full bg-gray-900 dark:bg-black rounded-lg p-2"
        style={{ cursor: "grab" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
      >
        {/* Mermaid chart wrapper */}
        <div
          ref={chartRef}
          className="mermaid inline-block"
          style={{
            transform:       `scale(${zoom})`,
            transformOrigin: "0 0",
            width:           "max-content",
            height:          "max-content",
          }}
        />
      </div>
    </div>
  );
};

export default FlowChart;
