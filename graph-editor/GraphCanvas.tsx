import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Connection,
  Node as ReactFlowNode,
  NodeMouseHandler,
  ReactFlowInstance,
  getViewport
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Paper, Typography, IconButton } from '@mui/material';
import { AddIcon } from '@mui/icons-material';

import { useEditorStore, Node, ValidationError } from '../src/lib/store/editor-store';
import CustomNodeRenderer from './node-types/CustomNodeRenderer';
import { layoutEntireGraph } from '../src/lib/graph/auto-layout';
import { exportGraphToJSON, exportGraphToSVG } from '../src/lib/graph/io-utils';
import { findNodesWithErrors } from '../src/lib/graph/search-utils';

// Node colors based on type
const nodeColors: Record<string, string> = {
  dialogue: '#3b82f6',  // blue-500
  decision: '#10b981',  // green-500
  condition: '#8b5cf6', // purple-500
  logic: '#f59e0b',     // amber-500
  memory: '#ec4899',    // pink-500
  DEFAULT: '#6b7280'    // gray-500
};

// Define node types
const nodeTypes = {
  dialogue: CustomNodeRenderer,
  condition: CustomNodeRenderer,
  logic: CustomNodeRenderer,
  decision: CustomNodeRenderer,
  memory: CustomNodeRenderer
};

// Function to get node error border styling
const getNodeErrorStyle = (errors?: ValidationError[]) => {
  if (!errors || errors.length === 0) return '';
  
  const hasErrors = errors.some(err => err.severity === 'error');
  const hasWarnings = errors.some(err => err.severity === 'warning');
  
  if (hasErrors) return 'ring-2 ring-red-500';
  if (hasWarnings) return 'ring-2 ring-yellow-500';
  return '';
};

const GraphCanvas = () => {
  const { 
    nodes: storeNodes, 
    edges: storeEdges, 
    addEdge: addStoreEdge,
    selectNode,
    selectedNodeIds,
    deselectAllNodes,
    autoLayout: applyAutoLayout,
    undo,
    redo,
    history,
    exportToJSON,
    validateAllNodes,
    groups
  } = useEditorStore();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  // Save SVG reference
  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
    
    // Get SVG element
    const flowEl = document.querySelector('.react-flow');
    if (flowEl) {
      const svg = flowEl.querySelector('svg');
      if (svg) {
        svgRef.current = svg;
      }
    }
  }, []);

  // Convert store nodes to ReactFlow nodes
  useEffect(() => {
    const flowNodes = storeNodes.map(node => ({
      id: node.id,
      type: node.type,
      data: { 
        ...node,
        label: node.attributes?.name || node.id,
        selected: selectedNodeIds.includes(node.id),
        errorClass: getNodeErrorStyle(node.errors)
      },
      position: node.position || { x: 0, y: 0 },
      selected: selectedNodeIds.includes(node.id),
      // Add group styling if the node is part of a group
      className: node.attributes?.groupId ? `group-${node.attributes.groupId}` : undefined
    }));
    
    setNodes(flowNodes);
  }, [storeNodes, selectedNodeIds]);
  
  // Convert store edges to ReactFlow edges
  useEffect(() => {
    const flowEdges = storeEdges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: edge.animated || false,
      style: { stroke: '#ff4500', strokeWidth: 2 },
      label: edge.label,
      data: {
        relationship: edge.relationship
      }
    }));
    
    setEdges(flowEdges);
  }, [storeEdges]);
  
  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for ctrl/cmd + z (undo)
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      
      // Check for ctrl/cmd + shift + z or ctrl/cmd + y (redo)
      if (((event.ctrlKey || event.metaKey) && event.key === 'y') || 
          ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z')) {
        event.preventDefault();
        redo();
      }
      
      // Check for delete/backspace on selected nodes
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeIds.length > 0) {
        event.preventDefault();
        // Handle node deletion
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, selectedNodeIds]);
  
  // Handle connecting nodes
  const onConnect = useCallback((params: Connection) => {
    // Add edge to store
    if (params.source && params.target) {
      addStoreEdge({
        id: `edge-${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        relationship: 'connected-to'
      });
    }
  }, [addStoreEdge]);
  
  // Handle node selection
  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    // Multi-select with shift key
    const multiSelect = event.shiftKey || event.metaKey || event.ctrlKey;
    selectNode(node.id, multiSelect);
  }, [selectNode]);
  
  // Deselect when clicking on the canvas
  const onPaneClick = useCallback(() => {
    deselectAllNodes();
  }, [deselectAllNodes]);
  
  // Track connection state
  const onConnectStart = useCallback((_, { nodeId }) => {
    setConnectingNodeId(nodeId || null);
  }, []);
  
  const onConnectEnd = useCallback(() => {
    setConnectingNodeId(null);
  }, []);
  
  // Apply auto-layout
  const handleAutoLayout = useCallback(() => {
    applyAutoLayout();
  }, [applyAutoLayout]);
  
  // Export functions
  const handleExportJSON = useCallback(() => {
    const jsonData = exportToJSON();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and click it
    const link = document.createElement('a');
    link.href = url;
    link.download = 'graph-export.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [exportToJSON]);
  
  const handleExportSVG = useCallback(() => {
    if (svgRef.current) {
      exportGraphToSVG(svgRef.current, 'graph-export.svg');
    }
  }, []);
  
  // Validate nodes
  const handleValidateGraph = useCallback(() => {
    const errors = validateAllNodes();
    setShowValidationErrors(true);
    
    // Count errors
    let errorCount = 0;
    let warningCount = 0;
    
    Object.values(errors).forEach(nodeErrors => {
      nodeErrors.forEach(error => {
        if (error.severity === 'error') errorCount++;
        if (error.severity === 'warning') warningCount++;
      });
    });
    
    return { errorCount, warningCount };
  }, [validateAllNodes]);
  
  // Handle node drag updates
  const onNodeDragStop = useCallback((event: React.MouseEvent, node: ReactFlowNode) => {
    // Update node position in store
    const { x, y } = node.position;
    useEditorStore.getState().updateNode(node.id, {
      position: { x, y }
    });
  }, []);

  return (
    <Paper elevation={3} className="p-4">
      <Typography variant="h6">Graph Canvas</Typography>
      <div className="canvas-content">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          onInit={onInit}
          fitView
          minZoom={0.1}
          maxZoom={2}
          className="bg-black"
          nodesDraggable={true}
          multiSelectionKeyCode={['Meta', 'Shift', 'Control']}
        >
          <Background
            color="#ffffff"
            gap={16}
            className="bg-black"
            variant={BackgroundVariant.Dots}
            size={1}
            style={{ opacity: 0.1 }}
          />
          <MiniMap
            nodeColor={(node) => {
              // Show validation errors in the minimap
              if (showValidationErrors && node.data?.errors?.length > 0) {
                const hasError = node.data.errors.some((e: ValidationError) => e.severity === 'error');
                if (hasError) return '#ef4444'; // red-500
              }
              
              const type = node.type as string || 'default';
              return nodeColors[type] || nodeColors.DEFAULT;
            }}
            className="bg-black/60 border border-orange-500/30"
            maskColor="rgba(0, 0, 0, 0.6)"
            nodeStrokeColor="#ff4500"
            nodeStrokeWidth={3}
          />
          <Controls className="bg-black/80 border border-orange-500/30" />
          
          {/* Top toolbar */}
          <Panel position="top-center" className="bg-black/80 p-2 rounded border border-orange-500/30 flex gap-2">
            <button 
              onClick={handleAutoLayout}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-white text-xs"
              title="Auto-Layout Graph"
            >
              Auto Layout
            </button>
            
            <button 
              onClick={undo}
              disabled={!history.canUndo}
              className={`px-2 py-1 rounded text-white text-xs ${
                history.canUndo ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-900 text-gray-600 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              Undo
            </button>
            
            <button 
              onClick={redo}
              disabled={!history.canRedo}
              className={`px-2 py-1 rounded text-white text-xs ${
                history.canRedo ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-900 text-gray-600 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Shift+Z)"
            >
              Redo
            </button>
            
            <div className="h-4 border-r border-gray-600 mx-1"></div>
            
            <button 
              onClick={handleValidateGraph}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-white text-xs"
              title="Validate Graph"
            >
              Validate
            </button>
            
            <div className="h-4 border-r border-gray-600 mx-1"></div>
            
            <button 
              onClick={handleExportJSON}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-white text-xs"
              title="Export as JSON"
            >
              Export JSON
            </button>
            
            <button 
              onClick={handleExportSVG}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-white text-xs"
              title="Export as SVG"
            >
              Export SVG
            </button>
          </Panel>
          
          {/* Stats panel */}
          <Panel position="top-left" className="bg-black/60 p-2 rounded border border-orange-500/30">
            <div className="text-xs text-orange-500 font-mono">
              <div>{nodes.length} nodes • {edges.length} edges</div>
              {groups.length > 0 && <div>{groups.length} groups</div>}
              {showValidationErrors && (
                <div className="mt-1">
                  {findNodesWithErrors(storeNodes).length} nodes with errors
                </div>
              )}
            </div>
          </Panel>
          
          {/* Search panel */}
          <Panel position="top-right" className="bg-black/60 p-2 rounded border border-orange-500/30">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white w-40"
              />
              <button 
                className="ml-2 bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-xs text-white"
                onClick={() => {
                  useEditorStore.getState().setSearchQuery(searchQuery);
                }}
              >
                Search
              </button>
            </div>
          </Panel>
          
          {/* Selection info */}
          {selectedNodeIds.length > 0 && (
            <Panel position="bottom-left" className="bg-black/60 p-2 rounded border border-orange-500/30">
              <div className="text-xs text-white">
                {selectedNodeIds.length === 1 ? '1 node selected' : `${selectedNodeIds.length} nodes selected`}
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>
      <IconButton color="primary">
        <AddIcon />
      </IconButton>
    </Paper>
  );
};

export default GraphCanvas;
