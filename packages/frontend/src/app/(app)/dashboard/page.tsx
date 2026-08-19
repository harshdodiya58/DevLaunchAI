'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Briefcase, Brain, Sparkles, Target, Calendar, Trophy, Clock, Search, Ghost, CheckCircle2, Circle, Component, ArrowRight, MessageSquareText, Code2 } from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts';
import { motion } from 'framer-motion';
import { Reveal, Stagger, FloatingOrb, CountUp } from '@/components/animations';

const areaData = [
  { name: 'Jul 06', score: 20 },
  { name: 'Jul 13', score: 35 },
  { name: 'Jul 20', score: 32 },
  { name: 'Jul 27', score: 55 },
  { name: 'Aug 03', score: 60 },
  { name: 'Aug 10', score: 85 },
];

const radarData = [
  { subject: 'Problem Solving', A: 88, fullMark: 100 },
  { subject: 'DSA', A: 85, fullMark: 100 },
  { subject: 'System Design', A: 72, fullMark: 100 },
  { subject: 'Frontend', A: 90, fullMark: 100 },
  { subject: 'Backend', A: 78, fullMark: 100 },
  { subject: 'DevOps', A: 65, fullMark: 100 },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(' ')[0] || 'User';

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => apiService.dashboard.getSummary().then(res => res.data.data),
  });

  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const greeting = currentTime 
    ? (currentTime.getHours() < 12 ? 'Good morning' : currentTime.getHours() < 18 ? 'Good afternoon' : 'Good evening')
    : 'Good evening';

  if (!mounted || isLoading) {
    return (
      <div className="h-[80vh] w-full flex items-center justify-center">
        <Sparkles className="h-8 w-8 text-foreground animate-pulse" />
      </div>
    );
  }

  const summary = data || {};
  const stats = summary.stats || { totalResumes: 0, totalApplications: 0, totalInterviews: 0, atsScore: 0 };
  const recentAts = summary.recentAtsScans || [];
  const recentJobs = summary.recentApplications || [];

  const applied = recentJobs.filter((j: any) => j.status === 'APPLIED').length;
  const assessment = recentJobs.filter((j: any) => j.status === 'ASSESSMENT' || j.status === 'SCREENING').length;
  const interview = recentJobs.filter((j: any) => j.status === 'INTERVIEW').length;
  const offer = recentJobs.filter((j: any) => j.status === 'OFFER' || j.status === 'HIRED').length;
  const latestJob = recentJobs[0];

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Floating ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <FloatingOrb size="xl" color="bg-slate-200/30" className="absolute -top-32 -right-32" speed="slow" />
        <FloatingOrb size="lg" color="bg-zinc-200/20" className="absolute top-1/3 -left-24" speed="slow" />
      </div>

      {/* Header */}
      <Reveal direction="up" duration={0.6}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-[32px] font-black tracking-tight leading-none mb-2">{greeting}, {firstName}!</h1>
            <p className="text-muted-foreground text-[15px] font-medium">You're building an exceptional career. Let's make today count.</p>
          </div>
          <div className="text-right hidden sm:block">
            {currentTime && (
              <div className="text-2xl font-black tracking-tight text-foreground mb-1">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            )}
            <p className="text-sm text-muted-foreground font-semibold">
              {currentTime ? currentTime.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) : ''}
            </p>
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
        
        {/* Main Content Column */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Top Metrics Row — staggered reveal */}
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.09}>
            <MetricCard 
              title="Highest ATS Score" 
              value={stats.atsScore} 
              subtitle="Keep optimizing"
              subtitleColor="text-green-600"
              visual={<CircularProgress value={stats.atsScore} color="stroke-foreground" />}
            />
            <MetricCard 
              title="Resumes Built" 
              value={stats.totalResumes} 
              subtitle="AI Generated"
              visual={<div className="h-12 w-12 bg-foreground rounded-xl flex items-center justify-center text-background"><FileText className="h-6 w-6" /></div>}
            />
            <MetricCard 
              title="Active Applications" 
              value={stats.totalApplications} 
              subtitle="In pipeline"
              visual={<div className="h-12 w-12 bg-foreground rounded-xl flex items-center justify-center text-background"><Briefcase className="h-6 w-6" /></div>}
            />
            <MetricCard 
              title="Mock Interviews" 
              value={stats.totalInterviews} 
              subtitle="Sessions completed"
              visual={<div className="h-12 w-12 bg-foreground rounded-full flex items-center justify-center text-background"><Brain className="h-6 w-6" /></div>}
            />
          </Stagger>

          {/* Charts Row */}
          <Reveal direction="up" delay={0.1}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border border-border/40 shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="pb-2 pt-6 px-6 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold tracking-tight">Placement Readiness Progress</CardTitle>
                <div className="text-xs font-semibold text-muted-foreground bg-muted/50 px-2 py-1 rounded-md cursor-pointer hover:bg-muted transition-colors">
                  Last 6 Weeks ▾
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="score" stroke="hsl(var(--foreground))" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border border-border/40 shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="pb-0 pt-6 px-6 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold tracking-tight">Skills Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[240px] flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }} />
                    <Radar name="Skills" dataKey="A" stroke="hsl(var(--foreground))" strokeWidth={2} fill="hsl(var(--foreground))" fillOpacity={0.05} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          </Reveal>

          {/* Quick Access */}
          <Reveal direction="up" delay={0.05}>
          <div className="space-y-3">
            <h3 className="text-[15px] font-bold tracking-tight">Quick Access</h3>
            <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" staggerDelay={0.07}>
              <QuickAccessCard icon={FileText} title="Resume Builder" desc="Create ATS-optimized resumes with AI" href="/resume" />
              <QuickAccessCard icon={Target} title="ATS Checker" desc="Analyze resume and get AI suggestions" href="/ats" />
              <QuickAccessCard icon={Brain} title="Mock Interview" desc="Practice with AI interviewer" href="/interview" />
              <QuickAccessCard icon={MessageSquareText} title="AI Career Chat" desc="Get 24/7 career guidance" href="/chat" />
            </Stagger>
          </div>
          </Reveal>

          {/* Bottom Grid: Activities & Pipeline */}
          <Reveal direction="up" delay={0.05}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border border-border/40 shadow-sm rounded-2xl bg-white">
              <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center justify-between">
                <CardTitle className="text-[15px] font-bold tracking-tight">Recent Activities</CardTitle>
                <Link href="/jobs" className="text-xs font-bold text-muted-foreground cursor-pointer hover:text-foreground">View Jobs</Link>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-6">
                {recentJobs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent activities.</p>
                ) : (
                  recentJobs.slice(0, 3).map((job: any) => (
                    <ActivityItem key={job.id} icon={Briefcase} title={`Applied for ${job.jobTitle}`} desc={job.company} time={new Date(job.dateApplied).toLocaleDateString()} />
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border border-border/40 shadow-sm rounded-2xl bg-white flex flex-col">
              <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center justify-between">
                <CardTitle className="text-[15px] font-bold tracking-tight">Application Pipeline</CardTitle>
                <Link href="/jobs" className="text-xs font-bold text-muted-foreground cursor-pointer hover:text-foreground">View All</Link>
              </CardHeader>
              <CardContent className="px-6 pb-6 flex-1 flex flex-col justify-between">
                
                {/* Pipeline Stats */}
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded-xl border border-border/50">
                   <PipelineStat label="Applied" count={applied} color="text-green-500" bgColor="bg-green-50" icon={Calendar} active />
                   <ChevronRightIcon />
                   <PipelineStat label="Assessment" count={assessment} color="text-blue-500" bgColor="bg-blue-50" />
                   <ChevronRightIcon />
                   <PipelineStat label="Interview" count={interview} color="text-purple-500" bgColor="bg-purple-50" />
                   <ChevronRightIcon />
                   <PipelineStat label="Offer" count={offer} color="text-yellow-600" bgColor="bg-yellow-50" />
                </div>

                {latestJob && (
                  <div className="mt-6 border border-border/50 p-4 rounded-xl flex items-center justify-between bg-background">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-foreground rounded-lg flex items-center justify-center text-background">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 pr-2">
                        <p className="text-sm font-bold leading-none mb-1 truncate">{latestJob.jobTitle}</p>
                        <p className="text-xs text-muted-foreground font-medium truncate">{latestJob.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-muted px-2 py-1 rounded-md">{latestJob.status}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          </Reveal>

          <Reveal direction="up" delay={0.05}>
          <div className="border border-border/40 bg-white p-4 rounded-xl flex items-center justify-between text-sm font-medium italic text-muted-foreground mt-4 shadow-sm">
            <span>❝ Consistency today builds the career you dream about tomorrow.</span>
            <span className="flex items-center gap-2">Keep going, your future self is proud of you. <Sparkles className="h-4 w-4" /></span>
          </div>
          </Reveal>

        </div>

        {/* Right Sidebar Column */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* AI Assistant Card */}
          <Reveal direction="right" delay={0.1}>
          <Card className="border border-border/40 shadow-lg rounded-2xl bg-white relative overflow-hidden hover-lift">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />
             <CardContent className="p-6">
                <div className="flex items-center gap-2 font-bold text-[15px] mb-4">
                  <Sparkles className="h-5 w-5" /> AI Career Assistant <span className="h-2 w-2 rounded-full bg-purple-500 ml-1 shadow-[0_0_8px_rgba(168,85,247,0.8)] pulse-ring" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground mb-6 leading-relaxed max-w-[80%] relative z-10">
                  Here's what I recommend you focus on today:
                </p>

                <div className="space-y-4 mb-6 relative z-10">
                  <AiTask icon={CheckCircle2} text="Solve 2 DSA Problems" done />
                  <AiTask icon={CheckCircle2} text="Improve React Skills" done />
                  <AiTask icon={Circle} text="Update Your Portfolio" />
                  <AiTask icon={Circle} text="Apply to 3 Jobs" />
                </div>

                <Link href="/chat">
                  <Button className="w-full h-12 rounded-xl bg-foreground text-background font-bold text-[13px] hover:bg-foreground/90 transition-all flex items-center justify-between px-5 relative z-10">
                    Ask AI Assistant <Sparkles className="h-4 w-4" />
                  </Button>
                </Link>

                {/* Orb graphic */}
                <div className="absolute top-12 right-4 w-20 h-20 pointer-events-none">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-400 blur-xl opacity-40 animate-pulse" />
                  <div className="absolute inset-2 rounded-full bg-white opacity-80 blur-sm mix-blend-overlay" />
                  <div className="absolute inset-4 rounded-full bg-purple-100 blur-sm" />
                </div>
             </CardContent>
          </Card>
          </Reveal>

          {/* Upcoming Schedule */}
          <Reveal direction="right" delay={0.15}>
          <Card className="border border-border/40 shadow-sm rounded-2xl bg-white hover-lift">
            <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-[15px] font-bold tracking-tight">Upcoming Schedule</CardTitle>
              <span className="text-xs font-bold text-muted-foreground cursor-pointer hover:text-foreground">View All</span>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-5">
              <ScheduleItem icon={Calendar} title="Mock Interview" subtitle="React Developer" time="Tomorrow, 10:00 AM" />
              <ScheduleItem icon={Trophy} title="Coding Contest" subtitle="CodeChef Starters 162" time="16 Aug, 09:00 PM" />
              <ScheduleItem icon={Clock} title="Application Deadline" subtitle="Frontend Developer @ Vercel" time="18 Aug, 11:59 PM" />
            </CardContent>
          </Card>
          </Reveal>

          {/* Recent ATS Scans */}
          <Reveal direction="right" delay={0.2}>
          <Card className="border border-border/40 shadow-sm rounded-2xl bg-white hover-lift">
            <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-[15px] font-bold tracking-tight">Recent ATS Scans</CardTitle>
              <Link href="/ats" className="text-xs font-bold text-muted-foreground cursor-pointer hover:text-foreground">View All</Link>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
              {recentAts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent ATS scans.</p>
              ) : (
                recentAts.slice(0, 4).map((scan: any, idx: number) => (
                  <AtsScanItem key={scan.id} score={scan.score} date={new Date(scan.createdAt).toLocaleDateString()} status={scan.status} dark={idx % 2 === 1} />
                ))
              )}
            </CardContent>
          </Card>
          </Reveal>

        </div>
      </div>
    </motion.div>
  );
}

// Subcomponents

function MoonIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
  );
}

function MetricCard({ title, value, subtitle, subtitleColor = "text-muted-foreground", suffix, visual }: any) {
  return (
    <Card className="border border-border/40 shadow-sm rounded-2xl bg-white overflow-hidden">
      <CardContent className="p-5 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="text-[13px] font-semibold text-muted-foreground mb-1 truncate">{title}</p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-black tracking-tighter shrink-0">{value}</p>
            {suffix && <span className="text-sm font-semibold text-muted-foreground shrink-0">{suffix}</span>}
          </div>
          <p className={`text-xs font-semibold mt-1 truncate ${subtitleColor}`}>{subtitle}</p>
        </div>
        <div className="shrink-0">
          {visual}
        </div>
      </CardContent>
    </Card>
  );
}

function CircularProgress({ value, color }: { value: number, color: string }) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative h-14 w-14 transform -rotate-90">
      <svg className="h-full w-full" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r={radius} className="stroke-muted fill-none" strokeWidth="5" />
        <circle cx="30" cy="30" r={radius} className={`${color} fill-none transition-all duration-1000 ease-out`} strokeWidth="5" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
      </svg>
    </div>
  );
}

function QuickAccessCard({ icon: Icon, title, desc, href }: any) {
  return (
    <Link href={href}>
      <div className="border border-border/40 bg-white rounded-xl p-4 flex gap-4 items-start hover:border-border transition-colors shadow-sm group h-full">
        <div className="p-2.5 rounded-lg bg-muted border border-border/50 group-hover:bg-foreground group-hover:text-background transition-colors shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold mb-1 truncate">{title}</p>
          <p className="text-[11px] text-muted-foreground font-medium leading-tight">{desc}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 shrink-0" />
      </div>
    </Link>
  );
}

function ActivityItem({ icon: Icon, title, desc, time }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-2 rounded-full bg-muted/50 border border-border/50 shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{title}</p>
        <p className="text-xs text-muted-foreground font-medium truncate">{desc}</p>
      </div>
      <p className="text-xs text-muted-foreground font-medium whitespace-nowrap shrink-0">{time}</p>
    </div>
  );
}

function ChevronRightIcon() {
  return <div className="text-muted-foreground/30 font-light shrink-0">›</div>;
}

function PipelineStat({ label, count, color, bgColor, icon: Icon, active = false }: any) {
  return (
    <div className={`flex flex-col items-start p-2 rounded-lg ${active ? 'bg-background shadow-sm border border-border/50' : ''}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${bgColor}`}>
          <div className={`h-1.5 w-1.5 rounded-full ${color.replace('text-', 'bg-')}`} />
        </div>
        <span className={`text-[11px] font-bold truncate ${color}`}>{label}</span>
      </div>
      <span className="text-xl font-black pl-5">{count}</span>
    </div>
  );
}

function AiTask({ icon: Icon, text, done = false }: any) {
  return (
    <div className="flex items-center gap-3">
      <Icon className={`h-4 w-4 shrink-0 ${done ? 'text-green-500' : 'text-muted-foreground/50'}`} />
      <span className={`text-[13px] font-semibold truncate ${done ? 'text-foreground' : 'text-muted-foreground'}`}>{text}</span>
    </div>
  );
}

function ScheduleItem({ icon: Icon, title, subtitle, time }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-2 rounded-full bg-muted/50 border border-border/50 shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold truncate">{title}</p>
        <p className="text-xs text-muted-foreground font-medium mb-1 truncate">{subtitle}</p>
        <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-1 truncate"><Clock className="h-3 w-3 shrink-0" /> {time}</p>
      </div>
    </div>
  );
}

function AtsScanItem({ score, date, status, dark = false }: any) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0 gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <Clock className="h-4 w-4 text-muted-foreground/50 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-bold truncate">Score: {score}</p>
          <p className="text-[11px] font-medium text-muted-foreground truncate">{date}</p>
        </div>
      </div>
      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${dark ? 'bg-foreground text-background' : 'bg-muted text-foreground'}`}>
        {status}
      </div>
    </div>
  );
}
