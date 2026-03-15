import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Activity, Coins, Gem, Briefcase, Plus, Search } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const INITIAL_ASSETS = [
  { id: 1, name: 'HDFC Midcap Opportunities', symbol: 'MUTUAL FUND', value: 45000, change: 2.5, type: 'Mutual Fund', icon: Briefcase },
  { id: 2, name: 'Digital Gold', symbol: 'GOLD', value: 125000, change: 1.2, type: 'Commodity', icon: Coins },
  { id: 3, name: 'Silver ETF', symbol: 'SILVER', value: 32000, change: 0.8, type: 'Commodity', icon: Gem },
  { id: 4, name: 'Nifty 50 Index Fund', symbol: 'INDEX', value: 85000, change: 1.5, type: 'Mutual Fund', icon: Activity },
];

export default function InvestmentsTab({ itemVariants }: { itemVariants: any }) {
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [chartData, setChartData] = useState([
    { name: '10:00', value: 285000 },
    { name: '10:05', value: 285500 },
    { name: '10:10', value: 286200 },
    { name: '10:15', value: 286000 },
    { name: '10:20', value: 286800 },
    { name: '10:25', value: 287000 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prevAssets => 
        prevAssets.map(asset => {
          // Simulate a small random growth (mostly positive)
          const growthFactor = 1 + (Math.random() * 0.002 - 0.0005);
          const newValue = asset.value * growthFactor;
          const newChange = asset.change + (Math.random() * 0.2 - 0.05);
          
          return {
            ...asset,
            value: newValue,
            change: parseFloat(newChange.toFixed(2))
          };
        })
      );

      setChartData(prevData => {
        const newData = [...prevData.slice(1)];
        const lastValue = newData[newData.length - 1].value;
        const nextValue = lastValue * (1 + (Math.random() * 0.002 - 0.0005));
        
        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        newData.push({ name: timeString, value: nextValue });
        return newData;
      });
    }, 3000); // Update every 3 seconds for a "live" feel

    return () => clearInterval(interval);
  }, []);

  const totalPortfolioValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const averageChange = assets.reduce((sum, asset) => sum + asset.change, 0) / assets.length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Investments</h2>
          <p className="text-zinc-400 mt-1">Track and manage your portfolio</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              className="bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00f0ff]/50 transition-colors w-full md:w-64"
            />
          </div>
          <button className="bg-[#10b981] hover:bg-[#10b981]/90 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Plus className="w-4 h-4" /> Add Asset
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="bg-black/40 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <p className="text-zinc-400 text-sm font-medium mb-2 relative z-10">Total Portfolio Value</p>
          <h2 className="text-4xl font-bold text-white mb-4 relative z-10">₹{totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h2>
          <div className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border relative z-10 ${averageChange >= 0 ? 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
            {averageChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{averageChange >= 0 ? '+' : ''}{averageChange.toFixed(2)}% All Time</span>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-4 relative z-10">
            <div>
              <p className="text-zinc-500 text-xs mb-1">Invested Amount</p>
              <p className="text-white font-medium">₹{(totalPortfolioValue * 0.85).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs mb-1">Total Returns</p>
              <p className="text-[#10b981] font-medium">+₹{(totalPortfolioValue * 0.15).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-black/40 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Portfolio Performance</h3>
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
              {['1D', '1W', '1M', '1Y', 'ALL'].map((period, i) => (
                <button 
                  key={period}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${i === 0 ? 'bg-[#00f0ff]/20 text-[#00f0ff]' : 'text-zinc-400 hover:text-white'}`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} 
                  domain={['dataMin - 1000', 'dataMax + 1000']}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} 
                  itemStyle={{ color: '#00f0ff', fontWeight: 'bold' }}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 'Value']}
                  labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#00f0ff" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  isAnimationActive={false} 
                  style={{ filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.3))' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="bg-black/40 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Your Assets</h3>
          <button className="text-sm font-medium text-[#00f0ff] hover:text-[#00f0ff]/80 transition-colors">
            View All
          </button>
        </div>
        <div className="space-y-3">
          <AnimatePresence>
            {assets.map(asset => {
              const IconComponent = asset.icon;
              return (
                <motion.div 
                  key={asset.id} 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-5 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-6 h-6 text-zinc-300 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg group-hover:text-[#00f0ff] transition-colors">{asset.name}</p>
                      <p className="text-sm text-zinc-500 font-medium">{asset.symbol} • {asset.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white text-lg transition-all duration-300">₹{asset.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className={`text-sm font-medium flex items-center justify-end gap-1 transition-all duration-300 ${asset.change >= 0 ? 'text-[#10b981]' : 'text-red-400'}`}>
                      {asset.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {Math.abs(asset.change).toFixed(2)}%
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
