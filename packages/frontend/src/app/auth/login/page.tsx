'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/store';
import { apiService } from '@/lib/api';
import { Zap, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const quotes = [
  {
    text: "The mock interviews and instant resume feedback helped me double my interview callback rate in just two weeks.",
    author: "David C., Frontend Engineer"
  },
  {
    text: "DevLaunch AI's coding practice environment gave me the exact confidence I needed to ace my technical screening.",
    author: "Sarah M., Full Stack Developer"
  },
  {
    text: "I finally have a centralized place to track my applications, prep for interviews, and monitor my GitHub growth.",
    author: "Alex J., Software Engineer"
  }
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiService.auth.login({ email, password });
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      let errorMessage = 'Login failed';
      if (err?.response?.data?.error) {
        const backendError = err.response.data.error;
        if (backendError.code === 'VALIDATION_ERROR' && backendError.details?.length > 0) {
          errorMessage = backendError.details[0].message;
        } else {
          errorMessage = backendError.message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background selection:bg-foreground selection:text-background">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 md:px-24 py-12">

        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm mx-auto space-y-8"
        >
          <div>
            <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
            </Link>
            <div className="h-10 w-10 bg-foreground rounded-lg flex items-center justify-center mb-6">
              <Zap className="h-6 w-6 text-background" />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Enter your credentials to access your workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold uppercase text-xs tracking-wider text-muted-foreground">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="h-12 border-border focus-visible:ring-foreground bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-semibold uppercase text-xs tracking-wider text-muted-foreground">Password</Label>
                <Link href="#" className="text-xs font-medium hover:underline">Forgot password?</Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="h-12 border-border focus-visible:ring-foreground bg-secondary/50"
              />
            </div>
            
            {error && <div className="p-3 text-sm text-background bg-foreground rounded-md font-medium">{error}</div>}
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-foreground/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
              <Button type="submit" className="relative w-full h-12 text-base font-bold bg-foreground text-background hover:bg-foreground/90 rounded-xl overflow-hidden transition-all" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In'}
                <div className="absolute inset-0 h-full w-full rounded-xl opacity-0 hover:opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent blur-md transition-opacity duration-500"></div>
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account? <Link href="/auth/register" className="font-bold text-foreground hover:underline">Create one</Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden md:flex flex-1 bg-foreground p-12 items-center justify-center relative overflow-hidden">
        <div className="relative z-10 max-w-lg h-48 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div 
              key={quoteIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <blockquote className="text-3xl font-medium leading-tight text-background mb-6 tracking-tight">
                "{quotes[quoteIndex].text}"
              </blockquote>
              <div className="text-background/70 font-medium">
                — {quotes[quoteIndex].author}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-background blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-background blur-3xl" />
        </div>
      </div>
    </div>
  );
}
