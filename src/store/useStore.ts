import { create } from 'zustand';
import type { ScrapRequest, ScrapItem, FilterState, RequestStatus } from '@/types';
import {
  generateRequestNumber,
  generateId,
} from '@/data/constants';

export interface UserProfile {
  name: string;
  email: string;
  role: 'initiator' | 'reviewer' | 'approver';
  token: string;
  employeeId?: string;
  designation?: string;
}

interface AppState {
  // Auth state
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  setMockUser: (user: UserProfile) => void;
  logout: () => void;

  // Navigation
  currentView: 'dashboard' | 'list' | 'create' | 'preview';
  setCurrentView: (view: 'dashboard' | 'list' | 'create' | 'preview') => void;

  // Requests
  requests: ScrapRequest[];
  currentRequest: ScrapRequest | null;
  setCurrentRequest: (request: ScrapRequest | null) => void;

  // Form state
  formData: Partial<ScrapRequest>;
  formItems: ScrapItem[];
  updateFormData: (data: Partial<ScrapRequest>) => void;
  updateFormItems: (items: ScrapItem[]) => void;
  resetForm: () => void;

  // Actions
  fetchRequests: () => Promise<void>;
  createRequest: (status: RequestStatus) => Promise<ScrapRequest>;
  saveDraft: () => Promise<ScrapRequest>;
  submitRequest: () => Promise<ScrapRequest>;
  reviewRequest: (id: string, status: 'approved' | 'rejected') => Promise<ScrapRequest>;
  approveRequest: (id: string, status: 'approved' | 'rejected') => Promise<ScrapRequest>;
  getRequestById: (id: string) => ScrapRequest | undefined;

  // Filters
  filters: FilterState;
  updateFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  getFilteredRequests: () => ScrapRequest[];
}

import { SAMPLE_REQUESTS } from '@/data/constants';

const initialFormData: Partial<ScrapRequest> = {
  requestNumber: '',
  date: new Date().toISOString().split('T')[0],
  department: '',
  reasonForDisposal: '',
  requirementCheck: null,
  categoryVerification: null,
  remarks: '',
};

const initialFilters: FilterState = {
  searchQuery: '',
  dateRange: { from: '', to: '' },
  department: 'all',
  status: 'all',
};

// Local storage helper keys
const STORAGE_KEYS = {
  USER: 'scrap_disposal_user',
  REQUESTS: 'scrap_disposal_requests',
  DRAFT_FORM: 'scrap_disposal_draft_form',
  DRAFT_ITEMS: 'scrap_disposal_draft_items',
  VIEW: 'scrap_disposal_current_view',
};

// Initial state helpers
const getSavedUser = (): UserProfile | null => {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
};

const getSavedRequests = (): ScrapRequest[] => {
  const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
  if (data) {
    return JSON.parse(data);
  }
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(SAMPLE_REQUESTS));
  return SAMPLE_REQUESTS;
};

const getSavedDraftForm = (): Partial<ScrapRequest> => {
  const data = localStorage.getItem(STORAGE_KEYS.DRAFT_FORM);
  return data ? JSON.parse(data) : { ...initialFormData, requestNumber: generateRequestNumber() };
};

const getSavedDraftItems = (): ScrapItem[] => {
  const data = localStorage.getItem(STORAGE_KEYS.DRAFT_ITEMS);
  return data ? JSON.parse(data) : [];
};

const getSavedView = (): 'dashboard' | 'list' | 'create' | 'preview' => {
  const data = localStorage.getItem(STORAGE_KEYS.VIEW);
  return (data as any) || 'dashboard';
};

export const useStore = create<AppState>((set, get) => ({
  // Auth
  user: getSavedUser(),
  setUser: (user: UserProfile | null) => {
    set({ user });
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },
  setMockUser: (user: UserProfile) => {
    set({ user, currentView: 'dashboard' });
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.VIEW, 'dashboard');
  },
  logout: () => {
    set({ user: null, requests: getSavedRequests(), currentRequest: null, currentView: 'dashboard' });
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.setItem(STORAGE_KEYS.VIEW, 'dashboard');
  },

  // Navigation
  currentView: getSavedView(),
  setCurrentView: (view: 'dashboard' | 'list' | 'create' | 'preview') => {
    set({ currentView: view });
    localStorage.setItem(STORAGE_KEYS.VIEW, view);
  },

  // Requests
  requests: getSavedRequests(),
  currentRequest: null,
  setCurrentRequest: (request: ScrapRequest | null) => set({ currentRequest: request }),

  // Form state
  formData: getSavedDraftForm(),
  formItems: getSavedDraftItems(),
  updateFormData: (data: Partial<ScrapRequest>) =>
    set((state: AppState) => {
      const updated = { ...state.formData, ...data };
      localStorage.setItem(STORAGE_KEYS.DRAFT_FORM, JSON.stringify(updated));
      return { formData: updated };
    }),
  updateFormItems: (items: ScrapItem[]) => {
    set({ formItems: items });
    localStorage.setItem(STORAGE_KEYS.DRAFT_ITEMS, JSON.stringify(items));
  },
  resetForm: () => {
    const freshForm = {
      ...initialFormData,
      requestNumber: generateRequestNumber(),
    };
    set({
      formData: freshForm,
      formItems: [],
    });
    localStorage.setItem(STORAGE_KEYS.DRAFT_FORM, JSON.stringify(freshForm));
    localStorage.setItem(STORAGE_KEYS.DRAFT_ITEMS, JSON.stringify([]));
  },

  // Actions
  fetchRequests: async () => {
    // Already loaded synchronously, but let's sync from localStorage to be safe
    const saved = getSavedRequests();
    set({ requests: saved });
  },

  createRequest: async (status: RequestStatus) => {
    const user = get().user;
    if (!user) throw new Error('Unauthorized: No user session');

    const state = get();
    const requestPayload: ScrapRequest = {
      id: generateId(),
      requestNumber: state.formData.requestNumber || generateRequestNumber(),
      date: state.formData.date || new Date().toISOString().split('T')[0],
      department: state.formData.department || '',
      items: state.formItems,
      reasonForDisposal: state.formData.reasonForDisposal || '',
      requirementCheck: state.formData.requirementCheck ?? null,
      categoryVerification: state.formData.categoryVerification ?? null,
      remarks: state.formData.remarks || '',
      status,
      initiatedBy: {
        name: state.formData.initiatedBy?.name || user.name,
        employeeId: state.formData.initiatedBy?.employeeId || user.employeeId || 'KEO-XXXX',
        designation: state.formData.initiatedBy?.designation || user.designation || 'Maintenance Engineer',
        date: state.formData.date || new Date().toISOString().split('T')[0],
      },
      reviewedBy: {
        name: 'Priya Sharma',
        designation: 'Depot Manager',
        status: 'pending',
      },
      approvedBy: {
        name: 'Arun Reddy',
        designation: 'Head of Operations',
        status: 'pending',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const currentRequests = getSavedRequests();
    const updatedRequests = [requestPayload, ...currentRequests];
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(updatedRequests));

    set({
      requests: updatedRequests,
      currentRequest: requestPayload,
    });

    // Clear drafts after creation
    get().resetForm();

    return requestPayload;
  },

  saveDraft: async () => {
    return get().createRequest('draft');
  },

  submitRequest: async () => {
    return get().createRequest('pending');
  },

  reviewRequest: async (id: string, status: 'approved' | 'rejected') => {
    const user = get().user;
    if (!user) throw new Error('Unauthorized');

    const currentRequests = getSavedRequests();
    const reqIndex = currentRequests.findIndex((r) => r.id === id);
    if (reqIndex === -1) throw new Error('Request not found');

    const request = currentRequests[reqIndex];
    const nextStatus = status === 'approved' ? 'reviewed' : 'rejected';

    const updatedRequest: ScrapRequest = {
      ...request,
      status: nextStatus,
      reviewedBy: {
        name: user.name,
        designation: user.designation || 'Depot Manager',
        status: status,
      },
      updatedAt: new Date().toISOString(),
    };

    currentRequests[reqIndex] = updatedRequest;
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(currentRequests));

    set({
      requests: [...currentRequests],
      currentRequest: updatedRequest,
    });

    return updatedRequest;
  },

  approveRequest: async (id: string, status: 'approved' | 'rejected') => {
    const user = get().user;
    if (!user) throw new Error('Unauthorized');

    const currentRequests = getSavedRequests();
    const reqIndex = currentRequests.findIndex((r) => r.id === id);
    if (reqIndex === -1) throw new Error('Request not found');

    const request = currentRequests[reqIndex];
    const nextStatus = status === 'approved' ? 'approved' : 'rejected';

    const updatedRequest: ScrapRequest = {
      ...request,
      status: nextStatus,
      approvedBy: {
        name: user.name,
        designation: user.designation || 'Head of Operations',
        status: status,
      },
      updatedAt: new Date().toISOString(),
    };

    currentRequests[reqIndex] = updatedRequest;
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(currentRequests));

    set({
      requests: [...currentRequests],
      currentRequest: updatedRequest,
    });

    return updatedRequest;
  },

  getRequestById: (id: string) => {
    return get().requests.find((r: ScrapRequest) => r.id === id);
  },

  // Filters
  filters: { ...initialFilters },
  updateFilters: (filters: Partial<FilterState>) =>
    set((state: AppState) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: { ...initialFilters } }),

  getFilteredRequests: () => {
    const state = get();
    let filtered = [...state.requests];

    // Search
    if (state.filters.searchQuery) {
      const q = state.filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r: ScrapRequest) =>
          r.requestNumber.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q) ||
          r.items.some((i: ScrapItem) => i.materialNumber.toLowerCase().includes(q)) ||
          r.items.some((i: ScrapItem) => i.materialDescription.toLowerCase().includes(q))
      );
    }

    // Date range
    if (state.filters.dateRange.from) {
      filtered = filtered.filter((r: ScrapRequest) => r.date >= state.filters.dateRange.from);
    }
    if (state.filters.dateRange.to) {
      filtered = filtered.filter((r: ScrapRequest) => r.date <= state.filters.dateRange.to);
    }

    // Department
    if (state.filters.department && state.filters.department !== 'all') {
      filtered = filtered.filter((r: ScrapRequest) => r.department === state.filters.department);
    }

    // Status
    if (state.filters.status && state.filters.status !== 'all') {
      filtered = filtered.filter((r: ScrapRequest) => r.status === state.filters.status);
    }

    return filtered;
  },
}));
