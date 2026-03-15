import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ShieldAlert, Clock, Mail, Download, ArrowLeft } from 'lucide-react';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export default function AdminTab({ itemVariants, setActiveTab }: { itemVariants: any, setActiveTab?: (tab: string) => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Fetch users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersData);

        // Fetch login attempts
        const attemptsQuery = query(collection(db, 'login_attempts'), orderBy('timestamp', 'desc'), limit(50));
        const attemptsSnapshot = await getDocs(attemptsQuery);
        const attemptsData = attemptsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLoginAttempts(attemptsData);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        handleFirestoreError(error, OperationType.LIST, 'admin_data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).filter(key => key !== 'id').join(',');
    const rows = data.map(row => {
      return Object.keys(data[0])
        .filter(key => key !== 'id')
        .map(key => {
          let val = row[key];
          if (typeof val === 'string') {
            // Escape quotes and wrap in quotes
            val = `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(',');
    });
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          {setActiveTab && (
            <button 
              onClick={() => setActiveTab('profile')}
              className="p-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition-colors border border-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h2>
            <p className="text-zinc-400 mt-1">Manage users and system activity</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registered Users */}
        <motion.div variants={itemVariants} className="bg-black/40 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00f0ff]/20 to-transparent border border-[#00f0ff]/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#00f0ff]" />
              </div>
              <h3 className="text-xl font-semibold text-white">Registered Users</h3>
            </div>
            <button 
              onClick={() => downloadCSV(users, 'users.csv')}
              disabled={users.length === 0}
              className="p-2 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg transition-colors disabled:opacity-50 border border-white/10"
              title="Download CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
            {loading ? (
              <p className="text-zinc-500">Loading users...</p>
            ) : users.length > 0 ? (
              users.map(user => (
                <div key={user.id} className="flex items-center gap-4 p-4 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all">
                  <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=0D8ABC&color=fff`} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{user.displayName || 'Unknown User'}</p>
                    <p className="text-sm text-zinc-500 truncate">{user.email}</p>
                  </div>
                  <div className="text-right text-xs text-zinc-500">
                    <p>Last Login</p>
                    <p className="text-zinc-400 font-medium">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-IN') : 'N/A'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-500">No users found.</p>
            )}
          </div>
        </motion.div>

        {/* Login Attempts */}
        <motion.div variants={itemVariants} className="bg-black/40 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981]/20 to-transparent border border-[#10b981]/20 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-[#10b981]" />
              </div>
              <h3 className="text-xl font-semibold text-white">Recent Login Attempts</h3>
            </div>
            <button 
              onClick={() => downloadCSV(loginAttempts, 'login_attempts.csv')}
              disabled={loginAttempts.length === 0}
              className="p-2 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg transition-colors disabled:opacity-50 border border-white/10"
              title="Download CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
            {loading ? (
              <p className="text-zinc-500">Loading attempts...</p>
            ) : loginAttempts.length > 0 ? (
              loginAttempts.map(attempt => (
                <div key={attempt.id} className="flex flex-col gap-2 p-4 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-medium">
                      <Mail className="w-4 h-4 text-zinc-500" />
                      {attempt.email}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-md font-bold uppercase border ${
                      attempt.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                      attempt.status === 'attempted' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                      'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20'
                    }`}>
                      {attempt.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(attempt.timestamp).toLocaleString('en-IN')}
                    </span>
                    <span className="uppercase font-bold tracking-wider">{attempt.type}</span>
                  </div>
                  {attempt.error && (
                    <div className="mt-2 text-xs text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                      {attempt.error}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-zinc-500">No login attempts recorded.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
