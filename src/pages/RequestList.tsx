import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { DEPARTMENTS, STATUS_CONFIG } from '@/data/constants';
import type { RequestStatus, ScrapRequest } from '@/types';
import {
  Search,
  Plus,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  X,
  Calendar,
  Building2,
  Flag,
} from 'lucide-react';

export default function RequestList() {
  const requests = useStore((state) => state.requests);
  const filters = useStore((state) => state.filters);
  const updateFilters = useStore((state) => state.updateFilters);
  const resetFilters = useStore((state) => state.resetFilters);
  const getFilteredRequests = useStore((state) => state.getFilteredRequests);
  const setCurrentView = useStore((state) => state.setCurrentView);
  const setCurrentRequest = useStore((state) => state.setCurrentRequest);
  const resetForm = useStore((state) => state.resetForm);

  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredRequests = getFilteredRequests();
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewRequest = (requestId: string) => {
    const request = requests.find((r: ScrapRequest) => r.id === requestId);
    if (request) {
      setCurrentRequest(request);
      setCurrentView('preview');
    }
  };

  const handleCreateNew = () => {
    resetForm();
    setCurrentView('create');
  };

  const handleClearFilters = () => {
    resetFilters();
    setCurrentPage(1);
  };

  const activeFilterCount = [
    filters.searchQuery,
    filters.dateRange.from || filters.dateRange.to,
    filters.department && filters.department !== 'all',
    filters.status && filters.status !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex items-center justify-between">
        <div>
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold mb-1.5">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="hover:text-gray-600 transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-gray-600">Scrap Disposal</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">Scrap Disposal Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage and track all scrap material disposal request notes.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0f3d8c] hover:bg-[#0a2e6b] text-white rounded-lg text-sm font-semibold transition cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Request
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {(
          [
            { key: 'all', label: 'Total Requests', count: requests.length },
            {
              key: 'draft',
              label: 'Drafts',
              count: requests.filter((r: ScrapRequest) => r.status === 'draft').length,
            },
            {
              key: 'pending',
              label: 'Pending',
              count: requests.filter((r: ScrapRequest) => r.status === 'pending').length,
            },
            {
              key: 'reviewed',
              label: 'Reviewed',
              count: requests.filter((r: ScrapRequest) => r.status === 'reviewed').length,
            },
            {
              key: 'approved',
              label: 'Approved',
              count: requests.filter((r: ScrapRequest) => r.status === 'approved').length,
            },
          ] as const
        ).map((stat) => (
          <button
            key={stat.key}
            onClick={() => {
              updateFilters({
                status: stat.key === 'all' ? 'all' : (stat.key as RequestStatus),
              });
              setCurrentPage(1);
            }}
            className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-md ${
              filters.status === stat.key
                ? 'border-keolis-blue ring-1 ring-keolis-blue/20'
                : 'border-gray-200'
            }`}
          >
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
          </button>
        ))}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => {
                updateFilters({ searchQuery: e.target.value });
                setCurrentPage(1);
              }}
              placeholder="Search by request number, material number, department..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-keolis-blue/20 focus:border-keolis-blue bg-gray-50/50"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'border-keolis-blue text-keolis-blue bg-keolis-blue/5'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 bg-keolis-blue text-white text-[10px] font-bold rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Date Range */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  <Calendar className="w-3 h-3" />
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) =>
                    updateFilters({
                      dateRange: { ...filters.dateRange, from: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-keolis-blue/20 focus:border-keolis-blue"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  <Calendar className="w-3 h-3" />
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) =>
                    updateFilters({
                      dateRange: { ...filters.dateRange, to: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-keolis-blue/20 focus:border-keolis-blue"
                />
              </div>

              {/* Department */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  <Building2 className="w-3 h-3" />
                  Department
                </label>
                <div className="relative">
                  <select
                    value={filters.department}
                    onChange={(e) => {
                      updateFilters({ department: e.target.value });
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-keolis-blue/20 focus:border-keolis-blue bg-white"
                  >
                    <option value="all">All Departments</option>
                    {DEPARTMENTS.map((dept: string) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  <Flag className="w-3 h-3" />
                  Status
                </label>
                <div className="relative">
                  <select
                    value={filters.status}
                    onChange={(e) => {
                      updateFilters({ status: e.target.value as RequestStatus | 'all' });
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-keolis-blue/20 focus:border-keolis-blue bg-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending Review</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No requests found
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {activeFilterCount > 0
                ? 'Try adjusting your filters or search query'
                : 'Get started by creating a new scrap disposal request'}
            </p>
            {activeFilterCount > 0 ? (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm font-medium text-keolis-blue hover:bg-keolis-blue/5 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-keolis-blue text-white rounded-lg text-sm font-medium hover:bg-keolis-blue-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Request
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Request Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedRequests.map((request: ScrapRequest) => {
                    const statusStyle = STATUS_CONFIG[request.status];
                    return (
                      <tr
                        key={request.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-keolis-blue text-sm">
                            {request.requestNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600">
                          {request.date}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-700">
                            {request.department}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600">
                          {request.items.length} item
                          {request.items.length !== 1 ? 's' : ''}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyle.color}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                request.status === 'approved'
                                  ? 'bg-emerald-500'
                                  : request.status === 'rejected'
                                    ? 'bg-red-500'
                                    : 'bg-amber-400'
                              }`}
                            ></span>
                            {statusStyle.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => handleViewRequest(request.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-keolis-blue hover:bg-keolis-blue/5 rounded-md transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredRequests.length)}{' '}
                  of {filteredRequests.length} requests
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 flex items-center justify-center text-xs font-medium rounded-md transition-colors ${
                          page === currentPage
                            ? 'bg-keolis-blue text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
