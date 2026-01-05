export interface ProcuredItem {
  id: string;
  name: string;
  category: 'Electronics' | 'Furniture' | 'Stationery' | 'Miscellaneous';
  quantity: number;
  procurementDate: string;
  remarks?: string;
}

export interface Requirement {
  id: string;
  name: string;
  requiredQuantity: number;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Procured' | 'Partial';
  type: 'Primary' | 'Secondary';
}

export interface ScheduledEvent {
  id: string;
  topic: string;
  date: string;
  time: string;
  conductedBy: string;
  meetLink: string;
}

export interface DocumentLink {
  id: string;
  title: string;
  description: string;
  driveLink: string;
}
