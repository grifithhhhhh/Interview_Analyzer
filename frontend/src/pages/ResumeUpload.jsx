import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const DEFAULT_ROLES = [
  'Software Engineer',
  'Data Scientist',
  'Product Manager',
  'DevOps Engineer',
  'Designer',
];

export default function ResumeUpload() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [selectedRole, setSelectedRole] = useState(null);
  const [customRole, setCustomRole] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [candidateId, setCandidateId] = useState(null);

  const handleResumeUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const { data } = await API.post('/resume/analyze', formData);
      const suggested = data.candidate.resumeAnalysis?.recommended_roles || [];
      if (suggested.length > 0) setRoles(suggested);
      setCandidateId(data.candidate._id);
      setSelectedRole(null);
      setResumeUploaded(true);
    } catch (err) {
      alert('Resume upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleStart = async () => {
    const role = selectedRole === 'custom' ? customRole.trim() : selectedRole;
    if (!role) return alert('Please select or enter a job role');
    setStarting(true);
    try {
      let cId = candidateId;

      if (!cId) {
        try {
          const { data } = await API.get('/candidates/me');
          cId = data._id;
          await API.patch(`/candidates/${cId}/role`, { jobRole: role });
        } catch {
          const { data } = await API.post('/candidates/init', { jobRole: role });
          cId = data.candidate._id;
        }
      } else {
        await API.patch(`/candidates/${cId}/role`, { jobRole: role });
      }

      await API.post('/questions/generate', { candidateId: cId, jobRole: role });
      navigate(`/candidate/interview/${cId}`);
    } catch (err) {
      alert('Failed to start interview: ' + err.message);
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Start Your Interview</h2>
          <p className="text-gray-400 text-sm mt-2">Pick a role below, or upload your resume for personalized suggestions</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Optional — upload resume for AI role suggestions
          </p>
          <div className="flex items-center gap-3">
            <label className={`flex-1 flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition ${
              file ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
            }`}>
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
              </svg>
              <span className="text-sm text-gray-500 truncate">{file ? file.name : 'Select PDF'}</span>
              <input type="file" accept=".pdf" className="hidden" onChange={(e) => {
                setFile(e.target.files[0]);
                setResumeUploaded(false);
                setRoles(DEFAULT_ROLES);
                setCandidateId(null);
                setSelectedRole(null);
              }} />
            </label>
            <button
              onClick={handleResumeUpload}
              disabled={!file || uploading || resumeUploaded}
              className="shrink-0 bg-indigo-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : resumeUploaded ? '✓ Done' : 'Analyze'}
            </button>
          </div>
          {resumeUploaded && (
            <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Resume analyzed — showing personalized role suggestions
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {resumeUploaded ? 'Suggested roles from your resume' : 'Select a job role'}
          </p>
          <div className="flex flex-col gap-2">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition text-sm font-medium ${
                  selectedRole === role
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-100 text-gray-700 hover:border-indigo-200 hover:bg-gray-50'
                }`}
              >
                {role}
              </button>
            ))}

            <button
              onClick={() => setSelectedRole('custom')}
              className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition text-sm font-medium ${
                selectedRole === 'custom'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-gray-100 text-gray-500 hover:border-indigo-200 hover:bg-gray-50'
              }`}
            >
              ✏️ Enter a custom role
            </button>
          </div>

          {selectedRole === 'custom' && (
            <input
              type="text"
              placeholder="e.g. ML Engineer"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              className="mt-3 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          )}
        </div>

        <button
          onClick={handleStart}
          disabled={starting || !selectedRole || (selectedRole === 'custom' && !customRole.trim())}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {starting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Generating questions...
            </>
          ) : (
            <>
              Start Interview
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </>
          )}
        </button>

      </div>
    </div>
  );
}