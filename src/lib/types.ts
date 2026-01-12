
import { Timestamp } from "firebase/firestore";

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
}

export interface Requirement {
  id: string;
  name: string;
  requiredQuantity: number;
  status: 'Pending' | 'Procured';
  type: 'Primary' | 'Secondary' | 'Tertiary';
  remarks?: string;
  documents?: Array<{ name: string; link: string }>;
}

export interface ClassMeeting {
  id: string;
  topic: string;
  date: string;
  time: string;
  conductedBy: string;
  meetLink: string;
  invitees?: string[];
}

export interface Sop {
  id: string;
  name: string;
  driveLink: string;
}

export interface TrashedItemDocument {
    id: string;
    originalId: string;
    originalCollection: 'procured_items' | 'requirements' | 'class_meetings' | 'sops';
    deletedAt: Timestamp; 
    data: ProcuredItem | Requirement | ClassMeeting | Sop;
}

export interface AppUser {
  id: string;
  email: string;
  status: 'pending' | 'approved' | 'revoked';
}

export interface Otp {
  id: string;
  email: string;
  code: string;
  expiresAt: Timestamp;
}
