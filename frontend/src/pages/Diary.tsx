import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Plus, 
  Calendar, 
  Activity, 
  TrendingUp, 
  Loader2,
  Smile,
  Frown,
  Meh,
  Angry,
  Coffee,
  Zap,
  Heart
} from 'lucide-react';

interface DiaryEntry {
  id: string;
  mood: string;
  intensity: number;
  triggers?: string[];
  notes?: string;
  created_at: string;
}

const MOOD_ICONS = {
  happy: <Smile className="w-6 h-6 text-yellow-500" />,
  sad: <Frown className="w-6 h-6 text-blue-500" />,
  anxious: <Meh className="w-6 h-6 text-purple-500" />,
  angry: <Angry className="w-6 h-6 text-red-500" />,
  calm: <Coffee className="w-6 h-6 text-green-500" />,
  tired: <Zap className="w-6 h-6 text-gray-500" />,
  excited: <Heart className="w-6 h-6 text-pink-500" />
};

const MOOD_LABELS = {
  happy: '开心',
  sad: '难过',
  anxious: '焦虑',
  angry: '生气',
  calm: '平静',
  tired: '疲惫',
  excited: '兴奋'
};

const Diary: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const [formData, setFormData] = useState({
    mood: 'calm',
    intensity: 5,
    triggers: [] as string[],
    notes: ''
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    loadDiaries();
    loadStats();
  }, []);

  const loadDiaries = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/diary`);
      setEntries(response.data.diaries || []);
    } catch (error) {
      console.error('Failed to load diaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/diary/stats?days=7`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_URL}/diary`, formData);
      setShowForm(false);
      setFormData({ mood: 'calm', intensity: 5, triggers: [], notes: '' });
      loadDiaries();
      loadStats();
    } catch (error) {
      console.error('Failed to save diary:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 3) return 'bg-green-500';
    if (intensity <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">情绪日记</h1>
          <p className="text-gray-600 mt-1">记录你的心情，发现情绪模式</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          记录心情
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-indigo-600" />
              <span className="font-semibold text-gray-900">本周记录</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.trend?.reduce((sum: number, t: any) => sum + t.count, 0) || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-6 h-6 text-indigo-600" />
              <span className="font-semibold text-gray-900">平均强度</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.stats?.length > 0 
                ? (stats.stats.reduce((sum: number, s: any) => sum + parseFloat(s.avg_intensity), 0) / stats.stats.length).toFixed(1)
                : '0'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              <span className="font-semibold text-gray-900">最常见情绪</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {stats.stats?.length > 0 
                ? MOOD_LABELS[stats.stats[0].mood as keyof typeof MOOD_LABELS]
                : '无'}
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-md mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">记录新心情</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                你的心情
              </label>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                {Object.keys(MOOD_LABELS).map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setFormData({ ...formData, mood })}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition ${
                      formData.mood === mood
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {MOOD_ICONS[mood as keyof typeof MOOD_ICONS]}
                    <span className="text-xs text-gray-600">
                      {MOOD_LABELS[mood as keyof typeof MOOD_LABELS]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                强度：{formData.intensity}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.intensity}
                onChange={(e) => setFormData({ ...formData, intensity: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>轻微</span>
                <span>强烈</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                触发事件（可选）
              </label>
              <input
                type="text"
                placeholder="例如：工作压力、人际关系、健康问题"
                onChange={(e) => setFormData({ ...formData, triggers: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                备注（可选）
              </label>
              <textarea
                rows={3}
                placeholder="写下你的想法..."
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    保存
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Diary List */}
      <div className="space-y-4">
        {loading && entries.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-md">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">还没有记录，点击"记录心情"开始吧！</p>
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {MOOD_ICONS[entry.mood as keyof typeof MOOD_ICONS]}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {MOOD_LABELS[entry.mood as keyof typeof MOOD_LABELS]}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(entry.created_at).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getIntensityColor(entry.intensity)}`} />
                  <span className="text-sm font-medium text-gray-600">{entry.intensity}/10</span>
                </div>
              </div>
              
              {entry.triggers && entry.triggers.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">触发事件：</span>
                    {entry.triggers.join(', ')}
                  </p>
                </div>
              )}

              {entry.notes && (
                <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{entry.notes}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Diary;
