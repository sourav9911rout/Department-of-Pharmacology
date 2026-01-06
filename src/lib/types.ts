export interface ProcuredItem {
  id: string;
  name: string;
  category: 'Electronics' | 'Furniture' | 'Stationery' | 'Miscellaneous';
  quantity: number;
  dateOfProcurement: string;
  installationStatus: 'Pending' | 'Installed' | 'Not Applicable';
  dateOfInstallation?: string;
  remarks?: string;
}

export interface Requirement {
  id: string;
  name: string;
  requiredQuantity: number;
  priorityLevel: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Procured' | 'Partial';
  type: 'Primary' | 'Secondary' | 'Tertiary';
}

export interface ClassMeeting {
  id: string;
  topic: string;
  date: string;
  time: string;
  conductedBy: string;
  meetLink: string;
}

export interface DocumentLink {
  id:string;
  title: string;
  description: string;
  driveLink: string;
}
