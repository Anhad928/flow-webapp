import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PlusCircle, MinusCircle, FileCode, Folder } from 'lucide-react';

interface FlowChartProps {
  repoUrl: string;
}

interface Node {
  id: string;
  type: 'file' | 'folder';
  name: string;
  position: { x: number; y: number };
  parentId?: string;
}

interface Edge {
  id: string;
  source: string;
  target: string;
}

const FlowChart: React.FC<FlowChartProps> = ({ repoUrl }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [zoom, setZoom] = useState(1);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const chartRef = useRef<HTMLDivElement>(null);
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 });

  // Generate sample data based on repo URL
  useEffect(() => {
    // This would be replaced with actual API call to get repository structure
    const sampleNodes: Node[] = [
      { id: 'root', type: 'folder', name: repoUrl.split('/').pop() || 'root', position: { x: 400, y: 100 } },
      { id: 'src', type: 'folder', name: 'src', position: { x: 300, y: 200 }, parentId: 'root' },
      { id: 'components', type: 'folder', name: 'components', position: { x: 200, y: 300 }, parentId: 'src' },
      { id: 'utils', type: 'folder', name: 'utils', position: { x: 400, y: 300 }, parentId: 'src' },
      { id: 'App.tsx', type: 'file', name: 'App.tsx', position: { x: 100, y: 400 }, parentId: 'components' },
      { id: 'Header.tsx', type: 'file', name: 'Header.tsx', position: { x: 300, y: 400 }, parentId: 'components' },
      { id: 'index.ts', type: 'file', name: 'index.ts', position: { x: 400, y: 400 }, parentId: 'utils' },
      { id: 'package.json', type: 'file', name: 'package.json', position: { x: 500, y: 200 }, parentId: 'root' },
      { id: 'README.md', type: 'file', name: 'README.md', position: { x: 600, y: 200 }, parentId: 'root' },
    ];
    
    const sampleEdges: Edge[] = [
      { id: 'e1', source: 'root', target: 'src' },
      { id: 'e2', source: 'root', target: 'package.json' },
      { id: 'e3', source: 'root', target: 'README.md' },
      { id: 'e4', source: 'src', target: 'components' },
      { id: 'e5', source: 'src', target: 'utils' },
      { id: 'e6', source: 'components', target: 'App.tsx' },
      { id: 'e7', source: 'components', target: 'Header.tsx' },
      { id: 'e8', source: 'utils', target: 'index.ts' },
    ];
    
    setNodes(sampleNodes);
    setEdges(sampleEdges);
  }, [repoUrl]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  }, []);

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDraggedNode(nodeId);
  }, [nodes]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggedNode) {
      e.preventDefault();
      const chartRect = chartRef.current?.getBoundingClientRect();
      if (!chartRect) return;
      
      const x = (e.clientX - chartRect.left - dragOffset.x) / zoom - viewportOffset.x;
      const y = (e.clientY - chartRect.top - dragOffset.y) / zoom - viewportOffset.y;
      
      setNodes(prev => prev.map(node => 
        node.id === draggedNode 
          ? { ...node, position: { x, y } } 
          : node
      ));
    }
  }, [draggedNode, dragOffset, zoom, viewportOffset]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
  }, []);

  const renderEdges = useCallback(() => {
    return edges.map(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (!source || !target) return null;
      
      // Calculate path
      const sourceX = source.position.x;
      const sourceY = source.position.y + 25; // bottom of source node
      const targetX = target.position.x;
      const targetY = target.position.y;
      
      return (
        <path
          key={edge.id}
          d={`M${sourceX},${sourceY} C${sourceX},${sourceY + 50} ${targetX},${targetY - 50} ${targetX},${targetY}`}
          stroke="#9CA3AF"
          strokeWidth="2"
          fill="none"
          className="transition-all duration-200 dark:stroke-gray-600"
        />
      );
    });
  }, [edges, nodes]);

  return (
    <div className="relative h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-colors duration-200">
      <div className="absolute top-2 right-2 flex space-x-2 z-10 bg-white dark:bg-gray-800 p-1 rounded-md shadow-sm">
        <button
          onClick={handleZoomIn}
          className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Zoom in"
        >
          <PlusCircle className="h-5 w-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Zoom out"
        >
          <MinusCircle className="h-5 w-5" />
        </button>
        <span className="inline-flex items-center px-2 text-sm text-gray-600 dark:text-gray-400">
          {Math.round(zoom * 100)}%
        </span>
      </div>
      
      <div
        ref={chartRef}
        className="w-full h-full cursor-grab overflow-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="relative transition-transform duration-200"
          style={{ 
            transform: `scale(${zoom})`,
            transformOrigin: '0 0',
            width: '2000px',
            height: '1500px'
          }}
        >
          <svg 
            width="100%" 
            height="100%" 
            className="absolute top-0 left-0 pointer-events-none"
          >
            {renderEdges()}
          </svg>
          
          {nodes.map(node => (
            <div
              key={node.id}
              className={`
                absolute p-4 rounded-md shadow-sm w-48 cursor-grab 
                ${draggedNode === node.id ? 'shadow-md z-10' : ''}
                ${node.type === 'folder' ? 
                  'bg-blue-50 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800' : 
                  'bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700'}
                transition-colors duration-200
              `}
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
            >
              <div className="flex items-center">
                {node.type === 'folder' ? (
                  <Folder className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
                ) : (
                  <FileCode className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                )}
                <span className={`
                  truncate text-sm font-medium
                  ${node.type === 'folder' ? 
                    'text-blue-700 dark:text-blue-300' : 
                    'text-gray-700 dark:text-gray-300'}
                `}>
                  {node.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlowChart;