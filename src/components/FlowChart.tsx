/* eslint-disable @typescript-eslint/no-unused-vars */
// src/FlowChart.tsx
import React, { useEffect, useState } from "react";
import mermaid from "mermaid";
import { FileNode } from "../services/github";

export interface FlowChartProps {
  repoUrl: string;
  nodes: FileNode[];
}

const FlowChart: React.FC<FlowChartProps> = ({ repoUrl, nodes }) => {
  const [diagram, setDiagram] = useState("");

  useEffect(() => {
    if (!nodes.length) return;
    // Build a simplistic Mermaid graph: each file → its containing folder
    const header = "graph TD\n";
    const lines = nodes
      .filter(n => n.type === "blob")
      .map(n => {
        const parts = n.path.split("/");
        const file = parts.pop()!;
        const parent = parts.join("/") || "root";
        // sanitize IDs
        const pId = parent.replace(/[^a-zA-Z0-9]/g, "_");
        const fId = file.replace(/[^a-zA-Z0-9]/g, "_");
        return `${pId}-->${fId}`;
      });
    setDiagram(header + lines.join("\n"));
  }, [nodes]);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false });
  }, []);

  useEffect(() => {
    // re-render
    mermaid.contentLoaded();
  }, [diagram]);

  return (
    <div className="mermaid text-white overflow-auto">
      {diagram}
    </div>
  );
};

export default FlowChart;
