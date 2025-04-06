import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore, Node, Connection, ConnectionType } from '@/lib/store/editor-store';
import { 
  User, 
  MapPin, 
  Calendar, 
  Brain, 
  Package, 
  MessageSquare, 
  GitBranch, 
  FileCode, 
  HardDrive, 
  CircuitBoard, 
  Network 
} from 'lucide-react';
import { ConnectionHandle } from './ConnectionHandle';
import { ConnectionLine } from './ConnectionLine';

const nodeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  character: User,
  location: MapPin,
  event: Calendar,
  memory: Brain,
  item: Package,
  dialogue: MessageSquare,
  choice: GitBranch,
  condition: FileCode,
  audio: HardDrive,
  knowledge: CircuitBoard,
  branch: Network,
};

const nodeImportance: Record<string, 'high' | 'medium' | 'low'> = {
  character: 'high',
  location: 'high',
  event: 'medium',
  memory: 'medium',
  item: 'low',
  dialogue: 'medium',
  choice: 'medium',
  condition: 'low',
  audio: 'low',
  knowledge: 'high',
  branch: 'medium',
};

const GRID_SIZE = 40; // Increased grid size for better spacing
const SNAP_THRESHOLD = 20; // Distance threshold for snapping

export const GraphCanvas: React.FC = () => {
  const nodes = useEditorStore((state) => state.nodes);
  const connections = useEditorStore((state) => state.connections);
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const selectedConnectionId = useEditorStore((state) => state.selectedConnectionId);
  const setSelectedNodeId = useEditorStore((state) => state.setSelectedNodeId);
  const setSelectedConnectionId = useEditorStore((state) => state.setSelectedConnectionId);
  const addConnection = useEditorStore((state) => state.addConnection);
  const addNode = useEditorStore((state) => state.addNode);
  
  const [dropPreview, setDropPreview] = useState<{ x: number; y: number } | null>(null);
  const [isSnapping, setIsSnapping] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{ nodeId: string; x: number; y: number } | null>(null);
  const [connectionEnd, setConnectionEnd] = useState<{ x: number; y: number } | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const getNodeStyle = (type: string) => {
    const importance = nodeImportance[type];
    switch (importance) {
      case 'high':
        return 'border-2 border-blue-500 shadow-lg';
      case 'medium':
        return 'border-2 border-green-500 shadow-md';
      case 'low':
        return 'border-2 border-yellow-500 shadow-sm';
    }
  };

  const getConnectionStyle = (type: ConnectionType) => {
    switch (type) {
      case 'causal':
        return 'stroke-blue-500';
      case 'temporal':
        return 'stroke-green-500';
      case 'conditional':
        return 'stroke-yellow-500';
      case 'reference':
        return 'stroke-purple-500';
    }
  };

  const getNodeBorder = (type: string) => {
    const importance = nodeImportance[type];
    switch (importance) {
      case 'high':
        return 'border-2 border-cyber-red';
      case 'medium':
        return 'border-2 border-cyber-blue';
      case 'low':
        return 'border-2 border-cyber-pink';
    }
  };

  const getNodeGlow = (type: string) => {
    const importance = nodeImportance[type];
    switch (importance) {
      case 'high':
        return 'glow-red';
      case 'medium':
        return 'glow-blue';
      case 'low':
        return 'glow-pink';
    }
  };

  const snapToGrid = (x: number, y: number) => {
    const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;
    return { x: snappedX, y: snappedY };
  };

  const findNearestNode = (x: number, y: number): Node | null => {
    let nearestNode: Node | null = null;
    let minDistance = SNAP_THRESHOLD;

    nodes.forEach(node => {
      const dx = node.position.x - x;
      const dy = node.position.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestNode = node;
      }
    });

    return nearestNode;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const nearestNode = findNearestNode(x, y);
    if (nearestNode) {
      setIsSnapping(true);
      setDropPreview({
        x: nearestNode.position.x,
        y: nearestNode.position.y + GRID_SIZE
      });
    } else {
      setIsSnapping(false);
      const snapped = snapToGrid(x, y);
      setDropPreview(snapped);
    }
  };

  const handleDragLeave = () => {
    setDropPreview(null);
    setIsSnapping(false);
  };

  const validateNodeData = (data: any): data is Node => {
    if (!data || typeof data.type !== 'string') {
      console.error('Invalid node data format');
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const jsonData = e.dataTransfer.getData('application/json');
      if (!jsonData) {
        console.error('No data was transferred');
        return;
      }
      
      const data = JSON.parse(jsonData);
      if (!validateNodeData(data)) {
        return;
      }
      
      if (dropPreview) {
        const newNode: Node = {
          id: crypto.randomUUID(),
          type: data.type,
          position: dropPreview,
          attributes: data.attributes || {},
          content: data.content || '',
          choices: data.choices || [],
          errors: [],
          selected: false
        };
        
        addNode(newNode);
        setDropPreview(null);
      }
    } catch (error) {
      console.error('Error parsing node data:', error);
    }
  };

  const validateConnectionData = (sourceId: string, targetId: string): boolean => {
    if (sourceId === targetId) {
      console.error('Cannot connect a node to itself');
      return false;
    }
    return true;
  };

  const handleConnectionStart = (e: React.MouseEvent, nodeId: string, position: 'top' | 'right' | 'bottom' | 'left') => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    let startX = node.position.x;
    let startY = node.position.y;

    // Adjust start position based on handle position
    switch (position) {
      case 'top':
        startX += 100;
        startY += 0;
        break;
      case 'right':
        startX += 200;
        startY += 25;
        break;
      case 'bottom':
        startX += 100;
        startY += 50;
        break;
      case 'left':
        startX += 0;
        startY += 25;
        break;
    }

    setIsConnecting(true);
    setConnectionStart({ nodeId, x: startX, y: startY });
    setConnectionEnd({ x: startX, y: startY });
  };

  const handleConnectionMove = (e: React.MouseEvent) => {
    if (!isConnecting || !connectionStart) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setConnectionEnd({ x, y });
  };

  const handleConnectionEnd = (e: React.MouseEvent) => {
    if (!isConnecting || !connectionStart) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find the nearest node
    const nearestNode = findNearestNode(x, y);
    if (nearestNode && validateConnectionData(connectionStart.nodeId, nearestNode.id)) {
      // Create a new connection
      const newConnection: Connection = {
        id: crypto.randomUUID(),
        sourceId: connectionStart.nodeId,
        targetId: nearestNode.id,
        type: 'causal', // Default type
        label: 'Causes',
      };
      addConnection(newConnection);
    }

    setIsConnecting(false);
    setConnectionStart(null);
    setConnectionEnd(null);
  };

  useEffect(() => {
    if (isConnecting) {
      window.addEventListener('mousemove', handleConnectionMove as any);
      window.addEventListener('mouseup', handleConnectionEnd as any);
      return () => {
        window.removeEventListener('mousemove', handleConnectionMove as any);
        window.removeEventListener('mouseup', handleConnectionEnd as any);
      };
    }
  }, [isConnecting, connectionStart]);

  return (
    <div 
      ref={canvasRef}
      className="w-full h-full relative bg-dark-900"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* SVG for connections */}
      <svg className="absolute inset-0 pointer-events-none">
        {/* Existing connections */}
        {connections.map((connection) => {
          const sourceNode = nodes.find(n => n.id === connection.sourceId);
          const targetNode = nodes.find(n => n.id === connection.targetId);
          if (!sourceNode || !targetNode) return null;

          return (
            <ConnectionLine
              key={connection.id}
              sourceX={sourceNode.position.x + 100}
              sourceY={sourceNode.position.y + 25}
              targetX={targetNode.position.x + 100}
              targetY={targetNode.position.y + 25}
              type={connection.type}
              label={connection.label}
              isSelected={connection.id === selectedConnectionId}
              onClick={() => setSelectedConnectionId(connection.id)}
            />
          );
        })}

        {/* Active connection being drawn */}
        {isConnecting && connectionStart && connectionEnd && (
          <ConnectionLine
            sourceX={connectionStart.x}
            sourceY={connectionStart.y}
            targetX={connectionEnd.x}
            targetY={connectionEnd.y}
            type="causal"
          />
        )}
      </svg>

      {/* Drop Preview */}
      {dropPreview && (
        <div 
          className={`absolute border-2 ${isSnapping ? 'border-blue-500' : 'border-red-500'} 
            ${isSnapping ? 'bg-blue-500/10' : 'bg-red-500/10'} 
            w-[200px] h-[50px] rounded-lg pointer-events-none
            transition-all duration-200
            ${isSnapping ? 'scale-105' : 'scale-100'}`}
          style={{
            left: `${dropPreview.x}px`,
            top: `${dropPreview.y}px`,
          }}
        >
          {isSnapping && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            </div>
          )}
        </div>
      )}

      {/* Grid Lines */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: Math.ceil(window.innerWidth / GRID_SIZE) }).map((_, i) => (
          <div 
            key={`v-${i}`}
            className="absolute top-0 bottom-0 w-px bg-gray-700/5"
            style={{ left: `${i * GRID_SIZE}px` }}
          />
        ))}
        {Array.from({ length: Math.ceil(window.innerHeight / GRID_SIZE) }).map((_, i) => (
          <div 
            key={`h-${i}`}
            className="absolute left-0 right-0 h-px bg-gray-700/5"
            style={{ top: `${i * GRID_SIZE}px` }}
          />
        ))}
      </div>

      {/* Grid Points */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: Math.ceil(window.innerWidth / GRID_SIZE) }).map((_, i) => (
          Array.from({ length: Math.ceil(window.innerHeight / GRID_SIZE) }).map((_, j) => (
            <div 
              key={`point-${i}-${j}`}
              className="absolute w-1 h-1 rounded-full bg-gray-700/10"
              style={{ 
                left: `${i * GRID_SIZE - 0.5}px`,
                top: `${j * GRID_SIZE - 0.5}px`
              }}
            />
          ))
        ))}
      </div>

      {nodes.map((node) => {
        const Icon = nodeIcons[node.type];
        return (
          <div
            key={node.id}
            className={`bg-dark-800 ${getNodeStyle(node.type)}
              w-[200px] h-[50px] rounded-lg p-2 cursor-pointer absolute transition-all duration-200
              ${selectedNodeId === node.id ? 'ring-2 ring-white scale-105' : ''}
              hover:scale-105 hover:z-10`}
            style={{
              left: `${node.position.x}px`,
              top: `${node.position.y}px`,
            }}
            onClick={() => setSelectedNodeId(node.id)}
          >
            <div className="flex items-center space-x-2 h-full">
              <Icon className="w-6 h-6 text-white" />
              <div className="flex-1">
                <div className="text-white font-medium uppercase text-sm">
                  {node.attributes?.name || `Node ${node.id.slice(0, 4)}`}
                </div>
                {node.content && (
                  <div className="text-white/70 text-xs truncate">
                    {node.content}
                  </div>
                )}
              </div>
            </div>

            {/* Connection handles */}
            <ConnectionHandle
              position="top"
              onMouseDown={(e) => handleConnectionStart(e, node.id, 'top')}
              isConnecting={isConnecting}
            />
            <ConnectionHandle
              position="right"
              onMouseDown={(e) => handleConnectionStart(e, node.id, 'right')}
              isConnecting={isConnecting}
            />
            <ConnectionHandle
              position="bottom"
              onMouseDown={(e) => handleConnectionStart(e, node.id, 'bottom')}
              isConnecting={isConnecting}
            />
            <ConnectionHandle
              position="left"
              onMouseDown={(e) => handleConnectionStart(e, node.id, 'left')}
              isConnecting={isConnecting}
            />
          </div>
        );
      })}
    </div>
  );
}; 