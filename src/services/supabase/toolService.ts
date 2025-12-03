import { createSupabaseClient } from '@/lib/supabase';
import { ToolKey, ToolMetadata, ToolConfigRecord } from '@/types/tool';

// 生成10位短ID（分享链接专用）
const generateShareId = () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  let id = '';
  for (let i = 0; i < 10; i++) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
};

export class ToolService {
  /**
   * 获取工具元信息
   * @param toolKey 工具标识
   * @returns 工具元信息
   */
  static async getToolMetadata(toolKey: ToolKey): Promise<ToolMetadata | null> {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('tool_metadata')
      .select('*')
      .eq('tool_key', toolKey)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;
    return data as ToolMetadata;
  }

  /**
   * 保存工具配置并生成分享ID
   * @param toolKey 工具标识
   * @param config 用户配置
   * @param options 可选参数（用户ID/指纹/过期时间）
   * @returns 分享ID + 配置ID
   */
  static async saveConfig(
    toolKey: ToolKey,
    config: Record<string, any>,
    options?: {
      userId?: string;
      fingerprint?: string;
      expiresAt?: string; // ISO格式时间，如 new Date().toISOString()
    }
  ): Promise<{ shareId: string; configId: string }> {
    const supabase = createSupabaseClient();
    const shareId = generateShareId();
    try {
      if (!options?.userId) {
        throw new Error('请登录后再保存配置');
      }
      const { data, error } = await supabase
        .from('tool_configs')
        .insert({
          tool_key: toolKey,
          config,
          share_id: shareId,
          user_id: options?.userId,
          fingerprint: options?.fingerprint,
          expires_at: options?.expiresAt,
        })
        .select('id, share_id')
        .single();

      if (error) throw error;

      return {
        shareId: data.share_id,
        configId: data.id,
      };
    } catch {
      const record = {
        tool_key: toolKey,
        config,
        share_id: shareId,
        user_id: options?.userId,
        fingerprint: options?.fingerprint,
        expires_at: options?.expiresAt,
        is_deleted: false,
      } as any;
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(`tool_config:${shareId}`, JSON.stringify(record));
        } catch {}
      }
      return {
        shareId,
        configId: 'local',
      };
    }
  }

  /**
   * 根据分享ID查询配置
   * @param shareId 分享短ID
   * @returns 配置记录
   */
  static async getConfigByShareId(shareId: string): Promise<ToolConfigRecord | null> {
    const supabase = createSupabaseClient();
    try {
      const { data, error } = await supabase
        .from('tool_configs')
        .select('*')
        .eq('share_id', shareId)
        .eq('is_deleted', false)
        .or('expires_at.is.null,expires_at.gt.now()')
        .single();

      if (error || !data) throw error || new Error('not found');
      return data as ToolConfigRecord;
    } catch {
      if (typeof window !== 'undefined') {
        try {
          const raw = window.localStorage.getItem(`tool_config:${shareId}`);
          if (!raw) return null;
          const parsed = JSON.parse(raw);
          return parsed as ToolConfigRecord;
        } catch {
          return null;
        }
      }
      return null;
    }
  }
}
