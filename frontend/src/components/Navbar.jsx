import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-indigo-600">Interview Analyzer</Link>
      <div className="flex items-center gap-6">
        {user ? (
          <>
            <span className="text-sm text-gray-500 capitalize">
              {user.name} · <span className="text-indigo-600">{user.role}</span>
            </span>
            {user.role === 'candidate' && (
              <Link to="/upload" className="text-gray-600 hover:text-indigo-600 transition text-sm">
                New Interview
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-600 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-600 hover:text-indigo-600 transition text-sm">Login</Link>
            <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}