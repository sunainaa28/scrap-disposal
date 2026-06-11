import { useStore } from '@/store/useStore';
import {
  LayoutDashboard,
  Trash2,
  PlusCircle,
  FileText,
  Settings,
} from 'lucide-react';

export default function Sidebar() {
  const { currentView, setCurrentView, resetForm } = useStore();

  const handleNavigate = (view: 'dashboard' | 'list' | 'create') => {
    if (view === 'create') {
      resetForm();
    }
    setCurrentView(view);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  const materialItems = [
    { id: 'list', label: 'Scrap Disposal', icon: Trash2 },
    { id: 'create', label: 'New Request', icon: PlusCircle },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const systemItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const isItemActive = (id: string) => {
    if (id === 'dashboard') return currentView === 'dashboard';
    if (id === 'list') return currentView === 'list' || currentView === 'preview';
    if (id === 'create') return currentView === 'create';
    return false;
  };

  return (
    <aside className="w-64 bg-[#0a1424] border-r border-[#1a2b44] flex flex-col h-screen sticky top-0 text-slate-300 select-none">
      {/* Logo Area */}
      <div className="px-6 py-5 border-b border-[#1a2b44]">
        <div className="flex items-center gap-3">
          {/* Logo Circle with 'K' */}
          <div className="w-10 h-10 bg-[#17253a] border border-[#2c3d59] rounded-lg flex items-center justify-center shadow-inner">
            <span className="text-white font-extrabold text-lg tracking-wider">K</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white leading-tight tracking-wide">
              Keolis Hyderabad
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
              Scrap Disposal Portal
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {/* Main Menu */}
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.id);
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigate(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#183a6b] text-white shadow-md'
                      : 'text-slate-400 hover:bg-[#122035] hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Materials Section */}
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
            Materials
          </div>
          <ul className="space-y-1">
            {materialItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.id);
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      if (item.id === 'list' || item.id === 'create') {
                        handleNavigate(item.id as any);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[#183a6b] text-white shadow-md'
                        : item.id === 'reports'
                        ? 'text-slate-400 hover:text-white/80 cursor-not-allowed opacity-60'
                        : 'text-slate-400 hover:bg-[#122035] hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* System Section */}
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
            System
          </div>
          <ul className="space-y-1">
            {systemItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.id);
              return (
                <li key={item.id}>
                  <button
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-not-allowed opacity-60 ${
                      isActive
                        ? 'bg-[#183a6b] text-white shadow-md'
                        : 'text-slate-400 hover:text-white/80'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Footer / Version Info */}
      <div className="px-6 py-4 border-t border-[#1a2b44] text-[11px] font-medium text-slate-500 tracking-wide">
        v1.0.0 - Keolis 2026
      </div>
    </aside>
  );
}
