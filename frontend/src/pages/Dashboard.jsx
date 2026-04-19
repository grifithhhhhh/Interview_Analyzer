import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'interviewer') {
      API.get('/candidates/all')
        .then(({ data }) => setCandidates(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  // Candidate view — just redirect them to upload
  if (user?.role === 'candidate') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Ready to practice?</h2>
          <p className="text-gray-500 text-lg mb-8">
            Upload your resume and get AI-powered interview questions tailored to your profile.
          </p>
          <Link
            to="/upload"
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-lg hover:bg-indigo-700 transition"
          >
            Start Interview →
          </Link>
        </div>
      </div>
    );
  }

  // Interviewer view
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Interviewer Dashboard</h2>
          <p className="text-gray-500 mt-1">All candidates who have completed interviews</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Candidates', value: candidates.length },
            { label: 'Completed', value: candidates.filter(c => c.interviewStatus === 'completed').length },
            { label: 'In Progress', value: candidates.filter(c => c.interviewStatus === 'in-progress').length },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
              <p className="text-3xl font-bold text-indigo-600">{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Candidates table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Candidates</h3>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-400">Loading candidates...</div>
          ) : candidates.length === 0 ? (
            <div className="p-10 text-center text-gray-400">No candidates yet</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Email', 'Job Role', 'Resume Score', 'Interview Score', 'Status', ''].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {candidates.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-800 font-medium">{c.name}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{c.email}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{c.jobRole}</td>
                    <td className="px-6 py-4">
                      <span className="text-indigo-600 font-semibold">
                        {c.resumeAnalysis?.overall_score ?? '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-indigo-600 font-semibold">
                        {c.interviewScore ?? '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                        c.interviewStatus === 'completed'
                          ? 'bg-green-50 text-green-600'
                          : c.interviewStatus === 'in-progress'
                          ? 'bg-orange-50 text-orange-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {c.interviewStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {c.interviewStatus === 'completed' && (
                        <Link
                          to={`/report/${c._id}`}
                          className="text-indigo-600 text-sm font-medium hover:underline"
                        >
                          View Report →
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}