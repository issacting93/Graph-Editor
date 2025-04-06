import { create } from 'zustand';
import { produce } from 'immer';

export type NodeType = 'character' | 'location' | 'event' | 'memory' | 'item' | 
  'dialogue' | 'choice' | 'condition' | 'audio' | 'knowledge' | 'branch' |
  'decision' | 'logic';

export type ConnectionType = 'causal' | 'temporal' | 'conditional' | 'reference';

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
    severity: 'error' | 'warning' | 'info';
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

type State = {
  nodes: Node[];
  connections: Connection[];
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
};

type Actions = {
  addNode: (node: Node) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  setSelectedNodeId: (id: string | null) => void;
  addConnection: (connection: Connection) => void;
  removeConnection: (id: string) => void;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  setSelectedConnectionId: (id: string | null) => void;
};

const useEditorStore = create<State & Actions>((set) => ({
  nodes: [],
  connections: [],
  selectedNodeId: null,
  selectedConnectionId: null,

  addNode: (node: Node) => 
    set(produce((state: State) => {
      state.nodes.push(node);
    })),

  removeNode: (id: string) => 
    set(produce((state: State) => {
      state.nodes = state.nodes.filter((node) => node.id !== id);
      state.connections = state.connections.filter(
        (conn) => conn.sourceId !== id && conn.targetId !== id
      );
    })),

  updateNode: (id: string, updates: Partial<Node>) => 
    set(produce((state: State) => {
      const node = state.nodes.find((n) => n.id === id);
      if (node) {
        Object.assign(node, updates);
      }
    })),

  setSelectedNodeId: (id: string | null) => 
    set(produce((state: State) => {
      state.selectedNodeId = id;
    })),

  addConnection: (connection: Connection) => 
    set(produce((state: State) => {
      state.connections.push(connection);
    })),

  removeConnection: (id: string) => 
    set(produce((state: State) => {
      state.connections = state.connections.filter((conn) => conn.id !== id);
    })),

  updateConnection: (id: string, updates: Partial<Connection>) => 
    set(produce((state: State) => {
      const connection = state.connections.find((c) => c.id === id);
      if (connection) {
        Object.assign(connection, updates);
      }
    })),

  setSelectedConnectionId: (id: string | null) => 
    set(produce((state: State) => {
      state.selectedConnectionId = id;
    })),
}));

export { useEditorStore }; 