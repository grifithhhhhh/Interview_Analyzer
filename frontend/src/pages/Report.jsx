import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';

export default function Report() {
  const { candidateId } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    API.get(`/report/${candidateId}`).then(({ data }) => setReport(data));
  }, [candidateId]);

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading report...</p>
      </div>
    );
  }

  const verdictColor = {
    good: 'text-green-600 bg-green-50',
    average: 'text-orange-600 bg-orange-50',
    weak: 'text-red-600 bg-red-50',
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{report.candidate.name}</h2>
          <p className="text-gray-500">{report.candidate.jobRole} · {report.candidate.email}</p>
          <div className="mt-4 flex gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-600">{report.finalScore}</p>
              <p className="text-gray-500 text-sm">Final Score</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-600">{report.interview.overallInterviewScore}</p>
              <p className="text-gray-500 text-sm">Interview Score</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-600">{report.resumeAnalysis?.overall_score}</p>
              <p className="text-gray-500 text-sm">Resume Score</p>
            </div>
          </div>
        </div>

        {/* Verdict breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Verdict Breakdown</h3>
          <div className="flex gap-4">
            {['good', 'average', 'weak'].map((v) => (
              <div key={v} className={`flex-1 text-center rounded-xl py-3 ${verdictColor[v]}`}>
                <p className="text-2xl font-bold">{report.interview.verdictBreakdown[v]}</p>
                <p className="text-sm capitalize">{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Answer breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Answer Breakdown</h3>
          <div className="flex flex-col gap-4">
            {report.interview.answers.map((a, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4">
                <p className="font-semibold text-gray-800 mb-1">Q{i + 1}: {a.questionText}</p>
                <p className="text-gray-500 text-sm mb-2">{a.transcript}</p>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${verdictColor[a.verdict]}`}>
                    {a.verdict}
                  </span>
                  <span className="text-sm text-gray-600">{a.score}/10</span>
                  <span className="text-sm text-gray-500">💡 {a.tip}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link
          to="/upload"
          className="block text-center bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
        >
          Start New Interview
        </Link>
      </div>
    </div>
  );
}