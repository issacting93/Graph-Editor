import { create } from "zustand";
import { produce } from "immer";
import { layoutEntireGraph } from "../graph/auto-layout";

export type NodeType =
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
  | "branch"
  | "decision"
  | "logic";

export type ConnectionType =
  | "causal"
  | "temporal"
  | "conditional"
  | "reference";

export interface Node {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  attributes?: {
    name?: string;
    description?: string;
    importance?: number;
    groupId?: string;
    [key: string]: any;
  };
  content?: string;
  choices?: Array<{ text: string; nextNodeId?: string }>;
  errors?: Array<{
    field: string;
    message: string;
    severity: "error" | "warning" | "info";
  }>;
  selected?: boolean;
}

export type Edge = {
  id: string;
  sourceId: string;
  targetId: string;
  type: ConnectionType;
  label?: string;
  properties?: {
    delay?: number;
    probability?: number;
    condition?: string;
  };
};

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  type: ConnectionType;
  label?: string;
  properties?: {
    delay?: number;
    probability?: number;
    condition?: string;
  };
}

export type NodeGroup = {
  id: string;
  name: string;
  nodeIds: string[];
};

export type NodeTemplate = {
  id: string;
  type: NodeType;
  attributes: {
    name: string;
    description?: string;
    [key: string]: any;
  };
  content?: string;
  choices?: Array<{ text: string; nextNodeId?: string }>;
};

type HistoryState = {
  past: Array<{
    nodes: Node[];
    connections: Connection[];
  }>;
  future: Array<{
    nodes: Node[];
    connections: Connection[];
  }>;
};

export interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning" | "info";
}

type State = {
  nodes: Node[];
  connections: Connection[];
  selectedNodeIds: string[];
  selectedConnectionId: string | null;
  history: HistoryState;
  searchQuery: string;
  groups: NodeGroup[];
  edges: Edge[];
};

type Actions = {
  addNode: (node: Node) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  selectNode: (id: string, multiSelect?: boolean) => void;
  deselectAllNodes: () => void;
  addConnection: (connection: Connection) => void;
  removeConnection: (id: string) => void;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  setSelectedConnectionId: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  exportToJSON: () => string;
  validateAllNodes: () => Record<string, ValidationError[]>;
  autoLayout: () => void;
  addEdge: (edge: Edge) => void;
  setSearchQuery: (query: string) => void;
};

const useEditorStore = create<State & Actions>((set, get) => ({
  nodes: [],
  connections: [],
  selectedNodeIds: [],
  selectedConnectionId: null,
  history: { past: [], future: [] },
  searchQuery: "",
  groups: [],
  edges: [],

  // Helper to save current state to history
  saveStateToHistory: () => {
    const { nodes, connections } = get();
    set(
      produce((state: State) => {
        state.history.past.push({
          nodes: [...nodes],
          connections: [...connections],
        });
        state.history.future = [];
      }),
    );
  },

  addNode: (node: Node) => {
    // Save current state before modification
    get().saveStateToHistory();
    set(
      produce((state: State) => {
        state.nodes.push(node);
      }),
    );
  },

  removeNode: (id: string) => {
    get().saveStateToHistory();
    set(
      produce((state: State) => {
        state.nodes = state.nodes.filter((node) => node.id !== id);
        state.connections = state.connections.filter(
          (conn) => conn.sourceId !== id && conn.targetId !== id,
        );
        state.selectedNodeIds = state.selectedNodeIds.filter(
          (nodeId) => nodeId !== id,
        );
      }),
    );
  },

  updateNode: (id: string, updates: Partial<Node>) => {
    get().saveStateToHistory();
    set(
      produce((state: State) => {
        const node = state.nodes.find((n) => n.id === id);
        if (node) {
          Object.assign(node, updates);
        }
      }),
    );
  },

  selectNode: (id: string, multiSelect = false) =>
    set(
      produce((state: State) => {
        if (multiSelect) {
          // If already selected, deselect it
          if (state.selectedNodeIds.includes(id)) {
            state.selectedNodeIds = state.selectedNodeIds.filter(
              (nodeId) => nodeId !== id,
            );
          } else {
            // Otherwise add to selection
            state.selectedNodeIds.push(id);
          }
        } else {
          // Single selection mode
          state.selectedNodeIds = [id];
        }
      }),
    ),

  deselectAllNodes: () =>
    set(
      produce((state: State) => {
        state.selectedNodeIds = [];
      }),
    ),

  addConnection: (connection: Connection) => {
    get().saveStateToHistory();
    set(
      produce((state: State) => {
        state.connections.push(connection);
      }),
    );
  },

  removeConnection: (id: string) => {
    get().saveStateToHistory();
    set(
      produce((state: State) => {
        state.connections = state.connections.filter((conn) => conn.id !== id);
      }),
    );
  },

  updateConnection: (id: string, updates: Partial<Connection>) => {
    get().saveStateToHistory();
    set(
      produce((state: State) => {
        const connection = state.connections.find((c) => c.id === id);
        if (connection) {
          Object.assign(connection, updates);
        }
      }),
    );
  },

  setSelectedConnectionId: (id: string | null) =>
    set(
      produce((state: State) => {
        state.selectedConnectionId = id;
      }),
    ),

  undo: () => {
    const { history } = get();
    if (history.past.length === 0) return;

    set(
      produce((state: State) => {
        const current = {
          nodes: [...state.nodes],
          connections: [...state.connections],
        };
        const previous = history.past.pop();

        if (previous) {
          state.history.future.push(current);
          state.nodes = previous.nodes;
          state.connections = previous.connections;
        }
      }),
    );
  },

  redo: () => {
    const { history } = get();
    if (history.future.length === 0) return;

    set(
      produce((state: State) => {
        const current = {
          nodes: [...state.nodes],
          connections: [...state.connections],
        };
        const next = history.future.pop();

        if (next) {
          state.history.past.push(current);
          state.nodes = next.nodes;
          state.connections = next.connections;
        }
      }),
    );
  },

  exportToJSON: () => {
    const { nodes, connections, groups } = get();
    return JSON.stringify(
      {
        nodes,
        connections,
        groups,
        version: "1.0",
      },
      null,
      2,
    );
  },

  validateAllNodes: () => {
    const { nodes } = get();
    const errors: Record<string, ValidationError[]> = {};

    nodes.forEach((node) => {
      errors[node.id] = [];

      // Check for name
      if (!node.attributes?.name || node.attributes.name.trim() === "") {
        errors[node.id].push({
          field: "name",
          message: "Node must have a name",
          severity: "error",
        });
      }

      // Check for content on dialogue nodes
      if (
        node.type === "dialogue" &&
        (!node.content || node.content.trim() === "")
      ) {
        errors[node.id].push({
          field: "content",
          message: "Dialogue node must have content",
          severity: "error",
        });
      }

      // Check for choices on decision nodes
      if (
        node.type === "decision" &&
        (!node.choices || node.choices.length === 0)
      ) {
        errors[node.id].push({
          field: "choices",
          message: "Decision node must have at least one choice",
          severity: "error",
        });
      }
    });

    // Update nodes with validation errors
    set(
      produce((state: State) => {
        state.nodes.forEach((node) => {
          node.errors = errors[node.id] || [];
        });
      }),
    );

    return errors;
  },

  autoLayout: () => {
    const { nodes, connections } = get();
    const layoutedNodes = layoutEntireGraph(nodes, connections);

    set(
      produce((state: State) => {
        state.nodes.forEach((node) => {
          const layoutNode = layoutedNodes.find((n) => n.id === node.id);
          if (layoutNode) {
            node.position = layoutNode.position;
          }
        });
      }),
    );
  },

  addEdge: (edge: Edge) => {
    get().saveStateToHistory();
    set(
      produce((state: State) => {
        state.edges.push(edge);

        // Also add as connection for backward compatibility
        state.connections.push({
          id: edge.id,
          sourceId: edge.sourceId,
          targetId: edge.targetId,
          type: edge.type,
          label: edge.label,
          properties: edge.properties,
        });
      }),
    );
  },

  setSearchQuery: (query: string) =>
    set(
      produce((state: State) => {
        state.searchQuery = query;
      }),
    ),
}));

export { useEditorStore };
