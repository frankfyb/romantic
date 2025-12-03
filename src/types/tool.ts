// 工具唯一标识类型
export type ToolKey = 'warm-text-card' | 'time-capsule' | 'birthday-animation' | string;

// 工具元信息类型
export interface ToolMetadata {
  tool_key: ToolKey;
  tool_name: string;
  description?: string;
  default_config: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 工具配置记录类型
export interface ToolConfigRecord {
  id: string;
  tool_key: ToolKey;
  config: Record<string, any>;
  share_id: string;
  user_id?: string;
  fingerprint?: string;
  is_deleted: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}
