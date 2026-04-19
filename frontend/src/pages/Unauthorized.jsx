import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-500 mb-6">You don't have permission to view this page.</p>
        <Link to="/" className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition">
          Go Home
        </Link>
      </div>
    </div>
  );
}