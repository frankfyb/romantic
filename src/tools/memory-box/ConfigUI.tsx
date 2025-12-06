// src/tools/memory-box/ConfigUI.tsx
'use client';
import React from 'react';
import { Settings, Image as ImageIcon, Type, RefreshCw, Maximize, X, Upload } from 'lucide-react';
import type { MemoryBoxConfig, MemoryBoxCard } from './config';
import { DEFAULT_CARDS, themeStyleMap } from './config';

interface Props {
  config: MemoryBoxConfig;
  cards: MemoryBoxCard[];
  onConfigChange: (cfg: Partial<MemoryBoxConfig>) => void;
  onCardUpdate: (id: number, field: keyof MemoryBoxCard, value: any) => void;
  onResetCards: () => void;
  onTriggerCelebration: () => void;
}

export default function MemoryBoxConfigUI({
  config,
  cards,
  onConfigChange,
  onCardUpdate,
  onResetCards,
  onTriggerCelebration
}: Props) {
  const themeStyles = themeStyleMap[config.themeColor];

  // 更新配置项
  const updateConfig = (key: keyof MemoryBoxConfig, value: any) => {
    onConfigChange({ [key]: value });
  };

  // 更新卡片内容
  const updateCardContent = (id: number, field: keyof MemoryBoxCard, value: any) => {
    onCardUpdate(id, field, value);
  };

  return (
    <div className={`
      fixed inset-y-0 right-0 z-40 w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col
      translate-x-0 md:relative md:transform-none md:border-l border-gray-100
    `}>
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Settings className="w-5 h-5" /> 回忆盲盒配置
        </h2>
        <button onClick={() => {}} className="md:hidden text-gray-500">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* 1. 功能操作区 */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">快捷操作</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={onTriggerCelebration}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg text-white font-medium shadow-md transition-transform active:scale-95 ${themeStyles.btn}`}
            >
              <Maximize size={18} /> 全屏效果
            </button>
            <button 
              onClick={onResetCards}
              className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
            >
              <RefreshCw size={18} /> 重置盲盒
            </button>
          </div>
        </div>

        {/* 2. 基础信息设置 */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">基础信息</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">主角 A</label>
              <input 
                type="text" 
                value={config.name1}
                onChange={(e) => updateConfig('name1', e.target.value)}
                className={`w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 ${themeStyles.focus}`}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">主角 B</label>
              <input 
                type="text" 
                value={config.name2}
                onChange={(e) => updateConfig('name2', e.target.value)}
                className={`w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 ${themeStyles.focus}`}
              />
            </div>
          </div>
          <div>
             <label className="block text-xs text-gray-500 mb-1">纪念日期</label>
             <input 
                type="text" 
                value={config.date}
                onChange={(e) => updateConfig('date', e.target.value)}
                className={`w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 ${themeStyles.focus}`}
              />
          </div>
          <div>
             <label className="block text-xs text-gray-500 mb-1">主题色</label>
             <div className="flex gap-2">
               {(['pink', 'red', 'purple'] as const).map(color => (
                 <button
                  key={color}
                  onClick={() => updateConfig('themeColor', color)}
                  className={`w-8 h-8 rounded-full border-2 ${config.themeColor === color ? 'border-gray-800 scale-110' : 'border-transparent'} shadow-sm transition-all`}
                  style={{ backgroundColor: themeStyleMap[color].color }}
                 />
               ))}
             </div>
          </div>
        </div>

        {/* 3. 卡片内容编辑 */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center">
            <span>九宫格内容</span>
            <span className="text-xs font-normal text-gray-400">点击下方编号编辑</span>
          </h3>
          
          <div className="space-y-3">
            {cards.map((card, index) => (
              <div key={card.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-600">卡片 #{index + 1}</span>
                  <div className="flex bg-white rounded-md border border-gray-200 p-0.5">
                    <button 
                      onClick={() => updateCardContent(card.id, 'type', 'image')}
                      className={`p-1.5 rounded ${card.type === 'image' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                    >
                      <ImageIcon size={14} />
                    </button>
                    <button 
                       onClick={() => updateCardContent(card.id, 'type', 'text')}
                       className={`p-1.5 rounded ${card.type === 'text' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                    >
                      <Type size={14} />
                    </button>
                  </div>
                </div>
                
                {card.type === 'image' ? (
                  <div className="flex gap-2">
                     <input 
                      type="text" 
                      placeholder="输入图片URL"
                      value={card.content}
                      onChange={(e) => updateCardContent(card.id, 'content', e.target.value)}
                      className="flex-1 p-2 text-sm border border-gray-200 rounded-md"
                    />
                    <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                       <img src={card.content} alt="preview" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = 'https://placehold.co/100?text=?'}/>
                    </div>
                  </div>
                ) : (
                  <textarea 
                    rows={2}
                    value={card.content}
                    onChange={(e) => updateCardContent(card.id, 'content', e.target.value)}
                    placeholder="输入回忆文字..."
                    className="w-full p-2 text-sm border border-gray-200 rounded-md"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 4. 最终全屏图设置 */}
         <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">惊喜全屏设置</h3>
          <div>
              <label className="block text-xs text-gray-500 mb-1">全屏背景图 URL</label>
              <div className="flex gap-2">
                 <input 
                  type="text" 
                  value={config.finalImage}
                  onChange={(e) => updateConfig('finalImage', e.target.value)}
                  className="flex-1 p-2 text-sm border border-gray-200 rounded-md"
                />
                <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    <img src={config.finalImage} alt="final" className="w-full h-full object-cover" />
                </div>
              </div>
          </div>
          <div>
              <label className="block text-xs text-gray-500 mb-1">祝福语</label>
              <input 
                type="text" 
                value={config.finalMessage}
                onChange={(e) => updateConfig('finalMessage', e.target.value)}
                className="w-full p-2 text-sm border border-gray-200 rounded-md"
              />
          </div>
        </div>
      </div>
    </div>
  );
}