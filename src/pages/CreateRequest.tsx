import { useState } from 'react';
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
    const request = await saveDraft();
    setCurrentRequest(request);
    setCurrentView('preview');
  };

  const handleSubmit = async () => {
    setShowValidation(true);
    if (validateForm()) {
      const request = await submitRequest();
      setCurrentRequest(request);
      setCurrentView('preview');
    }
  };

  const handleCancel = () => {
    setCurrentView('list');
  };

  return (
    <div className="space-y-6">
      {/* Header Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Request Information
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Request Number */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Request Number
              </label>
              <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
                {formData.requestNumber}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={(e) => updateFormData({ date: e.target.value })}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-keolis-blue/20 focus:border-keolis-blue ${
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
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.department || ''}
                  onChange={(e) => updateFormData({ department: e.target.value })}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-keolis-blue/20 focus:border-keolis-blue bg-white ${
                    errors.department && showValidation
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200'
                  }`}
                >
                  <option value="">Select Department</option>
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

      {/* Scrap Items Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Scrap Items
          </h2>
          <span className="text-xs text-gray-500">
            {formItems.length} item{formItems.length !== 1 ? 's' : ''}
          </span>
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
                  Sr No
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[200px]">
                  Material Description <span className="text-red-500">*</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[140px]">
                  Material Number <span className="text-red-500">*</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                  UOM
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                  Qty <span className="text-red-500">*</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                  Type of Waste
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[180px]">
                  Scrap Location <span className="text-red-500">*</span>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">
                  Action
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
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <Plus className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-sm">No items added yet</p>
                      <p className="text-xs">
                        Click &quot;Add Item&quot; to add scrap materials
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
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-gray-100 rounded-md text-xs font-medium text-gray-600">
                        {item.srNo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.materialDescription}
                        onChange={(e) =>
                          updateItem(item.id, 'materialDescription', e.target.value)
                        }
                        placeholder="Enter description"
                        className={`w-full px-2.5 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-keolis-blue/20 focus:border-keolis-blue ${
                          errors[`item-${index}-desc`] && showValidation
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200'
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
                        placeholder="MAT-YYYY-XXXX"
                        className={`w-full px-2.5 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-keolis-blue/20 focus:border-keolis-blue ${
                          errors[`item-${index}-num`] && showValidation
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200'
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
                          className="w-full px-2 py-2 border border-gray-200 rounded-md text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-keolis-blue/20 focus:border-keolis-blue bg-white"
                        >
                          {UOM_OPTIONS.map((uom: string) => (
                            <option key={uom} value={uom}>
                              {uom}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
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
                        className={`w-full px-2.5 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-keolis-blue/20 focus:border-keolis-blue ${
                          errors[`item-${index}-qty`] && showValidation
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200'
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
                          className="w-full px-2 py-2 border border-gray-200 rounded-md text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-keolis-blue/20 focus:border-keolis-blue bg-white"
                        >
                          {WASTE_TYPES.map((type: string) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.scrapLocation}
                        onChange={(e) =>
                          updateItem(item.id, 'scrapLocation', e.target.value)
                        }
                        placeholder="Enter location"
                        className={`w-full px-2.5 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-keolis-blue/20 focus:border-keolis-blue ${
                          errors[`item-${index}-loc`] && showValidation
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200'
                        }`}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="inline-flex items-center justify-center w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
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

        {/* Add Item Button */}
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={addItem}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:text-keolis-blue hover:border-keolis-blue hover:bg-keolis-blue/5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Additional Details */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Additional Details
          </h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Reason for Disposal */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Reason for Disposal <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.reasonForDisposal || ''}
              onChange={(e) =>
                updateFormData({ reasonForDisposal: e.target.value })
              }
              rows={3}
              placeholder="e.g., Belt got damaged during operation and replaced."
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-keolis-blue/20 focus:border-keolis-blue resize-none ${
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
            <div
              className={`p-4 rounded-lg border ${
                errors.requirement && showValidation
                  ? 'border-red-300 bg-red-50/50'
                  : 'border-gray-200 bg-gray-50/30'
              }`}
            >
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Is there any requirement for these materials elsewhere in the
                company? <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <div className="relative">
                    <input
                      type="radio"
                      name="requirementCheck"
                      value="yes"
                      checked={formData.requirementCheck === 'yes'}
                      onChange={(e) =>
                        updateFormData({
                          requirementCheck: e.target.value as 'yes' | 'no',
                        })
                      }
                      className="w-4 h-4 text-keolis-blue border-gray-300 focus:ring-keolis-blue"
                    />
                  </div>
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <div className="relative">
                    <input
                      type="radio"
                      name="requirementCheck"
                      value="no"
                      checked={formData.requirementCheck === 'no'}
                      onChange={(e) =>
                        updateFormData({
                          requirementCheck: e.target.value as 'yes' | 'no',
                        })
                      }
                      className="w-4 h-4 text-keolis-blue border-gray-300 focus:ring-keolis-blue"
                    />
                  </div>
                  <span className="text-sm text-gray-700">No</span>
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
            <div
              className={`p-4 rounded-lg border ${
                errors.category && showValidation
                  ? 'border-red-300 bg-red-50/50'
                  : 'border-gray-200 bg-gray-50/30'
              }`}
            >
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Have all items been categorized and separated category-wise?{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <div className="relative">
                    <input
                      type="radio"
                      name="categoryVerification"
                      value="yes"
                      checked={formData.categoryVerification === 'yes'}
                      onChange={(e) =>
                        updateFormData({
                          categoryVerification: e.target.value as 'yes' | 'no',
                        })
                      }
                      className="w-4 h-4 text-keolis-blue border-gray-300 focus:ring-keolis-blue"
                    />
                  </div>
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <div className="relative">
                    <input
                      type="radio"
                      name="categoryVerification"
                      value="no"
                      checked={formData.categoryVerification === 'no'}
                      onChange={(e) =>
                        updateFormData({
                          categoryVerification: e.target.value as 'yes' | 'no',
                        })
                      }
                      className="w-4 h-4 text-keolis-blue border-gray-300 focus:ring-keolis-blue"
                    />
                  </div>
                  <span className="text-sm text-gray-700">No</span>
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
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Remarks
            </label>
            <textarea
              value={formData.remarks || ''}
              onChange={(e) => updateFormData({ remarks: e.target.value })}
              rows={3}
              placeholder="Enter any additional remarks or notes..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-keolis-blue/20 focus:border-keolis-blue resize-none"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2 pb-6">
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          onClick={handleSaveDraft}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Draft
        </button>
        <button
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-keolis-blue text-white rounded-lg text-sm font-medium hover:bg-keolis-blue-dark transition-colors shadow-sm"
        >
          <Send className="w-4 h-4" />
          Submit for Review
        </button>
      </div>
    </div>
  );
}
