'use client';
import React from 'react';
import type { TimeCapsuleConfig } from './config';

type Props = {
  config: TimeCapsuleConfig;
  onConfigChange: (cfg: TimeCapsuleConfig) => void;
  onReset?: () => void;
};

export default function TimeCapsuleConfigUI({ config, onConfigChange, onReset }: Props) {
  const update = (patch: Partial<TimeCapsuleConfig>) => onConfigChange({ ...config, ...patch });

  return (
    <div className="absolute left-0 top-0 h-full w-80 bg-white/90 backdrop-blur-xl shadow-2xl z-40 p-6 space-y-6">
      <div>
        <label className="block text-xs text-gray-500 mb-1">收信人</label>
        <input
          type="text"
          value={config.recipient}
          onChange={(e) => update({ recipient: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          placeholder="例如：亲爱的"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">胶囊内容</label>
        <textarea
          value={config.message}
          onChange={(e) => update({ message: e.target.value })}
          className="w-full h-32 px-3 py-2 border rounded resize-none"
          placeholder="写下你想说的话…"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">主题色调</label>
        <select
          value={config.themeColor}
          onChange={(e) => update({ themeColor: e.target.value as TimeCapsuleConfig['themeColor'] })}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="indigo">靛蓝</option>
          <option value="rose">玫瑰</option>
          <option value="amber">琥珀</option>
          <option value="emerald">祖母绿</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">背景风格</label>
        <select
          value={config.bgStyle}
          onChange={(e) => update({ bgStyle: e.target.value as TimeCapsuleConfig['bgStyle'] })}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="gradient-space">星空空间</option>
          <option value="gradient-sunset">落日余晖</option>
          <option value="gradient-ocean">深海蓝</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">开启时间</label>
        <input
          type="datetime-local"
          value={config.openDate}
          onChange={(e) => update({ openDate: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">背景音乐（可选）</label>
        <input
          type="url"
          value={config.musicUrl || ''}
          onChange={(e) => update({ musicUrl: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          placeholder="https://…"
        />
      </div>

      <div className="flex gap-2">
        <button onClick={() => onReset?.()} className="flex-1 px-3 py-2 rounded bg-gray-100 hover:bg-gray-200">
          重置
        </button>
        <button
          onClick={() => update({ openDate: new Date(Date.now() + 10_000).toISOString().slice(0, 16) })}
          className="flex-1 px-3 py-2 rounded bg-orange-500 text-white hover:bg-orange-600"
        >
          10秒后解锁
        </button>
      </div>
    </div>
  );
}
