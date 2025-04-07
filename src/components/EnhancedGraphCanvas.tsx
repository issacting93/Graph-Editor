import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  useEditorStore,
  Node,
  Connection,
  ConnectionType,
} from "@/lib/store/editor-store";
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
  Network,
  ZoomIn,
  ZoomOut,
  Eye,
} from "lucide-react";
import { CanvasTools } from "./CanvasTools";
import { MiniMap } from "./MiniMap";

// Node icons mapping
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

// Node importance styling
const nodeImportance: Record<string, "high" | "medium" | "low"> = {
  character: "high",
  location: "high",
  event: "medium",
  memory: "medium",
  item: "low",
  dialogue: "medium",
  choice: "medium",
  condition: "low",
  audio: "low",
  knowledge: "high",
  branch: "medium",
};

// Grid and snapping settings
const GRID_SIZE = 40;
const SNAP_THRESHOLD = 20;

export const EnhancedGraphCanvas: React.FC = () => {
  // Access store state
  const nodes = useEditorStore((state) => state.nodes);
  const connections = useEditorStore((state) => state.connections);
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const selectedConnectionId = useEditorStore(
    (state) => state.selectedConnectionId,
  );
  const setSelectedNodeId = useEditorStore((state) => state.setSelectedNodeId);
  const setSelectedConnectionId = useEditorStore(
    (state) => state.setSelectedConnectionId,
  );
  const addConnection = useEditorStore((state) => state.addConnection);
  const addNode = useEditorStore((state) => state.addNode);
  const updateNode = useEditorStore((state) => state.updateNode);

  // Canvas state
  const [dropPreview, setDropPreview] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isSnapping, setIsSnapping] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{
    nodeId: string;
    x: number;
    y: number;
  } | null>(null);
  const [connectionEnd, setConnectionEnd] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);
  const [multiSelectNodes, setMultiSelectNodes] = useState<string[]>([]);
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const [nodeContextMenu, setNodeContextMenu] = useState<{
    nodeId: string;
    x: number;
    y: number;
  } | null>(null);
  const [canvasContextMenu, setCanvasContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef({ scale, x: 0, y: 0 });

  // Update transformRef when scale or pan changes
  useEffect(() => {
    transformRef.current = { scale, x: pan.x, y: pan.y };
  }, [scale, pan]);

  // Viewport calculation for minimap
  const viewport = useMemo(() => {
    if (!canvasRef.current) return { x: 0, y: 0, width: 0, height: 0 };

    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: -pan.x / scale,
      y: -pan.y / scale,
      width: rect.width / scale,
      height: rect.height / scale,
    };
  }, [pan, scale]);

  // Get node style based on type
  const getNodeStyle = (type: string) => {
    const importance = nodeImportance[type];
    switch (importance) {
      case "high":
        return "border-2 border-cyber-red shadow-lg shadow-cyber-red/20";
      case "medium":
        return "border-2 border-cyber-blue shadow-md shadow-cyber-blue/20";
      case "low":
        return "border-2 border-cyber-pink shadow-sm shadow-cyber-pink/20";
    }
  };

  // Get connection style based on type
  const getConnectionStyle = (type: ConnectionType) => {
    switch (type) {
      case "causal":
        return "stroke-cyber-blue stroke-[2px]";
      case "temporal":
        return "stroke-cyber-green stroke-[2px]";
      case "conditional":
        return "stroke-cyber-yellow stroke-[2px] stroke-dasharray-2";
      case "reference":
        return "stroke-cyber-pink stroke-[2px] stroke-dasharray-4";
    }
  };

  // Snap position to grid
  const snapToGrid = (x: number, y: number) => {
    const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;
    return { x: snappedX, y: snappedY };
  };

  // Find nearest node
  const findNearestNode = (x: number, y: number): Node | null => {
    let nearestNode: Node | null = null;
    let minDistance = SNAP_THRESHOLD;

    nodes.forEach((node) => {
      // Transform coordinates based on pan and zoom
      const nodeX = node.position.x * scale + pan.x;
      const nodeY = node.position.y * scale + pan.y;

      const dx = nodeX - x;
      const dy = nodeY - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance) {
        minDistance = distance;
        nearestNode = node;
      }
    });

    return nearestNode;
  };

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = (x: number, y: number) => {
    return {
      x: (x - pan.x) / scale,
      y: (y - pan.y) / scale,
    };
  };

  // Convert canvas coordinates to screen coordinates
  const canvasToScreen = (x: number, y: number) => {
    return {
      x: x * scale + pan.x,
      y: y * scale + pan.y,
    };
  };

  // Handle canvas mouse down for panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Middle mouse or Alt+Left click for pan
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    } else if (e.button === 0 && !e.ctrlKey && !e.shiftKey) {
      // Left click with no modifiers
      // Clear selection unless clicking on a node
      const target = e.target as HTMLElement;
      if (!target.closest(".node")) {
        setSelectedNodeId(null);
        setSelectedConnectionId(null);
        setMultiSelectNodes([]);

        // Start selection box
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setSelectionBox({
            startX: x,
            startY: y,
            endX: x,
            endY: y,
          });
        }
      }
    }
  };

  // Handle canvas mouse move for panning
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan((prev) => ({
        x: prev.x + (e.clientX - dragStart.x),
        y: prev.y + (e.clientY - dragStart.y),
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (selectionBox) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setSelectionBox((prev) => ({
          ...prev!,
          endX: x,
          endY: y,
        }));
      }
    }
  };

  // Handle canvas mouse up
  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    if (isDragging) {
      setIsDragging(false);
    }

    if (selectionBox) {
      // Calculate selection area
      const minX = Math.min(selectionBox.startX, selectionBox.endX);
      const maxX = Math.max(selectionBox.startX, selectionBox.endX);
      const minY = Math.min(selectionBox.startY, selectionBox.endY);
      const maxY = Math.max(selectionBox.startY, selectionBox.endY);

      // Get nodes within selection
      const selectedNodes = nodes.filter((node) => {
        const screenPos = canvasToScreen(node.position.x, node.position.y);
        return (
          screenPos.x >= minX &&
          screenPos.x + 200 * scale <= maxX &&
          screenPos.y >= minY &&
          screenPos.y + 50 * scale <= maxY
        );
      });

      if (selectedNodes.length > 0) {
        setMultiSelectNodes(selectedNodes.map((node) => node.id));
        if (selectedNodes.length === 1) {
          setSelectedNodeId(selectedNodes[0].id);
        } else {
          setSelectedNodeId(null);
        }
      }

      setSelectionBox(null);
    }
  };

  // Handle mouse wheel for zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const delta = -e.deltaY;
    const scaleFactor = delta > 0 ? 1.1 : 0.9;

    // Get mouse position relative to canvas
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate new scale
    const newScale = Math.min(Math.max(scale * scaleFactor, 0.1), 5);

    // Calculate new pan position to zoom towards mouse position
    const newPanX = mouseX - (mouseX - pan.x) * (newScale / scale);
    const newPanY = mouseY - (mouseY - pan.y) * (newScale / scale);

    setScale(newScale);
    setPan({ x: newPanX, y: newPanY });
  };

  // Handle zoom in/out buttons
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev * 0.8, 0.1));
  };

  // Handle toggle grid
  const handleToggleGrid = () => {
    setShowGrid((prev) => !prev);
  };

  // Handle auto layout
  const handleAutoLayout = () => {
    // This would call the auto-layout function from auto-layout.ts
    console.log("Auto layout triggered");
  };

  // Handle drag over for node dropping
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";

    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / scale;
    const y = (e.clientY - rect.top - pan.y) / scale;

    // Check for nearby nodes to snap to
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    const nearestNode = findNearestNode(canvasX, canvasY);

    if (nearestNode) {
      setIsSnapping(true);
      setDropPreview({
        x: nearestNode.position.x,
        y: nearestNode.position.y + GRID_SIZE,
      });
    } else {
      setIsSnapping(false);
      const snapped = snapToGrid(x, y);
      setDropPreview(snapped);
    }
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setDropPreview(null);
    setIsSnapping(false);
  };

  // Validate node data
  const validateNodeData = (data: any): data is Node => {
    if (!data || typeof data.type !== "string") {
      console.error("Invalid node data format");
      return false;
    }
    return true;
  };

  // Handle drop for node creation
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const jsonData = e.dataTransfer.getData("application/json");
      if (!jsonData) {
        console.error("No data was transferred");
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
          content: data.content || "",
          choices: data.choices || [],
          errors: [],
          selected: false,
        };

        addNode(newNode);
        setDropPreview(null);
      }
    } catch (error) {
      console.error("Error parsing node data:", error);
    }
  };

  // Validate connection data
  const validateConnectionData = (
    sourceId: string,
    targetId: string,
  ): boolean => {
    if (sourceId === targetId) {
      console.error("Cannot connect a node to itself");
      return false;
    }

    const existingConnection = connections.find(
      (conn) => conn.sourceId === sourceId && conn.targetId === targetId,
    );

    if (existingConnection) {
      console.error("Connection already exists");
      return false;
    }

    return true;
  };

  // Handle node drag start
  const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDragNodeId(nodeId);
    setDragStart({ x: e.clientX, y: e.clientY });

    // If Shift key is pressed, add to multi-select
    if (e.shiftKey) {
      if (!multiSelectNodes.includes(nodeId)) {
        setMultiSelectNodes((prev) => [...prev, nodeId]);
      }
    } else if (!multiSelectNodes.includes(nodeId)) {
      // If not already in multi-select, clear and select just this node
      setMultiSelectNodes([nodeId]);
    }

    setSelectedNodeId(nodeId);
  };

  // Handle node drag
  const handleNodeDrag = (e: React.MouseEvent) => {
    if (!dragNodeId) return;

    const dx = (e.clientX - dragStart.x) / scale;
    const dy = (e.clientY - dragStart.y) / scale;

    // Move all selected nodes
    if (multiSelectNodes.length > 0) {
      multiSelectNodes.forEach((id) => {
        const node = nodes.find((n) => n.id === id);
        if (node) {
          updateNode(id, {
            position: {
              x: node.position.x + dx,
              y: node.position.y + dy,
            },
          });
        }
      });
    } else {
      const node = nodes.find((n) => n.id === dragNodeId);
      if (node) {
        updateNode(dragNodeId, {
          position: {
            x: node.position.x + dx,
            y: node.position.y + dy,
          },
        });
      }
    }

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Handle node drag end
  const handleNodeDragEnd = () => {
    setDragNodeId(null);

    // Snap all selected nodes to grid
    if (multiSelectNodes.length > 0) {
      multiSelectNodes.forEach((id) => {
        const node = nodes.find((n) => n.id === id);
        if (node) {
          const snapped = snapToGrid(node.position.x, node.position.y);
          updateNode(id, { position: snapped });
        }
      });
    }
  };

  // Handle connection start
  const handleConnectionStart = (
    e: React.MouseEvent,
    nodeId: string,
    position: "top" | "right" | "bottom" | "left",
  ) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    let startX = node.position.x;
    let startY = node.position.y;

    // Adjust start position based on handle position
    switch (position) {
      case "top":
        startX += 100;
        startY += 0;
        break;
      case "right":
        startX += 200;
        startY += 25;
        break;
      case "bottom":
        startX += 100;
        startY += 50;
        break;
      case "left":
        startX += 0;
        startY += 25;
        break;
    }

    setIsConnecting(true);
    setConnectionStart({ nodeId, x: startX, y: startY });
    setConnectionEnd({ x: startX, y: startY });
  };

  // Handle connection move
  const handleConnectionMove = (e: React.MouseEvent) => {
    if (!isConnecting || !connectionStart || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / scale;
    const y = (e.clientY - rect.top - pan.y) / scale;

    setConnectionEnd({ x, y });
  };

  // Handle connection end
  const handleConnectionEnd = (e: React.MouseEvent) => {
    if (!isConnecting || !connectionStart || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    // Find the nearest node
    const nearestNode = findNearestNode(canvasX, canvasY);
    if (
      nearestNode &&
      validateConnectionData(connectionStart.nodeId, nearestNode.id)
    ) {
      // Create a new connection
      const newConnection: Connection = {
        id: crypto.randomUUID(),
        sourceId: connectionStart.nodeId,
        targetId: nearestNode.id,
        type: "causal", // Default type
        label: "Connects to",
      };
      addConnection(newConnection);
      setSelectedConnectionId(newConnection.id);
    }

    setIsConnecting(false);
    setConnectionStart(null);
    setConnectionEnd(null);
  };

  // Handle node right-click for context menu
  const handleNodeContextMenu = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    setNodeContextMenu({
      nodeId,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Handle canvas right-click for context menu
  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!canvasRef.current) return;

    // Close any open node context menu
    setNodeContextMenu(null);

    const rect = canvasRef.current.getBoundingClientRect();
    setCanvasContextMenu({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Close context menus
  const closeContextMenus = () => {
    setNodeContextMenu(null);
    setCanvasContextMenu(null);
  };

  // Handle viewport change from minimap
  const handleViewportChange = (x: number, y: number) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    setPan({
      x: -x * scale + rect.width / 2,
      y: -y * scale + rect.height / 2,
    });
  };

  // Set up connection mousemove and mouseup handlers
  useEffect(() => {
    if (isConnecting) {
      window.addEventListener("mousemove", handleConnectionMove as any);
      window.addEventListener("mouseup", handleConnectionEnd as any);
      return () => {
        window.removeEventListener("mousemove", handleConnectionMove as any);
        window.removeEventListener("mouseup", handleConnectionEnd as any);
      };
    }

    if (dragNodeId) {
      window.addEventListener("mousemove", handleNodeDrag as any);
      window.addEventListener("mouseup", handleNodeDragEnd as any);
      return () => {
        window.removeEventListener("mousemove", handleNodeDrag as any);
        window.removeEventListener("mouseup", handleNodeDragEnd as any);
      };
    }

    // Close context menus when clicking outside
    const handleClickOutside = () => {
      closeContextMenus();
    };

    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [isConnecting, dragNodeId]);

  return (
    <div
      ref={canvasRef}
      className="w-full h-full relative bg-cyber-dark-900 overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onWheel={handleWheel}
      onContextMenu={handleCanvasContextMenu}
      tabIndex={0} // Make div focusable for keyboard events
    >
      {/* Canvas Tools */}
      <CanvasTools
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onAutoLayout={handleAutoLayout}
        onToggleGrid={handleToggleGrid}
        onExport={() => console.log("Export")}
        onImport={() => console.log("Import")}
        onSave={() => console.log("Save")}
        showGrid={showGrid}
      />

      {/* MiniMap */}
      <MiniMap
        width={200}
        height={150}
        scale={scale}
        onViewportChange={handleViewportChange}
        viewport={viewport}
      />

      {/* Canvas content with transform */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: "0 0",
          width: "100%",
          height: "100%",
        }}
      >
        {/* SVG for connections */}
        <svg className="absolute inset-0 pointer-events-none">
          {/* Existing connections */}
          {connections.map((connection) => {
            const sourceNode = nodes.find((n) => n.id === connection.sourceId);
            const targetNode = nodes.find((n) => n.id === connection.targetId);
            if (!sourceNode || !targetNode) return null;

            const sourceX = sourceNode.position.x + 100; // Center X of source node
            const sourceY = sourceNode.position.y + 25; // Center Y of source node
            const targetX = targetNode.position.x + 100; // Center X of target node
            const targetY = targetNode.position.y + 25; // Center Y of target node

            // Calculate control points for curved line
            const dx = targetX - sourceX;
            const dy = targetY - sourceY;
            const length = Math.sqrt(dx * dx + dy * dy);

            // For straight lines with a slight curve
            const curveOffset = Math.min(length * 0.2, 50);

            // Control points - add a slight curve
            const c1x =
              sourceX + dx * 0.33 + (Math.random() - 0.5) * curveOffset;
            const c1y =
              sourceY + dy * 0.33 + (Math.random() - 0.5) * curveOffset;
            const c2x =
              sourceX + dx * 0.66 + (Math.random() - 0.5) * curveOffset;
            const c2y =
              sourceY + dy * 0.66 + (Math.random() - 0.5) * curveOffset;

            // Arrow head points
            const arrowLength = 10;
            const arrowWidth = 6;
            const angle = Math.atan2(targetY - c2y, targetX - c2x);
            const arrowPoint1X =
              targetX -
              arrowLength * Math.cos(angle) +
              arrowWidth * Math.sin(angle);
            const arrowPoint1Y =
              targetY -
              arrowLength * Math.sin(angle) -
              arrowWidth * Math.cos(angle);
            const arrowPoint2X =
              targetX -
              arrowLength * Math.cos(angle) -
              arrowWidth * Math.sin(angle);
            const arrowPoint2Y =
              targetY -
              arrowLength * Math.sin(angle) +
              arrowWidth * Math.cos(angle);

            return (
              <g
                key={connection.id}
                onClick={() => setSelectedConnectionId(connection.id)}
              >
                {/* Main connection line */}
                <path
                  d={`M ${sourceX} ${sourceY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${targetX} ${targetY}`}
                  fill="none"
                  className={`${getConnectionStyle(connection.type)} 
                    ${connection.id === selectedConnectionId ? "stroke-opacity-100" : "stroke-opacity-70"}
                    ${connection.id === selectedConnectionId ? "stroke-width-3" : "stroke-width-2"}`}
                  pointerEvents="stroke"
                />

                {/* Arrow head */}
                <polygon
                  points={`${targetX},${targetY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`}
                  className={`${
                    connection.type === "causal"
                      ? "fill-cyber-blue"
                      : connection.type === "temporal"
                        ? "fill-cyber-green"
                        : connection.type === "conditional"
                          ? "fill-cyber-yellow"
                          : "fill-cyber-pink"
                  } 
                    ${connection.id === selectedConnectionId ? "opacity-100" : "opacity-70"}`}
                />

                {/* Connection label */}
                {connection.label && (
                  <text
                    x={(sourceX + targetX) / 2}
                    y={(sourceY + targetY) / 2 - 10}
                    textAnchor="middle"
                    className="fill-white text-xs font-mono"
                    style={{ pointerEvents: "none" }}
                  >
                    {connection.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Active connection being drawn */}
          {isConnecting && connectionStart && connectionEnd && (
            <path
              d={`M ${connectionStart.x} ${connectionStart.y} C ${
                connectionStart.x + (connectionEnd.x - connectionStart.x) * 0.5
              } ${connectionStart.y}, ${
                connectionStart.x + (connectionEnd.x - connectionStart.x) * 0.5
              } ${connectionEnd.y}, ${connectionEnd.x} ${connectionEnd.y}`}
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
            />
          )}
        </svg>

        {/* Grid lines if enabled */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Vertical grid lines */}
            {Array.from({ length: Math.ceil(10000 / GRID_SIZE) }).map(
              (_, i) => (
                <div
                  key={`v-${i}`}
                  className="absolute top-0 bottom-0 w-px bg-cyber-muted/5"
                  style={{ left: `${i * GRID_SIZE}px` }}
                />
              ),
            )}

            {/* Horizontal grid lines */}
            {Array.from({ length: Math.ceil(10000 / GRID_SIZE) }).map(
              (_, i) => (
                <div
                  key={`h-${i}`}
                  className="absolute left-0 right-0 h-px bg-cyber-muted/5"
                  style={{ top: `${i * GRID_SIZE}px` }}
                />
              ),
            )}

            {/* Grid points */}
            {Array.from({ length: Math.ceil(10000 / GRID_SIZE) }).map((_, i) =>
              Array.from({ length: Math.ceil(10000 / GRID_SIZE) }).map(
                (_, j) => (
                  <div
                    key={`point-${i}-${j}`}
                    className="absolute w-1 h-1 rounded-full bg-cyber-muted/10"
                    style={{
                      left: `${i * GRID_SIZE - 0.5}px`,
                      top: `${j * GRID_SIZE - 0.5}px`,
                    }}
                  />
                ),
              ),
            )}
          </div>
        )}

        {/* Nodes */}
        {nodes.map((node) => {
          const Icon = nodeIcons[node.type];
          const isSelected =
            selectedNodeId === node.id || multiSelectNodes.includes(node.id);

          return (
            <div
              key={node.id}
              className={`node bg-cyber-dark-800 ${getNodeStyle(node.type)}
                w-[200px] h-[50px] rounded-lg p-2 cursor-move absolute transition-all duration-200
                ${isSelected ? "ring-2 ring-white scale-105 z-20" : "z-10"}
                hover:scale-105 hover:z-20`}
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
                boxShadow: isSelected
                  ? "0 0 15px rgba(255, 255, 255, 0.3)"
                  : "none",
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (e.shiftKey) {
                  // Multi-select with shift key
                  if (multiSelectNodes.includes(node.id)) {
                    setMultiSelectNodes((prev) =>
                      prev.filter((id) => id !== node.id),
                    );
                  } else {
                    setMultiSelectNodes((prev) => [...prev, node.id]);
                  }
                } else {
                  // Single select
                  setSelectedNodeId(node.id);
                  if (!multiSelectNodes.includes(node.id)) {
                    setMultiSelectNodes([node.id]);
                  }
                }
              }}
              onMouseDown={(e) => {
                if (e.button === 0) {
                  // Left click
                  handleNodeDragStart(e, node.id);
                }
              }}
              onContextMenu={(e) => handleNodeContextMenu(e, node.id)}
            >
              <div className="flex items-center space-x-2 h-full">
                <Icon className="w-6 h-6 text-white" />
                <div className="flex-1">
                  <div className="text-white font-medium uppercase text-sm truncate">
                    {node.attributes?.name ||
                      `${node.type.charAt(0).toUpperCase() + node.type.slice(1)}`}
                  </div>
                  {node.content && (
                    <div className="text-white/70 text-xs truncate">
                      {node.content}
                    </div>
                  )}
                </div>
              </div>

              {/* Connection handles */}
              <div
                className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2
                  w-3 h-3 bg-cyber-blue rounded-full border border-white
                  ${isConnecting ? "opacity-100" : "opacity-0 hover:opacity-100"}`}
                onMouseDown={(e) => handleConnectionStart(e, node.id, "top")}
              />
              <div
                className={`absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2
                  w-3 h-3 bg-cyber-blue rounded-full border border-white
                  ${isConnecting ? "opacity-100" : "opacity-0 hover:opacity-100"}`}
                onMouseDown={(e) => handleConnectionStart(e, node.id, "right")}
              />
              <div
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2
                  w-3 h-3 bg-cyber-blue rounded-full border border-white
                  ${isConnecting ? "opacity-100" : "opacity-0 hover:opacity-100"}`}
                onMouseDown={(e) => handleConnectionStart(e, node.id, "bottom")}
              />
              <div
                className={`absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2
                  w-3 h-3 bg-cyber-blue rounded-full border border-white
                  ${isConnecting ? "opacity-100" : "opacity-0 hover:opacity-100"}`}
                onMouseDown={(e) => handleConnectionStart(e, node.id, "left")}
              />
            </div>
          );
        })}

        {/* Node drop preview */}
        {dropPreview && (
          <div
            className={`absolute border-2 ${
              isSnapping ? "border-cyber-blue" : "border-cyber-red"
            } ${
              isSnapping ? "bg-cyber-blue/10" : "bg-cyber-red/10"
            } w-[200px] h-[50px] rounded-lg pointer-events-none
              transition-all duration-200
              ${isSnapping ? "scale-105" : "scale-100"}`}
            style={{
              left: `${dropPreview.x}px`,
              top: `${dropPreview.y}px`,
            }}
          >
            {isSnapping && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-cyber-blue animate-pulse" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selection box */}
      {selectionBox && (
        <div
          className="absolute border border-white bg-white/10 pointer-events-none"
          style={{
            left: Math.min(selectionBox.startX, selectionBox.endX),
            top: Math.min(selectionBox.startY, selectionBox.endY),
            width: Math.abs(selectionBox.endX - selectionBox.startX),
            height: Math.abs(selectionBox.endY - selectionBox.startY),
          }}
        />
      )}

      {/* Node context menu */}
      {nodeContextMenu && (
        <div
          className="absolute z-50 bg-cyber-dark-900 border border-cyber-muted rounded-lg shadow-lg overflow-hidden"
          style={{ left: nodeContextMenu.x, top: nodeContextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-1">
            <button className="w-full text-left px-3 py-1.5 hover:bg-cyber-blue/20 text-white text-sm flex items-center">
              <Copy size={14} className="mr-2" /> Duplicate Node
            </button>
            <button className="w-full text-left px-3 py-1.5 hover:bg-cyber-blue/20 text-white text-sm flex items-center">
              <GitBranch size={14} className="mr-2" /> Add Branch From Here
            </button>
            <button className="w-full text-left px-3 py-1.5 hover:bg-cyber-blue/20 text-white text-sm flex items-center">
              <Eye size={14} className="mr-2" /> Focus On This Node
            </button>
            <div className="border-t border-cyber-muted my-1"></div>
            <button className="w-full text-left px-3 py-1.5 hover:bg-cyber-red/20 text-cyber-red text-sm flex items-center">
              <Trash2 size={14} className="mr-2" /> Delete Node
            </button>
          </div>
        </div>
      )}

      {/* Canvas context menu */}
      {canvasContextMenu && (
        <div
          className="absolute z-50 bg-cyber-dark-900 border border-cyber-muted rounded-lg shadow-lg overflow-hidden"
          style={{ left: canvasContextMenu.x, top: canvasContextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-1">
            <button className="w-full text-left px-3 py-1.5 hover:bg-cyber-blue/20 text-white text-sm flex items-center">
              <GitBranch size={14} className="mr-2" /> Create Node Here
            </button>
            <button className="w-full text-left px-3 py-1.5 hover:bg-cyber-blue/20 text-white text-sm flex items-center">
              <ZoomIn size={14} className="mr-2" /> Zoom In
            </button>
            <button className="w-full text-left px-3 py-1.5 hover:bg-cyber-blue/20 text-white text-sm flex items-center">
              <ZoomOut size={14} className="mr-2" /> Zoom Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
