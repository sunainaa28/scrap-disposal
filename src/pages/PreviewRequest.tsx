import { useState } from 'react';
import { useStore } from '@/store/useStore';
import type { ScrapItem } from '@/types';
import {
  ArrowLeft,
  Printer,
  FileDown,
} from 'lucide-react';

export default function PreviewRequest() {
  const currentRequest = useStore((state) => state.currentRequest);
  const setCurrentView = useStore((state) => state.setCurrentView);
  const user = useStore((state) => state.user);
  const reviewRequest = useStore((state) => state.reviewRequest);
  const approveRequest = useStore((state) => state.approveRequest);
  const [submitting, setSubmitting] = useState(false);

  if (!currentRequest) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FileDown className="w-7 h-7 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Request Selected
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Please select a request to preview
        </p>
        <button
          onClick={() => setCurrentView('list')}
          className="px-4 py-2 bg-[#0f3d8c] text-white rounded-lg text-sm font-medium hover:bg-[#0a2e6b] transition-colors cursor-pointer"
        >
          Back to List
        </button>
      </div>
    );
  }

  const handleAction = async (actionStatus: 'approved' | 'rejected') => {
    setSubmitting(true);
    try {
      if (user?.role === 'reviewer') {
        await reviewRequest(currentRequest.id, actionStatus);
      } else if (user?.role === 'approver') {
        await approveRequest(currentRequest.id, actionStatus);
      }
    } catch (err) {
      console.error("Failed to perform workflow action:", err);
      alert(err instanceof Error ? err.message : "Workflow action failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    handlePrint();
  };

  const getWorkflowStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
            <span className="w-1 h-1 rounded-full bg-red-500"></span>
            Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
            <span className="w-1 h-1 rounded-full bg-amber-500"></span>
            Pending
          </span>
        );
    }
  };

  // Check if active user can review/approve
  const canReview = user?.role === 'reviewer' && currentRequest.status === 'pending';
  const canApprove = user?.role === 'approver' && currentRequest.status === 'reviewed';

  return (
    <div className="space-y-6">
      {/* Top Action Bar / Breadcrumbs (Hidden during print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
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
            <button
              onClick={() => setCurrentView('list')}
              className="hover:text-gray-600 transition-colors"
            >
              Scrap Disposal
            </button>
            <span>/</span>
            <span className="text-gray-600 truncate">{currentRequest.requestNumber}</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">Scrap Disposal Request Note</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('list')}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </button>
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer shadow-sm"
          >
            <FileDown className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f3d8c] hover:bg-[#0a2e6b] text-white rounded-lg text-sm font-semibold transition cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="print-area bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header section with Generated Date */}
        <div className="px-10 pt-10 pb-6 border-b border-gray-200 relative">
          <div className="absolute top-4 right-10 text-[10px] text-gray-400 font-semibold no-print">
            Generated {new Date(currentRequest.createdAt).toLocaleString()}
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-wide text-center">
              Scrap Disposal Request Note
            </h2>
            <p className="text-xs text-gray-400 font-bold tracking-wider text-center uppercase mt-1">
              Scrap Disposal Portal
            </p>
          </div>
        </div>

        {/* Meta Grid - Exact match to Photo 4 layout */}
        <div className="px-10 py-6 border-b border-gray-200 bg-gray-50/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                REQUEST NUMBER
              </span>
              <span className="text-sm font-extrabold text-[#0f3d8c] font-mono">
                {currentRequest.requestNumber}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                DATE
              </span>
              <span className="text-sm font-bold text-gray-800">
                {currentRequest.date}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                DEPARTMENT
              </span>
              <span className="text-sm font-bold text-gray-800">
                {currentRequest.department}
              </span>
            </div>
          </div>
        </div>

        {/* Scrap Material Details Table */}
        <div className="p-8">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Scrap Material Details
          </h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-200">
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-14">
                    SR
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    MATERIAL DESCRIPTION
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    MATERIAL #
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-20">
                    UOM
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-20">
                    QTY
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    TYPE OF WASTE
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    SCRAP LOCATION
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentRequest.items.map((item: ScrapItem) => (
                  <tr
                    key={item.id}
                    className="border-t border-gray-200 hover:bg-gray-50/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-500 font-semibold">{item.srNo}</td>
                    <td className="px-4 py-3 font-bold text-gray-800">
                      {item.materialDescription}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                      {item.materialNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.uom}</td>
                    <td className="px-4 py-3 font-bold text-gray-800">{item.quantity}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">
                        {item.typeOfWaste}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.scrapLocation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Disposal Information - 2x2 Grid of Cards */}
        <div className="px-8 pb-8">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Disposal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Reason for disposal */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col justify-between min-h-[90px]">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                REASON FOR DISPOSAL
              </span>
              <span className="text-sm font-semibold text-gray-700 leading-relaxed">
                {currentRequest.reasonForDisposal}
              </span>
            </div>

            {/* Remarks */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col justify-between min-h-[90px]">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                REMARKS
              </span>
              <span className="text-sm font-semibold text-gray-700 leading-relaxed">
                {currentRequest.remarks || 'No remarks provided.'}
              </span>
            </div>

            {/* Requirement Elsewhere */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col justify-between min-h-[90px]">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                REQUIREMENT ELSEWHERE IN THE COMPANY?
              </span>
              <span className="text-sm font-bold text-gray-800 capitalize">
                {currentRequest.requirementCheck || 'N/A'}
              </span>
            </div>

            {/* Categorized and separated */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col justify-between min-h-[90px]">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                ALL ITEMS CATEGORIZED & SEPARATED?
              </span>
              <span className="text-sm font-bold text-gray-800 capitalize">
                {currentRequest.categoryVerification || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Approval Workflow Columns */}
        <div className="px-8 pb-10">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Approval Workflow
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Initiator */}
            <div className="border border-gray-200 rounded-lg p-5 bg-white relative flex flex-col justify-between min-h-[200px]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  INITIATED BY
                </span>
                {getWorkflowStatusBadge('approved')}
              </div>
              <div className="space-y-3 flex-1 flex flex-col justify-end">
                <div>
                  <span className="block text-[10px] text-gray-400 font-semibold mb-0.5">Employee Name</span>
                  <span className="text-sm font-bold text-gray-800">{currentRequest.initiatedBy.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="block text-[10px] text-gray-400 font-semibold mb-0.5">Employee ID</span>
                    <span className="text-xs font-mono font-bold text-gray-700">{currentRequest.initiatedBy.employeeId}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-semibold mb-0.5">Date</span>
                    <span className="text-xs font-semibold text-gray-700">{currentRequest.initiatedBy.date}</span>
                  </div>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-semibold mb-0.5">Designation</span>
                  <span className="text-xs font-semibold text-gray-700">{currentRequest.initiatedBy.designation}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Reviewer */}
            <div className="border border-[#e2e8f0] rounded-lg p-5 bg-white relative flex flex-col justify-between min-h-[200px]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  REVIEWED BY
                </span>
                {getWorkflowStatusBadge(currentRequest.reviewedBy.status)}
              </div>
              <div className="space-y-3 flex-1 flex flex-col justify-end">
                <div>
                  <span className="block text-[10px] text-gray-400 font-semibold mb-0.5">Reviewer Name</span>
                  <span className="text-sm font-bold text-gray-800">{currentRequest.reviewedBy.name}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-semibold mb-0.5">Designation</span>
                  <span className="text-xs font-semibold text-gray-700">{currentRequest.reviewedBy.designation}</span>
                </div>

                {/* Inline Action Buttons inside Card for Reviewer */}
                {canReview && (
                  <div className="flex items-center gap-2 pt-2 no-print">
                    <button
                      onClick={() => handleAction('rejected')}
                      disabled={submitting}
                      className="flex-1 border border-red-200 hover:bg-red-50 text-red-600 font-semibold py-1.5 rounded-lg text-xs transition cursor-pointer text-center disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction('approved')}
                      disabled={submitting}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1.5 rounded-lg text-xs transition cursor-pointer text-center disabled:opacity-50 shadow-sm"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Card 3: Approver */}
            <div className="border border-gray-200 rounded-lg p-5 bg-white relative flex flex-col justify-between min-h-[200px]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  APPROVED BY (HOD)
                </span>
                {getWorkflowStatusBadge(currentRequest.approvedBy.status)}
              </div>
              <div className="space-y-3 flex-1 flex flex-col justify-end">
                <div>
                  <span className="block text-[10px] text-gray-400 font-semibold mb-0.5">HOD Name</span>
                  <span className="text-sm font-bold text-gray-800">{currentRequest.approvedBy.name}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-semibold mb-0.5">Designation</span>
                  <span className="text-xs font-semibold text-gray-700">{currentRequest.approvedBy.designation}</span>
                </div>

                {/* Inline Action Buttons inside Card for Approver */}
                {canApprove && (
                  <div className="flex items-center gap-2 pt-2 no-print">
                    <button
                      onClick={() => handleAction('rejected')}
                      disabled={submitting}
                      className="flex-1 border border-red-200 hover:bg-red-50 text-red-600 font-semibold py-1.5 rounded-lg text-xs transition cursor-pointer text-center disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction('approved')}
                      disabled={submitting}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1.5 rounded-lg text-xs transition cursor-pointer text-center disabled:opacity-50 shadow-sm"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
