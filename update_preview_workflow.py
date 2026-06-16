import re

with open("src/pages/PreviewRequest.tsx", "r") as f:
    content = f.read()

# Add APPROVAL_LEVELS to imports
content = re.sub(
    r"import type \{ ScrapItem \} from '@/types';",
    r"import type { ScrapItem } from '@/types';\nimport { APPROVAL_LEVELS } from '@/data/constants';",
    content
)

# Replace the Approval Workflow section
new_workflow = """        {/* Approval Workflow Columns */}
        <div className="px-8 pb-10">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Approval Workflow
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {APPROVAL_LEVELS.map((level, index) => {
              // Map legacy data to first 3 levels for backward compatibility
              let levelStatus = 'pending';
              let name = 'TBD';
              let designation = level.title;
              let dateStr = '';
              
              if (index === 0) {
                levelStatus = 'approved';
                name = currentRequest.initiatedBy?.name || 'User';
                dateStr = currentRequest.initiatedBy?.date || '';
              } else if (index === 1) {
                levelStatus = currentRequest.reviewedBy?.status || 'pending';
                name = currentRequest.reviewedBy?.name || 'TBD';
              } else if (index === 2) {
                levelStatus = currentRequest.approvedBy?.status || 'pending';
                name = currentRequest.approvedBy?.name || 'TBD';
              }

              return (
                <div key={level.level} className={`border ${index === 1 ? 'border-[#e2e8f0]' : 'border-gray-200'} rounded-lg p-4 bg-white relative flex flex-col justify-between min-h-[140px]`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      LEVEL {level.level}
                    </span>
                    {/* @ts-ignore */}
                    {getWorkflowStatusBadge(levelStatus)}
                  </div>
                  <div className="space-y-2 flex-1 flex flex-col justify-end">
                    <div>
                      <span className="block text-[10px] text-gray-400 font-semibold mb-0.5">{designation}</span>
                      <span className="text-xs font-bold text-gray-800">{name}</span>
                    </div>
                    {dateStr && (
                      <div>
                        <span className="block text-[10px] text-gray-400 font-semibold mb-0.5">Date</span>
                        <span className="text-xs font-semibold text-gray-700">{dateStr}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>"""

content = re.sub(
    r"\{\/\* Approval Workflow Columns \*\/}.*?</div>\s*</div>\s*</div>\s*</div>\s*\);\s*}",
    new_workflow + "\n      </div>\n    </div>\n  );\n}",
    content,
    flags=re.DOTALL
)

with open("src/pages/PreviewRequest.tsx", "w") as f:
    f.write(content)
