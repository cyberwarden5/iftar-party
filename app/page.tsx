'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
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

    if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  if (!isMounted) return null;

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950' : 'bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50'} transition-colors duration-300 relative overflow-hidden`}>
      <style>{`
        @keyframes float-star {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.4; }
          50% { transform: translateY(-25px) rotate(180deg); opacity: 0.8; }
        }
        .floating-star {
          animation: float-star 5s ease-in-out infinite;
        }
        @keyframes swing {
          0%, 100% { transform: rotate(-4deg) translateX(-5px); }
          50% { transform: rotate(4deg) translateX(5px); }
        }
        .lantern {
          animation: swing 3s ease-in-out infinite;
        }
      `}</style>

      {/* Floating stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="floating-star absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.12}s`,
              fontSize: `${Math.random() * 10 + 12}px`,
            }}
          >
            ✨
          </div>
        ))}
      </div>

      {/* Lanterns decoration */}
      <div className="absolute top-12 left-12 text-5xl lantern">🏮</div>
      <div className="absolute top-24 right-16 text-4xl lantern" style={{ animationDelay: '1.5s' }}>
        🏮
      </div>
      <div className="absolute bottom-32 left-20 text-4xl lantern" style={{ animationDelay: '0.75s' }}>
        🏮
      </div>

      {/* Header with theme toggle */}
      <header className={`relative z-10 flex justify-between items-center px-6 py-4 md:px-12 md:py-6 ${isDark ? 'bg-amber-950/40' : 'bg-amber-50/40'} backdrop-blur border-b ${isDark ? 'border-amber-800/30' : 'border-amber-200/30'}`}>
        <div className="flex items-center gap-3">
          <div className="text-3xl">🌙</div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-amber-50' : 'text-amber-950'}`} style={{ fontFamily: 'Cormorant Garamond' }}>
            IFTAR PARTY MANAGER
          </h2>
        </div>

        <button
          onClick={toggleTheme}
          className={`p-3 rounded-full backdrop-blur border transition-all duration-300 ${isDark ? 'bg-amber-400/20 border-amber-400/30 hover:bg-amber-400/30' : 'bg-amber-600/20 border-amber-600/30 hover:bg-amber-600/30'}`}
          aria-label="Toggle theme"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12 md:px-12">
        <div className="w-full max-w-4xl">
          {/* Welcome Section */}
          <div className={`${isDark ? 'glass-effect bg-white/[0.07] border-amber-400/20' : 'glass-effect bg-white/[0.5] border-amber-600/20'} backdrop-blur-xl rounded-3xl p-8 md:p-16 text-center mb-12 shadow-2xl`}>
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="text-7xl animate-pulse">🌙</div>
                <div className="absolute -top-4 -right-4 text-3xl">⭐</div>
                <div className="absolute -bottom-4 -left-4 text-3xl">⭐</div>
              </div>
            </div>

            {/* Title */}
            <h1 className={`text-5xl md:text-6xl font-bold mb-4 ${isDark ? 'text-amber-50' : 'text-amber-950'}`} style={{ fontFamily: 'Cormorant Garamond' }}>
              BATCH-22
            </h1>
            <h2 className={`text-3xl md:text-4xl font-bold mb-2 ${isDark ? 'text-amber-200' : 'text-amber-800'}`} style={{ fontFamily: 'Cormorant Garamond' }}>
              IFTAR PARTY MANAGEMENT
            </h2>
            <p className={`text-lg md:text-xl mb-8 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
              🌙 25th Ramadan 1446 AH • Balakhal J.N High School 🌙
            </p>

            {/* Description */}
            <p className={`text-lg mb-8 max-w-2xl mx-auto ${isDark ? 'text-amber-100' : 'text-amber-900'}`}>
              Simplify your Iftar party planning with our comprehensive, professional management system. Track participants, manage products, and maintain complete financial oversight with ease.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className={`${isDark ? 'bg-amber-900/20 border-amber-600/30' : 'bg-amber-100/30 border-amber-600/20'} p-6 rounded-xl border backdrop-blur`}>
                <div className="text-4xl mb-3">👥</div>
                <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                  Participant Tracking
                </h3>
                <p className={`text-sm ${isDark ? 'text-amber-200/80' : 'text-amber-800/80'}`}>
                  Manage contributor details with payment methods and amounts
                </p>
              </div>

              <div className={`${isDark ? 'bg-amber-900/20 border-amber-600/30' : 'bg-amber-100/30 border-amber-600/20'} p-6 rounded-xl border backdrop-blur`}>
                <div className="text-4xl mb-3">📦</div>
                <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                  Product Management
                </h3>
                <p className={`text-sm ${isDark ? 'text-amber-200/80' : 'text-amber-800/80'}`}>
                  Customize items, prices, and quantities effortlessly
                </p>
              </div>

              <div className={`${isDark ? 'bg-amber-900/20 border-amber-600/30' : 'bg-amber-100/30 border-amber-600/20'} p-6 rounded-xl border backdrop-blur`}>
                <div className="text-4xl mb-3">💰</div>
                <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                  Financial Overview
                </h3>
                <p className={`text-sm ${isDark ? 'text-amber-200/80' : 'text-amber-800/80'}`}>
                  Real-time financial insights and PDF report generation
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <Link href="/login">
              <button className="ramadan-button px-8 py-4 text-lg font-bold rounded-xl hover:shadow-2xl hover:shadow-amber-400/50 transition-all duration-300 transform hover:scale-105">
                ✨ Get Started Now ✨
              </button>
            </Link>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className={`${isDark ? 'glass-effect bg-white/[0.05] border-amber-400/15' : 'glass-effect bg-white/[0.3] border-amber-600/15'} backdrop-blur rounded-2xl p-6 shadow-lg`}>
              <div className="text-3xl mb-3">🔐</div>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-amber-100' : 'text-amber-900'}`}>
                Secure Local Storage
              </h3>
              <p className={`${isDark ? 'text-amber-200/80' : 'text-amber-900/80'}`}>
                All data stored securely in your browser. No external servers, complete privacy.
              </p>
            </div>

            <div className={`${isDark ? 'glass-effect bg-white/[0.05] border-amber-400/15' : 'glass-effect bg-white/[0.3] border-amber-600/15'} backdrop-blur rounded-2xl p-6 shadow-lg`}>
              <div className="text-3xl mb-3">🎨</div>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-amber-100' : 'text-amber-900'}`}>
                Golden Ramadan Theme
              </h3>
              <p className={`${isDark ? 'text-amber-200/80' : 'text-amber-900/80'}`}>
                Beautiful dark and light modes with Islamic design elements and lantern decorations.
              </p>
            </div>

            <div className={`${isDark ? 'glass-effect bg-white/[0.05] border-amber-400/15' : 'glass-effect bg-white/[0.3] border-amber-600/15'} backdrop-blur rounded-2xl p-6 shadow-lg`}>
              <div className="text-3xl mb-3">⚙️</div>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-amber-100' : 'text-amber-900'}`}>
                Fully Customizable
              </h3>
              <p className={`${isDark ? 'text-amber-200/80' : 'text-amber-900/80'}`}>
                Customize quantities, prices, auth codes, and event details in settings.
              </p>
            </div>

            <div className={`${isDark ? 'glass-effect bg-white/[0.05] border-amber-400/15' : 'glass-effect bg-white/[0.3] border-amber-600/15'} backdrop-blur rounded-2xl p-6 shadow-lg`}>
              <div className="text-3xl mb-3">📄</div>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-amber-100' : 'text-amber-900'}`}>
                PDF Reports
              </h3>
              <p className={`${isDark ? 'text-amber-200/80' : 'text-amber-900/80'}`}>
                Generate professional Ramadan-themed PDF reports of all participants.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`relative z-10 text-center py-6 border-t ${isDark ? 'border-amber-800/30 bg-amber-950/40 text-amber-300' : 'border-amber-200/30 bg-amber-50/40 text-amber-700'}`}>
        <p className="text-sm">
          © {new Date().getFullYear()} Aftab Kabir. All rights reserved. 🙏
        </p>
        <p className="text-xs mt-2">
          Built with ❤️ for Ramadan 2025
        </p>
      </footer>
    </div>
  );
}
