'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ToolService } from '@/services/supabase/toolService';
import { ToolKey } from '@/types/tool';
import { getToolUI } from '@/config/toolsRegistry';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { createSupabaseClient } from '@/lib/supabase';
import { getToolDefaultConfig, getToolName } from '@/config/toolsRegistry';
export default function ToolEditPage() {
  const { ritual } = useParams<{ ritual: ToolKey }>();
  const router = useRouter();
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
      
      // 获取工具元信息
      const metadata = await ToolService.getToolMetadata(ritual);
      if (!metadata) {
        try {
          setToolName(getToolName(ritual));
          setConfig(getToolDefaultConfig(ritual));
          return;
        } catch {
          router.push('/404');
          return;
        }
      }

      setToolName(metadata.tool_name);
      setConfig(metadata.default_config);
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
      // 1. 获取当前用户ID（登录态，可选）
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setNotification({ type: 'error', message: '请先登录后再生成分享链接' });
        return;
      }
      
      // 2. 保存配置并生成分享ID
      const { shareId } = await ToolService.saveConfig(
        ritual,
        config,
        {
          userId: user.id,
          // 可选：设置24小时过期
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }
      );

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
    </div>
  );
}
