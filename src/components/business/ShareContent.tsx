import { Share2, Star } from 'lucide-react';
import Button from '../common/Button';

const ShareContent = () => (
  <div className="space-y-6 text-center">
    <div className="w-32 h-32 mx-auto bg-white border-2 border-dashed border-rose-200 rounded-xl flex items-center justify-center p-2">
       <div className="w-full h-full bg-rose-50 rounded-lg flex items-center justify-center text-rose-300 text-xs">
         二维码占位
       </div>
    </div>
    <div className="flex gap-2">
      <input readOnly value="https://love-tools.com/s/xk92ka" className="flex-1 bg-slate-50 px-3 py-2 rounded-lg text-sm text-slate-500 border border-slate-200" />
      <Button variant="secondary" className="px-4 text-sm">复制</Button>
    </div>
    <div className="flex justify-around text-sm text-slate-500">
      <div className="flex flex-col items-center gap-1 hover:text-rose-500 cursor-pointer">
        <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><Share2 className="w-5 h-5" /></div>
        微信好友
      </div>
      <div className="flex flex-col items-center gap-1 hover:text-rose-500 cursor-pointer">
        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"><Star className="w-5 h-5" /></div>
        朋友圈
      </div>
    </div>
  </div>
);

export default ShareContent;