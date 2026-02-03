import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  User, 
  Mail, 
  Shield, 
  LogOut, 
  Trash2, 
  Activity,
  MessageCircle,
  BookOpen,
  ClipboardCheck,
  Loader2,
  AlertCircle
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/users/stats`);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') {
      alert('请输入 DELETE 确认删除');
      return;
    }

    try {
      await axios.delete(`${API_URL}/users/me`);
      logout();
      navigate('/');
      alert('账户已删除');
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('删除失败，请重试');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-4">
          <User className="w-10 h-10 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">个人中心</h1>
        <p className="text-gray-600 mt-1">管理你的账户和数据</p>
      </div>

      {/* User Info */}
      <div className="bg-white rounded-xl p-6 shadow-md mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-600" />
          账户信息
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">邮箱</p>
              <p className="font-medium text-gray-900">
                {user?.email || '未绑定（匿名用户）'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">用户ID</p>
              <p className="font-medium text-gray-900 text-sm">
                {user?.id}
              </p>
            </div>
          </div>

          {user?.is_anonymous && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">匿名用户</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    你的数据将在24小时后清除。注册账号可以永久保存数据。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-xl p-6 shadow-md mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          使用统计
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <MessageCircle className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
              <p className="text-2xl font-bold text-indigo-600">{stats.conversations}</p>
              <p className="text-sm text-gray-600">对话次数</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <BookOpen className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{stats.diaries}</p>
              <p className="text-sm text-gray-600">日记条数</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <ClipboardCheck className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-purple-600">{stats.assessments}</p>
              <p className="text-sm text-gray-600">测评次数</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">暂无数据</p>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl p-6 shadow-md mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">操作</h2>
        
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            <LogOut className="w-5 h-5" />
            退出登录
          </button>

          {!user?.is_anonymous && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition"
            >
              <Trash2 className="w-5 h-5" />
              删除账户
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              确认删除账户
            </h3>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 mb-2">
                <strong>警告：</strong>删除账户后，所有数据将永久丢失，无法恢复。
              </p>
              <p className="text-sm text-red-700">
                请输入 <strong>DELETE</strong> 确认删除。
              </p>
            </div>

            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="输入 DELETE 确认"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                取消
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                删除账户
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 mt-8">
        <p>心之 AI v1.0.0</p>
        <p className="mt-1">© 2026 MindAI. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Profile;
