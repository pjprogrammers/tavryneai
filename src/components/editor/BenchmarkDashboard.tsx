'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { PROVIDER_LABELS, PROVIDER_COLORS } from '@/lib/utils/constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ModelStat {
  provider: string;
  model: string;
  avgLatency: number;
  avgTokens: number;
  successRate: number;
  totalCalls: number;
  errorCount: number;
}

export function BenchmarkDashboard({ open, onOpenChange }: Props) {
  const [stats, setStats] = useState<ModelStat[]>([]);
  const [loading, setLoading] = useState(false);
  const idToken = useAuthStore((s) => s.idToken);

  useEffect(() => {
    if (!open || !idToken) return;
    setLoading(true);
    fetch('/api/admin/benchmarks', {
      headers: { Authorization: `Bearer ${idToken}` },
    })
      .then((r) => r.json())
      .then((data) => setStats(data.stats || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, idToken]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl bg-[#1e1e2e] border-[#313244] text-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Model Benchmark Dashboard</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#cba6f7]" />
          </div>
        ) : stats.length === 0 ? (
          <p className="text-[#a6adc8] text-sm text-center py-4">No benchmark data yet. Start generating to see stats.</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={stats.map((s) => ({
                  name: PROVIDER_LABELS[s.provider] || s.provider,
                  latency: Math.round(s.avgLatency),
                  success: Math.round(s.successRate * 100),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#313244" />
                  <XAxis dataKey="name" stroke="#a6adc8" fontSize={12} />
                  <YAxis stroke="#a6adc8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: '#1e1e2e', border: '1px solid #313244', borderRadius: '8px' }}
                    labelStyle={{ color: '#cdd6f4' }}
                  />
                  <Bar dataKey="latency" fill="#cba6f7" name="Avg Latency (ms)" />
                  <Bar dataKey="success" fill="#a6e3a1" name="Success Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid gap-2">
              {stats.map((s) => (
                <div
                  key={`${s.provider}-${s.model}`}
                  className="flex items-center justify-between px-3 py-2 bg-[#181825] border border-[#313244] rounded"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PROVIDER_COLORS[s.provider] || '#a6adc8' }} />
                    <span className="text-sm text-[#cdd6f4]">{PROVIDER_LABELS[s.provider] || s.provider}</span>
                    <span className="text-xs text-[#a6adc8]">{s.model}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-[#a6adc8]">
                    <span>{s.totalCalls} calls</span>
                    <span>{Math.round(s.avgLatency)}ms avg</span>
                    <span>{Math.round(s.successRate * 100)}% success</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
