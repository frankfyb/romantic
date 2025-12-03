import { createClient as createSupabase } from '@supabase/supabase-js';
// 可选：如果有 Supabase 生成的类型可在此引入

// 创建Supabase客户端（统一版，使用匿名键）
export const createSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabase(url, key);
};

// 服务端组件用客户端（如需）
export const createSupabaseServerClient = async (_cookies: any) => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabase(url, key);
};
