// src/tools/starry-sky/DisplayUI.tsx
'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Maximize2, Minimize2, MousePointer2 } from 'lucide-react';
import type { StarrySkyConfig } from './config';
import { THEMES } from './config';

// 类型定义
interface StarEntity {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  vx: number;
  vy: number;
}

interface MeteorEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  trail: { x: number; y: number }[];
  color: string;
}

interface TextEntity {
  x: number;
  y: number;
  text: string;
  life: number;
  vx: number;
  vy: number;
  scale: number;
  color: string;
}

interface ConstellationLine {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  life: number;
  alpha: number;
}

// Props类型
interface Props {
  config: StarrySkyConfig;
  isPreview?: boolean;
  onConfigChange?: (cfg: StarrySkyConfig) => void;
}

export default function StarrySkyDisplayUI({ 
  config, 
  isPreview = false, 
  onConfigChange 
}: Props) {
  // 状态管理
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  // 引用管理
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // 画布元素引用
  const starsRef = useRef<StarEntity[]>([]);
  const meteorsRef = useRef<MeteorEntity[]>([]);
  const textsRef = useRef<TextEntity[]>([]);
  const constellationsRef = useRef<ConstellationLine[]>([]);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const textIndexRef = useRef(0);
  
  // 计算当前主题（避免重复查找）
  const currentTheme = useMemo(() => THEMES[config.themeIndex], [config.themeIndex]);

  // 初始化星星
  const initStars = () => {
    if (!canvasRef.current) return;
    const { width, height } = canvasRef.current;
    const starCount = config.starDensity;
    const newStars: StarEntity[] = [];
    for (let i = 0; i < starCount; i++) {
      newStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        baseAlpha: Math.random() * 0.5 + 0.1,
        alpha: 0,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
      });
    }
    starsRef.current = newStars;
  };

  // 处理事件坐标
  const getEventPos = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  // 鼠标/触摸事件处理
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    // 移除了 isPreview 的限制，允许在预览模式下也有基本的交互
    setIsDragging(true);
    const { x, y } = getEventPos(e);
    lastMousePos.current = { x, y };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getEventPos(e);
    setMousePos({ x, y });
    
    // 在预览模式下也允许基本的鼠标移动交互（点亮星星）
    // 修改了条件判断，允许在预览模式下也有拖拽交互
    if (isDragging) {
      const dx = x - lastMousePos.current.x;
      const dy = y - lastMousePos.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      
      // 生成流星
      if (speed > 2) {
        meteorsRef.current.push({
          x,
          y,
          vx: dx * 0.1 + (Math.random() - 0.5),
          vy: dy * 0.1 + (Math.random() - 0.5),
          life: 1.0,
          trail: [],
          color: currentTheme.meteor,
        });
      }
      
      // 生成文字（仅在非预览模式下）
      if (!isPreview && config.showTextOnDrag && speed > 5 && Math.random() > 0.7) {
        const fullText = config.confessionText || 'I Love You';
        const char = fullText[textIndexRef.current % fullText.length];
        textIndexRef.current++;
        textsRef.current.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          text: char,
          life: 1.0,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -1 - Math.random(),
          scale: 0.5,
          color: currentTheme.star,
        });
      }
    }
    lastMousePos.current = { x, y };
  };

  // 星座连线
  const constsRefAdd = (x1: number, y1: number, x2: number, y2: number) => {
    constellationsRef.current.push({ 
      startX: x1, startY: y1, endX: x2, endY: y2, life: 1.0, alpha: 1.0 
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    // 移除了 isPreview 的限制，允许在预览模式下也有点击交互
    if (!canvasRef.current) return;
    const { x, y } = getEventPos(e);
    const nearbyStars = starsRef.current
      .map((s, i) => ({ ...s, dist: Math.hypot(s.x - x, s.y - y), id: i }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 5);
    for (let i = 0; i < nearbyStars.length - 1; i++) {
      constsRefAdd(nearbyStars[i].x, nearbyStars[i].y, nearbyStars[i + 1].x, nearbyStars[i + 1].y);
    }
    constsRefAdd(nearbyStars[0].x, nearbyStars[0].y, x, y);
  };

  // 全屏切换
  const toggleFullScreen = () => {
    if (!containerRef.current || isPreview) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullScreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsFullScreen(false);
      });
    }
  };

  // 画布渲染
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width, height } = canvas;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 背景渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, currentTheme.bg);
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // 绘制星座连线
    constellationsRef.current.forEach((line, index) => {
      ctx.beginPath();
      ctx.moveTo(line.startX, line.startY);
      ctx.lineTo(line.endX, line.endY);
      ctx.strokeStyle = `rgba(255, 255, 255, ${line.alpha * line.life})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      line.life -= 0.005;
      if (line.life <= 0) constellationsRef.current.splice(index, 1);
    });
    
    // 绘制星星
    starsRef.current.forEach((star) => {
      star.x += star.vx;
      star.y += star.vy;
      // 边界循环
      if (star.x < 0) star.x = width;
      if (star.x > width) star.x = 0;
      if (star.y < 0) star.y = height;
      if (star.y > height) star.y = 0;
      
      // 鼠标交互亮度
      const dx = mousePos.x - star.x;
      const dy = mousePos.y - star.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const hoverRadius = 150;
      let targetAlpha = star.baseAlpha;
      if (dist < hoverRadius) {
        targetAlpha = star.baseAlpha + (1 - dist / hoverRadius) * 0.8;
      }
      star.alpha += (targetAlpha - star.alpha) * 0.1;
      
      // 绘制星星
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = currentTheme.star;
      ctx.globalAlpha = star.alpha;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });
    
    // 绘制流星
    meteorsRef.current.forEach((meteor, index) => {
      meteor.x += meteor.vx;
      meteor.y += meteor.vy;
      meteor.life -= 0.02;
      meteor.trail.push({ x: meteor.x, y: meteor.y });
      if (meteor.trail.length > 10) meteor.trail.shift();
      
      if (meteor.life <= 0) {
        meteorsRef.current.splice(index, 1);
        return;
      }
      
      // 绘制流星轨迹
      ctx.beginPath();
      if (meteor.trail.length > 1) {
        ctx.moveTo(meteor.trail[0].x, meteor.trail[0].y);
        for (let i = 1; i < meteor.trail.length; i++) {
          const xc = (meteor.trail[i].x + meteor.trail[i - 1].x) / 2;
          const yc = (meteor.trail[i].y + meteor.trail[i - 1].y) / 2;
          ctx.quadraticCurveTo(meteor.trail[i - 1].x, meteor.trail[i - 1].y, xc, yc);
        }
        ctx.lineTo(meteor.x, meteor.y);
      }
      ctx.strokeStyle = meteor.color;
      ctx.lineWidth = 2 * meteor.life;
      ctx.stroke();
      
      // 绘制流星核心
      ctx.beginPath();
      ctx.arc(meteor.x, meteor.y, 2 * meteor.life, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });
    
    // 绘制文字
    ctx.font = '16px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    textsRef.current.forEach((text, index) => {
      text.x += text.vx;
      text.y += text.vy;
      text.life -= 0.01;
      text.scale += 0.01;
      
      if (text.life <= 0) {
        textsRef.current.splice(index, 1);
        return;
      }
      
      ctx.save();
      ctx.translate(text.x, text.y);
      ctx.scale(text.scale, text.scale);
      ctx.fillStyle = text.color;
      ctx.globalAlpha = text.life;
      ctx.fillText(text.text, 0, 0);
      ctx.restore();
    });
  };

  // 动画循环
  useEffect(() => {
    const animate = () => {
      renderCanvas();
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [config, currentTheme, isPreview]);

  // 初始化和窗口调整
  useEffect(() => {
    initStars();
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
        initStars();
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [config.starDensity, isFullScreen, isPreview]);

  // 全屏状态监听
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // 预览模式自动播放音乐
  useEffect(() => {
    if (isPreview && config.musicUrl) {
      audioRef.current = new Audio(config.musicUrl);
      audioRef.current.volume = config.musicVolume || 0.4;
      audioRef.current.loop = true;
      audioRef.current.play().catch(() => {});
      
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      };
    }
  }, [isPreview, config.musicUrl, config.musicVolume]);

  // 调试按钮：重置配置（仅非预览模式）
  const handleResetConfig = () => {
    if (onConfigChange) {
      onConfigChange({
        title: '星河情书',
        partnerName: '亲爱的',
        confessionText: '我看过万千星河，最亮的还是你的眼眸',
        starDensity: 150,
        themeIndex: 0,
        showTextOnDrag: true,
        musicUrl: config.musicUrl,
        musicVolume: config.musicVolume,
      });
      // 重置画布元素
      starsRef.current = [];
      meteorsRef.current = [];
      textsRef.current = [];
      constellationsRef.current = [];
      initStars();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden font-sans select-none transition-colors duration-1000`}
      style={{ backgroundColor: currentTheme.bg }}
    >
      {/* 画布核心 */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        onTouchMove={handleMouseMove}
        className="absolute top-0 left-0 w-full h-full cursor-crosshair z-0"
      />

      {/* 标题区域 */}
      <div
        className={`absolute top-8 left-0 w-full text-center pointer-events-none transition-opacity duration-500 ${isDragging ? 'opacity-20' : 'opacity-80'}`}
        style={{ color: currentTheme.star }}
      >
        <h1 className="text-4xl md:text-6xl font-thin tracking-[0.2em] animate-pulse drop-shadow-lg">{config.title}</h1>
        <p className="mt-2 text-sm md:text-lg opacity-70 tracking-widest uppercase">
          {config.partnerName ? `To ${config.partnerName}` : 'Interactive Galaxy'}
        </p>
      </div>

      {/* 调试按钮（仅非预览模式） */}
      {!isPreview && (
        <>
          <button
            onClick={handleResetConfig}
            className="absolute z-20 top-4 left-4 p-2 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 text-white transition-all"
            title="重置配置"
          >
            <Minimize2 size={24} />
          </button>
          
          <button
            onClick={toggleFullScreen}
            className="absolute z-20 top-4 right-4 p-2 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 text-white transition-all"
            title={isFullScreen ? '退出全屏' : '全屏模式'}
          >
            <Maximize2 size={24} />
          </button>
        </>
      )}

      {/* 音乐元素（隐藏） */}
      {isPreview && config.musicUrl && (
        <audio ref={audioRef} style={{ display: 'none' }} loop />
      )}

      {/* 预览模式玩法提示 */}
      {isPreview && (
        <div className="absolute bottom-8 left-0 w-full text-center pointer-events-none">
          <div className="inline-block bg-black/60 backdrop-blur-xl px-4 py-2 rounded-lg text-xs text-white/80">
            <p className="flex items-center justify-center gap-2 font-bold mb-1">
              <MousePointer2 size={12} /> 互动玩法：
            </p>
            <ul className="list-disc list-inside space-y-1 opacity-80 text-left">
              <li>移动鼠标点亮星光</li>
              <li>拖拽生成文字流星</li>
              <li>点击连接星座</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}