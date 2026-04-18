import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import FeedbackCard from '../components/FeedbackCard';

export default function Interview() {
  const { candidateId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    const fetchCandidate = async () => {
      const { data } = await API.get(`/questions/${candidateId}`);
      setQuestions(data.questions);
    };
    fetchCandidate();
  }, [candidateId]);

  useEffect(() => {
    if (questions.length > 0) {
      speakQuestion(questions[currentIndex]?.text);
    }
  }, [currentIndex, questions]);

  const speakQuestion = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
    mediaRecorder.start();
    setRecording(true);
    setFeedback(null);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      await submitAnswer(audioBlob);
    };
  };

  const submitAnswer = async (audioBlob) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'answer.webm');
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

  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      navigate(`/report/${candidateId}`);
    } else {
      setCurrentIndex((i) => i + 1);
      setFeedback(null);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{questions[currentIndex]?.type} · {questions[currentIndex]?.difficulty}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
            {questions[currentIndex]?.text}
          </h2>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-6">
          {!recording ? (
            <button
              onClick={startRecording}
              disabled={loading || !!feedback}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
            onClick={() => speakQuestion(questions[currentIndex]?.text)}
            className="bg-gray-100 text-gray-700 px-5 py-3 rounded-xl hover:bg-gray-200 transition"
          >
            🔊
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center text-gray-500 py-4">
            Analyzing your answer...
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <>
            <FeedbackCard feedback={feedback} />
            <button
              onClick={nextQuestion}
              className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
            >
              {currentIndex + 1 >= questions.length ? 'View Report →' : 'Next Question →'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}