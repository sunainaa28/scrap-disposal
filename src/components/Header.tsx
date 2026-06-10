import { Bell, Search, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function Header() {
  const { currentView, setCurrentView } = useStore();

  const getPageTitle = () => {
    switch (currentView) {
      case 'list':
        return 'Scrap Disposal Requests';
      case 'create':
        return 'Create Scrap Disposal Request';
      case 'preview':
        return 'Request Preview';
      default:
        return 'Scrap Disposal Requests';
    }
  };

  const getBreadcrumbs = () => {
    const crumbs: { label: string; view: 'list' | 'create' | 'preview' }[] = [
      { label: 'Dashboard', view: 'list' },
    ];
    if (currentView === 'create') {
      crumbs.push({ label: 'New Request', view: 'create' });
    } else if (currentView === 'preview') {
      crumbs.push({ label: 'Preview', view: 'preview' });
    }
    return crumbs;
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
            {getBreadcrumbs().map((crumb, index, arr) => (
              <span key={crumb.label} className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentView(crumb.view)}
                  className={`hover:text-keolis-blue transition-colors ${
                    index === arr.length - 1 ? 'font-medium text-gray-700' : ''
                  }`}
                >
                  {crumb.label}
                </button>
                {index < arr.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </span>
            ))}
          </nav>

          {/* Page Title */}
          <h1 className="text-xl font-bold text-gray-900">{getPageTitle()}</h1>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Quick search..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-keolis-blue/20 focus:border-keolis-blue bg-gray-50/50"
            />
          </div>
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
