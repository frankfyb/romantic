import { Gift, Share2, Edit3, Trash2 } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import type { UserLink } from '@/constants/mock-data';

interface UserLinkItemProps {
  item: UserLink;
  onShare: () => void;
  onDelete: (id: number) => void;
}

const UserLinkItem = ({ item, onShare, onDelete }: UserLinkItemProps) => (
  <Card key={item.id} className="flex flex-col sm:flex-row items-center gap-4 !p-4 group">
    <div className="w-full sm:w-32 h-24 bg-pink-50 rounded-xl flex items-center justify-center text-pink-200">
      <Gift className="w-8 h-8" />
    </div>
    <div className="flex-1 text-center sm:text-left w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
        <h4 className="font-bold text-slate-700">{item.title}</h4>
        <Badge colorClass="bg-purple-50 text-purple-500 w-fit mx-auto sm:mx-0">{item.type}</Badge>
      </div>
      <div className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-4">
        <span>{item.date}</span>
        <span>{item.visits} 次访问</span>
      </div>
    </div>
    <div className="flex gap-2 w-full sm:w-auto justify-center">
      <button onClick={onShare} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors" title="分享">
        <Share2 className="w-5 h-5" />
      </button>
      <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors" title="编辑">
        <Edit3 className="w-5 h-5" />
      </button>
      <button 
        onClick={() => onDelete(item.id)}
        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" 
        title="删除"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  </Card>
);

export default UserLinkItem;