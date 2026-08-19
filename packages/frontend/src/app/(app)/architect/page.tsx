'use client';

import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Component, Server, Database, Cloud, Code2, Loader2, Sparkles, CheckSquare, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import mermaid from 'mermaid';

export default function ArchitectPage() {
  const [idea, setIdea] = useState('');
  const [blueprint, setBlueprint] = useState<any>(null);
  const { toast } = useToast();
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: true, theme: 'dark' });
  }, []);

  useEffect(() => {
    if (blueprint?.mermaidArchitecture && mermaidRef.current) {
      let code = blueprint.mermaidArchitecture;
      // Sanitize the code by removing any potential markdown backticks
      code = code.replace(/```mermaid/gi, '').replace(/```/g, '').trim();
      
      mermaidRef.current.innerHTML = '';
      mermaid.render('mermaid-graph', code).then((result) => {
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = result.svg;
        }
      }).catch(err => {
        console.error('Mermaid render error', err);
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = `<div class="text-red-500 p-4 border border-red-500/50 bg-red-500/10 rounded-md">Error rendering architecture graph. The AI generated invalid syntax.</div><pre class="mt-4 p-4 bg-secondary/50 rounded-md text-xs overflow-auto">${code}</pre>`;
        }
      });
    }
  }, [blueprint]);

  const generateMutation = useMutation({
    mutationFn: () => apiService.architect.generateBlueprint({ idea }),
    onSuccess: (res) => {
      setBlueprint(res.data.data);
      toast({ title: 'Blueprint Generated', description: 'System architecture is ready.' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err?.response?.data?.error?.message || 'Failed to generate blueprint.', variant: 'destructive' });
    }
  });

  const handleGenerate = () => {
    if (!idea.trim()) return;
    generateMutation.mutate();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Component className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-black tracking-tight">Genesis Project Architect</h1>
        <p className="text-lg text-muted-foreground">
          Enter any massive project idea. Our Staff-Level AI will instantly draft a production-ready system architecture blueprint.
        </p>
      </div>

      <div className="flex gap-4 max-w-3xl mx-auto">
        <Input 
          className="h-14 text-lg px-6 rounded-full border-primary/20 bg-background/50 backdrop-blur-sm"
          placeholder="e.g., A decentralized Uber clone with real-time tracking..." 
          value={idea} 
          onChange={(e) => setIdea(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
        <Button 
          className="h-14 px-8 rounded-full font-bold text-lg" 
          onClick={handleGenerate} 
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
          {generateMutation.isPending ? 'Architecting...' : 'Build Blueprint'}
        </Button>
      </div>

      <AnimatePresence>
        {blueprint && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8 mt-12"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">{blueprint.title}</h2>
              <p className="text-muted-foreground text-lg max-w-4xl mx-auto">{blueprint.summary}</p>
            </div>

            <Card className="border-primary/20 shadow-lg overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-primary" /> System Architecture</CardTitle>
              </CardHeader>
              <CardContent className="p-8 overflow-x-auto">
                <div ref={mermaidRef} className="flex justify-center min-h-[300px]">
                  {/* Mermaid SVG will be injected here */}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-primary/10 bg-blue-500/5">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-blue-500 flex items-center gap-2"><Code2 className="h-4 w-4" /> Frontend</CardTitle></CardHeader>
                <CardContent><div className="flex flex-wrap gap-2">{blueprint.techStack?.frontend?.map((t: string) => <div key={t} className="px-2 py-1 bg-background rounded-md text-xs font-semibold border">{t}</div>)}</div></CardContent>
              </Card>
              <Card className="border-primary/10 bg-green-500/5">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-green-500 flex items-center gap-2"><Server className="h-4 w-4" /> Backend</CardTitle></CardHeader>
                <CardContent><div className="flex flex-wrap gap-2">{blueprint.techStack?.backend?.map((t: string) => <div key={t} className="px-2 py-1 bg-background rounded-md text-xs font-semibold border">{t}</div>)}</div></CardContent>
              </Card>
              <Card className="border-primary/10 bg-purple-500/5">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-purple-500 flex items-center gap-2"><Database className="h-4 w-4" /> Database</CardTitle></CardHeader>
                <CardContent><div className="flex flex-wrap gap-2">{blueprint.techStack?.database?.map((t: string) => <div key={t} className="px-2 py-1 bg-background rounded-md text-xs font-semibold border">{t}</div>)}</div></CardContent>
              </Card>
              <Card className="border-primary/10 bg-orange-500/5">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-orange-500 flex items-center gap-2"><Cloud className="h-4 w-4" /> DevOps</CardTitle></CardHeader>
                <CardContent><div className="flex flex-wrap gap-2">{blueprint.techStack?.devops?.map((t: string) => <div key={t} className="px-2 py-1 bg-background rounded-md text-xs font-semibold border">{t}</div>)}</div></CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-primary" /> Database Schema</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="p-4 bg-secondary/50 rounded-lg whitespace-pre-wrap font-mono text-sm">
                    {blueprint.databaseSchema}
                  </pre>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CheckSquare className="h-5 w-5 text-primary" /> Implementation Kanban</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {blueprint.kanbanSprints?.map((sprint: any, i: number) => (
                    <div key={i} className="space-y-3">
                      <h4 className="font-bold text-lg border-b pb-1">{sprint.sprintName}</h4>
                      <div className="space-y-2">
                        {sprint.tasks?.map((task: any, j: number) => (
                          <div key={j} className="p-3 bg-secondary/30 rounded-md border flex items-start justify-between gap-4">
                            <div>
                              <p className="font-semibold">{task.title}</p>
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                            </div>
                            <span className="text-xs px-2 py-1 bg-background border rounded-full whitespace-nowrap">{task.difficulty}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
