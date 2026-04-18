import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-xl">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">AI Interview Analyzer</h2>
        <p className="text-gray-500 text-lg mb-8">
          Upload your resume, answer interview questions, and get instant AI feedback on your performance.
        </p>
        <Link
          to="/upload"
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-lg hover:bg-indigo-700 transition"
        >
          Start Interview →
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl w-full">
        {[
          { icon: '📄', title: 'Resume Analysis', desc: 'AI scans your resume and scores your profile' },
          { icon: '🎙', title: 'Voice Answers', desc: 'Answer questions by speaking into your mic' },
          { icon: '📊', title: 'Instant Report', desc: 'Get scores, verdicts and tips after each answer' },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
            <p className="text-gray-500 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}