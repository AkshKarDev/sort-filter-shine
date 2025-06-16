
export interface DataItem {
  id: number;
  name: string;
  email: string;
  department: string;
  status: string;
  salary: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface DataFilters {
  [key: string]: string;
}

export interface SortConfig {
  field: keyof DataItem;
  direction: 'asc' | 'desc';
}

export interface GroupConfig {
  field: keyof DataItem;
}
