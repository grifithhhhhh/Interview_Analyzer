import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import FeedbackCard from '../components/FeedbackCard';
import useAntiCheat from '../hooks/useAntiCheat';

const DIFFICULTY_STYLES = {
  easy:   'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  medium: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  hard:   'bg-red-50 text-red-600 ring-1 ring-red-200',
};

const MAX_SECONDS = 120;

export default function Interview() {
  const { candidateId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [interviewId, setInterviewId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(MAX_SECONDS);
  const [warning, setWarning] = useState(null);
  const [voidMessage, setVoidMessage] = useState(null);
  const [skipped, setSkipped] = useState([]);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const { enterFullscreen } = useAntiCheat({
    interviewId,
    onWarning: (reason, count) => {
      setWarning({ reason, count });
      setTimeout(() => setWarning(null), 4000);
    },
    onVoid: (reason) => {
      setVoidMessage(reason);
      stopEverything();
    },
  });

  useEffect(() => {
    const init = async () => {
      const { data } = await API.get(`/questions/${candidateId}`);
      setQuestions(data.questions);
      setInterviewId(data.interviewId);
      enterFullscreen();
      await startCamera();
    };
    init();
    return () => stopEverything();
  }, [candidateId]);

  useEffect(() => {
    if (questions.length > 0 && !voidMessage) {
      speakQuestion(questions[currentIndex]?.text);
    }
  }, [currentIndex, questions]);

  useEffect(() => {
    if (recording) {
      setTimeLeft(MAX_SECONDS);
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            stopRecording();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [recording]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error('Camera error:', err);
    }
  };

  const stopEverything = () => {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    window.speechSynthesis.cancel();
  };

  const speakQuestion = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    mediaRecorder.start();
    setRecording(true);
    setFeedback(null);
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return;
    mediaRecorderRef.current.stop();
    setRecording(false);
    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      await submitAnswer(blob);
    };
  };

  const submitAnswer = async (blob) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('audio', blob, 'answer.webm');
    formData.append('interviewId', interviewId);
    formData.append('questionIndex', currentIndex);
    try {
      const { data } = await API.post('/interview/answer', formData);
      setFeedback(data);
    } catch (err) {
      alert('Submission failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const skipQuestion = async () => {
    setSkipped((s) => [...s, currentIndex]);
    const question = questions[currentIndex];
    try {
      await API.post('/interview/skip', {
        interviewId,
        questionIndex: currentIndex,
        questionText: question?.text,
      });
    } catch (err) {
      console.error('Skip save failed:', err);
    }
    nextQuestion();
  };

  const nextQuestion = () => {
    setFeedback(null);
    if (currentIndex + 1 >= questions.length) {
      stopEverything();
      navigate(`/candidate/report/${interviewId}`);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const timerPct = (timeLeft / MAX_SECONDS) * 100;
  const timerColor = timeLeft <= 30 ? '#ef4444' : '#4f46e5';

  if (voidMessage) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border-2 border-red-200 p-12 max-w-sm text-center shadow-lg shadow-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-3">Interview Terminated</h2>
          <p className="text-gray-500 text-sm leading-relaxed">{voidMessage}</p>
          <p className="text-gray-400 text-xs mt-4">This incident has been reported to the interviewer.</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading questions...</p>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">

      {warning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white text-center py-3 text-sm font-semibold">
          <span className="inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Warning {warning.count}/3 — {warning.reason}. Interview will be terminated on 3rd violation.
          </span>
        </div>
      )}

      <div className="h-1 bg-gray-100">
        <div
          className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 font-medium">
              Question <span className="text-gray-700 font-bold">{currentIndex + 1}</span> of {questions.length}
            </span>
            {skipped.length > 0 && (
              <span className="text-xs bg-amber-50 text-amber-600 ring-1 ring-amber-200 px-2.5 py-1 rounded-full font-medium">
                {skipped.length} skipped
              </span>
            )}
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${DIFFICULTY_STYLES[question?.difficulty]}`}>
            {question?.difficulty}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">

          <div className="col-span-2 flex flex-col gap-4">

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">{question?.type}</p>
              <h2 className="text-lg font-semibold text-gray-800 leading-relaxed">
                {question?.text}
              </h2>
            </div>

            {recording && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
                <div className="relative w-10 h-10 shrink-0">
                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="16" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                    <circle
                      cx="20" cy="20" r="16"
                      fill="none"
                      stroke={timerColor}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 16}`}
                      strokeDashoffset={`${2 * Math.PI * 16 * (1 - timerPct / 100)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className={`text-2xl font-bold tabular-nums ${timeLeft <= 30 ? 'text-red-500' : 'text-indigo-600'}`}>
                    {formatTime(timeLeft)}
                  </p>
                  <p className="text-xs text-gray-400">remaining</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-red-500">Recording</span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {!recording ? (
                <button
                  onClick={startRecording}
                  disabled={loading || !!feedback}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-semibold hover:bg-red-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <span className="w-3 h-3 bg-white rounded-sm" />
                  Stop Recording
                </button>
              )}
              <button
                onClick={() => speakQuestion(question?.text)}
                title="Replay question"
                className="bg-white border border-gray-200 text-gray-600 px-4 py-3 rounded-2xl hover:bg-gray-50 active:scale-95 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
              </button>
              {!recording && !feedback && (
                <button
                  onClick={skipQuestion}
                  className="bg-white border border-gray-200 text-gray-500 px-4 py-3 rounded-2xl hover:bg-gray-50 active:scale-95 transition-all text-xs font-semibold"
                >
                  Skip
                </button>
              )}
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-2 py-4">
                <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Analyzing your answer...</p>
              </div>
            )}

            {feedback && (
              <>
                <FeedbackCard feedback={feedback} />
                <button
                  onClick={nextQuestion}
                  className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {currentIndex + 1 >= questions.length ? 'View Report' : 'Next Question'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="bg-gray-900 rounded-2xl overflow-hidden aspect-video relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {recording && (
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-black/50 rounded-full px-2.5 py-1 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-xs font-semibold">REC</span>
                </div>
              )}
            </div>

            <div className={`rounded-xl border px-3 py-2 text-xs text-center font-medium transition-colors ${
              recording
                ? 'bg-red-50 border-red-200 text-red-600'
                : 'bg-white border-gray-100 text-gray-400'
            }`}>
              {recording ? 'Recording in progress' : 'Camera active'}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-3">
              <p className="text-xs text-gray-400 font-medium mb-2">Progress</p>
              <div className="flex flex-wrap gap-1.5">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${
                      i === currentIndex
                        ? 'bg-indigo-600 text-white'
                        : skipped.includes(i)
                        ? 'bg-amber-100 text-amber-600'
                        : i < currentIndex
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}