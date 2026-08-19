'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, CheckCircle2, ArrowLeft, ExternalLink, Compass } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RESOURCE_LINKS: Record<string, string> = {
  'MDN Web Docs': 'https://developer.mozilla.org/',
  'freeCodeCamp Responsive Web Design': 'https://www.freecodecamp.org/learn/responsive-web-design/',
  'JavaScript.info': 'https://javascript.info/',
  'You Don\'t Know JS': 'https://github.com/getify/You-Dont-Know-JS',
  'GitHub Skills': 'https://skills.github.com/',
  'Pro Git Book': 'https://git-scm.com/book/en/v2',
  'React Docs': 'https://react.dev/',
  'Epic React': 'https://epicreact.dev/',
  'Zustand Docs': 'https://docs.pmnd.rs/zustand/getting-started/introduction',
  'Redux Toolkit Docs': 'https://redux-toolkit.js.org/',
  'Vitest': 'https://vitest.dev/',
  'React Testing Library': 'https://testing-library.com/docs/react-testing-library/intro/',
  'TypeScript Handbook': 'https://www.typescriptlang.org/docs/handbook/intro.html',
  'Total TypeScript': 'https://www.totaltypescript.com/',
  'React Patterns': 'https://reactpatterns.com/',
  'Advanced React Course': 'https://advancedreact.com/',
  'Node.js Docs': 'https://nodejs.org/en/docs/',
  'The Odin Project': 'https://www.theodinproject.com/',
  'Express Docs': 'https://expressjs.com/',
  'REST API Tutorial': 'https://restfulapi.net/',
  'PostgreSQL Tutorial': 'https://www.postgresqltutorial.com/',
  'MongoDB University': 'https://learn.mongodb.com/',
  'JWT.io': 'https://jwt.io/',
  'Passport.js Docs': 'https://www.passportjs.org/',
  'Jest': 'https://jestjs.io/',
  'Supertest': 'https://github.com/ladjs/supertest',
  'Docker Docs': 'https://docs.docker.com/',
  'Docker Curriculum': 'https://docker-curriculum.com/',
  'AWS Basics': 'https://aws.amazon.com/getting-started/',
  'Railway Docs': 'https://docs.railway.app/',
  'System Design Primer': 'https://github.com/donnemartin/system-design-primer',
  'High Scalability': 'http://highscalability.com/',
  'Prisma Docs': 'https://www.prisma.io/docs/',
  'REST API Design': 'https://restfulapi.net/',
  'Apollo GraphQL': 'https://www.apollographql.com/docs/',
  'OWASP Top 10': 'https://owasp.org/www-project-top-ten/',
  'JWT Handbook': 'https://auth0.com/resources/ebooks/jwt-handbook',
  'Vercel Docs': 'https://vercel.com/docs',
  'GitHub Actions': 'https://docs.github.com/en/actions',
  'Sentry Docs': 'https://docs.sentry.io/',
  'Datadog Basics': 'https://docs.datadoghq.com/',
  'Linux Journey': 'https://linuxjourney.com/',
  'Ubuntu Tutorials': 'https://ubuntu.com/tutorials',
  'Computer Networking Course': 'https://www.coursera.org/specializations/computer-communications',
  'Khan Academy': 'https://www.khanacademy.org/',
  'Bash Guide': 'https://mywiki.wooledge.org/BashGuide',
  'Python Automate': 'https://automatetheboringstuff.com/',
  'Kubernetes Basics': 'https://kubernetes.io/docs/tutorials/kubernetes-basics/',
  'Jenkins Docs': 'https://www.jenkins.io/doc/',
  'AWS Free Tier': 'https://aws.amazon.com/free/',
  'Google Cloud Skills Boost': 'https://www.cloudskillsboost.google/',
  'Terraform Docs': 'https://developer.hashicorp.com/terraform/docs',
  'Ansible Docs': 'https://docs.ansible.com/',
  'Prometheus Docs': 'https://prometheus.io/docs/introduction/overview/',
  'Grafana Tutorials': 'https://grafana.com/tutorials/',
  'Python.org': 'https://www.python.org/',
  'NumPy Docs': 'https://numpy.org/doc/',
  '3Blue1Brown': 'https://www.3blue1brown.com/',
  'Andrew Ng ML Course': 'https://www.coursera.org/specializations/machine-learning-introduction',
  'Scikit-learn Docs': 'https://scikit-learn.org/stable/',
  'Fast.ai': 'https://www.fast.ai/',
  'PyTorch Tutorials': 'https://pytorch.org/tutorials/',
  'Hugging Face Course': 'https://huggingface.co/course/chapter1/1',
  'CS231n': 'http://cs231n.stanford.edu/',
  'MLflow Docs': 'https://mlflow.org/docs/latest/index.html',
  'BentoML': 'https://docs.bentoml.org/en/latest/'
};

export default function RoadmapsPage() {
  const [selected, setSelected] = useState<string | null>(null);

  const { data: roadmaps, isLoading } = useQuery({
    queryKey: ['roadmaps'],
    queryFn: () => apiService.roadmaps.getAll().then(r => r.data.data),
  });

  if (selected) {
    return <RoadmapDetail id={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-4 rounded-xl">
          <Compass className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Learning Roadmaps</h1>
          <p className="text-xl font-light text-muted-foreground mt-1">Structured paths to accelerate your career.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {roadmaps?.map((r: any, i: number) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card
                  className="cursor-pointer border-2 border-transparent hover:border-foreground bg-muted/20 hover:bg-muted/40 transition-all group h-full flex flex-col shadow-sm hover:shadow-lg"
                  onClick={() => setSelected(r.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline" className="border-foreground/20 font-bold px-3 py-1 bg-background">
                        {r.category}
                      </Badge>
                      <MapPin className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <CardTitle className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors">{r.title}</CardTitle>
                    <CardDescription className="text-sm font-medium mt-2">{r.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-4 flex flex-col border-t border-border/50">
                    {r.progress && (
                      <div className="mb-4">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Progress</span>
                          <span className="text-xs font-bold">{r.progress.percentComplete || 0}%</span>
                        </div>
                        <Progress value={r.progress.percentComplete || 0} className="h-2" />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{r.nodes?.length || 0} Modules</p>
                      <ArrowLeft className="h-5 w-5 text-muted-foreground rotate-180 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function RoadmapDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['roadmap', id],
    queryFn: () => apiService.roadmaps.getById(id).then(r => r.data.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ nodeId, completed }: { nodeId: string, completed: boolean }) => apiService.roadmaps.updateProgress(id, { nodeId, completed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roadmap', id] }),
  });

  if (isLoading || !data) {
    return <div className="space-y-6 max-w-4xl mx-auto py-8"><Skeleton className="h-32 w-full" /><Skeleton className="h-96 w-full" /></div>;
  }

  const { roadmap, progress } = data;
  const nodes = roadmap.nodes || [];
  const completedNodes = progress?.completedNodes || [];
  const percentComplete = progress?.percentComplete || 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-border">
        <Button variant="outline" className="h-14 w-14 rounded-full border-2 border-border p-0 flex-shrink-0 hover:bg-foreground hover:text-background transition-colors" onClick={onBack}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex-1">
          <Badge className="mb-2 uppercase tracking-widest font-bold">{roadmap.category}</Badge>
          <h2 className="text-4xl font-black tracking-tight">{roadmap.title}</h2>
          <p className="text-lg text-muted-foreground mt-2">{roadmap.description}</p>
        </div>
      </div>

      <Card className="border-2 border-foreground bg-background shadow-md overflow-hidden relative">
        <div className="absolute top-0 left-0 h-1 bg-primary w-full" style={{ width: `${percentComplete}%`, transition: 'width 0.5s ease-in-out' }} />
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">Journey Progress</span>
            <span className="text-xl font-bold">{percentComplete}% <span className="text-sm text-muted-foreground font-medium">({completedNodes.length}/{nodes.length})</span></span>
          </div>
          <Progress value={percentComplete} className="h-3" />
        </CardContent>
      </Card>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-border">
        {nodes.map((node: any, i: number) => {
          const isCompleted = completedNodes.includes(node.id);

          return (
            <div key={node.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className={`flex items-center justify-center w-14 h-14 rounded-full border-4 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-300 z-10
                ${isCompleted ? 'bg-primary border-primary-foreground text-primary-foreground' : 'bg-background border-border text-muted-foreground group-hover:border-primary/50'}`}>
                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <span className="font-bold">{i + 1}</span>}
              </div>

              <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-3.5rem)] p-6 rounded-2xl border-2 transition-all duration-300
                ${isCompleted ? 'border-primary/50 bg-primary/5 shadow-md' : 'border-border bg-card hover:border-foreground'}`}>

                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-xl">{node.title}</h3>
                    <Badge variant="secondary" className="mt-2 font-mono text-xs">{node.duration}</Badge>
                  </div>
                </div>

                {node.resources && node.resources.length > 0 && (
                  <div className="mb-6 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Resources</p>
                    <ul className="space-y-2">
                      {node.resources.map((res: string, idx: number) => {
                        const link = RESOURCE_LINKS[res] || `https://www.google.com/search?q=${encodeURIComponent(res + ' tutorial')}`;
                        return (
                          <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer group/link">
                            <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 w-full">
                              <ExternalLink className="h-3 w-3 group-hover/link:text-primary" /> {res}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <Button
                  className={`w-full font-bold border-2 transition-all ${isCompleted ? 'bg-background text-foreground border-foreground hover:bg-muted' : 'bg-foreground text-background hover:bg-foreground/90'}`}
                  variant={isCompleted ? 'outline' : 'default'}
                  onClick={() => updateMutation.mutate({ nodeId: node.id, completed: !isCompleted })}
                  disabled={updateMutation.isPending}
                >
                  {isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
