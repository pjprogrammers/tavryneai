'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Loader2, Mail, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { firebaseUser, user, sendEmailVerification, reloadAndCheckVerification, authError, logout, loading } = useAuthStore();
  const [resent, setResent] = useState(false);
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login');
    }
  }, [firebaseUser, router, loading]);

  const handleResend = async () => {
    try {
      await sendEmailVerification();
      setResent(true);
      setTimeout(() => setResent(false), 3000);
    } catch {
      // error in authError state
    }
  };

  const handleCheckVerification = useCallback(async () => {
    setChecking(true);
    try {
      const result = await reloadAndCheckVerification();
      if (result.emailVerified) {
        setVerified(true);
        setTimeout(() => router.push('/dashboard'), 1500);
      }
    } catch {
      // error handled by store
    } finally {
      setChecking(false);
    }
  }, [reloadAndCheckVerification, router]);

  // Auto-poll every 5 seconds for the first 2 minutes
  useEffect(() => {
    if (!firebaseUser || firebaseUser.emailVerified) return;

    const interval = setInterval(async () => {
      try {
        const result = await reloadAndCheckVerification();
        if (result.emailVerified) {
          setVerified(true);
          clearInterval(interval);
          setTimeout(() => router.push('/dashboard'), 1500);
        }
      } catch {
        // ignore polling errors
      }
    }, 5000);

    const timeout = setTimeout(() => clearInterval(interval), 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [firebaseUser, reloadAndCheckVerification, router]);

  if (loading || !firebaseUser) return null;

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md animate-slide-up-lg">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl text-center">
            <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-7 w-7 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Email verified!</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Redirecting you to the dashboard...
            </p>
            <div className="flex justify-center">
              <Loader2 size={20} className="animate-spin text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-slide-up-lg">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/icon-32x32.png" alt="" className="h-8 w-8 rounded-lg" />
            <span className="text-lg font-semibold text-foreground">TavryneAI</span>
          </Link>

          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-7 w-7 text-primary" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Verify your email</h1>
          <p className="text-sm text-muted-foreground mb-2">
            We&apos;ve sent a verification email to <strong className="text-foreground">{user?.email || firebaseUser.email}</strong>.
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            Please check your inbox and click the link to activate your account.
          </p>

          {authError && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in flex items-center gap-2">
              <AlertCircle size={14} />
              {authError}
            </div>
          )}

          <div className="bg-secondary/50 rounded-lg p-4 mb-6 space-y-3">
            <Button
              onClick={handleCheckVerification}
              disabled={checking}
              className="w-full"
            >
              {checking ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw size={16} className="mr-2" />
                  I&apos;ve verified — check now
                </>
              )}
            </Button>

            <button
              onClick={handleResend}
              disabled={resent}
              className="w-full text-sm text-primary hover:text-primary/80 font-medium disabled:text-muted-foreground"
            >
              {resent ? 'Verification email sent!' : 'Resend verification email'}
            </button>
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            Auto-checks every 5 seconds for 2 minutes. You can also refresh this page later.
          </p>

          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" onClick={async () => { await logout(); router.push('/login'); }}>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
