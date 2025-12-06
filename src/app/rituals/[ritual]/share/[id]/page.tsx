"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ToolKey } from '@/types/tool';
import { getToolUI } from '@/config/toolsRegistry';

export default function ToolSharePage() {
  const { ritual, id } = useParams<{ ritual: ToolKey; id: string }>();
  const [configRecord, setConfigRecord] = useState<any | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!id || !ritual) return;
      try {
        const res = await fetch(`/api/tools/share/${id}`);
        if (res.ok) {
          const json = await res.json();
          const rec = json?.data;
          if (!rec || rec.toolKey !== ritual) {
            setFailed(true);
            return;
          }
          setConfigRecord(rec);
          return;
        }
        try {
          const raw = typeof window !== 'undefined' ? window.localStorage.getItem(`tool_config:${id}`) : null;
          if (!raw) throw new Error('no local');
          const parsed = JSON.parse(raw);
          const lk = parsed.toolKey || parsed.tool_key;
          if (!lk || lk !== ritual) throw new Error('mismatch');
          setConfigRecord({ toolKey: lk, config: parsed.config, shareId: id });
        } catch {
          setFailed(true);
        }
      } catch (e) {
        console.error('Failed to load shared config:', e);
        setFailed(true);
      }
    };
    run();
  }, [id, ritual]);

  if (failed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">链接已失效</h1>
          <p className="text-gray-600">分享链接不存在或已过期</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  if (!configRecord) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500">加载中...</div>
      </div>
    );
  }

  const DisplayUI = getToolUI(ritual as ToolKey);
  return (
    <DisplayUI 
      config={configRecord.config}
      isPreview={true}
    />
  );
}