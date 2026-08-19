'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search, MapPin, Clock, ExternalLink, CheckCircle2, Sparkles,
  Loader2, RefreshCw, Kanban, ArrowRight, Target, Code2, Cpu,
  Layers, Smartphone, Palette, Server, Globe, BookmarkPlus,
  Briefcase, Zap, Building2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { LocationPicker } from '@/components/LocationPicker';

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const JOB_ROLES = [
  { icon: Code2,      label: 'Frontend Developer',    query: 'frontend developer react typescript' },
  { icon: Server,     label: 'Backend Engineer',       query: 'backend engineer node java python' },
  { icon: Layers,     label: 'Full Stack Developer',   query: 'full stack developer' },
  { icon: Cpu,        label: 'ML / AI Engineer',       query: 'machine learning AI engineer python' },
  { icon: Globe,      label: 'DevOps / Cloud',         query: 'devops cloud engineer kubernetes aws' },
  { icon: Smartphone, label: 'Mobile Developer',       query: 'mobile developer react native flutter' },
  { icon: Palette,    label: 'UI/UX Designer',         query: 'UI UX product designer figma' },
  { icon: Briefcase,  label: 'Product Manager',        query: 'product manager software tech' },
];

const LOCATIONS = [
  'Anywhere / Remote', 'India', 'Gujarat', 'Ahmedabad', 'Surat', 
  'Vadodara', 'Gandhinagar', 'Rajkot', 'Bengaluru', 'Mumbai', 
  'Pune', 'Hyderabad', 'Delhi NCR', 'United States',
];

const PIPELINE_COLS = [
  { key: 'APPLIED',   label: 'Applied',   dot: 'bg-foreground' },
  { key: 'INTERVIEW', label: 'Interview', dot: 'bg-foreground' },
  { key: 'OFFER',     label: 'Offer',     dot: 'bg-foreground' },
  { key: 'REJECTED',  label: 'Rejected',  dot: 'bg-foreground' },
];

/* ─── Landing / Onboarding ──────────────────────────────────────────────────── */

function LandingSearch({ onSearch }: { onSearch: (q: string, loc: string, remote: boolean) => void }) {
  const [selectedRole, setSelectedRole] = useState('');
  const [customRole, setCustomRole]     = useState('');
  const [location, setLocation]         = useState('Anywhere / Remote');
  const [remote, setRemote]             = useState(true);

  const handleGo = () => {
    const query = customRole.trim() || selectedRole;
    if (!query) return;
    onSearch(query, location === 'Anywhere / Remote' ? '' : location, remote);
  };

  const activeQuery = customRole.trim() || selectedRole;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Top bar ── */}
      <div className="border-b border-border px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Job Opportunities</h1>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mt-0.5">
            Powered by LinkedIn · Indeed · Glassdoor · Remotive · Arbeitnow
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground border border-border rounded-full px-4 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live · Updates every 24h
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-3xl"
        >
          {/* headline */}
          <div className="text-center mb-12">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
              ( Step 1 of 1 — Tell us what you're looking for )
            </p>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-4">
              What's your<br />
              <span className="italic font-light">dream job?</span>
            </h2>
            <p className="text-muted-foreground font-light text-lg max-w-md mx-auto">
              We'll fetch 100% real, live listings from every major job platform in seconds.
            </p>
          </div>

          {/* role grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {JOB_ROLES.map((role) => {
              const Icon = role.icon;
              const active = selectedRole === role.query;
              return (
                <motion.button
                  key={role.label}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setSelectedRole(active ? '' : role.query); setCustomRole(''); }}
                  className={`flex flex-col items-center gap-3 py-5 px-3 rounded-2xl border-2 text-xs font-bold transition-all ${
                    active
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-card hover:border-foreground text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.5} />
                  <span className="leading-tight text-center">{role.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* OR divider + custom input */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">or type anything</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="e.g. 'Python Data Engineer at fintech' · 'React lead India remote'"
              value={customRole}
              onChange={e => { setCustomRole(e.target.value); setSelectedRole(''); }}
              onKeyDown={e => e.key === 'Enter' && activeQuery && handleGo()}
              className="pl-11 h-14 text-sm font-medium rounded-xl border-2 border-border focus:border-foreground"
            />
          </div>

          {/* Location + remote row */}
          <div className="grid grid-cols-[1fr_auto] gap-3 mb-8">
            <LocationPicker onLocationSelect={setLocation} defaultLocation={location} />

            <button
              onClick={() => setRemote(r => !r)}
              className={`px-5 h-12 rounded-xl border-2 text-xs font-bold uppercase tracking-widest transition-all ${
                remote
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-card text-muted-foreground hover:border-foreground/50'
              }`}
            >
              🏠 Remote
            </button>
          </div>

          {/* CTA */}
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              onClick={handleGo}
              disabled={!activeQuery}
              className="w-full h-16 text-lg font-black gap-3 rounded-2xl bg-foreground text-background hover:bg-foreground/90 border-0 shadow-2xl disabled:opacity-30 tracking-tight"
            >
              <Sparkles className="w-5 h-5" />
              Find Live Jobs
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>

          <p className="text-center text-[11px] font-mono text-muted-foreground mt-5 uppercase tracking-widest">
            Jobs from last 30 days only · Apply directly on each platform · No redirects
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Job Card ───────────────────────────────────────────────────────────────── */

function JobCard({ job, onSave, saved }: { job: any; onSave: (j: any) => void; saved: boolean }) {
  const days = job.postedDays ?? 0;
  const postedLabel = days === 0 ? 'Today' : days === 1 ? '1 day ago' : `${days} days ago`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="group flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card hover:border-foreground/40 hover:shadow-xl transition-all duration-200"
    >
      {/* top row */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0 text-xl font-black">
          {job.companyLogo
            ? <img src={job.companyLogo} alt={job.company} className="w-full h-full object-contain p-1.5" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
            : job.company?.[0] ?? '?'
          }
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[15px] leading-tight line-clamp-2 group-hover:text-foreground transition-colors">
            {job.title}
          </h3>
          <p className="text-sm text-muted-foreground font-medium mt-0.5 flex items-center gap-1.5">
            <Building2 className="w-3 h-3 shrink-0" />{job.company}
          </p>
        </div>

        <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest bg-muted border border-border px-2.5 py-1 rounded-full text-muted-foreground">
          {job.sourceIcon} {job.source}
        </span>
      </div>

      {/* meta row */}
      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1.5 text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground font-medium">
          <MapPin className="w-3 h-3" />{job.location}
        </span>
        {job.remote && (
          <span className="flex items-center gap-1.5 text-xs bg-muted border border-border px-2.5 py-1 rounded-full font-bold">
            🏠 Remote
          </span>
        )}
        <span className="flex items-center gap-1.5 text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground font-medium">
          <Clock className="w-3 h-3" />{postedLabel}
        </span>
        {job.salary && (
          <span className="flex items-center gap-1.5 text-xs bg-foreground text-background px-2.5 py-1 rounded-full font-bold">
            {job.salary}
          </span>
        )}
      </div>

      {/* description */}
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 font-light">{job.description}</p>

      {/* tech tags */}
      {job.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.tags.slice(0, 5).map((tag: string, i: number) => (
            <span key={i} className="font-mono text-[10px] uppercase tracking-wider bg-muted border border-border/60 px-2.5 py-0.5 rounded-full text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* actions */}
      <div className="flex gap-2.5 pt-1 border-t border-border/50 mt-auto">
        <Button
          size="sm"
          className="w-full gap-1.5 text-sm font-bold h-10 bg-foreground text-background hover:bg-foreground/90"
          onClick={() => window.open(job.applyUrl, '_blank')}
        >
          Apply Now <ExternalLink className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

/* ─── Pipeline Column ────────────────────────────────────────────────────────── */

function PipelineColumn({ col, jobs, onUpdate, onDelete }: { col: any; jobs: any[]; onUpdate: any; onDelete: any }) {
  const colJobs = jobs.filter(j => j.status === col.key);
  return (
    <div className="rounded-2xl border-2 border-border bg-card p-5 min-h-[320px] flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${col.dot}`} />
          {col.label}
        </h3>
        <Badge variant="outline" className="text-xs font-bold">{colJobs.length}</Badge>
      </div>

      <div className="space-y-3 flex-1">
        {colJobs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center py-10 text-muted-foreground">
            <Briefcase className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-xs font-mono uppercase tracking-widest text-center opacity-50">Empty</p>
          </div>
        )}
        {colJobs.map(job => (
          <div key={job.id} className="bg-background border border-border rounded-xl p-3.5">
            <p className="font-bold text-sm leading-tight">{job.role}</p>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">{job.company}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {PIPELINE_COLS.filter(c => c.key !== col.key).slice(0, 2).map(next => (
                <button
                  key={next.key}
                  onClick={() => onUpdate({ id: job.id, data: { status: next.key } })}
                  className="text-[10px] font-mono uppercase tracking-widest bg-muted border border-border px-2 py-1 rounded-lg hover:border-foreground/50 transition-colors"
                >
                  → {next.label}
                </button>
              ))}
              <button
                onClick={() => onDelete(job.id)}
                className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-2 py-1 rounded-lg hover:text-red-500 transition-colors ml-auto"
              >
                ✕ Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────────── */

export default function JobsPage() {
  const [searched, setSearched]         = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchRemote, setSearchRemote] = useState(false);
  const [filterRemote, setFilterRemote] = useState(false);
  const [filterSource, setFilterSource] = useState('all');
  const [savedJobs, setSavedJobs]       = useState<Set<string>>(new Set());
  const [tab, setTab]                   = useState('discover');

  const queryClient = useQueryClient();
  const { toast } = useToast();

  /* live search */
  const { data: liveJobsData, isLoading: isSearching, refetch, isFetching } = useQuery({
    queryKey: ['live-jobs', searchQuery, searchLocation, searchRemote],
    queryFn: () => apiService.jobs.search({ query: searchQuery, location: searchLocation, remote: searchRemote }).then(r => r.data.data),
    enabled: searched && !!searchQuery,
    staleTime: 5 * 60 * 1000,
  });

  /* pipeline */
  const { data: pipelineJobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => apiService.jobs.list().then(r => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiService.jobs.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiService.jobs.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.jobs.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });

  const handleSearch = useCallback((q: string, loc: string, remote: boolean) => {
    setSearchQuery(q);
    setSearchLocation(loc);
    setSearchRemote(remote);
    setSearched(true);
    setTab('discover');
    setFilterSource('all');
    setFilterRemote(false);
  }, []);

  const handleSave = useCallback((job: any) => {
    setSavedJobs(prev => new Set(prev).add(job.id));
    createMutation.mutate({ company: job.company, role: job.title, jobUrl: job.applyUrl, status: 'APPLIED' });
    toast({ title: '✅ Saved to pipeline!', description: `${job.title} at ${job.company}.` });
  }, []);

  const liveJobs: any[] = liveJobsData ?? [];

  const filteredJobs = useMemo(() => liveJobs.filter(j => {
    if (filterRemote && !j.remote) return false;
    if (filterSource !== 'all' && j.source !== filterSource) return false;
    return true;
  }), [liveJobs, filterRemote, filterSource]);

  const sources = useMemo(() => Array.from(new Set(liveJobs.map(j => j.source))), [liveJobs]);

  /* ── Not yet searched → show full landing ── */
  if (!searched) {
    return <LandingSearch onSearch={handleSearch} />;
  }

  /* ── Searched → show results ── */
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Job Opportunities</h1>
          <p className="text-xl font-light text-muted-foreground mt-1">
            Showing live results for <span className="font-semibold text-foreground">"{searchQuery}"</span>
            {searchLocation && <> in <span className="font-bold text-foreground">{searchLocation}</span></>}
            {searchRemote && <span className="ml-1 font-bold text-foreground">· Remote</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setSearched(false)} className="gap-2 font-bold">
            <Target className="w-4 h-4" /> New Search
          </Button>
          <Button variant="outline" size="sm" onClick={() => setTab('pipeline')} className="gap-2 font-bold">
            <Kanban className="w-4 h-4" /> Pipeline ({pipelineJobs.length})
          </Button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <TabsList className="h-11">
            <TabsTrigger value="discover" className="gap-2 font-bold px-5">
              <Sparkles className="w-4 h-4" /> Discover
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="gap-2 font-bold px-5">
              <Kanban className="w-4 h-4" /> My Pipeline
            </TabsTrigger>
          </TabsList>

          {/* inline search refresh + filters (only on discover tab) */}
          {tab === 'discover' && (
            <div className="flex flex-wrap items-center gap-2">
              {/* quick search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && refetch()}
                  placeholder="Refine search…"
                  className="pl-8 h-9 w-48 text-xs"
                />
              </div>
              {/* remote toggle */}
              <button
                onClick={() => setFilterRemote(r => !r)}
                className={`h-9 px-3 rounded-lg border-2 text-xs font-bold uppercase tracking-wider transition-all ${filterRemote ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground hover:border-foreground/40'}`}
              >
                🏠 Remote
              </button>
              {/* source filter */}
              {sources.length > 1 && (
                <Select value={filterSource} onValueChange={setFilterSource}>
                  <SelectTrigger className="h-9 w-36 text-xs font-bold">
                    <Globe className="w-3.5 h-3.5 mr-1" /><SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {sources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching} className="h-9 gap-1.5 font-bold">
                {isFetching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Refresh
              </Button>
              <span className="text-xs font-mono text-muted-foreground ml-1">
                {filteredJobs.length} jobs
              </span>
            </div>
          )}
        </div>

        {/* ── Discover ── */}
        <TabsContent value="discover">
          {isSearching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-56 rounded-2xl border border-border bg-card animate-pulse" />
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24 border-2 border-dashed border-border rounded-3xl"
            >
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
              <p className="text-xl font-bold">No {searchQuery} jobs currently found in {searchLocation || 'this location'}</p>
              <p className="text-muted-foreground mt-2 text-sm font-light">We use strict location matching. Try broadening your role, picking a different city, or enabling Remote.</p>
              <Button onClick={() => setSearched(false)} className="mt-5 gap-2 bg-foreground text-background">
                <Target className="w-4 h-4" /> Change Search
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Job Cards */}
              <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredJobs.map((job: any) => (
                    <JobCard key={job.id} job={job} onSave={handleSave} saved={savedJobs.has(job.id)} />
                  ))}
                </div>
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        {/* ── Pipeline ── */}
        <TabsContent value="pipeline">
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight">Application Pipeline</h2>
            <p className="text-muted-foreground text-sm mt-1 font-light">Track every application from saved → offer received.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {PIPELINE_COLS.map(col => (
              <PipelineColumn
                key={col.key}
                col={col}
                jobs={pipelineJobs}
                onUpdate={updateMutation.mutate}
                onDelete={deleteMutation.mutate}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
