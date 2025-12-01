'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ToolConfigService } from '@/lib/supabase';
import WarmTextCardDisplayUI from '@/tools/warm-text-card/DisplayUI';
import { defaultConfig } from '@/tools/warm-text-card/config';

export default function ToolEditPage() {
  const { ritual } = useParams();
  const [config, setConfig] = useState(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);

  // 生成分享链接（核心：调用 Supabase 保存配置）
  const generateShareLink = async () => {
    if (ritual !== 'warm-text-card' || isSaving) return;
    
    setIsSaving(true);
    try {
      // 1. 保存配置到 Supabase，获取配置 ID
      const configId = await ToolConfigService.save(ritual as string, config);
      // 2. 生成分享链接
      const shareLink = `${window.location.origin}/rituals/${ritual}/share/${configId}`;
      // 3. 复制到剪贴板
      await navigator.clipboard.writeText(shareLink);
      alert(`分享链接已复制：\n${shareLink}`);
    } catch (err) {
      alert((err as Error).message || '保存配置失败');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* 分享按钮 */}
      <button
        onClick={generateShareLink}
        disabled={isSaving}
        className="absolute top-4 left-4 z-50 px-4 py-2 bg-orange-500 text-white rounded-lg"
      >
        {isSaving ? '生成中...' : '生成分享链接'}
      </button>
      
      {/* 工具界面 */}
      <WarmTextCardDisplayUI
        config={config}
        isPreview={false}
        onConfigChange={setConfig}
      />
    </div>
  );
}
