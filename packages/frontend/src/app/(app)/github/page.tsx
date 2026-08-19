'use client';

import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Github, Star, GitFork, Users, Code2, RefreshCw, Trophy, Briefcase, Settings } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

export default function GitHubPage() {
  const { toast } = useToast();
  const [usernameInput, setUsernameInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: analytics, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['github'],
    queryFn: () => apiService.github.getAnalytics().then(r => r.data.data),
    retry: false,
  });

  if (isLoading) return <Skeleton className="h-96" />;

  const pieData = analytics?.languages 
    ? Object.entries(analytics.languages).map(([name, value]) => ({ name, value })).slice(0, 5) 
    : [];
  const barData = analytics?.topRepos 
    ? analytics.topRepos.slice(0, 5).map((r: any) => ({ name: r.name.substring(0, 15), stars: r.stars })) 
    : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">GitHub Analytics</h1>
          <p className="text-xl font-light text-muted-foreground mt-1">Deep insights from your GitHub profile and contributions.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {analytics ? (
        <>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted overflow-hidden">
                {analytics.avatarUrl && <img src={analytics.avatarUrl} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{analytics.name}</h2>
                <p className="text-sm text-muted-foreground">@{analytics.username}</p>
                <p className="text-sm mt-1">{analytics.bio}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setUsernameInput(analytics.username)}>
                      <Settings className="h-4 w-4 mr-1" /> Edit Username
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update GitHub Username</DialogTitle>
                      <DialogDescription>Change your GitHub username to load a different profile, or clear it to disconnect.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Input placeholder="e.g. torvalds" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} />
                      <Button 
                        className="w-full" 
                        disabled={isUpdating}
                        onClick={async () => {
                          setIsUpdating(true);
                          try {
                            await apiService.github.updateUsername(usernameInput);
                            setEditDialogOpen(false);
                            refetch();
                            toast({ title: 'Success', description: 'GitHub username updated!' });
                          } catch (err: any) {
                            toast({ title: 'Error', description: err.response?.data?.error?.message || 'Failed to update username', variant: 'destructive' });
                          } finally {
                            setIsUpdating(false);
                          }
                        }}
                      >
                        {isUpdating ? 'Saving...' : 'Save Username'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" size="sm" asChild>
                  <a href={analytics.profileUrl} target="_blank" rel="noopener noreferrer"><Github className="h-4 w-4 mr-1" /> View Profile</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-6">
            <Card><CardContent className="p-4 text-center"><Trophy className="h-5 w-5 mx-auto mb-1 text-yellow-500" /><p className="text-2xl font-bold">{analytics.overallScore || 0}/100</p><p className="text-xs text-muted-foreground">Overall Score</p></CardContent></Card>
            <Card className="col-span-1 md:col-span-2"><CardContent className="p-4 text-center flex flex-col justify-center h-full"><Briefcase className="h-5 w-5 mx-auto mb-1 text-primary" /><p className="text-xl font-bold">{analytics.field || 'Software Engineer'}</p><p className="text-xs text-muted-foreground">Primary Field</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" /><p className="text-2xl font-bold">{analytics.followers}</p><p className="text-xs text-muted-foreground">Followers</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><Code2 className="h-5 w-5 mx-auto mb-1 text-muted-foreground" /><p className="text-2xl font-bold">{analytics.publicRepos}</p><p className="text-xs text-muted-foreground">Repositories</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><Star className="h-5 w-5 mx-auto mb-1 text-muted-foreground" /><p className="text-2xl font-bold">{analytics.topRepos?.reduce((a: number, r: any) => a + r.stars, 0) || 0}</p><p className="text-xs text-muted-foreground">Total Stars</p></CardContent></Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-lg">Language Distribution</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1 text-xs font-medium">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      {entry.name}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Top Repositories (Stars)</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis fontSize={10} tickLine={false} axisLine={false} />
                      <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="stars" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-lg">Recent Repositories</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {analytics.topRepos?.slice(0, 6).map((repo: any) => (
                <a key={repo.name} href={repo.url} target="_blank" rel="noopener noreferrer" className="block h-full">
                  <div className="rounded-xl border-2 border-border p-4 hover:border-foreground transition-colors h-full flex flex-col justify-between">
                    <div>
                      <p className="font-bold text-sm mb-1 line-clamp-1">{repo.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{repo.description || 'No description provided.'}</p>
                    </div>
                    <div className="flex gap-3 mt-4 text-xs font-medium text-muted-foreground">
                      {repo.language && <span className="flex items-center gap-1"><Code2 className="h-3 w-3"/> {repo.language}</span>}
                      <span className="flex items-center gap-1"><Star className="h-3 w-3" />{repo.stars}</span>
                      <span className="flex items-center gap-1"><GitFork className="h-3 w-3" />{repo.forks}</span>
                    </div>
                  </div>
                </a>
              ))}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Github className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Connect GitHub</h3>
            <p className="text-sm text-muted-foreground mb-4">Link your GitHub account to see analytics and score</p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add GitHub Username</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Connect GitHub</DialogTitle>
                  <DialogDescription>Enter your exact GitHub username to fetch your analytics.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input placeholder="e.g. torvalds" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} />
                  <Button 
                    className="w-full" 
                    disabled={!usernameInput || isUpdating}
                    onClick={async () => {
                      setIsUpdating(true);
                      try {
                        await apiService.github.updateUsername(usernameInput);
                        setDialogOpen(false);
                        refetch();
                        toast({ title: 'Success', description: 'GitHub username saved!' });
                      } catch (err: any) {
                        toast({ title: 'Error', description: err.response?.data?.error?.message || 'Failed to update username', variant: 'destructive' });
                      } finally {
                        setIsUpdating(false);
                      }
                    }}
                  >
                    {isUpdating ? 'Saving...' : 'Save Username'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
