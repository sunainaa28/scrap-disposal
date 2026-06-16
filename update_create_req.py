import re

with open("src/pages/CreateRequest.tsx", "r") as f:
    content = f.read()

# 1. Imports
content = re.sub(
    r"import \{(.*?)\} from '@/data/constants';",
    r"import {\n  DEPARTMENTS,\n  UOM_OPTIONS,\n  WASTE_TYPES,\n  CATEGORIES,\n  SYSTEMS,\n  LOCATIONS,\n  MOVEMENT_LOCATIONS,\n  generateId,\n} from '@/data/constants';",
    content,
    flags=re.DOTALL
)
content = re.sub(
    r"import \{(.*?)\} from 'lucide-react';",
    r"import {\n  Plus,\n  Trash2,\n  AlertCircle,\n  Save,\n  Send,\n  X,\n  ChevronDown,\n  Upload,\n  Image as ImageIcon,\n} from 'lucide-react';",
    content,
    flags=re.DOTALL
)

# 2. addItem
content = re.sub(
    r"typeOfWaste: 'Damaged',\s*scrapLocation: '',",
    r"typeOfWaste: 'Damaged',\n      fromLocation: '',\n      toLocation: '',",
    content
)

# 3. Handle Photos before validateForm
photo_funcs = """  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    const existingCount = formData.photos?.length || 0;
    const toProcess = files.slice(0, 5 - existingCount);
    
    toProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateFormData({ 
          photos: [...(useStore.getState().formData.photos || []), reader.result as string] 
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...(formData.photos || [])];
    newPhotos.splice(index, 1);
    updateFormData({ photos: newPhotos });
  };

  const validateForm"""
content = content.replace("  const validateForm", photo_funcs)

# 4. validateForm
new_val = """  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.category) newErrors.categoryField = 'Category is required';
    if (!formData.system) newErrors.system = 'System is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.date) newErrors.date = 'Date is required';

    if (formItems.length === 0) {
      newErrors.items = 'At least one scrap item is required';
    } else {
      formItems.forEach((item: ScrapItem, index: number) => {
        if (!item.materialDescription.trim()) newErrors[`item-${index}-desc`] = 'Required';
        if (!item.materialNumber.trim()) newErrors[`item-${index}-num`] = 'Required';
        if (item.quantity <= 0) newErrors[`item-${index}-qty`] = 'Invalid';
        if (!item.fromLocation) newErrors[`item-${index}-from`] = 'Required';
        if (!item.toLocation) newErrors[`item-${index}-to`] = 'Required';
      });
    }

    if (!formData.descriptionReason?.trim()) {
      newErrors.descriptionReason = 'Description / Reason is required';
    }
    if (!formData.requirementCheck) {
      newErrors.requirement = 'Please select Yes or No';
    }
    if (!formData.categoryVerification) {
      newErrors.category = 'Please select Yes or No';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };"""
content = re.sub(r"  const validateForm = \(\): boolean => \{.*?\n  \};\n", new_val + "\n", content, flags=re.DOTALL)

# 5. Table headers
content = re.sub(
    r"<th className=\"px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-\[180px\]\">\s*SCRAP LOCATION \*\s*</th>",
    r"""<th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[160px]">
                  FROM LOCATION *
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[160px]">
                  TO LOCATION *
                </th>""",
    content
)

# 6. Table rows
row_td = """<td className="px-4 py-3">
                      <div className="relative">
                        <select
                          value={item.fromLocation || ''}
                          onChange={(e) =>
                            updateItem(item.id, 'fromLocation', e.target.value)
                          }
                          className={`w-full px-2.5 py-2 border rounded-md text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#0f3d8c]/20 focus:border-[#0f3d8c] bg-white ${
                            errors[`item-${index}-from`] && showValidation
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <option value="">Select</option>
                          {MOVEMENT_LOCATIONS.map((loc) => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select
                          value={item.toLocation || ''}
                          onChange={(e) =>
                            updateItem(item.id, 'toLocation', e.target.value)
                          }
                          className={`w-full px-2.5 py-2 border rounded-md text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#0f3d8c]/20 focus:border-[#0f3d8c] bg-white ${
                            errors[`item-${index}-to`] && showValidation
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <option value="">Select</option>
                          {MOVEMENT_LOCATIONS.map((loc) => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </td>"""
content = re.sub(
    r"<td className=\"px-4 py-3\">\s*<input\s*type=\"text\"\s*value=\{item\.scrapLocation\}.*?/>\s*</td>",
    row_td,
    content,
    flags=re.DOTALL
)

# 7. Additional Details
add_details = """          {/* New Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.category || ''}
                  onChange={(e) => updateFormData({ category: e.target.value })}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#0f3d8c]/20 focus:border-[#0f3d8c] bg-white ${
                    errors.categoryField && showValidation
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200'
                  }`}
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map((catGroup) => (
                    <optgroup key={catGroup.group} label={catGroup.group}>
                      {catGroup.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.categoryField && showValidation && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.categoryField}
                </p>
              )}
            </div>

            {/* System */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                System <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.system || ''}
                  onChange={(e) => updateFormData({ system: e.target.value })}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#0f3d8c]/20 focus:border-[#0f3d8c] bg-white ${
                    errors.system && showValidation
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200'
                  }`}
                >
                  <option value="">Select System</option>
                  {SYSTEMS.map((sys) => (
                    <option key={sys} value={sys}>{sys}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.system && showValidation && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.system}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.location || ''}
                  onChange={(e) => updateFormData({ location: e.target.value })}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#0f3d8c]/20 focus:border-[#0f3d8c] bg-white ${
                    errors.location && showValidation
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200'
                  }`}
                >
                  <option value="">Select Location</option>
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.location && showValidation && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.location}
                </p>
              )}
            </div>
          </div>

          {/* Description / Reason */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Description / Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.descriptionReason || ''}
              onChange={(e) =>
                updateFormData({ descriptionReason: e.target.value })
              }
              rows={3}
              placeholder="e.g. Scrapped, Condemned, Shelf-Life Expired, Damaged, Replaced..."
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3d8c]/20 focus:border-[#0f3d8c] resize-none ${
                errors.descriptionReason && showValidation
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200'
              }`}
            />
            {errors.descriptionReason && showValidation && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.descriptionReason}
              </p>
            )}
          </div>
          
          {/* Scrap Photos Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Scrap Photos (Max 5)
            </label>
            <div className="flex flex-wrap gap-4 items-start">
              {(formData.photos || []).map((photo, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-lg border border-gray-200 overflow-hidden group">
                  <img src={photo} alt={`Scrap ${idx}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 p-1 bg-white/90 text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {(formData.photos || []).length < 5 && (
                <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-gray-400 mb-1" />
                  <span className="text-[10px] font-medium text-gray-500">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
              )}
            </div>
          </div>"""
content = re.sub(
    r"{/\* Reason for Disposal \*/}.*?</div>\s*</div>\s*{/\* Radio Questions \*/}",
    add_details + "\n\n          {/* Radio Questions */}",
    content,
    flags=re.DOTALL
)

with open("src/pages/CreateRequest.tsx", "w") as f:
    f.write(content)
