/** 统一API响应格式（泛型） */
export interface ApiResponse<T = null> {
  code: number; // 200成功/4xx客户端错误/5xx服务端错误
  msg: string; // 情感化提示文案
  data: T | null; // 业务数据（可选）
}