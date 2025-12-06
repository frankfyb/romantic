// src/tools/starry-sky/config.ts
export interface StarrySkyTheme {
  name: string;
  bg: string;
  star: string;
  meteor: string;
}

export interface StarrySkyConfig {
  title: string;
  partnerName: string;
  confessionText: string;
  starDensity: number;
  themeIndex: number;
  showTextOnDrag: boolean;
  // 扩展配置（可选）
  musicUrl?: string;
  musicVolume?: number;
}

// 内置主题配置
export const THEMES: StarrySkyTheme[] = [
  { name: '深邃夜空', bg: '#0f172a', star: '#e2e8f0', meteor: '#38bdf8' },
  { name: '浪漫紫罗兰', bg: '#2e1065', star: '#f5d0fe', meteor: '#d8b4fe' },
  { name: '暗夜森林', bg: '#022c22', star: '#d9f99d', meteor: '#bef264' },
  { name: '极光粉', bg: '#4a044e', star: '#fbcfe8', meteor: '#f472b6' },
];

// 默认配置
export const defaultConfig: StarrySkyConfig = {
  title: '星河情书',
  partnerName: '亲爱的',
  confessionText: '我看过万千星河，最亮的还是你的眼眸',
  starDensity: 150,
  themeIndex: 0,
  showTextOnDrag: true,
  musicUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_5b39912626.mp3?filename=hopeful-piano-112621.mp3',
  musicVolume: 0.4,
};