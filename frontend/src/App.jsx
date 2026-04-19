import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import Interview from './pages/Interview';
import Report from './pages/Report';
import SelectRole from './pages/SelectRole';
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
            user.role === 'interviewer' ? <Navigate to="/dashboard" /> :
            <Navigate to="/upload" />
          }
        />

        {/* Candidate only */}
        <Route path="/upload" element={
          <ProtectedRoute role="candidate"><ResumeUpload /></ProtectedRoute>
        } />
        <Route path="/select-role/:candidateId" element={
          <ProtectedRoute role="candidate"><SelectRole /></ProtectedRoute>
        } />
        <Route path="/interview/:candidateId" element={
          <ProtectedRoute role="candidate"><Interview /></ProtectedRoute>
        } />

        {/* Both roles */}
        <Route path="/report/:candidateId" element={
          <ProtectedRoute><Report /></ProtectedRoute>
        } />

        {/* Interviewer only */}
        <Route path="/dashboard" element={
          <ProtectedRoute role="interviewer"><Dashboard /></ProtectedRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;