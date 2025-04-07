import dagre from "dagre";
import { Node, Connection } from "../store/editor-store";

// Auto-layout algorithm using dagre
export const autoLayout = (
  nodes: Node[],
  connections: Connection[],
  options: {
    direction?: "TB" | "LR";
    nodeWidth?: number;
    nodeHeight?: number;
    rankSeparation?: number;
    nodeSeparation?: number;
  } = {},
): Node[] => {
  const {
    direction = "TB", // TB = top to bottom, LR = left to right
    nodeWidth = 200,
    nodeHeight = 50,
    rankSeparation = 150,
    nodeSeparation = 100,
  } = options;

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: rankSeparation,
    nodesep: nodeSeparation,
    marginx: 50,
    marginy: 50,
  });
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // Add edges to dagre graph
  connections.forEach((connection) => {
    dagreGraph.setEdge(connection.sourceId, connection.targetId);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply layout to nodes
  const layoutedNodes = nodes.map((node) => {
    const dagreNode = dagreGraph.node(node.id);

    return {
      ...node,
      position: {
        x: dagreNode.x - nodeWidth / 2,
        y: dagreNode.y - nodeHeight / 2,
      },
    };
  });

  return layoutedNodes;
};

/**
 * Apply a cluster-based layout that groups similar node types
 */
export function applyClusterLayout(
  nodes: Node[],
  connections: Connection[],
): Node[] {
  // Group nodes by type
  const nodesByType: Record<string, Node[]> = {};

  nodes.forEach((node) => {
    if (!nodesByType[node.type]) {
      nodesByType[node.type] = [];
    }
    nodesByType[node.type].push(node);
  });

  // Process each type and position nodes in clusters
  let updatedNodes = [...nodes];
  let xOffset = 100;

  Object.entries(nodesByType).forEach(([type, typeNodes]) => {
    // Create a sub-graph for this type
    const subGraph = new dagre.graphlib.Graph();
    subGraph.setGraph({
      rankdir: "TB",
      marginx: 30,
      marginy: 30,
      ranksep: 60,
      nodesep: 40,
    });
    subGraph.setDefaultEdgeLabel(() => ({}));

    // Add nodes to sub-graph
    typeNodes.forEach((node) => {
      subGraph.setNode(node.id, {
        width: 200,
        height: 50,
      });
    });

    // Add relevant connections between these nodes
    connections.forEach((connection) => {
      const sourceInCluster = typeNodes.some(
        (node) => node.id === connection.sourceId,
      );
      const targetInCluster = typeNodes.some(
        (node) => node.id === connection.targetId,
      );

      if (sourceInCluster && targetInCluster) {
        subGraph.setEdge(connection.sourceId, connection.targetId);
      }
    });

    // Layout the sub-graph
    dagre.layout(subGraph);

    // Update positions, offsetting by cluster
    typeNodes.forEach((node) => {
      const layoutNode = subGraph.node(node.id);
      updatedNodes = updatedNodes.map((n) => {
        if (n.id === node.id) {
          return {
            ...n,
            position: {
              x: layoutNode.x - 100 + xOffset,
              y: layoutNode.y - 25,
            },
          };
        }
        return n;
      });
    });

    // Increment offset for next cluster
    xOffset += 400;
  });

  return updatedNodes;
}

/**
 * Apply a timeline layout specifically for storylines
 */
export function applyTimelineLayout(
  nodes: Node[],
  connections: Connection[],
): Node[] {
  return autoLayout(nodes, connections, {
    direction: "LR", // Left-to-right for timeline
    rankSeparation: 200,
    nodeSeparation: 50,
  });
}

// Handle disconnected components separately
export const layoutWithGroups = (
  nodes: Node[],
  connections: Connection[],
  groups: string[][],
): Node[] => {
  // Create a map to easily find which group a node belongs to
  const nodeToGroupMap = new Map<string, number>();
  groups.forEach((group, index) => {
    group.forEach((nodeId) => {
      nodeToGroupMap.set(nodeId, index);
    });
  });

  // Calculate the position for each group
  const groupPositions: Array<{ x: number; y: number }> = [];
  const GROUP_PADDING = 300;
  const GRID_COLS = Math.ceil(Math.sqrt(groups.length));

  groups.forEach((_, index) => {
    const col = index % GRID_COLS;
    const row = Math.floor(index / GRID_COLS);

    groupPositions.push({
      x: col * GROUP_PADDING,
      y: row * GROUP_PADDING,
    });
  });

  // Layout each group separately
  const layoutedNodes = [...nodes];

  groups.forEach((groupNodeIds, groupIndex) => {
    const groupNodes = nodes.filter((node) => groupNodeIds.includes(node.id));
    const groupConnections = connections.filter(
      (conn) =>
        groupNodeIds.includes(conn.sourceId) &&
        groupNodeIds.includes(conn.targetId),
    );

    // Apply dagre layout to this group
    const layoutedGroupNodes = autoLayout(groupNodes, groupConnections);

    // Apply group position offset
    layoutedGroupNodes.forEach((node) => {
      const nodeIndex = layoutedNodes.findIndex((n) => n.id === node.id);
      if (nodeIndex >= 0) {
        layoutedNodes[nodeIndex] = {
          ...node,
          position: {
            x: node.position.x + groupPositions[groupIndex].x,
            y: node.position.y + groupPositions[groupIndex].y,
          },
        };
      }
    });
  });

  return layoutedNodes;
};

// Find connected components in the graph
export const findConnectedComponents = (
  nodes: Node[],
  connections: Connection[],
): string[][] => {
  const graph = new Map<string, string[]>();

  // Initialize the graph
  nodes.forEach((node) => {
    graph.set(node.id, []);
  });

  // Add edges to the graph
  connections.forEach((connection) => {
    if (graph.has(connection.sourceId)) {
      graph.get(connection.sourceId)!.push(connection.targetId);
    }

    if (graph.has(connection.targetId)) {
      graph.get(connection.targetId)!.push(connection.sourceId);
    }
  });

  // DFS to find connected components
  const visited = new Set<string>();
  const components: string[][] = [];

  const dfs = (nodeId: string, component: string[]) => {
    visited.add(nodeId);
    component.push(nodeId);

    const neighbors = graph.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, component);
      }
    }
  };

  // Find all connected components
  for (const nodeId of graph.keys()) {
    if (!visited.has(nodeId)) {
      const component: string[] = [];
      dfs(nodeId, component);
      components.push(component);
    }
  }

  // Add isolated nodes (no connections) as their own components
  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      components.push([node.id]);
    }
  });

  return components;
};

// Layout a graph with disconnected components
export const layoutEntireGraph = (
  nodes: Node[],
  connections: Connection[],
): Node[] => {
  // Find connected components
  const components = findConnectedComponents(nodes, connections);

  // If only one component, do a simple layout
  if (components.length === 1) {
    return autoLayout(nodes, connections);
  }

  // Layout with component groups
  return layoutWithGroups(nodes, connections, components);
};

/**
 * Apply a radial layout centered around a specific node
 */
export function applyRadialLayout(
  nodes: Node[],
  connections: Connection[],
  centerId: string,
): Node[] {
  if (nodes.length <= 1) return nodes;

  // Find the center node
  const centerNode = nodes.find((node) => node.id === centerId);
  if (!centerNode) return nodes;

  // Create a mapping of node distance from center
  const distances: Record<string, number> = {};
  const visited = new Set<string>([centerId]);
  const queue: Array<{ id: string; distance: number }> = [
    { id: centerId, distance: 0 },
  ];

  // Breadth-first search to find distances
  while (queue.length > 0) {
    const { id, distance } = queue.shift()!;
    distances[id] = distance;

    // Find all connected nodes
    const connectedNodeIds = connections
      .filter((conn) => conn.sourceId === id || conn.targetId === id)
      .map((conn) => (conn.sourceId === id ? conn.targetId : conn.sourceId));

    // Add unvisited nodes to queue
    connectedNodeIds.forEach((connectedId) => {
      if (!visited.has(connectedId)) {
        visited.add(connectedId);
        queue.push({ id: connectedId, distance: distance + 1 });
      }
    });
  }

  // For any unvisited nodes, assign a large distance
  nodes.forEach((node) => {
    if (!distances[node.id]) {
      distances[node.id] = Object.keys(distances).length;
    }
  });

  // Position nodes in circles based on distance
  const angleStep = (2 * Math.PI) / nodes.length;
  const radiusStep = 150;

  // Count nodes at each distance level
  const nodeCountByDistance: Record<number, number> = {};
  Object.values(distances).forEach((distance) => {
    nodeCountByDistance[distance] = (nodeCountByDistance[distance] || 0) + 1;
  });

  // Track angles used for each distance
  const anglesByDistance: Record<number, number[]> = {};

  // Position center node
  const updatedNodes = nodes.map((node) => {
    if (node.id === centerId) {
      return {
        ...node,
        position: { x: 500, y: 300 },
      };
    }

    const distance = distances[node.id];
    const radius = distance * radiusStep;

    // Initialize angles array for this distance if needed
    if (!anglesByDistance[distance]) {
      anglesByDistance[distance] = [];
    }

    // Calculate even distribution of angles for this distance level
    let angle;
    if (nodeCountByDistance[distance] === 1) {
      angle = 0;
    } else {
      const totalAngles = nodeCountByDistance[distance];
      const usedAngles = anglesByDistance[distance].length;
      angle = (2 * Math.PI * usedAngles) / totalAngles;
    }

    anglesByDistance[distance].push(angle);

    return {
      ...node,
      position: {
        x: 500 + radius * Math.cos(angle),
        y: 300 + radius * Math.sin(angle),
      },
    };
  });

  return updatedNodes;
}
