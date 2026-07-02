'use client';
import { useState, Suspense, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { ThemeColorSelector } from '@/components/settings/ThemeColorSelector';
import { PasswordStrength } from '@/components/auth/password-strength';
import { evaluatePassword } from '@/lib/utils/password-strength';
import { useUnsavedChangesGuard } from '@/lib/hooks/useUnsavedChangesGuard';

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'profile');

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
        </motion.div>

        <Tabs value={tab} onValueChange={setTab} className="mt-8">
          <TabsList className="w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>
          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>
          <TabsContent value="billing">
            <BillingSettings />
          </TabsContent>
          <TabsContent value="api-keys">
            <ApiKeysSettings />
          </TabsContent>
          <TabsContent value="theme">
            <ThemeSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ProfileSettings() {
  const { user, updateProfile, authError, clearError } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isDirty = displayName.trim() !== (user?.displayName || '').trim();
  useUnsavedChangesGuard(isDirty);

  const handleSave = async () => {
    clearError();
    setSaving(true);
    try {
      await updateProfile({ displayName });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // error in authError state
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar
              src={user?.avatarUrl || null}
              fallback={user?.displayName?.charAt(0)?.toUpperCase() || '?'}
              size="xl"
            />
            <AvatarUpload
              onUploadSuccess={() => {}}
              size="medium"
              showLabel
            />
          </div>

          {authError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
              {authError}
            </div>
          )}

          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                aria-describedby={isDirty ? 'profile-dirty' : undefined}
              />
              {isDirty && (
                <p id="profile-dirty" className="text-xs text-muted-foreground">
                  Unsaved changes
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Input id="provider" defaultValue={user?.provider || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan">Plan</Label>
              <Input id="plan" defaultValue={user?.planType || 'free'} disabled />
            </div>
          </div>
        </CardContent>
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          {isDirty && (
            <span className="text-xs text-amber-600 dark:text-amber-400">Unsaved changes</span>
          )}
          <Button onClick={handleSave} disabled={saving || !isDirty}>
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save changes'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function SecuritySettings() {
  const { user, updatePassword, authError, clearError } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isDirty = currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0;
  useUnsavedChangesGuard(isDirty);

  const isEmailProvider = user?.provider === 'email';
  const isGmailProvider = user?.provider === 'google.com';
  const isGithubProvider = user?.provider === 'github.com';
  const isSocialProvider = isGmailProvider || isGithubProvider;

  const evaluation = useMemo(
    () => evaluatePassword(newPassword, { name: user?.displayName, email: user?.email }),
    [newPassword, user?.displayName, user?.email]
  );

  const localValidation = useMemo(() => {
    if (!currentPassword) return { valid: false, error: null as string | null };
    if (!newPassword) return { valid: false, error: null as string | null };
    if (!confirmPassword) return { valid: false, error: null as string | null };
    if (!evaluation.isAcceptable) {
      return { valid: false, error: 'Your new password does not meet all the security rules.' };
    }
    if (newPassword !== confirmPassword) {
      return { valid: false, error: 'New password and confirmation do not match.' };
    }
    if (newPassword === currentPassword) {
      return { valid: false, error: 'Your new password must be different from your current password.' };
    }
    return { valid: true, error: null as string | null };
  }, [currentPassword, newPassword, confirmPassword, evaluation.isAcceptable]);

  const displayError = localError ?? localValidation.error;

  const handleUpdatePassword = useCallback(async () => {
    setLocalError(null);
    clearError();
    if (!localValidation.valid) {
      setLocalError(localValidation.error);
      return;
    }
    setSaving(true);
    try {
      await updatePassword(currentPassword, newPassword);
      setSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // authError from store is already set and rendered
    } finally {
      setSaving(false);
    }
  }, [currentPassword, newPassword, localValidation, updatePassword, clearError]);

  const isSubmitDisabled = saving || !localValidation.valid;

  if (isSocialProvider) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Update your password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You signed in with {isGmailProvider ? 'Google' : 'GitHub'}, so you don&apos;t have a password set on this account.
            </p>
            <p className="text-sm text-muted-foreground">
              To set a password, use the &quot;Forgot password&quot; flow on the sign-in page. We&apos;ll send a secure link to your email
              <span className="font-medium text-foreground"> {user?.email} </span>
              that lets you choose one.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Update your password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(authError || displayError) && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
              {authError || displayError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="current">Current password</Label>
            <div className="relative">
              <Input
                id="current"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                disabled={saving}
                className="pr-14"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((s) => !s)}
                disabled={saving}
                className="absolute inset-y-0 right-2 my-auto h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md transition-colors disabled:opacity-50"
                aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
              >
                {showCurrent ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new">New password</Label>
            <div className="relative">
              <Input
                id="new"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                disabled={saving}
                className="pr-14"
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                disabled={saving}
                className="absolute inset-y-0 right-2 my-auto h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md transition-colors disabled:opacity-50"
                aria-label={showNew ? 'Hide new password' : 'Show new password'}
              >
                {showNew ? 'Hide' : 'Show'}
              </button>
            </div>
            <PasswordStrength evaluation={evaluation} show={newPassword.length > 0} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm new password</Label>
            <div className="relative">
              <Input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={saving}
                className="pr-14"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                disabled={saving}
                className="absolute inset-y-0 right-2 my-auto h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md transition-colors disabled:opacity-50"
                aria-label={showConfirm ? 'Hide confirmation' : 'Show confirmation'}
              >
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
          </div>

          <Button onClick={handleUpdatePassword} disabled={isSubmitDisabled}>
            {saving ? 'Updating...' : saved ? 'Password updated!' : 'Update password'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function BillingSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>You are on the Free plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-secondary/50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Free</span>
              <Badge variant="default">Current</Badge>
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• 10,000 tokens per day</li>
              <li>• 5 active projects</li>
              <li>• All AI providers</li>
              <li>• Community support</li>
            </ul>
          </div>
          <Button>Upgrade to Pro</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No payment methods on file.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No billing history yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ApiKeysSettings() {
  const [keys, setKeys] = useState([
    { name: 'Production', key: 'tvryn_sk_prod_a1b2c3d4...', created: '2026-05-20' },
    { name: 'Development', key: 'tvryn_sk_dev_e5f6g7h8...', created: '2026-05-15' },
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>Manage API keys for programmatic access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {keys.map((k, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <p className="text-sm font-medium text-foreground">{k.name}</p>
                <code className="text-xs text-muted-foreground">{k.key}</code>
                <p className="text-[10px] text-muted-foreground mt-0.5">Created {k.created}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">Copy</Button>
                <Button variant="ghost" size="sm" className="text-destructive">Revoke</Button>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full">Generate new key</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ThemeSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how TavryneAI looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Dark mode</p>
              <p className="text-xs text-muted-foreground">Toggle between light and dark mode</p>
            </div>
            <ThemeToggle />
          </div>
          <Separator />
          <ThemeColorSelector />
          <Separator />
          <div className="space-y-2">
            <Label>Font size</Label>
            <div className="flex gap-2">
              {['Small', 'Medium', 'Large'].map((size) => (
                <Button key={size} variant="outline" size="sm" className="flex-1">
                  {size}
                </Button>
              ))}
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Reduced motion</p>
              <p className="text-xs text-muted-foreground">Disable animations</p>
            </div>
            <Switch checked={false} onCheckedChange={() => {}} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
