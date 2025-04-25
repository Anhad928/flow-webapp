// src/components/FlowChart.tsx
import React, { useEffect, useState, useRef } from "react";
import mermaid from "mermaid";
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
  "flowchart": {"nodeSpacing":30,"rankSpacing":60,"useMaxWidth":false},
  "themeVariables": {
    "fontSize":"14px",
    "primaryTextColor":"#EEE",
    "lineColor":"#888",
    "strokeWidth":"1px"
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
  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    if (!diagram) {
      el.innerHTML = `<p class="text-gray-500">No diagram to display yet.</p>`;
      return;
    }

    el.innerHTML = diagram;
    mermaid.init(undefined, el);
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

  return (
    <div className="relative">
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
