import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  completed:    'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  'in-progress': 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  pending:      'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
  voided:       'bg-red-50 text-red-600 ring-1 ring-red-200',
};

const DIFFICULTY_STYLES = {
  easy:   'bg-emerald-50 text-emerald-700',
  medium: 'bg-amber-50 text-amber-700',
  hard:   'bg-red-50 text-red-600',
};

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
        <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function CandidateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/candidates/me')
      .then(({ data }) => setCandidate(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // No candidate profile yet — first time user
  if (!candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-600 mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-3 tracking-tight">Ready to practice?</h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Pick a role and start your AI-powered interview — no resume needed to begin.
          </p>
          <Link
            to="/candidate/upload"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl text-base font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all"
          >
            Start Interview
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  const status = candidate?.interviewStatus || 'pending';
  const resumeScore = candidate?.resumeAnalysis?.overall_score;
  const interviewScore = candidate?.interviewScore;
  const answers = candidate?.answers || [];
  const skippedCount = answers.filter(a => a.skipped).length;
  const answeredCount = answers.filter(a => !a.skipped).length;
  const totalQuestions = answers.length;
  const interviewHistory = candidate?.interviewHistory || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
              Hey, {user?.name?.split(' ')[0] ?? 'there'} 👋
            </h2>
            <p className="text-gray-400 text-sm mt-1">Here's how your interview is going</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${STATUS_STYLES[status] ?? STATUS_STYLES.pending}`}>
              {status}
            </span>
            <div className="text-xs text-gray-400 bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Resume score"
            value={resumeScore}
            accent="bg-indigo-50"
            icon={
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            }
          />
          <StatCard
            label="Latest score"
            value={interviewScore}
            accent="bg-purple-50"
            icon={
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            }
          />
          <StatCard
            label="Answered"
            value={totalQuestions > 0 ? answeredCount : '—'}
            accent="bg-emerald-50"
            icon={
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Total attempts"
            value={interviewHistory.length || '—'}
            accent="bg-amber-50"
            icon={
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            }
          />
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* Left col */}
          <div className="col-span-2 flex flex-col gap-5">

            {/* Interview details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Latest interview</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Job role</span>
                  <span className="font-semibold text-gray-800">{candidate?.jobRole || '—'}</span>
                </div>
                <div className="h-px bg-gray-50" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Status</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[status]}`}>
                    {status}
                  </span>
                </div>
                <div className="h-px bg-gray-50" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Questions answered</span>
                  <span className="font-semibold text-gray-800">{answeredCount} / {totalQuestions || '—'}</span>
                </div>
                {candidate?.updatedAt && (
                  <>
                    <div className="h-px bg-gray-50" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Last activity</span>
                      <span className="font-semibold text-gray-800">
                        {new Date(candidate.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Questions breakdown */}
            {totalQuestions > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Questions breakdown</h3>
                <div className="flex flex-col gap-2">
                  {answers.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        a.skipped ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {i + 1}
                      </div>
                      <p className="text-sm text-gray-700 flex-1 line-clamp-1">{a.questionText || `Question ${i + 1}`}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        {a.difficulty && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_STYLES[a.difficulty] ?? ''}`}>
                            {a.difficulty}
                          </span>
                        )}
                        {a.skipped ? (
                          <span className="text-xs text-amber-500 font-medium">Skipped</span>
                        ) : (
                          <span className="text-xs font-bold text-indigo-600">
                            {a.score != null ? `${a.score}/10` : '—'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interview history */}
            {interviewHistory.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Interview history</h3>
                <div className="flex flex-col gap-2">
                  {interviewHistory.map((iv, i) => (
                    <div key={iv._id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0 group">

                      {/* Attempt number */}
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                        #{interviewHistory.length - i}
                      </div>

                      {/* Role + date */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{iv.jobRole || '—'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(iv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' · '}{iv.answersCount} answered
                        </p>
                      </div>

                      {/* Score */}
                      <div className="text-sm font-bold text-indigo-600 shrink-0">
                        {iv.overallScore != null ? `${iv.overallScore}/10` : '—'}
                      </div>

                      {/* Status badge */}
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize shrink-0 ${STATUS_STYLES[iv.status] ?? STATUS_STYLES.pending}`}>
                        {iv.status}
                      </span>

                      {/* View report link */}
                      {iv.status === 'completed' && (
                        <Link
                          to={`/candidate/report/${iv._id}`}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition opacity-0 group-hover:opacity-100 shrink-0"
                        >
                          Report →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right col — actions + resume */}
          <div className="flex flex-col gap-4">

            {/* Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Actions</h3>

              <Link
                to="/candidate/upload"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
                {status === 'pending' ? 'Start Interview' : 'New Interview'}
              </Link>

              {status === 'completed' && candidate?._id && (
                <Link
                  to={`/candidate/report/${interviewHistory[0]?._id}`}
                  className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  View Latest Report
                </Link>
              )}

              <Link
                to="/candidate/upload"
                className="w-full bg-white border border-gray-200 text-gray-500 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Upload New Resume
              </Link>
            </div>

            {/* Resume analysis */}
            {candidate?.resumeAnalysis && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Resume analysis</h3>
                <div className="flex flex-col gap-3">
                  {Object.entries(candidate.resumeAnalysis)
                    .filter(([key]) => key !== 'overall_score' && key !== 'summary')
                    .map(([key, val]) => {
                      if (typeof val !== 'number') return null;
                      const pct = Math.min(100, Math.max(0, val));
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="font-semibold text-gray-700">{val}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}