'use client';
import { Search, Heart } from 'lucide-react';
import { TOOLS_DATA } from '@/constants/mock-data';
import ToolCard from '@/components/business/ToolCard';

export default function ToolsPage() {
  return (
    <div className="space-y-8 animate-slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 p-4 rounded-2xl backdrop-blur-sm">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
          {['全部', '节日', '表白', '纪念', 'AI创作'].map((filter, idx) => (
            <button 
              key={filter} 
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${idx === 0 ? 'bg-rose-400 text-white shadow-md shadow-rose-200' : 'bg-white text-slate-500 hover:bg-pink-50'}`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜索浪漫工具..." 
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {TOOLS_DATA.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
      
      {/* Loading State Mock */}
      <div className="flex justify-center py-8">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Heart className="w-4 h-4 animate-pulse text-rose-300" />
          加载更多浪漫...
        </div>
      </div>
    </div>
  );
}
