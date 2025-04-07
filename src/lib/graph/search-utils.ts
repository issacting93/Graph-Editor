import { Node, Edge, NodeType } from "@/lib/store/editor-store";

// Search filter options
export interface SearchFilterOptions {
  nodeTypes?: NodeType[];
  nodeContent?: string;
  nodeName?: string;
  nodeDescription?: string;
  groupId?: string;
  hasErrors?: boolean;
}

// Search for nodes based on various criteria
export const searchNodes = (
  nodes: Node[],
  searchQuery: string,
  options: SearchFilterOptions = {},
): Node[] => {
  if (!searchQuery.trim() && !hasAnyFilterOption(options)) {
    return nodes;
  }

  const lowerQuery = searchQuery.toLowerCase();

  return nodes.filter((node) => {
    // Match by search query (if provided)
    if (searchQuery.trim()) {
      const nameMatch = node.attributes?.name
        ?.toLowerCase()
        .includes(lowerQuery);
      const contentMatch = node.content?.toLowerCase().includes(lowerQuery);
      const descMatch = node.attributes?.description
        ?.toLowerCase()
        .includes(lowerQuery);

      // If no match with the search query, filter out this node
      if (!(nameMatch || contentMatch || descMatch)) {
        return false;
      }
    }

    // Filter by type (if specified)
    if (options.nodeTypes && options.nodeTypes.length > 0) {
      if (!options.nodeTypes.includes(node.type)) {
        return false;
      }
    }

    // Filter by node name (if specified)
    if (options.nodeName) {
      const lowerName = options.nodeName.toLowerCase();
      if (!node.attributes?.name?.toLowerCase().includes(lowerName)) {
        return false;
      }
    }

    // Filter by node content (if specified)
    if (options.nodeContent) {
      const lowerContent = options.nodeContent.toLowerCase();
      if (!node.content?.toLowerCase().includes(lowerContent)) {
        return false;
      }
    }

    // Filter by node description (if specified)
    if (options.nodeDescription) {
      const lowerDesc = options.nodeDescription.toLowerCase();
      if (!node.attributes?.description?.toLowerCase().includes(lowerDesc)) {
        return false;
      }
    }

    // Filter by group (if specified)
    if (options.groupId) {
      if (node.attributes?.groupId !== options.groupId) {
        return false;
      }
    }

    // Filter by error status (if specified)
    if (options.hasErrors !== undefined) {
      const hasErrors = node.errors && node.errors.length > 0;
      if (hasErrors !== options.hasErrors) {
        return false;
      }
    }

    // Node passed all filters
    return true;
  });
};

// Check if any filter option is provided
const hasAnyFilterOption = (options: SearchFilterOptions): boolean => {
  return (
    (options.nodeTypes && options.nodeTypes.length > 0) ||
    !!options.nodeContent ||
    !!options.nodeName ||
    !!options.nodeDescription ||
    !!options.groupId ||
    options.hasErrors !== undefined
  );
};

// Find nodes that are connected to a given node
export const findConnectedNodes = (
  nodeId: string,
  nodes: Node[],
  edges: Edge[],
  direction: "incoming" | "outgoing" | "both" = "both",
): Node[] => {
  const connectedNodeIds = new Set<string>();

  edges.forEach((edge) => {
    if (direction === "outgoing" || direction === "both") {
      if (edge.sourceId === nodeId) {
        connectedNodeIds.add(edge.targetId);
      }
    }

    if (direction === "incoming" || direction === "both") {
      if (edge.targetId === nodeId) {
        connectedNodeIds.add(edge.sourceId);
      }
    }
  });

  return nodes.filter((node) => connectedNodeIds.has(node.id));
};

// Find nodes with errors
export const findNodesWithErrors = (nodes: Node[]): Node[] => {
  return nodes.filter((node) => node.errors && node.errors.length > 0);
};

// Find orphaned nodes (nodes with no connections)
export const findOrphanedNodes = (nodes: Node[], edges: Edge[]): Node[] => {
  const connectedNodeIds = new Set<string>();

  edges.forEach((edge) => {
    connectedNodeIds.add(edge.sourceId);
    connectedNodeIds.add(edge.targetId);
  });

  return nodes.filter((node) => !connectedNodeIds.has(node.id));
};

// Find nodes by type
export const findNodesByType = (nodes: Node[], type: NodeType): Node[] => {
  return nodes.filter((node) => node.type === type);
};
