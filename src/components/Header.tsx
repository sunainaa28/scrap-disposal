import { Bell, Search } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function Header() {
  const { user, filters, updateFilters, currentView, setCurrentView } = useStore();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ searchQuery: e.target.value });
    if (e.target.value && currentView !== 'list') {
      setCurrentView('list');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between sticky top-0 z-40 h-16">
      {/* Search Input Box */}
      <div className="flex-1 max-w-md relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={handleSearchChange}
          placeholder="Search requests, materials, departments..."
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
        </button>

        {/* User Profile Info */}
        {user && (
          <div className="flex items-center gap-3 border-l border-gray-200 pl-6 h-9">
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-gray-800 leading-tight">
                {user.name}
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wide mt-0.5 capitalize">
                {user.designation || user.role}
              </span>
            </div>
            {/* Avatar Circle */}
            <div className="w-9 h-9 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm select-none">
              {getInitials(user.name)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
