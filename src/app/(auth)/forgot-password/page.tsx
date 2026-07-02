'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/store/useAuthStore';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { sendPasswordReset, authError, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch {
      // error is in authError state
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-slide-up-lg">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <img src="/icon-32x32.png" alt="" className="h-8 w-8 rounded-lg" />
              <span className="text-lg font-semibold text-foreground">TavryneAI</span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Forgot password?</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              No worries. We&apos;ll send you reset instructions.
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm animate-fade-in">{authError}</div>
          )}

          {sent ? (
            <div className="text-center animate-scale-in">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Check your email</h2>
              <p className="text-sm text-muted-foreground mb-6">
                We&apos;ve sent password reset instructions to {email}
              </p>
              <Button variant="outline" onClick={() => setSent(false)} className="w-full">
                Send again
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send reset instructions'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-primary hover:text-primary/80 font-medium">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
