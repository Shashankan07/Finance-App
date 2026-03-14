import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ShieldCheck, Plane, Home, Car, Heart, X, Trash2 } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';

const ICONS: Record<string, any> = {
  ShieldCheck,
  Plane,
  Home,
  Car,
  Heart,
};

export default function SavingsTab({ itemVariants }: { itemVariants: any }) {
  const { savings, addSaving, deleteSaving } = useFinanceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [icon, setIcon] = useState('ShieldCheck');
  const [color, setColor] = useState('#10b981');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target || !current) return;

    await addSaving({
      name,
      target: parseFloat(target),
      current: parseFloat(current),
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
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Savings Buckets</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors border border-white/10"
        >
          <Plus className="w-4 h-4" /> New Bucket
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {savings.length > 0 ? savings.map(saving => {
          const progress = Math.min((saving.current / saving.target) * 100, 100);
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
                <span className="text-3xl font-bold text-white">₹{saving.current.toLocaleString('en-IN')}</span>
                <span className="text-sm font-medium" style={{ color: saving.color }}>{progress.toFixed(1)}%</span>
              </div>
              
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
                <div 
                  className="h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${progress}%`, backgroundColor: saving.color }}
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

                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Current Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">₹</span>
                      <input
                        type="number"
                        value={current}
                        onChange={(e) => setCurrent(e.target.value)}
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
