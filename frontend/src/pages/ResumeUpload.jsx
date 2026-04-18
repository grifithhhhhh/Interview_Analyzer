import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return alert('Please select a PDF');
    setLoading(true);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const { data } = await API.post('/resume/analyze', formData);
      const candidateId = data.candidate._id;
      await API.post('/questions/generate', { candidateId });
      navigate(`/interview/${candidateId}`);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Your Resume</h2>
        <p className="text-gray-500 text-sm mb-8">PDF format only. AI will analyze it and generate interview questions.</p>

        <label className="block w-full border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-indigo-400 transition">
          <div className="text-4xl mb-2">📄</div>
          <p className="text-gray-500 text-sm">
            {file ? file.name : 'Click to select a PDF'}
          </p>
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Analyzing Resume...' : 'Upload & Start Interview'}
        </button>

        {loading && (
          <p className="text-gray-400 text-sm mt-4">This may take a few seconds...</p>
        )}
      </div>
    </div>
  );
}