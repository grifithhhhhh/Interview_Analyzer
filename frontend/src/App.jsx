import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import Interview from './pages/Interview';
import Report from './pages/Report';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<ResumeUpload />} />
        <Route path="/interview/:candidateId" element={<Interview />} />
        <Route path="/report/:candidateId" element={<Report />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;