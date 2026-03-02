/*
 * Design: Elite Dark Commerce — My Workspace Dashboard
 * Layout: Full-width dashboard with subscription cards + usage charts
 * Colors: #0D0E14 bg, #8B5CF6 primary, #161822 card
 * Typography: Sora headings + Inter body + JetBrains Mono for keys/numbers
 * Features:
 *   - Overview stats (total APIs, total spend, total calls)
 *   - Subscribed API cards with usage bars
 *   - Per-API usage chart (30-day sparkline via recharts)
 *   - API Key management (show/hide, copy)
 *   - Quick actions: Open Console, Manage Plan, Cancel
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  LayoutDashboard, Terminal, Key, BarChart3, Settings,
  Copy, Check, Eye, EyeOff, ExternalLink, Zap,
  TrendingUp, AlertCircle, ShoppingBag, ChevronRight,
  RefreshCw, Trash2, Star
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { useSubscription, type SubscribedApi } from '@/contexts/SubscriptionContext';

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyWorkspace({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'oklch(0.16 0.015 293)', border: '1px solid oklch(0.55 0.22 293 / 25%)' }}>
        <ShoppingBag className="w-9 h-9" style={{ color: 'oklch(0.65 0.18 293)' }} />
      </div>
      <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.94 0.005 265)' }}>
        No subscriptions yet
      </h2>
      <p className="text-sm max-w-xs mb-6" style={{ color: 'oklch(0.55 0.015 265)' }}>
        Browse the API Hub marketplace and subscribe to APIs to see them here with usage monitoring.
      </p>
      <button
        onClick={onBrowse}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
        style={{ background: 'oklch(0.55 0.22 293)', boxShadow: '0 0 20px oklch(0.55 0.22 293 / 30%)', fontFamily: 'Sora, sans-serif' }}>
        <Zap className="w-4 h-4" />
        Browse API Hub
      </button>
    </div>
  );
}

// ─── Overview Stats Bar ───────────────────────────────────────────────────────
function StatsBar({ subscriptions }: { subscriptions: SubscribedApi[] }) {
  const totalSpend = subscriptions.reduce((sum, s) => sum + s.planPrice, 0);
  const totalCallsThisMonth = subscriptions.reduce((sum, s) => sum + s.usageThisMonth, 0);
  const totalLimit = subscriptions.reduce((sum, s) => sum + (s.requestLimit > 0 ? s.requestLimit : 0), 0);
  const activeCount = subscriptions.filter(s => s.status === 'active').length;

  const stats = [
    {
      label: 'Active APIs',
      value: String(activeCount),
      sub: `of ${subscriptions.length} subscribed`,
      color: 'oklch(0.72 0.18 293)',
      icon: Zap,
    },
    {
      label: 'Monthly Spend',
      value: `$${totalSpend}`,
      sub: 'billed this cycle',
      color: 'oklch(0.72 0.18 80)',
      icon: TrendingUp,
    },
    {
      label: 'API Calls This Month',
      value: totalCallsThisMonth >= 1000
        ? `${(totalCallsThisMonth / 1000).toFixed(1)}k`
        : String(totalCallsThisMonth),
      sub: totalLimit > 0 ? `of ${(totalLimit / 1000).toFixed(0)}k limit` : 'unlimited',
      color: 'oklch(0.72 0.18 150)',
      icon: BarChart3,
    },
    {
      label: 'Renews',
      value: 'Mar 27',
      sub: 'next billing date',
      color: 'oklch(0.72 0.18 200)',
      icon: RefreshCw,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map(stat => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="rounded-xl p-4"
            style={{ background: 'oklch(0.148 0.013 265)', border: '1px solid oklch(1 0 0 / 8%)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: 'oklch(0.55 0.015 265)', fontFamily: 'Sora, sans-serif' }}>
                {stat.label}
              </span>
              <Icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
            </div>
            <p className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'oklch(0.45 0.012 265)' }}>{stat.sub}</p>
          </div>
        );
      })}
    </div>
  );
}

// ─── Custom Tooltip for Chart ─────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs"
      style={{ background: 'oklch(0.19 0.013 265)', border: '1px solid oklch(0.55 0.22 293 / 30%)', color: 'oklch(0.85 0.008 265)' }}>
      <p style={{ color: 'oklch(0.55 0.015 265)' }}>{label}</p>
      <p className="font-semibold" style={{ color: 'oklch(0.72 0.18 293)' }}>
        {payload[0].value.toLocaleString()} calls
      </p>
    </div>
  );
}

// ─── API Subscription Card ────────────────────────────────────────────────────
function SubscriptionCard({
  sub,
  onOpenConsole,
  onNavigateToDetail,
}: {
  sub: SubscribedApi;
  onOpenConsole: (sub: SubscribedApi) => void;
  onNavigateToDetail: (apiId: string) => void;
}) {
  const [keyVisible, setKeyVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const usagePercent = sub.requestLimit > 0
    ? Math.min((sub.usageThisMonth / sub.requestLimit) * 100, 100)
    : 0;

  const usageColor = usagePercent > 85
    ? 'oklch(0.7 0.18 25)'
    : usagePercent > 60
      ? 'oklch(0.78 0.18 80)'
      : 'oklch(0.72 0.18 293)';

  const handleCopyKey = () => {
    navigator.clipboard.writeText(sub.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maskedKey = sub.apiKey.slice(0, 14) + '••••••••••••';

  // Format chart data: show last 14 days for compact view, 30 for expanded
  const chartData = expanded ? sub.usageHistory : sub.usageHistory.slice(-14);
  const chartDataFormatted = chartData.map(d => ({
    date: d.date.slice(5), // MM-DD
    calls: d.calls,
  }));

  return (
    <div className="rounded-xl overflow-hidden transition-all"
      style={{
        background: 'oklch(0.148 0.013 265)',
        border: `1px solid ${sub.status === 'active' ? 'oklch(1 0 0 / 8%)' : 'oklch(0.7 0.18 25 / 30%)'}`,
      }}>
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0"
              style={{ background: 'oklch(0.19 0.013 265)', border: '1px solid oklch(1 0 0 / 10%)', padding: '6px' }}>
              <img src={sub.apiLogo} alt={sub.apiName}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML =
                    `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:oklch(0.72 0.18 293);font-family:Sora,sans-serif">${sub.apiName[0]}</div>`;
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.94 0.005 265)' }}>
                  {sub.apiName}
                </h3>
                <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full`}
                  style={sub.status === 'active'
                    ? { background: 'oklch(0.18 0.06 150)', color: 'oklch(0.72 0.18 150)' }
                    : { background: 'oklch(0.18 0.06 25)', color: 'oklch(0.7 0.18 25)' }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{ background: sub.status === 'active' ? 'oklch(0.72 0.18 150)' : 'oklch(0.7 0.18 25)' }} />
                  {sub.status === 'active' ? 'Active' : 'Suspended'}
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'oklch(0.55 0.015 265)' }}>
                {sub.planName} Plan · ${sub.planPrice}/month
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => onOpenConsole(sub)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'oklch(0.55 0.22 293)', fontFamily: 'Sora, sans-serif' }}>
              <Terminal className="w-3.5 h-3.5" />
              Console
            </button>
            <button
              onClick={() => onNavigateToDetail(sub.apiId)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/5"
              style={{ color: 'oklch(0.55 0.015 265)', border: '1px solid oklch(1 0 0 / 10%)' }}
              title="View API Detail">
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Usage Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium" style={{ color: 'oklch(0.55 0.015 265)', fontFamily: 'Sora, sans-serif' }}>
              API Calls This Month
            </span>
            <span className="text-xs font-mono" style={{ color: usageColor, fontFamily: 'JetBrains Mono, monospace' }}>
              {sub.usageThisMonth.toLocaleString()}
              {sub.requestLimit > 0 && ` / ${sub.requestLimit.toLocaleString()}`}
              {sub.requestLimit === -1 && ' (unlimited)'}
            </span>
          </div>
          {sub.requestLimit > 0 && (
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'oklch(0.22 0.013 265)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${usagePercent}%`, background: usageColor, boxShadow: `0 0 6px ${usageColor} / 40%` }}
              />
            </div>
          )}
          {sub.requestLimit > 0 && (
            <p className="text-xs mt-1" style={{ color: 'oklch(0.45 0.012 265)' }}>
              {usagePercent.toFixed(1)}% used · Renews {sub.renewsAt}
              {usagePercent > 85 && (
                <span className="ml-2 inline-flex items-center gap-1" style={{ color: 'oklch(0.7 0.18 25)' }}>
                  <AlertCircle className="w-3 h-3" />
                  Near limit
                </span>
              )}
            </p>
          )}
        </div>

        {/* API Key Row */}
        <div className="flex items-center gap-2 p-2.5 rounded-lg mb-3"
          style={{ background: 'oklch(0.13 0.011 265)', border: '1px solid oklch(1 0 0 / 8%)' }}>
          <Key className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'oklch(0.55 0.015 265)' }} />
          <code className="flex-1 text-xs truncate"
            style={{ color: 'oklch(0.72 0.18 293)', fontFamily: 'JetBrains Mono, monospace' }}>
            {keyVisible ? sub.apiKey : maskedKey}
          </code>
          <button
            onClick={() => setKeyVisible(!keyVisible)}
            className="w-6 h-6 flex items-center justify-center rounded transition-all hover:bg-white/5 flex-shrink-0"
            style={{ color: 'oklch(0.55 0.015 265)' }}>
            {keyVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleCopyKey}
            className="w-6 h-6 flex items-center justify-center rounded transition-all hover:bg-white/5 flex-shrink-0"
            style={{ color: copied ? 'oklch(0.72 0.18 150)' : 'oklch(0.55 0.015 265)' }}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Subscription meta */}
        <div className="flex items-center justify-between text-xs"
          style={{ color: 'oklch(0.45 0.012 265)' }}>
          <span>Subscribed {sub.subscribedAt}</span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 transition-colors hover:text-white"
            style={{ color: 'oklch(0.55 0.015 265)' }}>
            <BarChart3 className="w-3.5 h-3.5" />
            {expanded ? 'Hide chart' : 'View usage chart'}
            <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expandable Usage Chart */}
      {expanded && (
        <div className="px-5 pb-5" style={{ borderTop: '1px solid oklch(1 0 0 / 8%)' }}>
          <div className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'oklch(0.55 0.015 265)', fontFamily: 'Sora, sans-serif' }}>
                30-Day Usage History
              </h4>
              <span className="text-xs" style={{ color: 'oklch(0.45 0.012 265)' }}>
                Total: {sub.usageHistory.reduce((s, d) => s + d.calls, 0).toLocaleString()} calls
              </span>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={chartDataFormatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${sub.apiId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.22 293)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.55 0.22 293)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 5%)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9, fill: 'oklch(0.45 0.012 265)', fontFamily: 'JetBrains Mono, monospace' }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: 'oklch(0.45 0.012 265)', fontFamily: 'JetBrains Mono, monospace' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="calls"
                  stroke="oklch(0.65 0.22 293)"
                  strokeWidth={1.5}
                  fill={`url(#grad-${sub.apiId})`}
                  dot={false}
                  activeDot={{ r: 3, fill: 'oklch(0.72 0.18 293)', stroke: 'oklch(0.148 0.013 265)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Card Footer Actions */}
      <div className="px-5 pb-4 flex items-center gap-2"
        style={{ borderTop: '1px solid oklch(1 0 0 / 6%)', paddingTop: '12px' }}>
        <button
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-white/5"
          style={{ color: 'oklch(0.55 0.015 265)', border: '1px solid oklch(1 0 0 / 8%)' }}>
          <Settings className="w-3.5 h-3.5" />
          Manage Plan
        </button>
        <button
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-white/5"
          style={{ color: 'oklch(0.55 0.015 265)', border: '1px solid oklch(1 0 0 / 8%)' }}>
          <RefreshCw className="w-3.5 h-3.5" />
          Rotate Key
        </button>
        <button
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg ml-auto transition-all hover:bg-red-500/10"
          style={{ color: 'oklch(0.55 0.015 265)', border: '1px solid oklch(1 0 0 / 8%)' }}>
          <Trash2 className="w-3.5 h-3.5" />
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Console Overlay (reused from ApiDetailPage logic) ────────────────────────
function ConsoleOverlay({ sub, onClose }: { sub: SubscribedApi; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'oklch(0.108 0.012 265)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{ background: 'oklch(0.13 0.011 265)', borderBottom: '1px solid oklch(1 0 0 / 8%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onClose}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-white/5"
            style={{ color: 'oklch(0.65 0.015 265)' }}>
            ← Back to Workspace
          </button>
          <div className="flex items-center gap-2">
            <img src={sub.apiLogo} alt={sub.apiName} className="w-5 h-5 object-contain rounded"
              style={{ background: 'oklch(0.19 0.013 265)', padding: '2px' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span className="text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.9 0.005 265)' }}>
              {sub.apiName}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'oklch(0.18 0.06 150)', color: 'oklch(0.72 0.18 150)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'oklch(0.72 0.18 150)' }} />
            {sub.planName} · Active
          </span>
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'oklch(0.18 0.013 265)', color: 'oklch(0.55 0.015 265)', border: '1px solid oklch(1 0 0 / 8%)' }}>
            <Key className="w-3 h-3" />
            <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>{sub.apiKey.slice(0, 14)}…</code>
          </span>
        </div>
      </div>
      {/* Placeholder console body */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Terminal className="w-12 h-12 mx-auto mb-4" style={{ color: 'oklch(0.55 0.22 293)' }} />
          <p className="text-base font-semibold mb-1" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.9 0.005 265)' }}>
            API Console for {sub.apiName}
          </p>
          <p className="text-sm" style={{ color: 'oklch(0.55 0.015 265)' }}>
            The full testing interface would load here.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main WorkspacePage ───────────────────────────────────────────────────────
export default function WorkspacePage() {
  const [, navigate] = useLocation();
  const { subscriptions } = useSubscription();
  const [consoleTarget, setConsoleTarget] = useState<SubscribedApi | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'suspended'>('all');

  const filtered = subscriptions.filter(s => {
    if (activeFilter === 'all') return true;
    return s.status === activeFilter;
  });

  if (consoleTarget) {
    return <ConsoleOverlay sub={consoleTarget} onClose={() => setConsoleTarget(null)} />;
  }

  return (
    <div className="min-h-screen" style={{ background: 'oklch(0.108 0.012 265)' }}>
      {/* Page Header */}
      <div className="px-6 pt-8 pb-6" style={{ borderBottom: '1px solid oklch(1 0 0 / 6%)' }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard className="w-4 h-4" style={{ color: 'oklch(0.65 0.18 293)' }} />
              <span className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: 'oklch(0.65 0.18 293)', fontFamily: 'Sora, sans-serif' }}>
                My Workspace
              </span>
            </div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.96 0.005 265)' }}>
              Subscriptions
            </h1>
            <p className="text-sm mt-1" style={{ color: 'oklch(0.55 0.015 265)' }}>
              Manage your API subscriptions, monitor usage, and access API keys.
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
            style={{ background: 'oklch(0.55 0.22 293)', color: 'white', fontFamily: 'Sora, sans-serif' }}>
            <Zap className="w-4 h-4" />
            Browse APIs
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {subscriptions.length === 0 ? (
          <EmptyWorkspace onBrowse={() => navigate('/')} />
        ) : (
          <>
            {/* Stats Overview */}
            <StatsBar subscriptions={subscriptions} />

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 mb-5">
              {(['all', 'active', 'suspended'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
                  style={activeFilter === f ? {
                    background: 'oklch(0.55 0.22 293 / 15%)',
                    color: 'oklch(0.78 0.15 293)',
                    border: '1px solid oklch(0.55 0.22 293 / 25%)',
                    fontFamily: 'Sora, sans-serif'
                  } : {
                    color: 'oklch(0.55 0.015 265)',
                    border: '1px solid transparent',
                    fontFamily: 'Sora, sans-serif'
                  }}>
                  {f === 'all' ? `All (${subscriptions.length})` : f === 'active'
                    ? `Active (${subscriptions.filter(s => s.status === 'active').length})`
                    : `Suspended (${subscriptions.filter(s => s.status === 'suspended').length})`}
                </button>
              ))}
            </div>

            {/* Subscription Cards Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm" style={{ color: 'oklch(0.45 0.012 265)' }}>No subscriptions in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {filtered.map(sub => (
                  <SubscriptionCard
                    key={sub.apiId}
                    sub={sub}
                    onOpenConsole={setConsoleTarget}
                    onNavigateToDetail={(id) => navigate(`/api/${id}`)}
                  />
                ))}
              </div>
            )}

            {/* Recommendations */}
            <div className="mt-8 rounded-xl p-5"
              style={{ background: 'oklch(0.148 0.013 265)', border: '1px solid oklch(1 0 0 / 8%)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.9 0.005 265)' }}>
                  Recommended for You
                </h3>
                <button
                  onClick={() => navigate('/')}
                  className="text-xs flex items-center gap-1 transition-opacity hover:opacity-70"
                  style={{ color: 'oklch(0.65 0.18 293)' }}>
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { name: 'Google Gemini', category: 'AI & Machine Learning', price: '$49/mo', rating: 4.8,
                    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Google_Gemini_logo.svg/120px-Google_Gemini_logo.svg.png' },
                  { name: 'Slack API', category: 'Team Collaboration', price: '$29/mo', rating: 4.6,
                    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/120px-Slack_icon_2019.svg.png' },
                  { name: 'Stripe API', category: 'Payments', price: 'Free tier', rating: 4.9,
                    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/120px-Stripe_Logo%2C_revised_2016.svg.png' },
                ].map(rec => (
                  <button
                    key={rec.name}
                    onClick={() => navigate('/')}
                    className="flex items-center gap-3 p-3 rounded-lg text-left transition-all hover:bg-white/5"
                    style={{ border: '1px solid oklch(1 0 0 / 8%)' }}>
                    <div className="w-9 h-9 rounded-lg flex-shrink-0 overflow-hidden"
                      style={{ background: 'oklch(0.19 0.013 265)', padding: '5px' }}>
                      <img src={rec.logo} alt={rec.name} className="w-full h-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.9 0.005 265)' }}>
                        {rec.name}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'oklch(0.55 0.015 265)' }}>{rec.category}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold" style={{ color: 'oklch(0.72 0.18 293)' }}>{rec.price}</p>
                      <div className="flex items-center gap-0.5 justify-end mt-0.5">
                        <Star className="w-3 h-3 fill-current" style={{ color: 'oklch(0.82 0.18 80)' }} />
                        <span className="text-xs" style={{ color: 'oklch(0.62 0.015 265)' }}>{rec.rating}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
