import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { handleFirestoreError, OperationType } from './utils/firestoreErrorHandler';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthReady } = useAuthStore();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#00f0ff]/30 border-t-[#00f0ff] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

declare global {
  interface Window {
    deferredPrompt: any;
  }
}

export default function App() {
  const { setUser, setAuthReady } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      window.deferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)';
      document.documentElement.style.backgroundColor = '#fafafa';
      // Fix images and videos so they don't get inverted
      if (!document.getElementById('theme-style')) {
        const style = document.createElement('style');
        style.id = 'theme-style';
        style.innerHTML = `
          img, video, .recharts-surface {
            filter: invert(1) hue-rotate(180deg);
          }
        `;
        document.head.appendChild(style);
      }
    } else {
      document.documentElement.style.filter = 'none';
      document.documentElement.style.backgroundColor = '#050505';
      const style = document.getElementById('theme-style');
      if (style) style.remove();
    }
  }, [theme]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
        
        // Save user to Firestore so admin can see who signed up/in
        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'User',
            photoURL: firebaseUser.photoURL,
            lastLogin: new Date().toISOString(),
          }, { merge: true });
        } catch (error) {
          console.error('Error saving user to database:', error);
          handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
        }
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, [setUser, setAuthReady]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
