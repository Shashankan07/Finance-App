import React, { useState } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  description?: string;
}

interface TransactionItemProps {
  tx: Transaction;
  onDelete: (id: string) => void;
  onCategorize?: (tx: Transaction) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ tx, onDelete, onCategorize }) => {
  const controls = useAnimation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    // Call onDelete immediately so it doesn't get blocked by animations
    onDelete(tx.id);
  };

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -100 || velocity < -500) {
      // Swipe left to delete
      handleDelete();
    } else {
      // Snap back
      controls.start({ x: 0, transition: { type: 'spring', bounce: 0.5 } });
    }
  };

  if (isDeleting) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl mb-3 bg-black/40 border border-white/5 group"
    >
      {/* Background actions */}
      <div className="absolute inset-0 flex items-center justify-end px-6 bg-red-500/20 rounded-2xl pointer-events-none">
        <div className="text-red-500 font-medium flex items-center gap-2 opacity-80">
          Delete <Trash2 className="w-5 h-5" />
        </div>
      </div>

      {/* Foreground card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="relative bg-[#0a0a0a] border border-white/5 flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-grab active:cursor-grabbing z-10"
      >
        <div className="flex items-center gap-5 pointer-events-none">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
            tx.type === 'income' ? 'bg-gradient-to-br from-[#10b981]/20 to-transparent border border-[#10b981]/20 text-[#10b981]' : 'bg-gradient-to-br from-red-500/20 to-transparent border border-red-500/20 text-red-400'
          }`}>
            {tx.type === 'income' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
          </div>
          <div>
            <p className="font-bold text-white text-lg group-hover:text-[#00f0ff] transition-colors">{tx.category}</p>
            <p className="text-sm text-zinc-500 font-medium">{tx.description || 'No description'} • {format(new Date(tx.date), 'MMM d, yyyy')}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`font-bold text-lg ${tx.type === 'income' ? 'text-[#10b981]' : 'text-white'} pointer-events-none`}>
            {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer"
            title="Delete transaction"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
