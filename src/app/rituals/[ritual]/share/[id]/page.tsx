import { notFound } from 'next/navigation';
import { ToolConfigService } from '@/lib/supabase';
import WarmTextCardDisplayUI from '@/tools/warm-text-card/DisplayUI';

// 服务端组件：先查询配置，再渲染
export default async function ToolSharePage({
  params
}: {
  params: Promise<{ ritual: string; id: string }>;
}) {
  try {
    const { ritual, id } = await params;
    const { config, tool_name } = await ToolConfigService.getById(id);
    
    // 2. 验证工具名称匹配（防止跨工具访问）
    if (tool_name !== ritual) notFound();
    
    // 3. 渲染预览界面（无配置面板）
    return <WarmTextCardDisplayUI config={config} isPreview={true} />;
  } catch (err) {
    // 配置不存在/查询失败，返回 404
    notFound();
  }
}
