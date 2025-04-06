import React, { useState, useEffect } from 'react';
import { X, FileDown, Copy, Check, Code, FileText, Braces } from 'lucide-react';
import { useEditorStore, Node, Connection } from '@/lib/store/editor-store';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'json' | 'jsonld' | 'markdown' | 'gameEngine';

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [exportData, setExportData] = useState('');
  const [copied, setCopied] = useState(false);
  
  const nodes = useEditorStore(state => state.nodes);
  const connections = useEditorStore(state => state.connections);
  
  // Generate export data based on selected format when modal is opened
  useEffect(() => {
    if (isOpen) {
      generateExportData(exportFormat);
    }
  }, [isOpen, exportFormat]);
  
  if (!isOpen) return null;
  
  // Generate export data based on format
  const generateExportData = (format: ExportFormat) => {
    switch (format) {
      case 'json':
        // Standard JSON export
        const jsonData = {
          nodes: nodes.map(node => ({
            id: node.id,
            type: node.type,
            position: node.position,
            attributes: node.attributes,
            content: node.content,
            choices: node.choices
          })),
          connections: connections.map(conn => ({
            id: conn.id,
            sourceId: conn.sourceId,
            targetId: conn.targetId,
            type: conn.type,
            label: conn.label,
            properties: conn.properties
          }))
        };
        setExportData(JSON.stringify(jsonData, null, 2));
        break;
        
      case 'jsonld':
        // JSON-LD for semantic web and knowledge graphs
        const jsonLdData = {
          "@context": {
            "schema": "http://schema.org/",
            "node": "schema:Thing",
            "connection": "schema:Relationship",
            "sourceId": "schema:source",
            "targetId": "schema:target"
          },
          "@graph": [
            ...nodes.map(node => ({
              "@type": "node",
              "@id": node.id,
              "nodeType": node.type,
              "name": node.attributes?.name || '',
              "description": node.content || '',
              "position": node.position
            })),
            ...connections.map(conn => ({
              "@type": "connection",
              "@id": conn.id,
              "connectionType": conn.type,
              "sourceId": { "@id": conn.sourceId },
              "targetId": { "@id": conn.targetId },
              "label": conn.label || ''
            }))
          ]
        };
        setExportData(JSON.stringify(jsonLdData, null, 2));
        break;
        
      case 'markdown':
        // Markdown format for documentation
        let mdContent = `# Graph Export\n\n## Nodes\n\n`;
        
        nodes.forEach(node => {
          mdContent += `### ${node.attributes?.name || node.type}\n\n`;
          mdContent += `- **Type**: ${node.type}\n`;
          mdContent += `- **ID**: ${node.id}\n`;
          
          if (node.content) {
            mdContent += `- **Content**:\n\n\`\`\`\n${node.content}\n\`\`\`\n\n`;
          }
          
          if (node.choices && node.choices.length > 0) {
            mdContent += `- **Choices**:\n`;
            node.choices.forEach(choice => {
              mdContent += `  - ${choice.text}\n`;
            });
            mdContent += '\n';
          }
        });
        
        mdContent += `## Connections\n\n`;
        
        connections.forEach(conn => {
          const sourceNode = nodes.find(n => n.id === conn.sourceId);
          const targetNode = nodes.find(n => n.id === conn.targetId);
          
          mdContent += `### ${conn.label || 'Connection'}\n\n`;
          mdContent += `- **Type**: ${conn.type}\n`;
          mdContent += `- **From**: ${sourceNode?.attributes?.name || conn.sourceId}\n`;
          mdContent += `- **To**: ${targetNode?.attributes?.name || conn.targetId}\n\n`;
        });
        
        setExportData(mdContent);
        break;
        
      case 'gameEngine':
        // Game engine format (simplified for this example)
        const gameData = {
          version: "1.0",
          gameObjects: nodes.map(node => {
            // Transform node data into game engine format
            switch (node.type) {
              case 'character':
                return {
                  type: 'CHARACTER',
                  id: node.id,
                  name: node.attributes?.name || 'Character',
                  description: node.content || '',
                  metadata: {
                    position: { x: node.position.x, y: node.position.y }
                  }
                };
                
              case 'dialogue':
                return {
                  type: 'DIALOGUE',
                  id: node.id,
                  speaker: node.attributes?.name || 'Unknown',
                  text: node.content || '',
                  choices: node.choices || [],
                  metadata: {
                    position: { x: node.position.x, y: node.position.y }
                  }
                };
                
              case 'location':
                return {
                  type: 'LOCATION',
                  id: node.id,
                  name: node.attributes?.name || 'Location',
                  description: node.content || '',
                  metadata: {
                    position: { x: node.position.x, y: node.position.y }
                  }
                };
                
              default:
                return {
                  type: node.type.toUpperCase(),
                  id: node.id,
                  name: node.attributes?.name || node.type,
                  description: node.content || '',
                  metadata: {
                    position: { x: node.position.x, y: node.position.y }
                  }
                };
            }
          }),
          relationships: connections.map(conn => ({
            type: conn.type.toUpperCase(),
            from: conn.sourceId,
            to: conn.targetId,
            label: conn.label || '',
            conditions: conn.properties?.condition || '',
            probability: conn.properties?.probability || 100
          }))
        };
        
        setExportData(JSON.stringify(gameData, null, 2));
        break;
    }
  };
  
  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(exportData).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Handle download file
  const handleDownload = () => {
    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `graph-export.${exportFormat === 'markdown' ? 'md' : 'json'}`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-cyber-dark-900 border border-cyber-muted rounded-lg w-[700px] shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-cyber-muted p-4">
          <h2 className="text-xl font-bold text-white">Export Graph</h2>
          <button 
            onClick={onClose}
            className="text-cyber-muted hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Format Selector */}
        <div className="p-4 border-b border-cyber-muted">
          <label className="block text-sm font-medium text-cyber-muted mb-2 uppercase tracking-wider">
            Export Format
          </label>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setExportFormat('json')}
              className={`px-3 py-2 rounded-lg flex items-center justify-center ${
                exportFormat === 'json' 
                  ? 'bg-cyber-blue text-white' 
                  : 'bg-cyber-dark-800 text-cyber-muted hover:bg-cyber-muted/20'
              }`}
            >
              <Braces size={16} className="mr-2" />
              <span>JSON</span>
            </button>
            <button
              onClick={() => setExportFormat('jsonld')}
              className={`px-3 py-2 rounded-lg flex items-center justify-center ${
                exportFormat === 'jsonld' 
                  ? 'bg-cyber-blue text-white' 
                  : 'bg-cyber-dark-800 text-cyber-muted hover:bg-cyber-muted/20'
              }`}
            >
              <Code size={16} className="mr-2" />
              <span>JSON-LD</span>
            </button>
            <button
              onClick={() => setExportFormat('markdown')}
              className={`px-3 py-2 rounded-lg flex items-center justify-center ${
                exportFormat === 'markdown' 
                  ? 'bg-cyber-blue text-white' 
                  : 'bg-cyber-dark-800 text-cyber-muted hover:bg-cyber-muted/20'
              }`}
            >
              <FileText size={16} className="mr-2" />
              <span>Markdown</span>
            </button>
            <button
              onClick={() => setExportFormat('gameEngine')}
              className={`px-3 py-2 rounded-lg flex items-center justify-center ${
                exportFormat === 'gameEngine' 
                  ? 'bg-cyber-blue text-white' 
                  : 'bg-cyber-dark-800 text-cyber-muted hover:bg-cyber-muted/20'
              }`}
            >
              <Code size={16} className="mr-2" />
              <span>Game Engine</span>
            </button>
          </div>
        </div>
        
        {/* Export Preview */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-cyber-muted uppercase tracking-wider">
              Export Preview
            </label>
            <button
              onClick={handleCopy}
              className="text-cyber-muted hover:text-cyber-blue flex items-center text-sm"
            >
              {copied ? (
                <>
                  <Check size={14} className="mr-1" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} className="mr-1" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="bg-cyber-dark-800 text-cyber-blue-bright p-4 rounded-lg font-mono text-sm
            overflow-x-auto whitespace-pre-wrap border border-cyber-muted h-[300px] overflow-y-auto">
            {exportData}
          </pre>
          
          <div className="text-xs text-cyber-muted mt-2">
            {nodes.length} nodes and {connections.length} connections will be exported.
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end space-x-3 p-4 border-t border-cyber-muted">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyber-dark-800 hover:bg-cyber-muted/20 text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-cyber-blue/80 hover:bg-cyber-blue text-white rounded-lg flex items-center"
          >
            <FileDown size={16} className="mr-2" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};