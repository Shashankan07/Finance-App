import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Activity, Coins, Gem, Briefcase } from 'lucide-react';
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="bg-black/40 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl">
          <p className="text-zinc-400 text-sm font-medium mb-2">Total Portfolio</p>
          <h2 className="text-4xl font-bold text-white mb-4">₹{totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h2>
          <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${averageChange >= 0 ? 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
            {averageChange >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{averageChange >= 0 ? '+' : ''}{averageChange.toFixed(2)}% Today</span>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="md:col-span-2 bg-black/40 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl">
          <h3 className="text-xl font-semibold mb-6 text-white">Live Performance</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} 
                  domain={['dataMin - 1000', 'dataMax + 1000']}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} 
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 'Value']}
                />
                <Area type="monotone" dataKey="value" stroke="#00f0ff" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="bg-black/40 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl">
        <h3 className="text-xl font-semibold mb-6 text-white">Live Market Assets</h3>
        <div className="space-y-4">
          {assets.map(asset => {
            const IconComponent = asset.icon;
            return (
              <div key={asset.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-zinc-300" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{asset.name}</p>
                    <p className="text-sm text-zinc-500">{asset.symbol} • {asset.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white transition-all duration-300">₹{asset.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className={`text-sm flex items-center justify-end gap-1 transition-all duration-300 ${asset.change >= 0 ? 'text-[#10b981]' : 'text-red-400'}`}>
                    {asset.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(asset.change).toFixed(2)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
