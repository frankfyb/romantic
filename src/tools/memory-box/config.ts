// src/tools/memory-box/config.ts
export interface MemoryBoxCard {
  id: number;
  type: 'image' | 'text';
  content: string;
  isFlipped: boolean;
}

export type MemoryBoxThemeColor = 'pink' | 'red' | 'purple';

export interface MemoryBoxConfig {
  name1: string;
  name2: string;
  date: string;
  finalImage: string;
  finalMessage: string;
  themeColor: MemoryBoxThemeColor;
  cards?: MemoryBoxCard[];
}

// 默认九宫格卡片配置
export const DEFAULT_CARDS: MemoryBoxCard[] = Array(9).fill(null).map((_, i) => ({
  id: i,
  type: i % 2 === 0 ? 'image' : 'text',
  content: i % 2 === 0 
    ? `https://picsum.photos/seed/${i + 100}/400/400` 
    : "这里是我们第一次见面的地方...",
  isFlipped: false,
}));

// 默认工具配置
export const defaultConfig: MemoryBoxConfig = {
  name1: "小明",
  name2: "小红",
  date: "2023-05-20",
  finalImage: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2000&auto=format&fit=crop",
  finalMessage: "周年快乐，永远爱你！",
  themeColor: "pink",
};

// 主题样式映射
export const themeStyleMap = {
  pink: {
    bg: "bg-pink-50 text-pink-900 border-pink-200",
    btn: "bg-pink-500 hover:bg-pink-600",
    color: "#ec4899",
    textColor: "text-pink-800",
    iconColor: "text-pink-500",
    focus: "focus:ring-pink-300",
    gradient: "bg-gradient-to-br from-pink-400 to-pink-600"
  },
  red: {
    bg: "bg-red-50 text-red-900 border-red-200",
    btn: "bg-red-500 hover:bg-red-600",
    color: "#ef4444",
    textColor: "text-red-800",
    iconColor: "text-red-500",
    focus: "focus:ring-red-300",
    gradient: "bg-gradient-to-br from-red-400 to-red-600"
  },
  purple: {
    bg: "bg-purple-50 text-purple-900 border-purple-200",
    btn: "bg-purple-500 hover:bg-purple-600",
    color: "#a855f7",
    textColor: "text-purple-800",
    iconColor: "text-purple-500",
    focus: "focus:ring-purple-300",
    gradient: "bg-gradient-to-br from-purple-400 to-purple-600"
  }
};
