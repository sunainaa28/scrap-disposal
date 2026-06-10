import { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { Shield, Key, User, Briefcase, HelpCircle } from 'lucide-react';
import { loginRequest, isMockAuth } from '../authConfig';
import { useStore } from '../store/useStore';

export default function Login() {
  const { instance } = useMsal();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setMockUser = useStore((state) => state.setMockUser);

  const handleMicrosoftLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await instance.loginPopup(loginRequest);
    } catch (err: any) {
      console.error('Microsoft login failed:', err);
      setError(err.message || 'Failed to authenticate with Microsoft.');
    } finally {
      setLoading(false);
    }
  };

  const handleMockLogin = (role: 'initiator' | 'reviewer' | 'approver') => {
    let mockProfile = {};
    if (role === 'initiator') {
      mockProfile = {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@keolis.com',
        role: 'initiator',
        employeeId: 'HMRL-EMP-4502',
        designation: 'Senior Engineer (Rolling Stock)',
      };
    } else if (role === 'reviewer') {
      mockProfile = {
        name: 'Priya Sharma',
        email: 'priya.sharma@keolis.com',
        role: 'reviewer',
        employeeId: 'HMRL-EMP-3320',
        designation: 'Depot Manager',
      };
    } else {
      mockProfile = {
        name: 'Arun Reddy',
        email: 'arun.reddy@keolis.com',
        role: 'approver',
        employeeId: 'HMRL-EMP-1002',
        designation: 'Head of Operations',
      };
    }

    // Generate mock base64 token
    const tokenPayload = btoa(JSON.stringify(mockProfile));
    const token = `mock-token-${tokenPayload}`;

    setMockUser({
      ...mockProfile,
      token,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 px-4 py-12">
      <div className="max-w-sm w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-shadow duration-300 hover:shadow-xl">
        
        {/* Branding Header */}
        <div className="px-6 py-6 text-center bg-gradient-to-r from-pink-200 to-purple-200">
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-white rounded-full shadow-md">
            <Shield className="w-6 h-6 text-pink-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">HMRL OCC Portal</h2>
          <p className="text-xs text-gray-600 mt-1">Scrap Disposal Management System</p>
        </div>

        <div className="px-6 py-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
              <span className="font-semibold">⚠️</span>
              <div>
                <p className="font-semibold">Authentication Error</p>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Microsoft Auth Section */}
          {!isMockAuth ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 text-center font-medium uppercase">Sign in with Microsoft</p>
              <button
                onClick={handleMicrosoftLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 23 23">
                  <path fill="#f25022" d="M1 1h10v10H1z" />
                  <path fill="#7fba00" d="M12 1h10v10H12z" />
                  <path fill="#01a4ef" d="M1 12h10v10H1z" />
                  <path fill="#ffb900" d="M12 12h10v10H12z" />
                </svg>
                {loading ? 'Connecting...' : 'Sign in with Microsoft'}
              </button>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-center mb-4">
              <HelpCircle className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-amber-800">Developer Demo Mode</p>
              <p className="text-[11px] text-amber-700 mt-1">
                MSAL not configured – you can log in as any demo role.
              </p>
            </div>
          )}

          {/* Divider */}
          {!isMockAuth && (
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-2 text-xs text-gray-500 uppercase">or demo roles</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
          )}

          {/* Mock Role Selectors */}
          <div className="space-y-3">
            <p className="text-xs text-gray-500 text-center font-medium uppercase mb-2">Select Demo Role</p>
            
            {/* Initiator Button */}
            <button
              onClick={() => handleMockLogin('initiator')}
              className="w-full flex items-center justify-between px-4 py-2 border border-gray-200 rounded-md text-left hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <User className="w-4 h-4" />
                </div>
                <span className="font-medium text-gray-800">Initiator</span>
              </div>
            </button>

            {/* Reviewer Button */}
            <button
              onClick={() => handleMockLogin('reviewer')}
              className="w-full flex items-center justify-between px-4 py-2 border border-gray-200 rounded-md text-left hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="font-medium text-gray-800">Reviewer</span>
              </div>
            </button>

            {/* Approver Button */}
            <button
              onClick={() => handleMockLogin('approver')}
              className="w-full flex items-center justify-between px-4 py-2 border border-gray-200 rounded-md text-left hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <Key className="w-4 h-4" />
                </div>
                <span className="font-medium text-gray-800">Approver</span>
              </div>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 text-center border-t border-gray-100">
          <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
            Secured via Microsoft Authentication
          </p>
        </div>

      </div>
    </div>
  );
}
