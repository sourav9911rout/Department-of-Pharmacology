import type { ProcuredItem, Requirement, ScheduledEvent, DocumentLink } from './types';

export const procuredItems: ProcuredItem[] = [
  { id: '1', name: 'Dell Latitude 7420 Laptop', category: 'Electronics', quantity: 15, procurementDate: '2023-10-15', remarks: 'For new interns' },
  { id: '2', name: 'Ergonomic Office Chair', category: 'Furniture', quantity: 25, procurementDate: '2023-09-20' },
  { id: '3', name: 'A4 Paper Reams', category: 'Stationery', quantity: 200, procurementDate: '2023-11-01', remarks: 'High-quality 80gsm' },
  { id: '4', name: 'Logitech MK270 Keyboard Mouse Combo', category: 'Electronics', quantity: 30, procurementDate: '2023-10-25' },
  { id: '5', name: 'Whiteboard (6x4 ft)', category: 'Furniture', quantity: 5, procurementDate: '2023-08-10' },
];

export const requirements: Requirement[] = [
  // Primary
  { id: 'R1', name: 'HP LaserJet Pro M404dn', requiredQuantity: 5, priority: 'High', status: 'Pending', type: 'Primary' },
  { id: 'R2', name: 'Standing Desks', requiredQuantity: 10, priority: 'Medium', status: 'Pending', type: 'Primary' },
  { id: 'R3', name: 'ViewSonic 24-inch Monitors', requiredQuantity: 15, priority: 'High', status: 'Partial', type: 'Primary' },
  { id: 'R4', name: 'UPS for Critical Systems', requiredQuantity: 3, priority: 'High', status: 'Procured', type: 'Primary' },
  
  // Secondary
  { id: 'R5', name: 'Staplers and Staples', requiredQuantity: 50, priority: 'Low', status: 'Pending', type: 'Secondary' },
  { id: 'R6', name: 'Team-branded Mugs', requiredQuantity: 100, priority: 'Low', status: 'Pending', type: 'Secondary' },
  { id: 'R7', name: 'First Aid Kits', requiredQuantity: 10, priority: 'Medium', status: 'Procured', type: 'Secondary' },
  { id: 'R8', name: 'Cable Management Boxes', requiredQuantity: 40, priority: 'Medium', status: 'Pending', type: 'Secondary' },
];

export const scheduledEvents: ScheduledEvent[] = [
  { id: 'E1', topic: 'Quarterly Performance Review', date: '2024-08-15', time: '10:00 AM', conductedBy: 'Management', meetLink: 'https://meet.google.com/xyz-abcd-efg' },
  { id: 'E2', topic: 'Advanced React Patterns Workshop', date: '2024-08-22', time: '02:00 PM', conductedBy: 'Dr. Evelyn Reed', meetLink: 'https://meet.google.com/xyz-abcd-efg' },
  { id: 'E3', topic: 'Project Phoenix Kick-off', date: '2024-09-01', time: '11:00 AM', conductedBy: 'Project Lead', meetLink: 'https://meet.google.com/xyz-abcd-efg' },
  // Past events
  { id: 'E4', topic: 'Intro to Departmental SOPs', date: '2024-07-20', time: '09:00 AM', conductedBy: 'HR Department', meetLink: 'https://meet.google.com/xyz-abcd-efg' },
  { id: 'E5', topic: 'Cybersecurity Awareness Training', date: '2024-07-10', time: '01:00 PM', conductedBy: 'IT Security', meetLink: 'https://meet.google.com/xyz-abcd-efg' },
];

export const documentLinks: DocumentLink[] = [
    { id: 'D1', title: 'Procurement Guidelines 2024', description: 'Official SOPs for all departmental procurement.', driveLink: 'https://docs.google.com/document/d/example1' },
    { id: 'D2', title: 'Annual Budget Approval', description: 'Signed approval for the current fiscal year\'s budget.', driveLink: 'https://docs.google.com/document/d/example2' },
    { id: 'D3', title: 'Onboarding Resources Folder', description: 'A collection of resources for new team members.', driveLink: 'https://docs.google.com/folder/d/example3' },
    { id: 'D4', title: 'Project Archive', description: 'Documentation for all completed projects.', driveLink: 'https://docs.google.com/folder/d/example4' },
];
