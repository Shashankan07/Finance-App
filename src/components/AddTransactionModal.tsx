import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTransactionModal({ isOpen, onClose }: AddTransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  
  const { addTransaction, loading } = useFinanceStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;

    await addTransaction({
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: new Date().toISOString() as any,
    });

    setAmount('');
    setCategory('');
    setDescription('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-md bg-black/80 border border-white/10 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(0,240,255,0.05)] relative overflow-hidden"
          >
            {/* Subtle glow effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/50 to-transparent" />
            <div className={`absolute -inset-0.5 bg-gradient-to-br ${type === 'income' ? 'from-[#10b981]/20 to-transparent' : 'from-red-500/20 to-transparent'} rounded-[2rem] blur-xl opacity-50 pointer-events-none transition-colors duration-500`} />

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white tracking-tight">New Transaction</h2>
                <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      type === 'expense' ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      type === 'income' ? 'bg-[#10b981] text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Income
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-8 pr-4 text-white font-medium focus:outline-none focus:ring-2 transition-all ${type === 'income' ? 'focus:ring-[#10b981]/50' : 'focus:ring-red-500/50'}`}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white font-medium focus:outline-none focus:ring-2 transition-all ${type === 'income' ? 'focus:ring-[#10b981]/50' : 'focus:ring-red-500/50'}`}
                    placeholder="e.g. Groceries, Salary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Description (Optional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white font-medium focus:outline-none focus:ring-2 transition-all ${type === 'income' ? 'focus:ring-[#10b981]/50' : 'focus:ring-red-500/50'}`}
                    placeholder="Additional details"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full py-4 rounded-xl font-bold text-white transition-all overflow-hidden mt-8 ${
                    type === 'income' ? 'bg-[#10b981] hover:bg-[#059669]' : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  <span className="relative z-10">{loading ? 'Saving...' : 'Save Transaction'}</span>
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
