import React, { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  Grid,
  RefreshCw,
  Save,
  Download,
  Upload,
  Clipboard,
  Layers,
  Eye,
  EyeOff,
  AlignLeft,
  Settings,
  Trash,
} from "lucide-react";

type ToolbarProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onAutoLayout: () => void;
  onToggleGrid: () => void;
  onExport: () => void;
  onImport: () => void;
  onSave: () => void;
  showGrid: boolean;
};

export const CanvasTools: React.FC<ToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onAutoLayout,
  onToggleGrid,
  onExport,
  onImport,
  onSave,
  showGrid,
}) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"standard" | "timeline" | "cluster">(
    "standard",
  );

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
      {/* Main Toolbar */}
      <div
        className="bg-cyber-dark-900/90 backdrop-blur-sm border border-cyber-muted rounded-lg
        shadow-lg p-1 flex flex-col gap-1"
      >
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={onZoomIn}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-cyber-blue/20 text-white"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={onZoomOut}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-cyber-blue/20 text-white"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
        </div>

        <div className="border-t border-cyber-muted my-1"></div>

        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={onAutoLayout}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-cyber-blue/20 text-white"
            title="Auto Layout"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={onToggleGrid}
            className={`w-8 h-8 flex items-center justify-center rounded 
              ${showGrid ? "bg-cyber-blue/30" : "hover:bg-cyber-blue/20"} text-white`}
            title="Toggle Grid"
          >
            <Grid size={16} />
          </button>
        </div>
      </div>

      {/* View Modes */}
      <div
        className="bg-cyber-dark-900/90 backdrop-blur-sm border border-cyber-muted rounded-lg
        shadow-lg p-1"
      >
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setViewMode("standard")}
            className={`w-8 h-8 flex items-center justify-center rounded 
              ${viewMode === "standard" ? "bg-cyber-blue/30" : "hover:bg-cyber-blue/20"} text-white`}
            title="Standard View"
          >
            <Layers size={16} />
          </button>
          <button
            onClick={() => setViewMode("timeline")}
            className={`w-8 h-8 flex items-center justify-center rounded 
              ${viewMode === "timeline" ? "bg-cyber-blue/30" : "hover:bg-cyber-blue/20"} text-white`}
            title="Timeline View"
          >
            <AlignLeft size={16} />
          </button>
          <button
            onClick={() => setViewMode("cluster")}
            className={`w-8 h-8 flex items-center justify-center rounded 
              ${viewMode === "cluster" ? "bg-cyber-blue/30" : "hover:bg-cyber-blue/20"} text-white`}
            title="Cluster View"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      {/* File Operations */}
      <div
        className="bg-cyber-dark-900/90 backdrop-blur-sm border border-cyber-muted rounded-lg
        shadow-lg p-1"
      >
        <div className="flex flex-col gap-1">
          <button
            onClick={onSave}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-cyber-blue/20 text-white"
            title="Save"
          >
            <Save size={16} />
          </button>
          <button
            onClick={onExport}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-cyber-blue/20 text-white"
            title="Export"
          >
            <Download size={16} />
          </button>
          <button
            onClick={onImport}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-cyber-blue/20 text-white"
            title="Import"
          >
            <Upload size={16} />
          </button>
        </div>
      </div>

      {/* Settings */}
      <div
        className="bg-cyber-dark-900/90 backdrop-blur-sm border border-cyber-muted rounded-lg
        shadow-lg p-1"
      >
        <button
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-cyber-blue/20 text-white"
          title="Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </div>
  );
};
