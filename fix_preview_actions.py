import re

with open("src/pages/PreviewRequest.tsx", "r") as f:
    content = f.read()

# Add buttons to action bar
action_buttons = """        <div className="flex items-center gap-3">
          {(canReview || canApprove) && (
            <div className="flex items-center gap-2 border-r border-gray-200 pr-3 mr-1 no-print">
              <button
                onClick={() => handleAction('rejected')}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition cursor-pointer shadow-sm disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => handleAction('approved')}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition cursor-pointer shadow-sm disabled:opacity-50"
              >
                Approve
              </button>
            </div>
          )}
          <button"""

content = content.replace('        <div className="flex items-center gap-3">\n          <button', action_buttons)

with open("src/pages/PreviewRequest.tsx", "w") as f:
    f.write(content)
