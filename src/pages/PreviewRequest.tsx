import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { STATUS_CONFIG } from '@/data/constants';
import type { ScrapItem } from '@/types';
import {
  ArrowLeft,
  Printer,
  FileDown,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  Building2,
  Calendar,
  Hash,
} from 'lucide-react';

export default function PreviewRequest() {
  const currentRequest = useStore((state) => state.currentRequest);
  const setCurrentView = useStore((state) => state.setCurrentView);
  const user = useStore((state) => state.user);
  const reviewRequest = useStore((state) => state.reviewRequest);
  const approveRequest = useStore((state) => state.approveRequest);
  const [submitting, setSubmitting] = useState(false);

  const showActionCard =
    currentRequest &&
    user &&
    ((user.role === 'reviewer' && currentRequest.status === 'pending') ||
      (user.role === 'approver' && currentRequest.status === 'reviewed'));

  const handleAction = async (actionStatus: 'approved' | 'rejected') => {
    if (!currentRequest) return;
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
          className="px-4 py-2 bg-keolis-blue text-white rounded-lg text-sm font-medium hover:bg-keolis-blue-dark transition-colors"
        >
          Back to List
        </button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[currentRequest.status];

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    handlePrint();
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => setCurrentView('list')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-keolis-blue hover:bg-gray-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-keolis-blue text-white rounded-lg text-sm font-medium hover:bg-keolis-blue-dark transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Printable Document */}
      <div className="print-area bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Document Header */}
        <div className="px-10 pt-10 pb-6 border-b-2 border-black">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Scrap Disposal Request Note
            </h1>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              Hyderabad Metro Rail Limited
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 border rounded-md">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  currentRequest.status === 'approved'
                    ? 'bg-emerald-500'
                    : currentRequest.status === 'rejected'
                      ? 'bg-red-500'
                      : 'bg-amber-400'
                }`}
              ></span>
              <span className="text-xs font-medium text-gray-600">
                Status: {statusConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Meta Information */}
        <div className="border-b border-gray-300">
          <div className="grid grid-cols-2 divide-x divide-gray-300">
            <div className="flex">
              <div className="px-4 py-3 bg-gray-50 w-32 flex items-center gap-2 border-r border-gray-200">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase">
                  Date
                </span>
              </div>
              <div className="flex-1 px-4 py-3 flex items-center">
                <span className="text-sm font-medium text-gray-900">
                  {currentRequest.date}
                </span>
              </div>
            </div>
            <div className="flex">
              <div className="px-4 py-3 bg-gray-50 w-36 flex items-center gap-2 border-r border-gray-200">
                <Hash className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase">
                  Request No
                </span>
              </div>
              <div className="flex-1 px-4 py-3 flex items-center">
                <span className="text-sm font-semibold text-keolis-blue">
                  {currentRequest.requestNumber}
                </span>
              </div>
            </div>
          </div>
          <div className="flex border-t border-gray-300">
            <div className="px-4 py-3 bg-gray-50 w-32 flex items-center gap-2 border-r border-gray-200">
              <Building2 className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 uppercase">
                Department
              </span>
            </div>
            <div className="flex-1 px-4 py-3 flex items-center">
              <span className="text-sm font-medium text-gray-900">
                {currentRequest.department}
              </span>
            </div>
          </div>
        </div>

        {/* Scrap Items Table */}
        <div className="p-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Scrap Material Details
          </h3>
          <div className="border border-gray-300 rounded-none overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase border-r border-gray-300 w-14">
                    Sr No
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase border-r border-gray-300">
                    Material Description
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase border-r border-gray-300">
                    Material Number
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase border-r border-gray-300 w-16">
                    UOM
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase border-r border-gray-300 w-16">
                    Qty
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase border-r border-gray-300">
                    Type of Waste / Scrap
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">
                    Scrap Location
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentRequest.items.map((item: ScrapItem) => (
                  <tr
                    key={item.id}
                    className="border-t border-gray-200"
                  >
                    <td className="px-3 py-3 text-center border-r border-gray-200">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 rounded text-xs font-medium text-gray-600">
                        {item.srNo}
                      </span>
                    </td>
                    <td className="px-3 py-3 border-r border-gray-200 font-medium text-gray-900">
                      {item.materialDescription}
                    </td>
                    <td className="px-3 py-3 border-r border-gray-200 text-gray-600 font-mono text-xs">
                      {item.materialNumber}
                    </td>
                    <td className="px-3 py-3 border-r border-gray-200 text-gray-600">
                      {item.uom}
                    </td>
                    <td className="px-3 py-3 border-r border-gray-200 text-gray-900 font-semibold">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-3 border-r border-gray-200">
                      <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">
                        {item.typeOfWaste}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-600">
                      {item.scrapLocation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Information */}
        <div className="px-6 pb-6 space-y-4">
          {/* Reason for Disposal */}
          <div className="border border-gray-300 rounded-none">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Reason for Disposal
              </span>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-gray-700 leading-relaxed">
                {currentRequest.reasonForDisposal}
              </p>
            </div>
          </div>

          {/* Radio Questions */}
          <div className="grid grid-cols-2 gap-0 border border-gray-300">
            <div className="px-4 py-3 border-r border-gray-200">
              <p className="text-xs text-gray-500 mb-2">
                Is there any requirement for these materials elsewhere in the
                company?
              </p>
              <div className="flex items-center gap-4">
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                    currentRequest.requirementCheck === 'yes'
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`}
                >
                  {currentRequest.requirementCheck === 'yes' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  )}
                  Yes
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                    currentRequest.requirementCheck === 'no'
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`}
                >
                  {currentRequest.requirementCheck === 'no' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  )}
                  No
                </span>
              </div>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs text-gray-500 mb-2">
                Have all items been categorized and separated category-wise?
              </p>
              <div className="flex items-center gap-4">
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                    currentRequest.categoryVerification === 'yes'
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`}
                >
                  {currentRequest.categoryVerification === 'yes' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  )}
                  Yes
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                    currentRequest.categoryVerification === 'no'
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`}
                >
                  {currentRequest.categoryVerification === 'no' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  )}
                  No
                </span>
              </div>
            </div>
          </div>

          {/* Remarks */}
          {currentRequest.remarks && (
            <div className="border border-gray-300 rounded-none">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Remarks
                </span>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm text-gray-700">
                  {currentRequest.remarks}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Approval Workflow */}
        <div className="px-6 pb-8">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Approval Workflow
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {/* Initiated By */}
            <div className="border border-gray-300 p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Initiated By
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Employee Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {currentRequest.initiatedBy.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Employee ID</p>
                  <p className="text-sm font-mono text-gray-700">
                    {currentRequest.initiatedBy.employeeId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Designation</p>
                  <p className="text-sm text-gray-700">
                    {currentRequest.initiatedBy.designation}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-sm text-gray-700">
                    {currentRequest.initiatedBy.date}
                  </p>
                </div>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-medium text-gray-600">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Initiated
                  </span>
                </div>
              </div>
            </div>

            {/* Reviewed By */}
            <div className="border border-gray-300 p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Reviewed By
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Reviewer Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {currentRequest.reviewedBy.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Designation</p>
                  <p className="text-sm text-gray-700">
                    {currentRequest.reviewedBy.designation}
                  </p>
                </div>
                <div className="pt-6">
                  {currentRequest.reviewedBy.status === 'pending' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded text-xs font-medium text-amber-700">
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                  ) : currentRequest.reviewedBy.status === 'approved' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" />
                      Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded text-xs font-medium text-red-700">
                      <XCircle className="w-3 h-3" />
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Approved By */}
            <div className="border border-gray-300 p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Approved By
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">HOD Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {currentRequest.approvedBy.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Designation</p>
                  <p className="text-sm text-gray-700">
                    {currentRequest.approvedBy.designation}
                  </p>
                </div>
                <div className="pt-6">
                  {currentRequest.approvedBy.status === 'pending' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded text-xs font-medium text-amber-700">
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                  ) : currentRequest.approvedBy.status === 'approved' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" />
                      Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded text-xs font-medium text-red-700">
                      <XCircle className="w-3 h-3" />
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-4 border-t border-gray-200 bg-gray-50/30">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              Document ID: {currentRequest.id}
            </span>
            <span>
              Generated: {new Date(currentRequest.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Review & Approval Actions (Hidden during print) */}
      {showActionCard && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 no-print flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-keolis-blue/10 flex items-center justify-center text-keolis-blue flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Pending Your Action</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {user?.role === 'reviewer'
                  ? 'Please review the scrap disposal items, quantities, and justification.'
                  : 'Please approve or reject this reviewed scrap disposal request.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => handleAction('rejected')}
              disabled={submitting}
              className="flex-1 md:flex-initial px-5 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 font-medium rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              Reject Request
            </button>
            <button
              onClick={() => handleAction('approved')}
              disabled={submitting}
              className="flex-1 md:flex-initial px-5 py-2.5 bg-keolis-blue hover:bg-keolis-blue-dark text-white font-medium rounded-lg text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              Approve Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
