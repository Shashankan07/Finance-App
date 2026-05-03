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
      className="relative overflow-hidden rounded-2xl mb-3 group bg-[#020617]"
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
        whileHover={{ scale: 1.01, x: 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`relative flex items-center justify-between p-4 rounded-2xl transition-all cursor-grab active:cursor-grabbing z-10 shadow-[0_4px_16px_rgba(0,0,0,0.2)] group/inner border ${
          tx.type?.toLowerCase() === 'income'
            ? 'bg-[#020617] border-white/5 hover:border-[#10b981]/30 hover:bg-gradient-to-r hover:from-[#10b981]/10 hover:to-[#020617]'
            : 'bg-[#020617] border-white/5 hover:border-red-500/30 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-[#020617]'
        }`}
      >
        <div className="flex items-center gap-5 pointer-events-none">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-[inset_0_2px_10px_rgba(255,255,255,0.1)] transition-transform group-hover/inner:scale-105 duration-300 ${
            tx.type?.toLowerCase() === 'income' 
              ? 'bg-gradient-to-br from-[#10b981]/30 to-[#10b981]/5 border border-[#10b981]/30 text-[#10b981]' 
              : 'bg-gradient-to-br from-red-500/30 to-red-500/5 border border-red-500/30 text-red-500'
          }`}>
            {tx.type?.toLowerCase() === 'income' ? <ArrowUpRight className="w-6 h-6 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> : <ArrowDownRight className="w-6 h-6 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
          </div>
          <div>
            <p className="font-bold text-white text-lg tracking-wide group-hover/inner:text-[#00f0ff] transition-colors duration-300">{tx.category}</p>
            <p className="text-xs text-zinc-400 font-medium tracking-wide mt-1">{tx.description || 'No description'} <span className="opacity-50 mx-1">•</span> {format(new Date(tx.date), 'MMM d, yyyy')}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`font-bold text-lg font-mono tracking-widest ${tx.type?.toLowerCase() === 'income' ? 'text-[#10b981]' : 'text-red-500'} pointer-events-none drop-shadow-[0_0_12px_rgba(255,255,255,0.1)]`}>
            {tx.type?.toLowerCase() === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
