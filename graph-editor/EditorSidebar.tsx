import React, { useState } from 'react';
import { Typography, List, ListItem, ListItemText, IconButton, Paper } from '@mui/material';
import { AddIcon } from '@mui/icons-material';

// Simplified tabs implementation
const Tabs = ({ children, value, onValueChange, className }: any) => (
  <div className={className}>{children}</div>
);

const TabsList = ({ children, className }: any) => (
  <div className={className}>{children}</div>
);

const TabsTrigger = ({ children, value, className, onClick }: any) => (
  <button className={className} onClick={() => onClick(value)}>
    {children}
  </button>
);

const TabsContent = ({ children, value, className, activeValue }: any) => (
  <div className={`${className} ${value === activeValue ? 'block' : 'hidden'}`}>
    {children}
  </div>
);

// Simplified button component
const Button = ({ children, variant, className, onClick, disabled = false }: any) => (
  <button 
    className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} 
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

// Mock icon components
const IconComponent = ({ className }: any) => (
  <span className={className}>📎</span>
);

// Node type icons
const MessageSquare = IconComponent;
const Network = IconComponent;
const GitBranch = IconComponent;
const Code = IconComponent;
const BrainCircuit = IconComponent;
const Plus = IconComponent;
const AlignJustify = IconComponent;
const Search = IconComponent;
const Filter = IconComponent;
const Layers = IconComponent;
const Settings = IconComponent;
const SaveIcon = IconComponent;
const FolderIcon = IconComponent;

import { 
  useEditorStore, 
  NodeType, 
  NodeTemplate, 
  ValidationError, 
  Node
} from '../src/lib/store/editor-store';
import { findNodesWithErrors } from '../src/lib/graph/search-utils';

const EditorSidebar = () => {
  const [activeTab, setActiveTab] = useState('nodes');
  const [searchQuery, setSearchQuery] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [filterType, setFilterType] = useState<NodeType | ''>('');
  
  const { 
    addNode, 
    nodes, 
    nodeTemplates, 
    createNodeFromTemplate, 
    history,
    undo, 
    redo,
    getFilteredNodes,
    setSearchQuery: setStoreSearchQuery,
    validateAllNodes,
    groups
  } = useEditorStore();
  
  // Handle adding a node from a template
  const handleAddNode = (templateId: string) => {
    createNodeFromTemplate(templateId, {
      x: Math.random() * 500,
      y: Math.random() * 300
    });
  };
  
  // Get filtered nodes based on search and filters
  const filteredNodes = (() => {
    // First apply store search (which handles the actual filtering logic)
    setStoreSearchQuery(searchQuery);
    let filtered = getFilteredNodes();
    
    // Then apply UI-specific filters
    if (showErrors) {
      filtered = findNodesWithErrors(filtered);
    }
    
    if (filterType) {
      filtered = filtered.filter(node => node.type === filterType);
    }
    
    return filtered;
  })();
  
  // Handle tab change
  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue);
  };
  
  return (
    <Paper elevation={3} className="p-4">
      <Typography variant="h6">Editor Sidebar</Typography>
      <List>
        <ListItem button>
          <ListItemText primary="Item 1" />
        </ListItem>
        <ListItem button>
          <ListItemText primary="Item 2" />
        </ListItem>
      </List>
      <IconButton color="primary">
        <AddIcon />
      </IconButton>
    </Paper>
  );
};

export default EditorSidebar;
