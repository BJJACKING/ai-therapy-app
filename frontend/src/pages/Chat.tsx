import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Send, Loader2, MessageCircle, User, Bot } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AICharacter {
  id: 'gentle' | 'rational' | 'energetic';
  name: string;
  description: string;
  color: string;
}

const AI_CHARACTERS: AICharacter[] = [
  {
    id: 'gentle',
    name: '温暖陪伴者',
    description: '温和、共情、温暖、支持',
    color: 'bg-pink-500'
  },
  {
    id: 'rational',
    name: '理性分析师',
    description: '逻辑清晰、问题解决导向',
    color: 'bg-blue-500'
  },
  {
    id: 'energetic',
    name: '活力鼓励师',
    description: '轻松、幽默、鼓励、积极',
    color: 'bg-orange-500'
  }
];

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<AICharacter>(AI_CHARACTERS[0]);
  const [showCharacterSelect, setShowCharacterSelect] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCharacterSelect = (character: AICharacter) => {
    setSelectedCharacter(character);
    setShowCharacterSelect(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        message: input,
        aiRole: selectedCharacter.id,
        history: messages
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.reply,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，我暂时无法回应。请稍后再试。',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (showCharacterSelect) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            选择你的 AI 咨询师
          </h2>
          <p className="text-gray-600">
            不同的角色有不同的陪伴风格，选择最适合你的
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AI_CHARACTERS.map((character) => (
            <div
              key={character.id}
              onClick={() => handleCharacterSelect(character)}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition cursor-pointer border-2 border-transparent hover:border-indigo-500"
            >
              <div className={`${character.color} w-16 h-16 rounded-full flex items-center justify-center mb-4`}>
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {character.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {character.description}
              </p>
              <div className="text-indigo-600 font-medium text-sm">
                点击选择 →
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="bg-white rounded-t-xl p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`${selectedCharacter.color} w-10 h-10 rounded-full flex items-center justify-center`}>
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{selectedCharacter.name}</h3>
            <p className="text-sm text-gray-500">{selectedCharacter.description}</p>
          </div>
        </div>
        <button
          onClick={() => setShowCharacterSelect(true)}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          切换角色
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>开始对话吧，我会在这里陪伴你</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl p-4 ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-900 shadow-md'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
                <span className="text-xs opacity-75">
                  {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 shadow-md rounded-xl p-4 max-w-[80%]">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                <span className="text-gray-600">思考中...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white rounded-b-xl p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入你的想法..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                发送
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
