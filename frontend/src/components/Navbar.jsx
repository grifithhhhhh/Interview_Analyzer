import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="w-full bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold text-indigo-600">Interview Analyzer</h1>
      <div className="flex gap-6">
        <Link to="/" className="text-gray-600 hover:text-indigo-600 transition">Dashboard</Link>
        <Link to="/upload" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          New Interview
        </Link>
      </div>
    </nav>
  );
}