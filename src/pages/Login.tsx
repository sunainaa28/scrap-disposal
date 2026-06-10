import { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { HelpCircle } from 'lucide-react';
import { loginRequest, isMockAuth } from '../authConfig';
import { useStore } from '../store/useStore';

export default function Login() {
  const { instance } = useMsal();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
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

  const handleLogin = () => {
    if (!employeeId.trim()) {
      setError('Please enter your Employee ID.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }
    setError(null);
    // Determine role from employee ID prefix for demo purposes
    if (employeeId.startsWith('APP')) {
      handleMockLogin('approver');
    } else if (employeeId.startsWith('REV')) {
      handleMockLogin('reviewer');
    } else {
      handleMockLogin('initiator');
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

    const tokenPayload = btoa(JSON.stringify(mockProfile));
    const token = `mock-token-${tokenPayload}`;

    setMockUser({
      ...mockProfile,
      token,
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        backgroundImage: `url('/hyderabad_metro_bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(10, 20, 40, 0.55)' }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ padding: '0' }}
      >
        {/* Card Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            Hyderabad Metro OCC
            <br />
            Portal
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Sign in with your employee credentials
          </p>
        </div>

        {/* Card Body */}
        <div className="px-8 pb-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
              <span className="font-semibold">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {isMockAuth && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
              <HelpCircle className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-amber-800">Developer Demo Mode</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Prefix ID with REV (Reviewer) or APP (Approver), else Initiator.
              </p>
            </div>
          )}

          {/* Employee ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee ID
            </label>
            <input
              type="text"
              id="employee-id"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="Enter your employee ID"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Login Button */}
          <button
            id="login-btn"
            onClick={handleLogin}
            className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ background: '#1e3a5f' }}
          >
            Login
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-grow border-t border-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">OR</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          {/* Microsoft Sign In */}
          <button
            id="microsoft-login-btn"
            onClick={handleMicrosoftLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200 active:scale-95 shadow-sm"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 23 23">
              <path fill="#f25022" d="M1 1h10v10H1z" />
              <path fill="#7fba00" d="M12 1h10v10H12z" />
              <path fill="#01a4ef" d="M1 12h10v10H1z" />
              <path fill="#ffb900" d="M12 12h10v10H12z" />
            </svg>
            {loading ? 'Connecting...' : 'Sign in with Microsoft'}
          </button>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 text-center border-t border-gray-100">
          <p className="text-[11px] text-gray-400">
            Authorised personnel only. Keolis Hyderabad Metro.
          </p>
        </div>
      </div>
    </div>
  );
}
