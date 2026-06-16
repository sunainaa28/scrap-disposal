import { useStore } from '@/store/useStore';
import {
  FileText,
  TrendingUp,
  Recycle,
  File,
  Plus,
  ArrowRight,
} from 'lucide-react';
import type { ScrapRequest, RequestStatus } from '@/types';

export default function Dashboard() {
  const { user, requests, setCurrentView, setCurrentRequest, updateFilters, resetForm } = useStore();

  // Get recent 5 requests (sorted by createdAt or updatedAt descending)
  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5);

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending' || r.status === 'reviewed').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    drafts: requests.filter((r) => r.status === 'draft').length,
  };

  const handleStatClick = (statusKey: RequestStatus | 'all') => {
    updateFilters({ status: statusKey });
    setCurrentView('list');
  };

  const handleViewRequest = (request: ScrapRequest) => {
    setCurrentRequest(request);
    setCurrentView('preview');
  };

  const handleCreateNew = () => {
    resetForm();
    setCurrentView('create');
  };

  // Helper to format status badges matching screenshot
  const getStatusBadge = (status: ScrapRequest['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Rejected
          </span>
        );
      case 'reviewed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Reviewed
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
            Draft
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scrap Disposal Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of materials and scrap disposal operations.
          </p>
        </div>
        {user?.role === 'initiator' && (
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0f3d8c] hover:bg-[#0a2e6b] text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Scrap Request
          </button>
        )}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card 1 - Total Requests */}
        <div
          onClick={() => handleStatClick('all')}
          className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col justify-between h-36 hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-100">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm font-medium text-gray-400 mt-1">Total Requests</div>
          </div>
        </div>

        {/* Card 2 - Pending Approval */}
        <div
          onClick={() => handleStatClick('pending')}
          className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col justify-between h-36 hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 transition-colors group-hover:bg-amber-100">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{stats.pending}</div>
            <div className="text-sm font-medium text-gray-400 mt-1">Pending Approval</div>
          </div>
        </div>

        {/* Card 3 - Approved */}
        <div
          onClick={() => handleStatClick('approved')}
          className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col justify-between h-36 hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 transition-colors group-hover:bg-emerald-100">
            <Recycle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{stats.approved}</div>
            <div className="text-sm font-medium text-gray-400 mt-1">Approved</div>
          </div>
        </div>

        {/* Card 4 - Drafts */}
        <div
          onClick={() => handleStatClick('draft')}
          className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col justify-between h-36 hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 transition-colors group-hover:bg-gray-100">
            <File className="w-5 h-5" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{stats.drafts}</div>
            <div className="text-sm font-medium text-gray-400 mt-1">Drafts</div>
          </div>
        </div>
      </div>

      {/* Recent Requests Section */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Scrap Disposal Requests</h2>
            <p className="text-xs text-gray-400 mt-0.5">Latest 5 entries from the module.</p>
          </div>
          <button
            onClick={() => handleStatClick('all')}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#0f3d8c] hover:text-[#0a2e6b] transition-colors cursor-pointer"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {recentRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No scrap disposal requests found. Create a new request to get started.
            </div>
          ) : (
            recentRequests.map((request) => (
              <div
                key={request.id}
                onClick={() => handleViewRequest(request)}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-[#0f3d8c] text-sm group-hover:underline">
                    {request.requestNumber}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    {request.department || 'No Department'} · {request.items?.length || 0} item(s) · {request.date}
                  </span>
                </div>
                <div>{getStatusBadge(request.status)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
