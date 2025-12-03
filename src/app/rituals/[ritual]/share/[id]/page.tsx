"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ToolService } from '@/services/supabase/toolService';
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
        const rec = await ToolService.getConfigByShareId(String(id));
        if (!rec || rec.tool_key !== ritual) {
          setFailed(true);
          return;
        }
        setConfigRecord(rec);
      } catch {
        setFailed(true);
      }
    };
    run();
  }, [id, ritual]);

  if (failed) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        分享链接无效或已过期
      </div>
    );
  }

  if (!configRecord) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        加载分享配置中...
      </div>
    );
  }

  const DisplayUI = getToolUI(ritual as ToolKey);
  return (
    <div className="min-h-screen">
      <DisplayUI config={configRecord.config} isPreview={true} />
    </div>
  );
}
