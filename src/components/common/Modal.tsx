import { X, Heart } from 'lucide-react';
import type { ModalProps } from '@/types';

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white/90 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl p-6 animate-in fade-in zoom-in duration-300 border border-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
            {title}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-rose-50 rounded-full text-slate-400 hover:text-rose-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;