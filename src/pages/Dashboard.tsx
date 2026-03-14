import React, { useState, useEffect } from 'react';
import { motion, animate } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/financeStore';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { format } from 'date-fns';
import AddTransactionModal from '../components/AddTransactionModal';
import MoneyAnimation from '../components/MoneyAnimation';
import InvestmentsTab from '../components/InvestmentsTab';
import SavingsTab from '../components/SavingsTab';
import GoalsTab from '../components/GoalsTab';
import AdminTab from '../components/AdminTab';
import ProfileTab from '../components/ProfileTab';
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingUp, 
  PiggyBank, 
  Target, 
  LogOut,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Zap,
  Shield,
  User
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

function AnimatedCounter({ value, prefix = '' }: { value: number, prefix?: string }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 2,
      ease: "easeOut",
      onUpdate(val) {
        setCount(val);
      }
    });
    return () => controls.stop();
  }, [value]);

  return <span>{prefix}{count.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const { transactions, fetchTransactions, deleteTransaction, fetchSavings, fetchGoals, loading, error } = useFinanceStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchSavings();
    fetchGoals();
  }, [fetchTransactions, fetchSavings, fetchGoals]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAdmin = user?.email === 'invotrack25@gmail.com';

  // Calculate stats
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = totalIncome - totalExpense;

  // Prepare chart data
  const chartData = transactions.reduce((acc: any[], curr) => {
    const month = format(curr.date, 'MMM');
    const existing = acc.find(item => item.name === month);
    
    if (existing) {
      if (curr.type === 'income') existing.income += curr.amount;
      else existing.expenses += curr.amount;
    } else {
      acc.push({
        name: month,
        income: curr.type === 'income' ? curr.amount : 0,
        expenses: curr.type === 'expense' ? curr.amount : 0
      });
    }
    return acc;
  }, []).reverse();

  // Prepare category data
  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any[], curr) => {
      const existing = acc.find(item => item.name === curr.category);
      if (existing) {
        existing.amount += curr.amount;
      } else {
        const colors = ['#00f0ff', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899'];
        acc.push({
          name: curr.category,
          amount: curr.amount,
          color: colors[acc.length % colors.length]
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col font-sans selection:bg-[#00f0ff]/30 relative overflow-hidden">
      {/* Deep Black Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,240,255,0.05),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.05),transparent_50%)] z-0 pointer-events-none" />
      <MoneyAnimation />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10 pb-24">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-4 md:p-8 max-w-7xl mx-auto space-y-8"
        >
          
          {/* Header */}
          <motion.header variants={itemVariants} className="flex items-center justify-between">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-3xl font-bold tracking-tight text-white"
              >
                Welcome back, {user?.displayName?.split(' ')[0] || 'User'}
              </motion.h1>
              <p className="text-zinc-400 text-sm mt-1">Here is your financial summary for today.</p>
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="group relative bg-white text-black px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#00f0ff]/0 via-[#00f0ff]/20 to-[#00f0ff]/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <div className="absolute inset-0 rounded-xl ring-2 ring-[#00f0ff]/0 group-hover:ring-[#00f0ff]/50 transition-all duration-300 shadow-[0_0_0_rgba(0,240,255,0)] group-hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]" />
              <Plus className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Add Transaction</span>
            </button>
          </motion.header>

          {error && (
            <motion.div variants={itemVariants} className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm backdrop-blur-md">
              <p className="font-semibold">Error connecting to database:</p>
              <p>{error}</p>
            </motion.div>
          )}

          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                  variants={itemVariants}
                  className="bg-black/40 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl relative overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.03)]"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Wallet className="w-32 h-32 text-[#00f0ff]" />
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/30 to-transparent" />
                  <div className="relative z-10">
                    <p className="text-zinc-400 text-sm font-medium mb-2">Total Balance</p>
                    <h2 className="text-5xl font-bold tracking-tight text-white mb-4">
                      <AnimatedCounter value={balance} prefix="₹" />
                    </h2>
                    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#10b981] bg-[#10b981]/10 px-2.5 py-1 rounded-full border border-[#10b981]/20">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+2.4% this month</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  className="bg-black/40 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#10b981]/30 to-transparent" />
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-zinc-400 text-sm font-medium mb-2">Total Income</p>
                      <h2 className="text-3xl font-bold tracking-tight text-white">
                        <AnimatedCounter value={totalIncome} prefix="₹" />
                      </h2>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-[#10b981]/20 to-transparent border border-[#10b981]/20 text-[#10b981] rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      <ArrowUpRight className="w-6 h-6" />
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  className="bg-black/40 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-zinc-400 text-sm font-medium mb-2">Total Expenses</p>
                      <h2 className="text-3xl font-bold tracking-tight text-white">
                        <AnimatedCounter value={totalExpense} prefix="₹" />
                      </h2>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-transparent border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                      <ArrowDownRight className="w-6 h-6" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div 
                  variants={itemVariants}
                  className="lg:col-span-2 bg-black/40 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl"
                >
                  <h3 className="text-xl font-semibold mb-8 text-white">Cash Flow</h3>
                  <div className="h-[300px] w-full">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }}
                            itemStyle={{ color: '#e4e4e7' }}
                          />
                          <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                          <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-zinc-600 font-medium">
                        No data available yet
                      </div>
                    )}
                  </div>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  className="bg-black/40 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl flex flex-col"
                >
                  <h3 className="text-xl font-semibold mb-8 text-white">Top Categories</h3>
                  <div className="flex-1 min-h-[200px]">
                    {categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" hide />
                          <Tooltip 
                            cursor={{fill: 'rgba(255,255,255,0.02)'}}
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }}
                          />
                          <Bar dataKey="amount" radius={[0, 8, 8, 0]} barSize={32}>
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-zinc-600 font-medium">
                        No expenses yet
                      </div>
                    )}
                  </div>
                  {categoryData.length > 0 && (
                    <div className="mt-8 space-y-4">
                      {categoryData.map((cat, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: cat.color, color: cat.color }}></div>
                            <span className="text-zinc-300 font-medium">{cat.name}</span>
                          </div>
                          <span className="font-bold text-white">₹{cat.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Recent Transactions */}
              <motion.div 
                variants={itemVariants}
                className="bg-black/40 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-semibold text-white">Recent Transactions</h3>
                  <button 
                    onClick={() => setActiveTab('transactions')}
                    className="text-sm font-medium text-[#00f0ff] hover:text-[#00f0ff]/80 transition-colors"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-8 text-zinc-600 font-medium">Loading transactions...</div>
                  ) : transactions.length > 0 ? (
                    transactions.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer group">
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                            tx.type === 'income' ? 'bg-gradient-to-br from-[#10b981]/20 to-transparent border border-[#10b981]/20 text-[#10b981]' : 'bg-gradient-to-br from-red-500/20 to-transparent border border-red-500/20 text-red-400'
                          }`}>
                            {tx.type === 'income' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                          </div>
                          <div>
                            <p className="font-bold text-white text-lg group-hover:text-[#00f0ff] transition-colors">{tx.category}</p>
                            <p className="text-sm text-zinc-500 font-medium">{tx.description || 'No description'} • {format(tx.date, 'MMM d, yyyy')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={`font-bold text-lg ${tx.type === 'income' ? 'text-[#10b981]' : 'text-white'}`}>
                            {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTransaction(tx.id);
                            }}
                            className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-zinc-600 font-medium">
                      No transactions found. Add one to get started!
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}

          {activeTab === 'transactions' && (
            <motion.div 
              variants={itemVariants}
              className="bg-black/40 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-semibold text-white">All Transactions</h3>
              </div>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8 text-zinc-600 font-medium">Loading transactions...</div>
                ) : transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer group">
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                          tx.type === 'income' ? 'bg-gradient-to-br from-[#10b981]/20 to-transparent border border-[#10b981]/20 text-[#10b981]' : 'bg-gradient-to-br from-red-500/20 to-transparent border border-red-500/20 text-red-400'
                        }`}>
                          {tx.type === 'income' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg group-hover:text-[#00f0ff] transition-colors">{tx.category}</p>
                          <p className="text-sm text-zinc-500 font-medium">{tx.description || 'No description'} • {format(tx.date, 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`font-bold text-lg ${tx.type === 'income' ? 'text-[#10b981]' : 'text-white'}`}>
                          {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTransaction(tx.id);
                          }}
                          className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-zinc-600 font-medium">
                    No transactions found. Add one to get started!
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'investments' && <InvestmentsTab itemVariants={itemVariants} />}
          {activeTab === 'savings' && <SavingsTab itemVariants={itemVariants} />}
          {activeTab === 'goals' && <GoalsTab itemVariants={itemVariants} />}
          {activeTab === 'admin' && <AdminTab itemVariants={itemVariants} />}
          {activeTab === 'profile' && <ProfileTab itemVariants={itemVariants} />}

        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-transparent pointer-events-none">
        <nav className="max-w-md mx-auto bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-2 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.5)] pointer-events-auto">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'transactions', icon: CreditCard, label: 'Transactions' },
            { id: 'savings', icon: PiggyBank, label: 'Savings' },
            { id: 'goals', icon: Target, label: 'Goals' },
            ...(isAdmin ? [{ id: 'admin', icon: Shield, label: 'Admin' }] : []),
            { id: 'profile', icon: User, label: 'Profile' },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                  isActive ? 'text-[#00f0ff]' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute inset-0 bg-[#00f0ff]/10 rounded-2xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={`w-6 h-6 relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} />
                <span className={`text-[10px] font-medium relative z-10 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}
