import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle2, Clock, X, Trash2, ArrowLeft } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';

export default function GoalsTab({ itemVariants, setActiveTab }: { itemVariants: any, setActiveTab?: (tab: string) => void }) {
  const { goals, addGoal, deleteGoal } = useFinanceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [progress, setProgress] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !deadline || !progress) return;

    const progressValue = parseFloat(progress);
    await addGoal({
      title,
      amount: parseFloat(amount),
      deadline,
      progress: progressValue,
      status: progressValue >= 100 ? 'completed' : 'in-progress',
    });

    setTitle('');
    setAmount('');
    setDeadline('');
    setProgress('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          {setActiveTab && (
            <button 
              onClick={() => setActiveTab('profile')}
              className="p-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition-colors border border-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Goals</h2>
            <p className="text-zinc-400 mt-1">Track your financial milestones</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#10b981] hover:bg-[#10b981]/90 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        >
          <Target className="w-4 h-4" /> Create Goal
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-black/40 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl">
        <div className="space-y-4">
          {goals.length > 0 ? goals.map(goal => (
            <div key={goal.id} className="p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors group relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {goal.status === 'completed' ? (
                    <CheckCircle2 className="w-6 h-6 text-[#10b981]" />
                  ) : (
                    <Target className="w-6 h-6 text-[#00f0ff]" />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white">{goal.title}</h3>
                    <p className="text-sm text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Target: {new Date(goal.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-white">₹{goal.amount.toLocaleString('en-IN')}</p>
                    <p className="text-sm text-zinc-500">{goal.status === 'completed' ? 'Achieved' : 'In Progress'}</p>
                  </div>
                  <button 
                    onClick={() => deleteGoal(goal.id)}
                    className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${goal.status === 'completed' ? 'bg-[#10b981]' : 'bg-[#00f0ff]'}`}
                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-zinc-300 w-10 text-right">{goal.progress}%</span>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 text-zinc-500">
              No goals found. Create one to start tracking!
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-black/80 border border-white/10 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(0,240,255,0.05)] relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-8 relative z-10">
                <h2 className="text-2xl font-bold text-white tracking-tight">New Financial Goal</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 transition-all"
                    placeholder="e.g. Buy a New Car"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Target Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">₹</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-8 pr-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 transition-all"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Deadline</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 transition-all [color-scheme:dark]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Current Progress (%)</label>
                    <input
                      type="number"
                      value={progress}
                      onChange={(e) => setProgress(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 transition-all"
                      placeholder="0"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold text-black bg-[#00f0ff] hover:bg-[#00f0ff]/90 transition-colors mt-8"
                >
                  Create Goal
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
