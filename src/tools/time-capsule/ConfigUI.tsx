'use client';
import React, { useState } from 'react';
import type { TimeCapsuleConfig } from './config';

type Props = {
  config: TimeCapsuleConfig;
  onConfigChange: (cfg: TimeCapsuleConfig) => void;
  onReset?: () => void;
};

export default function TimeCapsuleConfigUI({ config, onConfigChange, onReset }: Props) {
  const [isOpenDatePicker, setIsOpenDatePicker] = useState(false);
  const update = (patch: Partial<TimeCapsuleConfig>) => onConfigChange({ ...config, ...patch });

  // 计算距离开启时间的时间差
  const getTimeDifference = () => {
    const now = new Date();
    const openDate = new Date(config.openDate);
    const diffMs = openDate.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return '已到期';
    }
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}天${hours}小时后`;
    } else if (hours > 0) {
      return `${hours}小时${minutes}分钟后`;
    } else {
      return `${minutes}分钟后`;
    }
  };

  return (
    <div className="absolute left-0 top-0 h-full w-80 bg-white/90 backdrop-blur-xl shadow-2xl z-40 p-6 space-y-6 overflow-y-auto">
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800">时光胶囊配置</h2>
        <p className="text-sm text-gray-500 mt-1">设置你的专属时光胶囊</p>
      </div>
      
      <div>
        <label className="block text-xs text-gray-500 mb-1">收信人</label>
        <input
          type="text"
          value={config.recipient}
          onChange={(e) => update({ recipient: e.target.value })}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="例如：亲爱的"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">胶囊内容</label>
        <textarea
          value={config.message}
          onChange={(e) => update({ message: e.target.value })}
          className="w-full h-32 px-3 py-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="写下你想说的话…"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">主题色调</label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: 'indigo', label: '靛蓝', color: 'bg-indigo-500' },
            { value: 'rose', label: '玫瑰', color: 'bg-rose-500' },
            { value: 'amber', label: '琥珀', color: 'bg-amber-500' },
            { value: 'emerald', label: '翠绿', color: 'bg-emerald-500' },
          ].map((theme) => (
            <button
              key={theme.value}
              onClick={() => update({ themeColor: theme.value as TimeCapsuleConfig['themeColor'] })}
              className={`p-2 rounded text-xs ${config.themeColor === theme.value ? 'ring-2 ring-offset-2 ' + theme.color.replace('bg-', 'ring-').replace('500', '400') : ''}`}
              title={theme.label}
            >
              <div className={`w-6 h-6 rounded-full mx-auto ${theme.color}`}></div>
              <span className="mt-1 block truncate">{theme.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">背景风格</label>
        <div className="space-y-2">
          {[
            { value: 'gradient-space', label: '星空空间' },
            { value: 'gradient-sunset', label: '落日余晖' },
            { value: 'gradient-ocean', label: '深海蓝' },
          ].map((bg) => (
            <button
              key={bg.value}
              onClick={() => update({ bgStyle: bg.value as TimeCapsuleConfig['bgStyle'] })}
              className={`w-full text-left px-3 py-2 rounded border ${config.bgStyle === bg.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}
            >
              {bg.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">
          开启时间 <span className="text-gray-400">({getTimeDifference()})</span>
        </label>
        <div className="flex gap-2">
          <input
            type="datetime-local"
            value={config.openDate}
            onChange={(e) => update({ openDate: e.target.value })}
            className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            onClick={() => setIsOpenDatePicker(!isOpenDatePicker)}
            className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            快捷
          </button>
        </div>
        
        {isOpenDatePicker && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button
              onClick={() => update({ openDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16) })}
              className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
            >
              1天后
            </button>
            <button
              onClick={() => update({ openDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) })}
              className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
            >
              1周后
            </button>
            <button
              onClick={() => update({ openDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) })}
              className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
            >
              1月后
            </button>
            <button
              onClick={() => update({ openDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) })}
              className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
            >
              1年后
            </button>
            <button
              onClick={() => update({ openDate: new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 16) })}
              className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
            >
              10分钟后
            </button>
            <button
              onClick={() => update({ openDate: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16) })}
              className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
            >
              1小时后
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">背景音乐（可选）</label>
        <input
          type="url"
          value={config.musicUrl || ''}
          onChange={(e) => update({ musicUrl: e.target.value })}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="https://…"
        />
        <p className="text-xs text-gray-400 mt-1">支持MP3、WAV等格式</p>
      </div>

      <div className="flex gap-2 pt-4">
        <button 
          onClick={() => onReset?.()} 
          className="flex-1 px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          重置
        </button>
        <button
          onClick={() => update({ openDate: new Date(Date.now() + 10_000).toISOString().slice(0, 16) })}
          className="flex-1 px-3 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 transition-colors"
        >
          10秒后解锁
        </button>
      </div>
    </div>
  );
}