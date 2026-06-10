import { useStore } from '@/store/useStore';
import { useMsal } from '@azure/msal-react';
import {
  ClipboardList,
  PlusCircle,
  FileText,
  Settings,
  Shield,
  LogOut,
} from 'lucide-react';

const menuItems = [
  { id: 'list', label: 'All Requests', icon: ClipboardList },
  { id: 'create', label: 'New Request', icon: PlusCircle },
];

export default function Sidebar() {
  const { currentView, setCurrentView, resetForm, user, logout } = useStore();
  const { instance } = useMsal();

  const handleLogout = () => {
    const accounts = instance.getAllAccounts();
    if (accounts.length > 0) {
      instance.logoutPopup().catch(console.error);
    }
    logout();
  };

  const handleNavigate = (view: 'list' | 'create') => {
    if (view === 'create') {
      resetForm();
    }
    setCurrentView(view);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo Area */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-keolis-blue rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 leading-tight">
              HMRL OCC
            </span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider leading-tight">
              Keolis
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
          Scrap Disposal
        </div>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigate(item.id as 'list' | 'create')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-keolis-blue text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
          System
        </div>
        <ul className="space-y-1">
          <li>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <FileText className="w-4.5 h-4.5" />
              Reports
            </button>
          </li>
          <li>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <Settings className="w-4.5 h-4.5" />
              Settings
            </button>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200 bg-gray-50/50">
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-keolis-blue/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-keolis-blue uppercase">
                {user ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'U'}
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-gray-900 truncate" title={user?.name}>
                {user?.name || 'User'}
              </span>
              <span className="text-[10px] text-gray-500 font-medium capitalize truncate">
                {user?.role === 'initiator' ? 'Initiator' : user?.role === 'reviewer' ? 'Reviewer' : 'Approver'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
