/*
 * Design: Elite Dark Commerce — API Hub Marketplace
 * Layout: Grid card layout with search/filter bar
 * Colors: #0D0E14 bg, #8B5CF6 primary purple, #161822 card bg
 * Typography: Sora headings + Inter body
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { Search, ChevronDown, Star, BookOpen, Zap } from 'lucide-react';
import { allApis } from '@/lib/mockData';

const HERO_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663217980557/f7aHH7icVzRvWbZbt5LFt7/api-hub-hero-bg-5AffKSF9SnqnXr7EMVVQjJ.webp';

function PriceTag({ plans }: { plans: any[] }) {
  const freePlan = plans?.find(p => p.price === 0);
  const paidPlan = plans?.find(p => p.price > 0);
  
  if (freePlan && !paidPlan) {
    return (
      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ background: 'oklch(0.22 0.08 150)', color: 'oklch(0.75 0.18 150)', border: '1px solid oklch(0.4 0.12 150 / 30%)' }}>
        Free
      </span>
    );
  }
  if (freePlan && paidPlan) {
    return (
      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ background: 'oklch(0.22 0.08 293)', color: 'oklch(0.75 0.18 293)', border: '1px solid oklch(0.55 0.22 293 / 30%)' }}>
        From ${paidPlan.price}/mo
      </span>
    );
  }
  if (paidPlan) {
    return (
      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ background: 'oklch(0.22 0.08 293)', color: 'oklch(0.75 0.18 293)', border: '1px solid oklch(0.55 0.22 293 / 30%)' }}>
        From ${paidPlan.price}/mo
      </span>
    );
  }
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: 'oklch(0.22 0.08 293)', color: 'oklch(0.75 0.18 293)', border: '1px solid oklch(0.55 0.22 293 / 30%)' }}>
      Paid
    </span>
  );
}

function ApiCard({ api, index, onClick }: { api: any; index: number; onClick: () => void }) {
  return (
    <div
      className={`card-purple-border rounded-xl p-5 cursor-pointer animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
      onClick={onClick}
      style={{ opacity: 0 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0"
            style={{ background: 'oklch(0.19 0.013 265)', border: '1px solid oklch(1 0 0 / 10%)' }}>
            <img
              src={api.logo}
              alt={api.name}
              className="w-full h-full object-contain p-1.5"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-lg font-bold" style="color: oklch(0.55 0.22 293); font-family: Sora, sans-serif">${api.name[0]}</div>`;
              }}
            />
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-tight" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.94 0.005 265)' }}>
              {api.name}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'oklch(0.62 0.015 265)' }}>
              by {api.developer}
            </p>
          </div>
        </div>
        <PriceTag plans={api.plans || []} />
      </div>

      <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: 'oklch(0.72 0.012 265)' }}>
        {api.tagline}
      </p>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: 'oklch(0.22 0.018 293)', color: 'oklch(0.72 0.15 293)', border: '1px solid oklch(0.55 0.22 293 / 20%)' }}>
          {api.category}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3"
        style={{ borderTop: '1px solid oklch(1 0 0 / 8%)' }}>
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-current" style={{ color: 'oklch(0.82 0.18 80)' }} />
          <span className="text-sm font-medium" style={{ color: 'oklch(0.82 0.18 80)' }}>{api.rating}</span>
        </div>
        <div className="flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" style={{ color: 'oklch(0.62 0.015 265)' }} />
          <span className="text-sm" style={{ color: 'oklch(0.62 0.015 265)' }}>
            {api.subscriberCount >= 1000
              ? `${(api.subscriberCount / 1000).toFixed(1)}k`
              : api.subscriberCount}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApis = allApis.filter(api =>
    !searchQuery ||
    api.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: 'oklch(0.108 0.012 265)' }}>
      {/* Hero Header */}
      <div className="relative overflow-hidden"
        style={{ borderBottom: '1px solid oklch(1 0 0 / 8%)' }}>
        <div className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${HERO_BG})` }} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, oklch(0.108 0.012 265 / 0%), oklch(0.108 0.012 265))' }} />
        
        <div className="relative container py-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'oklch(0.55 0.22 293)', boxShadow: '0 0 16px oklch(0.55 0.22 293 / 40%)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: 'oklch(0.65 0.18 293)', fontFamily: 'Sora, sans-serif' }}>
              API Hub
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.96 0.005 265)' }}>
            API Marketplace
          </h1>
          <p className="text-sm max-w-xl" style={{ color: 'oklch(0.65 0.012 265)' }}>
            Browse and integrate various API interfaces to enhance your applications with powerful capabilities.
            Our marketplace offers a wide range of APIs for different use cases.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="container py-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'oklch(0.55 0.015 265)' }} />
            <input
              type="text"
              placeholder="Search for APIs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg outline-none transition-all"
              style={{
                background: 'oklch(0.148 0.013 265)',
                border: '1px solid oklch(1 0 0 / 10%)',
                color: 'oklch(0.94 0.005 265)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'oklch(0.55 0.22 293 / 50%)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'oklch(1 0 0 / 10%)'; }}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg transition-all"
            style={{ background: 'oklch(0.148 0.013 265)', border: '1px solid oklch(1 0 0 / 10%)', color: 'oklch(0.85 0.008 265)' }}
            onClick={() => {}}>
            Categories <ChevronDown className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg transition-all"
            style={{ background: 'oklch(0.148 0.013 265)', border: '1px solid oklch(1 0 0 / 10%)', color: 'oklch(0.85 0.008 265)' }}
            onClick={() => {}}>
            All Prices <ChevronDown className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg transition-all"
            style={{ background: 'oklch(0.148 0.013 265)', border: '1px solid oklch(1 0 0 / 10%)', color: 'oklch(0.85 0.008 265)' }}
            onClick={() => {}}>
            Sort by: Popularity <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* API Grid */}
      <div className="container pb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.94 0.005 265)' }}>
            {searchQuery ? `Search Results (${filteredApis.length})` : 'Latest APIs'}
          </h2>
          <span className="text-sm" style={{ color: 'oklch(0.55 0.015 265)' }}>
            {filteredApis.length} APIs available
          </span>
        </div>

        {filteredApis.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-medium mb-2" style={{ fontFamily: 'Sora, sans-serif', color: 'oklch(0.7 0.012 265)' }}>
              No APIs found
            </p>
            <p className="text-sm" style={{ color: 'oklch(0.55 0.015 265)' }}>
              Try adjusting your search query
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApis.map((api, index) => (
              <ApiCard
                key={api.id}
                api={api}
                index={index}
                onClick={() => navigate(`/api/${api.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="container pb-6 flex items-center justify-end gap-4"
        style={{ borderTop: '1px solid oklch(1 0 0 / 6%)', paddingTop: '1.5rem' }}>
        <button className="text-sm transition-colors hover:opacity-80" style={{ color: 'oklch(0.62 0.015 265)' }}>
          Feedback
        </button>
        <span style={{ color: 'oklch(0.35 0.01 265)' }}>|</span>
        <button className="text-sm transition-colors hover:opacity-80" style={{ color: 'oklch(0.62 0.015 265)' }}>
          Docs
        </button>
      </div>
    </div>
  );
}
