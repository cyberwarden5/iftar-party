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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
      {/* Main content */}
      <div className="w-full max-w-md px-4 py-8">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
          aria-label="Toggle theme"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="mb-6 inline-block">
            <div className="text-6xl">🌙</div>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            BATCH-22
          </h1>
          <p className="text-lg font-semibold text-neutral-600 dark:text-neutral-300">
            Iftar Party Manager
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            Ramadan 2025
          </p>
        </div>

        {/* Login Card */}
        <div className="card p-8 shadow-md animate-slide-in">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Access Code Input */}
            <div>
              <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                Access Code
              </label>
              <input
                type="password"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError('');
                }}
                placeholder="Enter your access code"
                className="w-full px-4 py-2.5 rounded-8 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-colors"
                disabled={isLoading}
                autoFocus
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm font-medium animate-slide-in">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !code}
              className="w-full btn btn-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Authenticating...
                </>
              ) : (
                'Enter Dashboard'
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
              © 2025 Aftab Kabir. All rights reserved.
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300 animate-fade-in">
          <p className="font-medium mb-1">Demo Access</p>
          <p className="text-xs">Use code: <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded font-mono">AFTABx7766</code></p>
        </div>
      </div>
    </div>
  );
}
