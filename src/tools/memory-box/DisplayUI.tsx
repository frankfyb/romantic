// src/tools/memory-box/DisplayUI.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Heart, X, Gift, Settings } from 'lucide-react';
import type { MemoryBoxConfig, MemoryBoxCard } from './config';
import { DEFAULT_CARDS, themeStyleMap } from './config';
import MemoryBoxConfigUI from './ConfigUI';

// 样式注入组件
const StyleInjector = () => (
  <style>{`
    .perspective-1000 { perspective: 1000px; }
    .transform-style-3d { transform-style: preserve-3d; }
    .backface-hidden { backface-visibility: hidden; }
    .rotate-y-180 { transform: rotateY(180deg); }
    
    @keyframes float {
      0% { transform: translateY(0px) scale(0.8); opacity: 0; }
      50% { opacity: 0.8; }
      100% { transform: translateY(-100vh) scale(1.2); opacity: 0; }
    }
    .animate-float { animation: float 4s ease-in infinite; }
    
    @keyframes pulse-slow {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    .animate-pulse-slow { animation: pulse-slow 3s infinite ease-in-out; }
  `}</style>
);

// Props类型定义
interface Props {
  config: MemoryBoxConfig;
  isPreview?: boolean;
  onConfigChange?: (cfg: Record<string, any>) => void;
}

export default function MemoryBoxDisplayUI({
  config,
  isPreview = false,
  onConfigChange
}: Props) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [cards, setCards] = useState<MemoryBoxCard[]>(config.cards && Array.isArray(config.cards) && config.cards.length === 9 ? config.cards : DEFAULT_CARDS);
  const [showConfig, setShowConfig] = useState(!isPreview);
  const themeStyles = themeStyleMap[config.themeColor];

  // 检查是否所有卡片都已翻转
  useEffect(() => {
    const allFlipped = cards.length > 0 && cards.every(card => card.isFlipped);
    // 移除了 isPreview 的限制，允许在预览模式下也触发展示庆祝效果
    if (allFlipped && !showCelebration) {
      const timer = setTimeout(() => setShowCelebration(true), 800);
      return () => clearTimeout(timer);
    }
  }, [cards, showCelebration]);

  // 处理卡片点击翻转
  const handleCardClick = (id: number) => {
    // 移除了 isPreview 的限制，允许在预览模式下点击盲盒
    setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: !c.isFlipped } : c));
  };

  // 重置卡片
  const handleResetCards = () => {
    setShowCelebration(false);
    setCards(DEFAULT_CARDS.map(c => ({ ...c, isFlipped: false })));
  };

  // 手动触发全屏效果（调试用，非预览模式显示）
  const handleTriggerCelebration = () => {
    // 移除了 isPreview 的限制，允许在预览模式下也手动触发庆祝效果
    setShowCelebration(true);
  };

  const handleCardUpdate = (id: number, field: keyof MemoryBoxCard, value: any) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${themeStyles.bg} transition-colors duration-300 font-sans overflow-hidden relative`}>
      <StyleInjector />
      
      {/* 主显示区 */}
      <main className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center relative z-10 h-screen overflow-y-auto">
        {!isPreview && (
          <div className="absolute top-4 right-4 z-50 flex gap-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full text-gray-700 shadow-sm transition-all"
              title="设置"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        )}
        {/* 顶部标题栏 */}
        <div className="text-center mb-8 animate-pulse-slow">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className={`w-6 h-6 fill-current ${themeStyles.iconColor}`} />
            <span className="text-sm font-medium tracking-widest uppercase opacity-70">{config.date}</span>
            <Heart className={`w-6 h-6 fill-current ${themeStyles.iconColor}`} />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-2">
            {config.name1} <span className="text-sm mx-2 align-middle">&</span> {config.name2}
          </h1>
          <p className="text-lg opacity-80">点击下方盲盒，解锁我们的回忆</p>
        </div>

        {/* 九宫格区域 */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 w-full max-w-md aspect-square">
          {cards.map((card) => (
            <div 
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className="relative w-full h-full cursor-pointer perspective-1000 group"
            >
              {/* 翻转容器 */}
              <div className={`w-full h-full relative transition-all duration-700 transform-style-3d ${card.isFlipped ? 'rotate-y-180' : ''}`}>
                {/* 正面 (盲盒封面) */}
                <div className={`absolute w-full h-full backface-hidden rounded-xl shadow-lg flex flex-col items-center justify-center 
                  ${themeStyles.gradient} 
                  text-white overflow-hidden border-2 border-white/50`}
                >
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                  <Gift className="w-8 h-8 md:w-10 md:h-10 mb-2 animate-bounce" />
                  <span className="text-xl md:text-2xl font-bold">#{card.id + 1}</span>
                  <span className="text-xs opacity-75 mt-1">点击翻开</span>
                </div>

                {/* 背面 (内容展示) */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl shadow-xl overflow-hidden bg-white border-4 border-white flex items-center justify-center">
                  {card.type === 'image' ? (
                    <img src={card.content} alt="memory" className="w-full h-full object-cover" />
                  ) : (
                    <div className={`p-2 text-center text-sm md:text-base font-medium leading-relaxed overflow-y-auto max-h-full flex items-center justify-center h-full w-full ${themeStyles.textColor}`}>
                      {card.content}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* 调试按钮（仅非预览模式显示） */}
        {/* 修改了条件判断，允许在预览模式下也显示调试按钮 */}
        <div className="mt-8 flex gap-4">
          <button 
            onClick={handleTriggerCelebration}
            className={`px-4 py-2 rounded-lg text-white font-medium shadow-md ${themeStyles.btn}`}
          >
            预览全屏效果
          </button>
          <button 
            onClick={handleResetCards}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
          >
            重置所有卡片
          </button>
        </div>
      </main>

      {/* 全屏庆祝覆盖层 */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-in fade-in duration-700">
          {/* 关闭按钮 */}
          <button 
            onClick={() => setShowCelebration(false)}
            className="absolute top-6 right-6 text-white/50 hover:text-white z-50 p-2"
          >
            <X size={32} />
          </button>

          {/* 漂浮爱心特效 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             {[...Array(20)].map((_, i) => (
               <div 
                  key={i} 
                  className="absolute text-pink-500 animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '110%',
                    animationDelay: `${Math.random() * 5}s`,
                    fontSize: `${Math.random() * 2 + 1}rem`,
                    opacity: 0.7
                  }}
               >
                 ❤
               </div>
             ))}
          </div>

          {/* 内容容器 */}
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center">
            {/* 照片展示 */}
            <div className="relative w-full max-w-2xl aspect-[4/3] md:aspect-video mb-8 rounded-xl overflow-hidden shadow-2xl border-4 border-white/20 transform hover:scale-[1.02] transition-transform duration-500">
              <img 
                src={config.finalImage} 
                alt="Celebration" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              
              {/* 底部文字 */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 transform translate-y-2 animate-in slide-in-from-bottom duration-1000">
                 <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg" style={{ fontFamily: 'cursive' }}>
                   {config.finalMessage}
                 </h2>
                 <p className="text-white/90 text-lg">{config.name1} & {config.name2}</p>
              </div>
            </div>

            {/* 再次播放按钮 */}
            <button 
              onClick={() => { setShowCelebration(false); setTimeout(() => setShowCelebration(true), 100); }}
              className={`px-8 py-3 rounded-full text-white font-bold shadow-lg transform hover:scale-105 transition-all flex items-center gap-2 ${themeStyles.btn}`}
            >
              <Heart className="fill-current" /> 再次感动
            </button>
          </div>
        </div>
      )}

      {!isPreview && showConfig && (
        <MemoryBoxConfigUI
          config={config}
          cards={cards}
          onConfigChange={(cfg) => onConfigChange?.({ ...config, ...cfg })}
          onCardUpdate={handleCardUpdate}
          onResetCards={handleResetCards}
          onTriggerCelebration={handleTriggerCelebration}
        />
      )}
    </div>
  );
}
