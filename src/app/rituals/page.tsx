'use client';
import { Search, Heart } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import ToolCard from '@/components/business/ToolCard';

export default function ToolsPage() {
  const [activeTag, setActiveTag] = useState<string>('全部');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tools, setTools] = useState<{ toolKey: string; toolName: string; description?: string; tag?: string; category?: string }[]>([]);

  // 获取工具列表的回调函数
  const fetchTools = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (activeCategory) params.set('categoryId', activeCategory);
      
      const res = await fetch(`/api/tools/list?${params.toString()}`);
      if (!res.ok) throw new Error(`加载失败: ${res.status}`);
      
      const json = await res.json();
      setTools(json.data || []);
    } catch (e: any) {
      setError(e?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [q, activeCategory]);

  // 获取分类列表的回调函数
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`/api/tools/tool-category?pageSize=10`);
      const json = await res.json();
      const items = json?.data?.items || [];
      setCategories(items.map((c: any) => ({ id: c.id, name: c.name })));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // 如果API失败，使用默认分类
      setCategories([
        { id: 'festival', name: '节日' },
        { id: 'confession', name: '表白' },
        { id: 'memory', name: '纪念' },
        { id: 'ai', name: 'AI创作' },
      ]);
    }
  }, []);

  // 监听分类变化时重新获取工具列表
  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  // 页面加载时获取分类列表
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 计算面包屑导航文本
  const breadcrumbText = useMemo(() => {
    if (!activeCategory) return '首页 > 仪式库';
    const category = categories.find(c => c.id === activeCategory);
    return `首页 > 仪式库 > ${category?.name || ''}`;
  }, [activeCategory, categories]);

  // 处理搜索
  const handleSearch = useCallback(() => {
    fetchTools();
  }, [fetchTools]);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  return (
    <div className="space-y-8 animate-slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 p-4 rounded-2xl backdrop-blur-sm">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
          <button
            onClick={() => setActiveCategory('')}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${!activeCategory ? 'bg-rose-400 text-white shadow-md shadow-rose-200' : 'bg-white text-slate-500 hover:bg-pink-50'}`}
            aria-label="查看所有分类"
          >全部</button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${activeCategory === c.id ? 'bg-rose-400 text-white shadow-md shadow-rose-200' : 'bg-white text-slate-500 hover:bg-pink-50'}`}
              aria-label={`查看${c.name}分类`}
            >{c.name}</button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜索浪漫工具..." 
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm" 
            aria-label="搜索工具"
          />
          <button 
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-pink-400 hover:text-rose-500"
            aria-label="搜索"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-50">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 bg-white/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {tools.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-2">没有找到相关工具</div>
              <button 
                onClick={() => {
                  setQ('');
                  setActiveCategory('');
                }}
                className="text-rose-500 hover:text-rose-600 underline"
              >
                清空筛选条件
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tools.map((tool) => (
                <ToolCard 
                  key={tool.toolKey} 
                  tool={{ id: iHash(tool.toolKey), title: tool.toolName, desc: tool.description || '', icon: <Heart className="w-6 h-6 text-rose-400"/>, tag: tool.tag || '热门' }} 
                  onClick={() => window.location.assign(`/rituals/${tool.toolKey}`)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <div className="flex justify-between items-center py-8">
        <div className="text-sm text-slate-500">
          {breadcrumbText}
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Heart className="w-4 h-4 animate-pulse text-rose-300" />
          加载更多浪漫...
        </div>
      </div>
    </div>
  );
}

function iHash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}