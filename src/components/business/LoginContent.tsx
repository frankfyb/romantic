'use client';
import { useState } from 'react';
import { User, Lock } from 'lucide-react';
import Button from '@/components/common/Button';
import RegisterContent from '@/components/business/RegisterContent';
import ResetPasswordContent from '@/components/business/ResetPasswordContent';

export default function LoginContent({ onLogin }: { onLogin: () => void }) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'reset'>('login');

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-6 border-b border-pink-100">
        <button 
          className={`pb-2 font-medium ${activeTab === 'login' ? 'border-b-2 border-rose-400 text-rose-500' : 'text-slate-400 hover:text-rose-400'}`}
          onClick={() => setActiveTab('login')}
        >
          登录
        </button>
        <button 
          className={`pb-2 font-medium ${activeTab === 'register' ? 'border-b-2 border-rose-400 text-rose-500' : 'text-slate-400 hover:text-rose-400'}`}
          onClick={() => setActiveTab('register')}
        >
          注册
        </button>
        <button 
          className={`pb-2 font-medium ${activeTab === 'reset' ? 'border-b-2 border-rose-400 text-rose-500' : 'text-slate-400 hover:text-rose-400'}`}
          onClick={() => setActiveTab('reset')}
        >
          重置密码
        </button>
      </div>

      {/* 登录 */}
      {activeTab === 'login' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-pink-300" />
              <input 
                type="text" 
                placeholder="账号 / 手机号" 
                className="w-full pl-10 pr-4 py-2.5 bg-pink-50/50 border border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 text-slate-600 placeholder-pink-300" 
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-pink-300" />
              <input 
                type="password" 
                placeholder="密码" 
                className="w-full pl-10 pr-4 py-2.5 bg-pink-50/50 border border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 text-slate-600 placeholder-pink-300" 
              />
            </div>
          </div>

          <Button variant="primary" className="w-full mt-4" onClick={onLogin}>
            开启浪漫之旅
          </Button>

          <div className="flex justify-center gap-4 mt-6">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 hover:scale-110 transition-transform cursor-pointer">
              <span className="text-xs">微信</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 hover:scale-110 transition-transform cursor-pointer">
              <span className="text-xs">QQ</span>
            </div>
          </div>
        </div>
      )}

      {/* 注册 */}
      {activeTab === 'register' && (
        <div className="mt-4">
          <RegisterContent onRegistered={onLogin} />
        </div>
      )}

      {/* 重置密码 */}
      {activeTab === 'reset' && (
        <div className="mt-4">
          <ResetPasswordContent onReset={onLogin} />
        </div>
      )}
    </div>
  );
}