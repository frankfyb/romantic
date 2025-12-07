'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { TimeCapsuleConfig } from './config';
import TimeCapsuleConfigUI from './ConfigUI';
import { defaultConfig } from './config';
import { Settings, X } from 'lucide-react';

type Props = {
  config: TimeCapsuleConfig;
  isPreview?: boolean;
  onConfigChange?: (cfg: TimeCapsuleConfig) => void;
};

export default function TimeCapsuleDisplayUI({ config, isPreview = false, onConfigChange }: Props) {
  const [status, setStatus] = useState<'sealed' | 'unlocked'>('sealed');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showConfig, setShowConfig] = useState(!isPreview);

  const targetTime = useMemo(() => new Date(config.openDate).getTime(), [config.openDate]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const distance = targetTime - now;
      if (distance <= 0) {
        setStatus('unlocked');
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetTime]);

  useEffect(() => {
    if (isPreview && config.musicUrl) {
      audioRef.current = new Audio(config.musicUrl);
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(() => {});
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      };
    }
  }, [isPreview, config.musicUrl]);

  const themeRing = {
    indigo: 'ring-indigo-400',
    rose: 'ring-rose-400',
    amber: 'ring-amber-400',
    emerald: 'ring-emerald-400',
  }[config.themeColor];

  const bgClass = {
    'gradient-space': 'bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#1a1a2e] to-black',
    'gradient-sunset': 'bg-orange-900 bg-[radial-gradient(at_top_left,_var(--tw-gradient-stops))] from-rose-900 via-purple-900 to-slate-900',
    'gradient-ocean': 'bg-blue-900 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-900 via-cyan-900 to-slate-900',
  }[config.bgStyle];

  return (
    <div className={`min-h-screen ${bgClass} text-white relative`}>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">{config.recipient}</h1>
          {status === 'sealed' ? (
            <p className="mt-2 text-sm text-white/70">
              开启倒计时：{timeLeft.days}天 {timeLeft.hours}时 {timeLeft.minutes}分 {timeLeft.seconds}秒
            </p>
          ) : (
            <p className="mt-2 text-sm text-emerald-300">已到开启时间，胶囊已解锁</p>
          )}
        </div>

        <div className={`rounded-2xl bg-white/10 ring-2 ${themeRing} p-8 shadow-xl backdrop-blur-sm`}>
          {status === 'sealed' ? (
            <div className="text-center text-white/70">
              <p>内容已封存，耐心等待开启时刻…</p>
            </div>
          ) : (
            <div className="prose prose-lg prose-invert max-w-none whitespace-pre-wrap">{config.message}</div>
          )}
        </div>

        {/* 调试按钮 - 在预览模式下也显示，但功能受限 */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              // 在预览模式下不真正改变配置，只显示提示
              if (isPreview) {
                alert('这是预览模式，无法真正修改配置');
              } else if (onConfigChange) {
                onConfigChange({
                  ...config,
                  openDate: new Date(Date.now() + 2_000).toISOString().slice(0, 16),
                });
              }
            }}
            className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            调试：2秒后解锁
          </button>
        </div>
      </div>

      {/* 设置按钮 - 在预览模式下也显示，但功能受限 */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => {
            // 在预览模式下不真正切换配置面板，只显示提示
            if (isPreview) {
              alert('这是预览模式，无法修改配置');
            } else if (onConfigChange) {
              setShowConfig(!showConfig);
            }
          }}
          className="p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full text-white shadow-sm transition-all"
          title="设置"
        >
          {showConfig ? <X size={20} /> : <Settings size={20} />}
        </button>
      </div>

      {/* 配置面板 - 在预览模式下不显示 */}
      {!isPreview && onConfigChange && showConfig && (
        <TimeCapsuleConfigUI
          config={config}
          onConfigChange={onConfigChange}
          onReset={() => onConfigChange(defaultConfig)}
        />
      )}
    </div>
  );
}
