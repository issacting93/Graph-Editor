import React, { useState } from "react";
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
} from "lucide-react";

type NodeType =
  | "character"
  | "location"
  | "event"
  | "memory"
  | "item"
  | "dialogue"
  | "choice"
  | "condition"
  | "audio"
  | "knowledge"
  | "branch";

type Category = "entities" | "interactions" | "logic" | "media";

const nodeIcons: Record<
  NodeType,
  React.ComponentType<{ className?: string }>
> = {
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

const nodeCategories: Record<Category, NodeType[]> = {
  entities: ["character", "location", "item"],
  interactions: ["dialogue", "choice", "event"],
  logic: ["condition", "branch", "knowledge"],
  media: ["audio", "memory"],
};

const nodeImportance: Record<NodeType, "high" | "medium" | "low"> = {
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

const categoryLabels: Record<Category, string> = {
  entities: "Entities",
  interactions: "Interactions",
  logic: "Logic",
  media: "Media",
};

export const EditorSidebar: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("entities");

  const handleDragStart = (e: React.DragEvent, type: NodeType) => {
    const dragImage = document.createElement("div");
    dragImage.className = `bg-dark-800 ${getNodeBorder(type)} w-[200px] h-[50px] rounded-lg p-2 
      flex items-center space-x-2 opacity-75 shadow-lg transform scale-105`;

    const Icon = nodeIcons[type];
    dragImage.innerHTML = `
      <div class="flex items-center space-x-2">
        <div class="w-6 h-6 text-white">${Icon.toString()}</div>
        <div class="text-white font-medium uppercase text-sm">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
      </div>
    `;

    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 100, 25);
    e.dataTransfer.setData("application/json", JSON.stringify({ type }));

    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragEnd = () => {
    // Provide feedback when a node is successfully dropped
    console.log("Node dropped successfully");
  };

  const getNodeBorder = (type: NodeType) => {
    const importance = nodeImportance[type];
    switch (importance) {
      case "high":
        return "border-2 border-blue-500";
      case "medium":
        return "border-2 border-green-500";
      case "low":
        return "border-2 border-yellow-500";
    }
  };

  const NodeTemplate: React.FC<{ type: NodeType; label: string }> = ({
    type,
    label,
  }) => {
    const Icon = nodeIcons[type];
    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, type)}
        onDragEnd={handleDragEnd}
        className={`bg-dark-800 ${getNodeBorder(type)} w-[200px] h-[50px] rounded-lg p-2 cursor-move 
          hover:ring-2 hover:ring-white transition-all duration-200 mb-4 flex items-center space-x-2`}
      >
        <Icon className="w-6 h-6 text-white" />
        <div className="flex-1">
          <div className="text-white font-medium uppercase text-sm">
            {label}
          </div>
          <div className="text-white/70 text-xs">Drag to add</div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-64 h-full bg-dark-900 p-4 overflow-y-auto border-r border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-white uppercase tracking-wider">
        Node Types
      </h2>

      {/* Category Tabs */}
      <div className="flex space-x-1 mb-4">
        {Object.entries(categoryLabels).map(([category, label]) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category as Category)}
            className={`px-3 py-1 text-sm font-mono uppercase tracking-wider
              ${
                activeCategory === category
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Node Templates */}
      <div className="space-y-2">
        {nodeCategories[activeCategory].map((type) => (
          <NodeTemplate
            key={type}
            type={type}
            label={type.charAt(0).toUpperCase() + type.slice(1)}
          />
        ))}
      </div>
    </div>
  );
};
