/*
 * Design: Elite Dark Commerce — API Product Detail Page
 * Layout: Two-column (70% main content + 30% sticky purchase panel)
 * Key UX:
 *   - UNPURCHASED: Browse freely, endpoints visible but locked for testing
 *   - PURCHASED: "Open API Console" banner appears, endpoints unlocked, panel shows subscription status
 * Colors: #0D0E14 bg, #8B5CF6 primary, #161822 card
 * Typography: Sora headings + Inter body + JetBrains Mono code
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft, Star, Users, Shield, Zap, Clock, Copy, Check,
  ChevronRight, ChevronDown, ExternalLink, Award, Lock, Terminal,
  PlayCircle, Key, BarChart3, Settings, ShoppingCart
} from 'lucide-react';
import { sharePointApi, type ApiEndpoint } from '@/lib/mockData';
import { useSubscription, generateUsageHistory } from '@/contexts/SubscriptionContext';

const DETAIL_BANNER = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663217980557/f7aHH7icVzRvWbZbt5LFt7/api-detail-banner-izgN5PYhHfiqdabQqjYXnY.webp';
const SUCCESS_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663217980557/f7aHH7icVzRvWbZbt5LFt7/api-success-illustration-VDcyyMPiqDHvqtHFWMhauP.webp';

type Tab = 'overview' | 'endpoints' | 'pricing';

// ─── HTTP Method Badge ───────────────────────────────────────────────────────
function MethodBadge({ method }: { method: ApiEndpoint['method'] }) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    GET: { bg: 'oklch(0.18 0.06 150)', color: 'oklch(0.72 0.18 150)', border: 'oklch(0.4 0.12 150 / 30%)' },
    POST: { bg: 'oklch(0.18 0.06 80)', color: 'oklch(0.78 0.18 80)', border: 'oklch(0.4 0.12 80 / 30%)' },
    PUT: { bg: 'oklch(0.18 0.06 260)', color: 'oklch(0.7 0.18 260)', border: 'oklch(0.4 0.12 260 / 30%)' },
    DELETE: { bg: 'oklch(0.18 0.06 25)', color: 'oklch(0.7 0.18 25)', border: 'oklch(0.4 0.12 25 / 30%)' },
    PATCH: { bg: 'oklch(0.18 0.06 200)', color: 'oklch(0.7 0.18 200)', border: 'oklch(0.4 0.12 200 / 30%)' },
  };
  const s = styles[method] || styles.GET;
  return (
    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded flex-shrink-0"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {method}
    </span>
  );
}

// ─── Endpoint Row (with purchase-gate) ──────────────────────────────────────
function EndpointRow({ endpoint, isPurchased, onPurchasePrompt }: {
  endpoint: ApiEndpoint;
  isPurchased: boolean;
  onPurchasePrompt: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRowClick = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="rounded-lg overflow-hidden transition-all"
      style={{ border: `1px solid ${isPurchased ? 'oklch(1 0 0 / 8%)' : 'oklch(1 0 0 / 6%)'}`, background: 'oklch(0.13 0.011 265)' }}>
      <button
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
        onClick={handleRowClick}>
        <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
          style={{ color: 'oklch(0.55 0.015 265)' }} />
        <MethodBadge method={endpoint.method} />
        <code className="text-sm flex-1 truncate" style={{ color: 'oklch(0.85 0.008 265)', fontFamily: 'JetBrains Mono, monospace' }}>
          {endpoint.path}
        </code>
        <span className="text-sm hidden sm:block" style={{ color: 'oklch(0.7 0.012 265)' }}>
          {endpoint.name}
        </span>
        {/* Purchase status indicator */}
        {isPurchased ? (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: 'oklch(0.18 0.06 150)', color: 'oklch(0.72 0.18 150)' }}>
            <PlayCircle className="w-3 h-3" />
            <span className="hidden sm:inline">Testable</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: 'oklch(0.18 0.013 265)', color: 'oklch(0.45 0.012 265)', border: '1px solid oklch(1 0 0 / 8%)' }}>
            <Lock className="w-3 h-3" />
          </span>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4"
          style={{ borderTop: '1px solid oklch(1 0 0 / 6%)' }}>
          <p className="text-sm pt-3" style={{ color: 'oklch(0.72 0.012 265)' }}>
            {endpoint.description}
          </p>

          {endpoint.params && endpoint.params.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'oklch(0.55 0.015 265)', fontFamily: 'Sora, sans-serif' }}>
                Parameters
              </h4>
              <div className="space-y-2">
                {endpoint.params.map(param => (
                  <div key={param.name} className="flex items-start gap-3 text-sm">
                    <code className="text-xs px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
                      style={{ background: 'oklch(0.18 0.013 265)', color: 'oklch(0.72 0.18 293)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {param.name}
                    </code>
                    <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
                      style={{ background: 'oklch(0.18 0.013 265)', color: 'oklch(0.62 0.015 265)' }}>
                      {param.type}
                    </span>
                    {param.required && (
                      <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
                        style={{ background: 'oklch(0.18 0.06 25)', color: 'oklch(0.7 0.18 25)' }}>
                        required
                      </span>
                    )}
                    <span style={{ color: 'oklch(0.65 0.012 265)' }}>{param.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {endpoint.responseExample && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'oklch(0.55 0.015 265)', fontFamily: 'Sora, sans-serif' }}>
                  Response Example
                </h4>
                <button
                  onClick={(e) => handleCopy(endpoint.responseExample!, e)}
                  className="flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-all"
                  style={{ color: 'oklch(0.62 0.015 265)', background: 'oklch(0.18 0.013 265)' }}>
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-3 text-xs overflow-x-auto rounded-lg"
                style={{ background: 'oklch(0.1 0.01 265)', color: 'oklch(0.78 0.012 265)', fontFamily: 'JetBrains Mono, monospace' }}>
                {endpoint.responseExample}
              </pre>
            </div>
          )}

          {/* Test Button — only shown when purchased */}
          {isPurchased ? (
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: 'oklch(0.22 0.018 293)',
                color: 'oklch(0.78 0.15 293)',
                border: '1px solid oklch(0.55 0.22 293 / 30%)',
                fontFamily: 'Sora, sans-serif'
              }}
              onClick={() => {/* navigate to console */}}>
              <Terminal className="w-4 h-4" />
              Test in API Console
            </button>
          ) : (
            /* Purchase gate overlay for testing */
            <div className="rounded-lg p-4 flex items-center gap-4"
              style={{ background: 'oklch(0.14 0.015 293 / 60%)', border: '1px dashed oklch(0.55 0.22 293 / 40%)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'oklch(0.22 0.018 293)' }}>
                <Lock className="w-4 h-4" style={{ color: 'oklch(0.65 0.18 293)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.85 0.008 265)' }}>
                  Purchase required to test
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'oklch(0.55 0.015 265)' }}>
                  Subscribe to send live requests and view real responses.
                </p>
              </div>
              <button
                onClick={onPurchasePrompt}
                className="text-xs px-3 py-1.5 rounded-lg font-semibold flex-shrink-0 transition-all hover:opacity-90"
                style={{ background: 'oklch(0.55 0.22 293)', color: 'white', fontFamily: 'Sora, sans-serif' }}>
                Subscribe
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Pricing Plan Card ───────────────────────────────────────────────────────
function PricingCard({ plan, onSubscribe }: { plan: any; onSubscribe: (plan: any) => void }) {
  return (
    <div className={`relative rounded-xl p-6 flex flex-col ${plan.recommended ? '' : ''}`}
      style={{
        background: plan.recommended ? 'oklch(0.16 0.015 293)' : 'oklch(0.148 0.013 265)',
        border: plan.recommended ? '1px solid oklch(0.55 0.22 293 / 50%)' : '1px solid oklch(1 0 0 / 8%)',
        boxShadow: plan.recommended ? '0 0 30px oklch(0.55 0.22 293 / 15%)' : 'none'
      }}>
      {plan.recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: 'oklch(0.55 0.22 293)', color: 'white', fontFamily: 'Sora, sans-serif' }}>
            <Award className="w-3 h-3" /> Most Popular
          </span>
        </div>
      )}
      <div className="mb-4">
        <h3 className="text-base font-bold mb-1" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.94 0.005 265)' }}>
          {plan.name}
        </h3>
        <div className="flex items-baseline gap-1">
          {plan.price === -1 ? (
            <span className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.94 0.005 265)' }}>Custom</span>
          ) : plan.price === 0 ? (
            <span className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.94 0.005 265)' }}>Free</span>
          ) : (
            <>
              <span className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.94 0.005 265)' }}>${plan.price}</span>
              <span className="text-sm" style={{ color: 'oklch(0.62 0.015 265)' }}>/month</span>
            </>
          )}
        </div>
        {plan.requestLimit > 0 && (
          <p className="text-xs mt-1" style={{ color: 'oklch(0.62 0.015 265)' }}>
            {plan.requestLimit.toLocaleString()} API calls / month
          </p>
        )}
        {plan.requestLimit === -1 && (
          <p className="text-xs mt-1" style={{ color: 'oklch(0.62 0.015 265)' }}>Unlimited API calls</p>
        )}
      </div>
      <ul className="space-y-2 flex-1 mb-5">
        {plan.features.map((feature: string, i: number) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 flex-shrink-0 mt-0.5"
              style={{ color: plan.recommended ? 'oklch(0.72 0.18 293)' : 'oklch(0.65 0.15 150)' }} />
            <span style={{ color: 'oklch(0.78 0.01 265)' }}>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={() => onSubscribe(plan)}
        className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
        style={plan.recommended ? {
          background: 'oklch(0.55 0.22 293)',
          color: 'white',
          boxShadow: '0 0 20px oklch(0.55 0.22 293 / 30%)',
          fontFamily: 'Sora, sans-serif'
        } : {
          background: 'oklch(0.22 0.018 293)',
          color: 'oklch(0.78 0.15 293)',
          border: '1px solid oklch(0.55 0.22 293 / 30%)',
          fontFamily: 'Sora, sans-serif'
        }}>
        {plan.ctaLabel}
      </button>
    </div>
  );
}

// ─── Review Card ─────────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: any }) {
  return (
    <div className="rounded-xl p-5" style={{ background: 'oklch(0.148 0.013 265)', border: '1px solid oklch(1 0 0 / 8%)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: 'oklch(0.22 0.018 293)', color: 'oklch(0.72 0.18 293)', fontFamily: 'Sora, sans-serif' }}>
            {review.avatar}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.9 0.005 265)' }}>
              {review.author}
            </p>
            <p className="text-xs" style={{ color: 'oklch(0.55 0.015 265)' }}>{review.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5"
              style={{
                color: i < review.rating ? 'oklch(0.82 0.18 80)' : 'oklch(0.3 0.01 265)',
                fill: i < review.rating ? 'oklch(0.82 0.18 80)' : 'transparent'
              }} />
          ))}
        </div>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.72 0.012 265)' }}>{review.content}</p>
      <div className="flex items-center gap-1.5 mt-3">
        <button className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-all hover:bg-white/5"
          style={{ color: 'oklch(0.55 0.015 265)' }}>
          👍 {review.helpful}
        </button>
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ api, onViewPricing }: { api: typeof sharePointApi; onViewPricing: () => void }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold mb-3" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.94 0.005 265)' }}>
          About this API
        </h2>
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'oklch(0.72 0.012 265)' }}>
          {api.description}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.72 0.012 265)' }}>
          Built on RESTful principles, it supports standard HTTP methods and returns JSON responses, making it easy to integrate with any modern application stack. The API is battle-tested in enterprise environments and supports OAuth 2.0 authentication for secure access.
        </p>
      </div>



      <div>
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.94 0.005 265)' }}>
          Common Use Cases
        </h2>
        <div className="space-y-3">
          {api.useCases.map((uc, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl"
              style={{ background: 'oklch(0.148 0.013 265)', border: '1px solid oklch(1 0 0 / 8%)' }}>
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: 'oklch(0.22 0.018 293)', color: 'oklch(0.72 0.18 293)', fontFamily: 'Sora, sans-serif' }}>
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold mb-0.5" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.9 0.005 265)' }}>
                  {uc.title}
                </p>
                <p className="text-xs" style={{ color: 'oklch(0.62 0.015 265)' }}>{uc.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-6 text-center"
        style={{ background: 'linear-gradient(135deg, oklch(0.16 0.02 293), oklch(0.14 0.015 265))', border: '1px solid oklch(0.55 0.22 293 / 25%)' }}>
        <h3 className="text-base font-bold mb-2" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.94 0.005 265)' }}>
          Ready to integrate?
        </h3>

        <button onClick={onViewPricing}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'oklch(0.55 0.22 293)', boxShadow: '0 0 20px oklch(0.55 0.22 293 / 30%)', fontFamily: 'Sora, sans-serif' }}>
          View Pricing
        </button>
      </div>
    </div>
  );
}

// ─── Endpoints Tab (with purchase-gate) ──────────────────────────────────────
function EndpointsTab({ endpoints, isPurchased, onPurchasePrompt }: {
  endpoints: ApiEndpoint[];
  isPurchased: boolean;
  onPurchasePrompt: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm" style={{ color: 'oklch(0.62 0.015 265)' }}>
          {endpoints.length} endpoints available.
          {isPurchased
            ? ' Click any endpoint to expand and test.'
            : ' Expand to view details. Purchase to send live requests.'}
        </p>
        {!isPurchased && (
          <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
            style={{ background: 'oklch(0.18 0.013 265)', color: 'oklch(0.55 0.015 265)', border: '1px solid oklch(1 0 0 / 10%)' }}>
            <Lock className="w-3 h-3" />
            Testing locked
          </span>
        )}
        {isPurchased && (
          <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
            style={{ background: 'oklch(0.18 0.06 150)', color: 'oklch(0.72 0.18 150)' }}>
            <PlayCircle className="w-3 h-3" />
            All endpoints unlocked
          </span>
        )}
      </div>
      <div className="space-y-2">
        {endpoints.map(endpoint => (
          <EndpointRow
            key={endpoint.id}
            endpoint={endpoint}
            isPurchased={isPurchased}
            onPurchasePrompt={onPurchasePrompt}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Pricing Tab (Matrix Table — matches platform template) ───────────────────
function PricingTab({ plans }: { plans: any[] }) {
  const sortedPlans = [...plans].filter(p => p.price >= 0).sort((a, b) => a.price - b.price);

  // Row definitions: label + per-plan value getter
  const rows: { label: string; tooltip?: string; getValue: (plan: any) => { text: string; isPrice?: boolean } }[] = [
    {
      label: 'Usage Quota',
      tooltip: 'Monthly API call limit',
      getValue: (p) => ({ text: p.requestLimit === -1 ? 'Unlimited' : p.requestLimit.toLocaleString() + ' calls/mo' }),
    },
    {
      label: 'Rate Limit',
      tooltip: 'Maximum requests per minute',
      getValue: (p) => ({ text: p.price === 0 ? '10 req/min' : p.price <= 29 ? '60 req/min' : p.price <= 99 ? '300 req/min' : 'Unlimited' }),
    },

  ];

  return (
    <div>
      <h2 className="text-lg font-bold mb-5" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.72 0.18 293)' }}>
        Pricing Information
      </h2>

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid oklch(1 0 0 / 10%)', background: 'oklch(0.13 0.011 265)' }}>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid oklch(1 0 0 / 10%)' }}>
              {/* Empty top-left cell */}
              <th style={{ width: '35%' }} />
              {/* Plan columns */}
              {sortedPlans.map((plan) => (
                <th key={plan.id} className="py-5 px-6 text-center" style={{ width: `${65 / sortedPlans.length}%`, borderLeft: '1px solid oklch(1 0 0 / 8%)' }}>
                  <p className="text-sm font-semibold mb-1" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.94 0.005 265)' }}>
                    {plan.name}
                  </p>
                  <p style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.72 0.18 293)' }}>
                    <span className="text-2xl font-bold">${plan.price === 0 ? '0.00' : plan.price.toFixed(2)}</span>
                    <span className="text-xs font-normal ml-1" style={{ color: 'oklch(0.55 0.015 265)' }}>/month</span>
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} style={{ borderTop: '1px solid oklch(1 0 0 / 8%)' }}>
                {/* Row label */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: 'oklch(0.78 0.01 265)' }}>{row.label}</span>
                    {row.tooltip && (
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs cursor-help flex-shrink-0"
                        title={row.tooltip}
                        style={{ background: 'oklch(0.22 0.013 265)', color: 'oklch(0.55 0.015 265)', border: '1px solid oklch(1 0 0 / 12%)' }}>
                        ?
                      </span>
                    )}
                  </div>
                </td>
                {/* Per-plan values */}
                {sortedPlans.map((plan) => {
                  const cell = row.getValue(plan);
                  return (
                    <td key={plan.id} className="py-4 px-6 text-center"
                      style={{ borderLeft: '1px solid oklch(1 0 0 / 8%)' }}>
                      <span className="text-sm" style={{
                        color: cell.isPrice ? 'oklch(0.72 0.18 293)' : 'oklch(0.78 0.01 265)',
                        fontFamily: cell.isPrice ? 'Sora, sans-serif' : undefined
                      }}>
                        {cell.text}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────────
function ReviewsTab({ reviews, rating, reviewCount }: { reviews: any[]; rating: number; reviewCount: number }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 p-5 rounded-xl"
        style={{ background: 'oklch(0.148 0.013 265)', border: '1px solid oklch(1 0 0 / 8%)' }}>
        <div className="text-center">
          <p className="text-5xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.94 0.005 265)' }}>
            {rating}
          </p>
          <div className="flex items-center gap-0.5 justify-center my-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4"
                style={{ color: i < Math.floor(rating) ? 'oklch(0.82 0.18 80)' : 'oklch(0.35 0.01 265)',
                  fill: i < Math.floor(rating) ? 'oklch(0.82 0.18 80)' : 'transparent' }} />
            ))}
          </div>
          <p className="text-xs" style={{ color: 'oklch(0.55 0.015 265)' }}>{reviewCount} reviews</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map(stars => (
            <div key={stars} className="flex items-center gap-2">
              <span className="text-xs w-3 text-right" style={{ color: 'oklch(0.55 0.015 265)' }}>{stars}</span>
              <Star className="w-3 h-3 fill-current" style={{ color: 'oklch(0.82 0.18 80)' }} />
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'oklch(0.22 0.013 265)' }}>
                <div className="h-full rounded-full"
                  style={{
                    background: 'oklch(0.82 0.18 80)',
                    width: stars === 5 ? '65%' : stars === 4 ? '25%' : stars === 3 ? '7%' : '2%'
                  }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}

// ─── Sticky Purchase Panel (unpurchased state) ────────────────────────────────
function PurchasePanel({ api, onSubscribe }: {
  api: typeof sharePointApi;
  onSubscribe: (plan: any) => void;
  onViewPricing?: () => void;
}) {
  // Default to the lowest-priced plan (first plan, typically Free)
  const sortedPlans = [...api.plans].filter(p => p.price >= 0).sort((a, b) => a.price - b.price);
  const [selectedPlanId, setSelectedPlanId] = useState(sortedPlans[0]?.id ?? '');
  const selectedPlan = api.plans.find(p => p.id === selectedPlanId) ?? sortedPlans[0];

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ border: '1px solid oklch(1 0 0 / 12%)', background: 'oklch(0.148 0.013 265)' }}>

      {/* Top: API icon + selected plan price */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-3" style={{ borderBottom: '1px solid oklch(1 0 0 / 8%)' }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{ background: 'oklch(0.22 0.013 265)', border: '1px solid oklch(1 0 0 / 10%)' }}>
          <img src={api.logo} alt={api.name} className="w-8 h-8 object-contain" />
        </div>
        <div>
          <span className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.72 0.18 293)' }}>
            {selectedPlan?.price === 0 ? '$0.00' : `$${selectedPlan?.price?.toFixed(2)}`}
          </span>
          <span className="text-sm ml-1" style={{ color: 'oklch(0.55 0.015 265)' }}>/month</span>
        </div>
      </div>

      {/* Package Version selector */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid oklch(1 0 0 / 8%)' }}>
        <p className="text-xs font-semibold mb-3" style={{ color: 'oklch(0.65 0.015 265)', fontFamily: 'Sora, sans-serif' }}>
          Package Version:
        </p>
        <div className="flex flex-col gap-2">
          {sortedPlans.map((plan) => {
            const isSelected = plan.id === selectedPlanId;
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-left transition-all"
                style={isSelected ? {
                  background: 'oklch(0.55 0.22 293)',
                  color: 'white',
                  fontFamily: 'Sora, sans-serif'
                } : {
                  background: 'oklch(0.13 0.011 265)',
                  color: 'oklch(0.72 0.012 265)',
                  border: '1px solid oklch(1 0 0 / 10%)',
                  fontFamily: 'Sora, sans-serif'
                }}>
                {plan.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Buy Now + Add to Cart */}
      <div className="px-5 py-4 flex gap-2">
        <button
          onClick={() => onSubscribe(selectedPlan)}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            background: 'oklch(0.55 0.22 293)',
            fontFamily: 'Sora, sans-serif'
          }}>
          Buy Now
        </button>
        <button
          onClick={() => onSubscribe(selectedPlan)}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all hover:bg-white/5 active:scale-[0.98]"
          style={{
            background: 'oklch(0.13 0.011 265)',
            color: 'oklch(0.88 0.005 265)',
            border: '1px solid oklch(1 0 0 / 15%)',
            fontFamily: 'Sora, sans-serif'
          }}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

// ─── Sticky Subscription Panel (purchased state) ──────────────────────────────
function SubscriptionPanel({ api, plan, apiKey, onOpenConsole }: {
  api: typeof sharePointApi;
  plan: any;
  apiKey: string;
  onOpenConsole: () => void;
}) {
  const [keyCopied, setKeyCopied] = useState(false);
  const maskedKey = apiKey.slice(0, 12) + '••••••••';

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ border: '1px solid oklch(0.65 0.15 150 / 40%)', background: 'oklch(0.148 0.013 265)' }}>
      {/* Active badge */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid oklch(1 0 0 / 8%)' }}>
        <div>
          <span className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: 'oklch(0.72 0.18 150)', fontFamily: 'Sora, sans-serif' }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'oklch(0.72 0.18 150)', boxShadow: '0 0 6px oklch(0.72 0.18 150)' }} />
            Active Subscription
          </span>
          <p className="text-sm font-bold mt-0.5" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.94 0.005 265)' }}>
            {plan.name} Plan
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.94 0.005 265)' }}>
            ${plan.price}
          </p>
          <p className="text-xs" style={{ color: 'oklch(0.55 0.015 265)' }}>/month</p>
        </div>
      </div>

      {/* API Key */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid oklch(1 0 0 / 8%)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: 'oklch(0.55 0.015 265)', fontFamily: 'Sora, sans-serif' }}>
          Your API Key
        </p>
        <div className="flex items-center gap-2 p-2.5 rounded-lg"
          style={{ background: 'oklch(0.13 0.011 265)', border: '1px solid oklch(1 0 0 / 8%)' }}>
          <Key className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'oklch(0.55 0.015 265)' }} />
          <code className="flex-1 text-xs truncate"
            style={{ color: 'oklch(0.72 0.18 293)', fontFamily: 'JetBrains Mono, monospace' }}>
            {maskedKey}
          </code>
          <button onClick={handleCopyKey}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-all flex-shrink-0"
            style={{ background: 'oklch(0.22 0.018 293)', color: 'oklch(0.72 0.18 293)' }}>
            {keyCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {keyCopied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Usage stats */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid oklch(1 0 0 / 8%)' }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'oklch(0.55 0.015 265)', fontFamily: 'Sora, sans-serif' }}>
            This Month's Usage
          </p>
          <span className="text-xs" style={{ color: 'oklch(0.55 0.015 265)' }}>12,450 / 500,000</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'oklch(0.22 0.013 265)' }}>
          <div className="h-full rounded-full" style={{ background: 'oklch(0.55 0.22 293)', width: '2.5%' }} />
        </div>
        <p className="text-xs mt-1" style={{ color: 'oklch(0.45 0.012 265)' }}>2.5% used · Renews March 27</p>
      </div>

      {/* Actions */}
      <div className="p-5 space-y-2.5">
        {/* Primary: Open API Console */}
        <button
          onClick={onOpenConsole}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
          style={{
            background: 'oklch(0.55 0.22 293)',
            boxShadow: '0 0 20px oklch(0.55 0.22 293 / 30%)',
            fontFamily: 'Sora, sans-serif'
          }}>
          <Terminal className="w-4 h-4" />
          Open API Console
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button className="py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all hover:bg-white/5"
            style={{ color: 'oklch(0.65 0.015 265)', border: '1px solid oklch(1 0 0 / 10%)', fontFamily: 'Sora, sans-serif' }}>
            <BarChart3 className="w-3.5 h-3.5" />
            Usage Stats
          </button>
          <button className="py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all hover:bg-white/5"
            style={{ color: 'oklch(0.65 0.015 265)', border: '1px solid oklch(1 0 0 / 10%)', fontFamily: 'Sora, sans-serif' }}>
            <Settings className="w-3.5 h-3.5" />
            Manage Plan
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Modal ────────────────────────────────────────────────────────────
function PaymentModal({ plan, api, onClose, onSuccess }: {
  plan: any;
  api: typeof sharePointApi;
  onClose: () => void;
  onSuccess: (generatedKey: string) => void;
}) {
  const [step, setStep] = useState<'confirm' | 'payment'>('confirm');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const handlePay = () => {
    if (!cardNumber || !expiry || !cvv || !cardName) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const newKey = 'sk-hub-' + Math.random().toString(36).substring(2, 18).toUpperCase();
      onSuccess(newKey);
    }, 2000);
  };

  const formatCardNumber = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 2) return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    return cleaned;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'oklch(0 0 0 / 70%)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'oklch(0.148 0.013 265)', border: '1px solid oklch(0.55 0.22 293 / 25%)' }}>
        <div className="flex items-center justify-between p-6"
          style={{ borderBottom: '1px solid oklch(1 0 0 / 8%)' }}>
          <div>
            <h2 className="text-base font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.94 0.005 265)' }}>
              {step === 'confirm' ? 'Confirm Your Order' : 'Payment Details'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'oklch(0.55 0.015 265)' }}>
              {api.name} · {plan.name} Plan
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
            style={{ color: 'oklch(0.55 0.015 265)' }}>
            ✕
          </button>
        </div>

        {step === 'confirm' ? (
          <div className="p-6">
            <div className="rounded-xl p-4 mb-5"
              style={{ background: 'oklch(0.13 0.011 265)', border: '1px solid oklch(1 0 0 / 8%)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img src={api.logo} alt={api.name} className="w-8 h-8 object-contain rounded"
                    style={{ background: 'oklch(0.19 0.013 265)', padding: '4px' }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.9 0.005 265)' }}>
                      {api.name}
                    </p>
                    <p className="text-xs" style={{ color: 'oklch(0.55 0.015 265)' }}>{plan.name} Plan</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.94 0.005 265)' }}>
                    ${plan.price}
                  </p>
                  <p className="text-xs" style={{ color: 'oklch(0.55 0.015 265)' }}>/month</p>
                </div>
              </div>
              <div className="space-y-1.5 pt-3" style={{ borderTop: '1px solid oklch(1 0 0 / 8%)' }}>
                {plan.features.slice(0, 3).map((f: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <Check className="w-3 h-3 flex-shrink-0" style={{ color: 'oklch(0.65 0.15 150)' }} />
                    <span style={{ color: 'oklch(0.65 0.012 265)' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span style={{ color: 'oklch(0.65 0.012 265)' }}>Subtotal</span>
              <span style={{ color: 'oklch(0.9 0.005 265)' }}>${plan.price}.00</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-4">
              <span style={{ color: 'oklch(0.65 0.012 265)' }}>Tax</span>
              <span style={{ color: 'oklch(0.9 0.005 265)' }}>$0.00</span>
            </div>
            <div className="flex items-center justify-between font-semibold pt-3 mb-5"
              style={{ borderTop: '1px solid oklch(1 0 0 / 8%)', fontFamily: 'Sora, sans-serif' }}>
              <span style={{ color: 'oklch(0.94 0.005 265)' }}>Total due today</span>
              <span style={{ color: 'oklch(0.72 0.18 293)' }}>${plan.price}.00</span>
            </div>
            <button
              onClick={() => setStep('payment')}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'oklch(0.55 0.22 293)', boxShadow: '0 0 20px oklch(0.55 0.22 293 / 30%)', fontFamily: 'Sora, sans-serif' }}>
              Continue to Payment
            </button>
            <p className="text-xs text-center mt-3" style={{ color: 'oklch(0.45 0.012 265)' }}>
              You can cancel anytime. 30-day money-back guarantee.
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'oklch(0.65 0.012 265)', fontFamily: 'Sora, sans-serif' }}>
                  Card Number
                </label>
                <input
                  type="text" placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-all"
                  style={{ background: 'oklch(0.13 0.011 265)', border: '1px solid oklch(1 0 0 / 12%)', color: 'oklch(0.9 0.005 265)', fontFamily: 'JetBrains Mono, monospace' }}
                  onFocus={(e) => { e.target.style.borderColor = 'oklch(0.55 0.22 293 / 50%)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'oklch(1 0 0 / 12%)'; }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'oklch(0.65 0.012 265)', fontFamily: 'Sora, sans-serif' }}>
                  Cardholder Name
                </label>
                <input
                  type="text" placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-all"
                  style={{ background: 'oklch(0.13 0.011 265)', border: '1px solid oklch(1 0 0 / 12%)', color: 'oklch(0.9 0.005 265)' }}
                  onFocus={(e) => { e.target.style.borderColor = 'oklch(0.55 0.22 293 / 50%)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'oklch(1 0 0 / 12%)'; }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'oklch(0.65 0.012 265)', fontFamily: 'Sora, sans-serif' }}>
                    Expiry Date
                  </label>
                  <input
                    type="text" placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-all"
                    style={{ background: 'oklch(0.13 0.011 265)', border: '1px solid oklch(1 0 0 / 12%)', color: 'oklch(0.9 0.005 265)', fontFamily: 'JetBrains Mono, monospace' }}
                    onFocus={(e) => { e.target.style.borderColor = 'oklch(0.55 0.22 293 / 50%)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'oklch(1 0 0 / 12%)'; }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'oklch(0.65 0.012 265)', fontFamily: 'Sora, sans-serif' }}>
                    CVV
                  </label>
                  <input
                    type="text" placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-all"
                    style={{ background: 'oklch(0.13 0.011 265)', border: '1px solid oklch(1 0 0 / 12%)', color: 'oklch(0.9 0.005 265)', fontFamily: 'JetBrains Mono, monospace' }}
                    onFocus={(e) => { e.target.style.borderColor = 'oklch(0.55 0.22 293 / 50%)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'oklch(1 0 0 / 12%)'; }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm font-semibold mb-4 pt-3"
              style={{ borderTop: '1px solid oklch(1 0 0 / 8%)', fontFamily: 'Sora, sans-serif' }}>
              <span style={{ color: 'oklch(0.94 0.005 265)' }}>Total</span>
              <span style={{ color: 'oklch(0.72 0.18 293)' }}>${plan.price}.00/mo</span>
            </div>
            <button
              onClick={handlePay}
              disabled={isProcessing || !cardNumber || !expiry || !cvv || !cardName}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isProcessing ? 'oklch(0.45 0.18 293)' : 'oklch(0.55 0.22 293)',
                color: 'white',
                boxShadow: isProcessing ? 'none' : '0 0 20px oklch(0.55 0.22 293 / 30%)',
                fontFamily: 'Sora, sans-serif'
              }}>
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing Payment...
                </span>
              ) : `Pay $${plan.price}.00 — Activate ${plan.name}`}
            </button>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Shield className="w-3.5 h-3.5" style={{ color: 'oklch(0.55 0.015 265)' }} />
              <p className="text-xs" style={{ color: 'oklch(0.45 0.012 265)' }}>
                Secured by 256-bit SSL encryption
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── API Console Page (mock of the testing interface) ─────────────────────────
function ApiConsolePage({ api, plan, apiKey, onBack }: {
  api: typeof sharePointApi;
  plan: any;
  apiKey: string;
  onBack: () => void;
}) {
  const [selectedEndpoint, setSelectedEndpoint] = useState(api.endpoints[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleSend = () => {
    setIsRunning(true);
    setResponse(null);
    setTimeout(() => {
      setIsRunning(false);
      setResponse(selectedEndpoint.responseExample || '{"status": "ok"}');
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'oklch(0.108 0.012 265)' }}>
      {/* Console Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{ background: 'oklch(0.13 0.011 265)', borderBottom: '1px solid oklch(1 0 0 / 8%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-white/5"
            style={{ color: 'oklch(0.65 0.015 265)' }}>
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Detail
          </button>
          <div className="flex items-center gap-2">
            <img src={api.logo} alt={api.name} className="w-5 h-5 object-contain rounded"
              style={{ background: 'oklch(0.19 0.013 265)', padding: '2px' }} />
            <span className="text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.9 0.005 265)' }}>
              {api.name}
            </span>
            <span className="text-xs" style={{ color: 'oklch(0.55 0.015 265)' }}>/ Collections</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Active subscription badge */}
          <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'oklch(0.18 0.06 150)', color: 'oklch(0.72 0.18 150)' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'oklch(0.72 0.18 150)' }} />
            {plan.name} · Active
          </div>
          <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'oklch(0.18 0.013 265)', color: 'oklch(0.55 0.015 265)', border: '1px solid oklch(1 0 0 / 8%)' }}>
            <Key className="w-3 h-3" />
            <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>{apiKey.slice(0, 14)}…</code>
          </div>
        </div>
      </div>

      {/* Console Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Endpoint Sidebar */}
        <div className="w-72 flex-shrink-0 flex flex-col overflow-hidden"
          style={{ background: 'oklch(0.12 0.011 265)', borderRight: '1px solid oklch(1 0 0 / 8%)' }}>
          <div className="p-3" style={{ borderBottom: '1px solid oklch(1 0 0 / 8%)' }}>
            <input
              type="text" placeholder="Search endpoints..."
              className="w-full px-3 py-2 text-xs rounded-lg outline-none"
              style={{ background: 'oklch(0.16 0.012 265)', border: '1px solid oklch(1 0 0 / 10%)', color: 'oklch(0.85 0.008 265)' }}
            />
          </div>
          <div className="p-3 flex-1 overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-4 rounded flex items-center justify-center"
                style={{ background: 'oklch(0.22 0.018 293)' }}>
                <span className="text-xs" style={{ color: 'oklch(0.72 0.18 293)' }}>📁</span>
              </div>
              <span className="text-xs font-semibold" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.85 0.008 265)' }}>
                {api.name}
              </span>
            </div>
            <div className="space-y-0.5">
              {api.endpoints.map(ep => (
                <button
                  key={ep.id}
                  onClick={() => { setSelectedEndpoint(ep); setResponse(null); }}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-colors"
                  style={{
                    background: selectedEndpoint.id === ep.id ? 'oklch(0.22 0.018 293 / 50%)' : 'transparent',
                    border: selectedEndpoint.id === ep.id ? '1px solid oklch(0.55 0.22 293 / 20%)' : '1px solid transparent'
                  }}>
                  <MethodBadge method={ep.method} />
                  <span className="text-xs truncate" style={{ color: 'oklch(0.78 0.01 265)' }}>{ep.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Request/Response Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* URL Bar */}
          <div className="flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: '1px solid oklch(1 0 0 / 8%)', background: 'oklch(0.13 0.011 265)' }}>
            <div className="flex items-center gap-2">
              <MethodBadge method={selectedEndpoint.method} />
            </div>
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: 'oklch(0.1 0.01 265)', border: '1px solid oklch(1 0 0 / 10%)' }}>
              <code className="text-sm flex-1" style={{ color: 'oklch(0.85 0.008 265)', fontFamily: 'JetBrains Mono, monospace' }}>
                https://api.hub.io{selectedEndpoint.path}
              </code>
            </div>
            <button
              onClick={handleSend}
              disabled={isRunning}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-70"
              style={{ background: 'oklch(0.55 0.22 293)', fontFamily: 'Sora, sans-serif', minWidth: '80px' }}>
              {isRunning ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : 'Send'}
            </button>
          </div>

          {/* Tabs: Parameters / Headers / Authorization */}
          <div className="flex items-center gap-0 px-4"
            style={{ borderBottom: '1px solid oklch(1 0 0 / 8%)', background: 'oklch(0.13 0.011 265)' }}>
            {['Parameters', 'Body', 'Headers', 'Authorization'].map((tab, i) => (
              <button key={tab}
                className="px-4 py-2.5 text-xs font-medium transition-colors relative"
                style={{ color: i === 0 ? 'oklch(0.72 0.18 293)' : 'oklch(0.55 0.015 265)' }}>
                {tab}
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                    style={{ background: 'oklch(0.72 0.18 293)' }} />
                )}
              </button>
            ))}
          </div>

          {/* Parameters area */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedEndpoint.params && selectedEndpoint.params.length > 0 ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: 'oklch(0.55 0.015 265)', fontFamily: 'Sora, sans-serif' }}>
                  Query Parameters
                </p>
                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid oklch(1 0 0 / 8%)' }}>
                  <div className="grid grid-cols-3 px-3 py-2 text-xs font-medium"
                    style={{ background: 'oklch(0.15 0.012 265)', color: 'oklch(0.55 0.015 265)', borderBottom: '1px solid oklch(1 0 0 / 8%)' }}>
                    <span>Key</span>
                    <span>Value</span>
                    <span>Description</span>
                  </div>
                  {selectedEndpoint.params.map((param, i) => (
                    <div key={i} className="grid grid-cols-3 px-3 py-2.5 text-xs"
                      style={{ borderBottom: i < selectedEndpoint.params!.length - 1 ? '1px solid oklch(1 0 0 / 5%)' : 'none' }}>
                      <code style={{ color: 'oklch(0.72 0.18 293)', fontFamily: 'JetBrains Mono, monospace' }}>{param.name}</code>
                      <input
                        type="text"
                        placeholder={param.required ? 'required' : 'optional'}
                        className="bg-transparent outline-none text-xs"
                        style={{ color: 'oklch(0.78 0.01 265)' }}
                      />
                      <span style={{ color: 'oklch(0.55 0.015 265)' }}>{param.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-center">
                <div>
                  <p className="text-sm" style={{ color: 'oklch(0.45 0.012 265)' }}>No parameters required</p>
                  <p className="text-xs mt-1" style={{ color: 'oklch(0.38 0.01 265)' }}>Click Send to execute this request</p>
                </div>
              </div>
            )}
          </div>

          {/* Response Panel */}
          {(response || isRunning) && (
            <div className="border-t flex-shrink-0" style={{ borderColor: 'oklch(1 0 0 / 8%)', maxHeight: '40%' }}>
              <div className="flex items-center justify-between px-4 py-2"
                style={{ background: 'oklch(0.13 0.011 265)', borderBottom: '1px solid oklch(1 0 0 / 8%)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.9 0.005 265)' }}>
                    Response
                  </span>
                  {response && (
                    <span className="text-xs px-2 py-0.5 rounded"
                      style={{ background: 'oklch(0.18 0.06 150)', color: 'oklch(0.72 0.18 150)' }}>
                      200 OK
                    </span>
                  )}
                </div>
              </div>
              <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(40vh - 40px)', background: 'oklch(0.1 0.01 265)' }}>
                {isRunning ? (
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'oklch(0.55 0.015 265)' }}>
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending request...
                  </div>
                ) : (
                  <pre className="text-xs" style={{ color: 'oklch(0.78 0.012 265)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {response}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Success Page ─────────────────────────────────────────────────────────────
function SuccessPage({ api, plan, apiKey, onGoToConsole, onBack }: {
  api: typeof sharePointApi;
  plan: any;
  apiKey: string;
  onGoToConsole: () => void;
  onBack: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'oklch(0.108 0.012 265)' }}>
      <div className="w-full max-w-lg text-center">
        <div className="w-48 h-48 mx-auto mb-6 rounded-2xl overflow-hidden">
          <img src={SUCCESS_IMG} alt="Success" className="w-full h-full object-cover" />
        </div>

        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.96 0.005 265)' }}>
          You're all set! 🎉
        </h1>
        <p className="text-sm mb-6" style={{ color: 'oklch(0.65 0.012 265)' }}>
          Your <strong style={{ color: 'oklch(0.78 0.15 293)' }}>{api.name} {plan.name}</strong> subscription is now active.
          Your API key has been generated and is ready to use.
        </p>

        {/* API Key */}
        <div className="rounded-xl p-4 mb-4 text-left"
          style={{ background: 'oklch(0.148 0.013 265)', border: '1px solid oklch(0.55 0.22 293 / 25%)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'oklch(0.55 0.015 265)', fontFamily: 'Sora, sans-serif' }}>
              Your API Key
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'oklch(0.18 0.06 150)', color: 'oklch(0.72 0.18 150)' }}>
              Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm truncate"
              style={{ color: 'oklch(0.72 0.18 293)', fontFamily: 'JetBrains Mono, monospace' }}>
              {apiKey}
            </code>
            <button onClick={handleCopyKey}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
              style={{ background: 'oklch(0.22 0.018 293)', color: 'oklch(0.72 0.18 293)' }}>
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: 'oklch(0.45 0.012 265)' }}>
            Keep this key secure. You can view it again in your dashboard.
          </p>
        </div>

        {/* Subscription Summary */}
        <div className="rounded-xl p-4 mb-6 text-left"
          style={{ background: 'oklch(0.148 0.013 265)', border: '1px solid oklch(1 0 0 / 8%)' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.9 0.005 265)' }}>
            Subscription Summary
          </h3>
          <div className="space-y-2">
            {[
              { label: 'Plan', value: plan.name },
              { label: 'API Calls', value: plan.requestLimit > 0 ? `${plan.requestLimit.toLocaleString()}/month` : 'Unlimited' },
              { label: 'Billing', value: `$${plan.price}/month` },
              { label: 'Next Renewal', value: 'March 27, 2026' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span style={{ color: 'oklch(0.55 0.015 265)' }}>{item.label}</span>
                <span style={{ color: 'oklch(0.85 0.008 265)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="space-y-3 mb-6">
          {/* Primary CTA: Go to API Console */}
          <button
            onClick={onGoToConsole}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{
              background: 'oklch(0.55 0.22 293)',
              boxShadow: '0 0 20px oklch(0.55 0.22 293 / 30%)',
              fontFamily: 'Sora, sans-serif'
            }}>
            <Terminal className="w-4 h-4" />
            Go to API Console →
          </button>
          <button
            onClick={onBack}
            className="w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/5"
            style={{ color: 'oklch(0.65 0.015 265)', border: '1px solid oklch(1 0 0 / 10%)', fontFamily: 'Sora, sans-serif' }}>
            Back to API Hub
          </button>
        </div>

        <p className="text-xs" style={{ color: 'oklch(0.45 0.012 265)' }}>
          A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
}

// ─── Main ApiDetailPage ───────────────────────────────────────────────────────
export default function ApiDetailPage() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const { addSubscription, getSubscription, isSubscribed } = useSubscription();

  // Purchase state management — sync with global SubscriptionContext
  const existingSub = getSubscription(sharePointApi.id);
  const [isPurchased, setIsPurchased] = useState(() => isSubscribed(sharePointApi.id));
  const [purchasedPlan, setPurchasedPlan] = useState<any>(() => existingSub ? { id: existingSub.planId, name: existingSub.planName, price: existingSub.planPrice, requestLimit: existingSub.requestLimit } : null);
  const [apiKey, setApiKey] = useState<string>(() => existingSub?.apiKey ?? '');

  // View state: 'detail' | 'success' | 'console'
  const [view, setView] = useState<'detail' | 'success' | 'console'>('detail');

  const api = sharePointApi;
  // Map stats array to named fields for convenience
  const statsMap = Object.fromEntries(api.stats.map(s => [s.label, s.value]));

  const commitSubscription = (plan: any, newKey: string) => {
    const now = new Date();
    const renewDate = new Date(now);
    renewDate.setMonth(renewDate.getMonth() + 1);
    addSubscription({
      apiId: sharePointApi.id,
      apiName: sharePointApi.name,
      apiLogo: sharePointApi.logo,
      planId: plan.id,
      planName: plan.name,
      planPrice: plan.price,
      requestLimit: plan.requestLimit ?? 1000,
      apiKey: newKey,
      subscribedAt: now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      renewsAt: renewDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      usageThisMonth: Math.floor((plan.requestLimit ?? 1000) * 0.025),
      usageHistory: generateUsageHistory(plan.requestLimit ?? 1000),
      status: 'active',
    });
  };

  const handleSubscribe = (plan: any) => {
    if (plan.price === 0) {
      // Free plan: instant activation, skip payment
      const newKey = 'sk-hub-' + Math.random().toString(36).substring(2, 18).toUpperCase();
      setApiKey(newKey);
      setPurchasedPlan(plan);
      setIsPurchased(true);
      commitSubscription(plan, newKey);
      setView('success');
    } else {
      setSelectedPlan(plan);
    }
  };

  const handlePaymentSuccess = (newKey: string) => {
    setApiKey(newKey);
    setPurchasedPlan(selectedPlan);
    setIsPurchased(true);
    commitSubscription(selectedPlan, newKey);
    setSelectedPlan(null);
    setView('success');
  };

  const handleOpenConsole = () => {
    setView('console');
  };

  const handleBackToDetail = () => {
    setView('detail');
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'endpoints', label: `Endpoints (${api.endpoints.length})` },
    { id: 'pricing', label: 'Pricing' },

  ];

  // ── Console view ──
  if (view === 'console') {
    return (
      <ApiConsolePage
        api={api}
        plan={purchasedPlan}
        apiKey={apiKey}
        onBack={handleBackToDetail}
      />
    );
  }

  // ── Success view ──
  if (view === 'success') {
    return (
      <SuccessPage
        api={api}
        plan={purchasedPlan}
        apiKey={apiKey}
        onGoToConsole={handleOpenConsole}
        onBack={() => navigate('/')}
      />
    );
  }

  // ── Detail view ──
  return (
    <div className="min-h-screen" style={{ background: 'oklch(0.108 0.012 265)' }}>
      {/* Banner */}
      <div className="relative h-44 overflow-hidden">
        <img src={DETAIL_BANNER} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, oklch(0 0 0 / 20%), oklch(0.108 0.012 265))' }} />
        {/* Breadcrumb */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <button onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm transition-all hover:bg-white/10"
            style={{ color: 'oklch(0.85 0.005 265)', background: 'oklch(0 0 0 / 30%)' }}>
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to API Hub
          </button>
          <span style={{ color: 'oklch(0.45 0.012 265)' }}>/</span>
          <span className="text-xs" style={{ color: 'oklch(0.65 0.012 265)' }}>API Hub</span>
          <span style={{ color: 'oklch(0.45 0.012 265)' }}>›</span>
          <span className="text-xs" style={{ color: 'oklch(0.78 0.01 265)' }}>{api.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 pb-16">
        {/* API Header */}
        <div className="flex items-start gap-4 mb-6">
          <img src={api.logo} alt={api.name}
            className="w-16 h-16 rounded-xl object-contain flex-shrink-0"
            style={{ background: 'oklch(0.19 0.013 265)', padding: '10px', border: '1px solid oklch(1 0 0 / 10%)' }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.96 0.005 265)' }}>
                  {api.name}
                </h1>
                <p className="text-sm mt-0.5" style={{ color: 'oklch(0.55 0.015 265)' }}>
                  by <span style={{ color: 'oklch(0.72 0.18 293)' }}>{api.developer}</span>
                  {' · '}{api.version}{' · '}Updated {api.lastUpdated}
                </p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-current" style={{ color: 'oklch(0.82 0.18 80)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'oklch(0.9 0.005 265)' }}>{api.rating}</span>
                  <span className="text-xs" style={{ color: 'oklch(0.55 0.015 265)' }}>({api.reviewCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" style={{ color: 'oklch(0.55 0.015 265)' }} />
                  <span className="text-sm" style={{ color: 'oklch(0.72 0.012 265)' }}>{api.subscriberCount.toLocaleString()} subscribers</span>
                </div>
              </div>
            </div>
            <p className="text-sm mt-2" style={{ color: 'oklch(0.72 0.012 265)' }}>{api.tagline}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {api.tags.map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: 'oklch(0.19 0.013 265)', color: 'oklch(0.65 0.012 265)', border: '1px solid oklch(1 0 0 / 8%)' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── PURCHASED: "Open API Console" prominent banner ── */}
        {isPurchased && (
          <div className="mb-6 rounded-xl p-4 flex items-center justify-between gap-4"
            style={{
              background: 'linear-gradient(135deg, oklch(0.16 0.02 293), oklch(0.14 0.018 150 / 30%))',
              border: '1px solid oklch(0.55 0.22 293 / 40%)',
              boxShadow: '0 0 30px oklch(0.55 0.22 293 / 10%)'
            }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'oklch(0.22 0.018 293)' }}>
                <Terminal className="w-5 h-5" style={{ color: 'oklch(0.72 0.18 293)' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.94 0.005 265)' }}>
                  You have access to this API
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'oklch(0.62 0.015 265)' }}>
                  {purchasedPlan?.name} plan · {purchasedPlan?.requestLimit?.toLocaleString()} calls/month · API key ready
                </p>
              </div>
            </div>
            <button
              onClick={handleOpenConsole}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0 transition-all hover:opacity-90"
              style={{
                background: 'oklch(0.55 0.22 293)',
                boxShadow: '0 0 16px oklch(0.55 0.22 293 / 30%)',
                fontFamily: 'Sora, sans-serif'
              }}>
              <Terminal className="w-4 h-4" />
              Open API Console
            </button>
          </div>
        )}

        {/* Main Layout: Two-column (left: tabs, right: sticky purchase/subscription panel) */}
        <div className="flex gap-6 items-start">
          {/* Left: Tab content (70%) */}
          <div className="flex-1 min-w-0">
            {/* Tab Nav */}
            <div className="flex items-center gap-0 mb-6 overflow-x-auto"
              style={{ borderBottom: '1px solid oklch(1 0 0 / 8%)' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative flex-shrink-0"
                  style={{
                    color: activeTab === tab.id ? 'oklch(0.78 0.15 293)' : 'oklch(0.55 0.015 265)',
                    fontFamily: 'Sora, sans-serif'
                  }}>
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                      style={{ background: 'oklch(0.72 0.18 293)' }} />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <OverviewTab api={api} onViewPricing={() => setActiveTab('pricing')} />
            )}
            {activeTab === 'endpoints' && (
              <EndpointsTab
                endpoints={api.endpoints}
                isPurchased={isPurchased}
                onPurchasePrompt={() => setActiveTab('pricing')}
              />
            )}
            {activeTab === 'pricing' && (
              <PricingTab plans={api.plans} />
            )}

          </div>

          {/* Right: Sticky purchase / subscription panel (30%) */}
          <div className="w-72 flex-shrink-0 sticky top-6">
            {isPurchased ? (
              <SubscriptionPanel
                api={api}
                plan={purchasedPlan}
                apiKey={apiKey}
                onOpenConsole={handleOpenConsole}
              />
            ) : (
              <PurchasePanel
                api={api}
                onSubscribe={handleSubscribe}
                onViewPricing={() => setActiveTab('pricing')}
              />
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          api={api}
          onClose={() => setSelectedPlan(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
