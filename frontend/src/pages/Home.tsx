import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageCircle, 
  BookOpen, 
  Activity, 
  Heart, 
  Shield, 
  Zap 
} from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'AI 心理咨询',
      description: '24/7 即时倾诉，温暖陪伴'
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: '情绪日记',
      description: '记录心情，发现情绪模式'
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: '心理测评',
      description: '专业量表，了解自己'
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: '自助工具',
      description: 'CBT 练习，放松训练'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: '隐私保护',
      description: '端到端加密，完全匿名'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: '即时可用',
      description: '无需预约，随时开始'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-16 px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          心之 AI
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          让每个人都能轻松获得心理支持
        </p>
        <div className="flex gap-4 justify-center">
          {user ? (
            <Link
              to="/chat"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              开始对话
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                免费试用
              </Link>
              <Link
                to="/login"
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition"
              >
                登录
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          核心功能
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition"
            >
              <div className="text-indigo-600 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          如何使用
        </h2>
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                选择体验方式
              </h3>
              <p className="text-gray-600">
                可以注册账号，也可以选择匿名快速体验
              </p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                选择 AI 咨询师
              </h3>
              <p className="text-gray-600">
                根据你的需求选择合适的 AI 角色（温和型、理性型、活泼型）
              </p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                开始对话
              </h3>
              <p className="text-gray-600">
                随时随地倾诉，获得温暖的回应和支持
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Notice */}
      <section className="py-16 px-4 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            ⚠️ 重要提醒
          </h2>
          <div className="bg-white rounded-xl p-8 shadow-md">
            <p className="text-gray-700 mb-4">
              AI 心理咨询不能替代专业的心理治疗。如果你正在经历严重的心理困扰，
              或有自杀、自伤的想法，请立即寻求专业帮助。
            </p>
            <p className="text-gray-600 text-sm">
              紧急求助热线：12320（卫生热线）或当地心理危机干预热线
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-gray-500 text-sm">
        <p>© 2026 心之 AI. All rights reserved.</p>
        <p className="mt-2">
          致力于提供温暖、安全、专业的心理支持服务
        </p>
      </footer>
    </div>
  );
};

export default Home;
