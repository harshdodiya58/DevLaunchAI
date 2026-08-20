'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Plus, Trash2, Download, Eye, Wand2, Loader2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function ResumePage() {
  const [activeTab, setActiveTab] = useState('builder');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [resumeTitle, setResumeTitle] = useState('My Resume');
  const [selectedTemplate, setSelectedTemplate] = useState('modern-minimal');

  const templates = [
    { id: 'modern-minimal', name: 'Modern Minimal', description: 'Clean, standard ATS-optimized.' },
    { id: 'executive-black', name: 'Executive Black', description: 'High-contrast bold header.' },
    { id: 'startup-clean', name: 'Startup Clean', description: 'Modern with subtle blue accents.' }
  ];

  const [formData, setFormData] = useState({
    personalInfo: { fullName: '', role: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '' },
    summary: '',
    education: [] as { school: string; degree: string; year: string }[],
    experience: [] as { company: string; role: string; duration: string; bullets: string[] }[],
    projects: [] as { name: string; tech: string; link: string; bullets: string[] }[],
    skills: [] as string[],
  });

  const [skillInput, setSkillInput] = useState('');
  const [improvingBullet, setImprovingBullet] = useState<{ index: number; expIndex: number; isProject?: boolean } | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleExportPDF = () => {
    // Close the preview modal first so Radix UI unlocks the body and removes problematic portals
    setPreviewOpen(false);
    
    // Wait for the modal exit animation to finish before triggering print
    setTimeout(() => {
      window.print();
    }, 400);
  };


  const { data: resumes, isLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => apiService.resumes.list().then(r => r.data.data),
  });

  const improveMutation = useMutation({
    mutationFn: (data: { bullet: string; role?: string; company?: string }) =>
      apiService.resumes.improveBullet(data),
    onSuccess: (res) => {
      if (improvingBullet) {
        if (improvingBullet.isProject) {
          const updated = [...formData.projects];
          updated[improvingBullet.expIndex].bullets[improvingBullet.index] = res.data.data.improved;
          setFormData(f => ({ ...f, projects: updated }));
        } else {
          const updated = [...formData.experience];
          updated[improvingBullet.expIndex].bullets[improvingBullet.index] = res.data.data.improved;
          setFormData(f => ({ ...f, experience: updated }));
        }
        toast({ title: 'Bullet Improved', description: 'AI successfully optimized your bullet point.' });
      }
    },
    onError: (err: any) => {
      toast({ title: 'AI Request Failed', description: err?.response?.data?.error?.message || 'Failed to improve bullet.', variant: 'destructive' });
    },
    onSettled: () => setImprovingBullet(null),
  });

  const summaryMutation = useMutation({
    mutationFn: () => apiService.resumes.generateSummary({
      currentSummary: formData.summary,
      experience: formData.experience.map(e => `${e.role} at ${e.company}`).join(', '),
      skills: formData.skills
    }),
    onSuccess: (res) => {
      setFormData(f => ({ ...f, summary: res.data.data.summary }));
      toast({ title: 'Summary Generated', description: 'AI successfully generated your professional summary.' });
    },
    onError: (err: any) => {
      toast({ title: 'AI Request Failed', description: err?.response?.data?.error?.message || 'Error generating summary.', variant: 'destructive' });
    },
  });

  const addEducation = () => setFormData(f => ({ ...f, education: [...f.education, { school: '', degree: '', year: '' }] }));
  const addExperience = () => setFormData(f => ({ ...f, experience: [...f.experience, { company: '', role: '', duration: '', bullets: [''] }] }));
  const addProject = () => setFormData(f => ({ ...f, projects: [...f.projects, { name: '', tech: '', link: '', bullets: [''] }] }));
  const addSkill = () => { if (skillInput.trim()) { setFormData(f => ({ ...f, skills: [...f.skills, skillInput.trim()] })); setSkillInput(''); } };

  const handleBulletImprove = async (expIndex: number, bulletIndex: number, isProject: boolean = false) => {
    const bullet = isProject ? formData.projects[expIndex]?.bullets[bulletIndex] : formData.experience[expIndex]?.bullets[bulletIndex];
    if (!bullet) return;
    setImprovingBullet({ index: bulletIndex, expIndex, isProject });
    improveMutation.mutate({
      bullet,
      role: isProject ? formData.projects[expIndex].name : formData.experience[expIndex].role,
      company: isProject ? 'Personal Project' : formData.experience[expIndex].company,
    });
  };

  const saveMutation = useMutation({
    mutationFn: () => apiService.resumes.create({ title: resumeTitle, content: formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast({ title: 'Resume Saved', description: 'Your resume has been saved successfully.' });
    },
    onError: (err: any) => {
      toast({ title: 'Save Failed', description: err?.response?.data?.error?.message || 'Failed to save resume.', variant: 'destructive' });
    }
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; }
          @page { size: letter portrait; margin: 0; }
          /* Hide all toasts and floating portals during print */
          [data-sonner-toaster], [data-radix-toast-viewport], [role="status"], [role="alert"], [role="region"][aria-label="Notifications"] { display: none !important; }
          /* Hide the main UI */
          .print-hidden-ui { display: none !important; }
          
          /* Strict page break rules */
          .avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: block !important;
          }
        }
      ` }} />
      <div className="space-y-8 max-w-7xl mx-auto py-8 print-hidden-ui">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">Resume Engine</h1>
            <p className="text-xl font-light text-muted-foreground mt-1">Construct mathematically perfect, ATS-optimized professional resumes.</p>
          </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 h-12 border-2 border-foreground font-bold hover:bg-foreground hover:text-background" onClick={() => setPreviewOpen(true)}><Eye className="h-4 w-4" /> Preview</Button>
          <Button className="gap-2 h-12 bg-foreground text-background font-bold hover:bg-foreground/90" onClick={() => window.print()}><Download className="h-4 w-4" /> Export PDF</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start h-14 bg-muted/50 p-1 mb-8 border border-border rounded-xl">
          <TabsTrigger value="builder" className="text-base font-semibold px-8 h-12 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">Builder</TabsTrigger>
          <TabsTrigger value="templates" className="text-base font-semibold px-8 h-12 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">Templates</TabsTrigger>
          <TabsTrigger value="versions" className="text-base font-semibold px-8 h-12 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">Versions ({resumes?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-8">
          <Input
            value={resumeTitle}
            onChange={(e) => setResumeTitle(e.target.value)}
            className="text-2xl font-black max-w-md h-16 border-2 focus-visible:ring-0 focus-visible:border-foreground"
            placeholder="Resume Title"
          />

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="border border-border hover:border-foreground/50 transition-colors">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/20 border-b border-border pb-6">
                <div><CardTitle className="text-xl font-bold">Personal Information</CardTitle><CardDescription>Your contact details and links.</CardDescription></div>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="font-bold text-xs uppercase text-muted-foreground">Full Name</Label><Input value={formData.personalInfo.fullName} onChange={e => setFormData(f => ({ ...f, personalInfo: { ...f.personalInfo, fullName: e.target.value } }))} placeholder="e.g. John Doe" /></div>
                <div className="space-y-2"><Label className="font-bold text-xs uppercase text-muted-foreground">Job Title</Label><Input value={formData.personalInfo.role} onChange={e => setFormData(f => ({ ...f, personalInfo: { ...f.personalInfo, role: e.target.value } }))} placeholder="e.g. Senior Software Engineer" /></div>
                <div className="space-y-2"><Label className="font-bold text-xs uppercase text-muted-foreground">Email</Label><Input type="email" value={formData.personalInfo.email} onChange={e => setFormData(f => ({ ...f, personalInfo: { ...f.personalInfo, email: e.target.value } }))} placeholder="e.g. john@example.com" /></div>
                <div className="space-y-2"><Label className="font-bold text-xs uppercase text-muted-foreground">Phone</Label><Input value={formData.personalInfo.phone} onChange={e => setFormData(f => ({ ...f, personalInfo: { ...f.personalInfo, phone: e.target.value } }))} placeholder="e.g. +1 234 567 890" /></div>
                <div className="space-y-2"><Label className="font-bold text-xs uppercase text-muted-foreground">Location</Label><Input value={formData.personalInfo.location} onChange={e => setFormData(f => ({ ...f, personalInfo: { ...f.personalInfo, location: e.target.value } }))} placeholder="e.g. San Francisco, CA" /></div>
                <div className="space-y-2"><Label className="font-bold text-xs uppercase text-muted-foreground">LinkedIn URL</Label><Input value={formData.personalInfo.linkedin} onChange={e => setFormData(f => ({ ...f, personalInfo: { ...f.personalInfo, linkedin: e.target.value } }))} placeholder="linkedin.com/in/johndoe" /></div>
                <div className="space-y-2"><Label className="font-bold text-xs uppercase text-muted-foreground">GitHub URL</Label><Input value={formData.personalInfo.github} onChange={e => setFormData(f => ({ ...f, personalInfo: { ...f.personalInfo, github: e.target.value } }))} placeholder="github.com/johndoe" /></div>
                <div className="space-y-2"><Label className="font-bold text-xs uppercase text-muted-foreground">Portfolio URL</Label><Input value={formData.personalInfo.portfolio} onChange={e => setFormData(f => ({ ...f, personalInfo: { ...f.personalInfo, portfolio: e.target.value } }))} placeholder="johndoe.com" /></div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border border-border hover:border-foreground/50 transition-colors">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/20 border-b border-border pb-6">
                <div><CardTitle className="text-xl font-bold">Professional Summary</CardTitle><CardDescription>Let AI synthesize your profile into a powerful opener.</CardDescription></div>
                <Button variant="outline" size="sm" className="gap-2 font-bold border-2" onClick={() => summaryMutation.mutate()} disabled={summaryMutation.isPending}>
                  {summaryMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {summaryMutation.isPending ? 'Generating...' : 'AI Generate'}
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                <textarea
                  className="w-full min-h-[120px] rounded-md border border-input bg-transparent p-4 text-base focus-visible:ring-foreground focus-visible:border-foreground resize-none"
                  value={formData.summary}
                  onChange={(e) => setFormData(f => ({ ...f, summary: e.target.value }))}
                  placeholder="Write a brief professional summary or use AI to generate one..."
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border border-border hover:border-foreground/50 transition-colors">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/20 border-b border-border pb-6">
                <div><CardTitle className="text-xl font-bold">Experience</CardTitle><CardDescription>Your career history</CardDescription></div>
                <Button variant="outline" size="sm" className="gap-2 font-bold border-2" onClick={addExperience}><Plus className="h-4 w-4" /> Add Role</Button>
              </CardHeader>
              <CardContent className="space-y-8 pt-6">
                {formData.experience.map((exp, ei) => (
                  <div key={ei} className="rounded-xl border-2 border-border p-6 space-y-6 relative group">
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10" onClick={() => setFormData(f => ({ ...f, experience: f.experience.filter((_, i) => i !== ei) }))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-10">
                      <div className="space-y-2"><Label className="font-bold uppercase text-xs text-muted-foreground">Company</Label><Input className="h-12" value={exp.company} onChange={(e) => { const u = [...formData.experience]; u[ei].company = e.target.value; setFormData(f => ({ ...f, experience: u })); }} /></div>
                      <div className="space-y-2"><Label className="font-bold uppercase text-xs text-muted-foreground">Role</Label><Input className="h-12" value={exp.role} onChange={(e) => { const u = [...formData.experience]; u[ei].role = e.target.value; setFormData(f => ({ ...f, experience: u })); }} /></div>
                      <div className="space-y-2"><Label className="font-bold uppercase text-xs text-muted-foreground">Duration</Label><Input className="h-12" placeholder="e.g. Jan 2022 - Present" value={exp.duration} onChange={(e) => { const u = [...formData.experience]; u[ei].duration = e.target.value; setFormData(f => ({ ...f, experience: u })); }} /></div>
                    </div>
                    <div className="space-y-3">
                      <Label className="font-bold uppercase text-xs text-muted-foreground">Bullet Points</Label>
                      {exp.bullets.map((bullet, bi) => (
                        <div key={bi} className="flex gap-2 items-start">
                          <textarea className="flex-1 min-h-[60px] rounded-md border border-input bg-transparent p-3 text-sm focus-visible:ring-foreground focus-visible:border-foreground resize-none" value={bullet} onChange={(e) => { const u = [...formData.experience]; u[ei].bullets[bi] = e.target.value; setFormData(f => ({ ...f, experience: u })); }} placeholder="Describe your achievement..." />
                          <div className="flex flex-col gap-2">
                            <Button variant="outline" size="icon" className="border-2 border-foreground/20 hover:border-foreground hover:bg-foreground hover:text-background" onClick={() => handleBulletImprove(ei, bi, false)} disabled={improvingBullet?.expIndex === ei && improvingBullet?.index === bi && !improvingBullet.isProject} title="AI Improve">
                              {improvingBullet?.expIndex === ei && improvingBullet?.index === bi && !improvingBullet.isProject ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => { const u = [...formData.experience]; u[ei].bullets = u[ei].bullets.filter((_, i) => i !== bi); setFormData(f => ({ ...f, experience: u })); }}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" className="font-medium" onClick={() => { const u = [...formData.experience]; u[ei].bullets.push(''); setFormData(f => ({ ...f, experience: u })); }}><Plus className="h-4 w-4 mr-1" /> Add bullet</Button>
                    </div>
                  </div>
                ))}
                {formData.experience.length === 0 && <p className="text-center text-muted-foreground py-4">No experience added yet.</p>}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="border border-border hover:border-foreground/50 transition-colors">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/20 border-b border-border pb-6">
                <div><CardTitle className="text-xl font-bold">Projects</CardTitle><CardDescription>Showcase your best technical work</CardDescription></div>
                <Button variant="outline" size="sm" className="gap-2 font-bold border-2" onClick={addProject}><Plus className="h-4 w-4" /> Add Project</Button>
              </CardHeader>
              <CardContent className="space-y-8 pt-6">
                {formData.projects.map((proj, ei) => (
                  <div key={ei} className="rounded-xl border-2 border-border p-6 space-y-6 relative group">
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10" onClick={() => setFormData(f => ({ ...f, projects: f.projects.filter((_, i) => i !== ei) }))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-10">
                      <div className="space-y-2"><Label className="font-bold uppercase text-xs text-muted-foreground">Project Name</Label><Input className="h-12" value={proj.name} onChange={(e) => { const u = [...formData.projects]; u[ei].name = e.target.value; setFormData(f => ({ ...f, projects: u })); }} /></div>
                      <div className="space-y-2"><Label className="font-bold uppercase text-xs text-muted-foreground">Technologies</Label><Input className="h-12" placeholder="e.g. React, Node.js" value={proj.tech} onChange={(e) => { const u = [...formData.projects]; u[ei].tech = e.target.value; setFormData(f => ({ ...f, projects: u })); }} /></div>
                      <div className="space-y-2"><Label className="font-bold uppercase text-xs text-muted-foreground">Link / URL</Label><Input className="h-12" placeholder="e.g. github.com/..." value={proj.link} onChange={(e) => { const u = [...formData.projects]; u[ei].link = e.target.value; setFormData(f => ({ ...f, projects: u })); }} /></div>
                    </div>
                    <div className="space-y-3">
                      <Label className="font-bold uppercase text-xs text-muted-foreground">Bullet Points</Label>
                      {proj.bullets.map((bullet, bi) => (
                        <div key={bi} className="flex gap-2 items-start">
                          <textarea className="flex-1 min-h-[60px] rounded-md border border-input bg-transparent p-3 text-sm focus-visible:ring-foreground focus-visible:border-foreground resize-none" value={bullet} onChange={(e) => { const u = [...formData.projects]; u[ei].bullets[bi] = e.target.value; setFormData(f => ({ ...f, projects: u })); }} placeholder="Describe your project contribution..." />
                          <div className="flex flex-col gap-2">
                            <Button variant="outline" size="icon" className="border-2 border-foreground/20 hover:border-foreground hover:bg-foreground hover:text-background" onClick={() => handleBulletImprove(ei, bi, true)} disabled={improvingBullet?.expIndex === ei && improvingBullet?.index === bi && improvingBullet.isProject} title="AI Improve">
                              {improvingBullet?.expIndex === ei && improvingBullet?.index === bi && improvingBullet.isProject ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => { const u = [...formData.projects]; u[ei].bullets = u[ei].bullets.filter((_, i) => i !== bi); setFormData(f => ({ ...f, projects: u })); }}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" className="font-medium" onClick={() => { const u = [...formData.projects]; u[ei].bullets.push(''); setFormData(f => ({ ...f, projects: u })); }}><Plus className="h-4 w-4 mr-1" /> Add bullet</Button>
                    </div>
                  </div>
                ))}
                {formData.projects.length === 0 && <p className="text-center text-muted-foreground py-4">No projects added yet.</p>}
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border border-border h-full">
                <CardHeader className="flex flex-row items-center justify-between bg-muted/20 border-b border-border">
                  <div><CardTitle className="text-xl font-bold">Skills</CardTitle></div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex gap-2 mb-6">
                    <Input className="h-12" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Type a skill and press Enter" onKeyDown={(e) => e.key === 'Enter' && addSkill()} />
                    <Button className="h-12 font-bold px-6 border-2" variant="outline" onClick={addSkill}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, i) => (
                      <Badge key={i} variant="outline" className="text-sm py-1.5 px-3 border-2 border-foreground/20 flex items-center gap-2">
                        {skill} <button className="hover:text-destructive" onClick={() => setFormData(f => ({ ...f, skills: f.skills.filter((_, j) => j !== i) }))}>×</button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="border border-border h-full">
                <CardHeader className="flex flex-row items-center justify-between bg-muted/20 border-b border-border">
                  <div><CardTitle className="text-xl font-bold">Education</CardTitle></div>
                  <Button variant="outline" size="sm" className="font-bold border-2" onClick={addEducation}><Plus className="h-4 w-4 mr-1" /> Add</Button>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  {formData.education.map((edu, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <Input placeholder="School" className="h-12" value={edu.school} onChange={(e) => { const u = [...formData.education]; u[i].school = e.target.value; setFormData(f => ({ ...f, education: u })); }} />
                      <Input placeholder="Degree" className="h-12" value={edu.degree} onChange={(e) => { const u = [...formData.education]; u[i].degree = e.target.value; setFormData(f => ({ ...f, education: u })); }} />
                      <Input placeholder="Year" className="h-12 w-24" value={edu.year} onChange={(e) => { const u = [...formData.education]; u[i].year = e.target.value; setFormData(f => ({ ...f, education: u })); }} />
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => setFormData(f => ({ ...f, education: f.education.filter((_, j) => j !== i) }))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  {formData.education.length === 0 && <p className="text-center text-muted-foreground text-sm">No education added yet.</p>}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="flex justify-end gap-4 pt-8">
            <Button variant="outline" className="h-14 px-8 text-base font-bold border-2" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>Save Draft</Button>
            <Button className="h-14 px-8 text-base font-bold bg-foreground text-background" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>Save Resume</Button>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            {templates.map((t) => (
              <Card
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`cursor-pointer border-2 transition-all group overflow-hidden ${selectedTemplate === t.id ? 'border-foreground ring-2 ring-foreground/20' : 'border-border hover:border-foreground/50'}`}
              >
                <CardContent className="p-0">
                  <div className={`h-48 flex items-center justify-center font-mono text-sm transition-colors ${selectedTemplate === t.id ? 'bg-foreground/5' : 'bg-muted/30 group-hover:bg-muted/50'}`}>
                    <div className="w-24 h-32 bg-white shadow-sm border border-gray-200 opacity-80 flex flex-col p-2 gap-1.5 transition-transform group-hover:scale-105">
                      {t.id === 'executive-black' ? (
                        <div className="h-6 w-full bg-black mb-1 rounded-sm"></div>
                      ) : (
                        <div className={`h-3 w-3/4 mx-auto mb-2 rounded-sm ${t.id === 'startup-clean' ? 'bg-blue-600' : 'bg-gray-800'}`}></div>
                      )}
                      <div className={`h-0.5 w-full ${t.id === 'startup-clean' ? 'bg-blue-200' : 'bg-gray-200'}`}></div>
                      <div className="h-1 w-full bg-gray-300 rounded-sm"></div>
                      <div className="h-1 w-5/6 bg-gray-300 rounded-sm"></div>
                      <div className="h-1 w-full bg-gray-300 rounded-sm"></div>
                      <div className={`h-0.5 w-full mt-2 ${t.id === 'startup-clean' ? 'bg-blue-200' : 'bg-gray-200'}`}></div>
                      <div className="h-1 w-full bg-gray-300 rounded-sm"></div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-border bg-card">
                    <p className="font-bold text-center flex items-center justify-center gap-2">
                      {t.name} {selectedTemplate === t.id && <Sparkles className="h-4 w-4 text-foreground" />}
                    </p>
                    <p className="text-xs text-center text-muted-foreground mt-1">{t.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="versions" className="mt-6">
          {isLoading ? (
            <div className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
          ) : resumes?.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground border-2 border-dashed border-border rounded-xl">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No resumes found</p>
              <p className="text-sm">Start building your first resume in the Builder tab.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {resumes?.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl border-2 border-border p-6 hover:border-foreground/50 transition-colors">
                  <div>
                    <p className="text-xl font-bold">{r.title}</p>
                    <p className="text-sm font-medium text-muted-foreground mt-1">v{r.version} · {r.atsScore ? `ATS Score: ${r.atsScore}/100` : 'Not scored'}</p>
                  </div>
                  <Badge variant="outline" className={`px-4 py-1.5 text-sm font-bold border-2 ${r.isDefault ? 'border-foreground bg-foreground text-background' : 'border-border'}`}>{r.isDefault ? 'Default' : 'Draft'}</Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl w-[1000px] max-h-[90vh] overflow-y-auto bg-gray-100 p-8">
          <div className={`p-10 bg-white font-sans w-[800px] mx-auto shadow-2xl border ${selectedTemplate === 'executive-black' ? 'text-gray-900' : 'text-black'}`} id="resume-preview">

            {/* Professional Header */}
            <div className={`text-center mb-8 ${selectedTemplate === 'executive-black' ? 'bg-black text-white p-8 -mx-10 -mt-10' : ''}`}>
              <h1 className={`text-4xl font-black tracking-tight mb-2 uppercase ${selectedTemplate === 'startup-clean' ? 'text-blue-700' : ''}`}>{formData.personalInfo.fullName || 'Your Name'}</h1>
              {formData.personalInfo.role && <h2 className={`text-xl font-bold mb-3 tracking-wide ${selectedTemplate === 'executive-black' ? 'text-gray-300' : 'text-gray-800'}`}>{formData.personalInfo.role}</h2>}

              <div className={`flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-sm font-medium ${selectedTemplate === 'executive-black' ? 'text-gray-400' : 'text-gray-700'}`}>
                {formData.personalInfo.email && <span>{formData.personalInfo.email}</span>}
                {(formData.personalInfo.email && formData.personalInfo.phone) && <span>|</span>}
                {formData.personalInfo.phone && <span>{formData.personalInfo.phone}</span>}
                {(formData.personalInfo.phone && formData.personalInfo.location) && <span>|</span>}
                {formData.personalInfo.location && <span>{formData.personalInfo.location}</span>}
              </div>
              <div className={`flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-sm font-medium mt-1 ${selectedTemplate === 'executive-black' ? 'text-gray-400' : 'text-gray-700'}`}>
                {formData.personalInfo.linkedin && <span>{formData.personalInfo.linkedin}</span>}
                {(formData.personalInfo.linkedin && formData.personalInfo.github) && <span>|</span>}
                {formData.personalInfo.github && <span>{formData.personalInfo.github}</span>}
                {(formData.personalInfo.github && formData.personalInfo.portfolio) && <span>|</span>}
                {formData.personalInfo.portfolio && <span>{formData.personalInfo.portfolio}</span>}
              </div>
            </div>

            {/* Summary */}
            {formData.summary && (
              <div className="mb-6">
                <h3 className={`text-sm font-bold uppercase tracking-widest border-b-[1.5px] pb-1 mb-3 ${selectedTemplate === 'startup-clean' ? 'border-blue-700 text-blue-700' : 'border-black text-black'}`}>Professional Summary</h3>
                <p className="text-sm leading-relaxed text-gray-900 whitespace-pre-wrap">{formData.summary}</p>
              </div>
            )}

            {/* Experience */}
            {formData.experience.length > 0 && (
              <div className="mb-6">
                <h3 className={`text-sm font-bold uppercase tracking-widest border-b-[1.5px] pb-1 mb-3 break-after-avoid ${selectedTemplate === 'startup-clean' ? 'border-blue-700 text-blue-700' : 'border-black text-black'}`}>Experience</h3>
                <div className="space-y-4">
                  {formData.experience.map((exp, i) => (
                    <div key={i} className="avoid-break mb-4">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-[15px] text-black">
                          {exp.role} <span className="font-medium text-gray-700">| {exp.company}</span>
                        </h4>
                        <span className="text-sm font-bold text-black">{exp.duration}</span>
                      </div>
                      <ul className="list-disc pl-5 text-sm space-y-1 text-gray-900">
                        {exp.bullets.filter(b => b.trim()).map((b, j) => (
                          <li key={j} className="leading-relaxed pl-1">{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {formData.projects.length > 0 && (
              <div className="mb-6">
                <h3 className={`text-sm font-bold uppercase tracking-widest border-b-[1.5px] pb-1 mb-3 break-after-avoid ${selectedTemplate === 'startup-clean' ? 'border-blue-700 text-blue-700' : 'border-black text-black'}`}>Projects</h3>
                <div className="space-y-4">
                  {formData.projects.map((proj, i) => (
                    <div key={i} className="avoid-break mb-4">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-[15px] text-black">
                          {proj.name}
                          {proj.tech && <span className="font-medium text-gray-700"> | {proj.tech}</span>}
                        </h4>
                        {proj.link && <span className="text-sm font-medium text-black">{proj.link}</span>}
                      </div>
                      <ul className="list-disc pl-5 text-sm space-y-1 text-gray-900">
                        {proj.bullets.filter(b => b.trim()).map((b, j) => (
                          <li key={j} className="leading-relaxed pl-1">{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {formData.education.length > 0 && (
              <div className="mb-6">
                <h3 className={`text-sm font-bold uppercase tracking-widest border-b-[1.5px] pb-1 mb-3 ${selectedTemplate === 'startup-clean' ? 'border-blue-700 text-blue-700' : 'border-black text-black'}`}>Education</h3>
                <div className="space-y-3">
                  {formData.education.map((edu, i) => (
                    <div key={i} className="flex justify-between items-baseline">
                      <h4 className="font-bold text-[15px] text-black">{edu.school}</h4>
                      <div className="text-right flex items-baseline gap-4">
                        <p className="text-sm font-medium text-gray-800">{edu.degree}</p>
                        <p className="text-sm font-bold text-black">{edu.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {formData.skills.length > 0 && (
              <div className="mb-2">
                <h3 className={`text-sm font-bold uppercase tracking-widest border-b-[1.5px] pb-1 mb-3 ${selectedTemplate === 'startup-clean' ? 'border-blue-700 text-blue-700' : 'border-black text-black'}`}>Skills</h3>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-900">
                  {formData.skills.map((skill, i) => (
                    <li key={i} className="leading-relaxed pl-1 font-medium">{skill}</li>
                  ))}
                </ul>
              </div>
            )}

          </div>
          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" onClick={() => setPreviewOpen(false)} className="h-12 px-8 font-bold border-2 text-black border-black/20 hover:border-black">Close Preview</Button>
            <Button onClick={handleExportPDF} className="h-12 px-8 gap-2 bg-black text-white font-bold hover:bg-black/90 shadow-xl"><Download className="h-4 w-4" /> Download PDF</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

    {/* Hidden dedicated print block */}
    <div className="hidden print:block w-full mx-auto font-sans leading-[1.3] bg-white text-black" id="resume-print-output">
        <div className={`w-full max-w-none px-12 py-12 ${selectedTemplate === 'executive-black' ? 'text-gray-900' : 'text-black'}`}>
          {/* Professional Header */}
          <div className={`text-center mb-8 ${selectedTemplate === 'executive-black' ? 'bg-black text-white p-8 -mx-10 -mt-10' : ''}`}>
            <h1 className={`text-4xl font-black tracking-tight mb-2 uppercase ${selectedTemplate === 'startup-clean' ? 'text-blue-700' : ''}`}>{formData.personalInfo.fullName || 'Your Name'}</h1>
            {formData.personalInfo.role && <h2 className={`text-xl font-bold mb-3 tracking-wide ${selectedTemplate === 'executive-black' ? 'text-gray-300' : 'text-gray-800'}`}>{formData.personalInfo.role}</h2>}

            <div className={`flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-sm font-medium ${selectedTemplate === 'executive-black' ? 'text-gray-400' : 'text-gray-700'}`}>
              {formData.personalInfo.email && <span>{formData.personalInfo.email}</span>}
              {(formData.personalInfo.email && formData.personalInfo.phone) && <span>|</span>}
              {formData.personalInfo.phone && <span>{formData.personalInfo.phone}</span>}
              {(formData.personalInfo.phone && formData.personalInfo.location) && <span>|</span>}
              {formData.personalInfo.location && <span>{formData.personalInfo.location}</span>}
            </div>
            <div className={`flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-sm font-medium mt-1 ${selectedTemplate === 'executive-black' ? 'text-gray-400' : 'text-gray-700'}`}>
              {formData.personalInfo.linkedin && <span>{formData.personalInfo.linkedin}</span>}
              {(formData.personalInfo.linkedin && formData.personalInfo.github) && <span>|</span>}
              {formData.personalInfo.github && <span>{formData.personalInfo.github}</span>}
              {(formData.personalInfo.github && formData.personalInfo.portfolio) && <span>|</span>}
              {formData.personalInfo.portfolio && <span>{formData.personalInfo.portfolio}</span>}
            </div>
          </div>

          {/* Summary */}
          {formData.summary && (
            <div className="mb-6">
              <h3 className={`text-sm font-bold uppercase tracking-widest border-b-[1.5px] pb-1 mb-3 ${selectedTemplate === 'startup-clean' ? 'border-blue-700 text-blue-700' : 'border-black text-black'}`}>Professional Summary</h3>
              <p className="text-sm leading-relaxed text-gray-900 whitespace-pre-wrap">{formData.summary}</p>
            </div>
          )}

          {/* Experience */}
          {formData.experience.length > 0 && (
            <div className="mb-6">
              <h3 className={`text-sm font-bold uppercase tracking-widest border-b-[1.5px] pb-1 mb-3 break-after-avoid ${selectedTemplate === 'startup-clean' ? 'border-blue-700 text-blue-700' : 'border-black text-black'}`}>Experience</h3>
              <div className="space-y-4">
                {formData.experience.map((exp, i) => (
                  <div key={i} className="avoid-break mb-4">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-[15px] text-black">
                        {exp.role} <span className="font-medium text-gray-700">| {exp.company}</span>
                      </h4>
                      <span className="text-sm font-bold text-black">{exp.duration}</span>
                    </div>
                    <ul className="list-disc pl-5 text-sm space-y-1 text-gray-900">
                      {exp.bullets.filter(b => b.trim()).map((b, j) => (
                        <li key={j} className="leading-relaxed pl-1">{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {formData.projects.length > 0 && (
            <div className="mb-6">
              <h3 className={`text-sm font-bold uppercase tracking-widest border-b-[1.5px] pb-1 mb-3 break-after-avoid ${selectedTemplate === 'startup-clean' ? 'border-blue-700 text-blue-700' : 'border-black text-black'}`}>Projects</h3>
              <div className="space-y-4">
                {formData.projects.map((proj, i) => (
                  <div key={i} className="avoid-break mb-4">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-[15px] text-black">
                        {proj.name}
                        {proj.tech && <span className="font-medium text-gray-700"> | {proj.tech}</span>}
                      </h4>
                      {proj.link && <span className="text-sm font-medium text-black">{proj.link}</span>}
                    </div>
                    <ul className="list-disc pl-5 text-sm space-y-1 text-gray-900">
                      {proj.bullets.filter(b => b.trim()).map((b, j) => (
                        <li key={j} className="leading-relaxed pl-1">{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {formData.education.length > 0 && (
            <div className="mb-6">
              <h3 className={`text-sm font-bold uppercase tracking-widest border-b-[1.5px] pb-1 mb-3 ${selectedTemplate === 'startup-clean' ? 'border-blue-700 text-blue-700' : 'border-black text-black'}`}>Education</h3>
              <div className="space-y-3">
                {formData.education.map((edu, i) => (
                  <div key={i} className="flex justify-between items-baseline">
                    <h4 className="font-bold text-[15px] text-black">{edu.school}</h4>
                    <div className="text-right flex items-baseline gap-4">
                      <p className="text-sm font-medium text-gray-800">{edu.degree}</p>
                      <p className="text-sm font-bold text-black">{edu.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {formData.skills.length > 0 && (
            <div className="mb-2">
              <h3 className={`text-sm font-bold uppercase tracking-widest border-b-[1.5px] pb-1 mb-3 ${selectedTemplate === 'startup-clean' ? 'border-blue-700 text-blue-700' : 'border-black text-black'}`}>Skills</h3>
              <ul className="list-disc pl-5 text-sm space-y-1 text-gray-900">
                {formData.skills.map((skill, i) => (
                  <li key={i} className="leading-relaxed pl-1 font-medium">{skill}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
