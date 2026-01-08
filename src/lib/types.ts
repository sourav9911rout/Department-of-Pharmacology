
export interface ProcuredItem {
  id: string;
  name: string;
  category: 'Electronics' | 'Furniture' | 'Stationery' | 'Miscellaneous';
  quantity: number;
  dateOfProcurement: string;
  installationStatus: 'Pending' | 'Installed' | 'Not Applicable';
  dateOfInstallation?: string;
  remarks?: string;
  documents?: Array<{ name: string; link: string }>;
  deleted?: boolean;
  deletedAt?: string;
}

export interface Requirement {
  id: string;
  name: string;
  requiredQuantity: number;
  status: 'Pending' | 'Procured';
  type: 'Primary' | 'Secondary' | 'Tertiary';
  remarks?: string;
  documents?: Array<{ name: string; link: string }>;
  deleted?: boolean;
  deletedAt?: string;
}

export interface ClassMeeting {
  id: string;
  topic: string;
  date: string;
  time: string;
  conductedBy: string;
  meetLink: string;
}

export interface Sop {
  id: string;
  name: string;
  driveLink: string;
}

export type TrashedItem = (ProcuredItem | Requirement) & {
  originalCollection: 'procured_items' | 'requirements';
};
