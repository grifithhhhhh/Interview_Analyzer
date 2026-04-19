import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';

const VERDICT_STYLES = {
  good:    { pill: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', bar: 'bg-emerald-500', card: 'border-l-4 border-emerald-400' },
  average: { pill: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',       bar: 'bg-amber-400',  card: 'border-l-4 border-amber-400'   },
  weak:    { pill: 'bg-red-50 text-red-600 ring-1 ring-red-200',             bar: 'bg-red-400',    card: 'border-l-4 border-red-400'     },
};

function ScoreRing({ value, label, max = 10 }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="24" fill="none" stroke="#e5e7eb" strokeWidth="6" />
          <circle
            cx="30" cy="30" r="24"
            fill="none"
            stroke="#4f46e5"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 24}`}
            strokeDashoffset={`${2 * Math.PI * 24 * (1 - pct / 100)}`}
            className="transition-all duration-700"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-gray-800">
          {value ?? '—'}
        </span>
      </div>
      <p className="text-xs text-gray-500 font-medium text-center">{label}</p>
    </div>
  );
}

export default function Report() {
  const { interviewId } = useParams();  // fixed — was candidateId
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.get(`/report/${interviewId}`)
      .then(({ data }) => setReport(data))
      .catch((err) => setError(err.message));
  }, [interviewId]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-2">Failed to load report</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading report...</p>
        </div>
      </div>
    );
  }

  const initials = report.candidate.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '??';

  const answered = report.interview.answers.filter(a => !a.skipped);
  const skipped  = report.interview.answers.filter(a => a.skipped);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400" />
          <div className="p-8">
            <div className="flex items-start gap-5 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-800 truncate">{report.candidate.name}</h2>
                <p className="text-gray-400 text-sm mt-0.5">
                  {report.candidate.jobRole} · {report.candidate.email}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-3xl font-bold text-indigo-600">{report.finalScore ?? '—'}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Final Score</p>
              </div>
            </div>

            <div className="flex items-center justify-around">
              <ScoreRing value={report.interview.overallInterviewScore} label="Interview" max={10} />
              <div className="h-12 w-px bg-gray-100" />
              <ScoreRing value={report.resumeAnalysis?.overall_score} label="Resume" max={10} />
              <div className="h-12 w-px bg-gray-100" />
              <ScoreRing value={report.finalScore} label="Overall" max={10} />
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total', value: report.interview.totalQuestions },
            { label: 'Answered', value: report.interview.answeredQuestions },
            { label: 'Skipped', value: report.interview.skippedQuestions },
            { label: 'Status', value: report.interview.status },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-lg font-bold text-gray-800 capitalize">{value ?? '—'}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Verdict breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-4">Verdict breakdown</h3>
          <div className="grid grid-cols-3 gap-3">
            {['good', 'average', 'weak'].map((v) => {
              const count = report.interview.verdictBreakdown[v];
              const total = answered.length || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={v} className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-2xl font-bold text-gray-800">{count}</p>
                  <p className={`text-xs font-semibold capitalize mt-1 mb-3 ${
                    v === 'good' ? 'text-emerald-600' : v === 'average' ? 'text-amber-600' : 'text-red-500'
                  }`}>{v}</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-700 ${VERDICT_STYLES[v].bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Answered questions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-4">Answer breakdown</h3>
          <div className="flex flex-col gap-3">
            {answered.map((a, i) => (
              <div key={i} className={`rounded-2xl p-5 bg-gray-50 ${VERDICT_STYLES[a.verdict]?.card ?? ''}`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="font-semibold text-gray-800 text-sm leading-snug">
                    <span className="text-indigo-500 mr-1.5">Q{a.questionIndex + 1}.</span>
                    {a.questionText}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${VERDICT_STYLES[a.verdict]?.pill}`}>
                      {a.verdict}
                    </span>
                    <span className="text-xs font-bold text-gray-600 bg-white px-2 py-1 rounded-full ring-1 ring-gray-200">
                      {a.score}/10
                    </span>
                  </div>
                </div>

                {a.transcript && (
                  <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">
                    {a.transcript}
                  </p>
                )}

                <div className="w-full bg-gray-200 rounded-full h-1 mb-3">
                  <div
                    className={`h-1 rounded-full ${VERDICT_STYLES[a.verdict]?.bar}`}
                    style={{ width: `${(a.score / 10) * 100}%` }}
                  />
                </div>

                {a.tip && (
                  <div className="flex items-start gap-2 text-xs text-gray-500 bg-white rounded-xl px-3 py-2 ring-1 ring-gray-100">
                    <svg className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>{a.tip}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Skipped questions */}
        {skipped.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-4">
              Skipped questions
              <span className="ml-2 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                {skipped.length}
              </span>
            </h3>
            <div className="flex flex-col gap-2">
              {skipped.map((a, i) => (
                <div key={i} className="rounded-xl p-4 bg-amber-50 border-l-4 border-amber-300">
                  <p className="text-sm font-medium text-gray-700">
                    <span className="text-amber-500 mr-1.5">Q{a.questionIndex + 1}.</span>
                    {a.questionText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <Link
          to="/candidate/upload"
          className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Start New Interview
        </Link>

      </div>
    </div>
  );
}