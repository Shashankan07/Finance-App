import React from 'react';
import { motion } from 'framer-motion';
import { useFinanceStore } from '../store/financeStore';
import { 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#00f0ff', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function AnalyticsTab({ itemVariants }: { itemVariants: any }) {
  const { transactions } = useFinanceStore();

  // Calculate expenses by category for Pie Chart
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: Record<string, number>, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

  const pieData = Object.entries(expensesByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Calculate cumulative wealth over time for Line Chart
  const wealthData = [...transactions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc: any[], curr) => {
      const date = format(new Date(curr.date), 'MMM dd');
      const lastBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
      const change = curr.type === 'income' ? curr.amount : -curr.amount;
      
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.balance += change;
      } else {
        acc.push({ date, balance: lastBalance + change });
      }
      return acc;
    }, []);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Analytics</h2>
          <p className="text-zinc-400 mt-1">Deep dive into your financial habits</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          {['This Month', 'Last 3 Months', 'This Year'].map((period, i) => (
            <button 
              key={period}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${i === 0 ? 'bg-[#00f0ff]/20 text-[#00f0ff]' : 'text-zinc-400 hover:text-white'}`}
            >
              {period}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category Pie Chart */}
        <motion.div 
          variants={itemVariants}
          className="bg-black/40 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="text-xl font-semibold mb-6 text-white relative z-10">Spending by Category</h3>
          <div className="h-[300px] w-full relative z-10">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    animationBegin={200}
                    animationDuration={1500}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ filter: `drop-shadow(0 0 8px ${COLORS[index % COLORS.length]}40)` }} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#e4e4e7', fontWeight: 'bold' }}
                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-600 font-medium">
                No expense data available
              </div>
            )}
          </div>
        </motion.div>

        {/* Wealth Growth Line Chart */}
        <motion.div 
          variants={itemVariants}
          className="bg-black/40 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="text-xl font-semibold mb-6 text-white relative z-10">Wealth Growth</h3>
          <div className="h-[300px] w-full relative z-10">
            {wealthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <LineChart data={wealthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis 
                    stroke="#71717a" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} 
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Balance']}
                    labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#000' }} 
                    activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                    animationDuration={2000}
                    style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.3))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-600 font-medium">
                No transaction data available
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
