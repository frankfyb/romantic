'use client';
import { useState } from 'react';
import { Gift, Star, Share2, Edit3, Trash2 } from 'lucide-react';
import { USER_LINKS_DATA } from '@/constants/mock-data';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import ShareContent from '@/components/business/ShareContent';
import UserLinkItem from '@/components/business/UserLinkItem';

export default function ProfilePage() {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  return (
    <div className="space-y-8 animate-slide-in-from-right-4 duration-500">
      {/* User Header */}
      <div className="relative bg-gradient-to-r from-rose-400 to-pink-500 rounded-3xl p-8 text-white shadow-lg shadow-rose-200 overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 p-24 bg-yellow-400/20 rounded-full blur-2xl -ml-10 -mb-10"></div>
        
        <div className="relative flex flex-col md:flex-row items-center gap-6 z-10">
          <div className="w-24 h-24 rounded-full border-4 border-white/30 bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner">
            <span role="img" aria-label="avatar">🌸</span>
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-bold mb-2">浪漫制造家</h2>
            <p className="text-rose-100 text-sm mb-4">"爱意随风起，风止意难平"</p>
            <div className="flex justify-center md:justify-start gap-6">
              <div className="text-center">
                <div className="font-bold text-xl">12</div>
                <div className="text-xs text-rose-100 opacity-80">累计作品</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl">1.2k</div>
                <div className="text-xs text-rose-100 opacity-80">收获访问</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl">5</div>
                <div className="text-xs text-rose-100 opacity-80">模板收藏</div>
              </div>
            </div>
          </div>
          <Button className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
            编辑资料
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">我的作品</h3>
            <div className="text-sm text-slate-400">共 {USER_LINKS_DATA.length} 个</div>
          </div>

          <div className="space-y-4">
            {USER_LINKS_DATA.map((item) => (
              <UserLinkItem 
                key={item.id} 
                item={item} 
                onShare={() => setIsShareOpen(true)} 
                onDelete={(id) => setShowDeleteConfirm(id)} 
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="!bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-100">
            <h3 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
              <Star className="w-4 h-4 fill-orange-400 text-orange-400" /> 会员特权
            </h3>
            <p className="text-sm text-orange-700/80 mb-4">解锁更多浪漫模板，去除水印，尊享 VIP 专属标识。</p>
            <Button className="w-full bg-orange-400 hover:bg-orange-500 text-white shadow-orange-200">
              升级会员
            </Button>
          </Card>
        </div>
      </div>

      {/* Share Modal */}
      <Modal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} title="传递爱意">
        <ShareContent />
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal 
        isOpen={!!showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(null)} 
        title="确认删除"
      >
        <div className="text-center space-y-6">
          <p className="text-slate-600">确定要将这份美好的回忆移除吗？<br/>删除后无法找回哦。</p>
          <div className="flex gap-4 justify-center">
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>再想想</Button>
            <Button variant="danger" onClick={() => setShowDeleteConfirm(null)}>狠心删除</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
