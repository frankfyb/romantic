'use client';

import { useEffect, useState } from 'react';
import { Mail, Lock, User as UserIcon, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '@/components/common/Button';
import { validateEmail, validateNickname, validatePassword } from '@/utils/validator';

// 类型定义（增强类型安全）
type RegisterContentProps = {
  onRegistered: () => void;
  // 从父组件接收的props（配合LoginContent优化版）
  onSendCode?: (email: string) => void;
  email?: string;
  countdown?: number;
};

// 表单状态类型
type FormState = {
  email: string;
  nickname: string;
  password: string;
  confirmPassword: string;
  code: string;
};

// 验证提示类型
type FieldError = {
  email: string;
  nickname: string;
  password: string;
  confirmPassword: string;
  code: string;
  global: string;
};

export default function RegisterContent({ 
  onRegistered, 
  onSendCode: parentSendCode,
  email: parentEmail = '',
  countdown: parentCountdown = 0
}: RegisterContentProps) {
  // 表单状态管理（统一初始化）
  const [formState, setFormState] = useState<FormState>({
    email: parentEmail,
    nickname: '',
    password: '',
    confirmPassword: '',
    code: '',
  });
  
  // 局部状态（优先使用父组件传递的状态，保持统一）
  const [localCountdown, setLocalCountdown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 字段级错误提示（替代alert，提升体验）
  const [fieldErrors, setFieldErrors] = useState<FieldError>({
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    code: '',
    global: '',
  });
  
  // 实时验证状态（密码强度/昵称格式等）
  const [validationStatus, setValidationStatus] = useState({
    passwordStrength: 'weak' as 'weak' | 'medium' | 'strong' | '',
    nicknameValid: false,
    emailValid: false,
  });

  // 合并倒计时（父组件传递的优先级更高）
  const countdown = parentCountdown || localCountdown;

  // 倒计时逻辑（性能优化：完善清理机制）
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (localCountdown > 0) {
      timer = setInterval(() => {
        setLocalCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [localCountdown]);

  // 实时表单验证（输入时即时反馈）
  useEffect(() => {
    // 邮箱验证
    if (formState.email) {
      const emailCheck = validateEmail(formState.email);
      setFieldErrors(prev => ({ ...prev, email: emailCheck.valid ? '' : emailCheck.message }));
      setValidationStatus(prev => ({ ...prev, emailValid: emailCheck.valid }));
    } else {
      setFieldErrors(prev => ({ ...prev, email: '' }));
      setValidationStatus(prev => ({ ...prev, emailValid: false }));
    }

    // 昵称验证
    if (formState.nickname) {
      const nickCheck = validateNickname(formState.nickname);
      setFieldErrors(prev => ({ ...prev, nickname: nickCheck.valid ? '' : nickCheck.message }));
      setValidationStatus(prev => ({ ...prev, nicknameValid: nickCheck.valid }));
    } else {
      setFieldErrors(prev => ({ ...prev, nickname: '' }));
      setValidationStatus(prev => ({ ...prev, nicknameValid: false }));
    }

    // 密码强度验证
    if (formState.password) {
      const pwdCheck = validatePassword(formState.password);
      setFieldErrors(prev => ({ ...prev, password: pwdCheck.valid ? '' : pwdCheck.message }));
      
      // 密码强度判断
      let strength: 'weak' | 'medium' | 'strong' = 'weak';
      if (formState.password.length >= 8 && /[a-zA-Z]/.test(formState.password) && /\d/.test(formState.password)) {
        strength = 'medium';
      }
      if (formState.password.length >= 12 && /[!@#$%^&*]/.test(formState.password)) {
        strength = 'strong';
      }
      setValidationStatus(prev => ({ ...prev, passwordStrength: pwdCheck.valid ? strength : '' }));
    } else {
      setFieldErrors(prev => ({ ...prev, password: '' }));
      setValidationStatus(prev => ({ ...prev, passwordStrength: '' }));
    }

    // 确认密码验证
    if (formState.confirmPassword) {
      const error = formState.password !== formState.confirmPassword 
        ? '两次密码输入不一致' 
        : '';
      setFieldErrors(prev => ({ ...prev, confirmPassword: error }));
    } else {
      setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
    }

    // 验证码验证
    if (formState.code) {
      const error = formState.code.length !== 6 
        ? '请输入6位数字验证码' 
        : '';
      setFieldErrors(prev => ({ ...prev, code: error }));
    } else {
      setFieldErrors(prev => ({ ...prev, code: '' }));
    }
  }, [formState]);

  // 表单字段变更处理（统一管理）
  const handleFormChange = (field: keyof FormState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    // 清空全局错误提示
    setFieldErrors(prev => ({ ...prev, global: '' }));
  };

  // 发送验证码（兼容父组件传递的方法）
  const handleSendCode = async () => {
    // 前置校验
    if (!formState.email) {
      setFieldErrors(prev => ({ ...prev, email: '请输入邮箱地址' }));
      return;
    }
    const emailCheck = validateEmail(formState.email);
    if (!emailCheck.valid) {
      setFieldErrors(prev => ({ ...prev, email: emailCheck.message }));
      return;
    }

    // 如果父组件传递了发送方法，优先使用
    if (parentSendCode) {
      parentSendCode(formState.email);
      return;
    }

    // 局部发送逻辑（兼容原有逻辑）
    setSendingCode(true);
    setFieldErrors(prev => ({ ...prev, global: '' }));
    
    try {
      const res = await fetch('/api/auth/email/code', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: formState.email, type: 'REGISTER' }),
      });

      if (!res.ok) throw new Error(`请求失败：${res.status}`);
      
      const data = await res.json();
      
      if (data.code === 200 || data.success) {
        setLocalCountdown(60);
        // 自动填充测试验证码（仅开发环境）
        if (data.data?.code) {
          setFormState(prev => ({ ...prev, code: data.data.code }));
        }
        setFieldErrors(prev => ({ ...prev, global: '' }));
      } else {
        setFieldErrors(prev => ({ ...prev, global: data.msg || '发送验证码失败' }));
      }
    } catch (err) {
      console.error('发送验证码错误：', err);
      setFieldErrors(prev => ({ 
        ...prev, 
        global: '网络异常，验证码发送失败，请稍后重试' 
      }));
    } finally {
      setSendingCode(false);
    }
  };

  // 表单提交（完整校验+错误处理）
  const handleSubmit = async () => {
    // 1. 全量校验
    const emailCheck = validateEmail(formState.email);
    const nickCheck = validateNickname(formState.nickname);
    const pwdCheck = validatePassword(formState.password);
    
    // 收集所有错误
    const newErrors: FieldError = {
      email: emailCheck.valid ? '' : emailCheck.message,
      nickname: nickCheck.valid ? '' : nickCheck.message,
      password: pwdCheck.valid ? '' : pwdCheck.message,
      confirmPassword: formState.password !== formState.confirmPassword ? '两次密码输入不一致' : '',
      code: formState.code.length !== 6 ? '请输入6位数字验证码' : '',
      global: '',
    };
    
    // 2. 检查是否有字段错误
    const hasFieldErrors = Object.values(newErrors).some(error => error && !['global'].includes(error));
    if (hasFieldErrors) {
      setFieldErrors(newErrors);
      return;
    }

    // 3. 检查必填项
    if (!formState.email || !formState.nickname || !formState.password || !formState.confirmPassword || !formState.code) {
      setFieldErrors(prev => ({ 
        ...prev, 
        global: '请填写完整的注册信息' 
      }));
      return;
    }

    // 4. 提交请求
    setLoading(true);
    setFieldErrors(prev => ({ ...prev, global: '' }));
    
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: formState.email, 
          nickname: formState.nickname, 
          password: formState.password, 
          confirmPassword: formState.confirmPassword, 
          code: formState.code 
        }),
      });

      if (!res.ok) throw new Error(`注册请求失败：${res.status}`);
      
      const data = await res.json();
      
      if (data.code === 200 || data.success) {
        // 注册成功回调
        setFieldErrors(prev => ({ 
          ...prev, 
          global: '注册成功，即将跳转到登录页' 
        }));
        setTimeout(() => {
          onRegistered();
        }, 1500);
      } else {
        setFieldErrors(prev => ({ 
          ...prev, 
          global: data.msg || '注册失败，请稍后重试' 
        }));
      }
    } catch (err) {
      console.error('注册错误：', err);
      setFieldErrors(prev => ({ 
        ...prev, 
        global: '网络异常，注册失败，请检查网络后重试' 
      }));
    } finally {
      setLoading(false);
    }
  };

  // 获取输入框样式（根据错误状态）
  const getInputClass = (field: keyof FieldError) => {
    const hasError = !!fieldErrors[field];
    return `w-full pl-10 pr-4 py-2.5 bg-pink-50/50 border ${
      hasError ? 'border-rose-300' : 'border-pink-100'
    } rounded-xl focus:outline-none focus:ring-2 ${
      hasError ? 'focus:ring-rose-200' : 'focus:ring-rose-200'
    } text-slate-600 placeholder-pink-300 transition-all`;
  };

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      {/* 全局提示（成功/失败） */}
      {fieldErrors.global && (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          fieldErrors.global.includes('成功') 
            ? 'bg-green-50 border border-green-200 text-green-600' 
            : 'bg-rose-50 border border-rose-200 text-rose-600'
        }`}>
          {fieldErrors.global.includes('成功') ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="text-sm">{fieldErrors.global}</span>
        </div>
      )}

      {/* 表单输入区域 */}
      <div className="space-y-3">
        {/* 邮箱输入框 */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-300" />
          <input
            type="email"
            placeholder="请输入邮箱地址"
            value={formState.email}
            onChange={(e) => handleFormChange('email', e.target.value)}
            className={getInputClass('email')}
            aria-label="邮箱地址"
            disabled={loading || sendingCode}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* 昵称输入框 */}
        <div className="relative">
          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-300" />
          <input
            type="text"
            placeholder="请输入昵称（2-16个字符）"
            value={formState.nickname}
            onChange={(e) => handleFormChange('nickname', e.target.value)}
            className={getInputClass('nickname')}
            aria-label="昵称"
            disabled={loading}
          />
          {fieldErrors.nickname && (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {fieldErrors.nickname}
            </p>
          )}
        </div>

        {/* 密码输入框 */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-300" />
          <input
            type="password"
            placeholder="请设置密码（至少8位，含字母和数字）"
            value={formState.password}
            onChange={(e) => handleFormChange('password', e.target.value)}
            className={getInputClass('password')}
            aria-label="密码"
            disabled={loading}
          />
          {fieldErrors.password ? (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {fieldErrors.password}
            </p>
          ) : validationStatus.passwordStrength && (
            <div className="mt-1 flex items-center gap-2">
              <div className="text-xs text-slate-500">密码强度：</div>
              <div className={`w-full h-1 rounded-full flex gap-1`}>
                <div 
                  className={`h-full rounded-full ${
                    validationStatus.passwordStrength === 'weak' ? 'bg-red-400' : 
                    validationStatus.passwordStrength === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                  }`} 
                  style={{ 
                    width: validationStatus.passwordStrength === 'weak' ? '33%' : 
                           validationStatus.passwordStrength === 'medium' ? '66%' : '100%' 
                  }}
                />
              </div>
              <div className="text-xs">
                {validationStatus.passwordStrength === 'weak' && '弱'}
                {validationStatus.passwordStrength === 'medium' && '中'}
                {validationStatus.passwordStrength === 'strong' && '强'}
              </div>
            </div>
          )}
        </div>

        {/* 确认密码输入框 */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-300" />
          <input
            type="password"
            placeholder="请确认密码"
            value={formState.confirmPassword}
            onChange={(e) => handleFormChange('confirmPassword', e.target.value)}
            className={getInputClass('confirmPassword')}
            aria-label="确认密码"
            disabled={loading}
          />
          {fieldErrors.confirmPassword && (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* 验证码输入框 */}
        <div className="relative flex gap-2">
          <div className="flex-1 relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-300" />
            <input
              type="text"
              placeholder="请输入6位验证码"
              value={formState.code}
              onChange={(e) => handleFormChange('code', e.target.value.replace(/[^0-9]/g, ''))}
              maxLength={6}
              className={getInputClass('code')}
              aria-label="验证码"
              disabled={loading || countdown > 0}
            />
            {fieldErrors.code && (
              <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.code}
              </p>
            )}
          </div>
          <Button
            variant="secondary"
            className="whitespace-nowrap min-w-[120px]"
            onClick={handleSendCode}
            disabled={sendingCode || countdown > 0 || loading || !formState.email || !validationStatus.emailValid}
            aria-disabled={sendingCode || countdown > 0 || loading}
          >
            {countdown > 0 
              ? `${countdown}s后重新获取` 
              : sendingCode 
                ? '发送中...' 
                : '获取验证码'}
          </Button>
        </div>
      </div>

      {/* 注册按钮 */}
      <Button
        variant="primary"
        className="w-full mt-2 py-2.5"
        onClick={handleSubmit}
        disabled={loading}
        aria-label="完成注册"
      >
        {loading ? '提交中...' : '注册'}
      </Button>

      {/* 注册提示 */}
      <p className="text-xs text-slate-400 text-center mt-2">
        点击注册即表示同意《用户协议》和《隐私政策》
      </p>
    </div>
  );
}