import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import Navbar from './components/Navbar';
import VideoConsult from './video-consult/VideoConsult';
import Signup from './signup-login/Signup';
import Login from './signup-login/Login';
import LobbyScreen from './video-call/LobbyScreen';
import RoomPage from './video-call/RoomPage';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<VideoConsult />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/lobby" element={<LobbyScreen />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
    </Router>
  );
}

export default App;
