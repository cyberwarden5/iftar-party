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
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background">
      <div className="w-full max-w-md px-4 py-8 space-y-6">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          aria-label="Toggle theme"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {/* Header */}
        <div className="text-center animate-fade-in">
          <div className="mb-4 text-5xl">🌙</div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            BATCH-22
          </h1>
          <p className="text-base font-semibold text-muted-foreground">
            Iftar Party Manager
          </p>
          <p className="text-sm text-muted-foreground/80 mt-2">
            Ramadan 2025
          </p>
        </div>

        {/* Login Card */}
        <div className="card p-8 animate-slide-in">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Access Code Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">
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
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
                disabled={isLoading}
                autoFocus
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-medium animate-slide-in">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !code}
              className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-xs text-muted-foreground">
              © 2025 Aftab Kabir. All rights reserved.
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-info/10 border border-info/20 rounded-lg text-info/90 text-sm animate-fade-in">
          <p className="font-medium mb-1">Demo Access</p>
          <p className="text-xs">Use code: <code className="bg-info/20 px-2 py-1 rounded font-mono">AFTABx7766</code></p>
        </div>
      </div>
    </div>
  );
}
