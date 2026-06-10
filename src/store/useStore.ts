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
  currentView: 'list' | 'create' | 'preview';
  setCurrentView: (view: 'list' | 'create' | 'preview') => void;

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

const initialFormData: Partial<ScrapRequest> = {
  requestNumber: generateRequestNumber(),
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

export const useStore = create<AppState>((set, get) => ({
  // Auth
  user: null,
  setUser: (user: UserProfile | null) => set({ user }),
  setMockUser: (user: UserProfile) => set({ user, currentView: 'list' }),
  logout: () => {
    set({ user: null, requests: [], currentRequest: null, currentView: 'list' });
  },

  // Navigation
  currentView: 'list',
  setCurrentView: (view: 'list' | 'create' | 'preview') => set({ currentView: view }),

  // Requests
  requests: [],
  currentRequest: null,
  setCurrentRequest: (request: ScrapRequest | null) => set({ currentRequest: request }),

  // Form state
  formData: { ...initialFormData },
  formItems: [],
  updateFormData: (data: Partial<ScrapRequest>) =>
    set((state: AppState) => ({ formData: { ...state.formData, ...data } })),
  updateFormItems: (items: ScrapItem[]) => set({ formItems: items }),
  resetForm: () =>
    set({
      formData: {
        ...initialFormData,
        requestNumber: generateRequestNumber(),
      },
      formItems: [],
    }),

  // Actions
  fetchRequests: async () => {
    const token = get().user?.token;
    if (!token) return;

    try {
      const response = await fetch('/api/requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      set({ requests: data });
    } catch (error) {
      console.error('fetchRequests error:', error);
    }
  },

  createRequest: async (status: RequestStatus) => {
    const token = get().user?.token;
    if (!token) throw new Error('Unauthorized: No access token');

    const state = get();
    const requestPayload = {
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
    };

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create request');
      }

      const created: ScrapRequest = await response.json();
      set((state: AppState) => ({
        requests: [created, ...state.requests],
        currentRequest: created,
      }));

      return created;
    } catch (error) {
      console.error('createRequest error:', error);
      throw error;
    }
  },

  saveDraft: () => {
    return get().createRequest('draft');
  },

  submitRequest: () => {
    return get().createRequest('pending');
  },

  reviewRequest: async (id: string, status: 'approved' | 'rejected') => {
    const token = get().user?.token;
    if (!token) throw new Error('Unauthorized: No access token');

    try {
      const response = await fetch(`/api/requests/${id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to review request');
      }

      const updated: ScrapRequest = await response.json();
      set((state: AppState) => ({
        requests: state.requests.map((r) => r.id === id ? updated : r),
        currentRequest: updated,
      }));

      return updated;
    } catch (error) {
      console.error('reviewRequest error:', error);
      throw error;
    }
  },

  approveRequest: async (id: string, status: 'approved' | 'rejected') => {
    const token = get().user?.token;
    if (!token) throw new Error('Unauthorized: No access token');

    try {
      const response = await fetch(`/api/requests/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to approve request');
      }

      const updated: ScrapRequest = await response.json();
      set((state: AppState) => ({
        requests: state.requests.map((r) => r.id === id ? updated : r),
        currentRequest: updated,
      }));

      return updated;
    } catch (error) {
      console.error('approveRequest error:', error);
      throw error;
    }
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
