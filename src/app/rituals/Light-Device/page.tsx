import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Settings, Heart, Zap, Music, Image as ImageIcon, Type, Sparkles, X, Check, Volume2, BatteryCharging, PlayCircle } from 'lucide-react';

/**
 * ------------------------------------------------------------------
 * 常量与类型定义
 * ------------------------------------------------------------------
 */

const THEMES = {
  romantic: {
    name: '浪漫粉',
    primary: 'from-pink-400 to-rose-600',
    accent: 'text-pink-200',
    button: 'bg-rose-500 shadow-rose-500/50',
    particle: '#fb7185', // rose-400
  },
  mysterious: {
    name: '温柔紫',
    primary: 'from-purple-400 to-indigo-600',
    accent: 'text-purple-200',
    button: 'bg-purple-500 shadow-purple-500/50',
    particle: '#a855f7', // purple-500
  },
  starlight: {
    name: '星光白',
    primary: 'from-slate-700 via-slate-800 to-black',
    accent: 'text-yellow-100',
    button: 'bg-yellow-100 shadow-yellow-100/50 text-slate-900',
    particle: '#fef08a', // yellow-200
  },
  macaron: {
    name: '马卡龙',
    primary: 'from-blue-200 via-pink-200 to-yellow-200',
    accent: 'text-slate-600',
    button: 'bg-white shadow-lg text-pink-500',
    particle: '#ffffff',
  }
};

const LEVELS = {
  LOW: 1,    // 轻触
  MEDIUM: 2, // 短蓄力
  HIGH: 3    // 满蓄力 (爆灯)
};

/**
 * ------------------------------------------------------------------
 * 辅助组件：粒子系统 (模拟 Canvas/SVG 效果)
 * ------------------------------------------------------------------
 */
const ParticleSystem = ({ active, level, color }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (active) {
      const count = level === LEVELS.HIGH ? 50 : (level === LEVELS.MEDIUM ? 20 : 5);
      const newParticles = Array.from({ length: count }).map((_, i) => ({
        id: Date.now() + i,
        x: 50, // center start
        y: 50,
        angle: Math.random() * 360,
        speed: Math.random() * 20 + 10,
        size: Math.random() * 10 + 5,
        type: level === LEVELS.HIGH && Math.random() > 0.5 ? 'heart' : 'circle',
        delay: Math.random() * 0.2
      }));
      setParticles(newParticles);
      
      // Cleanup
      const timer = setTimeout(() => setParticles([]), 2000);
      return () => clearTimeout(timer);
    }
  }, [active, level]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.type === 'circle' ? color : 'transparent',
            color: color,
            borderRadius: p.type === 'circle' ? '50%' : '0',
            transform: `translate(-50%, -50%)`,
            animation: `explode 1s ease-out forwards`,
            '--angle': `${p.angle}deg`,
            '--speed': `${p.speed}vh`,
          }}
        >
          {p.type === 'heart' && <Heart fill="currentColor" size={p.size * 2} />}
        </div>
      ))}
      <style>{`
        @keyframes explode {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
          100% { opacity: 0; transform: translate(calc(-50% + cos(var(--angle)) * var(--speed)), calc(-50% + sin(var(--angle)) * var(--speed))) scale(0); }
        }
      `}</style>
    </div>
  );
};

/**
 * ------------------------------------------------------------------
 * 主应用组件
 * ------------------------------------------------------------------
 */
export default function HeartbeatApp() {
  // --- 状态管理 ---
  const [config, setConfig] = useState({
    themeKey: 'romantic',
    maxChargeTime: 2000, // 毫秒，满蓄力所需时间
    confessionText: 'Will You Marry Me?',
    subText: 'I love you forever',
    bgImage: '',
    soundEnabled: true,
  });

  const [showConfig, setShowConfig] = useState(false);
  
  // 交互状态
  const [isCharging, setIsCharging] = useState(false);
  const [chargeProgress, setChargeProgress] = useState(0); // 0 - 100
  const [activeLevel, setActiveLevel] = useState(null); // 触发的等级
  const [showConfession, setShowConfession] = useState(false);
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const audioContextRef = useRef(null); // 模拟音频上下文

  // --- 逻辑处理 ---

  const currentTheme = THEMES[config.themeKey];

  // 模拟音效播放
  const playSound = (type) => {
    if (!config.soundEnabled) return;
    // 这里使用简单的 Web Audio API 振荡器模拟，实际项目可替换为 new Audio('/path.mp3')
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      
      if (type === 'charge') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'explosion') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 1);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
        osc.start(now);
        osc.stop(now + 1);
      }
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  const startCharge = () => {
    setIsCharging(true);
    setShowConfession(false);
    setActiveLevel(null);
    setChargeProgress(0);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min((elapsed / config.maxChargeTime) * 100, 100);
      setChargeProgress(progress);
      
      // 蓄力过程中的触感/音效反馈 (每20%触发一次轻微反馈)
      if (Math.floor(progress) % 20 === 0 && progress < 100 && progress > 0) {
        // Haptic feedback logic if available navigator.vibrate(10)
        playSound('charge'); 
      }

      if (progress >= 100) {
        // 蓄力满提示
        clearInterval(timerRef.current);
      }
    }, 16);
  };

  const endCharge = () => {
    clearInterval(timerRef.current);
    setIsCharging(false);
    
    if (!startTimeRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    let level = LEVELS.LOW;

    // 判定等级
    if (chargeProgress >= 100) {
      level = LEVELS.HIGH;
    } else if (elapsed > 500) {
      level = LEVELS.MEDIUM;
    }

    triggerEffect(level);
    setChargeProgress(0);
  };

  const triggerEffect = (level) => {
    setActiveLevel(level);
    playSound('explosion');

    if (level === LEVELS.HIGH) {
      setTimeout(() => setShowConfession(true), 300); // 稍微延迟显示文字，先看爆炸
    }

    // 自动复位特效状态 (不复位告白文字，告白文字需要手动关闭或点击关闭)
    setTimeout(() => {
      setActiveLevel(null);
    }, 2000);
  };

  // --- 渲染部分 ---

  return (
    <div className={`relative w-full h-screen overflow-hidden flex flex-col font-sans transition-colors duration-500 bg-gradient-to-br ${currentTheme.primary}`}>
      
      {/* 背景装饰 (动态) */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white rounded-full blur-3xl animate-pulse delay-700"></div>
        {config.bgImage && (
          <img src={config.bgImage} alt="bg" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
        )}
      </div>

      {/* 顶部栏 */}
      <div className="relative z-50 flex justify-between items-center p-6 text-white/80">
        <div className="text-sm font-medium tracking-widest uppercase flex items-center gap-2">
          <Heart size={16} className={isCharging ? "animate-ping" : ""} /> 
          Romance OS v1.0
        </div>
        <button 
          onClick={() => setShowConfig(true)}
          className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* 核心交互区 */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        
        {/* 告白文案展示区 */}
        <div 
          className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-1000 transform ${
            showConfession ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10'
          }`}
        >
           {/* 背景光晕 */}
           <div className={`absolute w-[120vw] h-[120vw] rounded-full bg-gradient-to-t from-white/20 to-transparent blur-3xl -z-10 ${showConfession ? 'animate-pulse' : ''}`}></div>
           
           <h1 className="text-4xl md:text-6xl font-bold text-white text-center drop-shadow-lg px-4 mb-4 leading-tight">
             {config.confessionText}
           </h1>
           <p className="text-xl text-white/80 font-light tracking-wide">
             {config.subText}
           </p>
        </div>

        {/* 交互按钮容器 */}
        <div className={`relative transition-all duration-500 ${showConfession ? 'mt-64 opacity-0 pointer-events-none' : 'opacity-100'}`}>
          
          {/* 蓄力光环环绕 */}
          <div 
            className="absolute inset-0 rounded-full border-4 border-white/30 transition-all duration-75"
            style={{ 
              transform: `scale(${1 + chargeProgress / 50})`,
              opacity: isCharging ? 0.8 : 0 
            }}
          ></div>
          <div 
            className="absolute inset-0 rounded-full border-4 border-white transition-all duration-75 blur-sm"
            style={{ 
              transform: `scale(${1 + chargeProgress / 40})`,
              opacity: isCharging ? (chargeProgress/100) : 0 
            }}
          ></div>

          {/* 粒子系统挂载点 */}
          <ParticleSystem active={!!activeLevel} level={activeLevel} color={currentTheme.particle} />

          {/* 主按钮 */}
          <button
            onMouseDown={startCharge}
            onMouseUp={endCharge}
            onMouseLeave={endCharge} // 移出视为松开
            onTouchStart={startCharge}
            onTouchEnd={endCharge}
            className={`
              relative w-32 h-32 md:w-48 md:h-48 rounded-full 
              flex items-center justify-center 
              transition-all duration-200 
              ${currentTheme.button}
              ${isCharging ? 'scale-95 brightness-110' : 'scale-100 animate-float'}
              group
              cursor-pointer select-none touch-manipulation tap-highlight-transparent
            `}
            style={{
              boxShadow: isCharging 
                ? `0 0 ${chargeProgress}px 10px rgba(255,255,255,0.5)` 
                : '' 
            }}
          >
            {/* 按钮内部图标 */}
            <Heart 
              className={`text-white transition-transform duration-200 ${isCharging ? 'scale-125' : 'scale-100'}`} 
              size={isCharging ? 64 : 48} 
              fill={isCharging ? "white" : "transparent"}
            />
            
            {/* 提示文字 */}
            {!isCharging && (
              <span className="absolute -bottom-12 text-white/60 text-sm tracking-widest uppercase animate-pulse">
                Hold to Surprise
              </span>
            )}
            
            {/* 蓄力进度提示 */}
            {isCharging && (
              <span className="absolute -bottom-12 text-white font-bold text-lg">
                {Math.floor(chargeProgress)}%
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 底部重置按钮 (仅在爆灯后显示) */}
      {showConfession && (
        <div className="absolute bottom-10 w-full flex justify-center z-50 animate-fade-in">
          <button 
            onClick={() => { setShowConfession(false); setChargeProgress(0); }}
            className="px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur text-white rounded-full text-sm border border-white/20 transition-all"
          >
            再来一次
          </button>
        </div>
      )}

      {/* --- 配置面板模态框 --- */}
      {showConfig && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl p-6 overflow-y-auto animate-slide-in-right">
            
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Settings className="text-rose-500" />
                装置配置
              </h2>
              <button onClick={() => setShowConfig(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                <X size={24} />
              </button>
            </div>

            {/* 配置项 1: 灯效核心 */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                <Sparkles size={16} /> 氛围色系
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(THEMES).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => setConfig({ ...config, themeKey: key })}
                    className={`
                      relative p-3 rounded-xl border-2 text-left transition-all overflow-hidden
                      ${config.themeKey === key ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'border-slate-200 dark:border-slate-700'}
                    `}
                  >
                    <div className={`h-12 rounded-lg bg-gradient-to-r ${theme.primary} mb-2 shadow-sm`}></div>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{theme.name}</span>
                    {config.themeKey === key && (
                      <div className="absolute top-2 right-2 text-rose-500"><Check size={16} /></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 配置项 2: 文字设置 */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                <Type size={16} /> 专属记忆
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">爆灯主标题</label>
                  <input 
                    type="text" 
                    value={config.confessionText}
                    onChange={(e) => setConfig({...config, confessionText: e.target.value})}
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">副标题 / 纪念日</label>
                  <input 
                    type="text" 
                    value={config.subText}
                    onChange={(e) => setConfig({...config, subText: e.target.value})}
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 配置项 3: 蓄力机制 */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                <Zap size={16} /> 交互手感
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-600 dark:text-slate-300 text-sm">满级蓄力时长</span>
                  <span className="text-rose-500 font-bold text-sm">{config.maxChargeTime / 1000}s</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="5000" 
                  step="100"
                  value={config.maxChargeTime}
                  onChange={(e) => setConfig({...config, maxChargeTime: Number(e.target.value)})}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <p className="text-xs text-slate-400 mt-2">时长越长，期待感拉得越满。</p>
              </div>
            </div>

            {/* 配置项 4: 音效与视觉 */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                <ImageIcon size={16} /> 氛围增强
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                   <div className="flex items-center gap-3">
                     <Volume2 className="text-slate-500" size={20} />
                     <span className="text-slate-700 dark:text-slate-200">交互音效反馈</span>
                   </div>
                   <button 
                     onClick={() => setConfig({...config, soundEnabled: !config.soundEnabled})}
                     className={`w-12 h-6 rounded-full p-1 transition-colors ${config.soundEnabled ? 'bg-rose-500' : 'bg-slate-300'}`}
                   >
                     <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${config.soundEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                   </button>
                </div>
                <div>
                   <label className="block text-xs text-slate-500 mb-1">背景图片 URL (可选)</label>
                   <div className="flex gap-2">
                     <input 
                        type="text" 
                        placeholder="https://..."
                        value={config.bgImage}
                        onChange={(e) => setConfig({...config, bgImage: e.target.value})}
                        className="flex-1 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-rose-500"
                      />
                      {config.bgImage && (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          <img src={config.bgImage} alt="prev" className="w-full h-full object-cover" />
                        </div>
                      )}
                   </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <button 
                onClick={() => setShowConfig(false)}
                className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:shadow-lg transition-all transform active:scale-95"
              >
                保存并预览
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CSS 动画定义 */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}