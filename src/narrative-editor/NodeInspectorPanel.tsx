import React from "react";
import { useEditorStore } from "../lib/store/editor-store";

export const NodeInspectorPanel: React.FC = () => {
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const nodes = useEditorStore((state) => state.nodes);
  const updateNode = useEditorStore((state) => state.updateNode);

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="w-80 h-full bg-cyber-dark p-4 border-l border-cyber-muted">
        <h2 className="text-xl font-bold mb-4 text-white uppercase tracking-wider">
          Node Inspector
        </h2>
        <p className="text-cyber-muted text-sm">Select a node to inspect</p>
      </div>
    );
  }

  return (
    <div className="w-80 h-full bg-cyber-dark p-4 border-l border-cyber-muted overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-white uppercase tracking-wider">
        Node Inspector
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-cyber-muted mb-1 uppercase tracking-wider">
            Node Type
          </label>
          <div className="text-white font-mono">{selectedNode.type}</div>
        </div>

        {selectedNode.attributes?.name && (
          <div>
            <label className="block text-sm font-medium text-cyber-muted mb-1 uppercase tracking-wider">
              Name
            </label>
            <input
              type="text"
              value={selectedNode.attributes.name}
              onChange={(e) =>
                updateNode(selectedNode.id, {
                  attributes: {
                    ...selectedNode.attributes,
                    name: e.target.value,
                  },
                })
              }
              className="w-full bg-cyber-muted/20 text-white rounded px-3 py-2 font-mono
                border border-cyber-muted focus:border-cyber-red focus:ring-1 focus:ring-cyber-red
                transition-all duration-200"
            />
          </div>
        )}

        {selectedNode.content && (
          <div>
            <label className="block text-sm font-medium text-cyber-muted mb-1 uppercase tracking-wider">
              Content
            </label>
            <textarea
              value={selectedNode.content}
              onChange={(e) =>
                updateNode(selectedNode.id, { content: e.target.value })
              }
              className="w-full bg-cyber-muted/20 text-white rounded px-3 py-2 font-mono h-32
                border border-cyber-muted focus:border-cyber-red focus:ring-1 focus:ring-cyber-red
                transition-all duration-200"
            />
          </div>
        )}

        {selectedNode.choices && (
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
                      newChoices[index] = { ...choice, text: e.target.value };
                      updateNode(selectedNode.id, { choices: newChoices });
                    }}
                    className="flex-1 bg-cyber-muted/20 text-white rounded px-3 py-2 font-mono
                      border border-cyber-muted focus:border-cyber-red focus:ring-1 focus:ring-cyber-red
                      transition-all duration-200"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
