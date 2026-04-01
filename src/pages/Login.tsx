import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { ShieldCheck, Zap, Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signInWithCredential, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { auth, googleProvider, microsoftProvider, appleProvider, twitterProvider, setupRecaptcha, db } from '../firebase';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import LoginBackground from '../components/LoginBackground';
import MoneyAnimation from '../components/MoneyAnimation';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, isAuthReady } = useAuthStore();
  const navigate = useNavigate();
  const cursorRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  
  // Mouse position for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Parallax transforms for the card
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);

  useEffect(() => {
    // Initialize Google Auth for Native Android/iOS
    if (Capacitor.isNativePlatform()) {
      GoogleAuth.initialize({
        clientId: 'YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com', // REPLACE THIS
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    }
  }, []);

  useEffect(() => {
    if (user) {
      // Trigger exit animation before navigating
      controls.start('exit').then(() => {
        navigate('/');
      });
    }
  }, [user, navigate, controls]);

  // Glowing cursor trail & parallax calculation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Cursor trail
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX - 150}px, ${e.clientY - 150}px, 0)`;
      }
      
      // Normalized mouse position for parallax (-0.5 to 0.5)
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Log the attempt
      try {
        await addDoc(collection(db, 'login_attempts'), {
          email,
          type: isSignUp ? 'signup' : 'login',
          timestamp: new Date().toISOString(),
          status: 'attempted'
        });
      } catch (logError) {
        console.error('Failed to log attempt:', logError);
        handleFirestoreError(logError, OperationType.CREATE, 'login_attempts');
      }

      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // onAuthStateChanged in App.tsx will handle the redirect
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-in is not enabled. Please enable it in the Firebase Console under Authentication -> Sign-in method, or use Google Sign-In.');
      } else {
        setError(err.message || 'Authentication failed');
      }
      setLoading(false);
      
      // Log the failure
      try {
        await addDoc(collection(db, 'login_attempts'), {
          email,
          type: isSignUp ? 'signup' : 'login',
          timestamp: new Date().toISOString(),
          status: 'failed',
          error: err.message
        });
      } catch (logError) {
        console.error('Failed to log error:', logError);
        handleFirestoreError(logError, OperationType.CREATE, 'login_attempts');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (Capacitor.isNativePlatform()) {
        // Native Android/iOS Google Login
        const googleUser = await GoogleAuth.signIn();
        const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
        await signInWithCredential(auth, credential);
      } else {
        // Web Google Login
        await signInWithPopup(auth, googleProvider);
      }
      
      // onAuthStateChanged in App.tsx will handle the redirect
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithPopup(auth, microsoftProvider);
    } catch (err: any) {
      setError(err.message || 'Microsoft sign-in failed');
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithPopup(auth, appleProvider);
    } catch (err: any) {
      setError(err.message || 'Apple sign-in failed');
      setLoading(false);
    }
  };

  const handleTwitterSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithPopup(auth, twitterProvider);
    } catch (err: any) {
      setError(err.message || 'X (Twitter) sign-in failed');
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setError('Please enter a phone number.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const appVerifier = setupRecaptcha('recaptcha-container');
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setShowOtpInput(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await confirmationResult.confirm(otp);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
      setLoading(false);
    }
  };

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 1, staggerChildren: 0.15 }
    },
    exit: {
      opacity: 0,
      scale: 1.1,
      filter: 'blur(10px)',
      transition: { duration: 0.8, ease: 'easeInOut' }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#00f0ff]/30 border-t-[#00f0ff] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate={controls}
      onViewportEnter={() => controls.start('visible')}
      variants={containerVariants}
      className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-[#00f0ff]/30"
      style={{ perspective: 1000 }}
    >
      {/* Deep Black Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,240,255,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.15),transparent_50%)] z-0" />
      
      {/* 3D Background Elements */}
      <LoginBackground mouseX={mouseX} mouseY={mouseY} />
      <MoneyAnimation />

      {/* Glowing Cursor Trail */}
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 w-[300px] h-[300px] bg-[#00f0ff]/20 rounded-full blur-[100px] pointer-events-none z-0 transition-transform duration-300 ease-out will-change-transform"
      />

      {/* Center Login Card - Glassmorphism with Parallax */}
      <motion.div 
        variants={itemVariants}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-br from-[#00f0ff]/30 to-[#10b981]/30 rounded-[2rem] blur-xl opacity-50 animate-pulse" style={{ transform: "translateZ(-20px)" }} />
        <div className="relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-10 shadow-[0_0_50px_rgba(0,240,255,0.05)] overflow-hidden" style={{ transform: "translateZ(0px)" }}>
          
          {/* Internal subtle glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/50 to-transparent" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#10b981]/50 to-transparent" />

          <motion.div variants={itemVariants} className="text-center mb-10" style={{ transform: "translateZ(30px)" }}>
            <div className="w-16 h-16 bg-gradient-to-br from-[#00f0ff]/20 to-[#10b981]/20 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
              <Zap size={32} className="text-[#00f0ff]" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Finance App</h1>
            <p className="text-zinc-400 font-medium">Next-generation financial clarity.</p>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm backdrop-blur-md"
              style={{ transform: "translateZ(20px)" }}
            >
              <p className="font-semibold mb-1">Authentication Error</p>
              <p>{error}</p>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="space-y-6" style={{ transform: "translateZ(40px)" }}>
            
            {/* Auth Method Toggle */}
            <motion.div variants={itemVariants} className="flex bg-white/5 p-1 rounded-xl border border-white/10 mb-6">
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  loginMethod === 'email' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  loginMethod === 'phone' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Phone
              </button>
            </motion.div>

            {/* Input Fields */}
            {loginMethod === 'email' ? (
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <motion.div variants={itemVariants} className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-zinc-500 group-focus-within:text-[#00f0ff] transition-colors" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 focus:bg-white/10 transition-all"
                    required
                  />
                </motion.div>
                
                <motion.div variants={itemVariants} className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-[#00f0ff] transition-colors" />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 focus:bg-white/10 transition-all"
                    required
                  />
                </motion.div>

                <motion.button 
                  variants={itemVariants}
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#00f0ff] to-[#10b981] text-black font-bold py-3.5 px-6 rounded-xl hover:opacity-90 transition-all overflow-hidden disabled:opacity-50"
                >
                  <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  <span className="relative z-10">{loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}</span>
                  {!loading && <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />}
                </motion.button>
              </form>
            ) : (
              <form onSubmit={showOtpInput ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                {!showOtpInput ? (
                  <motion.div variants={itemVariants} className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-zinc-500 group-focus-within:text-[#00f0ff] transition-colors">📞</span>
                    </div>
                    <input 
                      type="tel" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Phone number (e.g. +1234567890)" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 focus:bg-white/10 transition-all"
                      required
                    />
                  </motion.div>
                ) : (
                  <motion.div variants={itemVariants} className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-[#00f0ff] transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 focus:bg-white/10 transition-all"
                      required
                    />
                  </motion.div>
                )}

                <div id="recaptcha-container"></div>

                <motion.button 
                  variants={itemVariants}
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#00f0ff] to-[#10b981] text-black font-bold py-3.5 px-6 rounded-xl hover:opacity-90 transition-all overflow-hidden disabled:opacity-50"
                >
                  <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  <span className="relative z-10">{loading ? 'Processing...' : (showOtpInput ? 'Verify OTP' : 'Send OTP')}</span>
                  {!loading && <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />}
                </motion.button>
              </form>
            )}

            {loginMethod === 'email' && (
              <motion.div variants={itemVariants} className="text-center">
                <button 
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                  }}
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-zinc-500 text-sm">Or continue with</span>
              <div className="flex-grow border-t border-white/10"></div>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="group relative flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 py-3 px-4 rounded-xl font-medium text-sm text-white overflow-hidden"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={(e) => e.preventDefault()}
                className="group relative flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 py-3 px-4 rounded-xl font-medium text-sm text-white overflow-hidden"
              >
                <div className="flex items-center justify-center gap-2 group-hover:opacity-0 transition-opacity duration-300 absolute inset-0">
                  <svg className="w-5 h-5" viewBox="0 0 23 23">
                    <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                    <path fill="#f35325" d="M1 1h10v10H1z"/>
                    <path fill="#81bc06" d="M12 1h10v10H12z"/>
                    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                    <path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                  <span>Microsoft</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-red-500 font-bold animate-pulse">Coming Soon</span>
                </div>
              </button>

              <button
                type="button"
                onClick={(e) => e.preventDefault()}
                className="group relative flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 py-3 px-4 rounded-xl font-medium text-sm text-white overflow-hidden"
              >
                <div className="flex items-center justify-center gap-2 group-hover:opacity-0 transition-opacity duration-300 absolute inset-0">
                  <svg className="w-5 h-5" viewBox="0 0 384 512" fill="currentColor">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                  </svg>
                  <span>Apple</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-red-500 font-bold animate-pulse">Coming Soon</span>
                </div>
              </button>

              <button
                type="button"
                onClick={(e) => e.preventDefault()}
                className="group relative flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 py-3 px-4 rounded-xl font-medium text-sm text-white overflow-hidden"
              >
                <div className="flex items-center justify-center gap-2 group-hover:opacity-0 transition-opacity duration-300 absolute inset-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>X</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-red-500 font-bold animate-pulse">Coming Soon</span>
                </div>
              </button>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex items-start gap-3 text-xs text-zinc-500 bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
              <ShieldCheck size={18} className="text-[#10b981] shrink-0 mt-0.5" />
              <p>
                Bank-grade security. Your financial data is securely stored and encrypted.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

