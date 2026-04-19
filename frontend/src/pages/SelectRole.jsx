import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function SelectRole() {
  const { candidateId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const roles = state?.roles || [];
  const [selectedRole, setSelectedRole] = useState(null);
  const [customRole, setCustomRole] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    const role = selectedRole === 'custom' ? customRole : selectedRole;
    if (!role) return alert('Please select or enter a job role');
    setLoading(true);

    try {
      await API.post('/questions/generate', { candidateId, jobRole: role });
      navigate(`/interview/${candidateId}`);
    } catch (err) {
      alert('Failed to generate questions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Job Role</h2>
        <p className="text-gray-500 text-sm mb-8">
          Based on your resume, we recommend these roles. Pick one or enter your own.
        </p>

        {/* Recommended roles */}
        <div className="flex flex-col gap-3 mb-6">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`w-full text-left px-5 py-4 rounded-xl border-2 transition font-medium ${
                selectedRole === role
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-700 hover:border-indigo-300'
              }`}
            >
              {role}
            </button>
          ))}

          {/* Custom role option */}
          <button
            onClick={() => setSelectedRole('custom')}
            className={`w-full text-left px-5 py-4 rounded-xl border-2 transition font-medium ${
              selectedRole === 'custom'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 text-gray-700 hover:border-indigo-300'
            }`}
          >
            ✏️ Enter custom role
          </button>
        </div>

        {/* Custom role input */}
        {selectedRole === 'custom' && (
          <input
            type="text"
            placeholder="e.g. DevOps Engineer"
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-6 focus:outline-none focus:border-indigo-500"
          />
        )}

        <button
          onClick={handleStart}
          disabled={loading || !selectedRole}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating Questions...' : 'Start Interview →'}
        </button>
      </div>
    </div>
  );
}