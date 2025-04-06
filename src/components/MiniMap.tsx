import React, { useEffect, useRef } from 'react';
import { useEditorStore, Node, Connection } from '@/lib/store/editor-store';

interface MiniMapProps {
  width: number;
  height: number;
  scale: number;
  onViewportChange: (x: number, y: number) => void;
  viewport: { x: number, y: number, width: number, height: number };
}

export const MiniMap: React.FC<MiniMapProps> = ({ 
  width, 
  height, 
  scale,
  onViewportChange,
  viewport 
}) => {
  const nodes = useEditorStore(state => state.nodes);
  const connections = useEditorStore(state => state.connections);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Find min/max coordinates to determine scale
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    nodes.forEach(node => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + 200); // Node width
      maxY = Math.max(maxY, node.position.y + 50); // Node height
    });
    
    // Add padding
    minX -= 100;
    minY -= 100;
    maxX += 100;
    maxY += 100;
    
    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;
    
    // Calculate scale to fit the minimap
    const scaleX = width / graphWidth;
    const scaleY = height / graphHeight;
    const miniMapScale = Math.min(scaleX, scaleY, 1); // Cap at 1:1 scale
    
    // Draw connections
    ctx.strokeStyle = 'rgba(100, 100, 255, 0.4)';
    ctx.lineWidth = 1;
    
    connections.forEach(connection => {
      const sourceNode = nodes.find(n => n.id === connection.sourceId);
      const targetNode = nodes.find(n => n.id === connection.targetId);
      
      if (sourceNode && targetNode) {
        const sourceX = (sourceNode.position.x + 100 - minX) * miniMapScale;
        const sourceY = (sourceNode.position.y + 25 - minY) * miniMapScale;
        const targetX = (targetNode.position.x + 100 - minX) * miniMapScale;
        const targetY = (targetNode.position.y + 25 - minY) * miniMapScale;
        
        ctx.beginPath();
        ctx.moveTo(sourceX, sourceY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();
      }
    });
    
    // Draw nodes
    nodes.forEach(node => {
      const x = (node.position.x - minX) * miniMapScale;
      const y = (node.position.y - minY) * miniMapScale;
      const nodeWidth = 200 * miniMapScale;
      const nodeHeight = 50 * miniMapScale;
      
      ctx.fillStyle = 'rgba(50, 50, 70, 0.8)';
      ctx.fillRect(x, y, nodeWidth, nodeHeight);
      
      switch (node.type) {
        case 'character':
          ctx.fillStyle = 'rgba(0, 100, 255, 0.6)';
          break;
        case 'location': 
          ctx.fillStyle = 'rgba(0, 200, 100, 0.6)';
          break;
        case 'event':
          ctx.fillStyle = 'rgba(255, 100, 0, 0.6)';
          break;
        default:
          ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
      }
      
      ctx.fillRect(x, y, nodeWidth * 0.2, nodeHeight);
    });
    
    // Draw viewport rectangle
    const viewportX = (viewport.x - minX) * miniMapScale;
    const viewportY = (viewport.y - minY) * miniMapScale;
    const viewportWidth = viewport.width * miniMapScale;
    const viewportHeight = viewport.height * miniMapScale;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);
    
  }, [nodes, connections, width, height, scale, viewport]);
  
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate the corresponding position in the main canvas
    onViewportChange(x / scale, y / scale);
  };
  
  return (
    <div className="absolute bottom-4 right-4 z-10 bg-cyber-dark-900/80 backdrop-blur-sm
      border border-cyber-muted rounded-lg overflow-hidden shadow-lg">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleClick}
        className="cursor-pointer"
      />
    </div>
  );
};