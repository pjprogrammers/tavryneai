'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface Collaborator {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: 'owner' | 'editor' | 'viewer';
}

export default function CollaboratorsPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params?.projectId;
  const router = useRouter();
  const idToken = useAuthStore((s) => s.idToken);
  const user = useAuthStore((s) => s.user);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [inviteError, setInviteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!idToken || !projectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        headers: { Authorization: `Bearer ${idToken}` },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to load collaborators');
      const data = await res.json();
      setCollaborators(data.collaborators || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collaborators');
    } finally {
      setLoading(false);
    }
  }, [idToken, projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleInvite = async () => {
    if (!idToken || !projectId) return;
    if (!inviteEmail.trim()) {
      setInviteError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim())) {
      setInviteError('Please enter a valid email address');
      return;
    }
    setInviting(true);
    setInviteError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ email: inviteEmail.trim().toLowerCase(), role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to invite collaborator');
      }
      setInviteEmail('');
      await load();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to invite');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (uid: string) => {
    if (!idToken || !projectId) return;
    if (!confirm('Remove this collaborator?')) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators?uid=${encodeURIComponent(uid)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) await load();
    } catch {}
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
              aria-label="Go back"
            >
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Collaborators</h1>
              <p className="text-sm text-muted-foreground">Manage team access to this project</p>
            </div>
          </div>
        </motion.div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Invite people</CardTitle>
            <CardDescription>Invite collaborators to this project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {inviteError && (
              <div role="alert" className="p-2.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                {inviteError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
                aria-label="Collaborator email"
                disabled={inviting}
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                className="h-10 px-3 rounded-md border border-border bg-background text-sm"
                aria-label="Role"
                disabled={inviting}
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <Button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
                {inviting ? 'Inviting…' : 'Invite'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Invitations are sent to the email and the recipient will see the project the next time they sign in.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team members</CardTitle>
            <CardDescription>
              {loading ? 'Loading…' : `${collaborators.length} member${collaborators.length !== 1 ? 's' : ''}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div role="alert" className="p-2.5 mb-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}
            {!loading && collaborators.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No collaborators yet.</p>
            ) : (
              <ul className="space-y-3">
                {collaborators.map((c) => (
                  <li key={c.uid} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        src={c.avatarUrl}
                        fallback={c.displayName?.charAt(0)?.toUpperCase() || c.email.charAt(0).toUpperCase()}
                        alt={c.displayName || c.email}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {c.displayName || c.email}
                          {c.uid === user?.uid && <span className="text-muted-foreground font-normal"> (you)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={c.role === 'owner' ? 'default' : 'secondary'}>
                        {c.role === 'owner' ? 'Owner' : c.role.charAt(0).toUpperCase() + c.role.slice(1)}
                      </Badge>
                      {c.role !== 'owner' && c.uid !== user?.uid && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleRemove(c.uid)}
                          aria-label={`Remove ${c.displayName || c.email}`}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
