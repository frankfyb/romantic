// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const memoryStore = new Map<string, { tool_name: string; config: any }>();

export const ToolConfigService = {
  save: async (toolName: string, config: any) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('tool_configs')
        .insert([{ tool_name: toolName, config }])
        .select('id')
        .single();
      if (error) throw new Error(`保存失败：${error.message}`);
      return data.id;
    }
    const id = Math.random().toString(36).slice(2);
    memoryStore.set(id, { tool_name: toolName, config });
    return id;
  },

  getById: async (configId: string) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('tool_configs')
        .select('config, tool_name')
        .eq('id', configId)
        .single();
      if (error) throw new Error(`查询失败：${error.message}`);
      return data;
    }
    const item = memoryStore.get(configId);
    if (!item) throw new Error('配置不存在');
    return item;
  },

  deleteExpired: async (days = 30) => {
    if (!supabase) return;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const { error } = await supabase
      .from('tool_configs')
      .delete()
      .lt('created_at', cutoff.toISOString());
    if (error) throw new Error(`清理失败：${error.message}`);
  }
};
