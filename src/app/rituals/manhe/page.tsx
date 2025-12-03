'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Heart, Settings, Image as ImageIcon, Type, RefreshCw, Maximize, X, Gift, Upload } from 'lucide-react';

// --- 默认数据配置 ---
const DEFAULT_CONFIG = {
  name1: "小明",
  name2: "小红",
  date: "2023-05-20",
  finalImage: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2000&auto=format&fit=crop", // 最终的全屏合照
  finalMessage: "周年快乐，永远爱你！",
  themeColor: "pink", // pink, red, purple
};

const DEFAULT_CARDS = Array(9).fill(null).map((_, i) => ({
  id: i,
  type: i % 2 === 0 ? 'image' : 'text',
  content: i % 2 === 0 
    ? `https://picsum.photos/seed/${i + 100}/400/400` 
    : "这里是我们第一次见面的地方...",
  isFlipped: false,
}));

// --- 辅助组件：CSS 动画样式 ---
// 为了单文件运行，将 CSS 直接通过 style 标签注入，实际项目中建议放入 globals.css
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

// --- 主应用组件 ---
export default function MemoryBoxApp() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [cards, setCards] = useState(DEFAULT_CARDS);
  const [showConfig, setShowConfig] = useState(true); // 是否显示配置面板
  const [showCelebration, setShowCelebration] = useState(false); // 全屏庆祝状态
  
  // 检查是否所有卡片都翻开了
  useEffect(() => {
    const allFlipped = cards.every(card => card.isFlipped);
    if (allFlipped && !showCelebration) {
      // 稍微延迟一下，让用户看清最后一张卡片
      setTimeout(() => setShowCelebration(true), 800);
    }
  }, [cards, showCelebration]);

  // 处理卡片翻转
  const handleCardClick = (id) => {
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, isFlipped: !card.isFlipped } : card
    ));
  };

  // 重置所有卡片
  const resetCards = () => {
    setCards(prev => prev.map(card => ({ ...card, isFlipped: false })));
    setShowCelebration(false);
  };

  // 更新配置
  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // 更新卡片内容
  const updateCardContent = (id, field, value) => {
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, [field]: value } : card
    ));
  };

  // 颜色主题映射
  const themeClasses = {
    pink: "bg-pink-50 text-pink-900 border-pink-200",
    red: "bg-red-50 text-red-900 border-red-200",
    purple: "bg-purple-50 text-purple-900 border-purple-200",
  }[config.themeColor] || "bg-pink-50";

  const btnClasses = {
    pink: "bg-pink-500 hover:bg-pink-600",
    red: "bg-red-500 hover:bg-red-600",
    purple: "bg-purple-500 hover:bg-purple-600",
  }[config.themeColor] || "bg-pink-500";

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${themeClasses} transition-colors duration-300 font-sans overflow-hidden relative`}>
      <StyleInjector />
      
      {/* 左侧/顶部：主显示区 (预览区) */}
      <main className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center relative z-10 h-screen overflow-y-auto">
        
        {/* 顶部标题栏 */}
        <div className="text-center mb-8 animate-pulse-slow">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className={`w-6 h-6 fill-current ${config.themeColor === 'purple' ? 'text-purple-500' : 'text-pink-500'}`} />
            <span className="text-sm font-medium tracking-widest uppercase opacity-70">{config.date}</span>
            <Heart className={`w-6 h-6 fill-current ${config.themeColor === 'purple' ? 'text-purple-500' : 'text-pink-500'}`} />
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
                  ${config.themeColor === 'purple' ? 'bg-gradient-to-br from-purple-400 to-purple-600' : 'bg-gradient-to-br from-pink-400 to-pink-600'} 
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
                    <div className={`p-2 text-center text-sm md:text-base font-medium leading-relaxed overflow-y-auto max-h-full flex items-center justify-center h-full w-full
                      ${config.themeColor === 'purple' ? 'text-purple-800' : 'text-pink-800'}`}>
                      {card.content}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* 移动端配置按钮 */}
        <button 
          onClick={() => setShowConfig(!showConfig)}
          className={`md:hidden fixed bottom-6 right-6 p-4 rounded-full shadow-2xl text-white z-50 ${btnClasses}`}
        >
          {showConfig ? <X size={24} /> : <Settings size={24} />}
        </button>
      </main>

      {/* 右侧：配置面板 (Sidebar) */}
      <aside className={`
        fixed inset-y-0 right-0 z-40 w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col
        ${showConfig ? 'translate-x-0' : 'translate-x-full'}
        md:relative md:transform-none md:border-l border-gray-100
      `}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5" /> 配置面板
          </h2>
          <button onClick={() => setShowConfig(false)} className="md:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* 1. 功能操作区 */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">快捷操作</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setShowCelebration(true)}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg text-white font-medium shadow-md transition-transform active:scale-95 ${btnClasses}`}
              >
                <Maximize size={18} /> 全屏效果
              </button>
              <button 
                onClick={resetCards}
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
                  className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">主角 B</label>
                <input 
                  type="text" 
                  value={config.name2}
                  onChange={(e) => updateConfig('name2', e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
            </div>
            <div>
               <label className="block text-xs text-gray-500 mb-1">纪念日期</label>
               <input 
                  type="text" 
                  value={config.date}
                  onChange={(e) => updateConfig('date', e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
            </div>
            <div>
               <label className="block text-xs text-gray-500 mb-1">主题色</label>
               <div className="flex gap-2">
                 {['pink', 'red', 'purple'].map(color => (
                   <button
                    key={color}
                    onClick={() => updateConfig('themeColor', color)}
                    className={`w-8 h-8 rounded-full border-2 ${config.themeColor === color ? 'border-gray-800 scale-110' : 'border-transparent'} shadow-sm transition-all`}
                    style={{ backgroundColor: color === 'pink' ? '#ec4899' : color === 'red' ? '#ef4444' : '#a855f7' }}
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
      </aside>

      {/* --- 全屏庆祝覆盖层 --- */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-in fade-in duration-700">
          
          {/* 关闭按钮 */}
          <button 
            onClick={() => setShowCelebration(false)}
            className="absolute top-6 right-6 text-white/50 hover:text-white z-50 p-2"
          >
            <X size={32} />
          </button>

          {/* 漂浮的爱心特效 (CSS Animation) */}
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
              className={`px-8 py-3 rounded-full text-white font-bold shadow-lg transform hover:scale-105 transition-all flex items-center gap-2 ${btnClasses}`}
            >
              <Heart className="fill-current" /> 再次感动
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
