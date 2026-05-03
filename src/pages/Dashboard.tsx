import React, { useState, useEffect, useRef } from 'react';
import { motion, animate } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/financeStore';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { format } from 'date-fns';
import AddTransactionModal from '../components/AddTransactionModal';
import MoneyAnimation from '../components/MoneyAnimation';
import SavingsTab from '../components/SavingsTab';
import GoalsTab from '../components/GoalsTab';
import AdminTab from '../components/AdminTab';
import ProfileTab from '../components/ProfileTab';
import AnalyticsTab from '../components/AnalyticsTab';
import { TransactionItem } from '../components/TransactionItem';
import { useThemeStore } from '../store/themeStore';
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
  User,
  AlertCircle,
  Moon,
  Sun,
  BarChart2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

function AnimatedCounter({ value, prefix = '' }: { value: number, prefix?: string }) {
  const [count, setCount] = useState(0);
  const prevValue = useRef(0);
  
  useEffect(() => {
    const controls = animate(prevValue.current, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate(val) {
        setCount(val);
      }
    });
    prevValue.current = value;
    return () => controls.stop();
  }, [value]);

  return <span className="font-mono">{prefix}{count.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
}

export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.1] p-4 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
        <p className="text-zinc-400 text-xs mb-3 font-medium uppercase tracking-widest">{label}</p>
        <div className="space-y-2 relative z-10">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-4 justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" 
                  style={{ backgroundColor: entry.color, color: entry.color }}
                />
                <span className="text-zinc-300 text-sm font-medium capitalize">
                  {entry.name}
                </span>
              </div>
              <span className="text-white font-mono font-bold tracking-wider">
                ₹{Number(entry.value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const { transactions, fetchTransactions, deleteTransaction, fetchSavings, fetchGoals, fetchBudget, loading, error } = useFinanceStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchSavings();
    fetchGoals();
    fetchBudget();
  }, [fetchTransactions, fetchSavings, fetchGoals, fetchBudget]);

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

  // Calculate current month's income and expenses
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(currentMonth - 1);
  const lastMonth = lastMonthDate.getMonth();
  const lastMonthYear = lastMonthDate.getFullYear();

  const currentMonthIncome = transactions
    .filter(t => {
      const d = new Date(t.date);
      return t.type === 'income' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthExpenses = transactions
    .filter(t => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const lastMonthIncome = transactions
    .filter(t => {
      const d = new Date(t.date);
      return t.type === 'income' && d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const lastMonthExpenses = transactions
    .filter(t => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthBalance = currentMonthIncome - currentMonthExpenses;
  const lastMonthBalance = lastMonthIncome - lastMonthExpenses;

  let balancePercentageChange = 0;
  if (lastMonthBalance !== 0) {
    balancePercentageChange = ((currentMonthBalance - lastMonthBalance) / Math.abs(lastMonthBalance)) * 100;
  } else if (currentMonthBalance > 0) {
    balancePercentageChange = 100;
  } else if (currentMonthBalance < 0) {
    balancePercentageChange = -100;
  }

  const { budget, updateBudget } = useFinanceStore();
  const { theme, toggleTheme } = useThemeStore();
  const [isSettingBudget, setIsSettingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState(budget?.toString() || '');
  const chartScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartScrollRef.current) {
      // Small delay to ensure rendering is complete before scrolling
      setTimeout(() => {
        if (chartScrollRef.current) {
          chartScrollRef.current.scrollLeft = chartScrollRef.current.scrollWidth;
        }
      }, 100);
    }
  }, [transactions]);

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newBudget) {
      await updateBudget(Number(newBudget));
      setIsSettingBudget(false);
    }
  };

  const budgetProgress = budget ? Math.min((currentMonthExpenses / budget) * 100, 100) : 0;
  const isOverBudget = budget ? currentMonthExpenses > budget : false;
  const isNearBudget = budget ? currentMonthExpenses > budget * 0.8 && !isOverBudget : false;

  // Prepare chart data
  const chartData = transactions.reduce((acc: any[], curr) => {
    const day = format(new Date(curr.date), 'MMM dd');
    const existing = acc.find(item => item.name === day);
    
    if (existing) {
      if (curr.type === 'income') existing.income += curr.amount;
      else existing.expenses += curr.amount;
    } else {
      acc.push({
        name: day,
        income: curr.type === 'income' ? curr.amount : 0,
        expenses: curr.type === 'expense' ? curr.amount : 0,
        dateObj: new Date(curr.date)
      });
    }
    return acc;
  }, []).sort((a: any, b: any) => a.dateObj.getTime() - b.dateObj.getTime());

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
    hidden: { opacity: 0, filter: "blur(10px)" },
    visible: { 
      opacity: 1,
      filter: "blur(0px)",
      transition: { staggerChildren: 0.15, delayChildren: 0.1, duration: 0.6 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30, scale: 0.95, filter: "blur(5px)" },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-zinc-100 flex flex-col font-sans selection:bg-[#10b981]/30 relative overflow-hidden">
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
                className="text-3xl font-bold tracking-tight text-white flex items-center gap-3"
              >
                Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'User'}
                <span className="text-xs font-semibold bg-[#00f0ff]/10 text-[#00f0ff] px-2 py-1 rounded-full border border-[#00f0ff]/20">
                  v{__APP_VERSION__}
                </span>
              </motion.h1>
              <p className="text-zinc-400 text-sm mt-1">Here is your financial summary for today.</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </motion.header>

          {error && (
            <motion.div variants={itemVariants} className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm backdrop-blur-md">
              <p className="font-semibold">Error connecting to database:</p>
              <p>{error}</p>
            </motion.div>
          )}

          {/* Budget Alerts */}
          {budget && (isNearBudget || isOverBudget) && activeTab === 'dashboard' && (
            <motion.div 
              variants={itemVariants} 
              className={`p-4 rounded-xl text-sm backdrop-blur-md flex items-center gap-3 ${
                isOverBudget 
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                  : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
              }`}
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-semibold">
                  {isOverBudget ? 'Budget Exceeded!' : 'Approaching Budget Limit'}
                </p>
                <p>
                  You have spent ₹{currentMonthExpenses.toLocaleString()} of your ₹{budget.toLocaleString()} monthly budget.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div 
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-white/[0.02] border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl rounded-[2rem] p-8 relative overflow-hidden group hover:bg-white/[0.04] hover:shadow-[0_8px_32px_rgba(16,185,129,0.1)] transition-all duration-500"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                    <Wallet className="w-32 h-32 text-[#10b981]" />
                  </div>
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#10b981]/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <p className="text-zinc-400 text-sm font-medium mb-2">Total Balance</p>
                    <h2 className="text-5xl font-bold tracking-tight text-white mb-4">
                      <AnimatedCounter value={balance} prefix="₹" />
                    </h2>
                    <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${balancePercentageChange >= 0 ? 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                      {balancePercentageChange >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      <span>{balancePercentageChange >= 0 ? '+' : ''}{balancePercentageChange.toFixed(1)}% this month</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-white/[0.02] border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl rounded-[2rem] p-8 relative overflow-hidden group hover:bg-white/[0.04] hover:shadow-[0_8px_32px_rgba(16,185,129,0.1)] transition-all duration-500"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#10b981]/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
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
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-white/[0.02] border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl rounded-[2rem] p-8 relative overflow-hidden group hover:bg-white/[0.04] hover:shadow-[0_8px_32px_rgba(239,68,68,0.1)] transition-all duration-500"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
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

                {/* Budget Card */}
                <motion.div 
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-white/[0.02] border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl rounded-[2rem] p-8 relative overflow-hidden group hover:bg-white/[0.04] hover:shadow-[0_8px_32px_rgba(59,130,246,0.1)] transition-all duration-500"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3b82f6]/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-zinc-400 text-sm font-medium">Monthly Budget</p>
                        <button 
                          onClick={() => setIsSettingBudget(!isSettingBudget)}
                          className="text-xs text-[#00f0ff] hover:underline"
                        >
                          {budget ? 'Edit' : 'Set Budget'}
                        </button>
                      </div>
                      
                      {isSettingBudget ? (
                        <form onSubmit={handleBudgetSubmit} className="flex gap-2 mt-2">
                          <input 
                            type="number" 
                            value={newBudget}
                            onChange={(e) => setNewBudget(e.target.value)}
                            placeholder="Amount"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-[#00f0ff]/50"
                          />
                          <button type="submit" className="bg-[#00f0ff]/20 text-[#00f0ff] px-3 py-1 rounded-lg text-sm font-medium">
                            Save
                          </button>
                        </form>
                      ) : (
                        <>
                          <h2 className="text-3xl font-bold tracking-tight text-white">
                            {budget ? `₹${budget.toLocaleString()}` : 'Not set'}
                          </h2>
                          {budget && (
                            <div className="mt-4">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-zinc-400">Spent: ₹{currentMonthExpenses.toLocaleString()}</span>
                                <span className={isOverBudget ? 'text-red-400' : 'text-zinc-400'}>
                                  {budgetProgress.toFixed(0)}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${isOverBudget ? 'bg-red-500' : isNearBudget ? 'bg-amber-500' : 'bg-[#00f0ff]'}`}
                                  style={{ width: `${budgetProgress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div 
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="lg:col-span-2 bg-white/[0.02] border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl rounded-[2rem] p-8 group hover:bg-white/[0.04] transition-all duration-500"
                >
                  <h3 className="text-xl font-semibold mb-8 text-white">Cash Flow</h3>
                  <div className="flex h-[300px] w-full relative">
                    
                    {/* 1. Fixed Y-Axis on the Left (Stays completely still) */}
                    {chartData.length > 0 && (
                      <div className="w-[60px] md:w-[70px] h-full z-10 border-r border-white/[0.05] bg-[#020617]/50 backdrop-blur-xl flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            {/* Invisible X-axis to keep bottom spacing identical to the main chart */}
                            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fill: 'transparent'}} height={30} />
                            
                            <YAxis 
                              orientation="right" 
                              stroke="#71717a" 
                              fontSize={11} 
                              tickLine={false} 
                              axisLine={false} 
                              tickFormatter={(value) => {
                                if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
                                if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
                                return `₹${value}`;
                              }} 
                              domain={[0, 'auto']}
                              width={60}
                            />
                            
                            {/* Invisible areas to force the Y-axis to scale correctly */}
                            <Area type="monotone" dataKey="income" stroke="none" fill="none" isAnimationActive={false} />
                            <Area type="monotone" dataKey="expenses" stroke="none" fill="none" isAnimationActive={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* 2. Scrollable Graph Area (Moves left/right) */}
                    <div 
                      className="flex-1 h-full overflow-x-auto overflow-y-hidden hide-scrollbar touch-pan-x scroll-smooth" 
                      ref={chartScrollRef}
                    >
                      {chartData.length > 0 ? (
                        <div style={{ minWidth: `${Math.max(100, chartData.length * 60)}px`, height: '100%' }}>
                          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.6}/>
                                  <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6}/>
                                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                  <feGaussianBlur stdDeviation="4" result="blur" />
                                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                              </defs>
                              <CartesianGrid strokeDasharray="5 5" stroke="rgba(255,255,255,0.05)" vertical={false} />
                              <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} height={30} tickMargin={10} />
                              
                              {/* Y-Axis is hidden here so it doesn't scroll */}
                              <YAxis hide domain={[0, 'auto']} />
                              
                              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                              <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorIncome)" animationDuration={2000} filter="url(#glow)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981', filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.8))' }} />
                              <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorExpense)" animationDuration={2000} filter="url(#glow)" activeDot={{ r: 6, strokeWidth: 0, fill: '#ef4444', filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.8))' }} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-zinc-600 font-medium">
                          No data available yet
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-white/[0.02] border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl rounded-[2rem] p-8 flex flex-col group hover:bg-white/[0.04] transition-all duration-500"
                >
                  <h3 className="text-xl font-semibold mb-8 text-white">Top Categories</h3>
                  <div className="flex-1 min-h-[200px] flex items-center justify-center relative">
                    {categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <PieChart>
                          <Tooltip content={<CustomTooltip />} />
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="amount"
                            animationDuration={1500}
                            animationBegin={200}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color} 
                                stroke="rgba(0,0,0,0)" 
                                style={{ filter: `drop-shadow(0 0 12px ${entry.color}80)` }} 
                              />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-zinc-500 font-medium bg-white/[0.02] rounded-full w-40 h-40 border border-white/[0.05] shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]">
                        No expenses
                      </div>
                    )}
                  </div>
                  {categoryData.length > 0 && (
                    <div className="mt-8 space-y-4 max-h-[160px] overflow-y-auto hide-scrollbar pr-2">
                      {categoryData.map((cat, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          transition={{ delay: 0.1 * i, type: "spring" }} 
                          key={i} 
                          className="flex items-center justify-between text-sm p-3 rounded-xl hover:bg-white/[0.05] transition-colors border border-transparent hover:border-white/[0.05]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full shadow-[0_0_12px_currentColor]" style={{ backgroundColor: cat.color, color: cat.color }}></div>
                            <span className="text-zinc-300 font-medium">{cat.name}</span>
                          </div>
                          <span className="font-bold text-white tracking-widest font-mono">₹{cat.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Recent Transactions */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white/[0.02] border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl rounded-[2rem] p-8 group hover:bg-white/[0.04] transition-all duration-500"
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
                    <div className="text-center py-8 text-zinc-600 font-medium tracking-wide">Loading transactions...</div>
                  ) : transactions.length > 0 ? (
                    <motion.div 
                      initial="hidden" 
                      animate="visible" 
                      variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                      }}
                      className="space-y-3"
                    >
                      {transactions.slice(0, 5).map((tx) => (
                        <motion.div 
                          key={tx.id}
                          variants={{
                            hidden: { opacity: 0, x: -20 },
                            visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
                          }}
                        >
                          <TransactionItem 
                            tx={tx} 
                            onDelete={deleteTransaction} 
                            onCategorize={(tx) => console.log('Categorize', tx)} 
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="text-center py-12 text-zinc-500 font-medium bg-white/[0.02] rounded-3xl border border-white/[0.02] shadow-inner">
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
              className="bg-white/[0.02] border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl rounded-[2rem] p-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Transactions</h2>
                  <p className="text-zinc-400 mt-1">View and manage your transaction history</p>
                </div>
              </div>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8 text-zinc-600 font-medium tracking-wide">Loading transactions...</div>
                ) : transactions.length > 0 ? (
                  <motion.div 
                    initial="hidden" 
                    animate="visible" 
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.1
                        }
                      }
                    }}
                    className="space-y-3"
                  >
                    {transactions.map((tx) => (
                      <motion.div 
                        key={tx.id}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
                        }}
                      >
                        <TransactionItem 
                          tx={tx} 
                          onDelete={deleteTransaction} 
                          onCategorize={(tx) => console.log('Categorize', tx)} 
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="text-center py-12 text-zinc-500 font-medium bg-white/[0.02] rounded-3xl border border-white/[0.02] shadow-inner">
                    No transactions found. Add one to get started!
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'savings' && <SavingsTab itemVariants={itemVariants} setActiveTab={setActiveTab} />}
          {activeTab === 'goals' && <GoalsTab itemVariants={itemVariants} setActiveTab={setActiveTab} />}
          {activeTab === 'analytics' && <AnalyticsTab itemVariants={itemVariants} />}
          {activeTab === 'admin' && <AdminTab itemVariants={itemVariants} setActiveTab={setActiveTab} />}
          {activeTab === 'profile' && <ProfileTab itemVariants={itemVariants} setActiveTab={setActiveTab} />}

        </motion.div>
      </main>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-[#10b981] text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.8)] border border-[#10b981]/50 transition-shadow"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent pointer-events-none">
        <nav className="max-w-md mx-auto bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-3xl p-2 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.5)] pointer-events-auto overflow-x-auto hide-scrollbar">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'transactions', icon: CreditCard, label: 'Transactions' },
            { id: 'savings', icon: PiggyBank, label: 'Savings' },
            { id: 'goals', icon: Target, label: 'Goals' },
            { id: 'profile', icon: User, label: 'Profile' },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                  isActive ? 'text-[#10b981]' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute inset-0 bg-[#10b981]/10 rounded-2xl"
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
