// src/tools/starry-sky/ConfigUI.tsx
'use client';
import React from 'react';
import { Settings, Sparkles, Type, Palette, Star, Heart, Volume2 } from 'lucide-react';
import type { StarrySkyConfig } from './config';
import { THEMES } from './config';

interface Props {
  config: StarrySkyConfig;
  onConfigChange: (cfg: StarrySkyConfig) => void;
  onReset?: () => void;
}

export default function StarrySkyConfigUI({ config, onConfigChange, onReset }: Props) {
  // 局部更新配置
  const updateConfig = (patch: Partial<StarrySkyConfig>) => {
    onConfigChange({ ...config, ...patch });
  };

  return (
    <div className="absolute z-20 top-0 right-0 h-full w-80 bg-black/60 backdrop-blur-xl border-l border-white/10 text-white p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-light flex items-center gap-2">
          <Sparkles size={20} className="text-yellow-300" /> 星空配置
        </h2>
      </div>

      <div className="space-y-6">
        {/* 基础功能开关 */}
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
            <span className="text-sm flex items-center gap-2">
              <Type size={16} /> 拖拽显示文字
            </span>
            <input 
              type="checkbox" 
              checked={config.showTextOnDrag} 
              onChange={(e) => updateConfig({ showTextOnDrag: e.target.checked })} 
              className="toggle-checkbox accent-blue-500"
            />
          </div>

          <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
            <span className="text-sm flex items-center gap-2">
              <Volume2 size={16} /> 背景音乐音量
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.musicVolume || 0.4}
              onChange={(e) => updateConfig({ musicVolume: parseFloat(e.target.value) })}
              className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <hr className="border-white/10" />

        {/* 内容定制 */}
        <div className="space-y-4">
          <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold">定制内容</label>
          
          <div className="space-y-1">
            <span className="text-xs text-gray-400">标题</span>
            <input 
              type="text" 
              value={config.title} 
              onChange={(e) => updateConfig({ title: e.target.value })} 
              className="w-full bg-white/10 border border-white/20 rounded p-2 text-sm focus:outline-none focus:border-blue-400 transition-colors" 
              placeholder="星河情书" 
            />
          </div>
          
          <div className="space-y-1">
            <span className="text-xs text-gray-400">对象名字</span>
            <input 
              type="text" 
              value={config.partnerName} 
              onChange={(e) => updateConfig({ partnerName: e.target.value })} 
              className="w-full bg-white/10 border border-white/20 rounded p-2 text-sm focus:outline-none focus:border-blue-400 transition-colors" 
              placeholder="亲爱的" 
            />
          </div>
          
          <div className="space-y-1">
            <span className="text-xs text-gray-400">告白文字 (拖拽显示)</span>
            <textarea 
              value={config.confessionText} 
              onChange={(e) => updateConfig({ confessionText: e.target.value })} 
              className="w-full bg-white/10 border border-white/20 rounded p-2 text-sm focus:outline-none focus:border-blue-400 transition-colors h-20 resize-none" 
              placeholder="在这里输入你想说的话..." 
            />
          </div>
          
          <div className="space-y-1">
            <span className="text-xs text-gray-400">背景音乐URL</span>
            <input 
              type="url" 
              value={config.musicUrl || ''} 
              onChange={(e) => updateConfig({ musicUrl: e.target.value })} 
              className="w-full bg-white/10 border border-white/20 rounded p-2 text-sm focus:outline-none focus:border-blue-400 transition-colors" 
              placeholder="https://..." 
            />
          </div>
        </div>

        <hr className="border-white/10" />

        {/* 视觉效果 */}
        <div className="space-y-4">
          <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold">视觉效果</label>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-400">
              <span className="flex gap-1 items-center">
                <Star size={12} /> 星星数量
              </span>
              <span>{config.starDensity}</span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="400" 
              value={config.starDensity} 
              onChange={(e) => updateConfig({ starDensity: parseInt(e.target.value) })} 
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500" 
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex gap-1 items-center text-xs text-gray-400 mb-2">
              <Palette size={12} /> 主题色调
            </div>
            <div className="grid grid-cols-4 gap-2">
              {THEMES.map((theme, idx) => (
                <button 
                  key={theme.name} 
                  onClick={() => updateConfig({ themeIndex: idx })} 
                  className={`w-full aspect-square rounded-full border-2 transition-all ${config.themeIndex === idx ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`} 
                  style={{ backgroundColor: theme.bg }} 
                  title={theme.name}
                >
                  <div className="w-2 h-2 rounded-full bg-white mx-auto mt-1 opacity-50" style={{ backgroundColor: theme.meteor }}></div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 mt-8">
          <button
            onClick={() => onReset?.()}
            className="flex-1 px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors"
          >
            重置配置
          </button>
          <button
            onClick={() => updateConfig({ 
              confessionText: '星河滚烫，你是人间理想',
              themeIndex: 1,
              starDensity: 200
            })}
            className="flex-1 px-3 py-2 rounded bg-pink-600 hover:bg-pink-500 text-white text-sm transition-colors"
          >
            浪漫模板
          </button>
        </div>

        {/* 玩法提示 */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded p-4 text-xs text-blue-200 leading-relaxed">
          <p className="flex items-center gap-2 font-bold mb-1">
            <Heart size={12} /> 玩法提示：
          </p>
          <ul className="list-disc list-inside space-y-1 opacity-80">
            <li>移动鼠标点亮微弱的星光</li>
            <li>按住鼠标快速<strong>拖拽</strong>生成文字流星</li>
            <li><strong>点击</strong>空白处连接附近的星星成为星座</li>
          </ul>
        </div>
      </div>
    </div>
  );
}