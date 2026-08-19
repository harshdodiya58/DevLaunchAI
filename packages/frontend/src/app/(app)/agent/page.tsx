"use client";

import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bot, Power, Terminal, MapPin, Target, Activity, BarChart3, CheckCircle2, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AgentPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<any>(null);
  
  const { data: serverConfig, refetch: refetchConfig } = useQuery({
    queryKey: ['autonomous-config'],
    queryFn: () => apiService.autonomous.getConfig().then(r => r.data.data),
  });

  const { data: logs, refetch: refetchLogs } = useQuery({
    queryKey: ['autonomous-logs'],
    queryFn: () => apiService.autonomous.getLogs().then(r => r.data.data),
    refetchInterval: serverConfig?.isActive ? 2000 : false, // Poll every 2 seconds if active
  });

  useEffect(() => {
    if (serverConfig) setConfig(serverConfig);
  }, [serverConfig]);

  const handleToggle = async (checked: boolean) => {
    setConfig({ ...config, isActive: checked });
    try {
      await apiService.autonomous.updateConfig({ isActive: checked });
      toast({ title: checked ? 'Agent Activated' : 'Agent Deactivated', description: checked ? 'The AI is now running autonomously.' : 'The AI has been paused.' });
      refetchConfig();
      refetchLogs();
    } catch (err) {
      setConfig({ ...config, isActive: !checked });
      toast({ title: 'Error', description: 'Failed to toggle agent.', variant: 'destructive' });
    }
  };

  const saveConfig = async () => {
    try {
      await apiService.autonomous.updateConfig({
        targetRole: config.targetRole,
        location: config.location,
        maxApplicationsPerDay: Number(config.maxApplicationsPerDay) || 5
      });
      toast({ title: 'Config Saved', description: 'Agent parameters updated.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save config.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Autonomous AI Agent</h1>
          <p className="text-xl font-light text-muted-foreground mt-1">
            Your dedicated proxy recruiter. It finds jobs, writes cover letters, and applies for you.
          </p>
        </div>
        <Badge variant={config?.isActive ? 'default' : 'secondary'} className="text-sm py-1 px-3">
          {config?.isActive ? (
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span> Active</span>
          ) : (
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-zinc-500"></span> Sleeping</span>
          )}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg"><Zap className="h-6 w-6 text-primary" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Today's Quota</p>
              <h3 className="text-2xl font-bold">{config?.maxApplicationsPerDay || 0} Jobs</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg"><CheckCircle2 className="h-6 w-6 text-green-500" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <h3 className="text-2xl font-bold text-green-500">{config?.isActive ? 'Running' : 'Standing By'}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg"><BarChart3 className="h-6 w-6 text-blue-500" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Actions Logged</p>
              <h3 className="text-2xl font-bold text-blue-500">{logs?.length || 0}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-primary/20 shadow-sm relative overflow-hidden h-fit">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50"></div>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Control Panel
              <Switch checked={!!config?.isActive} onCheckedChange={handleToggle} />
            </CardTitle>
            <CardDescription>Configure the agent's target parameters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground"><Target className="h-4 w-4" /> Target Role</Label>
              <Input 
                value={config?.targetRole || ''} 
                onChange={(e) => setConfig({...config, targetRole: e.target.value})}
                disabled={config?.isActive}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> Location</Label>
              <Input 
                value={config?.location || ''} 
                onChange={(e) => setConfig({...config, location: e.target.value})}
                disabled={config?.isActive}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground"><Activity className="h-4 w-4" /> Max Apps / Day</Label>
              <Input 
                type="number"
                value={config?.maxApplicationsPerDay || ''} 
                onChange={(e) => setConfig({...config, maxApplicationsPerDay: e.target.value})}
                disabled={config?.isActive}
              />
            </div>
            <Button className="w-full mt-4" onClick={saveConfig} disabled={config?.isActive}>
              Save Configuration
            </Button>
            {config?.isActive && (
              <p className="text-xs text-center text-muted-foreground mt-2">Pause the agent to edit configuration.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-black text-green-500 border-zinc-800 font-mono flex flex-col h-[500px]">
          <CardHeader className="border-b border-zinc-800 pb-4">
            <CardTitle className="text-zinc-300 flex items-center gap-2 text-sm">
              <Terminal className="h-4 w-4" /> root@devlaunch-ai-agent:~
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-4 overflow-y-auto space-y-2 text-sm">
            {!logs ? (
              <div className="animate-pulse">Initializing terminal...</div>
            ) : logs.length === 0 ? (
              <div className="text-zinc-500">Waiting for agent to activate...</div>
            ) : (
              logs.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3">
                  <span className="text-zinc-500 min-w-[140px]">
                    [{new Date(log.createdAt).toLocaleTimeString()}]
                  </span>
                  <span className={log.status === 'SUCCESS' ? 'text-blue-400' : log.status === 'ERROR' ? 'text-red-400' : 'text-green-500'}>
                    {log.action}
                  </span>
                </div>
              ))
            )}
            {config?.isActive && (
              <div className="flex items-center gap-2 mt-4 text-zinc-500">
                <span className="animate-pulse">_</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
