export default function FeedbackCard({ feedback }) {
  const config = {
    good:    { color: 'green',  bg: 'bg-green-50',  border: 'border-green-300', text: 'text-green-700' },
    average: { color: 'orange', bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700' },
    weak:    { color: 'red',    bg: 'bg-red-50',    border: 'border-red-300',    text: 'text-red-700' },
  };
  const c = config[feedback.verdict] || config.average;

  return (
    <div className={`${c.bg} ${c.border} border rounded-2xl p-6`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`${c.text} font-bold text-lg uppercase`}>{feedback.verdict}</span>
        <span className={`${c.text} font-bold text-2xl`}>{feedback.score}/10</span>
      </div>
      <p className="text-gray-700 text-sm mb-2">
        <span className="font-semibold">Transcript: </span>{feedback.transcript}
      </p>
      <p className="text-gray-700 text-sm">
        <span className="font-semibold">💡 Tip: </span>{feedback.tip}
      </p>
    </div>
  );
}