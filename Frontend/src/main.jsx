import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { UserProvider } from './context/UserContext';  // Import UserProvider
import { SocketProvider } from './context/SocketProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <SocketProvider>
      <App />
      </SocketProvider>
    </UserProvider>
  </StrictMode>
)
