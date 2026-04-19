import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import FeedbackCard from '../components/FeedbackCard';
import useAntiCheat from '../hooks/useAntiCheat';

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-orange-100 text-orange-700',
  hard: 'bg-red-100 text-red-700',
};

const MAX_SECONDS = 120;

export default function Interview() {
  const { candidateId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
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

  // Anti-cheat
  const { enterFullscreen } = useAntiCheat({
    candidateId,
    onWarning: (reason, count) => {
      setWarning({ reason, count });
      setTimeout(() => setWarning(null), 4000);
    },
    onVoid: (reason) => {
      setVoidMessage(reason);
      stopEverything();
    },
  });

  // Load questions + start fullscreen + camera
  useEffect(() => {
    const init = async () => {
      const { data } = await API.get(`/questions/${candidateId}`);
      setQuestions(data.questions);
      enterFullscreen();
      await startCamera();
    };
    init();
    return () => stopEverything();
  }, [candidateId]);

  // Speak question when index changes
  useEffect(() => {
    if (questions.length > 0 && !voidMessage) {
      speakQuestion(questions[currentIndex]?.text);
    }
  }, [currentIndex, questions]);

  // Recording countdown timer
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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera error:', err);
    }
  };

  const stopEverything = () => {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
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
    formData.append('candidateId', candidateId);
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

  const skipQuestion = () => {
    setSkipped((s) => [...s, currentIndex]);
    nextQuestion();
  };

  const nextQuestion = () => {
    setFeedback(null);
    if (currentIndex + 1 >= questions.length) {
      stopEverything();
      navigate(`/report/${candidateId}`);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // Voided screen
  if (voidMessage) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border-2 border-red-300 p-10 max-w-md text-center shadow-lg">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-600 mb-3">Interview Terminated</h2>
          <p className="text-gray-600">{voidMessage}</p>
          <p className="text-gray-400 text-sm mt-4">
            This incident has been reported to the interviewer.
          </p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading questions...</p>
      </div>
    );
  }

  const question = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Warning banner */}
      {warning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white text-center py-3 font-semibold animate-pulse">
          ⚠️ Warning {warning.count}/3 — {warning.reason}. Interview will be terminated on 3rd violation.
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${DIFFICULTY_COLORS[question?.difficulty]}`}>
              {question?.difficulty}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">

          {/* Left — question + controls */}
          <div className="col-span-2 flex flex-col gap-4">

            {/* Question card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{question?.type}</p>
              <h2 className="text-lg font-semibold text-gray-800 leading-relaxed">
                {question?.text}
              </h2>
            </div>

            {/* Timer */}
            {recording && (
              <div className={`text-center text-2xl font-bold ${timeLeft <= 30 ? 'text-red-500' : 'text-indigo-600'}`}>
                {formatTime(timeLeft)}
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-3">
              {!recording ? (
                <button
                  onClick={startRecording}
                  disabled={loading || !!feedback}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  🎙 Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition animate-pulse"
                >
                  ⏹ Stop Recording
                </button>
              )}
              <button
                onClick={() => speakQuestion(question?.text)}
                className="bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition"
              >
                🔊
              </button>
              {!recording && !feedback && (
                <button
                  onClick={skipQuestion}
                  className="bg-gray-100 text-gray-500 px-4 py-3 rounded-xl hover:bg-gray-200 transition text-sm"
                >
                  Skip
                </button>
              )}
            </div>

            {loading && (
              <p className="text-center text-gray-400 text-sm">Analyzing your answer...</p>
            )}

            {feedback && (
              <>
                <FeedbackCard feedback={feedback} />
                <button
                  onClick={nextQuestion}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
                >
                  {currentIndex + 1 >= questions.length ? 'View Report →' : 'Next Question →'}
                </button>
              </>
            )}
          </div>

          {/* Right — video feed */}
          <div className="flex flex-col gap-3">
            <div className="bg-black rounded-2xl overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-xs text-gray-500 text-center">
              {recording ? (
                <span className="text-red-500 font-semibold">● Recording</span>
              ) : (
                <span>Camera active</span>
              )}
            </div>

            {/* Skipped questions indicator */}
            {skipped.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-600">
                Skipped: Q{skipped.map(s => s + 1).join(', Q')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}