import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import {
  DEPARTMENTS,
  UOM_OPTIONS,
  WASTE_TYPES,
  generateId,
} from '@/data/constants';
import type { ScrapItem } from '@/types';
import {
  Plus,
  Trash2,
  AlertCircle,
  Save,
  Send,
  X,
  ChevronDown,
} from 'lucide-react';

export default function CreateRequest() {
  const user = useStore((state) => state.user);
  const formData = useStore((state) => state.formData);
  const formItems = useStore((state) => state.formItems);
  const updateFormData = useStore((state) => state.updateFormData);
  const updateFormItems = useStore((state) => state.updateFormItems);
  const setCurrentView = useStore((state) => state.setCurrentView);
  const setCurrentRequest = useStore((state) => state.setCurrentRequest);
  const saveDraft = useStore((state) => state.saveDraft);
  const submitRequest = useStore((state) => state.submitRequest);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = useState(false);

  // Initialize initiator details from active user session if not already set
  useEffect(() => {
    if (user && !formData.initiatedBy) {
      updateFormData({
        initiatedBy: {
          name: user.name,
          employeeId: user.employeeId || 'KEO-XXXX',
          designation: user.designation || 'Maintenance Engineer',
          date: formData.date || new Date().toISOString().split('T')[0],
        }
      });
    }
  }, [user, formData.initiatedBy, formData.date, updateFormData]);

  const initiatorName = formData.initiatedBy?.name || user?.name || '';
  const initiatorId = formData.initiatedBy?.employeeId || user?.employeeId || '';
  const initiatorDesignation = formData.initiatedBy?.designation || user?.designation || '';

  const handleInitiatorChange = (field: string, value: string) => {
    updateFormData({
      initiatedBy: {
        name: field === 'name' ? value : initiatorName,
        employeeId: field === 'employeeId' ? value : initiatorId,
        designation: field === 'designation' ? value : initiatorDesignation,
        date: formData.initiatedBy?.date || formData.date || new Date().toISOString().split('T')[0],
      }
    });
  };

  const addItem = () => {
    const newItem: ScrapItem = {
      id: generateId(),
      srNo: formItems.length + 1,
      materialDescription: '',
      materialNumber: '',
      uom: 'Nos',
      quantity: 1,
      typeOfWaste: 'Damaged',
      scrapLocation: '',
    };
    updateFormItems([...formItems, newItem]);
  };

  const removeItem = (id: string) => {
    const updated: ScrapItem[] = formItems
      .filter((item: ScrapItem) => item.id !== id)
      .map((item: ScrapItem, index: number) => ({ ...item, srNo: index + 1 }));
    updateFormItems(updated);
  };

  const updateItem = (id: string, field: keyof ScrapItem, value: string | number) => {
    const updated: ScrapItem[] = formItems.map((item: ScrapItem) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    updateFormItems(updated);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (formItems.length === 0) {
      newErrors.items = 'At least one scrap item is required';
    } else {
      formItems.forEach((item: ScrapItem, index: number) => {
        if (!item.materialDescription.trim()) {
          newErrors[`item-${index}-desc`] = 'Required';
        }
        if (!item.materialNumber.trim()) {
          newErrors[`item-${index}-num`] = 'Required';
        }
        if (item.quantity <= 0) {
          newErrors[`item-${index}-qty`] = 'Invalid';
        }
        if (!item.scrapLocation.trim()) {
          newErrors[`item-${index}-loc`] = 'Required';
        }
      });
    }
    if (!formData.reasonForDisposal?.trim()) {
      newErrors.reason = 'Reason for disposal is required';
    }
    if (!formData.requirementCheck) {
      newErrors.requirement = 'Please select Yes or No';
    }
    if (!formData.categoryVerification) {
      newErrors.category = 'Please select Yes or No';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    try {
      const request = await saveDraft();
      setCurrentRequest(request);
      setCurrentView('preview');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    setShowValidation(true);
    if (validateForm()) {
      try {
        const request = await submitRequest();
        setCurrentRequest(request);
        setCurrentView('preview');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCancel = () => {
    setCurrentView('dashboard');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
            <span className="text-gray-600">Create</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">Create Scrap Disposal Request</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Initiate a new scrap disposal request note for review and approval.
          </p>
        </div>

        {/* Top Buttons Panel */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer shadow-sm"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f3d8c] hover:bg-[#0a2e6b] text-white rounded-lg text-sm font-semibold transition cursor-pointer shadow-sm"
          >
            <Send className="w-4 h-4" />
            Submit for Review
          </button>
        </div>
      </div>

      {/* Request Information Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Request Information
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Request Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Request Number
              </label>
              <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
                {formData.requestNumber}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Auto generated</p>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={(e) => updateFormData({ date: e.target.value })}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3d8c]/20 focus:border-[#0f3d8c] ${
                  errors.date && showValidation
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
              {errors.date && showValidation && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.date}
                </p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.department || ''}
                  onChange={(e) => updateFormData({ department: e.target.value })}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#0f3d8c]/20 focus:border-[#0f3d8c] bg-white ${
                    errors.department && showValidation
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200'
                  }`}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((dept: string) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.department && showValidation && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.department}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scrap Items Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Scrap Items
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Add all scrap materials covered by this disposal request.</p>
          </div>
          <button
            onClick={addItem}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#0f3d8c] hover:bg-[#0a2e6b] text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Item
          </button>
        </div>

        {errors.items && showValidation && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-600 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.items}
            </p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-14">
                  SR
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[200px]">
                  MATERIAL DESCRIPTION *
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[140px]">
                  MATERIAL # *
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                  UOM *
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                  QUANTITY *
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                  TYPE OF WASTE *
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[180px]">
                  SCRAP LOCATION *
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">
                </th>
              </tr>
            </thead>
            <tbody>
              {formItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm">No items added yet</p>
                      <p className="text-xs">
                        Click &quot;Add Item&quot; to begin building your request items list.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                formItems.map((item: ScrapItem, index: number) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-500 font-semibold">{item.srNo}</td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.materialDescription}
                        onChange={(e) =>
                          updateItem(item.id, 'materialDescription', e.target.value)
                        }
                        placeholder="e.g. Traction Motor Belt"
                        className={`w-full px-2.5 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3d8c]/20 focus:border-[#0f3d8c] ${
                          errors[`item-${index}-desc`] && showValidation
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.materialNumber}
                        onChange={(e) =>
                          updateItem(item.id, 'materialNumber', e.target.value)
                        }
                        placeholder="MAT-XXXXXX"
                        className={`w-full px-2.5 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3d8c]/20 focus:border-[#0f3d8c] ${
                          errors[`item-${index}-num`] && showValidation
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select
                          value={item.uom}
                          onChange={(e) =>
                            updateItem(item.id, 'uom', e.target.value)
                          }
                          className="w-full px-2.5 py-2 border border-gray-200 rounded-md text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#0f3d8c]/20 focus:border-[#0f3d8c] bg-white"
                        >
                          {UOM_OPTIONS.map((uom: string) => (
                            <option key={uom} value={uom}>
                              {uom}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            'quantity',
                            parseInt(e.target.value) || 1
                          )
                        }
                        className={`w-full px-2.5 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3d8c]/20 focus:border-[#0f3d8c] ${
                          errors[`item-${index}-qty`] && showValidation
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select
                          value={item.typeOfWaste}
                          onChange={(e) =>
                            updateItem(item.id, 'typeOfWaste', e.target.value)
                          }
                          className="w-full px-2.5 py-2 border border-gray-200 rounded-md text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#0f3d8c]/20 focus:border-[#0f3d8c] bg-white"
                        >
                          {WASTE_TYPES.map((type: string) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.scrapLocation}
                        onChange={(e) =>
                          updateItem(item.id, 'scrapLocation', e.target.value)
                        }
                        placeholder="e.g. Uppal Depot - Bay 3"
                        className={`w-full px-2.5 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3d8c]/20 focus:border-[#0f3d8c] ${
                          errors[`item-${index}-loc`] && showValidation
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="inline-flex items-center justify-center w-8 h-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Details Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Additional Details
          </h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Reason for Disposal */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Reason for Disposal <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.reasonForDisposal || ''}
              onChange={(e) =>
                updateFormData({ reasonForDisposal: e.target.value })
              }
              rows={3}
              placeholder="e.g. Belt got damaged during operation and replaced."
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3d8c]/20 focus:border-[#0f3d8c] resize-none ${
                errors.reason && showValidation
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200'
              }`}
            />
            {errors.reason && showValidation && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.reason}
              </p>
            )}
          </div>

          {/* Radio Questions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Requirement Check */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Is there any requirement for these materials elsewhere in the company? <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer bg-white transition-all select-none hover:bg-gray-50/50 ${
                  formData.requirementCheck === 'yes' ? 'border-[#0f3d8c] ring-1 ring-[#0f3d8c]/20' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="requirementCheck"
                    value="yes"
                    checked={formData.requirementCheck === 'yes'}
                    onChange={() => updateFormData({ requirementCheck: 'yes' })}
                    className="w-4 h-4 text-[#0f3d8c] border-gray-300 focus:ring-[#0f3d8c] cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-gray-700">Yes</span>
                </label>
                <label className={`flex-1 flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer bg-white transition-all select-none hover:bg-gray-50/50 ${
                  formData.requirementCheck === 'no' ? 'border-[#0f3d8c] ring-1 ring-[#0f3d8c]/20' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="requirementCheck"
                    value="no"
                    checked={formData.requirementCheck === 'no'}
                    onChange={() => updateFormData({ requirementCheck: 'no' })}
                    className="w-4 h-4 text-[#0f3d8c] border-gray-300 focus:ring-[#0f3d8c] cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-gray-700">No</span>
                </label>
              </div>
              {errors.requirement && showValidation && (
                <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.requirement}
                </p>
              )}
            </div>

            {/* Category Verification */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Have all items been categorized and separated category-wise? <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer bg-white transition-all select-none hover:bg-gray-50/50 ${
                  formData.categoryVerification === 'yes' ? 'border-[#0f3d8c] ring-1 ring-[#0f3d8c]/20' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="categoryVerification"
                    value="yes"
                    checked={formData.categoryVerification === 'yes'}
                    onChange={() => updateFormData({ categoryVerification: 'yes' })}
                    className="w-4 h-4 text-[#0f3d8c] border-gray-300 focus:ring-[#0f3d8c] cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-gray-700">Yes</span>
                </label>
                <label className={`flex-1 flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer bg-white transition-all select-none hover:bg-gray-50/50 ${
                  formData.categoryVerification === 'no' ? 'border-[#0f3d8c] ring-1 ring-[#0f3d8c]/20' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="categoryVerification"
                    value="no"
                    checked={formData.categoryVerification === 'no'}
                    onChange={() => updateFormData({ categoryVerification: 'no' })}
                    className="w-4 h-4 text-[#0f3d8c] border-gray-300 focus:ring-[#0f3d8c] cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-gray-700">No</span>
                </label>
              </div>
              {errors.category && showValidation && (
                <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.category}
                </p>
              )}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Remarks
            </label>
            <textarea
              value={formData.remarks || ''}
              onChange={(e) => updateFormData({ remarks: e.target.value })}
              rows={3}
              placeholder="Additional remarks..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3d8c]/20 focus:border-[#0f3d8c] resize-none bg-white"
            />
          </div>
        </div>
      </div>

      {/* Initiator Details Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Initiator Details
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Captured automatically from your session.</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Employee Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                Employee Name
              </label>
              <input
                type="text"
                value={initiatorName}
                onChange={(e) => handleInitiatorChange('name', e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0f3d8c]/20 focus:border-[#0f3d8c]"
              />
            </div>

            {/* Employee ID */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                Employee ID
              </label>
              <input
                type="text"
                value={initiatorId}
                onChange={(e) => handleInitiatorChange('employeeId', e.target.value)}
                placeholder="KEO-XXXX"
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0f3d8c]/20 focus:border-[#0f3d8c]"
              />
            </div>

            {/* Designation */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                Designation
              </label>
              <input
                type="text"
                value={initiatorDesignation}
                onChange={(e) => handleInitiatorChange('designation', e.target.value)}
                placeholder="e.g. Maintenance Engineer"
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0f3d8c]/20 focus:border-[#0f3d8c]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Buttons Panel */}
      <div className="flex items-center justify-end gap-3 pt-2 pb-6">
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer shadow-sm"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          onClick={handleSaveDraft}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer shadow-sm"
        >
          <Save className="w-4 h-4" />
          Save Draft
        </button>
        <button
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0f3d8c] hover:bg-[#0a2e6b] text-white rounded-lg text-sm font-semibold transition cursor-pointer shadow-sm"
        >
          <Send className="w-4 h-4" />
          Submit for Review
        </button>
      </div>
    </div>
  );
}
