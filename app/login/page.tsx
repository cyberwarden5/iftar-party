'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { JsonDatabase } from '@/lib/json-db';

export default function LoginPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Initialize database
    JsonDatabase.initialize();
    
    setIsMounted(true);
    const theme = localStorage.getItem('theme') || 'dark';
    setIsDark(theme === 'dark');
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    JsonDatabase.updateSettings({ theme: newTheme as 'light' | 'dark' });

    if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (JsonDatabase.verifyAuthCode(code)) {
        localStorage.setItem('authenticated', 'true');
        
        // Set cookie for middleware verification
        document.cookie = 'iftar_auth=true; path=/; max-age=2592000'; // 30 days
        
        // Small delay to ensure cookie is set
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
      } else {
        setError('❌ Invalid access code. Please try again.');
      }
    } catch (err) {
      setError('⚠️ An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-950 via-amber-900 to-amber-900 relative overflow-hidden">
      <style>{`
        @keyframes float-star {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.4; }
          50% { transform: translateY(-25px) rotate(180deg); opacity: 0.8; }
        }
        .floating-star {
          animation: float-star 4s ease-in-out infinite;
        }
        @keyframes swing {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        .lantern {
          animation: swing 3s ease-in-out infinite;
        }
      `}</style>

      {/* Floating stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="floating-star absolute text-xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.15}s`,
            }}
          >
            ✨
          </div>
        ))}
      </div>

      {/* Lanterns decoration */}
      <div className="absolute top-8 left-8 text-4xl lantern">🏮</div>
      <div className="absolute bottom-8 right-8 text-4xl lantern" style={{ animationDelay: '1.5s' }}>
        🏮
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-3 rounded-full bg-amber-400/20 backdrop-blur hover:bg-amber-400/30 transition-all duration-300 border border-amber-400/30"
          aria-label="Toggle theme"
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="text-6xl animate-pulse">🌙</div>
              <div className="absolute top-0 right-0 text-2xl">⭐</div>
              <div className="absolute bottom-0 left-0 text-2xl">⭐</div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-amber-50 mb-2" style={{ fontFamily: 'Cormorant Garamond' }}>
            BATCH-22
          </h1>
          <p className="text-amber-200 text-lg font-semibold">IFTAR PARTY MANAGER</p>
          <p className="text-amber-300 text-sm mt-2">🌙 Ramadan 2025 🌙</p>
        </div>

        {/* Glass card */}
        <div className="glass-effect bg-white/[0.07] backdrop-blur-2xl border border-amber-400/20 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-amber-100 text-sm font-semibold mb-3">
                🔐 Enter Access Code
              </label>
              <input
                type="password"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError('');
                }}
                placeholder="✨ Enter your magical words sir"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-amber-300/40 text-amber-50 placeholder-amber-300/60 focus:outline-none focus:border-amber-300 focus:bg-white/20 transition duration-300"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-400/50 rounded-lg text-red-200 text-sm animate-pulse">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !code}
              className="w-full ramadan-button py-3 rounded-lg font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amber-400/50"
            >
              {isLoading ? '🕌 Authenticating...' : '✨ Enter Dashboard'}
            </button>
          </form>

          {/* Decorative divider */}
          <div className="mt-8 pt-6 border-t border-amber-300/30">
            <p className="text-center text-amber-200 text-xs">
              🎉 Blessed Month of Ramadan 🌙
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-amber-300 text-xs">
            © 2025 Aftab Kabir. All rights reserved. 🙏
          </p>
        </div>
      </div>
    </div>
  );
}
