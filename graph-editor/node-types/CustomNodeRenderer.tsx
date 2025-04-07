import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { ValidationError } from "../../src/lib/store/editor-store";

// Mock icon components since we don't have lucide-react installed
const IconComponent = ({ className }: any) => (
  <span className={className}>📎</span>
);

// Node type icons
const MessageSquare = IconComponent;
const GitBranch = IconComponent;
const Network = IconComponent;
const Code = IconComponent;
const BrainCircuit = IconComponent;

// Validation icons
const WarningIcon = ({ className }: any) => (
  <span className={`${className} text-yellow-500`}>⚠️</span>
);

const ErrorIcon = ({ className }: any) => (
  <span className={`${className} text-red-500`}>❌</span>
);

const getNodeIcon = (type: string) => {
  switch (type) {
    case "dialogue":
      return <MessageSquare className="h-4 w-4 mr-2" />;
    case "decision":
      return <GitBranch className="h-4 w-4 mr-2" />;
    case "condition":
      return <Network className="h-4 w-4 mr-2" />;
    case "logic":
      return <Code className="h-4 w-4 mr-2" />;
    case "memory":
      return <BrainCircuit className="h-4 w-4 mr-2" />;
    default:
      return null;
  }
};

const getNodeColor = (type: string) => {
  switch (type) {
    case "dialogue":
      return "bg-blue-900/60 border-blue-500/70";
    case "decision":
      return "bg-purple-900/60 border-purple-500/70";
    case "condition":
      return "bg-yellow-900/60 border-yellow-500/70";
    case "logic":
      return "bg-green-900/60 border-green-500/70";
    case "memory":
      return "bg-red-900/60 border-red-500/70";
    default:
      return "bg-gray-900/60 border-gray-500/70";
  }
};

// For displaying validation status
const getValidationStatus = (errors?: ValidationError[]) => {
  if (!errors || errors.length === 0) return null;

  const errorCount = errors.filter((e) => e.severity === "error").length;
  const warningCount = errors.filter((e) => e.severity === "warning").length;

  if (errorCount > 0) {
    return {
      icon: <ErrorIcon className="h-4 w-4" />,
      text: `${errorCount} error${errorCount !== 1 ? "s" : ""}`,
      cssClass: "text-red-500",
    };
  }

  if (warningCount > 0) {
    return {
      icon: <WarningIcon className="h-4 w-4" />,
      text: `${warningCount} warning${warningCount !== 1 ? "s" : ""}`,
      cssClass: "text-yellow-500",
    };
  }

  return null;
};

interface CustomNodeRendererProps {
  data: {
    id: string;
    type: string;
    label: string;
    content?: string;
    choices?: Array<{
      text: string;
      nextNodeId?: string;
    }>;
    errors?: ValidationError[];
    selected?: boolean;
    errorClass?: string;
    attributes?: {
      description?: string;
      name?: string;
      groupId?: string;
      [key: string]: any;
    };
  };
  selected?: boolean;
  isConnectable?: boolean;
}

const CustomNodeRenderer = ({
  data,
  selected,
  isConnectable = true,
}: CustomNodeRendererProps) => {
  const type = data.type;
  const nodeColorClass = getNodeColor(type);
  const icon = getNodeIcon(type);
  const validationStatus = getValidationStatus(data.errors);

  return (
    <div
      className={`p-4 rounded-md border shadow-md min-w-40 ${nodeColorClass} ${data.errorClass || ""} ${selected ? "ring-2 ring-white" : ""}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-orange-500"
        isConnectable={isConnectable}
      />

      {/* Node header with type icon and label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon}
          <div className="font-semibold text-sm truncate">{data.label}</div>
        </div>

        {/* Validation status */}
        {validationStatus && (
          <div
            className={`text-xs flex items-center ${validationStatus.cssClass}`}
            title="Node has validation issues"
          >
            {validationStatus.icon}
            <span className="ml-1">{validationStatus.text}</span>
          </div>
        )}
      </div>

      {/* Node content preview */}
      <div className="text-xs text-gray-300 mt-1 line-clamp-2">
        {data.content?.substring(0, 60) || data.attributes?.description || ""}
        {data.content?.length > 60 ? "..." : ""}
      </div>

      {/* Node type-specific content */}
      {type === "dialogue" && (
        <div className="mt-2 text-xs text-blue-300">Dialogue</div>
      )}

      {/* Decision choices preview */}
      {type === "decision" && data.choices && (
        <div className="mt-2 text-xs text-green-300">
          {data.choices.length} choice{data.choices.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* Group indicator */}
      {data.attributes?.groupId && (
        <div className="mt-2 text-xs text-orange-300 truncate">
          Group: {data.attributes.groupId.substring(0, 8)}
        </div>
      )}

      {/* Node ID - useful for debugging */}
      <div className="mt-2 text-xs text-gray-500 font-mono">
        ID: {data.id.substring(0, 8)}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-orange-500"
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default memo(CustomNodeRenderer);
