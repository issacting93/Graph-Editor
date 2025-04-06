import { saveAs } from 'file-saver';
import { Node, Edge, NodeGroup, NodeTemplate } from '@/lib/store/editor-store';

interface GraphExportData {
  nodes: Node[];
  edges: Edge[];
  groups: NodeGroup[];
  nodeTemplates: NodeTemplate[];
  metadata: {
    version: string;
    exportDate: string;
    appName: string;
  };
}

// Export graph data to a JSON file
export const exportGraphToJSON = (data: GraphExportData, filename = 'graph-export.json'): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  saveAs(blob, filename);
};

// Export graph data to an SVG image
export const exportGraphToSVG = (
  svgElement: SVGElement | null, 
  filename = 'graph-export.svg'
): void => {
  if (!svgElement) {
    console.error('No SVG element provided for export');
    return;
  }

  // Clone the SVG to avoid modifying the original
  const clonedSvg = svgElement.cloneNode(true) as SVGElement;
  
  // Set proper dimensions
  const bbox = getSvgBoundingBox(svgElement as SVGGraphicsElement);
  clonedSvg.setAttribute('width', `${bbox.width}px`);
  clonedSvg.setAttribute('height', `${bbox.height}px`);
  clonedSvg.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
  
  // Add proper styling
  const style = document.createElement('style');
  style.textContent = `
    .node { fill: #333; stroke: #666; }
    .edge { stroke: #999; stroke-width: 1px; }
    text { font-family: sans-serif; fill: white; }
  `;
  clonedSvg.insertBefore(style, clonedSvg.firstChild);
  
  // Add export metadata
  const metadata = document.createElementNS('http://www.w3.org/2000/svg', 'metadata');
  metadata.textContent = JSON.stringify({
    exportDate: new Date().toISOString(),
    source: 'Graph Editor'
  });
  clonedSvg.appendChild(metadata);
  
  // Convert to string and create download
  const svgString = new XMLSerializer().serializeToString(clonedSvg);
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  saveAs(blob, filename);
};

const getSvgBoundingBox = (element: SVGGraphicsElement) => {
  return element.getBBox();
};

// Parse a JSON file containing graph data
export const parseGraphJSON = (jsonString: string): GraphExportData | null => {
  try {
    const data = JSON.parse(jsonString) as GraphExportData;
    
    // Validate the data structure
    if (!data.nodes || !Array.isArray(data.nodes)) {
      throw new Error('Invalid graph data: nodes missing or not an array');
    }
    
    // Additional validation can be added here
    
    return data;
  } catch (error) {
    console.error('Failed to parse graph JSON:', error);
    return null;
  }
};

// Import graph data from a file input
export const importGraphFromFile = (
  file: File,
  callback: (data: GraphExportData | null) => void
): void => {
  const reader = new FileReader();
  
  reader.onload = (event) => {
    if (event.target?.result) {
      try {
        const jsonString = event.target.result as string;
        const data = parseGraphJSON(jsonString);
        callback(data);
      } catch (error) {
        console.error('Error reading graph file:', error);
        callback(null);
      }
    } else {
      callback(null);
    }
  };
  
  reader.onerror = () => {
    console.error('Error reading file');
    callback(null);
  };
  
  reader.readAsText(file);
};