import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/financeStore';
import { useThemeStore } from '../store/themeStore';
import { Download, LogOut, User, Mail, ShieldCheck, CloudUpload, Moon, Sun } from 'lucide-react';
import { auth } from '../firebase';
import { signOut, GoogleAuthProvider, linkWithPopup, signInWithPopup } from 'firebase/auth';

export default function ProfileTab({ itemVariants }: { itemVariants: any }) {
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
              <h4 className="text-white font-medium">Appearance</h4>
              <p className="text-sm text-zinc-400 mt-1">Switch between dark and light mode.</p>
            </div>
            <button 
              onClick={toggleTheme}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-colors font-medium text-sm"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>

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

          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between">
            <div>
              <h4 className="text-blue-400 font-medium">Save to Google Drive</h4>
              <p className="text-sm text-blue-400/70 mt-1">Securely back up your data directly to your personal Google Drive.</p>
            </div>
            <button 
              onClick={handleSaveToDrive}
              disabled={isUploading}
              className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-xl transition-colors font-medium text-sm disabled:opacity-50"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
              ) : (
                <CloudUpload className="w-4 h-4" />
              )}
              {isUploading ? 'Saving...' : 'Save to Drive'}
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
