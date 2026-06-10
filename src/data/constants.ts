import type { ScrapRequest } from '@/types';

export const DEPARTMENTS = [
  'OCC',
  'Rolling Stock',
  'Track',
  'Signalling',
  'Telecom',
  'Power Supply',
  'MEP',
  'AFC',
  'Civil',
  'Warehouse',
] as const;

export const UOM_OPTIONS = [
  'Nos',
  'Meter',
  'Kg',
  'Liter',
  'Set',
  'Unit',
  'Box',
] as const;

export const WASTE_TYPES = [
  'Damaged',
  'Obsolete',
  'Expired',
  'Broken',
  'Replaced',
  'Scrap',
] as const;

export const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  pending: { label: 'Pending Review', color: 'bg-amber-50 text-amber-700 border-amber-300' },
  reviewed: { label: 'Reviewed', color: 'bg-blue-50 text-blue-700 border-blue-300' },
  approved: { label: 'Approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  rejected: { label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-300' },
} as const;

export const WORKFLOW_STATUS_CONFIG = {
  pending: { label: 'Pending', dot: 'bg-amber-400' },
  approved: { label: 'Approved', dot: 'bg-emerald-500' },
  rejected: { label: 'Rejected', dot: 'bg-red-500' },
} as const;

export function generateRequestNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SDRN-${year}-${random}`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export const DEFAULT_EMPLOYEE = {
  name: 'Rajesh Kumar',
  employeeId: 'HMRL-EMP-4502',
  designation: 'Senior Engineer (Rolling Stock)',
  date: new Date().toISOString().split('T')[0],
};

export const DEFAULT_REVIEWER = {
  name: 'Priya Sharma',
  designation: 'Depot Manager',
  status: 'pending' as const,
};

export const DEFAULT_HOD = {
  name: 'Arun Reddy',
  designation: 'Head of Operations',
  status: 'pending' as const,
};

export const SAMPLE_REQUESTS: ScrapRequest[] = [
  {
    id: 'req-001',
    requestNumber: 'SDRN-2026-0042',
    date: '2026-02-02',
    department: 'OCC',
    items: [
      {
        id: 'item-001',
        srNo: 1,
        materialDescription: 'Conveyor Belt (Heavy Duty)',
        materialNumber: 'MAT-2026-8821',
        uom: 'Nos',
        quantity: 12,
        typeOfWaste: 'Damaged',
        scrapLocation: 'Raidurg Depot - Warehouse A',
      },
      {
        id: 'item-002',
        srNo: 2,
        materialDescription: 'Hydraulic Oil (Drum)',
        materialNumber: 'MAT-2026-4430',
        uom: 'Liter',
        quantity: 5,
        typeOfWaste: 'Expired',
        scrapLocation: 'Raidurg Depot - Maintenance Bay',
      },
      {
        id: 'item-003',
        srNo: 3,
        materialDescription: 'Brake Pads (Set of 4)',
        materialNumber: 'MAT-2026-1192',
        uom: 'Set',
        quantity: 8,
        typeOfWaste: 'Obsolete',
        scrapLocation: 'Miyapur Depot - Yard Storage',
      },
    ],
    reasonForDisposal: 'Belt got damaged during operation and replaced.',
    requirementCheck: 'no',
    categoryVerification: 'no',
    remarks: '',
    status: 'pending',
    initiatedBy: DEFAULT_EMPLOYEE,
    reviewedBy: DEFAULT_REVIEWER,
    approvedBy: DEFAULT_HOD,
    createdAt: '2026-02-02T10:30:00Z',
    updatedAt: '2026-02-02T10:30:00Z',
  },
  {
    id: 'req-002',
    requestNumber: 'SDRN-2026-0038',
    date: '2026-01-28',
    department: 'Rolling Stock',
    items: [
      {
        id: 'item-004',
        srNo: 1,
        materialDescription: 'Overhead Wire Tensioner',
        materialNumber: 'MAT-2026-3201',
        uom: 'Unit',
        quantity: 3,
        typeOfWaste: 'Broken',
        scrapLocation: 'Nagole Depot - Store Room',
      },
    ],
    reasonForDisposal: 'Equipment broken beyond repair due to wear and tear.',
    requirementCheck: 'yes',
    categoryVerification: 'yes',
    remarks: 'Please expedite the disposal process.',
    status: 'approved',
    initiatedBy: {
      name: 'Suresh Naidu',
      employeeId: 'HMRL-EMP-3891',
      designation: 'Junior Engineer (Track)',
      date: '2026-01-28',
    },
    reviewedBy: {
      name: 'Priya Sharma',
      designation: 'Depot Manager',
      status: 'approved',
    },
    approvedBy: {
      name: 'Arun Reddy',
      designation: 'Head of Operations',
      status: 'approved',
    },
    createdAt: '2026-01-28T14:15:00Z',
    updatedAt: '2026-01-30T09:00:00Z',
  },
  {
    id: 'req-003',
    requestNumber: 'SDRN-2026-0035',
    date: '2026-01-25',
    department: 'Signalling',
    items: [
      {
        id: 'item-005',
        srNo: 1,
        materialDescription: 'Signal Relay Module (Type C)',
        materialNumber: 'MAT-2026-1156',
        uom: 'Nos',
        quantity: 20,
        typeOfWaste: 'Replaced',
        scrapLocation: 'Ameerpet Station - Signal Room',
      },
      {
        id: 'item-006',
        srNo: 2,
        materialDescription: 'Cable Gland (IP68)',
        materialNumber: 'MAT-2026-7743',
        uom: 'Box',
        quantity: 2,
        typeOfWaste: 'Expired',
        scrapLocation: 'Ameerpet Station - Signal Room',
      },
    ],
    reasonForDisposal: 'Old relays replaced with new digital units during upgrade.',
    requirementCheck: 'no',
    categoryVerification: 'yes',
    remarks: '',
    status: 'reviewed',
    initiatedBy: {
      name: 'Vikram Patel',
      employeeId: 'HMRL-EMP-5120',
      designation: 'Signal Engineer',
      date: '2026-01-25',
    },
    reviewedBy: {
      name: 'Priya Sharma',
      designation: 'Depot Manager',
      status: 'approved',
    },
    approvedBy: {
      name: 'Arun Reddy',
      designation: 'Head of Operations',
      status: 'pending',
    },
    createdAt: '2026-01-25T11:00:00Z',
    updatedAt: '2026-01-29T16:45:00Z',
  },
];
