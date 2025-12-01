'use client';
import React, { useState } from 'react';
import { 
  Settings, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Type, 
  Palette, 
  Wind 
} from 'lucide-react';
import { WarmTextCardConfig, THEMES, defaultConfig } from './config';

type Props = {
  config: WarmTextCardConfig;
  onConfigChange: (newConfig: WarmTextCardConfig) => void;
  isPlaying: boolean;
  onPlayToggle: (isPlaying: boolean) => void;
  onReset: () => void;
};

export default function WarmTextCardConfigUI({ 
  config, 
  onConfigChange,
  isPlaying,
  onPlayToggle,
  onReset
}: Props) {
  const [newMessage, setNewMessage] = useState("");

  // 添加自定义文字
  const addCustomMessage = () => {
    if (newMessage.trim()) {
      onConfigChange({
        ...config,
        customMessages: [...config.customMessages, newMessage]
      });
      setNewMessage("");
    }
  };

  // 更新配置
  const updateConfig = (updates: Partial<WarmTextCardConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  return (
    <div 
      className={`absolute left-0 top-0 h-full w-80 bg-white/90 backdrop-blur-xl shadow-2xl z-40 transform transition-transform duration-300 ease-in-out flex flex-col`}
    >
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Wind className="text-orange-500" /> 温馨配置台
        </h2>
        <p className="text-xs text-gray-500 mt-1">定制你的专属治愈空间</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* 1. 控制区 */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Play size={14} /> 播放控制
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={() => onPlayToggle(!isPlaying)}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2
                ${isPlaying 
                  ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
                  : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                }`}
            >
              {isPlaying ? <><Pause size={16}/> 暂停</> : <><Play size={16}/> 生成</>}
            </button>
            <button 
              onClick={onReset}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              title="清空并重新开始"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* 2. 主题区 */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Palette size={14} /> 主题风格
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(THEMES).map(([key, themeData]) => (
              <button
                key={key}
                onClick={() => updateConfig({ theme: key as any })}
                className={`p-2 rounded-lg text-sm transition-all border-2 text-left
                  ${config.theme === key ? 'border-orange-400 bg-orange-50' : 'border-transparent bg-gray-100 hover:bg-gray-200'}
                `}
              >
                <div className="font-medium text-gray-700">{(themeData as any).name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. 参数调节 */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Settings size={14} /> 参数微调
          </h3>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>生成速度</span>
              <span>{config.speed}ms</span>
            </div>
            <input 
              type="range" min="100" max="2000" step="100"
              value={config.speed}
              onChange={(e) => updateConfig({speed: Number(e.target.value)})}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>最大数量</span>
              <span>{config.maxCards}</span>
            </div>
            <input 
              type="range" min="10" max="100" step="5"
              value={config.maxCards}
              onChange={(e) => updateConfig({maxCards: Number(e.target.value)})}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>字体缩放</span>
              <span>{config.fontSizeScale.toFixed(1)}</span>
            </div>
            <input 
              type="range" min="0.5" max="2" step="0.1"
              value={config.fontSizeScale}
              onChange={(e) => updateConfig({fontSizeScale: Number(e.target.value)})}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
        </div>

        {/* 4. 内容管理 */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Type size={14} /> 内容定制
          </h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="输入一句温暖的话..."
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400"
              onKeyPress={(e) => e.key === 'Enter' && addCustomMessage()}
            />
            <button 
              onClick={addCustomMessage}
              className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
             <span className="text-xs text-gray-400">已加载 {config.customMessages.length} 条语录</span>
          </div>
        </div>

      </div>

      {/* 底部信息 */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <p className="text-xs text-center text-gray-400">
          CozyWords Generator © 2024
        </p>
      </div>
    </div>
  );
}