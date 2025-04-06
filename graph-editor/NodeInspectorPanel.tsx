import React, { useState } from 'react';
import { useEditorStore, ValidationError, NodeGroup } from '../src/lib/store/editor-store';
import { Typography, TextField, Button, IconButton, Paper } from '@mui/material';

// Mock icon components
const IconComponent = ({ className }: any) => (
  <span className={className}>📎</span>
);

// Validation icons
const WarningIcon = ({ className }: any) => (
  <span className={`${className} text-yellow-500`}>⚠️</span>
);

const ErrorIcon = ({ className }: any) => (
  <span className={`${className} text-red-500`}>❌</span>
);

// UI components for tabs
const TabButton = ({ children, isActive, onClick }: any) => (
  <button
    className={`px-3 py-2 text-sm font-medium ${
      isActive 
        ? 'border-b-2 border-orange-500 text-white' 
        : 'text-gray-400 hover:text-gray-300'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

export const NodeInspectorPanel = () => {
  const [activeTab, setActiveTab] = useState('properties');
  const { 
    selectedNodeIds, 
    nodes, 
    updateNode, 
    validateNode,
    groups,
    createGroup,
    addNodesToGroup,
    removeNodesFromGroup,
    deleteNode,
    duplicateNode
  } = useEditorStore();
  
  // Get the first selected node for the inspector
  const selectedNodeId = selectedNodeIds[0] || null;
  const selectedNode = selectedNodeId 
    ? nodes.find(node => node.id === selectedNodeId) 
    : null;
  
  // Find the node's group if it belongs to one
  const nodeGroup = selectedNode?.attributes?.groupId
    ? groups.find(g => g.id === selectedNode.attributes?.groupId)
    : null;
  
  // Handlers for updating node properties
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedNodeId) return;
    updateNode(selectedNodeId, {
      attributes: {
        ...selectedNode?.attributes,
        name: e.target.value
      }
    });
    
    // Validate the node after update
    validateNode(selectedNodeId);
  };
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!selectedNodeId || !selectedNode) return;
    updateNode(selectedNodeId, {
      content: e.target.value
    });
    
    // Validate the node after update
    validateNode(selectedNodeId);
  };
  
  // Handle adding a choice
  const handleAddChoice = () => {
    if (!selectedNodeId || !selectedNode) return;
    
    const newChoices = [...(selectedNode.choices || [])];
    newChoices.push({ text: 'New choice' });
    
    updateNode(selectedNodeId, {
      choices: newChoices
    });
    
    // Validate after adding choice
    validateNode(selectedNodeId);
  };
  
  // Handle updating a choice
  const handleChoiceChange = (index: number, text: string) => {
    if (!selectedNodeId || !selectedNode || !selectedNode.choices) return;
    
    const newChoices = [...selectedNode.choices];
    newChoices[index] = { 
      ...newChoices[index], 
      text 
    };
    
    updateNode(selectedNodeId, {
      choices: newChoices
    });
    
    // Validate after updating choice
    validateNode(selectedNodeId);
  };
  
  // Handle removing a choice
  const handleRemoveChoice = (index: number) => {
    if (!selectedNodeId || !selectedNode || !selectedNode.choices) return;
    
    const newChoices = [...selectedNode.choices];
    newChoices.splice(index, 1);
    
    updateNode(selectedNodeId, {
      choices: newChoices
    });
    
    // Validate after removing choice
    validateNode(selectedNodeId);
  };
  
  // Handle changing a node's group
  const handleChangeGroup = (groupId: string | null) => {
    if (!selectedNodeId) return;
    
    if (groupId) {
      // Add to group
      addNodesToGroup(groupId, [selectedNodeId]);
    } else if (selectedNode?.attributes?.groupId) {
      // Remove from current group
      removeNodesFromGroup(
        selectedNode.attributes.groupId, 
        [selectedNodeId]
      );
    }
  };
  
  // Handle creating a new group for this node
  const handleCreateGroup = () => {
    if (!selectedNodeId) return;
    
    const groupName = `Group ${groups.length + 1}`;
    createGroup(groupName, '#ff4500', [selectedNodeId]);
  };
  
  // Handle node deletion
  const handleDeleteNode = () => {
    if (!selectedNodeId) return;
    
    if (confirm("Are you sure you want to delete this node?")) {
      deleteNode(selectedNodeId);
    }
  };
  
  // Handle node duplication
  const handleDuplicateNode = () => {
    if (!selectedNodeId) return;
    duplicateNode(selectedNodeId);
  };
  
  // If no node is selected, show empty state
  if (!selectedNodeId || !selectedNode) {
    return (
      <Paper elevation={3} className="p-4">
        <Typography variant="h6">Node Inspector</Typography>
        <Typography variant="body1">
          {selectedNodeIds.length > 1 
            ? `${selectedNodeIds.length} nodes selected` 
            : 'Select a node to edit its properties'}
        </Typography>
        
        {selectedNodeIds.length > 1 && (
          <div className="mt-4 space-y-2">
            <Button 
              variant="contained"
              color="primary"
              onClick={() => {
                // Create a group from selected nodes
                createGroup(`Group ${groups.length + 1}`, '#ff4500', selectedNodeIds);
              }}
            >
              Create Group From Selection
            </Button>
            
            <Button 
              variant="contained"
              color="secondary"
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${selectedNodeIds.length} nodes?`)) {
                  // Delete multiple nodes
                  useEditorStore.getState().deleteNodes(selectedNodeIds);
                }
              }}
            >
              Delete Selected Nodes
            </Button>
          </div>
        )}
      </Paper>
    );
  }
  
  return (
    <Paper elevation={3} className="p-4">
      <Typography variant="h6">Node Inspector</Typography>
      <TextField label="Node Name" variant="outlined" fullWidth margin="normal" value={selectedNode.attributes?.name || ''} onChange={handleLabelChange} />
      <TextField label="Node Type" variant="outlined" fullWidth margin="normal" value={selectedNode.type} />
      <Button variant="contained" color="primary">Save</Button>
      <IconButton color="secondary" onClick={handleDeleteNode}>
        <ErrorIcon className="h-4 w-4" />
      </IconButton>
      <IconButton color="secondary" onClick={handleDuplicateNode}>
        <IconComponent className="h-4 w-4" />
      </IconButton>
      
      {/* Navigation tabs */}
      <div className="border-b border-gray-700 mb-4">
        <div className="flex">
          <TabButton 
            isActive={activeTab === 'properties'} 
            onClick={() => setActiveTab('properties')}
          >
            Properties
          </TabButton>
          <TabButton 
            isActive={activeTab === 'validation'} 
            onClick={() => setActiveTab('validation')}
          >
            Validation
            {selectedNode.errors && selectedNode.errors.length > 0 && (
              <span className="ml-1.5 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {selectedNode.errors.length}
              </span>
            )}
          </TabButton>
          <TabButton 
            isActive={activeTab === 'connections'} 
            onClick={() => setActiveTab('connections')}
          >
            Connections
          </TabButton>
        </div>
      </div>
      
      {/* Properties Tab */}
      {activeTab === 'properties' && (
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Node Type</label>
              <div className="bg-gray-800 px-3 py-2 rounded text-sm flex items-center">
                <span className="capitalize">{selectedNode.type}</span>
                <span className="ml-auto text-xs text-gray-500">ID: {selectedNode.id.slice(0, 8)}</span>
              </div>
            </div>
            
            {/* Group selector */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Group</label>
              {groups.length > 0 ? (
                <div className="flex">
                  <select
                    value={selectedNode.attributes?.groupId || ''}
                    onChange={(e) => handleChangeGroup(e.target.value || null)}
                    className="flex-1 bg-gray-800 border border-gray-700 px-3 py-2 rounded-l text-sm"
                  >
                    <option value="">No group</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreateGroup}
                    title="Create new group"
                  >
                    +
                  </Button>
                </div>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCreateGroup}
                >
                  Create a new group
                </Button>
              )}
            </div>
          </div>
          
          {/* Node Type-specific properties */}
          <div className="pt-3 border-t border-gray-700 space-y-3">
            {/* Content field for dialogue nodes */}
            {selectedNode.type === 'dialogue' && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Dialogue Content</label>
                <textarea
                  value={selectedNode.content || ''}
                  onChange={handleContentChange}
                  rows={5}
                  className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded text-sm"
                  placeholder="Enter dialogue text here..."
                />
              </div>
            )}
            
            {/* Decision choices */}
            {selectedNode.type === 'decision' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm text-gray-400">Choices</label>
                  <Button 
                    variant="contained"
                    color="primary"
                    onClick={handleAddChoice}
                  >
                    + Add choice
                  </Button>
                </div>
                
                {selectedNode.choices && selectedNode.choices.length > 0 ? (
                  <div className="space-y-2">
                    {selectedNode.choices.map((choice, idx) => (
                      <div key={idx} className="flex items-center">
                        <TextField
                          variant="outlined"
                          fullWidth
                          value={choice.text}
                          onChange={(e) => handleChoiceChange(idx, e.target.value)}
                        />
                        <IconButton
                          color="secondary"
                          onClick={() => handleRemoveChoice(idx)}
                          title="Remove choice"
                        >
                          <ErrorIcon className="h-4 w-4" />
                        </IconButton>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div 
                    className="bg-gray-800 px-3 py-4 rounded text-sm text-gray-500 text-center border border-dashed border-gray-700"
                    onClick={handleAddChoice}
                  >
                    Click to add choices
                  </div>
                )}
              </div>
            )}
            
            {/* Condition editor */}
            {selectedNode.type === 'condition' && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Conditions</label>
                <div className="bg-gray-800 px-3 py-2 rounded text-sm text-gray-500">
                  Condition editor coming soon
                </div>
              </div>
            )}
            
            {/* Logic editor */}
            {selectedNode.type === 'logic' && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Actions</label>
                <div className="bg-gray-800 px-3 py-2 rounded text-sm text-gray-500">
                  Action editor coming soon
                </div>
              </div>
            )}
            
            {/* Memory editor */}
            {selectedNode.type === 'memory' && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Memory</label>
                <textarea
                  value={selectedNode.content || ''}
                  onChange={handleContentChange}
                  rows={5}
                  className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded text-sm"
                  placeholder="Enter memory details here..."
                />
              </div>
            )}
          </div>
          
          {/* Advanced properties section */}
          <div className="pt-3 border-t border-gray-700">
            <details className="group">
              <summary className="flex items-center cursor-pointer text-sm font-medium text-gray-300 mb-2">
                <span>Advanced Properties</span>
                <span className="ml-auto text-xs text-gray-500">▼</span>
              </summary>
              
              <div className="bg-gray-800/50 p-3 rounded space-y-3 mt-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Description</label>
                  <textarea
                    value={selectedNode.attributes?.description || ''}
                    onChange={(e) => {
                      if (!selectedNodeId) return;
                      updateNode(selectedNodeId, {
                        attributes: {
                          ...selectedNode?.attributes,
                          description: e.target.value
                        }
                      });
                    }}
                    rows={2}
                    className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Importance (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={selectedNode.attributes?.importance || 1}
                    onChange={(e) => {
                      if (!selectedNodeId) return;
                      updateNode(selectedNodeId, {
                        attributes: {
                          ...selectedNode?.attributes,
                          importance: parseInt(e.target.value)
                        }
                      });
                    }}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>
              </div>
            </details>
          </div>
          
          {/* Validation summary */}
          {selectedNode.errors && selectedNode.errors.length > 0 && (
            <div className="bg-red-900/30 border border-red-500/50 rounded p-2 mt-4">
              <div className="flex items-center text-red-500 text-sm font-medium">
                <ErrorIcon className="h-4 w-4 mr-1" />
                <span>Validation Issues Found</span>
              </div>
              <Button 
                variant="contained"
                color="primary"
                onClick={() => setActiveTab('validation')}
              >
                View Details →
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Validation Tab */}
      {activeTab === 'validation' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-300">Validation Results</h4>
            <Button 
              variant="contained"
              color="primary"
              onClick={() => validateNode(selectedNodeId)}
            >
              Validate Now
            </Button>
          </div>
          
          {!selectedNode.errors || selectedNode.errors.length === 0 ? (
            <div className="bg-green-900/30 border border-green-500/50 rounded p-3 text-green-500 text-sm">
              ✓ No validation issues found
            </div>
          ) : (
            <div className="space-y-2">
              {selectedNode.errors.map((error, idx) => (
                <div 
                  key={idx} 
                  className={`p-2 rounded border ${
                    error.severity === 'error' 
                      ? 'bg-red-900/30 border-red-500/50' 
                      : 'bg-yellow-900/30 border-yellow-500/50'
                  }`}
                >
                  <div className="flex items-center">
                    {error.severity === 'error' ? (
                      <ErrorIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <WarningIcon className="h-4 w-4 mr-1" />
                    )}
                    <span className="text-sm font-medium">
                      {error.field}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">
                    {error.message}
                  </p>
                </div>
              ))}
              
              <div className="text-xs text-gray-400 mt-2">
                Fix these issues to ensure your graph works correctly.
              </div>
            </div>
          )}
          
          {/* Validation requirements */}
          <div className="mt-4 pt-3 border-t border-gray-700">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Node Requirements</h4>
            
            <ul className="space-y-1 text-xs text-gray-400">
              {selectedNode.type === 'dialogue' && (
                <>
                  <li className="flex items-center">
                    <span className={selectedNode.attributes?.name ? 'text-green-500' : 'text-gray-500'}>✓</span>
                    <span className="ml-2">Must have a name</span>
                  </li>
                  <li className="flex items-center">
                    <span className={selectedNode.content ? 'text-green-500' : 'text-red-500'}>
                      {selectedNode.content ? '✓' : '✗'}
                    </span>
                    <span className="ml-2">Must have dialogue content</span>
                  </li>
                </>
              )}
              
              {selectedNode.type === 'decision' && (
                <>
                  <li className="flex items-center">
                    <span className={selectedNode.attributes?.name ? 'text-green-500' : 'text-gray-500'}>✓</span>
                    <span className="ml-2">Must have a name</span>
                  </li>
                  <li className="flex items-center">
                    <span className={
                      selectedNode.choices && selectedNode.choices.length > 0 
                        ? 'text-green-500' 
                        : 'text-red-500'
                    }>
                      {selectedNode.choices && selectedNode.choices.length > 0 ? '✓' : '✗'}
                    </span>
                    <span className="ml-2">Must have at least one choice</span>
                  </li>
                </>
              )}
              
              {/* Add requirements for other node types as needed */}
            </ul>
          </div>
        </div>
      )}
      
      {/* Connections Tab */}
      {activeTab === 'connections' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-300">Connected Nodes</h4>
            <span className="text-xs text-gray-500">
              Coming soon
            </span>
          </div>
          
          <div className="bg-gray-800/50 p-3 rounded text-gray-400 text-sm">
            Connection visualization features are coming soon. For now, you can see your connections visually on the graph canvas.
          </div>
        </div>
      )}
    </Paper>
  );
};
