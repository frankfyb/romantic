'use client'
import { useState } from 'react';
import { Mail, Lock, ScanEye } from 'lucide-react'
import Button from '@/components/common/Button'

export default function RegisterContent({ onRegistered }: { onRegistered: () => void }) {
  const [openid, setOpenid] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'scan' | 'verify'>('scan');

  // 模拟获取OpenID的函数（实际项目中会通过微信授权获取）
  const handleScanQRCode = () => {
    // 在实际应用中，这里会触发微信授权流程
    // 暂时使用模拟的OpenID
    setOpenid('o' + Math.random().toString(36).substring(2, 15));
    setStep('verify');
  };

  const handleResendCode = () => {
    if (!openid) return alert('请先扫描二维码');
    alert('验证码已重新发送到您的微信');
  };

  const handleSubmit = async () => {
    if (!openid || !code) return alert('请输入验证码');
    
    setLoading(true);
    try {
      const res = await fetch('/api/wechat/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openid, code }),
      });
      const data = await res.json();
      
      if (data.success) {
        // 验证成功，完成注册
        onRegistered();
      } else {
        alert(data.error || '验证码错误');
      }
    } catch (err) {
      alert('验证失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === 'scan' ? (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">微信扫码注册</h3>
            <p className="text-slate-500 text-sm">关注公众号获取注册验证码</p>
          </div>
          
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <ScanEye className="w-12 h-12 text-gray-400" />
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-rose-500 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap">
                微信公众号二维码
              </div>
            </div>
          </div>
          
          <Button 
            variant="primary" 
            className="w-full mt-2" 
            onClick={handleScanQRCode}
          >
            已扫码关注，下一步
          </Button>
          
          <div className="text-center text-xs text-slate-400">
            扫码关注公众号后，将收到6位数字验证码
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-slate-800 mb-1">输入验证码</h3>
              <p className="text-slate-500 text-sm">已向您的微信发送验证码</p>
            </div>
            
            <div className="relative flex gap-2">
              <div className="flex-1 relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-pink-300" />
                <input 
                  type="text" 
                  placeholder="6位验证码" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-2.5 bg-pink-50/50 border border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 text-slate-600 placeholder-pink-300" 
                />
              </div>
              <Button 
                variant="secondary" 
                className="whitespace-nowrap" 
                onClick={handleResendCode}
              >
                重新获取
              </Button>
            </div>
          </div>
          
          <Button 
            variant="primary" 
            className="w-full mt-2" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '验证中...' : '完成注册'}
          </Button>
          
          <button 
            className="text-sm text-rose-500 hover:text-rose-600 w-full text-center"
            onClick={() => setStep('scan')}
          >
            重新扫码
          </button>
        </div>
      )}
    </div>
  )
}