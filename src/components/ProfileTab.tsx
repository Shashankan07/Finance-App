import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/financeStore';
import { useThemeStore } from '../store/themeStore';
import { Download, LogOut, User, Mail, ShieldCheck, CloudUpload, Moon, Sun, PiggyBank, Target, ShieldAlert } from 'lucide-react';
import { auth } from '../firebase';
import { signOut, GoogleAuthProvider, linkWithPopup, signInWithPopup } from 'firebase/auth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export default function ProfileTab({ itemVariants, setActiveTab }: { itemVariants: any, setActiveTab?: (tab: string) => void }) {
  const { user } = useAuthStore();
  const { transactions, savings, goals } = useFinanceStore();
  const { theme, toggleTheme } = useThemeStore();
  const [isUploading, setIsUploading] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleExportData = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Financial Report', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy')}`, 14, 30);
    doc.text(`User: ${user?.displayName || user?.email?.split('@')[0] || 'User'}`, 14, 36);

    // Transactions Table
    doc.setFontSize(14);
    doc.text('Transactions', 14, 46);
    
    const transactionData = transactions.map(t => [
      format(new Date(t.date), 'MMM dd, yyyy'),
      t.type.charAt(0).toUpperCase() + t.type.slice(1),
      t.category,
      t.description || '-',
      `Rs. ${t.amount.toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Date', 'Type', 'Category', 'Description', 'Amount']],
      body: transactionData,
      theme: 'grid',
      headStyles: { fillColor: [0, 240, 255], textColor: [0, 0, 0] },
    });

    // Savings Table
    const finalY = (doc as any).lastAutoTable.finalY || 50;
    doc.text('Savings', 14, finalY + 10);
    
    const savingsData = savings.map(s => [
      s.name,
      `Rs. ${s.current.toLocaleString()}`,
      `Rs. ${s.target.toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: finalY + 14,
      head: [['Name', 'Current Amount', 'Target Amount']],
      body: savingsData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
    });

    // Goals Table
    const finalY2 = (doc as any).lastAutoTable.finalY || finalY + 14;
    doc.text('Goals', 14, finalY2 + 10);
    
    const goalsData = goals.map(g => [
      g.title,
      `Rs. ${g.amount.toLocaleString()}`,
      format(new Date(g.deadline), 'MMM dd, yyyy'),
      `${g.progress}%`
    ]);

    autoTable(doc, {
      startY: finalY2 + 14,
      head: [['Title', 'Target Amount', 'Deadline', 'Progress']],
      body: goalsData,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255] },
    });

    doc.save(`finance_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const handleSaveToDrive = async () => {
    try {
      setIsUploading(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      
      provider.setCustomParameters({
        prompt: 'consent'
      });

      let result;
      try {
        if (auth.currentUser?.isAnonymous) {
          result = await linkWithPopup(auth.currentUser, provider);
        } else {
          result = await signInWithPopup(auth, provider);
        }
      } catch (linkError: any) {
        if (linkError.code === 'auth/credential-already-in-use') {
           result = await signInWithPopup(auth, provider);
        } else {
           throw linkError;
        }
      }

      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      if (!token) {
        throw new Error("Could not get Google Access Token.");
      }

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

      const fileContent = JSON.stringify(data, null, 2);
      const metadata = {
        name: `FinanceApp_Backup_${new Date().toISOString().split('T')[0]}.json`,
        mimeType: 'application/json',
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([fileContent], { type: 'application/json' }));

      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Failed to upload to Google Drive");
      }

      alert("Successfully saved backup to your Google Drive!");
    } catch (error: any) {
      console.error('Error saving to drive:', error);
      alert(`Error saving to Google Drive: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Profile</h2>
          <p className="text-zinc-400 mt-1">Manage your account and settings</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-black/40 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00f0ff]/20 to-[#10b981]/20 border-2 border-white/10 p-1 mb-4">
            <img 
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email}&background=0D8ABC&color=fff`} 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h3 className="text-2xl font-bold text-white">{user?.displayName || user?.email?.split('@')[0] || 'User'}</h3>
          <p className="text-zinc-400 flex items-center gap-2 mt-1">
            <Mail className="w-4 h-4" /> {user?.email}
          </p>
          {user?.email === 'invotrack25@gmail.com' && (
            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#00f0ff] bg-[#00f0ff]/10 px-3 py-1 rounded-full border border-[#00f0ff]/20 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Administrator
            </span>
          )}
        </div>

        <div className="space-y-4 relative z-10">
          {setActiveTab && (
            <>
              <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-between hover:bg-white/5 hover:border-white/10 transition-all group cursor-pointer" onClick={() => setActiveTab('savings')}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981]/20 to-transparent border border-[#10b981]/20 flex items-center justify-center">
                    <PiggyBank className="w-5 h-5 text-[#10b981]" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium group-hover:text-[#10b981] transition-colors">Savings Tracker</h4>
                    <p className="text-sm text-zinc-500 mt-1">Manage your savings buckets.</p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-between hover:bg-white/5 hover:border-white/10 transition-all group cursor-pointer" onClick={() => setActiveTab('goals')}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00f0ff]/20 to-transparent border border-[#00f0ff]/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-[#00f0ff]" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium group-hover:text-[#00f0ff] transition-colors">Financial Goals</h4>
                    <p className="text-sm text-zinc-500 mt-1">Track your long-term goals.</p>
                  </div>
                </div>
              </div>

              {user?.email === 'invotrack25@gmail.com' && (
                <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-between hover:bg-white/5 hover:border-white/10 transition-all group cursor-pointer" onClick={() => setActiveTab('admin')}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-transparent border border-purple-500/20 flex items-center justify-center">
                      <ShieldAlert className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium group-hover:text-purple-400 transition-colors">Admin Dashboard</h4>
                      <p className="text-sm text-zinc-500 mt-1">Manage users and system activity.</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-between hover:bg-white/5 hover:border-white/10 transition-all group">
            <div>
              <h4 className="text-white font-medium group-hover:text-[#00f0ff] transition-colors">Appearance</h4>
              <p className="text-sm text-zinc-500 mt-1">Switch between dark and light mode.</p>
            </div>
            <button 
              onClick={toggleTheme}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl transition-colors font-medium text-sm border border-white/10"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-between hover:bg-white/5 hover:border-white/10 transition-all group">
            <div>
              <h4 className="text-white font-medium group-hover:text-[#10b981] transition-colors">Export Your Data</h4>
              <p className="text-sm text-zinc-500 mt-1">Download a copy of your transactions, savings, and goals.</p>
            </div>
            <button 
              onClick={handleExportData}
              className="flex items-center gap-2 bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#10b981] px-4 py-2.5 rounded-xl transition-colors font-medium text-sm border border-[#10b981]/20"
            >
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-between hover:bg-white/5 hover:border-white/10 transition-all group">
            <div>
              <h4 className="text-white font-medium group-hover:text-blue-400 transition-colors">Save to Google Drive</h4>
              <p className="text-sm text-zinc-500 mt-1">Securely back up your data directly to your personal Google Drive.</p>
            </div>
            <button 
              onClick={handleSaveToDrive}
              disabled={isUploading}
              className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2.5 rounded-xl transition-colors font-medium text-sm border border-blue-500/20 disabled:opacity-50"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
              ) : (
                <CloudUpload className="w-4 h-4" />
              )}
              {isUploading ? 'Saving...' : 'Save to Drive'}
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-between hover:bg-white/5 hover:border-white/10 transition-all group">
            <div>
              <h4 className="text-white font-medium group-hover:text-red-400 transition-colors">Sign Out</h4>
              <p className="text-sm text-zinc-500 mt-1">Log out of your account on this device.</p>
            </div>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2.5 rounded-xl transition-colors font-medium text-sm border border-red-500/20"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
