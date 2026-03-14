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
  const wealthData = transactions
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
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Advanced Analytics</h2>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category Pie Chart */}
        <motion.div 
          variants={itemVariants}
          className="bg-black/40 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl"
        >
          <h3 className="text-xl font-semibold mb-6 text-white">Spending by Category</h3>
          <div className="h-[300px] w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }}
                    itemStyle={{ color: '#e4e4e7' }}
                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                  />
                  <Legend />
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
          className="bg-black/40 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl"
        >
          <h3 className="text-xl font-semibold mb-6 text-white">Wealth Growth</h3>
          <div className="h-[300px] w-full">
            {wealthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={wealthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }}
                    itemStyle={{ color: '#e4e4e7' }}
                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#00f0ff" 
                    strokeWidth={3} 
                    dot={{ fill: '#00f0ff', strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 6, fill: '#fff' }}
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
