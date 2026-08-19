'use client';

import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Ghost, Brain, Play, Square, Loader2, FastForward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

type Message = { role: 'INTERVIEWER' | 'CANDIDATE', content: string };

export default function SimulatorPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<Message[]>([]);
  const [turn, setTurn] = useState<'INTERVIEWER' | 'CANDIDATE'>('INTERVIEWER');
  const [maxTurns, setMaxTurns] = useState(6); // 3 questions, 3 answers
  const { toast } = useToast();
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: profileData } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiService.auth.me().then((r: any) => r.data.data),
  });

  const simulateMutation = useMutation({
    mutationFn: (data: { role: 'INTERVIEWER' | 'CANDIDATE', history: Message[] }) => 
      apiService.simulator.simulateTurn({
        role: data.role,
        jobDescription,
        resumeText: profileData?.profile?.bio || 'Full stack developer',
        history: data.history
      }),
    onSuccess: (res, variables) => {
      const responseText = res.data.data.response;
      const newHistory = [...variables.history, { role: variables.role, content: responseText }];
      setHistory(newHistory);
      
      if (newHistory.length >= maxTurns) {
        setIsRunning(false);
      } else {
        const nextTurn = variables.role === 'INTERVIEWER' ? 'CANDIDATE' : 'INTERVIEWER';
        setTurn(nextTurn);
        
        // Trigger next turn automatically with a longer delay to prevent API rate limits (15 RPM free tier)
        setTimeout(() => {
          simulateMutation.mutate({ role: nextTurn, history: newHistory });
        }, 5000);
      }
    },
    onError: (err: any) => {
      setIsRunning(false);
      toast({
        title: 'Simulation Error',
        description: err?.response?.data?.error?.message || err.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, simulateMutation.isPending]);

  const startSimulation = () => {
    setHistory([]);
    setTurn('INTERVIEWER');
    setIsRunning(true);
    simulateMutation.reset();
    simulateMutation.mutate({ role: 'INTERVIEWER', history: [] });
  };

  const stopSimulation = () => {
    setIsRunning(false);
    simulateMutation.reset();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8">
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-foreground/10 rounded-full mb-2">
          <Ghost className="h-8 w-8 text-foreground" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Neural Twin Simulator</h1>
        <p className="text-lg text-muted-foreground">
          Enter a job description and watch an AI Recruiter interview your Neural Twin (an AI trained on your resume).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <Card className="lg:col-span-1 border-border shadow-sm h-fit">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-xl">Simulation Config</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold tracking-tight">Target Job Description</label>
              <Textarea 
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                className="min-h-[150px] resize-none"
                placeholder="Paste the job description here..."
                disabled={isRunning}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold tracking-tight">Twin Profile</label>
              <div className="p-3 bg-secondary/50 rounded-md text-xs text-muted-foreground">
                {profileData?.profile?.bio ? 'Using data from your dev profile.' : 'Using default twin data (please fill profile for accuracy).'}
              </div>
            </div>
            
            <div className="pt-4 border-t">
              {!isRunning ? (
                <Button onClick={startSimulation} className="w-full font-bold h-12 bg-foreground hover:bg-foreground/90 text-background">
                  <Play className="h-5 w-5 mr-2" /> Start Simulation
                </Button>
              ) : (
                <Button onClick={stopSimulation} variant="destructive" className="w-full font-bold h-12">
                  <Square className="h-5 w-5 mr-2" /> Abort Simulation
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Arena */}
        <Card className="lg:col-span-2 border-border shadow-sm flex flex-col h-[600px] overflow-hidden">
          <CardHeader className="bg-muted/30 border-b py-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full bg-foreground flex items-center justify-center border-2 border-background z-10">
                  <Brain className="h-4 w-4 text-background" />
                </div>
                <div className="h-8 w-8 rounded-full bg-muted-foreground flex items-center justify-center border-2 border-background z-0">
                  <Ghost className="h-4 w-4 text-background" />
                </div>
              </div>
              <CardTitle className="text-lg">Live AI Arena</CardTitle>
            </div>
            {isRunning && (
              <div className="flex items-center gap-2 text-xs font-bold text-green-500 animate-pulse">
                <div className="h-2 w-2 rounded-full bg-green-500"></div> SIMULATION ACTIVE
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0 flex-1 relative bg-black/5 dark:bg-black/40">
            <ScrollArea className="h-[520px] p-6" ref={scrollRef}>
              <div className="space-y-6 pb-20">
                {history.length === 0 && !isRunning && (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground pt-32">
                    <Ghost className="h-16 w-16 mb-4 opacity-20" />
                    <p>Configure and start the simulation.</p>
                  </div>
                )}
                
                <AnimatePresence>
                  {history.map((msg, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex w-full ${msg.role === 'CANDIDATE' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[80%] ${msg.role === 'CANDIDATE' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${msg.role === 'INTERVIEWER' ? 'bg-foreground' : 'bg-muted-foreground'}`}>
                          {msg.role === 'INTERVIEWER' ? <Brain className="h-5 w-5 text-background" /> : <Ghost className="h-5 w-5 text-background" />}
                        </div>
                        <div className={`p-4 rounded-2xl ${msg.role === 'CANDIDATE' ? 'bg-foreground text-background rounded-tr-none' : 'bg-background border-2 border-foreground rounded-tl-none'}`}>
                          <p className="text-sm font-bold mb-1 opacity-70">{msg.role === 'INTERVIEWER' ? 'Recruiter AI' : 'Your Neural Twin'}</p>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isRunning && simulateMutation.isPending && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`flex w-full mt-6 ${turn === 'CANDIDATE' ? 'justify-end' : 'justify-start'}`}
                    >
                       <div className={`flex gap-3 items-center ${turn === 'CANDIDATE' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${turn === 'INTERVIEWER' ? 'bg-foreground/50' : 'bg-muted-foreground/50'}`}>
                          <Loader2 className="h-4 w-4 text-background animate-spin" />
                        </div>
                        <div className="text-xs text-muted-foreground font-bold tracking-widest animate-pulse">
                          {turn === 'INTERVIEWER' ? 'RECRUITER IS TYPING...' : 'TWIN IS THINKING...'}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {!isRunning && history.length > 0 && (
                  <div className="text-center pt-8 pb-4">
                    <Badge variant="outline" className="bg-background text-muted-foreground">Simulation Concluded</Badge>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
