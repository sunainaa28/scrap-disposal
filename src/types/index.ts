export interface ScrapItem {
  id: string;
  srNo: number;
  materialDescription: string;
  materialNumber: string;
  uom: string;
  quantity: number;
  typeOfWaste: string;
  fromLocation: string;
  toLocation: string;
  photo?: string;
}

export interface ScrapRequest {
  id: string;
  requestNumber: string;
  date: string;
  department: string;
  items: ScrapItem[];
  photos?: string[];
  category: string;
  system: string;
  location: string;
  descriptionReason: string;
  requirementCheck: 'yes' | 'no' | null;
  categoryVerification: 'yes' | 'no' | null;
  remarks: string;
  status: 'draft' | 'pending' | 'reviewed' | 'approved' | 'rejected';
  initiatedBy: {
    name: string;
    employeeId: string;
    designation: string;
    date: string;
  };
  reviewedBy: {
    name: string;
    designation: string;
    status: 'pending' | 'approved' | 'rejected';
  };
  approvedBy: {
    name: string;
    designation: string;
    status: 'pending' | 'approved' | 'rejected';
  };
  createdAt: string;
  updatedAt: string;
}

export type RequestStatus = 'draft' | 'pending' | 'reviewed' | 'approved' | 'rejected';

export interface FilterState {
  searchQuery: string;
  dateRange: {
    from: string;
    to: string;
  };
  department: string;
  status: RequestStatus | 'all';
}
