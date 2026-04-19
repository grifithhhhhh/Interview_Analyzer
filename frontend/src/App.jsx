import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import InterviewerDashboard from './pages/InterviewerDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import ResumeUpload from './pages/ResumeUpload';
import Interview from './pages/Interview';
import Report from './pages/Report';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';

function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Root redirect based on role */}
        <Route
          path="/"
          element={
            !user ? <Navigate to="/login" /> :
            user.role === 'interviewer' ? <Navigate to="/interviewer/dashboard" /> :
            <Navigate to="/candidate/dashboard" />
          }
        />

        {/* Candidate routes */}
        <Route path="/candidate/dashboard" element={
          <ProtectedRoute role="candidate"><CandidateDashboard /></ProtectedRoute>
        } />
        <Route path="/candidate/upload" element={
          <ProtectedRoute role="candidate"><ResumeUpload /></ProtectedRoute>
        } />
        <Route path="/candidate/interview/:candidateId" element={
          <ProtectedRoute role="candidate"><Interview /></ProtectedRoute>
        } />
        <Route path="/candidate/report/:interviewId" element={
          <ProtectedRoute role="candidate"><Report /></ProtectedRoute>
        } />

        {/* Interviewer routes */}
        <Route path="/interviewer/dashboard" element={
          <ProtectedRoute role="interviewer"><InterviewerDashboard /></ProtectedRoute>
        } />
        <Route path="/interviewer/report/:interviewId" element={
          <ProtectedRoute role="interviewer"><Report /></ProtectedRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;