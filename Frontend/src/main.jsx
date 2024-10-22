import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { UserProvider } from './context/UserContext';
import { DoctorProvider } from './context/DoctorContext.jsx';
import { SocketProvider } from './context/SocketProvider.jsx';
import { ChatContextProvider } from './context/ChatContext.jsx';

createRoot(document.getElementById('root')).render(
 
    <UserProvider>

      <DoctorProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </DoctorProvider>

    </UserProvider>
 
)
