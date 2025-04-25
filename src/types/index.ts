// Repository types
export interface Repository {
  name: string;
  url: string;
  owner: string;
  description?: string;
}

// Flow chart types
export interface FlowNode {
  id: string;
  type: 'file' | 'folder';
  name: string;
  position: Position;
  parentId?: string;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
}

export interface Position {
  x: number;
  y: number;
}

// Chat types
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}