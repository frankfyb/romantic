'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ToolKey } from '@/types/tool';
import { getToolUI, getToolConfigUI } from '@/config/toolsRegistry';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getToolDefaultConfig, getToolName } from '@/config/toolsRegistry';

// 定义工具元信息类型
interface ToolMetadata {
  toolKey: string;
  toolName: string;
  description?: string;
  defaultConfig: Record<string, any>;
  tag?: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ToolEditPage() {
  const { ritual } = useParams<{ ritual: ToolKey }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [config, setConfig] = useState<Record<string, any>>({});
  const [toolName, setToolName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | '';
    message: string;
  }>({ type: '', message: '' });

  // 初始化工具配置
  useEffect(() => {
    const initTool = async () => {
      if (!ritual) return;
      
      try {
        // 尝试从API获取工具元信息
        const res = await fetch(`/api/tools/meta/${ritual}`);
        if (res.ok) {
          const json = await res.json();
          const metadata = json?.data;
          if (metadata) {
            setToolName(metadata.toolName);
            // 确保 customMessages 存在
            const configWithDefaults = {
              ...metadata.defaultConfig,
              customMessages: metadata.defaultConfig.customMessages || []
            };
            setConfig(configWithDefaults);
            return;
          }
        }
      } catch (error) {
        console.warn('Failed to fetch tool metadata from API:', error);
      }
      
      // 如果API获取失败，使用本地配置
      try {
        setToolName(getToolName(ritual));
        const defaultConfig = getToolDefaultConfig(ritual);
        // 确保 customMessages 存在
        const configWithDefaults = {
          ...defaultConfig,
          customMessages: defaultConfig.customMessages || []
        };
        setConfig(configWithDefaults);
      } catch (error) {
        console.error('Failed to get tool config:', error);
        router.push('/404');
      }
    };

    initTool();
  }, [ritual, router]);

  // 自动关闭通知
  useEffect(() => {
    if (notification.type) {
      const timer = setTimeout(() => {
        setNotification({ type: '', message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // 生成分享链接
  const generateShareLink = async () => {
    if (!ritual || isSaving) return;

    setIsSaving(true);
    try {
      // 1. 获取当前登录用户（NextAuth 会话）
      const userId = session?.user?.id;
      if (status !== 'authenticated' || !userId) {
        setNotification({ type: 'error', message: '请先登录后再生成分享链接' });
        return;
      }
      
      // 2. 保存配置并生成分享ID（调用API，确保服务端会话校验）
      const res = await fetch('/api/tools/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolKey: ritual,
          config,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
      if (!res.ok) throw new Error(`保存失败：${res.status}`);
      const json = await res.json();
      const shareId = json?.data?.shareId;

      // 3. 生成分享链接并复制
      const shareLink = `${window.location.origin}/rituals/${ritual}/share/${shareId}`;
      await navigator.clipboard.writeText(shareLink);

      setNotification({
        type: 'success',
        message: `分享链接已复制：${shareLink}`,
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: (err as Error).message || '生成分享链接失败',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 工具未加载完成时的占位
  if (!toolName) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500">加载工具配置中...</div>
      </div>
    );
  }

  // 获取工具UI组件
  const DisplayUI = getToolUI(ritual);
  const ConfigUI = getToolConfigUI(ritual);

  return (
    <div className="relative min-h-screen">
      {/* 通知提示 */}
      {notification.type && (
        <div 
          className={`absolute top-4 right-4 z-50 px-4 py-3 rounded-lg flex items-center gap-2 ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-600 border border-green-200' 
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}
      
      {/* 页面标题 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xl font-medium text-slate-800">
        {toolName} - 配置页
      </div>
      
      {/* 生成分享链接按钮 */}
      <button
        onClick={generateShareLink}
        disabled={isSaving}
        className="absolute top-4 left-4 z-50 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-orange-300 disabled:cursor-not-allowed"
      >
        {isSaving ? '生成中...' : '生成分享链接'}
      </button>
      
      {/* 工具配置UI */}
      <DisplayUI
        config={config}
        isPreview={false}
        onConfigChange={setConfig}
      />
      
      {/* 显示配置面板（如果存在） */}
      {ConfigUI && ConfigUI !== (() => null) && (
        <ConfigUI
          config={config}
          onConfigChange={setConfig}
          onReset={() => {
            const defaultConfig = getToolDefaultConfig(ritual);
            // 确保 customMessages 存在
            const configWithDefaults = {
              ...defaultConfig,
              customMessages: defaultConfig.customMessages || []
            };
            setConfig(configWithDefaults);
          }}
        />
      )}
    </div>
  );
}