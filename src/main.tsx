import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import { msalConfig } from './authConfig'
import './index.css'
import App from './App.tsx'

const container = document.getElementById('root')!;
const root = createRoot(container);

async function start() {
  const msalInstance = new PublicClientApplication(msalConfig);
  await msalInstance.initialize();

  root.render(
    <BrowserRouter>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </BrowserRouter>
  );
}

start().catch((err) => {
  console.error("Failed to initialize MSAL app:", err);
});
