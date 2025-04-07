import React, { useState } from "react";
import {
  Settings,
  Code,
  FileText,
  Bot,
  Trash2,
  Copy,
  Terminal,
  PanelRight,
  Braces,
  Pencil,
  List,
} from "lucide-react";
import { useEditorStore, Node, Connection } from "@/lib/store/editor-store";

type InspectorTab = "properties" | "json" | "markdown" | "ai";

export const Inspector: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InspectorTab>("properties");

  const nodes = useEditorStore((state) => state.nodes);
  const connections = useEditorStore((state) => state.connections);
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const selectedConnectionId = useEditorStore(
    (state) => state.selectedConnectionId,
  );
  const updateNode = useEditorStore((state) => state.updateNode);
  const updateConnection = useEditorStore((state) => state.updateConnection);
  const removeNode = useEditorStore((state) => state.removeNode);
  const removeConnection = useEditorStore((state) => state.removeConnection);

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);
  const selectedConnection = connections.find(
    (conn) => conn.id === selectedConnectionId,
  );

  const [nodeNotes, setNodeNotes] = useState<Record<string, string>>({});

  // Helper function to add a note to a node
  const addNodeNote = (nodeId: string, note: string) => {
    setNodeNotes((prev) => ({
      ...prev,
      [nodeId]: note,
    }));
  };

  // Handle attribute change for nodes
  const handleNodeAttributeChange = (key: string, value: any) => {
    if (!selectedNode) return;

    updateNode(selectedNode.id, {
      attributes: {
        ...selectedNode.attributes,
        [key]: value,
      },
    });
  };

  // Handle connection property change
  const handleConnectionPropertyChange = (key: string, value: any) => {
    if (!selectedConnection) return;

    updateConnection(selectedConnection.id, {
      properties: {
        ...selectedConnection.properties,
        [key]: value,
      },
    });
  };

  // Function to generate JSON representation
  const generateJson = () => {
    if (selectedNode) {
      return JSON.stringify(selectedNode, null, 2);
    } else if (selectedConnection) {
      return JSON.stringify(selectedConnection, null, 2);
    } else {
      return "// Select a node or connection to view JSON";
    }
  };

  // Function for AI to analyze the selected element
  const analyzeWithAI = () => {
    // This would connect to an AI service in a real implementation
    console.log("Analyzing with AI...");
  };

  return (
    <div className="h-full flex flex-col bg-cyber-dark border-l border-cyber-muted">
      <div className="border-b border-cyber-muted p-4">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4">
          {selectedNode
            ? `Node: ${selectedNode.attributes?.name || selectedNode.type}`
            : selectedConnection
              ? `Connection: ${selectedConnection.label || "Unnamed"}`
              : "Inspector"}
        </h2>

        {/* Tabs */}
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab("properties")}
            className={`px-3 py-1 text-sm font-mono uppercase tracking-wider
              ${
                activeTab === "properties"
                  ? "bg-cyber-blue text-white"
                  : "bg-cyber-dark-800 text-cyber-muted hover:bg-cyber-muted/20"
              }`}
          >
            Properties
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`px-3 py-1 text-sm font-mono uppercase tracking-wider
              ${
                activeTab === "json"
                  ? "bg-cyber-blue text-white"
                  : "bg-cyber-dark-800 text-cyber-muted hover:bg-cyber-muted/20"
              }`}
          >
            JSON
          </button>
          <button
            onClick={() => setActiveTab("markdown")}
            className={`px-3 py-1 text-sm font-mono uppercase tracking-wider
              ${
                activeTab === "markdown"
                  ? "bg-cyber-blue text-white"
                  : "bg-cyber-dark-800 text-cyber-muted hover:bg-cyber-muted/20"
              }`}
          >
            Notes
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-3 py-1 text-sm font-mono uppercase tracking-wider
              ${
                activeTab === "ai"
                  ? "bg-cyber-blue text-white"
                  : "bg-cyber-dark-800 text-cyber-muted hover:bg-cyber-muted/20"
              }`}
          >
            AI
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!selectedNode && !selectedConnection && (
          <div className="text-cyber-muted text-center mt-8">
            Select a node or connection to view details
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === "properties" && selectedNode && (
          <div className="space-y-4">
            {/* Node Type */}
            <div>
              <label className="block text-sm font-medium text-cyber-muted mb-1 uppercase tracking-wider">
                Type
              </label>
              <div className="bg-cyber-dark-800 text-white rounded px-3 py-2 font-mono">
                {selectedNode.type}
              </div>
            </div>

            {/* Node Name */}
            <div>
              <label className="block text-sm font-medium text-cyber-muted mb-1 uppercase tracking-wider">
                Name
              </label>
              <input
                type="text"
                value={selectedNode.attributes?.name || ""}
                onChange={(e) =>
                  handleNodeAttributeChange("name", e.target.value)
                }
                className="w-full bg-cyber-dark-800 text-white rounded px-3 py-2 font-mono
                  border border-cyber-muted focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-cyber-muted mb-1 uppercase tracking-wider">
                Description
              </label>
              <textarea
                value={selectedNode.attributes?.description || ""}
                onChange={(e) =>
                  handleNodeAttributeChange("description", e.target.value)
                }
                className="w-full bg-cyber-dark-800 text-white rounded px-3 py-2 font-mono h-24
                  border border-cyber-muted focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue"
              />
            </div>

            {/* Importance Slider */}
            <div>
              <label className="block text-sm font-medium text-cyber-muted mb-1 uppercase tracking-wider">
                Importance ({selectedNode.attributes?.importance || 5})
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={selectedNode.attributes?.importance || 5}
                onChange={(e) =>
                  handleNodeAttributeChange(
                    "importance",
                    parseInt(e.target.value),
                  )
                }
                className="w-full h-2 bg-cyber-dark-800 rounded-lg appearance-none cursor-pointer
                  accent-cyber-blue"
              />
            </div>

            {/* Content */}
            {selectedNode.content !== undefined && (
              <div>
                <label className="block text-sm font-medium text-cyber-muted mb-1 uppercase tracking-wider">
                  Content
                </label>
                <textarea
                  value={selectedNode.content}
                  onChange={(e) =>
                    updateNode(selectedNode.id, { content: e.target.value })
                  }
                  className="w-full bg-cyber-dark-800 text-white rounded px-3 py-2 font-mono h-32
                    border border-cyber-muted focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue"
                />
              </div>
            )}

            {/* Choices */}
            {selectedNode.choices && selectedNode.choices.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-cyber-muted mb-1 uppercase tracking-wider">
                  Choices
                </label>
                <div className="space-y-2">
                  {selectedNode.choices.map((choice, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={choice.text}
                        onChange={(e) => {
                          const newChoices = [...selectedNode.choices!];
                          newChoices[index].text = e.target.value;
                          updateNode(selectedNode.id, { choices: newChoices });
                        }}
                        className="flex-1 bg-cyber-dark-800 text-white rounded px-3 py-2 font-mono
                          border border-cyber-muted focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue"
                      />
                      <button className="text-cyber-muted hover:text-cyber-red">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button className="text-sm text-cyber-blue hover:text-cyber-blue-bright">
                    + Add Choice
                  </button>
                </div>
              </div>
            )}

            {/* Delete Button */}
            <div className="pt-4 border-t border-cyber-muted mt-4">
              <button
                onClick={() => removeNode(selectedNode.id)}
                className="bg-cyber-red/20 hover:bg-cyber-red/30 text-cyber-red
                  border border-cyber-red/30 px-4 py-2 rounded flex items-center justify-center"
              >
                <Trash2 size={16} className="mr-2" />
                <span>Delete Node</span>
              </button>
            </div>
          </div>
        )}

        {/* Properties Tab - Connection */}
        {activeTab === "properties" && selectedConnection && (
          <div className="space-y-4">
            {/* Connection Type */}
            <div>
              <label className="block text-sm font-medium text-cyber-muted mb-1 uppercase tracking-wider">
                Type
              </label>
              <select
                value={selectedConnection.type}
                onChange={(e) =>
                  updateConnection(selectedConnection.id, {
                    type: e.target.value as Connection["type"],
                  })
                }
                className="w-full bg-cyber-dark-800 text-white rounded px-3 py-2 font-mono
                  border border-cyber-muted focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue"
              >
                <option value="causal">Causal</option>
                <option value="temporal">Temporal</option>
                <option value="conditional">Conditional</option>
                <option value="reference">Reference</option>
              </select>
            </div>

            {/* Label */}
            <div>
              <label className="block text-sm font-medium text-cyber-muted mb-1 uppercase tracking-wider">
                Label
              </label>
              <input
                type="text"
                value={selectedConnection.label || ""}
                onChange={(e) =>
                  updateConnection(selectedConnection.id, {
                    label: e.target.value,
                  })
                }
                className="w-full bg-cyber-dark-800 text-white rounded px-3 py-2 font-mono
                  border border-cyber-muted focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue"
              />
            </div>

            {/* Condition (for conditional connections) */}
            {selectedConnection.type === "conditional" && (
              <div>
                <label className="block text-sm font-medium text-cyber-muted mb-1 uppercase tracking-wider">
                  Condition
                </label>
                <textarea
                  value={selectedConnection.properties?.condition || ""}
                  onChange={(e) =>
                    handleConnectionPropertyChange("condition", e.target.value)
                  }
                  className="w-full bg-cyber-dark-800 text-white rounded px-3 py-2 font-mono h-24
                    border border-cyber-muted focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue"
                  placeholder="e.g., hasItem('key') && !visitedLocation('dungeon')"
                />
              </div>
            )}

            {/* Probability (for choice-based connections) */}
            {(selectedConnection.type === "causal" ||
              selectedConnection.type === "temporal") && (
              <div>
                <label className="block text-sm font-medium text-cyber-muted mb-1 uppercase tracking-wider">
                  Probability (
                  {selectedConnection.properties?.probability || 100}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedConnection.properties?.probability || 100}
                  onChange={(e) =>
                    handleConnectionPropertyChange(
                      "probability",
                      parseInt(e.target.value),
                    )
                  }
                  className="w-full h-2 bg-cyber-dark-800 rounded-lg appearance-none cursor-pointer
                    accent-cyber-blue"
                />
              </div>
            )}

            {/* Delete Button */}
            <div className="pt-4 border-t border-cyber-muted mt-4">
              <button
                onClick={() => removeConnection(selectedConnection.id)}
                className="bg-cyber-red/20 hover:bg-cyber-red/30 text-cyber-red
                  border border-cyber-red/30 px-4 py-2 rounded flex items-center justify-center"
              >
                <Trash2 size={16} className="mr-2" />
                <span>Delete Connection</span>
              </button>
            </div>
          </div>
        )}

        {/* JSON Tab */}
        {activeTab === "json" && (selectedNode || selectedConnection) && (
          <div>
            <div className="flex justify-end mb-2">
              <button className="text-cyber-muted hover:text-cyber-blue">
                <Copy size={16} />
              </button>
            </div>
            <pre
              className="bg-cyber-dark-800 text-cyber-blue-bright p-4 rounded-lg font-mono text-sm
              overflow-x-auto whitespace-pre-wrap border border-cyber-muted"
            >
              {generateJson()}
            </pre>
          </div>
        )}

        {/* Markdown Notes Tab */}
        {activeTab === "markdown" && (selectedNode || selectedConnection) && (
          <div>
            <textarea
              className="w-full h-64 bg-cyber-dark-800 text-white rounded px-3 py-2 font-mono
                border border-cyber-muted focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue mb-4"
              placeholder="Add notes about this element..."
              value={
                selectedNode
                  ? nodeNotes[selectedNode.id] || ""
                  : selectedConnection
                    ? nodeNotes[selectedConnection.id] || ""
                    : ""
              }
              onChange={(e) => {
                if (selectedNode) {
                  addNodeNote(selectedNode.id, e.target.value);
                } else if (selectedConnection) {
                  addNodeNote(selectedConnection.id, e.target.value);
                }
              }}
            />
            <div className="flex space-x-2">
              <button
                className="bg-cyber-dark-800 hover:bg-cyber-muted/20 border border-cyber-muted
                text-white py-1 px-3 rounded text-sm flex items-center"
              >
                <FileText size={14} className="mr-1" />
                Preview
              </button>
              <button
                className="bg-cyber-dark-800 hover:bg-cyber-muted/20 border border-cyber-muted
                text-white py-1 px-3 rounded text-sm flex items-center"
              >
                <Pencil size={14} className="mr-1" />
                Format
              </button>
              <button
                className="bg-cyber-dark-800 hover:bg-cyber-muted/20 border border-cyber-muted
                text-white py-1 px-3 rounded text-sm flex items-center"
              >
                <List size={14} className="mr-1" />
                Templates
              </button>
            </div>
          </div>
        )}

        {/* AI Analysis Tab */}
        {activeTab === "ai" && (selectedNode || selectedConnection) && (
          <div className="space-y-4">
            <button
              onClick={analyzeWithAI}
              className="bg-cyber-blue/20 hover:bg-cyber-blue/30 text-white
                border border-cyber-blue/30 w-full py-2 rounded flex items-center justify-center"
            >
              <Bot size={16} className="mr-2" />
              <span>Analyze with AI</span>
            </button>

            <div className="bg-cyber-dark-800 border border-cyber-muted rounded-lg p-4">
              <div className="text-sm text-cyber-blue-bright font-medium mb-2">
                AI Insights
              </div>
              <div className="text-sm text-cyber-muted">
                {selectedNode
                  ? "This node appears to be a key plot point connected to multiple narrative paths. Consider adding more descriptive content."
                  : "This connection forms part of a critical decision path. Consider adding more conditional logic."}
              </div>
            </div>

            <div className="bg-cyber-dark-800 border border-cyber-muted rounded-lg p-4">
              <div className="text-sm text-cyber-blue-bright font-medium mb-2">
                Suggestions
              </div>
              <ul className="text-sm text-cyber-muted list-disc pl-5 space-y-1">
                <li>Add more detailed description</li>
                <li>Connect to related character nodes</li>
                <li>Consider adding conditional branching</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {(selectedNode || selectedConnection) && (
        <div className="border-t border-cyber-muted p-3">
          <div className="flex justify-between">
            <button className="text-cyber-muted hover:text-cyber-blue">
              <Copy size={16} title="Duplicate" />
            </button>
            <button className="text-cyber-muted hover:text-cyber-blue">
              <PanelRight size={16} title="Toggle Panel" />
            </button>
            <button className="text-cyber-muted hover:text-cyber-blue">
              <Braces size={16} title="View JSON" />
            </button>
            <button className="text-cyber-muted hover:text-cyber-blue">
              <Bot size={16} title="AI Analysis" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
