import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  ClipboardCheck, 
  BarChart2, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: { value: number; label: string }[];
}

interface AssessmentData {
  type: string;
  name: string;
  description: string;
  questions: Question[];
  scoring: { [key: string]: string };
}

interface AssessmentResult {
  id: string;
  type: string;
  score: number;
  interpretation: string;
  created_at: string;
}

const Assessment: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'phq9' | 'gad7' | 'history'>('phq9');
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [history, setHistory] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    if (activeTab === 'phq9' || activeTab === 'gad7') {
      loadAssessment(activeTab);
    } else if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const loadAssessment = async (type: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/assessments/${type}`);
      setAssessment(response.data);
      setAnswers({});
      setResult(null);
      setShowResult(false);
    } catch (error) {
      console.error('Failed to load assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const [phq9Res, gad7Res] = await Promise.all([
        axios.get(`${API_URL}/assessments/phq9/history`),
        axios.get(`${API_URL}/assessments/gad7/history`)
      ]);
      setHistory([...(phq9Res.data.assessments || []), ...(gad7Res.data.assessments || [])].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async () => {
    if (!assessment) return;

    const answerArray = Object.entries(answers).map(([qid, value]) => ({
      questionId: parseInt(qid),
      value
    }));

    if (answerArray.length !== assessment.questions.length) {
      alert('请回答所有问题');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/assessments/${assessment.type}/submit`, {
        answers: answerArray
      });
      setResult(response.data.assessment);
      setShowResult(true);
    } catch (error) {
      console.error('Failed to submit assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (score: number, type: string) => {
    if (type === 'phq9') {
      if (score <= 4) return { level: '低', color: 'text-green-600', bg: 'bg-green-100' };
      if (score <= 9) return { level: '轻度', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      if (score <= 14) return { level: '中度', color: 'text-orange-600', bg: 'bg-orange-100' };
      return { level: '重度', color: 'text-red-600', bg: 'bg-red-100' };
    } else {
      if (score <= 4) return { level: '低', color: 'text-green-600', bg: 'bg-green-100' };
      if (score <= 9) return { level: '轻度', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      if (score <= 14) return { level: '中度', color: 'text-orange-600', bg: 'bg-orange-100' };
      return { level: '重度', color: 'text-red-600', bg: 'bg-red-100' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">心理测评</h1>
        <p className="text-gray-600">专业量表，了解自己的心理状态</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-8 bg-white rounded-xl p-2 shadow-md">
        <button
          onClick={() => setActiveTab('phq9')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === 'phq9'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          PHQ-9 抑郁筛查
        </button>
        <button
          onClick={() => setActiveTab('gad7')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === 'gad7'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          GAD-7 焦虑筛查
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          测评历史
        </button>
      </div>

      {/* Assessment Content */}
      {activeTab === 'history' ? (
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-indigo-600" />
            测评历史
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>还没有测评记录，快来开始第一次测评吧！</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">
                      {item.type === 'phq9' ? 'PHQ-9 抑郁筛查' : 'GAD-7 焦虑筛查'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-indigo-600">{item.score} 分</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      getRiskLevel(item.score, item.type).bg
                    } ${getRiskLevel(item.score, item.type).color}`}>
                      {getRiskLevel(item.score, item.type).level}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-2">{item.interpretation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : assessment ? (
        showResult && result ? (
          <div className="bg-white rounded-xl p-8 shadow-md">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-4">
                <BarChart2 className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {assessment.name}
              </h2>
              <p className="text-gray-600">测评完成</p>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">你的得分</p>
                <p className="text-5xl font-bold text-indigo-600 mb-2">{result.score} 分</p>
                <p className={`text-xl font-semibold ${
                  getRiskLevel(result.score, result.type).color
                }`}>
                  {result.interpretation}
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">重要提醒</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    这个测评结果仅供参考，不能替代专业诊断。如果你有严重的心理困扰，
                    请寻求专业心理咨询师或医生的帮助。
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowResult(false)}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              再测一次
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{assessment.name}</h2>
              <p className="text-gray-600">{assessment.description}</p>
            </div>

            <div className="space-y-6">
              {assessment.questions.map((q, index) => (
                <div key={q.id} className="border border-gray-200 rounded-lg p-4">
                  <p className="font-medium text-gray-900 mb-4">
                    <span className="text-indigo-600 font-bold mr-2">{index + 1}.</span>
                    {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                          answers[q.id] === option.value
                            ? 'bg-indigo-50 border-2 border-indigo-600'
                            : 'border border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          value={option.value}
                          checked={answers[q.id] === option.value}
                          onChange={() => handleAnswer(q.id, option.value)}
                          className="w-4 h-4 text-indigo-600"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== assessment.questions.length || loading}
              className="w-full mt-8 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  提交测评
                </>
              )}
            </button>
          </div>
        )
      ) : (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}
    </div>
  );
};

export default Assessment;
