'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Settings, Maximize2, Minimize2, Star, Type, Palette, Sparkles, Heart, MousePointer2 } from 'lucide-react';

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

const THEMES = [
  { name: '深邃夜空', bg: '#0f172a', star: '#e2e8f0', meteor: '#38bdf8' },
  { name: '浪漫紫罗兰', bg: '#2e1065', star: '#f5d0fe', meteor: '#d8b4fe' },
  { name: '暗夜森林', bg: '#022c22', star: '#d9f99d', meteor: '#bef264' },
  { name: '极光粉', bg: '#4a044e', star: '#fbcfe8', meteor: '#f472b6' },
];

export default function StarrySkyApp() {
  const [config, setConfig] = useState({
    title: '星河情书',
    partnerName: '亲爱的',
    confessionText: '我看过万千星河，最亮的还是你的眼眸',
    starDensity: 150,
    themeIndex: 0,
    showTextOnDrag: true,
  });
  const [showPanel, setShowPanel] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();

  const starsRef = useRef<StarEntity[]>([]);
  const meteorsRef = useRef<MeteorEntity[]>([]);
  const textsRef = useRef<TextEntity[]>([]);
  const constellationsRef = useRef<ConstellationLine[]>([]);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const textIndexRef = useRef(0);

  const currentTheme = THEMES[config.themeIndex];

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
  }, [config.starDensity, isFullScreen]);

  useEffect(() => {
    const animate = () => {
      renderCanvas();
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [config, currentTheme]);

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

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
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
    if (isDragging) {
      const dx = x - lastMousePos.current.x;
      const dy = y - lastMousePos.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
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
      if (config.showTextOnDrag && speed > 5 && Math.random() > 0.7) {
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

  const handleClick = (e: React.MouseEvent) => {
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

  const constsRefAdd = (x1: number, y1: number, x2: number, y2: number) => {
    constellationsRef.current.push({ startX: x1, startY: y1, endX: x2, endY: y2, life: 1.0, alpha: 1.0 });
  };

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

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, currentTheme.bg);
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
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
    starsRef.current.forEach((star) => {
      star.x += star.vx;
      star.y += star.vy;
      if (star.x < 0) star.x = width;
      if (star.x > width) star.x = 0;
      if (star.y < 0) star.y = height;
      if (star.y > height) star.y = 0;
      const dx = mousePos.x - star.x;
      const dy = mousePos.y - star.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const hoverRadius = 150;
      let targetAlpha = star.baseAlpha;
      if (dist < hoverRadius) {
        targetAlpha = star.baseAlpha + (1 - dist / hoverRadius) * 0.8;
      }
      star.alpha += (targetAlpha - star.alpha) * 0.1;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = currentTheme.star;
      ctx.globalAlpha = star.alpha;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });
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
      ctx.beginPath();
      ctx.arc(meteor.x, meteor.y, 2 * meteor.life, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });
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

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
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

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden font-sans select-none transition-colors duration-1000`}
      style={{ backgroundColor: currentTheme.bg }}
    >
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

      <div
        className={`absolute top-8 left-0 w-full text-center pointer-events-none transition-opacity duration-500 ${isDragging ? 'opacity-20' : 'opacity-80'}`}
        style={{ color: currentTheme.star }}
      >
        <h1 className="text-4xl md:text-6xl font-thin tracking-[0.2em] animate-pulse drop-shadow-lg">{config.title}</h1>
        <p className="mt-2 text-sm md:text-lg opacity-70 tracking-widest uppercase">
          {config.partnerName ? `To ${config.partnerName}` : 'Interactive Galaxy'}
        </p>
      </div>

      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`absolute z-20 top-4 right-4 p-2 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 text-white transition-all ${showPanel ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <Settings size={24} />
      </button>

      <div
        className={`absolute z-20 top-0 right-0 h-full w-80 bg-black/60 backdrop-blur-xl border-l border-white/10 text-white p-6 transform transition-transform duration-300 ease-out overflow-y-auto ${showPanel ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-light flex items-center gap-2">
            <Sparkles size={20} className="text-yellow-300" /> 星空配置
          </h2>
          <button onClick={() => setShowPanel(false)} className="hover:text-gray-300">
            <Minimize2 size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
              <span className="text-sm flex items-center gap-2">
                <Maximize2 size={16} /> 全屏沉浸
              </span>
              <button onClick={toggleFullScreen} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs transition-colors">
                {isFullScreen ? '退出' : '开启'}
              </button>
            </div>

            <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
              <span className="text-sm flex items-center gap-2">
                <Type size={16} /> 拖拽显示文字
              </span>
              <input type="checkbox" checked={config.showTextOnDrag} onChange={(e) => setConfig({ ...config, showTextOnDrag: e.target.checked })} className="toggle-checkbox" />
            </div>
          </div>

          <hr className="border-white/10" />

          <div className="space-y-4">
            <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold">定制内容</label>
            <div className="space-y-1">
              <span className="text-xs text-gray-400">标题</span>
              <input type="text" value={config.title} onChange={(e) => setConfig({ ...config, title: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded p-2 text-sm focus:outline-none focus:border-blue-400 transition-colors" placeholder="星河情书" />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-gray-400">对象名字</span>
              <input type="text" value={config.partnerName} onChange={(e) => setConfig({ ...config, partnerName: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded p-2 text-sm focus:outline-none focus:border-blue-400 transition-colors" placeholder="亲爱的" />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-gray-400">拖拽显示的告白 (字串)</span>
              <textarea value={config.confessionText} onChange={(e) => setConfig({ ...config, confessionText: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded p-2 text-sm focus:outline-none focus:border-blue-400 transition-colors h-20 resize-none" placeholder="在这里输入你想说的话..." />
            </div>
          </div>

          <hr className="border-white/10" />

          <div className="space-y-4">
            <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold">视觉效果</label>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span className="flex gap-1 items-center">
                  <Star size={12} /> 星星数量
                </span>
                <span>{config.starDensity}</span>
              </div>
              <input type="range" min="50" max="400" value={config.starDensity} onChange={(e) => setConfig({ ...config, starDensity: parseInt(e.target.value) })} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div className="space-y-2">
              <div className="flex gap-1 items-center text-xs text-gray-400 mb-2">
                <Palette size={12} /> 主题色调
              </div>
              <div className="grid grid-cols-4 gap-2">
                {THEMES.map((theme, idx) => (
                  <button key={theme.name} onClick={() => setConfig({ ...config, themeIndex: idx })} className={`w-full aspect-square rounded-full border-2 transition-all ${config.themeIndex === idx ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`} style={{ backgroundColor: theme.bg }} title={theme.name}>
                    <div className="w-2 h-2 rounded-full bg-white mx-auto mt-1 opacity-50" style={{ backgroundColor: theme.meteor }}></div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded p-4 text-xs text-blue-200 leading-relaxed">
            <p className="flex items-center gap-2 font-bold mb-1">
              <MousePointer2 size={12} /> 玩法提示：
            </p>
            <ul className="list-disc list-inside space-y-1 opacity-80">
              <li>移动鼠标点亮微弱的星光</li>
              <li>按住鼠标快速<strong>拖拽</strong>生成文字流星</li>
              <li>
                <strong>点击</strong>空白处连接附近的星星成为星座
              </li>
            </ul>
          </div>

          <div className="mt-8 text-center opacity-30 text-xs">Built with React & Canvas</div>
        </div>
      </div>
    </div>
  );
}

