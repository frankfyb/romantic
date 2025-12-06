import { useState, useEffect } from 'react';
import { Heart, Sparkles, Gift, User, Search, Bell, Menu, X } from 'lucide-react';
import Button from '../common/Button';
import { useSession, signOut } from 'next-auth/react';
import type { NavItem, PageKey } from '@/types';

interface NavbarProps {
  currentPage: PageKey;
  setCurrentPage: (page: PageKey) => void;
  onLoginOpen: () => void;
}

const Navbar = ({ currentPage, setCurrentPage, onLoginOpen }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // 滚动监听
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 导航项配置
  const navItems: NavItem[] = [
    { id: 'home', label: '首页', icon: Sparkles },
    { id: 'rituals', label: '仪式库', icon: Gift },
    { id: 'profile', label: '我的', icon: User },
  ];

  const { data: session, status } = useSession();

  const userName = (() => {
    const name = session?.user?.name || '';
    const email = session?.user?.email || '';
    if (name) return name;
    if (email) return email.split('@')[0];
    return '';
  })();

  return (
    <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-pink-100' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setCurrentPage('home')}
          >
            <div className="w-8 h-8 rounded-lg bg-rose-400 text-white flex items-center justify-center transform rotate-3">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">
              Love<span className="text-rose-500">Rituals</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id as PageKey)}
                className={`text-sm font-medium transition-colors hover:text-rose-500 flex items-center gap-1.5 ${currentPage === item.id ? 'text-rose-500' : 'text-slate-500'}`}
              >
                {item.icon && <item.icon className={`w-4 h-4 ${currentPage === item.id ? 'fill-rose-100' : ''}`} />}
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-slate-400 hover:text-rose-500 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="text-slate-400 hover:text-rose-500 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full ring-2 ring-white"></span>
            </button>
            {status === 'authenticated' && session?.user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 hover:bg-white text-slate-700 border border-pink-100 shadow-sm">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-400 text-white text-xs">
                    {(session.user.image ? '🙂' : (userName ? userName[0]?.toUpperCase() : 'U'))}
                  </span>
                  <span className="text-sm font-medium max-w-[120px] truncate">{userName || '用户'}</span>
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-white/95 backdrop-blur-xl border border-pink-100 rounded-xl shadow-xl p-2 hidden group-hover:block">
                  <button
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-600 hover:bg-pink-50 hover:text-rose-600"
                    onClick={() => setCurrentPage('profile')}
                    aria-label="个人中心"
                  >
                    个人中心
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-600 hover:bg-pink-50 hover:text-rose-600"
                    onClick={() => signOut({ redirect: false })}
                    aria-label="退出登录"
                  >
                    退出登录
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="primary" className="!px-5 !py-1.5 text-sm" onClick={onLoginOpen}>
                  登录 / 注册
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-500">
               {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-pink-100 p-4 space-y-4 animate-in slide-in-from-top-10">
           {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id as PageKey);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 ${currentPage === item.id ? 'bg-pink-50 text-rose-500' : 'text-slate-600'}`}
              >
                 <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
            <div className="pt-4 border-t border-slate-100">
              <Button variant="primary" className="w-full" onClick={() => { onLoginOpen(); setIsMobileMenuOpen(false); }}>登录 / 注册</Button>
            </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
