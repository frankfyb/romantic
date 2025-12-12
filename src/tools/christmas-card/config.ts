// config.ts - 圣诞贺卡配置相关常量、类型定义
export interface AppConfig {
  particleCount: number;
  particleSize: number;
  particleColor: string;
  glassBlur: number;
  glassOpacity: number;
  capsuleText: string;
  treeTextLevels: string;
  treeBottomLetters: string;
  particleSpeed: number;
}

export interface ConfigMeta {
  key: keyof AppConfig;
  label: string;
  type: 'slider' | 'color' | 'text' | 'textarea';
  min?: number;
  max?: number;
  step?: number;
  description: string;
}

export interface Gift {
  id: number;
  x: number;
  y: number;
  emoji: string;
  rotation: number;
}

// 默认配置常量
export const DEFAULT_CONFIG: AppConfig = {
  particleCount: 120,
  particleSize: 3,
  particleColor: '#FFD700',
  glassBlur: 12,
  glassOpacity: 0.85,
  capsuleText: '',
  treeTextLevels: '圣→诞→圣诞→快乐→圣诞快乐→圣诞快乐→圣诞快乐快乐→圣诞快乐快乐→圣诞快乐圣诞快乐→圣诞快乐圣诞快乐',
  treeBottomLetters: 'L/H/J/C/Y/E',
  particleSpeed: 0.6,
};

// 配置项元数据
export const CONFIG_METADATA: ConfigMeta[] = [
  { key: 'particleCount', label: '氛围粒子密度', type: 'slider', min: 20, max: 300, step: 10, description: '调整背景雪花与星星的数量' },
  { key: 'particleSize', label: '粒子尺寸', type: 'slider', min: 1, max: 6, step: 0.5, description: '背景粒子的大小' },
  { key: 'particleColor', label: '主题点缀色', type: 'color', description: '星星和高光的主色调' },
  { key: 'glassBlur', label: '磨砂质感', type: 'slider', min: 0, max: 24, step: 1, description: '卡片背景模糊程度 (px)' },
  { key: 'glassOpacity', label: '卡片浓度', type: 'slider', min: 0.1, max: 1.0, step: 0.05, description: '卡片背景的不透明度' },
  { key: 'particleSpeed', label: '飘落速度', type: 'slider', min: 0.1, max: 3, step: 0.1, description: '雪花下落的快慢' },
  { key: 'capsuleText', label: '一键祝福', type: 'text', description: '替换所有的“圣诞快乐”文本' },
  { key: 'treeTextLevels', label: '树体文案', type: 'textarea', description: '用“→”分隔，建议成对配置' },
  { key: 'treeBottomLetters', label: '树干拼图', type: 'text', description: '用“/”分隔字母' },
];

// 礼物表情常量
export const GIFT_EMOJIS = ['🎁', '🍬', '🧸', '🎄', '🍪', '🔔', '🎅', '🦌'];