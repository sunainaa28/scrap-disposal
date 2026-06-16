import re

with open("src/pages/PreviewRequest.tsx", "r") as f:
    content = f.read()

# 1. Add Photo Gallery
photo_gallery = """        {/* Scrap Photos Gallery */}
        {currentRequest.photos && currentRequest.photos.length > 0 && (
          <div className="px-8 pt-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Scrap Photos
            </h3>
            <div className="flex flex-wrap gap-4">
              {currentRequest.photos.map((photo: string, idx: number) => (
                <div key={idx} className="w-32 h-32 rounded-lg border border-gray-200 overflow-hidden">
                  <img src={photo} alt={`Scrap ${idx}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Scrap Material Details Table */}"""
content = content.replace("        {/* Scrap Material Details Table */}", photo_gallery)

# 2. Add Category, System, Location to Meta Grid
meta_grid_addition = """          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                CATEGORY
              </span>
              <span className="text-sm font-bold text-gray-800">
                {currentRequest.category}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                SYSTEM
              </span>
              <span className="text-sm font-bold text-gray-800">
                {currentRequest.system}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                LOCATION
              </span>
              <span className="text-sm font-bold text-gray-800">
                {currentRequest.location}
              </span>
            </div>
          </div>
        </div>"""
content = re.sub(
    r"\s*</div>\s*</div>\s*\{\/\* Scrap Material Details Table \*\/\}",
    meta_grid_addition + "\n\n        {/* Scrap Material Details Table */}",
    content
)

with open("src/pages/PreviewRequest.tsx", "w") as f:
    f.write(content)
