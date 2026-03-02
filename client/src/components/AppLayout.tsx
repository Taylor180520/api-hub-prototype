/*
 * Design: Elite Dark Commerce — Global App Layout with Sidebar
 * Matches the existing product sidebar: API Hub + My Workspace nav items
 * Colors: #0D0E14 bg, #8B5CF6 primary, sidebar slightly lighter
 * Typography: Sora headings + Inter body
 */

import { useLocation } from 'wouter';
import { Zap, LayoutDashboard, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
  /** Hide sidebar (used for full-screen views like API Console) */
  hideSidebar?: boolean;
}

const NAV_ITEMS = [
  {
    id: 'hub',
    label: 'API Hub',
    icon: Zap,
    path: '/',
  },
  {
    id: 'workspace',
    label: 'My Workspace',
    icon: LayoutDashboard,
    path: '/workspace',
  },
];

export default function AppLayout({ children, hideSidebar }: AppLayoutProps) {
  const [location, navigate] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (hideSidebar) {
    return <>{children}</>;
  }

  const isActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'oklch(0.108 0.012 265)' }}>
      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col flex-shrink-0 transition-all duration-300 relative"
        style={{
          width: collapsed ? '56px' : '176px',
          background: 'oklch(0.13 0.011 265)',
          borderRight: '1px solid oklch(1 0 0 / 8%)',
          zIndex: 40,
        }}>

        {/* Logo / Brand */}
        <div className="flex items-center gap-2.5 px-3 py-4"
          style={{ borderBottom: '1px solid oklch(1 0 0 / 6%)', minHeight: '56px' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'oklch(0.55 0.22 293)', boxShadow: '0 0 12px oklch(0.55 0.22 293 / 40%)' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-sm font-bold truncate"
              style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.94 0.005 265)' }}>
              API Hub
            </span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-3 px-2 space-y-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : undefined}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all group"
                style={{
                  background: active ? 'oklch(0.55 0.22 293 / 15%)' : 'transparent',
                  border: active ? '1px solid oklch(0.55 0.22 293 / 25%)' : '1px solid transparent',
                  color: active ? 'oklch(0.78 0.15 293)' : 'oklch(0.65 0.012 265)',
                }}>
                <Icon className="w-4 h-4 flex-shrink-0 transition-colors"
                  style={{ color: active ? 'oklch(0.72 0.18 293)' : 'oklch(0.55 0.015 265)' }} />
                {!collapsed && (
                  <span className="text-sm font-medium truncate"
                    style={{ fontFamily: 'Sora, sans-serif' }}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom: Feedback / Docs */}
        <div className="px-2 pb-3 space-y-1" style={{ borderTop: '1px solid oklch(1 0 0 / 6%)', paddingTop: '12px' }}>
          <button
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all"
            style={{ color: 'oklch(0.5 0.012 265)' }}
            title={collapsed ? 'Feedback' : undefined}>
            <MessageSquare className="w-4 h-4 flex-shrink-0" />
            {!collapsed && (
              <span className="text-xs truncate" style={{ fontFamily: 'Sora, sans-serif' }}>Feedback</span>
            )}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{
            background: 'oklch(0.22 0.018 293)',
            border: '1px solid oklch(0.55 0.22 293 / 30%)',
            color: 'oklch(0.72 0.18 293)',
            zIndex: 50,
          }}>
          {collapsed
            ? <ChevronRight className="w-3 h-3" />
            : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
