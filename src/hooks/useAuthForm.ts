import { useState, useEffect, useCallback } from 'react';
import { validateEmail, validatePassword, validateNickname } from '@/utils/validator';

// 验证码类型
export type VerificationCodeType = 'REGISTER' | 'LOGIN' | 'RESET';

// 表单字段错误类型
export type FieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  nickname?: string;
  code?: string;
  global?: string;
};

// 表单验证状态
export type ValidationStatus = {
  emailValid: boolean;
  passwordValid: boolean;
  passwordStrength: 'weak' | 'medium' | 'strong' | '';
  nicknameValid: boolean;
};

// Hook返回类型
export type UseAuthFormReturn = {
  // 状态
  countdown: number;
  sendingCode: boolean;
  loading: boolean;
  fieldErrors: FieldErrors;
  validationStatus: ValidationStatus;
  
  // 方法
  startCountdown: (seconds?: number) => void;
  sendVerificationCode: (email: string, type: VerificationCodeType) => Promise<boolean>;
  validateField: (field: keyof FieldErrors, value: string) => void;
  clearError: (field: keyof FieldErrors) => void;
  setGlobalError: (message: string) => void;
  clearGlobalError: () => void;
  setLoading: (loading: boolean) => void;
};

/**
 * 认证表单共享Hook
 * 处理验证码发送、倒计时、表单验证等通用逻辑
 */
export const useAuthForm = (): UseAuthFormReturn => {
  // 状态管理
  const [countdown, setCountdown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>({
    emailValid: false,
    passwordValid: false,
    passwordStrength: '',
    nicknameValid: false,
  });

  // 倒计时逻辑
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
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
  }, [countdown]);

  // 启动倒计时
  const startCountdown = useCallback((seconds: number = 60) => {
    setCountdown(seconds);
  }, []);

  // 发送验证码
  const sendVerificationCode = useCallback(async (email: string, type: VerificationCodeType): Promise<boolean> => {
    // 前置校验
    if (!email) {
      setFieldErrors(prev => ({ ...prev, email: '请输入邮箱地址' }));
      return false;
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setFieldErrors(prev => ({ ...prev, email: emailCheck.message }));
      return false;
    }

    setSendingCode(true);
    setFieldErrors(prev => ({ ...prev, global: '' }));

    try {
      const res = await fetch('/api/auth/email/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, type }),
      });

      if (!res.ok) throw new Error(`请求失败：${res.status}`);

      const data = await res.json();

      if (data.code === 200 || data.success) {
        startCountdown(60);
        setFieldErrors(prev => ({ ...prev, global: '' }));
        
        // 开发环境自动填充验证码
        if (process.env.NODE_ENV !== 'production' && data.data?.code) {
          return true;
        }
        
        return true;
      } else {
        setFieldErrors(prev => ({ ...prev, global: data.msg || '发送验证码失败' }));
        return false;
      }
    } catch (err) {
      console.error('发送验证码错误：', err);
      setFieldErrors(prev => ({
        ...prev,
        global: '网络异常，验证码发送失败，请稍后重试',
      }));
      return false;
    } finally {
      setSendingCode(false);
    }
  }, [startCountdown]);

  // 字段验证
  const validateField = useCallback(<T extends keyof FieldErrors>(field: T, value: string) => {
    switch (field) {
      case 'email':
        if (value) {
          const emailCheck = validateEmail(value);
          setFieldErrors(prev => ({ ...prev, email: emailCheck.valid ? '' : emailCheck.message }));
          setValidationStatus(prev => ({ ...prev, emailValid: emailCheck.valid }));
        } else {
          setFieldErrors(prev => ({ ...prev, email: '' }));
          setValidationStatus(prev => ({ ...prev, emailValid: false }));
        }
        break;

      case 'password':
        if (value) {
          const pwdCheck = validatePassword(value);
          setFieldErrors(prev => ({ ...prev, password: pwdCheck.valid ? '' : pwdCheck.message }));
          setValidationStatus(prev => ({ ...prev, passwordValid: pwdCheck.valid }));

          // 密码强度判断
          let strength: 'weak' | 'medium' | 'strong' = 'weak';
          if (value.length >= 8 && /[a-zA-Z]/.test(value) && /\d/.test(value)) {
            strength = 'medium';
          }
          if (value.length >= 12 && /[!@#$%^&*]/.test(value)) {
            strength = 'strong';
          }
          setValidationStatus(prev => ({ ...prev, passwordStrength: pwdCheck.valid ? strength : '' }));
        } else {
          setFieldErrors(prev => ({ ...prev, password: '' }));
          setValidationStatus(prev => ({ ...prev, passwordValid: false, passwordStrength: '' }));
        }
        break;

      case 'confirmPassword':
        // confirmPassword的验证在提交时进行
        setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
        break;

      case 'nickname':
        if (value) {
          const nickCheck = validateNickname(value);
          setFieldErrors(prev => ({ ...prev, nickname: nickCheck.valid ? '' : nickCheck.message }));
          setValidationStatus(prev => ({ ...prev, nicknameValid: nickCheck.valid }));
        } else {
          setFieldErrors(prev => ({ ...prev, nickname: '' }));
          setValidationStatus(prev => ({ ...prev, nicknameValid: false }));
        }
        break;

      case 'code':
        if (value) {
          const error = value.length !== 6 || isNaN(Number(value))
            ? '请输入6位数字验证码'
            : '';
          setFieldErrors(prev => ({ ...prev, code: error }));
        } else {
          setFieldErrors(prev => ({ ...prev, code: '' }));
        }
        break;

      default:
        break;
    }
  }, []);

  // 清除字段错误
  const clearError = useCallback((field: keyof FieldErrors) => {
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  // 设置全局错误
  const setGlobalError = useCallback((message: string) => {
    setFieldErrors(prev => ({ ...prev, global: message }));
  }, []);

  // 清除全局错误
  const clearGlobalError = useCallback(() => {
    setFieldErrors(prev => ({ ...prev, global: '' }));
  }, []);

  return {
    // 状态
    countdown,
    sendingCode,
    loading,
    fieldErrors,
    validationStatus,
    
    // 方法
    startCountdown,
    sendVerificationCode,
    validateField,
    clearError,
    setGlobalError,
    clearGlobalError,
    setLoading,
  };
};