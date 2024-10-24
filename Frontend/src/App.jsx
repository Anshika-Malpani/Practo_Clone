import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import Navbar from './components/Navbar';
import VideoConsult from './video-consult/VideoConsult';
import Signup from './signup-login/Signup';
import Login from './signup-login/Login';
import LobbyScreen from './video-call/LobbyScreen';
import RoomPage from './video-call/RoomPage';
import RoomChat from './components/RoomChat';
import ScheduleMeet from "./components/ScheduleMeet";
import DoctorSignup from './signup-login/DoctorSignup';
import DoctorLogin from './signup-login/DoctorLogin';
import { useUser } from './context/UserContext';
import { ChatContextProvider } from './context/ChatContext';
import Chat from './components/Chat';


function App() {
  const { userId } = useUser() || {};
  
  return (
    <ChatContextProvider user={userId}>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<VideoConsult />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/lobby" element={<LobbyScreen />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="/roomchat" element={<RoomChat />} />
        <Route path="/schedulemeet" element={<ScheduleMeet />} />
        <Route path="/doctor_signup" element={<DoctorSignup />} />
        <Route path="/doctor_login" element={<DoctorLogin />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
    </ChatContextProvider>
  );
}

export default App;
