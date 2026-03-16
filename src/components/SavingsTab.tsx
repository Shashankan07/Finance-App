import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ShieldCheck, Plane, Home, Car, Heart, X, Trash2, ArrowLeft, AlertCircle, TrendingUp } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';

const ICONS: Record<string, any> = {
  ShieldCheck,
  Plane,
  Home,
  Car,
  Heart,
};

export default function SavingsTab({ itemVariants, setActiveTab }: { itemVariants: any, setActiveTab?: (tab: string) => void }) {
  const { savings, transactions, addSaving, deleteSaving } = useFinanceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [icon, setIcon] = useState('ShieldCheck');
  const [color, setColor] = useState('#10b981');

  // Calculate balance
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Calculate savings totals
  const totalSaved = savings.reduce((sum, s) => sum + s.current, 0);
  const totalTarget = savings.reduce((sum, s) => sum + s.target, 0);
  const availableToSave = balance - totalSaved;
  const shortfallToTarget = totalTarget - balance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target) return;

    await addSaving({
      name,
      target: parseFloat(target),
      current: 0,
      icon,
      color,
    });

    setName('');
    setTarget('');
    setCurrent('');
    setIcon('ShieldCheck');
    setColor('#10b981');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
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
            <h2 className="text-3xl font-bold text-white tracking-tight">Savings</h2>
            <p className="text-zinc-400 mt-1">Manage your savings buckets</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#10b981] hover:bg-[#10b981]/90 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        >
          <Plus className="w-4 h-4" /> New Bucket
        </button>
      </motion.div>

      {/* Savings Overview & Sync Card */}
      <motion.div variants={itemVariants} className="bg-[#0f172a]/80 border border-white/5 rounded-[2rem] p-6 backdrop-blur-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div>
            <p className="text-zinc-400 text-sm font-medium mb-1">Current Balance</p>
            <p className="text-2xl font-bold text-white">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-zinc-400 text-sm font-medium mb-1">Total Savings Target</p>
            <p className="text-2xl font-bold text-[#10b981]">₹{totalTarget.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Sync Status / Alerts */}
        <div className="mt-6 pt-6 border-t border-white/10">
          {availableToSave < 0 ? (
            <div className="flex items-start gap-3 text-red-400 bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Balance is too low!</p>
                <p className="text-sm mt-1">
                  Your allocated savings (₹{totalSaved.toLocaleString('en-IN')}) exceed your current balance (₹{balance.toLocaleString('en-IN')}). 
                  You need <span className="font-bold">₹{Math.abs(availableToSave).toLocaleString('en-IN')}</span> more to fund your current savings.
                </p>
              </div>
            </div>
          ) : shortfallToTarget > 0 ? (
            <div className="flex items-start gap-3 text-amber-400 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
              <TrendingUp className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Keep growing your balance!</p>
                <p className="text-sm mt-1">
                  You have ₹{availableToSave.toLocaleString('en-IN')} available to allocate. 
                  You need <span className="font-bold">₹{shortfallToTarget.toLocaleString('en-IN')}</span> more in your total balance to reach all your savings goals.
                </p>
              </div>
            </div>
          ) : totalTarget > 0 && shortfallToTarget <= 0 ? (
            <div className="flex items-start gap-3 text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20 p-4 rounded-xl">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Goals Achievable!</p>
                <p className="text-sm mt-1">
                  Your current balance is sufficient to fully fund all your savings targets. Great job!
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {savings.length > 0 ? savings.map(saving => {
          const progress = balance > 0 ? Math.min((balance / saving.target) * 100, 100) : 0;
          const isCompleted = balance >= saving.target;
          const IconComponent = ICONS[saving.icon] || ShieldCheck;
          
          return (
            <motion.div key={saving.id} variants={itemVariants} className="bg-black/40 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <IconComponent className="w-24 h-24" style={{ color: saving.color }} />
              </div>
              <div className="flex items-center justify-between gap-4 mb-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `${saving.color}20`, borderColor: `${saving.color}40`, color: saving.color }}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{saving.name}</h3>
                    <p className="text-sm text-zinc-400">Target: ₹{saving.target.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteSaving(saving.id)}
                  className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-2 flex justify-between items-end relative z-10">
                <span className={`text-lg font-bold ${isCompleted ? 'text-[#10b981]' : 'text-zinc-400'}`}>
                  {isCompleted ? 'Goal Achievable' : 'Not Achievable Yet'}
                </span>
                <span className="text-sm font-medium" style={{ color: isCompleted ? '#10b981' : saving.color }}>
                  {progress.toFixed(1)}%
                </span>
              </div>
              
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
                <div 
                  className="h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${progress}%`, backgroundColor: isCompleted ? '#10b981' : saving.color }}
                />
              </div>
            </motion.div>
          );
        }) : (
          <div className="col-span-full text-center py-12 text-zinc-500">
            No savings buckets found. Create one to start saving!
          </div>
        )}
      </div>

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
                <h2 className="text-2xl font-bold text-white tracking-tight">New Savings Bucket</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 transition-all"
                    placeholder="e.g. Vacation"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Target Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">₹</span>
                      <input
                        type="number"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-8 pr-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 transition-all"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Icon</label>
                    <select
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 transition-all appearance-none"
                    >
                      {Object.keys(ICONS).map(iconName => (
                        <option key={iconName} value={iconName} className="bg-black text-white">{iconName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Color</label>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full h-[52px] bg-white/5 border border-white/10 rounded-xl p-1 cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold text-black bg-white hover:bg-zinc-200 transition-colors mt-8"
                >
                  Create Bucket
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
