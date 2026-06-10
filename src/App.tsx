import { useEffect } from 'react';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { useStore } from '@/store/useStore';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import RequestList from '@/pages/RequestList';
import CreateRequest from '@/pages/CreateRequest';
import PreviewRequest from '@/pages/PreviewRequest';

export default function App() {
  const { currentView, user, setUser, fetchRequests } = useStore();
  const msalIsAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();

  // Synchronize MSAL active account with Zustand store
  useEffect(() => {
    if (msalIsAuthenticated) {
      const accounts = instance.getAllAccounts();
      if (accounts.length > 0) {
        const account = accounts[0];
        const email = account.username;
        const name = account.name || 'Azure AD User';
        
        // Determine role based on email mapping
        let role: 'initiator' | 'reviewer' | 'approver' = 'initiator';
        const lowercaseEmail = email.toLowerCase();
        if (lowercaseEmail.includes('priya') || lowercaseEmail.includes('reviewer') || lowercaseEmail.includes('manager')) {
          role = 'reviewer';
        } else if (lowercaseEmail.includes('arun') || lowercaseEmail.includes('approver') || lowercaseEmail.includes('hod')) {
          role = 'approver';
        }

        // Acquire access token silently
        instance.acquireTokenSilent({
          scopes: ["User.Read"],
          account: account
        }).then((response) => {
          setUser({
            name,
            email,
            role,
            token: response.accessToken,
            employeeId: 'HMRL-EMP-AZURE',
            designation: role === 'reviewer' ? 'Depot Manager' : role === 'approver' ? 'Head of Operations' : 'Senior Engineer',
          });
        }).catch((err) => {
          console.error("Acquiring token silently failed, falling back to idToken", err);
          setUser({
            name,
            email,
            role,
            token: account.idToken || '',
            employeeId: 'HMRL-EMP-AZURE',
            designation: role === 'reviewer' ? 'Depot Manager' : role === 'approver' ? 'Head of Operations' : 'Senior Engineer',
          });
        });
      }
    }
  }, [msalIsAuthenticated, instance, setUser]);

  // Fetch requests once user is authenticated (token is available)
  useEffect(() => {
    if (user?.token) {
      fetchRequests();
    }
  }, [user?.token, fetchRequests]);

  const renderView = () => {
    switch (currentView) {
      case 'create':
        return <CreateRequest />;
      case 'preview':
        return <PreviewRequest />;
      case 'list':
      default:
        return <RequestList />;
    }
  };

  // If user is not authenticated, show Login page
  if (!user) {
    return <Login />;
  }

  return <Layout>{renderView()}</Layout>;
}
