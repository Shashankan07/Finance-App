import React from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/financeStore';
import { Download, LogOut, User, Mail, ShieldCheck } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default function ProfileTab({ itemVariants }: { itemVariants: any }) {
  const { user } = useAuthStore();
  const { transactions, savings, goals } = useFinanceStore();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleExportData = () => {
    const data = {
      user: {
        displayName: user?.displayName,
        email: user?.email,
        uid: user?.uid,
      },
      transactions,
      savings,
      goals,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Profile & Settings</h2>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-black/40 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00f0ff]/20 to-[#10b981]/20 border-2 border-white/10 p-1 mb-4">
            <img 
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email}&background=0D8ABC&color=fff`} 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h3 className="text-2xl font-bold text-white">{user?.displayName || 'User'}</h3>
          <p className="text-zinc-400 flex items-center gap-2 mt-1">
            <Mail className="w-4 h-4" /> {user?.email}
          </p>
          {user?.email === 'invotrack25@gmail.com' && (
            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#00f0ff] bg-[#00f0ff]/10 px-3 py-1 rounded-full border border-[#00f0ff]/20 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Administrator
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Export Your Data</h4>
              <p className="text-sm text-zinc-400 mt-1">Download a copy of your transactions, savings, and goals.</p>
            </div>
            <button 
              onClick={handleExportData}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-colors font-medium text-sm"
            >
              <Download className="w-4 h-4" /> Export JSON
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center justify-between">
            <div>
              <h4 className="text-red-400 font-medium">Sign Out</h4>
              <p className="text-sm text-red-400/70 mt-1">Log out of your account on this device.</p>
            </div>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl transition-colors font-medium text-sm"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
